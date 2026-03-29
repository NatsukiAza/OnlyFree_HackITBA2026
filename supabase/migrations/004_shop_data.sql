-- Catálogo + métricas importados desde tienda (mock o API)

ALTER TABLE public.business_context
  ADD COLUMN IF NOT EXISTS shop_data JSONB;

COMMENT ON COLUMN public.business_context.shop_data IS 'JSON con metrics y products (importación Tienda Nube / Shopify)';
