"use client";

import { useChat } from "@ai-sdk/react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { TextStreamChatTransport, type UIMessage } from "ai";

import { EstrategiaSemanalCardList } from "@/components/estrategia/EstrategiaSemanalCards";
import { supabase } from "@/lib/supabase";
import {
  formatWeekRangeLabel,
  getBuenosAiresWeekRange,
} from "@/lib/weekRange";
import { stripN8nAutomationForDisplay } from "@/lib/extractN8nAutomationPayload";
import { stripStrategyPromptForDisplay } from "@/lib/pollinations";
import {
  sectionsToDayItems,
  splitStrategyMarkdown,
} from "@/lib/strategyMarkdown";

function getTextFromParts(message: UIMessage): string {
  return message.parts
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function isAssistantMessageStreaming(
  message: UIMessage,
  options: { isLastAssistant: boolean; busy: boolean },
): boolean {
  const partStreaming = message.parts.some(
    (p) => p.type === "text" && p.state === "streaming",
  );
  if (partStreaming) return true;
  return (
    message.role === "assistant" && options.isLastAssistant && options.busy
  );
}

async function fetchSavedStrategyMarkdown(
  userId: string,
): Promise<string | null> {
  const { data: biz } = await supabase
    .from("business_context")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle();

  if (!biz?.id) return null;

  const { weekStartDate } = getBuenosAiresWeekRange();

  const { data: strat } = await supabase
    .from("strategies")
    .select("content")
    .eq("business_id", biz.id)
    .eq("week_start_date", weekStartDate)
    .maybeSingle();

  if (!strat?.content || typeof strat.content !== "object") return null;
  const markdown = (strat.content as { markdown?: unknown }).markdown;
  if (typeof markdown !== "string" || !markdown.trim()) return null;
  return markdown;
}

const streamingMarkdownComponents = {
  h3: ({ children }: { children?: ReactNode }) => (
    <h3 className="mt-4 text-lg font-bold text-on-surface first:mt-0">
      {children}
    </h3>
  ),
  p: ({ children }: { children?: ReactNode }) => (
    <p className="mb-2 leading-relaxed text-on-surface-variant">{children}</p>
  ),
  strong: ({ children }: { children?: ReactNode }) => (
    <strong className="font-bold text-on-surface">{children}</strong>
  ),
};

export function EstrategiaSemanalView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const generateRequested = searchParams.get("generate") === "true";

  const transport = useMemo(
    () =>
      new TextStreamChatTransport({
        api: "/api/chat",
        body: async () => {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user?.id) {
            throw new Error("Necesitás iniciar sesión.");
          }
          return { userId: user.id };
        },
      }),
    [],
  );

  const { messages, sendMessage, status, error, setMessages, clearError } =
    useChat({ transport });

  const [hydrateDone, setHydrateDone] = useState(false);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const autoGenerateRef = useRef(false);
  const scrollEndRef = useRef<HTMLDivElement>(null);

  const { weekStartDate, weekEndDate } = getBuenosAiresWeekRange();
  const weekLabel = formatWeekRangeLabel(weekStartDate, weekEndDate);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (generateRequested) {
        if (!cancelled) setHydrateDone(true);
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      if (!user?.id) {
        setSessionError("Iniciá sesión para ver tu plan.");
        setHydrateDone(true);
        return;
      }

      const saved = await fetchSavedStrategyMarkdown(user.id);
      if (cancelled) return;
      if (saved) {
        setMessages([
          {
            id: "estrategia-guardada",
            role: "assistant",
            parts: [{ type: "text", text: saved, state: "done" }],
          },
        ]);
      }
      setHydrateDone(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [generateRequested, setMessages]);

  useEffect(() => {
    if (!generateRequested || !hydrateDone || autoGenerateRef.current) return;
    if (status !== "ready") return;

    (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user?.id) {
        setSessionError("Iniciá sesión para generar tu plan.");
        return;
      }
      autoGenerateRef.current = true;
      void sendMessage({ text: "Generá mi plan" });
      router.replace("/estrategia-semanal", { scroll: false });
    })();
  }, [
    generateRequested,
    hydrateDone,
    status,
    sendMessage,
    router,
  ]);

  const busy = status === "submitted" || status === "streaming";

  const assistantMarkdown = useMemo(() => {
    const last = [...messages]
      .reverse()
      .find((m) => m.role === "assistant");
    return last ? getTextFromParts(last) : "";
  }, [messages]);

  const assistantMarkdownForDisplay = useMemo(
    () =>
      stripN8nAutomationForDisplay(
        stripStrategyPromptForDisplay(assistantMarkdown),
      ),
    [assistantMarkdown],
  );

  const cardItems = useMemo(() => {
    const sections = splitStrategyMarkdown(assistantMarkdown);
    return sectionsToDayItems(sections, weekStartDate);
  }, [assistantMarkdown, weekStartDate]);

  const handleRegenerate = useCallback(async () => {
    setSessionError(null);
    clearError();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) {
      setSessionError("Iniciá sesión para regenerar.");
      return;
    }
    setMessages([]);
    void sendMessage({ text: "Generá mi plan" });
  }, [sendMessage, setMessages, clearError]);

  useEffect(() => {
    if (!hydrateDone) return;
    scrollEndRef.current?.scrollIntoView({
      block: "end",
      behavior: busy ? "auto" : "smooth",
    });
  }, [assistantMarkdown, busy, hydrateDone]);

  let lastAssistant: UIMessage | undefined;
  for (let i = messages.length - 1; i >= 0; i--) {
    if (messages[i].role === "assistant") {
      lastAssistant = messages[i];
      break;
    }
  }
  const showTypingCaret =
    lastAssistant &&
    isAssistantMessageStreaming(lastAssistant, {
      isLastAssistant: true,
      busy,
    });

  return (
    <div className="space-y-8">
      <div className="mb-10 flex flex-row items-center justify-between gap-3 sm:gap-6">
        <div className="min-w-0 flex-1">
          <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-primary">
            Calendario Editorial
          </span>
          <h1 className="truncate text-xl font-extrabold tracking-tight text-on-surface sm:text-3xl md:text-4xl">
            Estrategia de la semana: {weekLabel}
          </h1>
        </div>
        <div className="shrink-0">
          <button
            type="button"
            onClick={() => void handleRegenerate()}
            disabled={busy}
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-xl border border-outline-variant/50 bg-surface-container-low px-3 py-2 text-sm font-semibold text-on-surface transition-all hover:bg-surface-container-high disabled:opacity-50 sm:gap-2 sm:px-5 sm:py-2.5"
          >
            <span className="material-symbols-outlined text-base">refresh</span>
            Regenerar estrategia
          </button>
        </div>
      </div>

      {(sessionError || error) && (
        <p className="rounded-lg bg-error-container/30 px-4 py-2 text-sm text-on-background">
          {sessionError ?? error?.message}
        </p>
      )}

      {!hydrateDone && (
        <p className="text-sm text-on-surface-variant">Cargando tu plan…</p>
      )}

      {hydrateDone && busy && cardItems.length === 0 && (
        <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low/50 p-6">
          <p className="mb-3 text-sm font-medium text-primary">
            Generando tu estrategia…
          </p>
          <div className="prose-markdown max-h-[min(50vh,360px)] overflow-y-auto text-sm">
            {assistantMarkdown ? (
              <>
                <ReactMarkdown components={streamingMarkdownComponents}>
                  {assistantMarkdownForDisplay}
                </ReactMarkdown>
                {showTypingCaret ? (
                  <span
                    className="typing-caret ml-0.5 inline-block h-[1.1em] w-0.5 translate-y-[0.15em] rounded-sm bg-primary align-middle"
                    aria-hidden
                  />
                ) : null}
              </>
            ) : (
              <p className="text-on-surface-variant">
                Preparando respuesta del modelo…
              </p>
            )}
          </div>
        </div>
      )}

      {hydrateDone && !(busy && cardItems.length === 0) && (
        <EstrategiaSemanalCardList
          items={cardItems}
          emptyState={
            !busy && cardItems.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-outline-variant/60 bg-surface-container-low/40 px-6 py-10 text-center text-sm text-on-surface-variant">
                Todavía no hay plan para esta semana. Tocá{" "}
                <span className="font-semibold text-on-surface">
                  Regenerar estrategia
                </span>{" "}
                o completá{" "}
                <a
                  className="font-semibold text-primary underline"
                  href="/mi-negocio"
                >
                  Mi negocio
                </a>{" "}
                y guardá para generar uno automáticamente.
              </p>
            ) : undefined
          }
        />
      )}

      {busy && cardItems.length > 0 && (
        <p className="text-xs font-medium text-primary" aria-live="polite">
          Actualizando tarjetas…
        </p>
      )}

      <div ref={scrollEndRef} className="h-px w-full" aria-hidden />

      <div className="mt-16 text-center">
        <p className="mb-6 font-medium text-on-surface-variant">
          ¿Falta algo en tu semana? Creá un día adicional personalizado.
        </p>
        <button
          type="button"
          className="inline-flex items-center gap-3 rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-low px-8 py-4 font-bold text-on-surface transition-all hover:border-primary hover:bg-surface-container-highest"
        >
          <span className="material-symbols-outlined">add_circle</span>
          Añadir día de contenido
        </button>
      </div>

      <button
        type="button"
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-on-surface text-white shadow-2xl transition-all hover:scale-110 active:scale-95"
        aria-label="Asistente"
      >
        <span className="material-symbols-outlined">auto_awesome</span>
      </button>
    </div>
  );
}
