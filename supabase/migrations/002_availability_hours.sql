-- Migración: availability_days (1–7) → availability_hours (1–6)
-- Idempotente: si ya existe availability_hours (instalación nueva con 001 actualizado), solo ajusta el CHECK.

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'business_context'
      AND column_name = 'availability_days'
  ) THEN
    ALTER TABLE public.business_context
      DROP CONSTRAINT IF EXISTS business_context_availability_days_check;
    ALTER TABLE public.business_context
      RENAME COLUMN availability_days TO availability_hours;
  END IF;
END $$;

UPDATE public.business_context
SET availability_hours = LEAST(GREATEST(availability_hours, 1), 6);

ALTER TABLE public.business_context
  DROP CONSTRAINT IF EXISTS business_context_availability_hours_check;

ALTER TABLE public.business_context
  ADD CONSTRAINT business_context_availability_hours_check
  CHECK (availability_hours >= 1 AND availability_hours <= 6);

COMMENT ON COLUMN public.business_context.availability_hours IS 'Horas semanales dedicadas al marketing (1–6)';
