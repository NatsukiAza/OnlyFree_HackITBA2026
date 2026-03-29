/**
 * Rango lunes–domingo (inclusive) en calendario de Buenos Aires, formato YYYY-MM-DD.
 */
export function getBuenosAiresWeekRange(now = new Date()): {
  weekStartDate: string;
  weekEndDate: string;
} {
  const dateStr = new Intl.DateTimeFormat("sv-SE", {
    timeZone: "America/Argentina/Buenos_Aires",
  }).format(now);
  const [y, m, d] = dateStr.split("-").map(Number);
  const anchor = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  const dow = anchor.getUTCDay();
  const diffToMonday = dow === 0 ? -6 : 1 - dow;
  const monday = new Date(anchor);
  monday.setUTCDate(anchor.getUTCDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setUTCDate(monday.getUTCDate() + 6);
  return {
    weekStartDate: monday.toISOString().slice(0, 10),
    weekEndDate: sunday.toISOString().slice(0, 10),
  };
}

export function formatWeekRangeLabel(
  weekStartDate: string,
  weekEndDate: string,
): string {
  const opts: Intl.DateTimeFormatOptions = {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Argentina/Buenos_Aires",
  };
  const a = new Date(weekStartDate + "T12:00:00Z");
  const b = new Date(weekEndDate + "T12:00:00Z");
  return `${a.toLocaleDateString("es-AR", opts)} — ${b.toLocaleDateString("es-AR", opts)}`;
}
