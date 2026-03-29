"use client";

import { useCallback, useState } from "react";

export type GenerateImageOptions = {
  aspectRatio?: string;
};

export function useImageGeneration() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateImage = useCallback(
    async (prompt: string, options?: GenerateImageOptions) => {
      const trimmed = prompt.trim();
      if (!trimmed) {
        setError("Escribí un prompt.");
        setImageUrl(null);
        return;
      }

      setError(null);
      setIsLoading(true);
      setImageUrl(null);

      try {
        const res = await fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: trimmed,
            aspectRatio: options?.aspectRatio,
            mode: "sync",
          }),
        });

        const data = (await res.json()) as { error?: string; imageUrl?: string };

        if (!res.ok) {
          throw new Error(data.error ?? `Error ${res.status}`);
        }

        if (!data.imageUrl) {
          throw new Error("Respuesta sin URL de imagen.");
        }

        setImageUrl(data.imageUrl);
      } catch (e) {
        setImageUrl(null);
        setError(e instanceof Error ? e.message : "Error al generar la imagen.");
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  return {
    generateImage,
    imageUrl,
    isLoading,
    error,
  };
}
