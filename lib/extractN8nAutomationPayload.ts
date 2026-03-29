/**
 * Extrae datos para el webhook de n8n desde el texto de la tarea de estrategia.
 * Prioriza líneas explícitas emailCliente: / nombreProducto: / etc. (pedidas al modelo).
 */
export type N8nAutomationPayload = {
  emailCliente: string;
  nombreProducto: string;
  codigoCupon: string;
  urlCarrito: string;
};

function lineValue(text: string, label: string): string {
  const re = new RegExp(`^${label}\\s*:\\s*(.+)$`, "im");
  const m = text.match(re);
  return m?.[1]?.trim() ?? "";
}

export function extractN8nAutomationPayload(text: string): N8nAutomationPayload {
  let emailCliente = lineValue(text, "emailCliente");
  let nombreProducto = lineValue(text, "nombreProducto");
  let codigoCupon = lineValue(text, "codigoCupon");
  let urlCarrito = lineValue(text, "urlCarrito");

  if (!emailCliente) {
    const em = text.match(/[\w.+-]+@[\w.-]+\.\w+/);
    emailCliente = em?.[0] ?? "";
  }

  if (!codigoCupon) {
    const c = text.match(/\b(VOLVE\d+)\b/i);
    codigoCupon = (c?.[1] ?? "VOLVE10").toUpperCase();
  }

  if (!nombreProducto) {
    const p = text.match(
      /producto\s+(?:olvidado|abandonad[oa])?\s*[:\-]?\s*([^\n.]+)/i,
    );
    nombreProducto = p?.[1]?.trim() ?? "Producto del carrito";
  }

  if (!urlCarrito) {
    const u = text.match(/https?:\/\/[^\s)\]'"<>]+/);
    urlCarrito = u?.[0] ?? "https://tienda.ejemplo.com/checkout/recuperar";
  }

  return {
    emailCliente,
    nombreProducto,
    codigoCupon,
    urlCarrito,
  };
}

/**
 * Quita etiquetas y líneas técnicas de n8n para mostrar la card al usuario.
 * El `body` completo debe seguir usándose en `extractN8nAutomationPayload` y en la API.
 */
export function stripN8nAutomationForDisplay(text: string): string {
  let s = text.replace(/\s*\[email_n8n\]\s*/gi, "");

  s = s.replace(/\burlCarrito:\s*https?:\/\/[^\s)\]]+/gi, "");
  s = s.replace(/\bcodigoCupon:\s*\S+/gi, "");
  s = s.replace(
    /\bnombreProducto:\s*[\s\S]+?(?=\s+codigoCupon:|\s+urlCarrito:)/gi,
    "",
  );
  s = s.replace(/\bnombreProducto:\s*[^\n]+/gim, "");
  s = s.replace(/\bemailCliente:\s*[\w.+-]+@[\w.-]+\.\w+/gi, "");

  return s
    .replace(/[ \t]+$/gm, "")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
