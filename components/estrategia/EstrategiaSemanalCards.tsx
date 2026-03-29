"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";

import {
  extractN8nAutomationPayload,
  stripN8nAutomationForDisplay,
} from "@/lib/extractN8nAutomationPayload";
import { extractImagePrompt, stripStrategyPromptForDisplay } from "@/lib/pollinations";

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
  const [n8nPending, setN8nPending] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const hasIaImage = /ia\s*image/i.test(item.body);

  /** Tarea de email / recuperación con n8n (etiqueta del agente o herramienta n8n + email). */
  const hasEmailN8nTask =
    /\[email_n8n\]/i.test(item.body) ||
    (/\bherramienta:\s*[^\n]*n8n/i.test(item.body) &&
      /email|mailing|carrito|abandonad|recuperación|VOLVE10/i.test(item.body));

  const suggestedPrompt = useMemo(() => {
    if (!hasIaImage) return "";
    return extractImagePrompt(item.body, item.title);
  }, [hasIaImage, item.body, item.title]);

  /** Card sin prompt de imagen ni metadata n8n; `item.body` sigue completo para IA / webhook. */
  const displayBody = useMemo(
    () =>
      stripN8nAutomationForDisplay(stripStrategyPromptForDisplay(item.body)),
    [item.body],
  );

  const handleN8nSimulate = useCallback(async () => {
    const { emailCliente, nombreProducto, codigoCupon, urlCarrito } =
      extractN8nAutomationPayload(item.body);

    setN8nPending(true);
    setToast(null);
    try {
      const res = await fetch("/api/automation/n8n", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailCliente,
          nombreProducto,
          codigoCupon,
          urlCarrito,
          source: "estrategia-semanal",
          title: item.title,
          body: item.body,
        }),
      });
      const data = (await res.json()) as {
        message?: string;
        ok?: boolean;
        error?: string;
      };

      if (res.ok && data.ok) {
        setToast("¡Automatización enviada a n8n!");
        window.setTimeout(() => setToast(null), 4500);
        return;
      }

      window.alert(
        typeof data.error === "string"
          ? data.error
          : typeof data.message === "string"
            ? data.message
            : "No se pudo completar la acción.",
      );
    } catch {
      window.alert("No se pudo contactar al servidor. Probá de nuevo.");
    } finally {
      setN8nPending(false);
    }
  }, [item.body, item.title]);

  const dayNumberClass = item.emphasized
    ? "text-3xl font-black leading-none text-primary"
    : "text-3xl font-black leading-none text-on-surface-variant opacity-50";

  const showCalendarColumn = item.showCalendarColumn !== false;

  return (
    <div className="group relative overflow-hidden rounded-[1.5rem] bg-surface-container-lowest p-8 transition-all hover:translate-y-[-4px]">
      {showTopAccent ? (
        <div className="absolute left-0 top-0 h-1 w-full bg-surface-container-low">
          <div className="h-full w-full bg-primary opacity-0 transition-opacity group-hover:opacity-10" />
        </div>
      ) : null}

      <div className="flex flex-col items-start gap-8 md:flex-row">
        {showCalendarColumn ? (
          <div className="min-w-[80px] flex-shrink-0 text-center">
            <span className={`block ${dayNumberClass}`}>{item.calendarDay}</span>
            <span className="mt-1 block text-xs font-bold uppercase text-on-surface-variant">
              {item.weekday}
            </span>
          </div>
        ) : null}

        <div className={showCalendarColumn ? "flex-1 space-y-4" : "w-full space-y-4"}>
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="min-w-0 flex-1 text-xl font-bold text-on-surface">
              {item.title}
            </h3>
            {item.trendLabel ? (
              <span className="flex max-w-[min(100%,14rem)] shrink-0 scale-100 cursor-default items-center gap-1 rounded-full bg-tertiary-container px-3 py-1 text-xs font-bold text-on-tertiary-container transition-transform hover:scale-105">
                <span
                  className="material-symbols-outlined shrink-0 text-sm"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  local_fire_department
                </span>
                <span className="truncate">Tendencia: {item.trendLabel}</span>
              </span>
            ) : null}
          </div>

          <div className="text-sm leading-relaxed">
            {displayBody.trim() ? (
              <ReactMarkdown components={bodyMarkdownComponents}>
                {displayBody}
              </ReactMarkdown>
            ) : (
              <p className="text-on-surface-variant">—</p>
            )}
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            {hasIaImage && (
              <Link
                href={`/contenido-ia?prompt=${encodeURIComponent(suggestedPrompt)}`}
                className="flex items-center gap-2 rounded-lg bg-primary/10 px-4 py-2 text-sm font-bold text-primary transition-colors hover:bg-primary/20"
              >
                <span className="material-symbols-outlined text-lg">brush</span>
                Generar ahora con IA
              </Link>
            )}
            {hasEmailN8nTask && (
              <button
                type="button"
                disabled={n8nPending}
                onClick={() => void handleN8nSimulate()}
                className="flex items-center gap-2 rounded-lg bg-secondary/15 px-4 py-2 text-sm font-bold text-secondary transition-colors hover:bg-secondary/25 disabled:opacity-60"
              >
                <span className="material-symbols-outlined text-lg">
                  hub
                </span>
                {n8nPending ? "Enviando…" : "Automatizar con n8n"}
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-3 pt-2 md:pt-0">
          <label className="flex cursor-pointer flex-col items-center gap-3">
            <input className="peer sr-only" type="checkbox" />
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border-2 border-outline-variant/40 bg-surface-container-low transition-all peer-checked:border-emerald-800 peer-checked:bg-emerald-600 peer-checked:shadow-inner">
              <span
                className="material-symbols-outlined text-transparent transition-colors peer-checked:text-white"
                style={{ fontVariationSettings: "'FILL' 1, 'wght' 700" }}
              >
                check
              </span>
            </div>
            <span className="text-[10px] font-black uppercase tracking-tighter text-on-surface-variant peer-checked:text-emerald-800">
              Completado
            </span>
          </label>
        </div>
      </div>

      {toast ? (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 right-6 z-[100] max-w-md rounded-2xl bg-on-surface px-5 py-4 text-sm font-medium text-white shadow-2xl"
        >
          {toast}
        </div>
      ) : null}
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

  const accentIndex = items.findIndex((i) => i.showCalendarColumn !== false);

  return (
    <div className="flex flex-col gap-6">
      {items.map((item, index) => (
        <EstrategiaDayCard
          key={item.id}
          item={item}
          showTopAccent={accentIndex >= 0 ? index === accentIndex : index === 0}
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
