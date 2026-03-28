"use client";

import { useCallback, useEffect, useState } from "react";
import type { PostgrestError } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

/** Fila de `public.business_context` (alineada a la migración SQL). */
export type BusinessContextRow = {
  id: string;
  user_id: string;
  name: string;
  rubro: string;
  description: string | null;
  availability_days: number;
  shopify_url: string | null;
  tienda_nube_url: string | null;
  product_image_urls: string[];
  created_at: string;
  updated_at: string;
};

/** Campos editables al crear o actualizar el negocio. */
export type BusinessContextInput = {
  name: string;
  rubro: string;
  description?: string | null;
  availability_days?: number;
  shopify_url?: string | null;
  tienda_nube_url?: string | null;
  product_image_urls?: string[];
};

export type UseBusinessDataResult = {
  data: BusinessContextRow | null;
  loading: boolean;
  saving: boolean;
  error: PostgrestError | Error | null;
  refetch: () => Promise<void>;
  save: (input: BusinessContextInput) => Promise<boolean>;
};

export function useBusinessData(): UseBusinessDataResult {
  const [data, setData] = useState<BusinessContextRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<PostgrestError | Error | null>(null);

  const fetchData = useCallback(async () => {
    setError(null);
    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      setError(userError);
      setData(null);
      setLoading(false);
      return;
    }

    if (!user) {
      setData(null);
      setLoading(false);
      return;
    }

    const { data: row, error: qError } = await supabase
      .from("business_context")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle();

    if (qError) {
      setError(qError);
      setData(null);
    } else {
      setData(row as BusinessContextRow | null);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void fetchData();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void fetchData();
    });

    return () => subscription.unsubscribe();
  }, [fetchData]);

  const save = useCallback(
    async (input: BusinessContextInput): Promise<boolean> => {
      setError(null);
      setSaving(true);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        setError(userError ?? new Error("No hay sesión activa."));
        setSaving(false);
        return false;
      }

      const payload = {
        user_id: user.id,
        name: input.name,
        rubro: input.rubro,
        description: input.description ?? null,
        availability_days: input.availability_days ?? 3,
        shopify_url: input.shopify_url ?? null,
        tienda_nube_url: input.tienda_nube_url ?? null,
        product_image_urls: input.product_image_urls ?? [],
      };

      const { data: row, error: upsertError } = await supabase
        .from("business_context")
        .upsert(payload, { onConflict: "user_id" })
        .select()
        .single();

      if (upsertError) {
        setError(upsertError);
        setSaving(false);
        return false;
      }

      setData(row as BusinessContextRow);
      setSaving(false);
      return true;
    },
    [],
  );

  return {
    data,
    loading,
    saving,
    error,
    refetch: fetchData,
    save,
  };
}
