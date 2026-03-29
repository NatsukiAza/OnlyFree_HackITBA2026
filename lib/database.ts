/**
 * Tipos alineados con `public.business_context` en Supabase.
 */

/** Fila de `public.profiles`. */
export type ProfileRow = {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  username: string | null;
  created_at: string;
  updated_at: string;
};

import type { ShopImportResult } from "@/src/services/shopIntegration";

/** Horas por semana dedicadas al marketing (rango permitido en DB). */
export const AVAILABILITY_HOURS_MIN = 1;
export const AVAILABILITY_HOURS_MAX = 6;
export const AVAILABILITY_HOURS_DEFAULT = 3;

export type TargetGender = "hombre" | "mujer" | "otro";
export type SocialObjective =
  | "conocer"
  | "vender"
  | "comunidad"
  | "fidelizar";

export type BusinessContextRow = {
  id: string;
  user_id: string;
  name: string;
  rubro: string;
  description: string | null;
  availability_hours: number;
  shopify_url: string | null;
  tienda_nube_url: string | null;
  product_image_urls: string[];
  what_you_sell: string | null;
  star_product: string | null;
  premium_product: string | null;
  brand_traits: string[];
  unique_differential: string | null;
  target_genders: TargetGender[];
  target_age_min: number;
  target_age_max: number;
  geographic_proximity: boolean;
  social_objective: SocialObjective;
  /** Importación tienda (JSONB); puede faltar en filas antiguas. */
  shop_data?: ShopImportResult | null;
  created_at: string;
  updated_at: string;
};

/** Payload para insert/upsert de negocio (sin `id` / timestamps). */
export type BusinessContextUpsertPayload = {
  user_id: string;
  name: string;
  rubro: string;
  description: string | null;
  availability_hours: number;
  shopify_url: string | null;
  tienda_nube_url: string | null;
  product_image_urls: string[];
  what_you_sell: string | null;
  star_product: string | null;
  premium_product: string | null;
  brand_traits: string[];
  unique_differential: string | null;
  target_genders: TargetGender[];
  target_age_min: number;
  target_age_max: number;
  geographic_proximity: boolean;
  social_objective: SocialObjective;
  shop_data: ShopImportResult | null;
};

