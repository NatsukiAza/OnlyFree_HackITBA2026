/**
 * Un día o bloque del plan (card en la vista semanal).
 */
export type EstrategiaDayItem = {
  id: string;
  calendarDay: string;
  weekday: string;
  /** Si es false, la card no muestra día/fecha (bloque intro sin asignar a un día). */
  showCalendarColumn?: boolean;
  title: string;
  trendLabel?: string;
  /** Markdown del cuerpo (sin el título principal de la card). */
  body: string;
  emphasized?: boolean;
};
