-- Público objetivo: varios géneros (array) y rango de edad min/max.

ALTER TABLE public.business_context
  ADD COLUMN IF NOT EXISTS target_genders TEXT[];

ALTER TABLE public.business_context
  ADD COLUMN IF NOT EXISTS target_age_min SMALLINT;

ALTER TABLE public.business_context
  ADD COLUMN IF NOT EXISTS target_age_max SMALLINT;

UPDATE public.business_context
SET
  target_genders = ARRAY[target_gender]::TEXT[],
  target_age_min = GREATEST(13, target_age_center - 10),
  target_age_max = LEAST(100, target_age_center + 10)
WHERE target_genders IS NULL;

UPDATE public.business_context
SET target_genders = ARRAY['mujer']::TEXT[]
WHERE target_genders IS NULL OR cardinality(target_genders) < 1;

UPDATE public.business_context
SET
  target_age_min = GREATEST(13, COALESCE(target_age_center, 35) - 10),
  target_age_max = LEAST(100, COALESCE(target_age_center, 35) + 10)
WHERE target_age_min IS NULL;

ALTER TABLE public.business_context
  ALTER COLUMN target_genders SET NOT NULL,
  ALTER COLUMN target_genders SET DEFAULT ARRAY['mujer']::TEXT[];

ALTER TABLE public.business_context
  ALTER COLUMN target_age_min SET NOT NULL,
  ALTER COLUMN target_age_max SET NOT NULL;

ALTER TABLE public.business_context
  ADD CONSTRAINT business_context_target_age_range CHECK (
    target_age_min >= 13
    AND target_age_max <= 100
    AND target_age_min <= target_age_max
  );

ALTER TABLE public.business_context
  ADD CONSTRAINT business_context_target_genders_nonempty CHECK (
    cardinality(target_genders) >= 1
  );

ALTER TABLE public.business_context
  ADD CONSTRAINT business_context_target_genders_allowed CHECK (
    target_genders <@ ARRAY['hombre', 'mujer', 'otro']::TEXT[]
  );

ALTER TABLE public.business_context
  DROP COLUMN IF EXISTS target_gender;

ALTER TABLE public.business_context
  DROP COLUMN IF EXISTS target_age_center;

COMMENT ON COLUMN public.business_context.target_genders IS 'Géneros del público objetivo (uno o más)';
COMMENT ON COLUMN public.business_context.target_age_min IS 'Edad mínima del rango (13–100)';
COMMENT ON COLUMN public.business_context.target_age_max IS 'Edad máxima del rango (13–100)';
