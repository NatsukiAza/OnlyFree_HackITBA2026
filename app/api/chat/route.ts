import { anthropic } from "@ai-sdk/anthropic";
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { cookies } from "next/headers";

import { getBuenosAiresWeekRange } from "@/lib/weekRange";

type ChatBody = {
  userId?: string;
  messages?: unknown;
};

function formatShopProducts(shopData: unknown): string {
  if (shopData == null || typeof shopData !== "object") {
    return "(Sin shop_data importado; proponé contenido acorde al rubro.)";
  }
  const raw = shopData as {
    products?: Array<{
      name?: string;
      price?: number;
      description?: string | null;
    }>;
  };
  const products = raw.products;
  if (!Array.isArray(products) || products.length === 0) {
    return "(shop_data sin productos; inferí desde el rubro y la descripción.)";
  }
  return products
    .map((p, i) => {
      const name = p.name ?? `Producto ${i + 1}`;
      const price = p.price != null ? ` — $${p.price}` : "";
      const desc = (p.description ?? "").slice(0, 180);
      return `• ${name}${price}${desc ? ` — ${desc}` : ""}`;
    })
    .join("\n");
}

function formatShopMetrics(shopData: unknown): string {
  if (shopData == null || typeof shopData !== "object") {
    return "(Sin métricas importadas.)";
  }
  const m = (shopData as { metrics?: Record<string, unknown> }).metrics;
  if (!m || typeof m !== "object") {
    return "(Sin bloque metrics en shop_data.)";
  }
  const lines: string[] = [];
  if ("best_seller_id" in m) lines.push(`Más vendido (id): ${String(m.best_seller_id)}`);
  if ("most_viewed_id" in m) lines.push(`Más visto (id): ${String(m.most_viewed_id)}`);
  if ("total_sales_month" in m)
    lines.push(`Ventas del mes: ${String(m.total_sales_month)}`);
  if ("average_ticket" in m)
    lines.push(`Ticket promedio: ${String(m.average_ticket)}`);
  return lines.length > 0 ? lines.join("\n") : JSON.stringify(m, null, 2);
}

function formatAbandonedCheckouts(shopData: unknown): string {
  if (shopData == null || typeof shopData !== "object") {
    return "(Sin shop_data; no hay carritos abandonados.)";
  }
  const raw = shopData as {
    abandoned_checkouts?: Array<{
      email?: string;
      product_name?: string;
      amount?: number;
    }>;
  };
  const list = raw.abandoned_checkouts;
  if (!Array.isArray(list) || list.length === 0) {
    return "(No hay carritos abandonados listados en shop_data.)";
  }
  return list
    .map((row, i) => {
      const email = row.email ?? "(sin email)";
      const product = row.product_name ?? "(producto)";
      const amt =
        row.amount != null && Number.isFinite(row.amount)
          ? ` — monto aprox. $${row.amount}`
          : "";
      return `${i + 1}. ${email} · ${product}${amt}`;
    })
    .join("\n");
}

/**
 * Lista URLs de shop_data.products[].images (+ image_url) para que el modelo
 * infiera aspecto del producto (sin pasar URLs al prompt de Flux).
 */
function formatShopProductVisualRefs(shopData: unknown): string {
  if (shopData == null || typeof shopData !== "object") {
    return "(Sin shop_data; no hay referencias visuales de productos.)";
  }
  const raw = shopData as {
    products?: Array<{
      name?: string;
      images?: string[];
      image_url?: string;
    }>;
  };
  const products = raw.products;
  if (!Array.isArray(products) || products.length === 0) {
    return "(Sin productos en shop_data; no hay imágenes de referencia.)";
  }

  const blocks: string[] = [];
  for (let i = 0; i < products.length; i++) {
    const p = products[i];
    const name = p.name ?? `Producto ${i + 1}`;
    const fromImages = Array.isArray(p.images) ? p.images : [];
    const primary = p.image_url?.trim();
    const urls = [
      ...fromImages,
      ...(primary && !fromImages.includes(primary) ? [primary] : []),
    ];
    const unique = [...new Set(urls.filter(Boolean))];
    if (unique.length === 0) continue;

    const lines = unique.map((u, j) => `   • Ref. ${j + 1}: ${u}`);
    blocks.push(`[${i}] ${name}\n${lines.join("\n")}`);
  }

  return blocks.length > 0
    ? blocks.join("\n\n")
    : "(Ningún producto tiene URLs en images[] ni image_url.)";
}

