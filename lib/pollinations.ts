const GEN_IMAGE_BASE = "https://gen.pollinations.ai/image";

/** Límite conservador: URLs muy largas fallan en navegadores/CDN. */
const MAX_ENRICHED_PROMPT_CHARS = 1400;

export type FluxGenerationInput = {
  enrichedPrompt: string;
  seed: number;
};

/** URL estable para guardar en Supabase y mostrar en la galería (incluye key en query). */
export type GeneratedImage = {
  displayUrl: string;
  /** Misma URL que usa Pollinations para servir la imagen (persistible). */
  storageUrl: string;
  seed: number;
  enrichedPrompt: string;
};

function stripMarkdownLite(s: string): string {
  return s
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Deja un prompt usable en Flux: quita markdown, prioriza [prompt: ...] si viene del plan.
 */
export function normalizePromptForFlux(raw: string): string {
  let s = raw.trim();
  const bracket = s.match(/\[prompt:\s*([\s\S]+?)\]/i);
  if (bracket?.[1]) {
    s = stripMarkdownLite(bracket[1]);
  } else {
    s = stripMarkdownLite(s);
  }
  if (!s) {
    s =
      "professional product photography, high quality lighting, commercial style";
  }
  return s;
}

function truncateEnriched(enriched: string): string {
  if (enriched.length <= MAX_ENRICHED_PROMPT_CHARS) return enriched;
  return `${enriched.slice(0, MAX_ENRICHED_PROMPT_CHARS - 1).trimEnd()}…`;
}

/**
 * Calcula prompt enriquecido y seed (sin llamar a la red). El cliente envía esto a `/api/flux-image`.
 */
export function computeFluxGeneration(
  prompt: string,
  brandContext?: string,
): FluxGenerationInput {
  const seed = Math.floor(Math.random() * 2_147_483_647);
  const normalized = normalizePromptForFlux(prompt);
  const enrichedPrompt = truncateEnriched(
    brandContext?.trim()
      ? `${normalized}, ${brandContext.trim()}`
      : normalized,
  );
  return { enrichedPrompt, seed };
}

/**
 * URL completa hacia gen.pollinations.ai (uso en servidor o con clave publicable).
 */
export function buildGenPollinationsImageUrl(
  enrichedPrompt: string,
  seed: number,
  apiKey: string,
): string {
  const encoded = encodeURIComponent(enrichedPrompt);
  const params = new URLSearchParams({
    model: "flux",
    width: "1024",
    height: "1024",
    nologo: "true",
    seed: String(seed),
    key: apiKey.trim(),
  });
  return `${GEN_IMAGE_BASE}/${encoded}?${params.toString()}`;
}

/**
 * Arma el `brandContext` string a partir de los datos del negocio.
 */
export function buildBrandContext(business: {
  name?: string | null;
  rubro?: string | null;
  product_image_urls?: string[] | null;
}): string {
  const parts: string[] = [];
  if (business.name?.trim()) parts.push(`brand: ${business.name.trim()}`);
  if (business.rubro?.trim()) parts.push(`industry: ${business.rubro.trim()}`);
  if (
    Array.isArray(business.product_image_urls) &&
    business.product_image_urls.length > 0
  ) {
    parts.push("product photography style, commercial quality");
  }
  return parts.length > 0
    ? parts.join(", ")
    : "professional commercial photography";
}

/**
 * Extrae el prompt de imagen de un bloque de texto de estrategia.
 * Busca `[prompt: ...]` primero, luego `Acción: ...` como fallback.
 */
export function extractImagePrompt(
  body: string,
  fallbackTitle: string,
): string {
  const bracketMatch = body.match(/\[prompt:\s*([\s\S]+?)\]/i);
  if (bracketMatch?.[1]) return stripMarkdownLite(bracketMatch[1]);

  const actionMatch = body.match(/Acci[oó]n:\s*([^\n]+)/i);
  if (actionMatch?.[1]) return stripMarkdownLite(actionMatch[1]);

  return stripMarkdownLite(fallbackTitle);
}
