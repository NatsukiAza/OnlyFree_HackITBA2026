"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";

import { extractImagePrompt } from "@/lib/pollinations";

import type { EstrategiaDayItem } from "./types";

export type { EstrategiaDayItem } from "./types";

const bodyMarkdownComponents = {
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="mt-5 scroll-mt-4 border-b border-outline-variant/30 pb-2 text-lg font-bold text-on-surface first:mt-0">
      {children}
    </h3>
  ),
  h2: ({ children }: { children?: ReactNode }) => (
    <h2 className="mt-6 text-xl font-bold text-on-surface first:mt-0">
      {children}
    </h2>
  ),
  h4: ({ children }: { children?: ReactNode }) => (
    <h4 className="mt-4 text-base font-semibold text-on-surface">{children}</h4>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="mb-3 leading-relaxed text-on-surface-variant last:mb-0">
      {children}
    </p>
  ),
  ul: ({ children }: { children?: ReactNode }) => (
    <ul className="mb-3 list-disc space-y-1 pl-6 text-on-surface-variant">
      {children}
    </ul>
  ),
  ol: ({ children }: { children?: ReactNode }) => (
    <ol className="mb-3 list-decimal space-y-1 pl-6 text-on-surface-variant">
      {children}
    </ol>
  ),
  li: ({ children }: { children?: ReactNode }) => (
    <li className="leading-relaxed">{children}</li>
  ),
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-bold text-on-surface">{children}</strong>
  ),
};

export type EstrategiaDayCardProps = {
  item: EstrategiaDayItem;
  showTopAccent?: boolean;
};

export function EstrategiaDayCard({ item, showTopAccent }: EstrategiaDayCardProps) {
  const [copied, setCopied] = useState(false);

  const hasIaImage = /ia\s*image/i.test(item.body);

  const suggestedPrompt = useMemo(() => {
    if (!hasIaImage) return "";
    return extractImagePrompt(item.body, item.title);
  }, [hasIaImage, item.body, item.title]);

  const plainTextForCopy = `${item.title}\n\n${item.body}`.trim();

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(plainTextForCopy);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }, [plainTextForCopy]);

  const dayNumberClass = item.emphasized
    ? "text-3xl font-black leading-none text-primary"
    : "text-3xl font-black leading-none text-on-surface-variant opacity-50";

  return (
    <div className="group relative overflow-hidden rounded-[1.5rem] bg-surface-container-lowest p-8 transition-all hover:translate-y-[-4px]">
      {showTopAccent ? (
        <div className="absolute left-0 top-0 h-1 w-full bg-surface-container-low">
          <div className="h-full w-full bg-primary opacity-0 transition-opacity group-hover:opacity-10" />
        </div>
      ) : null}

      <div className="flex flex-col items-start gap-8 md:flex-row">
        <div className="min-w-[80px] flex-shrink-0 text-center">
          <span className={`block ${dayNumberClass}`}>{item.calendarDay}</span>
          <span className="mt-1 block text-xs font-bold uppercase text-on-surface-variant">
            {item.weekday}
          </span>
        </div>

        <div className="flex-1 space-y-4">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-xl font-bold text-on-surface">{item.title}</h3>
            <div className="flex shrink-0 items-center gap-2">
              {item.trendLabel ? (
                <span className="flex max-w-[min(100%,14rem)] scale-100 cursor-default items-center gap-1 rounded-full bg-tertiary-container px-3 py-1 text-xs font-bold text-on-tertiary-container transition-transform hover:scale-105">
                  <span
                    className="material-symbols-outlined shrink-0 text-sm"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    local_fire_department
                  </span>
                  <span className="truncate">Tendencia: {item.trendLabel}</span>
                </span>
              ) : null}
              <button
                type="button"
                className="p-2 text-outline transition-colors hover:text-on-surface"
                aria-label="Más opciones"
              >
                <span className="material-symbols-outlined">more_horiz</span>
              </button>
            </div>
          </div>

          <div className="text-sm leading-relaxed">
            {item.body.trim() ? (
              <ReactMarkdown components={bodyMarkdownComponents}>
                {item.body}
              </ReactMarkdown>
            ) : (
              <p className="text-on-surface-variant">—</p>
            )}
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              type="button"
              onClick={() => void handleCopy()}
              className="group/btn flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-primary/5"
            >
              <span className="material-symbols-outlined text-lg text-primary">
                content_copy
              </span>
              {copied ? "Copiado" : "Copiar al portapapeles"}
            </button>
            {hasIaImage && (
              <Link
                href={`/contenido-ia?prompt=${encodeURIComponent(suggestedPrompt)}`}
                className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/20"
              >
                <span className="material-symbols-outlined text-lg">brush</span>
                Generar ahora con IA
              </Link>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 pt-2 md:pt-0">
          <label className="flex cursor-pointer flex-col items-center gap-3">
            <input className="peer sr-only" type="checkbox" />
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-low transition-all peer-checked:bg-primary/10 peer-checked:ring-2 peer-checked:ring-primary">
              <span
                className="material-symbols-outlined text-transparent transition-colors peer-checked:text-primary"
                style={{ fontVariationSettings: "'wght' 700" }}
              >
                check
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter text-on-surface-variant peer-checked:text-primary">
              Completado
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}

export type EstrategiaSemanalCardListProps = {
  items: EstrategiaDayItem[];
  emptyState?: ReactNode;
};

export function EstrategiaSemanalCardList({
  items,
  emptyState,
}: EstrategiaSemanalCardListProps) {
  if (items.length === 0) {
    return (
      emptyState ?? (
        <p className="rounded-2xl border border-dashed border-outline-variant/60 bg-surface-container-low/40 px-6 py-10 text-center text-sm text-on-surface-variant">
          Aún no hay un plan para esta semana. Usá &quot;Regenerar estrategia&quot;
          o completá tu negocio en Mi negocio y guardá para generar uno nuevo.
        </p>
      )
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {items.map((item, index) => (
        <EstrategiaDayCard
          key={item.id}
          item={item}
          showTopAccent={index === 0}
        />
      ))}
    </div>
  );
}

/** Referencia visual (Stitch); no usar en producción. */
export const DEMO_ESTRATEGIA_DAYS: EstrategiaDayItem[] = [
  {
    id: "demo-1",
    calendarDay: "03",
    weekday: "LUNES",
    title: "Día 1: Posteo producto X",
    trendLabel: "Unboxing Aesthetic",
    body:
      "**Acción:** Publicar foto del producto en escritorio.\n\n**Herramienta:** IA Image\n\n**Por qué:** Refuerza el posicionamiento premium.",
    emphasized: true,
  },
  {
    id: "demo-2",
    calendarDay: "04",
    weekday: "MARTES",
    title: 'Día 2: Reel educativo — "3 tips"',
    trendLabel: "Voiceover AI",
    body:
      "Guión breve para reel con tips prácticos y CTA al catálogo.",
  },
];
