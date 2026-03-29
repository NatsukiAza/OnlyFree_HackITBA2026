"use client";

import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AVAILABILITY_HOURS_DEFAULT,
  AVAILABILITY_HOURS_MAX,
  AVAILABILITY_HOURS_MIN,
  type BusinessContextRow,
  type BusinessContextUpsertPayload,
} from "@/lib/database";
import {
  importShopData,
  mergeShopAndManualImageUrls,
  MOCK_GALLERY_IMAGE_URLS,
  SHOP_PLATFORM_LABEL,
  type ShopImportResult,
  type ShopPlatform,
} from "@/src/services/shopIntegration";
import {
  IDENTITY_EXTENDED_DEFAULT,
  IdentityProductsDifferential,
  IdentityTargetAudience,
  identityExtendedFromRow,
  identityFieldsForUpsert,
  validateIdentityAudience,
  validateIdentityProducts,
  type IdentityExtendedState,
} from "@/components/IdentityProductsAudience";
import { BUSINESS_PROFILE_UPDATED_EVENT } from "@/lib/appEvents";
import { upsertBusinessContext } from "@/lib/services/businessContext";

/** Tamaño máximo por archivo local hasta integrar Cloudinary. */
const ASSET_IMAGE_MAX_BYTES = 1.5 * 1024 * 1024;

function isValidHttpUrl(value: string): boolean {
  try {
    const u = new URL(value);
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
}

const DESCRIPTION_MAX = 250;

const SECTORS: { id: string; label: string; icon: string; fill?: boolean }[] =
  [
    { id: "gastronomia", label: "Gastronomía", icon: "restaurant", fill: true },
    { id: "tecnologia", label: "Tecnología", icon: "devices" },
    { id: "moda", label: "Moda", icon: "apparel" },
    { id: "servicios", label: "Servicios", icon: "home_repair_service" },
    { id: "educacion", label: "Educación", icon: "auto_stories" },
    { id: "otro", label: "Otro", icon: "add" },
  ];

/** Pasos del stepper (4 etapas lógicas). El carrusel tiene un panel extra de Identidad. */
const ONBOARDING_STEPS = [
  { id: "identity", label: "Identidad", shortLabel: "1" },
  { id: "connectivity", label: "Conectividad", shortLabel: "2" },
  { id: "availability", label: "Disponibilidad", shortLabel: "3" },
  { id: "assets", label: "Activos", shortLabel: "4" },
] as const;

/** Carrusel: 0–2 = Identidad (tres paneles), luego Conectividad, Disponibilidad, Activos */
const CAROUSEL_PANEL_COUNT = ONBOARDING_STEPS.length + 2;

function mainStepFromCarousel(carouselIndex: number): number {
  return carouselIndex <= 2 ? 0 : carouselIndex - 2;
}

function planLabel(hours: number): string {
  if (hours <= 2) return "Plan Ligero";
  if (hours <= 4) return "Plan Moderado";
  return "Plan Intenso";
}

function validateIdentityBasics(ctx: {
  name: string;
  rubro: string;
}): string | null {
  if (!ctx.name.trim()) return "Ingresá el nombre del negocio.";
  if (!ctx.rubro.trim()) return "Elegí un sector.";
  return null;
}

function notifyBusinessProfileUpdated() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(BUSINESS_PROFILE_UPDATED_EVENT));
  }
}

