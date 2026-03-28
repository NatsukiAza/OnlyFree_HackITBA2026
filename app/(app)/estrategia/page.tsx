export default function EstrategiaPage() {
  return (
    <main className="ml-64 px-8 pb-12 pt-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-primary">
              Calendario Editorial
            </span>
            <h1 className="text-4xl font-extrabold tracking-tight text-on-surface">
              Estrategia de la semana: 03/02 - 09/02
            </h1>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              className="rounded-xl bg-surface-container-high px-5 py-2.5 text-sm font-semibold text-on-surface transition-all hover:bg-surface-container-highest"
            >
              Exportar PDF
            </button>
            <button
              type="button"
              className="rounded-xl bg-gradient-to-r from-primary to-primary-container px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-primary/10 transition-all active:scale-95"
            >
              Guardar Cambios
            </button>
          </div>
        </div>

        <div className="group relative mb-12">
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-primary/20 to-tertiary/20 opacity-25 blur transition duration-1000 group-hover:opacity-50" />
          <div className="relative flex flex-col items-center gap-4 rounded-2xl bg-surface-container-lowest p-6 shadow-sm md:flex-row">
            <div className="rounded-xl bg-primary-container/20 p-3 text-primary">
              <span className="material-symbols-outlined">smart_toy</span>
            </div>
            <div className="w-full flex-1">
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Modificar estrategia completa
              </label>
              <input
                className="w-full border-none bg-transparent p-0 text-lg font-medium text-on-surface placeholder:text-outline focus:ring-0"
                placeholder="Ej: Haz que el tono sea más sarcástico y enfócate en los beneficios de ahorro..."
                type="text"
                name="strategyPrompt"
              />
            </div>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-on-surface px-6 py-3 font-bold text-white transition-colors hover:bg-black md:w-auto"
            >
              Actualizar IA{" "}
              <span className="material-symbols-outlined text-sm">autorenew</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="group relative overflow-hidden rounded-[1.5rem] bg-surface-container-lowest p-8 transition-all hover:translate-y-[-4px]">
            <div className="absolute left-0 top-0 h-1 w-full bg-surface-container-low">
              <div className="h-full w-full bg-primary opacity-0 transition-opacity group-hover:opacity-10" />
            </div>
            <div className="flex flex-col items-start gap-8 md:flex-row">
              <div className="min-w-[80px] flex-shrink-0 text-center">
                <span className="block text-3xl font-black leading-none text-primary">
                  03
                </span>
                <span className="mt-1 block text-xs font-bold uppercase text-on-surface-variant">
                  LUNES
                </span>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-on-surface">
                    Día 1: Posteo Producto X
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="flex scale-100 cursor-default items-center gap-1 rounded-full bg-tertiary-container px-3 py-1 text-xs font-bold text-on-tertiary-container transition-transform hover:scale-105">
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        local_fire_department
                      </span>
                      Tendencia: Unboxing Aesthetic
                    </span>
                    <button
                      type="button"
                      className="p-2 text-outline transition-colors hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined">
                        more_horiz
                      </span>
                    </button>
                  </div>
                </div>
                <p className="font-medium leading-relaxed text-on-surface-variant">
                  &quot;Nadie te contó que el [Producto X] podía verse tan bien en
                  tu escritorio. ✨ El minimalismo no es solo un estilo, es una
                  forma de trabajar mejor. ¿Cuál es tu rincón favorito?&quot;
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <button
                    type="button"
                    className="group/btn flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-primary/5"
                  >
                    <span className="material-symbols-outlined text-lg text-primary">
                      content_copy
                    </span>
                    Copiar al portapapeles
                  </button>
                  <button
                    type="button"
                    className="group/btn flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-tertiary/5"
                  >
                    <span className="material-symbols-outlined text-lg text-tertiary">
                      edit_note
                    </span>
                    Editar con Prompt
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 pt-2">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input className="peer sr-only" type="checkbox" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-low transition-all peer-checked:bg-primary/10 peer-checked:ring-2 peer-checked:ring-primary">
                    <span
                      className="material-symbols-outlined text-transparent peer-checked:text-primary"
                      style={{ fontVariationSettings: "'wght' 700" }}
                    >
                      check
                    </span>
                  </div>
                </label>
                <span className="text-[10px] font-black uppercase tracking-tighter text-on-surface-variant">
                  Completado
                </span>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[1.5rem] bg-surface-container-lowest p-8 transition-all hover:translate-y-[-4px]">
            <div className="flex flex-col items-start gap-8 md:flex-row">
              <div className="min-w-[80px] flex-shrink-0 text-center">
                <span className="block text-3xl font-black leading-none text-on-surface-variant opacity-50">
                  04
                </span>
                <span className="mt-1 block text-xs font-bold uppercase text-on-surface-variant">
                  MARTES
                </span>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-on-surface">
                    Día 2: Reel Educativo - &quot;3 Tips para...&quot;
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="flex scale-100 cursor-default items-center gap-1 rounded-full bg-tertiary-container px-3 py-1 text-xs font-bold text-on-tertiary-container transition-transform hover:scale-105">
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        local_fire_department
                      </span>
                      Tendencia: Voiceover AI
                    </span>
                    <button
                      type="button"
                      className="p-2 text-outline transition-colors hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined">
                        more_horiz
                      </span>
                    </button>
                  </div>
                </div>
                <p className="font-medium leading-relaxed text-on-surface-variant">
                  Reel caption: &quot;Si sigues haciendo [Error Común], estás
                  perdiendo tiempo. Aquí te enseño cómo resolverlo en 3 pasos
                  rápidos usando nuestra nueva herramienta.&quot;
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <button
                    type="button"
                    className="group/btn flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-primary/5"
                  >
                    <span className="material-symbols-outlined text-lg text-primary">
                      content_copy
                    </span>
                    Copiar al portapapeles
                  </button>
                  <button
                    type="button"
                    className="group/btn flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-tertiary/5"
                  >
                    <span className="material-symbols-outlined text-lg text-tertiary">
                      edit_note
                    </span>
                    Editar con Prompt
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 pt-2">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input className="peer sr-only" type="checkbox" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-low transition-all peer-checked:bg-primary/10 peer-checked:ring-2 peer-checked:ring-primary">
                    <span className="material-symbols-outlined text-transparent transition-colors peer-checked:text-primary">
                      check
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          <div className="group relative overflow-hidden rounded-[1.5rem] bg-surface-container-lowest p-8 transition-all hover:translate-y-[-4px]">
            <div className="flex flex-col items-start gap-8 md:flex-row">
              <div className="min-w-[80px] flex-shrink-0 text-center">
                <span className="block text-3xl font-black leading-none text-on-surface-variant opacity-50">
                  05
                </span>
                <span className="mt-1 block text-xs font-bold uppercase text-on-surface-variant">
                  MIÉRCOLES
                </span>
              </div>
              <div className="flex-1 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-on-surface">
                    Día 3: Carrusel de Testimonios
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="flex scale-100 cursor-default items-center gap-1 rounded-full bg-tertiary-container px-3 py-1 text-xs font-bold text-on-tertiary-container transition-transform hover:scale-105">
                      <span
                        className="material-symbols-outlined text-sm"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        local_fire_department
                      </span>
                      Tendencia: Social Proof
                    </span>
                    <button
                      type="button"
                      className="p-2 text-outline transition-colors hover:text-on-surface"
                    >
                      <span className="material-symbols-outlined">
                        more_horiz
                      </span>
                    </button>
                  </div>
                </div>
                <p className="font-medium leading-relaxed text-on-surface-variant">
                  &quot;Lo que nuestros clientes dicen de nosotros es lo que nos
                  motiva. Desliza para ver cómo transformamos la operativa de
                  [Empresa Ejemplo] en solo 10 días.&quot;
                </p>
                <div className="flex flex-wrap gap-4 pt-4">
                  <button
                    type="button"
                    className="group/btn flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-primary/5"
                  >
                    <span className="material-symbols-outlined text-lg text-primary">
                      content_copy
                    </span>
                    Copiar al portapapeles
                  </button>
                  <button
                    type="button"
                    className="group/btn flex items-center gap-2 rounded-lg bg-surface-container-low px-4 py-2 text-sm font-bold text-on-surface transition-colors hover:bg-tertiary/5"
                  >
                    <span className="material-symbols-outlined text-lg text-tertiary">
                      edit_note
                    </span>
                    Editar con Prompt
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-center justify-center gap-3 pt-2">
                <label className="relative inline-flex cursor-pointer items-center">
                  <input className="peer sr-only" type="checkbox" />
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-container-low transition-all peer-checked:bg-primary/10 peer-checked:ring-2 peer-checked:ring-primary">
                    <span className="material-symbols-outlined text-transparent transition-colors peer-checked:text-primary">
                      check
                    </span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 text-center">
          <p className="mb-6 font-medium text-on-surface-variant">
            ¿Falta algo en tu semana? Crea un día adicional personalizado.
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-3 rounded-2xl border-2 border-dashed border-outline-variant bg-surface-container-low px-8 py-4 font-bold text-on-surface transition-all hover:border-primary hover:bg-white"
          >
            <span className="material-symbols-outlined">add_circle</span>
            Añadir día de contenido
          </button>
        </div>
      </div>

      <button
        type="button"
        className="fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-2xl bg-on-surface text-white shadow-2xl transition-all hover:scale-110 active:scale-95"
      >
        <span className="material-symbols-outlined">auto_awesome</span>
      </button>
    </main>
  );
}