function buildSystemPrompt(ctx: {
  businessName: string;
  rubro: string;
  description: string;
  availabilityHours: number;
  shopProducts: string;
  shopMetrics: string;
  shopAbandonedCheckouts: string;
  shopProductVisualRefs: string;
}): string {
  return `Actúa como un Director de Marketing Digital que le esta dando ideas a un novato con un negocio pequeño-mediano que no sabe terminos complicados ni terminologias.

Tu tarea es generar un Plan Semanal de Acción basado estrictamente en las availability_hours del usuario.

HERRAMIENTAS DISPONIBLES (Debes mencionarlas en las tareas):

Publicaciones de instagram, historias, reels para promocionar el negocio o generar interaccion.

Generador de Imágenes IA: Úsalo para tareas de diseño de producto o fotos lifestyle.

Automatización n8n: Úsalo para recupero de carritos, emails automáticos o sincronización de stock.

Métricas de Tienda: Prioriza los 'Best Sellers' extraídos del shop_data.

RECUPERACIÓN DE CARRITOS (OBLIGATORIO si hay datos):
- En CONTEXTO DEL NEGOCIO vas a ver "Carritos abandonados (shop_data)". Si esa sección lista uno o más carritos (emails y productos), DEBES incluir al menos UNA tarea de email marketing orientada a recuperación con Herramienta: n8n (no solo "Manual").
- En esa tarea, redactá el contenido del email en español claro:
  - Línea "Asunto del email:" (una sola línea, persuasiva).
  - Línea "Cuerpo del email:" seguido de un párrafo o texto breve que invite a completar la compra y mencione el cupón de descuento ficticio VOLVE10 (sin decir que es ficticio).
- Justo antes de la línea [email_n8n], incluí EXACTAMENTE estas cuatro líneas (para automatización n8n), rellenando con datos coherentes del carrito que priorices:
  emailCliente: <email>
  nombreProducto: <nombre del producto olvidado>
  codigoCupon: VOLVE10
  urlCarrito: <URL ficticia pero creíble del checkout o recuperación de carrito>
- Al final del bloque de esa tarea (después de Por qué y de las cuatro líneas anteriores), agregá una línea sola con la etiqueta [email_n8n] para que la app muestre el botón de automatización.

REGLAS DE DISTRIBUCIÓN DE TIEMPO:

Si el usuario tiene < 5hs: Máximo 2 tareas de alto impacto.

Si tiene 5-15hs: 3 a 4 tareas mezclando contenido y automatización.

Si tiene > 15hs: Plan diario completo (lunes a viernes).

GENERACIÓN DE IMÁGENES IA (cuando la Herramienta sea "IA Image" o equivalente):
- Usá el contexto visual de los productos del negocio cuando sugieras "Generar imagen con IA" o tareas de foto de producto / lifestyle.
- Referencias: en CONTEXTO DEL NEGOCIO tenés "Referencias visuales (imágenes por producto)" con URLs de shop_data.products[x].images (y image_url si aplica). Analizá mentalmente qué muestran: color, forma, materiales, texturas y detalles del producto real.
- Prompt técnico: en la línea de Acción incluí una descripción visual detallada EN INGLÉS entre corchetes [prompt: ...] (minúsculas "prompt", una sola etiqueta) para el generador Flux. Describí una escena fotorrealista tipo lifestyle donde el producto sea el protagonista, coherente con las referencias.
- PROHIBIDO poner URLs dentro de [prompt: ...]; solo texto descriptivo. No copies ni pegues enlaces en el prompt de imagen.
- Sé específico: si las referencias sugieren un mouse negro mate, no pidas un "gaming mouse" genérico; pedí por ejemplo "a matte black ergonomic mouse with subtle RGB lighting, visually matching the reference product". Adaptá el ejemplo al producto y a lo que infieras de las referencias.

FORMATO DE SALIDA:
No saludes. No digas 'Aquí tienes tu plan'. Genera directamente los días en este formato:

[Día]: [Título de la Acción]
Acción: [Descripción clara de qué hacer]
Herramienta: [IA Image / n8n / Manual]
Por qué: [Justificación basada en métricas o horas disponibles]

Para la vista en la app, cada día o bloque principal debe empezar con un encabezado Markdown en la forma:
### [Día o nombre del bloque]: [Título corto]
Luego el detalle en líneas con las etiquetas Acción / Herramienta / Por qué como texto o listas.

CONTEXTO DEL NEGOCIO (úsalo para personalizar acciones y el "Por qué"):
- Nombre: ${ctx.businessName}
- Rubro: ${ctx.rubro}
- Descripción: ${ctx.description}
- Horas semanales disponibles (availability_hours): ${ctx.availabilityHours}
- Catálogo / productos (shop_data): ${ctx.shopProducts}
- Referencias visuales (imágenes por producto; usalas para tareas IA Image, ver reglas arriba): ${ctx.shopProductVisualRefs}
- Métricas de tienda (shop_data; priorizar best sellers alineados con estos datos): ${ctx.shopMetrics}
- Carritos abandonados (shop_data): ${ctx.shopAbandonedCheckouts}`;
}

