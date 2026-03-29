import type { ShopImportResult } from "@/src/services/shopIntegration";

export type StrategyGenerationInput = {
  /** Catálogo + métricas (mock o API real). */
  shopData: ShopImportResult;
  /** Prompt opcional del usuario (tono, foco). */
  userPrompt?: string;
};

export type StrategyGenerationOutput = {
  /** Texto listo para mostrar / enviar al modelo de IA. */
  summary: string;
  /** Líneas clave derivadas de métricas + productos. */
  highlights: string[];
};

function productById(shopData: ShopImportResult, id: string) {
  return shopData.products.find((p) => p.id === id);
}

/**
 * Arma el contexto para “Generar Estrategia” usando **todo** el objeto tienda:
 * resuelve nombres desde `best_seller_id` / `most_viewed_id` y usa ticket y ventas.
 * Sustituí o envolvé esta función por una llamada a tu agente de marketing (LLM).
 */
export function generateStrategyFromShopData(
  input: StrategyGenerationInput,
): StrategyGenerationOutput {
  const { shopData, userPrompt } = input;
  const { metrics } = shopData;

  const bestSeller = productById(shopData, metrics.best_seller_id);
  const mostViewed = productById(shopData, metrics.most_viewed_id);

  const bestName = bestSeller?.name ?? "tu producto más vendido";
  const viewedName = mostViewed?.name ?? "un producto muy visto en tu tienda";

  const highlights = [
    `Hoy priorizamos ${bestName} porque es tu más vendido (id ${metrics.best_seller_id}).`,
    `${viewedName} concentra más vistas (id ${metrics.most_viewed_id}): buen candidato para remarketing o FAQ.`,
    `Contexto comercial: ${metrics.total_sales_month} ventas este mes, ticket promedio aprox. $${metrics.average_ticket.toLocaleString("es-AR")}.`,
    `Tendencias (simulado para esta semana): unboxing honesto y comparativas “vs anterior” encajan con tu ticket y categoría.`,
  ];

  const summary = [
    "Propuesta editorial (simulada) basada en tu tienda:",
    "",
    ...highlights,
    "",
    userPrompt
      ? `Indicaciones del usuario: ${userPrompt}`
      : "Podés afinar el tono o el foco con el campo de prompt.",
  ].join("\n");

  return { summary, highlights };
}
