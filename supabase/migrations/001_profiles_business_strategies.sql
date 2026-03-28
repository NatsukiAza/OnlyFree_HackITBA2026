-- =============================================================================
-- Editorial Studio — esquema alineado a docs/Especificacion.md
-- Ejecutar en Supabase SQL Editor o con CLI: supabase db push
-- =============================================================================

-- Extensión para gen_random_uuid() (habitualmente ya activa en Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- 1. profiles — perfil por usuario (1:1 con auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'Perfil público del usuario; id = auth.users.id';

-- -----------------------------------------------------------------------------
-- 2. business_context — "Mi negocio" / fuente de verdad del negocio
-- -----------------------------------------------------------------------------
CREATE TABLE public.business_context (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  rubro TEXT NOT NULL,
  description TEXT,
  availability_days SMALLINT NOT NULL DEFAULT 3
    CHECK (availability_days >= 1 AND availability_days <= 7),
  shopify_url TEXT,
  tienda_nube_url TEXT,
  product_image_urls TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT business_context_one_per_user UNIQUE (user_id)
);

COMMENT ON TABLE public.business_context IS 'Contexto del negocio: identidad, disponibilidad, tiendas e imágenes';
COMMENT ON COLUMN public.business_context.availability_days IS 'Días/semana dedicados al marketing (1–7)';
COMMENT ON COLUMN public.business_context.product_image_urls IS 'URLs de fotos de productos (Storage u externas)';

CREATE INDEX idx_business_context_user_id ON public.business_context (user_id);

-- -----------------------------------------------------------------------------
-- 3. strategies — estrategia semanal generada (vinculada al negocio)
-- -----------------------------------------------------------------------------
CREATE TABLE public.strategies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_context (id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  title TEXT,
  content JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT strategies_week_order CHECK (week_end_date >= week_start_date)
);

COMMENT ON TABLE public.strategies IS 'Estrategia semanal (calendario, días, copy, tendencias) en JSONB';
COMMENT ON COLUMN public.strategies.content IS 'Payload estructurado: días, posts, badges de tendencia, tareas, etc.';

CREATE INDEX idx_strategies_business_id ON public.strategies (business_id);
CREATE INDEX idx_strategies_week ON public.strategies (business_id, week_start_date DESC);

-- -----------------------------------------------------------------------------
-- updated_at automático
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER business_context_set_updated_at
  BEFORE UPDATE ON public.business_context
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER strategies_set_updated_at
  BEFORE UPDATE ON public.strategies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Perfil al registrarse (Supabase Auth)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- -----------------------------------------------------------------------------
-- Row Level Security (RLS)
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

-- profiles: solo el dueño lee/actualiza su fila
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- INSERT de profiles lo hace el trigger con SECURITY DEFINER; si insertás manual desde cliente:
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- business_context: CRUD solo del usuario dueño
CREATE POLICY "business_select_own"
  ON public.business_context FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "business_insert_own"
  ON public.business_context FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "business_update_own"
  ON public.business_context FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "business_delete_own"
  ON public.business_context FOR DELETE
  USING (auth.uid() = user_id);

-- strategies: solo si el negocio pertenece al usuario
CREATE POLICY "strategies_select_own"
  ON public.strategies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.business_context b
      WHERE b.id = strategies.business_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "strategies_insert_own"
  ON public.strategies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_context b
      WHERE b.id = strategies.business_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "strategies_update_own"
  ON public.strategies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.business_context b
      WHERE b.id = strategies.business_id AND b.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_context b
      WHERE b.id = strategies.business_id AND b.user_id = auth.uid()
    )
  );

CREATE POLICY "strategies_delete_own"
  ON public.strategies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.business_context b
      WHERE b.id = strategies.business_id AND b.user_id = auth.uid()
    )
  );
