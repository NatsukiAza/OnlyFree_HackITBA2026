/**
 * POST /api/automation/n8n
 * Reenvía a n8n: emailCliente, nombreProducto, codigoCupon, urlCarrito.
 * URL: N8N_WEBHOOK_URL o el webhook por defecto del proyecto.
 */
import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const runtime = "nodejs";

/** Webhook por defecto (test); sobreescribible con N8N_WEBHOOK_URL. */
const DEFAULT_N8N_WEBHOOK =
  "https://natsukiaza.app.n8n.cloud/webhook-test/f2d78109-f8bf-48c0-8c09-93176ffc9c00";

type Body = {
  emailCliente?: string;
  nombreProducto?: string;
  codigoCupon?: string;
  urlCarrito?: string;
  title?: string;
  body?: string;
  source?: string;
};

export async function POST(request: Request) {
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
    return Response.json({ error: "No autenticado." }, { status: 401 });
  }

  let payload: Body = {};
  try {
    payload = (await request.json()) as Body;
  } catch {
    /* vacío */
  }

  const emailCliente =
    typeof payload.emailCliente === "string" ? payload.emailCliente.trim() : "";
  const nombreProducto =
    typeof payload.nombreProducto === "string"
      ? payload.nombreProducto.trim()
      : "";
  const codigoCupon =
    typeof payload.codigoCupon === "string" ? payload.codigoCupon.trim() : "";
  const urlCarrito =
    typeof payload.urlCarrito === "string" ? payload.urlCarrito.trim() : "";

  if (!emailCliente || !nombreProducto || !codigoCupon || !urlCarrito) {
    return Response.json(
      {
        ok: false,
        error:
          "Faltan datos para n8n. Asegurate de que la tarea incluya email, producto, cupón y URL de carrito (o regenerá la estrategia).",
      },
      { status: 400 },
    );
  }

  const n8nBody = {
    emailCliente,
    nombreProducto,
    codigoCupon,
    urlCarrito,
  };

  const webhook =
    process.env.N8N_WEBHOOK_URL?.trim() || DEFAULT_N8N_WEBHOOK;

  try {
    const upstream = await fetch(webhook, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(n8nBody),
    });
    const text = await upstream.text();
    if (!upstream.ok) {
      return Response.json(
        {
          ok: false,
          message: `n8n respondió ${upstream.status}: ${text.slice(0, 200)}`,
        },
        { status: 502 },
      );
    }
    return Response.json({
      ok: true,
      message: "¡Automatización enviada a n8n!",
      webhook: true,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Error de red";
    return Response.json(
      { ok: false, message: `No se pudo llamar al webhook: ${msg}` },
      { status: 502 },
    );
  }
}
