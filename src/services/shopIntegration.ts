/**
 * Integración con tiendas (mock). Los objetos usan nombres en snake_case
 * alineados al estilo de columnas en `public.business_context` (textos + URLs).
 */

export type ShopPlatform = "tiendanube" | "shopify";

/** Métricas simuladas de la tienda (ventas, vistas, ticket). */
export type ShopMetrics = {
  best_seller_id: string;
  most_viewed_id: string;
  total_sales_month: number;
  average_ticket: number;
};

/** Producto importable: id estable para cruzar con métricas. */
export type ShopProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string;
};

/** Respuesta completa del mock: catálogo + métricas para estrategia de marketing. */
export type ShopImportResult = {
  metrics: ShopMetrics;
  products: ShopProduct[];
};

const MOCK_TECH_PRODUCTS: ShopProduct[] = [
  {
    id: "prod_001",
    name: "Sony WH-1000XM5",
    description:
      "Drivers de 30 mm con imanes de neodimio, ANC dual con 8 micrófonos, Bluetooth 5.2 con codec LDAC y AAC, batería de hasta 30 h (40 h sin ANC), carga rápida USB-C (3 min ≈ 3 h de uso), peso 250 g, plegado giratorio para viaje.",
    price: 349.99,
    image_url:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=400&fit=crop",
  },
  {
    id: "prod_002",
    name: "Logitech MX Master 3S",
    description:
      "Sensor Darkfield de 8000 DPI (rastreo sobre vidrio), clicks silenciosos (-90 % ruido vs MX Master 3), scroll MagSpeed electromagnético, 7 botones programables, ergonomía para mano derecha, Bluetooth Low Energy y receptor Unifying, batería de 70 días, carga USB-C.",
    price: 109.99,
    image_url:
      "https://images.unsplash.com/photo-1527814050087-3793815479db?w=400&h=400&fit=crop",
  },
  {
    id: "prod_003",
    name: "Keychron K2 Pro",
    description:
      "Layout 75 %, switches Gateron Pro Brown (táctiles, 55 gf actuación, 4 mm recorrido), hot-swap 5 pin, acolchado de poron y plate foam, conectividad Bluetooth 5.1 (hasta 3 dispositivos) o cable USB-C, retroiluminación RGB south-facing, compatible Mac/Windows.",
    price: 119.0,
    image_url:
      "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=400&fit=crop",
  },
  {
    id: "prod_004",
    name: "Anker PowerExpand 7-in-1",
    description:
      "Puerto HDMI 2.0 hasta 4K@60 Hz, 2× USB-A 3.0 (5 Gbps), USB-C PD 85 W passthrough (carga del notebook), lector microSD/SD UHS-I, USB-C upstream Thunderbolt 3 compatible, carcasa aluminio, disipación térmica para uso intensivo.",
    price: 54.9,
    image_url:
      "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=400&h=400&fit=crop",
  },
  {
    id: "prod_005",
    name: "Logitech Brio 4K",
    description:
      "Sensor 4K UHD a 30 fps o 1080p a 60 fps, HDR, campo de visión ajustable 65°/78°/90°, enfoque automático con RightLight 3, micrófonos omnidireccionales con cancelación de ruido, clip con rosca 1/4\" para trípode, certificación Zoom/Teams/Google Meet, conexión USB-C 3.0.",
    price: 199.0,
    image_url:
      "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=400&h=400&fit=crop",
  },
];

/** Métricas alineadas a los ids mock (más vendido = MX Master, más visto = Sony). */
const MOCK_METRICS: ShopMetrics = {
  best_seller_id: "prod_002",
  most_viewed_id: "prod_001",
  total_sales_month: 150,
  average_ticket: 45000,
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

/**
 * Simula la obtención de catálogo + métricas desde Tienda Nube o Shopify (sin APIs reales).
 * Espera ~1,5s. Devuelve `{ metrics, products }` para alimentar la generación de estrategia.
 */
export async function fetchShopProducts(
  platform: ShopPlatform,
): Promise<ShopImportResult> {
  void platform;
  await delay(1500);
  return {
    metrics: { ...MOCK_METRICS },
    products: MOCK_TECH_PRODUCTS.map((p) => ({ ...p })),
  };
}

/** Importa catálogo + métricas (mock; sin APIs reales). Mismo resultado que `fetchShopProducts`. */
export async function importShopData(
  platform: ShopPlatform,
): Promise<ShopImportResult> {
  return fetchShopProducts(platform);
}

export const SHOP_PLATFORM_LABEL: Record<ShopPlatform, string> = {
  tiendanube: "Tienda Nube",
  shopify: "Shopify",
};
