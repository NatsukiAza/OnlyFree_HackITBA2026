export default function ContenidoIAPage() {
  return (
    <main className="min-h-screen px-6 pb-12 pt-24 md:ml-64">
      <div className="mx-auto max-w-screen-2xl">
        <header className="mb-10 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="rounded-md bg-tertiary-container px-2 py-0.5 text-[10px] font-bold tracking-wider text-on-tertiary-container">
                PREMIUM TOOL
              </span>
              <h4 className="text-sm font-bold text-primary">Contenido IA</h4>
            </div>
            <h1 className="font-headline text-4xl font-extrabold tracking-tight text-on-background md:text-5xl">
              Galería Creativa
            </h1>
            <p className="mt-2 max-w-xl text-on-surface-variant">
              Tus piezas visuales generadas por IA listas para ser curadas,
              editadas y publicadas en tus canales.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex rounded-xl bg-surface-container-low p-1">
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-bold text-primary shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">
                  grid_view
                </span>{" "}
                Todos
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
              >
                Reels
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-on-surface-variant transition-colors hover:text-primary"
              >
                Posts
              </button>
            </div>
          </div>
        </header>

        <div className="masonry-grid">
          <div className="masonry-item group relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm transition-all duration-500 hover:shadow-xl">
            <div className="relative aspect-[9/16] overflow-hidden">
              <img
                alt="Modern workspace"
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNpIbdrbqAjDOhMElGdM-d0UokCiOOpHq6kDGBSqfGgryK4Hav3_Ptdr2c4gakABCIp9GtajivoNBWwxyCmctcE1TFU5LUzIJA73eQnBkvDQSGpc6QTBX6FwFN-dmo2yNNdkKmrsRGJnFMIEOpqMd-maws9cOqsLG3mOaBTbYtOU5R-vGex2_0dK3EvxGdMx2zvufG5RvS66Vp8qfoePb03m8pgEfWy0Go7W0GShlKSoTJZzR0y5-w69YZn69GYQ4gPSOJikITrT-4"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="absolute left-4 top-4 flex items-center gap-2">
                <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-on-background backdrop-blur-md">
                  Día 12
                </span>
                <span className="flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-[10px] font-bold text-white">
                  <span className="material-symbols-outlined text-[12px]">
                    play_circle
                  </span>{" "}
                  Reel
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex translate-y-2 items-center justify-center opacity-0 transition-opacity duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                <div className="flex w-full gap-2">
                  <button
                    type="button"
                    className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-white/90 py-2 text-xs font-bold text-on-background backdrop-blur-md transition-colors hover:bg-white"
                  >
                    <span className="material-symbols-outlined text-sm">
                      download
                    </span>{" "}
                    Descargar
                  </button>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/30"
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20 text-white backdrop-blur-md transition-colors hover:bg-white/30"
                  >
                    <span className="material-symbols-outlined">refresh</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="masonry-item group relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm transition-all duration-500 hover:shadow-xl">
            <div className="relative aspect-square overflow-hidden">
              <img
                alt="Strategy brainstorming"
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuClfM3hkRsa7tXvsVHQpw6dHJl3Nghw7xotd51gFllCW-HZOtMDmSMiGDPijGKmu2ukzINtFRMOVthXrpdJKMH3fXuEAmxp0cePyA8tPifxQefVvib4mDbDBsJRvLmvPceBFhiPfsvzxddV9tnhzvLTZl1ceQcGr18BEdYAFG-yp_5q50GY2ytBbpXc1iDeMvEipRyuU5o5Jx8FDxlf3eYmwAGF1QH1To81E59OnR_M6SXge3v9MauHXNwxx9O47XJgHWLdPc1s5jwK"
              />
              <div className="absolute left-4 top-4">
                <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-on-background backdrop-blur-md">
                  Día 08
                </span>
              </div>
              <div className="absolute inset-x-0 bottom-0 translate-y-full bg-white/95 p-4 backdrop-blur-sm transition-transform duration-300 group-hover:translate-y-0">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-bold text-on-background">
                    Post: Estrategia Mensual
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className="flex-1 rounded-lg bg-primary py-2 text-xs font-bold text-on-primary shadow-sm transition-all active:scale-95"
                  >
                    Editar
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-surface-container-low px-3 text-on-surface-variant transition-colors hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-sm">
                      refresh
                    </span>
                  </button>
                  <button
                    type="button"
                    className="rounded-lg bg-surface-container-low px-3 text-on-surface-variant transition-colors hover:text-primary"
                  >
                    <span className="material-symbols-outlined text-sm">
                      download
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="masonry-item overflow-hidden rounded-xl bg-surface-container-low p-1">
            <div className="relative flex aspect-[3/4] flex-col items-center justify-center gap-4 rounded-lg skeleton-shimmer">
              <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full bg-white/40">
                <span
                  className="material-symbols-outlined text-primary"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  auto_awesome
                </span>
              </div>
              <div className="text-center">
                <p className="text-xs font-bold text-on-surface-variant">
                  Generating magic...
                </p>
                <p className="mt-1 text-[10px] text-outline">
                  Día 15: Content Batch
                </p>
              </div>
            </div>
          </div>

          <div className="masonry-item group relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm transition-all duration-500 hover:shadow-xl">
            <div className="relative aspect-[4/5] overflow-hidden">
              <img
                alt="Editorial lifestyle"
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuC0vgYSYwTwrPIEC4jdt3G60wKuP8mLCn8KzYmKkUzQjW1VJ0yfmuRvw09d1Nhxfi5kUhzbQYK78lhpE2DHeOTIS3AB5gmdsDsHcgHlMsPLybKwt6qLhP8y-rCQYpv7OV3CQFtvoTrxIE56BfEmLPAjvOPGTRWaJWcKysqLjhofc2e71D7WL3f6PY3aHY4nPw6TaHvy45r5_CFsWSlai3PEUSkwI454KuOfZ3JfVEBdBNFrGnhYbyPo50eSdUPcTpRtGS1IwcNYNrTM"
              />
              <div className="absolute left-4 top-4">
                <span className="rounded-full bg-white/90 px-3 py-1 text-[10px] font-bold text-on-background backdrop-blur-md">
                  Día 10
                </span>
              </div>
              <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="absolute right-4 top-4">
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-error transition-colors hover:bg-white"
                  >
                    <span
                      className="material-symbols-outlined text-sm"
                      style={{ fontVariationSettings: "'FILL' 1" }}
                    >
                      favorite
                    </span>
                  </button>
                </div>
              </div>
              <div className="absolute inset-x-4 bottom-4 flex translate-y-12 gap-2 transition-transform duration-300 group-hover:translate-y-0">
                <button
                  type="button"
                  className="flex-1 rounded-lg bg-white py-2 text-xs font-bold text-on-background shadow-lg transition-colors hover:bg-slate-50"
                >
                  Descargar
                </button>
                <button
                  type="button"
                  className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-lg transition-colors hover:bg-indigo-700"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                </button>
              </div>
            </div>
          </div>

          <div className="masonry-item group relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-sm transition-all duration-500 hover:shadow-xl">
            <div className="relative aspect-video overflow-hidden">
              <img
                alt="Modern office"
                className="h-full w-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDhCso1eRiOsJjIJ-MpH3nlLYSXt9KkFv1k-WVA6yK8Fvxu-j-APlRp4cGWSN0MuDFRLWy2uvsAirCsCbWAzYXpCoCVxQ69x4dFDRRwgJ6zyK62K7g5No3Bizz64g4ik-Ti28i_BDkZTl1I3Biw9jIu5HW-kg2WRoKzJ0eamqj5ydX5_RbCyGStqLJLg_-jLNDEui3EwgG3i-FYESy4OcByd6EftrjIZZu3HgZYB3ogqblViyu0YB8kqjsdwZpgdNnMQeeGbpeyubv0"
              />
              <div className="absolute left-3 top-3">
                <span className="rounded-full bg-white/90 px-2 py-0.5 text-[9px] font-bold text-on-background backdrop-blur-md">
                  Día 05
                </span>
              </div>
            </div>
            <div className="bg-white p-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-tighter text-primary">
                  Banner Facebook
                </span>
                <span
                  className="material-symbols-outlined text-sm text-slate-300"
                  style={{ fontVariationSettings: "'FILL' 1" }}
                >
                  check_circle
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="group fixed bottom-8 right-8 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-on-primary shadow-2xl transition-transform active:scale-95"
      >
        <span className="material-symbols-outlined text-2xl transition-transform group-hover:rotate-90">
          add
        </span>
      </button>
    </main>
  );
}
