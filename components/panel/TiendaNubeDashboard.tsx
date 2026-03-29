"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";

import { supabase } from "@/lib/supabase";
import type { ShopImportResult, ShopProduct } from "@/src/services/shopIntegration";
import { SHOP_PLATFORM_LABEL } from "@/src/services/shopIntegration";

function formatArs(value: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(value);
}

function productName(
  products: ShopProduct[],
  id: string | undefined,
): string {
  if (!id) return "—";
  return products.find((p) => p.id === id)?.name ?? id;
}

function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return email;
  const user = email.slice(0, at);
  const domain = email.slice(at + 1);
  const vis = user.slice(0, Math.min(2, user.length));
  return `${vis}···@${domain}`;
}

export function TiendaNubeDashboard() {
  const [loading, setLoading] = useState(true);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [tiendaNubeUrl, setTiendaNubeUrl] = useState<string | null>(null);
  const [shopifyUrl, setShopifyUrl] = useState<string | null>(null);
  const [shopData, setShopData] = useState<ShopImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.id) {
      setError("Iniciá sesión para ver el panel.");
      setLoading(false);
      return;
    }

    const { data: row, error: qError } = await supabase
      .from("business_context")
      .select("name, tienda_nube_url, shopify_url, shop_data")
      .eq("user_id", user.id)
      .maybeSingle();

    if (qError) {
      setError(qError.message);
      setLoading(false);
      return;
    }

    setBusinessName(row?.name?.trim() || null);
    setTiendaNubeUrl(row?.tienda_nube_url?.trim() || null);
    setShopifyUrl(row?.shopify_url?.trim() || null);

    const raw = row?.shop_data;
    if (raw != null && typeof raw === "object" && "metrics" in raw && "products" in raw) {
      setShopData(raw as ShopImportResult);
    } else {
      setShopData(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const platformLabel = useMemo(() => {
    if (tiendaNubeUrl) return SHOP_PLATFORM_LABEL.tiendanube;
    if (shopifyUrl) return SHOP_PLATFORM_LABEL.shopify;
    return "Tienda";
  }, [tiendaNubeUrl, shopifyUrl]);

  const metrics = shopData?.metrics;
  const products = shopData?.products ?? [];
  const abandoned = shopData?.abandoned_checkouts ?? [];

  const bestSellerName = useMemo(
    () => productName(products, metrics?.best_seller_id),
    [products, metrics?.best_seller_id],
  );
  const mostViewedName = useMemo(
    () => productName(products, metrics?.most_viewed_id),
    [products, metrics?.most_viewed_id],
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 animate-pulse rounded-lg bg-surface-container-high" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-2xl bg-surface-container-low"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <p className="rounded-xl border border-error-container/40 bg-error-container/15 px-4 py-3 text-sm text-on-background">
        {error}
      </p>
    );
  }

  if (!shopData || products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-outline-variant/50 bg-surface-container-lowest p-10 text-center shadow-sm">
        <span className="material-symbols-outlined mb-4 text-5xl text-primary/80">
          store
        </span>
        <h2 className="font-['Plus_Jakarta_Sans',sans-serif] text-xl font-bold text-on-surface">
          Todavía no importamos tu tienda
        </h2>
        <p className="mx-auto mt-3 max-w-md text-on-surface-variant">
          Cuando te conectés desde{" "}
          <span className="font-semibold text-on-surface">Mi negocio</span>, acá
          vas a ver ventas simuladas, productos destacados y carritos
          abandonados para tu estrategia.
        </p>
        <Link
          href="/mi-negocio"
          className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-6 py-3 text-sm font-bold text-white shadow-lg shadow-primary/15 transition-opacity hover:opacity-95"
        >
          <span className="material-symbols-outlined text-lg">upload</span>
          Ir a importar tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-primary">
            {platformLabel}
          </span>
          <h1 className="font-['Plus_Jakarta_Sans',sans-serif] text-3xl font-extrabold tracking-tight text-on-surface md:text-4xl">
            Resumen de tu tienda
          </h1>
          {businessName ? (
            <p className="mt-2 text-on-surface-variant">
              Datos vinculados a{" "}
              <span className="font-semibold text-on-surface">{businessName}</span>
            </p>
          ) : null}
        </div>
        {tiendaNubeUrl || shopifyUrl ? (
          <a
            href={(tiendaNubeUrl ?? shopifyUrl)!}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl border border-outline-variant/50 bg-surface-container-lowest px-4 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-surface-container-low"
          >
            <span className="material-symbols-outlined text-lg">open_in_new</span>
            {tiendaNubeUrl ? "Abrir Tienda Nube" : "Abrir Shopify"}
          </a>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
            Ventas del mes
          </p>
          <p className="mt-2 font-['Plus_Jakarta_Sans',sans-serif] text-3xl font-extrabold text-on-surface">
            {metrics?.total_sales_month ?? "—"}
          </p>
          <p className="mt-1 text-xs text-on-surface-variant">Unidades (mock)</p>
        </div>
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
            Ticket promedio
          </p>
          <p className="mt-2 font-['Plus_Jakarta_Sans',sans-serif] text-3xl font-extrabold text-primary">
            {metrics != null ? formatArs(metrics.average_ticket) : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
            Producto más vendido
          </p>
          <p className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-on-surface">
            {bestSellerName}
          </p>
        </div>
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-5 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-wide text-on-surface-variant">
            Más visto
          </p>
          <p className="mt-2 line-clamp-2 text-lg font-bold leading-snug text-on-surface">
            {mostViewedName}
          </p>
        </div>
      </div>

      <div>
        <h2 className="mb-4 font-['Plus_Jakarta_Sans',sans-serif] text-lg font-bold text-on-surface">
          Catálogo importado
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {products.slice(0, 6).map((p) => (
            <div
              key={p.id}
              className="flex gap-3 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-3 shadow-sm"
            >
              <img
                src={p.image_url}
                alt=""
                className="h-16 w-16 shrink-0 rounded-xl object-cover"
              />
              <div className="min-w-0 flex-1">
                <p className="line-clamp-2 font-semibold text-on-surface">
                  {p.name}
                </p>
                <p className="mt-1 text-sm font-bold text-primary">
                  {formatArs(p.price)}
                </p>
              </div>
            </div>
          ))}
        </div>
        {products.length > 6 ? (
          <p className="mt-3 text-sm text-on-surface-variant">
            +{products.length - 6} productos más en el import completo.
          </p>
        ) : null}
      </div>

      {abandoned.length > 0 ? (
        <div>
          <h2 className="mb-4 font-['Plus_Jakarta_Sans',sans-serif] text-lg font-bold text-on-surface">
            Carritos abandonados (recuperación)
          </h2>
          <div className="overflow-hidden rounded-2xl border border-outline-variant/20 bg-surface-container-lowest shadow-sm">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-outline-variant/30 bg-surface-container-low/80">
                  <th className="px-4 py-3 font-bold text-on-surface-variant">
                    Contacto
                  </th>
                  <th className="px-4 py-3 font-bold text-on-surface-variant">
                    Producto
                  </th>
                  <th className="hidden px-4 py-3 font-bold text-on-surface-variant sm:table-cell">
                    Monto
                  </th>
                </tr>
              </thead>
              <tbody>
                {abandoned.map((row, i) => (
                  <tr
                    key={`${row.email}-${i}`}
                    className="border-b border-outline-variant/15 last:border-0"
                  >
                    <td className="px-4 py-3 text-on-surface">
                      {maskEmail(row.email)}
                    </td>
                    <td className="px-4 py-3 text-on-surface">{row.product_name}</td>
                    <td className="hidden px-4 py-3 font-medium text-on-surface sm:table-cell">
                      {formatArs(row.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <p className="text-center text-xs text-on-surface-variant">
        Métricas y catálogo son simulados a partir del import (mismo origen que la
        estrategia semanal).
      </p>
    </div>
  );
}
