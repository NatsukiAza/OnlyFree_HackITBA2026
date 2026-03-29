import type { EstrategiaDayItem } from "@/components/estrategia/types";

export type StrategySection = {
  id: string;
  title: string;
  /** Markdown del bloque (sin el encabezado ### inicial). */
  bodyMarkdown: string;
  /**
   * false = texto antes del primer ### (intro / resumen). No consume un día del calendario.
   */
  assignCalendarDay: boolean;
};

/**
 * Parte el Markdown del asistente por líneas que empiezan con ### (cada bloque = una card).
 */
export function splitStrategyMarkdown(markdown: string): StrategySection[] {
  const trimmed = markdown.trim();
  if (!trimmed) return [];

  const parts = trimmed.split(/\n(?=###\s)/);

  let sectionIndex = 0;
  return parts.flatMap((chunk): StrategySection[] => {
    const trimmedChunk = chunk.trim();
    if (!trimmedChunk) return [];

    const i = sectionIndex++;
    const lines = trimmedChunk.split("\n");
    const first = lines[0] ?? "";
    if (first.startsWith("###")) {
      const title = first.replace(/^#+\s*/, "").trim();
      const bodyMarkdown = lines.slice(1).join("\n").trim();
      return [
        {
          id: `section-${i}-${hashId(title)}`,
          title: title || `Bloque ${i + 1}`,
          bodyMarkdown,
          assignCalendarDay: true,
        },
      ];
    }
    return [
      {
        id: `section-${i}`,
        title: "Plan semanal",
        bodyMarkdown: trimmedChunk,
        assignCalendarDay: false,
      },
    ];
  });
}

function hashId(s: string): string {
  return String(s.slice(0, 32).replace(/\s+/g, "-"));
}

/** Día de calendario y etiqueta de día (es-AR) a partir del lunes de semana + índice 0..n. */
export function calendarForSectionIndex(
  weekStartDate: string,
  index: number,
): { calendarDay: string; weekday: string } {
  const [y, m, d] = weekStartDate.split("-").map(Number);
  const base = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  base.setUTCDate(base.getUTCDate() + index);
  const calendarDay = String(base.getUTCDate()).padStart(2, "0");
  const weekday = base
    .toLocaleDateString("es-AR", {
      weekday: "long",
      timeZone: "America/Argentina/Buenos_Aires",
    })
    .toUpperCase();
  return { calendarDay, weekday };
}

export function sectionsToDayItems(
  sections: StrategySection[],
  weekStartDate: string,
): EstrategiaDayItem[] {
  let dayIndex = 0;
  const firstCalendarIdx = sections.findIndex((s) => s.assignCalendarDay);

  return sections.map((s, index) => {
    const showCalendar = s.assignCalendarDay;
    const { calendarDay, weekday } = showCalendar
      ? calendarForSectionIndex(weekStartDate, dayIndex++)
      : { calendarDay: "", weekday: "" };

    const isFirstDayCard =
      showCalendar &&
      firstCalendarIdx >= 0 &&
      index === firstCalendarIdx;

    return {
      id: s.id,
      calendarDay,
      weekday,
      showCalendarColumn: showCalendar,
      title: s.title,
      body: s.bodyMarkdown,
      emphasized: isFirstDayCard,
    };
  });
}
