import { NextResponse } from "next/server";
import {
  fetchShopProducts,
  type ShopPlatform,
} from "@/src/services/shopIntegration";

function isShopPlatform(value: string | null): value is ShopPlatform {
  return value === "tiendanube" || value === "shopify";
}

/**
 * GET /api/import-products?platform=tiendanube|shopify
 *
 * Respuesta: `{ metrics, products }` para estrategia de marketing y agente de copy.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get("platform");

  if (!isShopPlatform(platform)) {
    return NextResponse.json(
      {
        error:
          'Parámetro "platform" requerido: "tiendanube" o "shopify". Ejemplo: /api/import-products?platform=shopify',
      },
      { status: 400 },
    );
  }

  const data = await fetchShopProducts(platform);

  return NextResponse.json(data);
}
