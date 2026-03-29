import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function createSupabaseBrowserClient(): SupabaseClient {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno.",
    );
  }
  return createBrowserClient(supabaseUrl, supabaseAnonKey);
}

/**
 * Cliente de navegador alineado con @supabase/auth-helpers-nextjs
 * (sesión en cookies, PKCE), mismo mecanismo que el login y el middleware.
 */
export const supabase = createSupabaseBrowserClient();
