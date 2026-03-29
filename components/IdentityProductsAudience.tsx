"use client";

import type {
  BusinessContextRow,
  SocialObjective,
  TargetGender,
} from "@/lib/database";

const ADN_BRAND_OPTIONS = [
  "Moderno",
  "Tradicional",
  "Eco-friendly",
  "Económico",
  "Premium",
  "Divertido",
  "Minimalista",
] as const;

export type IdentityExtendedState = {
  whatYouSell: string;
  starProduct: string;
  premiumProduct: string;
  brandTraits: string[];
  uniqueDifferential: string;
  /** Al menos un género. */
  genderTargets: TargetGender[];
  ageMin: number;
  ageMax: number;
  geographicProximity: boolean;
  socialObjective: SocialObjective;
};

export const IDENTITY_EXTENDED_DEFAULT: IdentityExtendedState = {
  whatYouSell: "",
  starProduct: "",
  premiumProduct: "",
  brandTraits: [],
  uniqueDifferential: "",
  genderTargets: ["mujer"],
  ageMin: 25,
  ageMax: 45,
  geographicProximity: false,
  socialObjective: "vender",
};

type PanelProps = {
  values: IdentityExtendedState;
  onChange: (next: IdentityExtendedState) => void;
  disabled?: boolean;
};

const inputClass =
  "w-full rounded-xl border-0 bg-surface-container-low px-4 py-3 text-sm text-on-background ring-1 ring-outline-variant/30 outline-none transition-all focus:ring-2 focus:ring-primary-container/40";

const labelClass =
  "mb-2 block text-xs font-bold uppercase tracking-wider text-on-surface-variant";

/** Panel carrusel: productos y diferencial (sin público objetivo). */
export function IdentityProductsDifferential({
  values,
  onChange,
  disabled,
}: PanelProps) {
  const patch = (partial: Partial<IdentityExtendedState>) =>
    onChange({ ...values, ...partial });

  const toggleTrait = (trait: string) => {
    const set = new Set(values.brandTraits);
    if (set.has(trait)) set.delete(trait);
    else set.add(trait);
    patch({ brandTraits: Array.from(set) });
  };

  return (
    <section className="grid grid-cols-1 gap-8 md:grid-cols-12">
      <div className="space-y-4 md:col-span-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-on-background">
          <span className="material-symbols-outlined text-primary">
            inventory_2
          </span>
          Productos y Diferencial
        </h2>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          Lo que ofreces al mundo y por qué deberían elegirte a vos sobre la
          competencia.
        </p>
      </div>
      <div className="space-y-8 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-sm md:col-span-8">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className={labelClass} htmlFor="whatYouSell">
              ¿Qué vendés?
            </label>
            <input
              id="whatYouSell"
              name="whatYouSell"
              type="text"
              className={inputClass}
              placeholder="Ej: Velas de soja aromáticas artesanales"
              value={values.whatYouSell}
              onChange={(e) => patch({ whatYouSell: e.target.value })}
              disabled={disabled}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="starProduct">
              Producto/Servicio Estrella
            </label>
            <input
              id="starProduct"
              name="starProduct"
              type="text"
              className={inputClass}
              placeholder="Lo más pedido"
              value={values.starProduct}
              onChange={(e) => patch({ starProduct: e.target.value })}
              disabled={disabled}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="premiumProduct">
              Producto más caro / Premium
            </label>
            <input
              id="premiumProduct"
              name="premiumProduct"
              type="text"
              className={inputClass}
              placeholder="Tu tope de gama"
              value={values.premiumProduct}
              onChange={(e) => patch({ premiumProduct: e.target.value })}
              disabled={disabled}
            />
          </div>
        </div>
        <div>
          <p className={`${labelClass} mb-4`}>ADN de Marca (Personalidad)</p>
          <div className="flex flex-wrap gap-2">
            {ADN_BRAND_OPTIONS.map((trait) => {
              const selected = values.brandTraits.includes(trait);
              return (
                <button
                  key={trait}
                  type="button"
                  disabled={disabled}
                  onClick={() => toggleTrait(trait)}
                  className={
                    selected
                      ? "rounded-full border-2 border-primary bg-primary/10 px-4 py-2 text-xs font-bold text-primary transition-colors"
                      : "rounded-full border border-outline-variant/40 px-4 py-2 text-xs font-bold text-on-background transition-colors hover:bg-surface-container-low"
                  }
                >
                  {trait}
                </button>
              );
            })}
          </div>
        </div>
        <div>
          <label className={labelClass} htmlFor="uniqueDifferential">
            Tu Diferencial Único
          </label>
          <textarea
            id="uniqueDifferential"
            name="uniqueDifferential"
            className={`${inputClass} resize-none`}
            placeholder="¿Por qué te eligen? (ej: Envíos en 2hs, insumos orgánicos, diseño exclusivo...)"
            rows={3}
            value={values.uniqueDifferential}
            onChange={(e) => patch({ uniqueDifferential: e.target.value })}
            disabled={disabled}
          />
        </div>
      </div>
    </section>
  );
}

