"use client";

import { useCallback, useEffect, useState } from "react";
import type { PostgrestError } from "@supabase/supabase-js";
import {
  IDENTITY_EXTENDED_DEFAULT,
  identityExtendedFromRow,
  identityFieldsForUpsert,
  type IdentityExtendedState,
} from "@/components/IdentityProductsAudience";
import {
  AVAILABILITY_HOURS_DEFAULT,
  type BusinessContextRow,
} from "@/lib/database";
import type { ShopImportResult } from "@/src/services/shopIntegration";
import { upsertBusinessContext } from "@/lib/services/businessContext";
import { supabase } from "@/lib/supabase";

export type { BusinessContextRow };

/** Campos editables al crear o actualizar el negocio. */
export type BusinessContextInput = {
  name: string;
  rubro: string;
  description?: string | null;
  availability_hours?: number;
  shopify_url?: string | null;
  tienda_nube_url?: string | null;
  product_image_urls?: string[];
  /** Si no se envía, se conserva el bloque de identidad extendida ya guardado. */
  identityExtended?: IdentityExtendedState;
  /** Si no se envía, se conserva `shop_data` ya guardado. */
  shop_data?: ShopImportResult | null;
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

      const identity =
        input.identityExtended ??
        (data ? identityExtendedFromRow(data) : IDENTITY_EXTENDED_DEFAULT);

      const shopData =
        input.shop_data !== undefined
          ? input.shop_data
          : (data?.shop_data ?? null);

      const payload = {
        user_id: user.id,
        name: input.name,
        rubro: input.rubro,
        description: input.description ?? null,
        availability_hours: input.availability_hours ?? AVAILABILITY_HOURS_DEFAULT,
        shopify_url: input.shopify_url ?? null,
        tienda_nube_url: input.tienda_nube_url ?? null,
        product_image_urls: input.product_image_urls ?? [],
        ...identityFieldsForUpsert(identity),
        shop_data: shopData,
      };

      const { data: row, error: upsertError } =
        await upsertBusinessContext(supabase, payload);

      if (upsertError) {
        setError(upsertError);
        setSaving(false);
        return false;
      }

      setData(row as BusinessContextRow);
      setSaving(false);
      return true;
    },
    [data],
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
