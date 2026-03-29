import type { SupabaseClient } from "@supabase/supabase-js";
import type {
  BusinessContextRow,
  BusinessContextUpsertPayload,
} from "@/lib/database";

/**
 * Inserta o actualiza el contexto del negocio del usuario (`onConflict: user_id`).
 */
export async function upsertBusinessContext(
  supabase: SupabaseClient,
  payload: BusinessContextUpsertPayload,
) {
  return supabase
    .from("business_context")
    .upsert(payload, { onConflict: "user_id" })
    .select()
    .single();
}
