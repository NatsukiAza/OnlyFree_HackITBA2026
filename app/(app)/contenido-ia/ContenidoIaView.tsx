"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

import { supabase } from "@/lib/supabase";
import {
  buildBrandContext,
  computeFluxGeneration,
  type GeneratedImage,
} from "@/lib/pollinations";

type BusinessCtx = {
  id: string;
  name: string | null;
  rubro: string;
  product_image_urls: string[] | null;
  brand_traits: string[] | null;
};

type SavedImage = {
  id: string;
  prompt: string;
  image_url: string;
  seed: number | null;
  created_at: string;
};

export default function ContenidoIaView() {
  const searchParams = useSearchParams();
  const urlPrompt = searchParams.get("prompt") ?? "";

  const [business, setBusiness] = useState<BusinessCtx | null>(null);
  const [prompt, setPrompt] = useState(urlPrompt);
  const [editable, setEditable] = useState(false);
  const [generated, setGenerated] = useState<GeneratedImage | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [gallery, setGallery] = useState<SavedImage[]>([]);

  const autoFired = useRef(false);
  const previewBlobUrlRef = useRef<string | null>(null);

  const revokePreviewBlob = useCallback(() => {
    if (previewBlobUrlRef.current) {
      URL.revokeObjectURL(previewBlobUrlRef.current);
      previewBlobUrlRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => revokePreviewBlob();
  }, [revokePreviewBlob]);

  useEffect(() => {
    async function loadBusiness() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("business_context")
        .select("id, name, rubro, product_image_urls, brand_traits")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) setBusiness(data as BusinessCtx);
    }
    void loadBusiness();
  }, []);

  useEffect(() => {
    async function loadGallery() {
      if (!business) return;
      const { data } = await supabase
        .from("generated_images")
        .select("id, prompt, image_url, seed, created_at")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (data) setGallery(data as SavedImage[]);
    }
    void loadGallery();
  }, [business]);

  const generate = useCallback(
    async (customPrompt?: string) => {
      const p = customPrompt ?? prompt;
      if (!p.trim()) return;

      setLoading(true);
      setError(null);
      setSaved(false);
      revokePreviewBlob();
      setGenerated(null);

      const brandCtx = business ? buildBrandContext(business) : undefined;
      const { enrichedPrompt, seed } = computeFluxGeneration(
        p.trim(),
        brandCtx,
      );

      try {
        const res = await fetch("/api/flux-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ enrichedPrompt, seed }),
        });

        if (!res.ok) {
          let msg =
            "No se pudo generar la imagen. Revisá la conexión o tocá Reintentar.";
          try {
            const data = (await res.json()) as { error?: string };
            if (data.error) msg = data.error;
          } catch {
            /* ignore */
          }
          setLoading(false);
          setError(msg);
          return;
        }

        const storageUrl = res.headers.get("X-Pollinations-Url")?.trim() ?? "";
        const blob = await res.blob();
        const displayUrl = URL.createObjectURL(blob);
        previewBlobUrlRef.current = displayUrl;

        const next: GeneratedImage = {
          displayUrl,
          storageUrl: storageUrl || displayUrl,
          seed,
          enrichedPrompt,
        };
        setGenerated(next);
        setLoading(false);
      } catch {
        setLoading(false);
        setError("Error de red. Intentá de nuevo.");
      }
    },
    [prompt, business, revokePreviewBlob],
  );

  useEffect(() => {
    if (urlPrompt && !autoFired.current && business) {
      autoFired.current = true;
      setPrompt(urlPrompt);
      generate(urlPrompt);
    }
  }, [urlPrompt, business, generate]);

  const handleDownload = useCallback(() => {
    if (!generated) return;
    try {
      const a = document.createElement("a");
      a.href = generated.displayUrl;
      a.download = `flux-${generated.seed}.jpg`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch {
      /* ignore */
    }
  }, [generated]);

  const handleSave = useCallback(async () => {
    if (!generated || !business) return;
    const { error: insertError } = await supabase
      .from("generated_images")
      .insert({
        business_id: business.id,
        prompt: generated.enrichedPrompt,
        image_url: generated.storageUrl,
        seed: generated.seed,
      });

    if (!insertError) {
      setSaved(true);
      const { data } = await supabase
        .from("generated_images")
        .select("id, prompt, image_url, seed, created_at")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })
        .limit(20);
      if (data) setGallery(data as SavedImage[]);
    }
  }, [generated, business]);

  const handleDeleteGallery = useCallback(
    async (id: string) => {
      await supabase.from("generated_images").delete().eq("id", id);
      setGallery((prev) => prev.filter((img) => img.id !== id));
    },
    [],
  );

  const handleRegenerate = useCallback(() => {
    generate();
  }, [generate]);

  const hasPrompt = !!urlPrompt;

  return (
    <main className="min-h-screen px-6 pb-12 pt-24 md:ml-64">
      <div className="mx-auto max-w-screen-lg">
        {/* Header */}
        <header className="mb-10">
          <div className="mb-2 flex items-center gap-2">
            <span className="rounded-md bg-tertiary-container px-2 py-0.5 text-[10px] font-bold tracking-wider text-on-tertiary-container">
              PREMIUM TOOL
            </span>
            <h4 className="text-sm font-bold text-primary">Contenido IA</h4>
          </div>
          <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-background md:text-5xl">
            {hasPrompt ? "Generando Contenido" : "Galería Creativa"}
          </h1>
          <p className="mt-2 max-w-xl text-on-surface-variant">
            {hasPrompt
              ? "Tu plan de marketing sugirió esta imagen. Revisá el resultado y guardalo en tu galería."
              : "Tus piezas visuales generadas por IA listas para ser curadas, editadas y publicadas en tus canales."}
          </p>
        </header>

        {/* Generator section */}
        <section className="mb-12 overflow-hidden rounded-[1.5rem] bg-surface-container-lowest p-6 md:p-8">
          {/* Auto-processing banner */}
          {hasPrompt && loading && (
            <div className="mb-6 flex items-center gap-3 rounded-xl bg-primary/5 px-5 py-4">
              <span
                className="material-symbols-outlined animate-pulse text-2xl text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                auto_awesome
              </span>
              <div>
                <p className="text-sm font-bold text-on-surface">
                  Generando contenido sugerido por tu plan de marketing…
                </p>
                <p className="text-xs text-on-surface-variant">
                  Powered by Flux Engine
                </p>
              </div>
            </div>
          )}

          {/* Prompt textarea */}
          <div className="mb-6">
            <div className="mb-2 flex items-center justify-between">
              <label
                htmlFor="prompt-field"
                className="text-sm font-bold text-on-surface"
              >
                {hasPrompt ? "Prompt sugerido por Claude" : "Prompt personalizado"}
              </label>
              {hasPrompt && !editable && (
                <button
                  type="button"
                  onClick={() => setEditable(true)}
                  className="flex items-center gap-1 text-xs font-bold text-primary transition-colors hover:text-primary-dim"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  Ajustar prompt
                </button>
              )}
            </div>
            <textarea
              id="prompt-field"
              rows={3}
              readOnly={hasPrompt && !editable}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describí la imagen que querés generar…"
              className={`w-full resize-none rounded-xl border px-4 py-3 text-sm leading-relaxed text-on-surface transition-colors placeholder:text-outline ${
                hasPrompt && !editable
                  ? "cursor-default border-outline-variant/40 bg-surface-container-low"
                  : "border-outline-variant/60 bg-white focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              }`}
            />
          </div>

          {/* Generate / Regenerate / Reintentar (si falló la carga, mostrar aunque el prompt venga de la URL) */}
          {(!hasPrompt || editable || error) && (
            <button
              type="button"
              disabled={loading || !prompt.trim()}
              onClick={() => generate()}
              className="mb-6 flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-bold text-on-primary shadow-sm transition-all hover:bg-primary-dim active:scale-95 disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-lg">brush</span>
              {error
                ? "Reintentar generación"
                : generated
                  ? "Regenerar con ajuste"
                  : "Generar Imagen con Flux"}
            </button>
          )}

          {/* Loading skeleton */}
          {loading && (
            <div className="relative mx-auto aspect-square max-w-md overflow-hidden rounded-xl skeleton-shimmer">
              <div className="flex h-full flex-col items-center justify-center gap-4">
                <div className="flex h-14 w-14 animate-pulse items-center justify-center rounded-full bg-white/40">
                  <span
                    className="material-symbols-outlined text-2xl text-primary"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    auto_awesome
                  </span>
                </div>
                <p className="text-xs font-bold text-on-surface-variant">
                  Procesando imagen con Flux Engine…
                </p>
              </div>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="mb-6 rounded-xl bg-error-container/20 px-5 py-4 text-sm text-error">
              {error}
            </div>
          )}

          {/* Result card */}
          {generated && !loading && !error && (
            <div className="mx-auto max-w-md">
              <div className="group relative overflow-hidden rounded-xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={generated.displayUrl}
                  alt={generated.enrichedPrompt}
                  className="aspect-square w-full object-cover"
                />
                <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="flex w-full gap-2 p-4">
                    <button
                      type="button"
                      onClick={() => void handleDownload()}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/90 py-2.5 text-xs font-bold text-on-background backdrop-blur-md transition-colors hover:bg-white"
                    >
                      <span className="material-symbols-outlined text-sm">
                        download
                      </span>
                      Descargar
                    </button>
                    <button
                      type="button"
                      disabled={saved}
                      onClick={() => void handleSave()}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary/90 py-2.5 text-xs font-bold text-on-primary backdrop-blur-md transition-colors hover:bg-primary disabled:opacity-60"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {saved ? "check_circle" : "bookmark"}
                      </span>
                      {saved ? "Guardada" : "Guardar en Galería"}
                    </button>
                    <button
                      type="button"
                      onClick={handleRegenerate}
                      className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/30"
                      title="Regenerar"
                    >
                      <span className="material-symbols-outlined">refresh</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Actions below image (always visible on mobile) */}
              <div className="mt-4 flex gap-2 md:hidden">
                <button
                  type="button"
                  onClick={() => void handleDownload()}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-surface-container-low py-2.5 text-xs font-bold text-on-surface transition-colors hover:bg-primary/5"
                >
                  <span className="material-symbols-outlined text-sm">
                    download
                  </span>
                  Descargar
                </button>
                <button
                  type="button"
                  disabled={saved}
                  onClick={() => void handleSave()}
                  className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-primary py-2.5 text-xs font-bold text-on-primary transition-all active:scale-95 disabled:opacity-60"
                >
                  <span className="material-symbols-outlined text-sm">
                    {saved ? "check_circle" : "bookmark"}
                  </span>
                  {saved ? "Guardada" : "Guardar en Galería"}
                </button>
                <button
                  type="button"
                  onClick={handleRegenerate}
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-container-low text-on-surface-variant transition-colors hover:text-primary"
                  title="Regenerar"
                >
                  <span className="material-symbols-outlined">refresh</span>
                </button>
              </div>
            </div>
          )}
        </section>

        {/* Gallery */}
        {gallery.length > 0 && (
          <section>
            <h2 className="mb-6 text-xl font-bold text-on-surface">
              Tu Galería
            </h2>
            <div className="masonry-grid">
              {gallery.map((img) => (
                <GalleryCard
                  key={img.id}
                  image={img}
                  onDelete={handleDeleteGallery}
                />
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="mt-16 flex items-center justify-center gap-2 text-xs text-outline">
          <span
            className="material-symbols-outlined text-sm"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            auto_awesome
          </span>
          Powered by Flux Engine
        </footer>
      </div>
    </main>
  );
}

function GalleryCard({
  image,
  onDelete,
}: {
  image: SavedImage;
  onDelete: (id: string) => void;
}) {
  const handleDownload = useCallback(async () => {
    try {
      const res = await fetch(image.image_url);
      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = blobUrl;
      a.download = `flux-${image.seed ?? "img"}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(blobUrl);
    } catch {
      /* ignore */
    }
  }, [image]);

  const dateLabel = new Date(image.created_at).toLocaleDateString("es-AR", {
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="masonry-item group relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm transition-all duration-500 hover:shadow-xl">
      <div className="relative aspect-square overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={image.image_url}
          alt={image.prompt}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        <div className="absolute left-3 top-3">
          <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-on-background backdrop-blur-md">
            {dateLabel}
          </span>
        </div>
        <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
          <div className="w-full space-y-2 p-4">
            <p className="line-clamp-2 text-xs text-white/90">
              {image.prompt}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => void handleDownload()}
                className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/90 py-2 text-xs font-bold text-on-background backdrop-blur-md transition-colors hover:bg-white"
              >
                <span className="material-symbols-outlined text-sm">
                  download
                </span>
                Descargar
              </button>
              <button
                type="button"
                onClick={() => onDelete(image.id)}
                className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-error/80"
                title="Eliminar"
              >
                <span className="material-symbols-outlined text-sm">
                  delete
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
