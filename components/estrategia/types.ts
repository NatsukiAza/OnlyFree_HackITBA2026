/**
 * Un día o bloque del plan (card en la vista semanal).
 */
export type EstrategiaDayItem = {
  id: string;
  calendarDay: string;
  weekday: string;
  title: string;
  trendLabel?: string;
  /** Markdown del cuerpo (sin el título principal de la card). */
  body: string;
  emphasized?: boolean;
};