const GENDER_OPTIONS = ["hombre", "mujer", "otro"] as const satisfies readonly TargetGender[];

function normalizeGenderTargets(raw: unknown): TargetGender[] {
  const allowed = new Set<TargetGender>(GENDER_OPTIONS);
  if (Array.isArray(raw)) {
    const next = [
      ...new Set(
        raw.filter(
          (g): g is TargetGender =>
            typeof g === "string" && allowed.has(g as TargetGender),
        ),
      ),
    ];
    return next.length > 0 ? next : ["mujer"];
  }
  if (typeof raw === "string" && allowed.has(raw as TargetGender)) {
    return [raw as TargetGender];
  }
  return ["mujer"];
}

/** Panel carrusel: público objetivo (slide separado). */
export function IdentityTargetAudience({
  values,
  onChange,
  disabled,
}: PanelProps) {
  const patch = (partial: Partial<IdentityExtendedState>) =>
    onChange({ ...values, ...partial });

  const toggleGender = (id: TargetGender) => {
    const set = new Set(values.genderTargets);
    if (set.has(id)) {
      if (set.size <= 1) return;
      set.delete(id);
    } else {
      set.add(id);
    }
    patch({ genderTargets: Array.from(set) as TargetGender[] });
  };

  const ageCenterLabel = Math.round((values.ageMin + values.ageMax) / 2);

  return (
    <section className="grid grid-cols-1 gap-8 md:grid-cols-12">
      <div className="space-y-4 md:col-span-4">
        <h2 className="flex items-center gap-2 text-2xl font-bold text-on-background">
          <span className="material-symbols-outlined text-primary">groups</span>
          Público Objetivo
        </h2>
        <p className="text-sm leading-relaxed text-on-surface-variant">
          ¿Quién es tu cliente ideal? Definir esto ayuda a la IA a elegir las
          palabras y canales adecuados.
        </p>
      </div>
      <div className="space-y-10 rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-8 shadow-sm md:col-span-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="md:col-span-2">
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Género (elegí uno o más)
            </p>
            <div className="flex flex-wrap gap-2">
              {GENDER_OPTIONS.map((id) => {
                const selected = values.genderTargets.includes(id);
                return (
                  <button
                    key={id}
                    type="button"
                    disabled={disabled}
                    onClick={() => toggleGender(id)}
                    className={
                      selected
                        ? "rounded-full border-2 border-primary bg-primary/10 px-4 py-2.5 text-sm font-bold text-primary transition-colors"
                        : "rounded-full border border-outline-variant/40 px-4 py-2.5 text-sm font-bold text-on-background transition-colors hover:bg-surface-container-low"
                    }
                  >
                    {id === "hombre"
                      ? "Hombre"
                      : id === "mujer"
                        ? "Mujer"
                        : "Otro"}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-xs text-on-surface-variant">
              Al menos tenés que dejar uno seleccionado.
            </p>
          </div>
          <div className="md:col-span-2">
            <p className="mb-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Rango de edades
            </p>
            <div className="space-y-5 px-2 pt-1">
              <div>
                <div className="mb-2 flex justify-between text-xs font-semibold text-on-surface">
                  <span>Desde</span>
                  <span className="text-primary">{values.ageMin} años</span>
                </div>
                <input
                  className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-surface-container-high accent-primary"
                  type="range"
                  min={13}
                  max={values.ageMax}
                  value={values.ageMin}
                  onChange={(e) => {
                    const v = Number(e.target.value) || 13;
                    patch({ ageMin: v });
                  }}
                  disabled={disabled}
                  name="ageMin"
                  aria-label="Edad mínima del público objetivo"
                />
              </div>
              <div>
                <div className="mb-2 flex justify-between text-xs font-semibold text-on-surface">
                  <span>Hasta</span>
                  <span className="text-primary">{values.ageMax} años</span>
                </div>
                <input
                  className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-surface-container-high accent-primary"
                  type="range"
                  min={values.ageMin}
                  max={100}
                  value={values.ageMax}
                  onChange={(e) => {
                    const v = Number(e.target.value) || 100;
                    patch({ ageMax: v });
                  }}
                  disabled={disabled}
                  name="ageMax"
                  aria-label="Edad máxima del público objetivo"
                />
              </div>
              <div className="flex flex-wrap items-center justify-center gap-2 rounded-xl bg-primary/5 px-3 py-2 text-center text-sm">
                <span className="font-bold text-primary">
                  {values.ageMin} – {values.ageMax} años
                </span>
                <span className="text-on-surface-variant">·</span>
                <span className="text-on-surface-variant">
                  Centro del rango:{" "}
                  <span className="font-semibold text-on-surface">
                    {ageCenterLabel} años
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-outline-variant/20 bg-surface-container-low p-4">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-on-surface-variant">
              location_on
            </span>
            <div>
              <p className="text-sm font-bold text-on-background">
                Ubicación Geográfica
              </p>
              <p className="text-xs text-on-surface-variant">
                ¿Debe vivir cerca de tu negocio físico?
              </p>
            </div>
          </div>
          <label className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center">
            <input
              type="checkbox"
              className="peer sr-only"
              checked={values.geographicProximity}
              onChange={(e) =>
                patch({ geographicProximity: e.target.checked })
              }
              disabled={disabled}
            />
            <span
              className="pointer-events-none h-6 w-11 rounded-full bg-surface-container-high transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary-container/40"
              aria-hidden
            />
            <span className="pointer-events-none absolute start-[2px] top-[2px] h-5 w-5 rounded-full border border-outline-variant/30 bg-white shadow transition-transform peer-checked:translate-x-5 rtl:peer-checked:-translate-x-5" />
          </label>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            Objetivo General en Redes
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            {(
              [
                {
                  id: "conocer" as const,
                  title: "Hacerse conocer",
                  desc: "Aumentar el alcance y branding",
                },
                {
                  id: "vender" as const,
                  title: "Vender más",
                  desc: "Conversión directa a ventas",
                },
                {
                  id: "comunidad" as const,
                  title: "Generar comunidad",
                  desc: "Interacción y engagement diario",
                },
                {
                  id: "fidelizar" as const,
                  title: "Fidelizar clientes",
                  desc: "Servicio post-venta y recompras",
                },
              ] as const
            ).map(({ id, title, desc }) => {
              const selected = values.socialObjective === id;
              return (
                <button
                  key={id}
                  type="button"
                  disabled={disabled}
                  onClick={() => patch({ socialObjective: id })}
                  className={
                    selected
                      ? "rounded-xl border-2 border-primary bg-primary/5 p-4 text-left transition-all"
                      : "group rounded-xl border border-outline-variant/40 p-4 text-left transition-all hover:border-primary"
                  }
                >
                  <p
                    className={
                      selected
                        ? "mb-1 text-sm font-bold text-primary"
                        : "mb-1 text-sm font-bold text-on-background group-hover:text-primary"
                    }
                  >
                    {title}
                  </p>
                  <p
                    className={
                      selected
                        ? "text-[10px] text-primary/80"
                        : "text-[10px] text-on-surface-variant"
                    }
                  >
                    {desc}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

export function validateIdentityProducts(
  v: IdentityExtendedState,
): string | null {
  if (!v.whatYouSell.trim()) {
    return "Contanos qué vendés para continuar.";
  }
  if (!v.uniqueDifferential.trim()) {
    return "Completá tu diferencial único para continuar.";
  }
  if (v.brandTraits.length === 0) {
    return "Elegí al menos un rasgo de ADN de marca.";
  }
  return null;
}

export function validateIdentityAudience(
  v: IdentityExtendedState,
): string | null {
  if (v.genderTargets.length === 0) {
    return "Elegí al menos un género en público objetivo.";
  }
  if (v.ageMin > v.ageMax) {
    return "Ajustá el rango de edades (desde no puede ser mayor que hasta).";
  }
  if (v.ageMin < 13 || v.ageMax > 100) {
    return "El rango de edades debe estar entre 13 y 100 años.";
  }
  return null;
}

export function identityExtendedFromRow(
  row: BusinessContextRow,
): IdentityExtendedState {
  return {
    whatYouSell: row.what_you_sell ?? "",
    starProduct: row.star_product ?? "",
    premiumProduct: row.premium_product ?? "",
    brandTraits:
      Array.isArray(row.brand_traits) && row.brand_traits.length > 0
        ? row.brand_traits
        : [],
    uniqueDifferential: row.unique_differential ?? "",
    genderTargets: normalizeGenderTargets(row.target_genders),
    ageMin: row.target_age_min ?? 25,
    ageMax: row.target_age_max ?? 45,
    geographicProximity: row.geographic_proximity ?? false,
    socialObjective: row.social_objective ?? "vender",
  };
}

/** Campos snake_case para upsert en `business_context`. */
export function identityFieldsForUpsert(v: IdentityExtendedState) {
  return {
    what_you_sell: v.whatYouSell.trim() || null,
    star_product: v.starProduct.trim() || null,
    premium_product: v.premiumProduct.trim() || null,
    brand_traits: v.brandTraits,
    unique_differential: v.uniqueDifferential.trim() || null,
    target_genders: [...new Set(v.genderTargets)] as TargetGender[],
    target_age_min: v.ageMin,
    target_age_max: v.ageMax,
    geographic_proximity: v.geographicProximity,
    social_objective: v.socialObjective,
  };
}