/**
 * POST /api/chat
 * Body: { "userId": "<uuid>", "messages": UIMessage[] } (+ metadatos del transporte).
 *
 * Respuesta: stream de texto (`toTextStreamResponse`) para `TextStreamChatTransport`.
 */
export async function POST(request: Request) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return new Response(
      JSON.stringify({
        error:
          "Falta ANTHROPIC_API_KEY en el entorno del servidor para generar con Anthropic.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  let body: ChatBody;
  try {
    body = (await request.json()) as ChatBody;
  } catch {
    return new Response(JSON.stringify({ error: "Cuerpo JSON inválido." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = body.userId;
  if (!userId || typeof userId !== "string") {
    return new Response(JSON.stringify({ error: "userId es requerido." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return new Response(
      JSON.stringify({ error: "messages es requerido y no puede estar vacío." }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  let modelMessages;
  try {
    modelMessages = await convertToModelMessages(body.messages as UIMessage[]);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "No se pudieron convertir los mensajes.";
    return new Response(JSON.stringify({ error: msg }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            /* ignore */
          }
        },
      },
    },
  );

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response(JSON.stringify({ error: "No autenticado." }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (user.id !== userId) {
    return new Response(
      JSON.stringify({ error: "userId no coincide con la sesión." }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  const { data: row, error: rowError } = await supabase
    .from("business_context")
    .select("id, name, rubro, description, availability_hours, shop_data")
    .eq("user_id", userId)
    .maybeSingle();

  if (rowError) {
    return new Response(JSON.stringify({ error: rowError.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  if (!row) {
    return new Response(
      JSON.stringify({ error: "No hay negocio cargado para este usuario." }),
      { status: 404, headers: { "Content-Type": "application/json" } },
    );
  }

  const shopProducts = formatShopProducts(row.shop_data);
  const shopProductVisualRefs = formatShopProductVisualRefs(row.shop_data);
  const shopMetrics = formatShopMetrics(row.shop_data);
  const shopAbandonedCheckouts = formatAbandonedCheckouts(row.shop_data);

  const system = buildSystemPrompt({
    businessName: row.name?.trim() || "(sin nombre)",
    rubro: row.rubro,
    description: row.description?.trim() || "(no provista)",
    availabilityHours: row.availability_hours,
    shopProducts,
    shopProductVisualRefs,
    shopMetrics,
    shopAbandonedCheckouts,
  });

  const businessId = row.id;

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system,
    messages: modelMessages,
    onFinish: async ({ text }) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const { weekStartDate, weekEndDate } = getBuenosAiresWeekRange();
      const title = `Plan semanal ${weekStartDate} — ${weekEndDate}`;
      const content = {
        markdown: trimmed,
        model: "claude-sonnet-4-6",
        generated_at: new Date().toISOString(),
      };

      const { data: existing } = await supabase
        .from("strategies")
        .select("id")
        .eq("business_id", businessId)
        .eq("week_start_date", weekStartDate)
        .maybeSingle();

      if (existing?.id) {
        await supabase
          .from("strategies")
          .update({
            week_end_date: weekEndDate,
            title,
            content,
          })
          .eq("id", existing.id);
      } else {
        await supabase.from("strategies").insert({
          business_id: businessId,
          week_start_date: weekStartDate,
          week_end_date: weekEndDate,
          title,
          content,
        });
      }
    },
  });

  return result.toTextStreamResponse();
}
