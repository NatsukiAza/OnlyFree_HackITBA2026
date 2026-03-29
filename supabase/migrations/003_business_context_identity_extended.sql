-- Campos extendidos de identidad: productos, diferencial y público objetivo

ALTER TABLE public.business_context
  ADD COLUMN IF NOT EXISTS what_you_sell TEXT,
  ADD COLUMN IF NOT EXISTS star_product TEXT,
  ADD COLUMN IF NOT EXISTS premium_product TEXT,
  ADD COLUMN IF NOT EXISTS brand_traits TEXT[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS unique_differential TEXT,
  ADD COLUMN IF NOT EXISTS target_gender TEXT NOT NULL DEFAULT 'mujer'
    CHECK (target_gender IN ('hombre', 'mujer', 'otro')),
  ADD COLUMN IF NOT EXISTS target_age_center SMALLINT NOT NULL DEFAULT 35
    CHECK (target_age_center >= 13 AND target_age_center <= 100),
  ADD COLUMN IF NOT EXISTS geographic_proximity BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS social_objective TEXT NOT NULL DEFAULT 'vender'
    CHECK (social_objective IN ('conocer', 'vender', 'comunidad', 'fidelizar'));

COMMENT ON COLUMN public.business_context.what_you_sell IS 'Qué vende el negocio (producto/servicio principal)';
COMMENT ON COLUMN public.business_context.star_product IS 'Producto o servicio estrella';
COMMENT ON COLUMN public.business_context.premium_product IS 'Producto premium / tope de gama';
COMMENT ON COLUMN public.business_context.brand_traits IS 'Rasgos de ADN de marca (p. ej. Moderno, Premium)';
COMMENT ON COLUMN public.business_context.unique_differential IS 'Diferencial único frente a la competencia';
COMMENT ON COLUMN public.business_context.target_gender IS 'Género del público objetivo';
COMMENT ON COLUMN public.business_context.target_age_center IS 'Edad central del rango objetivo (13–100)';
COMMENT ON COLUMN public.business_context.geographic_proximity IS 'Si el cliente debe vivir cerca del negocio físico';
COMMENT ON COLUMN public.business_context.social_objective IS 'Objetivo principal en redes sociales';
