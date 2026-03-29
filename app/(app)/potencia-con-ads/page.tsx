export default function PotenciaConAdsPage() {
  return (
    <main className="min-h-screen px-8 pb-12 pt-24">
      <div className="mx-auto max-w-[1600px]">
        <div className="flex flex-col gap-8 lg:flex-row">
          <section className="flex flex-1 flex-col gap-6">
            <div className="flex min-h-[600px] flex-col rounded-[2rem] bg-surface-container-low p-8">
              <div className="mb-8 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary text-white">
                  <span
                    className="material-symbols-outlined"
                    style={{ fontVariationSettings: "'FILL' 1" }}
                  >
                    smart_toy
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-on-background">
                    Tu Asistente de Ads
                  </h3>
                  <p className="text-sm font-medium text-on-surface-variant">
                    Guía experta sin complicaciones
                  </p>
                </div>
              </div>
              <div className="mb-8 flex-1 space-y-6 overflow-y-auto pr-2">
                <div className="flex max-w-[85%] gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <span className="material-symbols-outlined text-sm text-primary">
                      auto_awesome
                    </span>
                  </div>
                  <div className="rounded-2xl rounded-tl-none bg-surface-container-lowest p-5 shadow-sm">
                    <p className="leading-relaxed text-on-background">
                      ¡Hola! Soy tu guía para hacer crecer tu negocio. He
                      analizado tus publicaciones recientes y veo que tus fotos
                      de productos de verano están gustando mucho. ¿Te gustaría
                      que las mostremos a más personas con una campaña sencilla?
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <button
                    type="button"
                    className="rounded-full bg-surface-container-highest/50 px-5 py-3 text-sm font-medium text-on-surface-variant transition-all hover:bg-surface-container-highest active:scale-95"
                  >
                    ¿Cómo configuro mi primera campaña?
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-surface-container-highest/50 px-5 py-3 text-sm font-medium text-on-surface-variant transition-all hover:bg-surface-container-highest active:scale-95"
                  >
                    ¿Cuánto presupuesto necesito?
                  </button>
                  <button
                    type="button"
                    className="rounded-full bg-surface-container-highest/50 px-5 py-3 text-sm font-medium text-on-surface-variant transition-all hover:bg-surface-container-highest active:scale-95"
                  >
                    ¿A quién debería mostrarle mis anuncios?
                  </button>
                </div>
              </div>
              <div className="group relative">
                <input
                  className="w-full rounded-2xl border-none bg-surface-container-lowest py-5 pl-6 pr-14 text-on-background shadow-sm placeholder:text-outline transition-all focus:ring-2 focus:ring-primary-container/40"
                  placeholder="Escribe tu duda aquí..."
                  type="text"
                  name="adsChat"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-xl bg-primary text-white transition-all hover:scale-105 active:scale-95"
                >
                  <span className="material-symbols-outlined">send</span>
                </button>
              </div>
            </div>
          </section>

          <aside className="flex w-full flex-col gap-6 lg:w-[420px]">
            <div className="rounded-[2rem] bg-surface-container-lowest p-8 shadow-sm">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-lg font-bold text-on-background">
                  Tu Rendimiento
                </h3>
                <span className="rounded-full bg-secondary-container px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-on-secondary-container">
                  En Vivo
                </span>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div className="group relative flex flex-col gap-1 overflow-hidden rounded-2xl bg-surface-container-low p-6">
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-primary/5 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Inversión Actual
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-on-background">
                      $45.00
                    </span>
                    <span className="flex items-center gap-0.5 text-xs font-bold text-secondary">
                      <span className="material-symbols-outlined text-xs">
                        trending_up
                      </span>
                      Estable
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] italic text-on-surface-variant">
                    &quot;Lo que has invertido hoy&quot;
                  </p>
                </div>
                <div className="group relative flex flex-col gap-1 overflow-hidden rounded-2xl bg-surface-container-low p-6">
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-tertiary-container/10 transition-transform group-hover:scale-110" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                    Interés Generado
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold text-on-background">
                      1,240
                    </span>
                    <span className="flex items-center gap-0.5 text-xs font-bold text-secondary">
                      <span className="material-symbols-outlined text-xs">
                        trending_up
                      </span>
                      +12%
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] italic text-on-surface-variant">
                    &quot;Personas que tocaron tu anuncio&quot;
                  </p>
                </div>
                <div className="group relative flex flex-col gap-1 overflow-hidden rounded-2xl bg-primary p-6 text-white shadow-lg shadow-primary/20">
                  <div className="absolute -bottom-16 -right-16 h-32 w-32 rounded-full bg-white/10" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-primary-fixed">
                    Nuevos Clientes
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold">28</span>
                    <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
                      Meta: 50
                    </span>
                  </div>
                  <p className="mt-2 text-[11px] italic text-primary-fixed">
                    &quot;Ventas realizadas gracias al anuncio&quot;
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] bg-surface-container-low/50 p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="material-symbols-outlined text-tertiary">
                  menu_book
                </span>
                <h3 className="text-lg font-bold text-on-background">
                  Glosario Humano
                </h3>
              </div>
              <ul className="space-y-5">
                <li>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded bg-surface-container-high px-2 py-0.5 text-xs font-bold text-on-background">
                      CTR
                    </span>
                    <span className="material-symbols-outlined text-sm text-outline">
                      arrow_forward
                    </span>
                    <span className="text-sm font-medium text-on-surface-variant">
                      Efectividad de clics
                    </span>
                  </div>
                  <p className="text-xs text-outline">
                    De cada 100 personas que vieron tu anuncio, cuántas hicieron
                    clic.
                  </p>
                </li>
                <li>
                  <div className="mb-1 flex items-center gap-2">
                    <span className="rounded bg-surface-container-high px-2 py-0.5 text-xs font-bold text-on-background">
                      CPC
                    </span>
                    <span className="material-symbols-outlined text-sm text-outline">
                      arrow_forward
                    </span>
                    <span className="text-sm font-medium text-on-surface-variant">
                      Costo por clic
                    </span>
                  </div>
                  <p className="text-xs text-outline">
                    Cuánto pagás en promedio cada vez que alguien toca tu
                    anuncio.
                  </p>
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