export function BusinessForm({ formId = "business-onboarding-form" }: { formId?: string }) {
  const router = useRouter();
  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  /** Panel visible en el carrusel (0 = identidad básica, 1 = productos, 2 = público, …) */
  const [carouselIndex, setCarouselIndex] = useState(0);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [rubro, setRubro] = useState("");
  const [availabilityHours, setAvailabilityHours] = useState(
    AVAILABILITY_HOURS_DEFAULT,
  );
  const [tiendaNubeUrl, setTiendaNubeUrl] = useState("");
  const [shopifyUrl, setShopifyUrl] = useState("");
  /** JSON importado (mock) persistido en `business_context.shop_data`. */
  const [shopData, setShopData] = useState<ShopImportResult | null>(null);
  const [importingShop, setImportingShop] = useState<ShopPlatform | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [productImageUrls, setProductImageUrls] = useState<string[]>([]);
  /** URLs del mock ocultadas al tocar (solo vista prevía; no se persisten). */
  const [hiddenMockGalleryUrls, setHiddenMockGalleryUrls] = useState<string[]>(
    [],
  );
  const [imageUrlInput, setImageUrlInput] = useState("");
  const imageUrlInputRef = useRef<HTMLInputElement>(null);
  const assetFileInputRef = useRef<HTMLInputElement>(null);

  /** Sin fotos guardadas: mostramos la galería del mock de Tiendanube (mismo catálogo que el import). */
  const galleryDisplayUrls = useMemo(() => {
    if (productImageUrls.length > 0) return productImageUrls;
    return MOCK_GALLERY_IMAGE_URLS.filter(
      (u) => !hiddenMockGalleryUrls.includes(u),
    );
  }, [productImageUrls, hiddenMockGalleryUrls]);

  const isShowingMockGallery = productImageUrls.length === 0;

  const [identityExtended, setIdentityExtended] =
    useState<IdentityExtendedState>(IDENTITY_EXTENDED_DEFAULT);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const applyRow = useCallback((row: BusinessContextRow) => {
    setName(row.name);
    setDescription(row.description ?? "");
    setRubro(row.rubro);
    setAvailabilityHours(row.availability_hours);
    setTiendaNubeUrl(row.tienda_nube_url ?? "");
    setShopifyUrl(row.shopify_url ?? "");
    setProductImageUrls(row.product_image_urls ?? []);
    setHiddenMockGalleryUrls([]);
    setIdentityExtended(identityExtendedFromRow(row));
    setShopData(
      row.shop_data != null && typeof row.shop_data === "object"
        ? (row.shop_data as ShopImportResult)
        : null,
    );
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(t);
  }, [toast]);

  const runShopImport = useCallback(
    async (platform: ShopPlatform) => {
      setImportingShop(platform);
      setErrorMessage(null);
      try {
        const trimmedName = name.trim();
        const trimmedRubro = rubro.trim();
        if (!trimmedName || !trimmedRubro) {
          setErrorMessage(
            "Completá el nombre del negocio y el sector en Identidad para guardar la importación.",
          );
          return;
        }

        const imported = await importShopData(platform);

        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          setErrorMessage(
            userError?.message ?? "Tenés que iniciar sesión para importar.",
          );
          return;
        }

        const payload: BusinessContextUpsertPayload = {
          user_id: user.id,
          name: trimmedName,
          rubro: trimmedRubro,
          description: description.trim() || null,
          availability_hours: availabilityHours,
          tienda_nube_url: tiendaNubeUrl.trim() || null,
          shopify_url: shopifyUrl.trim() || null,
          product_image_urls: mergeShopAndManualImageUrls(
            imported,
            productImageUrls,
          ),
          ...identityFieldsForUpsert(identityExtended),
          shop_data: imported,
        };

        const { data: saved, error: upsertError } =
          await upsertBusinessContext(supabase, payload);

        if (upsertError) {
          setErrorMessage(upsertError.message);
          return;
        }

        if (saved) {
          applyRow(saved as BusinessContextRow);
          notifyBusinessProfileUpdated();
          setToast(
            `Se han importado exitosamente ${imported.products.length} productos de ${SHOP_PLATFORM_LABEL[platform]}.`,
          );
        }
      } finally {
        setImportingShop(null);
      }
    },
    [
      name,
      rubro,
      description,
      availabilityHours,
      tiendaNubeUrl,
      shopifyUrl,
      productImageUrls,
      identityExtended,
      supabase,
      applyRow,
    ],
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setErrorMessage(null);

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        if (!cancelled) {
          setLoading(false);
          if (userError) setErrorMessage(userError.message);
        }
        return;
      }

      const { data: row, error: qError } = await supabase
        .from("business_context")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!cancelled) {
        if (qError) setErrorMessage(qError.message);
        else if (row) applyRow(row as BusinessContextRow);
        setLoading(false);
      }
    }

    void load();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void load();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [supabase, applyRow]);

  const addImageUrl = () => {
    const u = imageUrlInput.trim();
    if (!u) return;
    if (!isValidHttpUrl(u)) {
      setErrorMessage("Ingresá una URL de imagen válida (https://...).");
      return;
    }
    setProductImageUrls((prev) => [...prev, u]);
    setImageUrlInput("");
    setErrorMessage(null);
  };

  const handleAssetFileSelected = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      e.target.value = "";
      if (!file) return;
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Elegí un archivo de imagen (JPG, PNG, WebP…).");
        return;
      }
      if (file.size > ASSET_IMAGE_MAX_BYTES) {
        setErrorMessage(
          `El archivo supera ${Math.round((ASSET_IMAGE_MAX_BYTES / (1024 * 1024)) * 10) / 10} MB. Cuando conectes Cloudinary podrás optimizar subidas más pesadas.`,
        );
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl =
          typeof reader.result === "string" ? reader.result : "";
        if (!dataUrl) return;
        setProductImageUrls((prev) => [...prev, dataUrl]);
        setErrorMessage(null);
        setToast(
          "Imagen agregada. Guardá los cambios. Podés reemplazar esto por Cloudinary cuando subas a la nube.",
        );
      };
      reader.onerror = () => {
        setErrorMessage("No se pudo leer el archivo. Probá con otra imagen.");
      };
      reader.readAsDataURL(file);
    },
    [],
  );

  const removeGalleryImageAt = useCallback(
    (index: number) => {
      const url = galleryDisplayUrls[index];
      if (!url) return;
      if (productImageUrls.length > 0) {
        setProductImageUrls((prev) => prev.filter((_, i) => i !== index));
      } else {
        setHiddenMockGalleryUrls((prev) =>
          prev.includes(url) ? prev : [...prev, url],
        );
      }
      setErrorMessage(null);
    },
    [galleryDisplayUrls, productImageUrls.length],
  );

  const goToNextStep = () => {
    if (carouselIndex === 0) {
      const err = validateIdentityBasics({ name, rubro });
      if (err) {
        setErrorMessage(err);
        return;
      }
      setErrorMessage(null);
      setCarouselIndex(1);
      return;
    }
    if (carouselIndex === 1) {
      const err = validateIdentityProducts(identityExtended);
      if (err) {
        setErrorMessage(err);
        return;
      }
      setErrorMessage(null);
      setCarouselIndex(2);
      return;
    }
    if (carouselIndex === 2) {
      const err = validateIdentityAudience(identityExtended);
      if (err) {
        setErrorMessage(err);
        return;
      }
      setErrorMessage(null);
      setCarouselIndex(3);
      return;
    }
    setErrorMessage(null);
    if (carouselIndex < CAROUSEL_PANEL_COUNT - 1) {
      setCarouselIndex((s) => s + 1);
    }
  };

  const goToPreviousStep = () => {
    setErrorMessage(null);
    if (carouselIndex > 0) setCarouselIndex((s) => s - 1);
  };

  const lastCarouselIndex = CAROUSEL_PANEL_COUNT - 1;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (carouselIndex !== lastCarouselIndex) {
      return;
    }

    setStatusMessage(null);
    setErrorMessage(null);

    const saveIntent = new FormData(e.currentTarget).get("saveIntent");
    const isDraft = saveIntent === "draft";

    const trimmedName = name.trim();
    const trimmedRubro = rubro.trim();
    if (!trimmedName || !trimmedRubro) {
      setErrorMessage("Completá el nombre del negocio y elegí un sector.");
      setCarouselIndex(0);
      return;
    }

    setSaving(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage(
        userError?.message ?? "Tenés que iniciar sesión para guardar.",
      );
      setSaving(false);
      return;
    }

    const payload = {
      user_id: user.id,
      name: trimmedName,
      rubro: trimmedRubro,
      description: description.trim() || null,
      availability_hours: availabilityHours,
      tienda_nube_url: tiendaNubeUrl.trim() || null,
      shopify_url: shopifyUrl.trim() || null,
      product_image_urls: mergeShopAndManualImageUrls(
        shopData,
        productImageUrls,
      ),
      ...identityFieldsForUpsert(identityExtended),
      shop_data: shopData,
    };

    const { data: saved, error: upsertError } =
      await upsertBusinessContext(supabase, payload);

    if (upsertError) {
      setErrorMessage(upsertError.message);
    } else if (saved) {
      applyRow(saved as BusinessContextRow);
      notifyBusinessProfileUpdated();
      setStatusMessage(
        isDraft ? "Borrador guardado." : "Datos guardados correctamente.",
      );
      if (!isDraft) {
        router.push("/estrategia-semanal?generate=true");
      }
    }

    setSaving(false);
  };

  const descLen = description.length;

  return (
    <form id={formId} onSubmit={handleSubmit}>
      {errorMessage && (
        <p className="mb-4 rounded-lg bg-error-container/30 px-4 py-2 text-sm text-on-background">
          {errorMessage}
        </p>
      )}
      {statusMessage && (
        <p className="mb-4 rounded-lg bg-secondary-container/40 px-4 py-2 text-sm text-on-background">
          {statusMessage}
        </p>
      )}
      {loading && (
        <p className="mb-4 text-sm text-on-surface-variant">Cargando datos…</p>
      )}

      {/* Stepper: estado completado / activo / pendiente */}
      <div
        className="mb-12 flex items-center px-2 sm:px-4"
        role="list"
        aria-label="Progreso del onboarding"
      >
        {(() => {
          const mainStep = mainStepFromCarousel(carouselIndex);
          return ONBOARDING_STEPS.map((step, index) => {
          const isActive = index === mainStep;
          const isCompleted = index < mainStep;
          const showConnector = index < ONBOARDING_STEPS.length - 1;

          const circleClass = isCompleted
            ? "bg-primary text-white shadow-lg shadow-primary/20"
            : isActive
              ? "bg-primary text-white shadow-lg shadow-primary/20"
              : "bg-surface-container-high text-on-surface-variant";

          const labelClass = isActive
            ? "font-bold text-on-background"
            : isCompleted
              ? "font-semibold text-on-background"
              : "font-medium text-on-surface-variant";

          return (
            <div key={step.id} className="flex min-w-0 flex-1 items-center">
              <div
                className="flex min-w-0 items-center gap-2 sm:gap-4"
                role="listitem"
                aria-current={isActive ? "step" : undefined}
              >
                <div
                  className={`relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors sm:h-10 sm:w-10 ${circleClass}`}
                >
                  {isCompleted ? (
                    <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
                      check
                    </span>
                  ) : (
                    step.shortLabel
                  )}
                </div>
                <span
                  className={`truncate text-xs sm:text-sm ${labelClass}`}
                >
                  {step.label}
                </span>
              </div>
              {showConnector && (
                <div
                  className={`mx-1 h-0.5 min-w-[0.5rem] flex-1 transition-colors sm:mx-2 ${index < mainStep ? "bg-primary" : "bg-surface-container-high"}`}
                  aria-hidden
                />
              )}
            </div>
          );
        });
        })()}
      </div>

      {/* Paneles con slide: salida a la izquierda, entrada desde la derecha */}
      <div className="relative mb-12 w-full overflow-hidden">
        <div
          className="flex w-full transition-transform duration-500 ease-in-out motion-reduce:transition-none"
          style={{
            transform: `translateX(-${carouselIndex * 100}%)`,
          }}
        >
          {/* Paso 0: Identidad */}
          <div className="w-full shrink-0 px-1">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
              <div className="rounded-xl bg-surface-container-lowest p-8 shadow-sm md:col-span-7">
                <div className="mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">
                    badge
                  </span>
                  <h2 className="text-xl font-bold">Identidad de Marca</h2>
                </div>
                <div className="space-y-6">
                  <div>
                    <label
                      className="mb-2 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
                      htmlFor="businessName"
                    >
                      Nombre del Negocio
                    </label>
                    <input
                      id="businessName"
                      className="w-full rounded-lg border-0 bg-surface-container-lowest px-4 py-3 ring-1 ring-outline-variant/30 transition-all outline-none focus:ring-2 focus:ring-primary-container/40"
                      placeholder="Ej: Velas Áurea"
                      type="text"
                      name="businessName"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={loading}
                      autoComplete="organization"
                    />
                  </div>
                  <div>
                    <label
                      className="mb-2 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
                      htmlFor="description"
                    >
                      Descripción Estratégica
                    </label>
                    <div className="relative">
                      <textarea
                        id="description"
                        className="w-full resize-none rounded-lg border-0 bg-surface-container-lowest px-4 py-3 ring-1 ring-outline-variant/30 transition-all outline-none focus:ring-2 focus:ring-primary-container/40"
                        placeholder="Cuéntanos la esencia de tu marca, a quién ayudas y qué te diferencia..."
                        rows={4}
                        name="description"
                        maxLength={DESCRIPTION_MAX}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={loading}
                      />
                      <div className="absolute bottom-3 right-3 text-[10px] font-medium text-slate-400">
                        {descLen} / {DESCRIPTION_MAX}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col rounded-xl bg-surface-container-low p-8 md:col-span-5">
                <div className="mb-6 flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">
                    category
                  </span>
                  <h2 className="text-xl font-bold">Sector</h2>
                </div>
                <div className="flex flex-wrap gap-3">
                  {SECTORS.map((s) => {
                    const selected = rubro === s.label;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        className={
                          selected
                            ? "flex items-center gap-2 rounded-xl border-2 border-primary bg-white px-5 py-3 font-medium text-on-background shadow-sm transition-all hover:shadow-md"
                            : "flex items-center gap-2 rounded-xl bg-white/50 px-5 py-3 font-medium text-on-surface-variant transition-all hover:bg-white"
                        }
                        onClick={() => setRubro(s.label)}
                        disabled={loading}
                      >
                        <span
                          className={
                            selected
                              ? "material-symbols-outlined text-sm text-primary"
                              : "material-symbols-outlined text-sm"
                          }
                          style={
                            s.fill
                              ? { fontVariationSettings: "'FILL' 1" }
                              : undefined
                          }
                        >
                          {s.icon}
                        </span>
                        {s.label}
                      </button>
                    );
                  })}
                </div>
                <div className="mt-auto pt-6">
                  <p className="text-xs italic text-on-surface-variant">
                    Tip: El sector ayuda a la IA a sugerir paletas de colores y
                    tono de voz adecuados.
                  </p>
                </div>
              </div>
            </div>
            <StepNav
              showBack={false}
              onNext={goToNextStep}
              onBack={goToPreviousStep}
              nextLabel="Continuar"
            />
          </div>

          {/* Identidad: productos y diferencial */}
          <div className="w-full shrink-0 px-1">
            <IdentityProductsDifferential
              values={identityExtended}
              onChange={setIdentityExtended}
              disabled={loading}
            />
            <StepNav
              showBack
              onNext={goToNextStep}
              onBack={goToPreviousStep}
              nextLabel="Continuar"
            />
          </div>

          {/* Identidad: público objetivo */}
          <div className="w-full shrink-0 px-1">
            <IdentityTargetAudience
              values={identityExtended}
              onChange={setIdentityExtended}
              disabled={loading}
            />
            <StepNav
              showBack
              onNext={goToNextStep}
              onBack={goToPreviousStep}
              nextLabel="Continuar"
            />
          </div>

          {/* Paso 1: Conectividad */}
          <div className="w-full shrink-0 px-1">
            <div className="mb-8 overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
              <div className="p-8">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="material-symbols-outlined text-primary">
                      hub
                    </span>
                    <h2 className="text-xl font-bold">Conectividad & Datos</h2>
                  </div>
                  <span className="rounded-full bg-tertiary-container px-3 py-1 text-xs font-bold uppercase tracking-widest text-on-tertiary-container">
                    Recomendado
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div className="space-y-4">
                    <button
                      type="button"
                      className="group flex w-full items-center justify-between rounded-xl bg-[#004b91] px-6 py-4 text-white transition-all hover:opacity-90"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                          <span className="material-symbols-outlined text-xl text-white">
                            shopping_bag
                          </span>
                        </div>
                        <span className="font-semibold">Tienda Nube</span>
                      </div>
                      <span className="material-symbols-outlined opacity-0 transition-opacity group-hover:opacity-100">
                        chevron_right
                      </span>
                    </button>
                    <label className="sr-only" htmlFor="tiendaNubeUrl">
                      URL Tienda Nube
                    </label>
                    <input
                      id="tiendaNubeUrl"
                      name="tiendaNubeUrl"
                      type="url"
                      inputMode="url"
                      placeholder="https://tu-tienda.mitiendanube.com"
                      className="w-full rounded-lg border-0 bg-surface-container-low px-3 py-2 text-sm text-on-background ring-1 ring-outline-variant/30 outline-none focus:ring-2 focus:ring-primary-container/40"
                      value={tiendaNubeUrl}
                      onChange={(e) => setTiendaNubeUrl(e.target.value)}
                      disabled={loading || importingShop !== null}
                    />
                    <button
                      type="button"
                      onClick={() => void runShopImport("tiendanube")}
                      disabled={
                        loading || importingShop !== null || saving
                      }
                      className="w-full rounded-lg bg-[#004b91]/15 px-3 py-2 text-xs font-bold text-[#004b91] ring-1 ring-[#004b91]/30 transition-colors hover:bg-[#004b91]/25 disabled:opacity-50"
                    >
                      {importingShop === "tiendanube"
                        ? "Importando…"
                        : "Importar catálogo (demo)"}
                    </button>
                    <button
                      type="button"
                      className="group flex w-full items-center justify-between rounded-xl bg-[#95bf47] px-6 py-4 text-white transition-all hover:opacity-90"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20">
                          <span className="material-symbols-outlined text-xl text-white">
                            storefront
                          </span>
                        </div>
                        <span className="font-semibold">Shopify</span>
                      </div>
                      <span className="material-symbols-outlined opacity-0 transition-opacity group-hover:opacity-100">
                        chevron_right
                      </span>
                    </button>
                    <label className="sr-only" htmlFor="shopifyUrl">
                      URL Shopify
                    </label>
                    <input
                      id="shopifyUrl"
                      name="shopifyUrl"
                      type="url"
                      inputMode="url"
                      placeholder="https://tu-tienda.myshopify.com"
                      className="w-full rounded-lg border-0 bg-surface-container-low px-3 py-2 text-sm text-on-background ring-1 ring-outline-variant/30 outline-none focus:ring-2 focus:ring-primary-container/40"
                      value={shopifyUrl}
                      onChange={(e) => setShopifyUrl(e.target.value)}
                      disabled={loading || importingShop !== null}
                    />
                    <button
                      type="button"
                      onClick={() => void runShopImport("shopify")}
                      disabled={
                        loading || importingShop !== null || saving
                      }
                      className="w-full rounded-lg bg-[#95bf47]/20 px-3 py-2 text-xs font-bold text-[#3d6219] ring-1 ring-[#95bf47]/40 transition-colors hover:bg-[#95bf47]/30 disabled:opacity-50"
                    >
                      {importingShop === "shopify"
                        ? "Importando…"
                        : "Importar catálogo (demo)"}
                    </button>
                  </div>
                  <div className="group relative md:col-span-2">
                    <div className="flex h-full min-h-[200px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/40 p-8 transition-all hover:border-primary-container hover:bg-primary-container/5 md:min-h-full">
                      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high transition-transform group-hover:scale-110">
                        <span className="material-symbols-outlined text-slate-500 group-hover:text-primary">
                          upload_file
                        </span>
                      </div>
                      <p className="mb-1 font-bold text-on-background">
                        Cargar inventario en Excel
                      </p>
                      <p className="text-center text-sm text-on-surface-variant">
                        Si no tienes tienda online, arrastra tu lista de
                        productos aquí para analizarlos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <StepNav
              showBack
              onNext={goToNextStep}
              onBack={goToPreviousStep}
              nextLabel="Continuar"
            />
          </div>

          {/* Paso 2: Disponibilidad */}
          <div className="w-full shrink-0 px-1">
            <div className="relative mx-auto max-w-xl overflow-hidden rounded-2xl bg-primary p-8 text-on-primary">
              <div className="relative z-10">
                <h3 className="mb-6 text-xl font-bold">Disponibilidad</h3>
                <p className="mb-8 text-sm leading-relaxed opacity-80">
                  ¿Cuántas horas a la semana podés dedicarle al marketing?
                </p>
                <div className="space-y-6">
                  <input
                    className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/30"
                    max={AVAILABILITY_HOURS_MAX}
                    min={AVAILABILITY_HOURS_MIN}
                    step={1}
                    type="range"
                    name="availabilityHours"
                    value={availabilityHours}
                    onChange={(e) =>
                      setAvailabilityHours(
                        Number(e.target.value) || AVAILABILITY_HOURS_MIN,
                      )
                    }
                    disabled={loading}
                  />
                  <div className="flex items-end justify-between">
                    <div className="text-center">
                      <span className="block text-3xl font-black">
                        {availabilityHours}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                        Horas semanales
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                        {planLabel(availabilityHours)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
            </div>
            <StepNav
              showBack
              onNext={goToNextStep}
              onBack={goToPreviousStep}
              nextLabel="Continuar"
            />
          </div>

          {/* Paso 3: Galería */}
          <div className="w-full shrink-0 px-1">
            <div className="rounded-2xl border border-white/40 bg-surface-container-lowest p-8 shadow-sm">
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-primary">
                    image
                  </span>
                  <h2 className="text-xl font-bold">Galería de Activos</h2>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2 text-sm font-semibold text-on-background transition-colors hover:bg-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-sm">
                      auto_fix
                    </span>
                    Generar con IA
                  </button>
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2 text-sm font-semibold text-on-background transition-colors hover:bg-surface-container-high"
                  >
                    <span className="material-symbols-outlined text-sm">
                      photo_library
                    </span>
                    Stock
                  </button>
                </div>
              </div>

              <div className="mb-4 flex flex-col gap-2 sm:flex-row">
                <input
                  ref={imageUrlInputRef}
                  className="min-w-0 flex-1 rounded-lg border-0 bg-surface-container-low px-3 py-2 text-sm ring-1 ring-outline-variant/30 outline-none focus:ring-2 focus:ring-primary-container/40"
                  type="url"
                  placeholder="Pegá la URL de una imagen y tocá Agregar"
                  value={imageUrlInput}
                  onChange={(e) => setImageUrlInput(e.target.value)}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="rounded-lg bg-surface-container-high px-4 py-2 text-sm font-bold text-on-surface"
                  onClick={addImageUrl}
                  disabled={loading}
                >
                  Agregar
                </button>
              </div>

              <input
                ref={assetFileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                aria-hidden
                tabIndex={-1}
                onChange={handleAssetFileSelected}
              />

              {isShowingMockGallery ? (
                <p className="mb-3 text-xs text-on-surface-variant">
                  Vista prevía del catálogo mock (mismas fotos que importa Tienda
                  Nube). Importá la tienda o agregá fotos para reemplazarlas al
                  guardar.
                </p>
              ) : null}

              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                <button
                  type="button"
                  className="group flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/30 transition-colors hover:border-primary"
                  onClick={() => assetFileInputRef.current?.click()}
                  title="Agregar imagen desde tu equipo"
                >
                  <span className="material-symbols-outlined text-slate-400 transition-colors group-hover:text-primary">
                    add_a_photo
                  </span>
                </button>
                {galleryDisplayUrls.map((url, index) => (
                  <button
                    key={`${url.slice(0, 80)}-${index}`}
                    type="button"
                    title="Quitar imagen"
                    aria-label="Quitar imagen de la galería"
                    className="group relative aspect-square overflow-hidden rounded-xl border-0 p-0 text-left outline-none ring-primary/40 focus-visible:ring-2"
                    onClick={() => removeGalleryImageAt(index)}
                  >
                    <img
                      alt=""
                      className="pointer-events-none h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                      src={url}
                    />
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-black/55 via-black/10 to-transparent pb-3 opacity-90 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100">
                      <span className="material-symbols-outlined text-2xl text-white drop-shadow">
                        delete
                      </span>
                      <span className="mt-0.5 text-[11px] font-medium text-white/95 drop-shadow">
                        Tocá para quitar
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <StepNav
              showBack
              onBack={goToPreviousStep}
              isLastSlide
              saving={saving}
              loading={loading}
            />
          </div>
        </div>
      </div>

      <p className="sr-only" aria-live="polite">
        {saving ? "Guardando…" : ""}
      </p>

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[100] max-w-md rounded-2xl bg-on-surface px-5 py-4 text-sm font-medium text-white shadow-2xl"
        >
          {toast}
        </div>
      )}
    </form>
  );
}

function StepNav({
  showBack,
  onNext,
  onBack,
  nextLabel = "Continuar",
  isLastSlide = false,
  saving = false,
  loading = false,
}: {
  showBack: boolean;
  onBack: () => void;
  onNext?: () => void;
  nextLabel?: string;
  isLastSlide?: boolean;
  saving?: boolean;
  loading?: boolean;
}) {
  if (isLastSlide) {
    return (
      <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
        {showBack ? (
          <button
            type="button"
            onClick={onBack}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl border border-outline-variant/40 px-6 py-3 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low disabled:opacity-50"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
            Atrás
          </button>
        ) : (
          <span />
        )}
        <div className="flex flex-wrap items-center gap-3 sm:ml-auto">
          <button
            type="submit"
            name="saveIntent"
            value="draft"
            disabled={saving || loading}
            className="rounded-xl bg-surface-container-high px-8 py-3 text-sm font-bold text-on-surface transition-all active:scale-95 disabled:opacity-50"
          >
            Guardar borrador
          </button>
          <button
            type="submit"
            name="saveIntent"
            value="save"
            disabled={saving || loading}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-95 disabled:opacity-50"
          >
            Guardar
            <span className="material-symbols-outlined text-sm">save</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
      {showBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 rounded-xl border border-outline-variant/40 px-6 py-3 text-sm font-bold text-on-surface-variant transition-colors hover:bg-surface-container-low"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Atrás
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        onClick={onNext}
        className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-8 py-3 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
      >
        {nextLabel}
        <span className="material-symbols-outlined text-sm">arrow_forward</span>
      </button>
    </div>
  );
}
