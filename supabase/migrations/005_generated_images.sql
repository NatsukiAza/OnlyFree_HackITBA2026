-- generated_images — imagenes generadas con Pollinations/Flux desde el plan de marketing
CREATE TABLE public.generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID NOT NULL REFERENCES public.business_context (id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  seed BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_generated_images_business ON public.generated_images (business_id, created_at DESC);

ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "images_select_own" ON public.generated_images FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.business_context b
    WHERE b.id = generated_images.business_id AND b.user_id = auth.uid()
  ));

CREATE POLICY "images_insert_own" ON public.generated_images FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.business_context b
    WHERE b.id = generated_images.business_id AND b.user_id = auth.uid()
  ));

CREATE POLICY "images_delete_own" ON public.generated_images FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.business_context b
    WHERE b.id = generated_images.business_id AND b.user_id = auth.uid()
  ));
