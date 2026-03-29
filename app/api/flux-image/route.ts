import { createServerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

import { buildGenPollinationsImageUrl } from "@/lib/pollinations";

export const runtime = "nodejs";

type Body = {
  enrichedPrompt?: string;
  seed?: number;
};

function getPollinationsKey(): string | undefined {
  const k =
    process.env.POLLINATIONS_API_KEY?.trim() ||
    process.env.NEXT_PUBLIC_POLLINATIONS_API_KEY?.trim();
  return k || undefined;
}

/**
 * POST /api/flux-image
 * Genera la imagen en Pollinations (gen.pollinations.ai) con clave de servidor.
 * Evita el 401 del navegador al seguir redirects desde image.pollinations.ai sin key.
 */
export async function POST(request: Request) {
  const key = getPollinationsKey();
  if (!key) {
    return Response.json(
      {
        error:
          "Falta POLLINATIONS_API_KEY (o NEXT_PUBLIC_POLLINATIONS_API_KEY) en el servidor. Obtené una clave en https://enter.pollinations.ai/",
      },
      { status: 503 },
    );
  }

  let body: Body;
  try {
    body = (await request.json()) as Body;
  } catch {
    return Response.json({ error: "JSON inválido." }, { status: 400 });
  }

  const enrichedPrompt =
    typeof body.enrichedPrompt === "string" ? body.enrichedPrompt.trim() : "";
  const seed =
    typeof body.seed === "number" && Number.isFinite(body.seed)
      ? Math.floor(body.seed)
      : NaN;

  if (!enrichedPrompt || enrichedPrompt.length > 2000) {
    return Response.json({ error: "Prompt inválido o demasiado largo." }, {
      status: 400,
    });
  }
  if (!Number.isFinite(seed) || seed < 0) {
    return Response.json({ error: "Seed inválido." }, { status: 400 });
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
    return Response.json({ error: "No autenticado." }, { status: 401 });
  }

  const imageUrl = buildGenPollinationsImageUrl(enrichedPrompt, seed, key);

  let upstream: Response;
  try {
    upstream = await fetch(imageUrl, { cache: "no-store" });
  } catch {
    return Response.json(
      { error: "No se pudo contactar a Pollinations." },
      { status: 502 },
    );
  }

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    return Response.json(
      {
        error: `Pollinations respondió ${upstream.status}. ${text.slice(0, 200)}`,
      },
      { status: 502 },
    );
  }

  const contentType =
    upstream.headers.get("Content-Type") ?? "image/jpeg";
  const buf = await upstream.arrayBuffer();

  return new Response(buf, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=300",
      "X-Pollinations-Url": imageUrl,
    },
  });
}
