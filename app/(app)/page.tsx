export default function MiNegocioPage() {
  return (
    <main className="mx-auto ml-64 max-w-5xl flex-1 p-8">
      <div className="mb-12">
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight text-on-background">
          Onboarding Inteligente
        </h1>
        <p className="max-w-2xl text-lg text-on-surface-variant">
          Configura tu ecosistema en pocos pasos. Nuestra IA usará estos datos
          para curar una estrategia editorial única para tu marca.
        </p>
      </div>

      <div className="mb-12 flex items-center justify-between px-4">
        <div className="relative flex items-center gap-4">
          <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-primary font-bold text-white shadow-lg shadow-primary/20">
            1
          </div>
          <span className="font-bold text-on-background">Identidad</span>
          <div className="absolute left-10 top-5 -z-0 h-[2px] w-24 bg-primary" />
        </div>
        <div className="relative flex items-center gap-4">
          <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high font-bold text-on-surface-variant">
            2
          </div>
          <span className="font-medium text-on-surface-variant">Conectividad</span>
          <div className="absolute left-10 top-5 -z-0 h-[2px] w-24 bg-surface-container-high" />
        </div>
        <div className="flex items-center gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-high font-bold text-on-surface-variant">
            3
          </div>
          <span className="font-medium text-on-surface-variant">
            Activos & Meta
          </span>
        </div>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="rounded-xl bg-surface-container-lowest p-8 shadow-sm md:col-span-7">
          <div className="mb-6 flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">badge</span>
            <h2 className="text-xl font-bold">Identidad de Marca</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Nombre del Negocio
              </label>
              <input
                className="w-full rounded-lg border-0 bg-surface-container-lowest px-4 py-3 ring-1 ring-outline-variant/30 transition-all outline-none focus:ring-2 focus:ring-primary-container/40"
                placeholder="Ej: Velas Áurea"
                type="text"
                name="businessName"
              />
            </div>
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Descripción Estratégica
              </label>
              <div className="relative">
                <textarea
                  className="w-full resize-none rounded-lg border-0 bg-surface-container-lowest px-4 py-3 ring-1 ring-outline-variant/30 transition-all outline-none focus:ring-2 focus:ring-primary-container/40"
                  placeholder="Cuéntanos la esencia de tu marca, a quién ayudas y qué te diferencia..."
                  rows={4}
                  name="description"
                />
                <div className="absolute bottom-3 right-3 text-[10px] font-medium text-slate-400">
                  0 / 250
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
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border-2 border-primary bg-white px-5 py-3 font-medium text-on-background shadow-sm transition-all hover:shadow-md"
            >
              <span
                className="material-symbols-outlined text-sm text-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                restaurant
              </span>
              Gastronomía
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-white/50 px-5 py-3 font-medium text-on-surface-variant transition-all hover:bg-white"
            >
              <span className="material-symbols-outlined text-sm">devices</span>
              Tecnología
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-white/50 px-5 py-3 font-medium text-on-surface-variant transition-all hover:bg-white"
            >
              <span className="material-symbols-outlined text-sm">apparel</span>
              Moda
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-white/50 px-5 py-3 font-medium text-on-surface-variant transition-all hover:bg-white"
            >
              <span className="material-symbols-outlined text-sm">
                home_repair_service
              </span>
              Servicios
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-white/50 px-5 py-3 font-medium text-on-surface-variant transition-all hover:bg-white"
            >
              <span className="material-symbols-outlined text-sm">
                auto_stories
              </span>
              Educación
            </button>
            <button
              type="button"
              className="flex items-center gap-2 rounded-xl bg-white/50 px-5 py-3 font-medium text-on-surface-variant transition-all hover:bg-white"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              Otro
            </button>
          </div>
          <div className="mt-auto pt-6">
            <p className="text-xs italic text-on-surface-variant">
              Tip: El sector ayuda a la IA a sugerir paletas de colores y tono
              de voz adecuados.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-8 overflow-hidden rounded-2xl bg-surface-container-lowest shadow-sm">
        <div className="p-8">
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">hub</span>
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
            </div>
            <div className="group relative md:col-span-2">
              <div className="flex h-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-outline-variant/40 p-8 transition-all hover:border-primary-container hover:bg-primary-container/5">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-container-high transition-transform group-hover:scale-110">
                  <span className="material-symbols-outlined text-slate-500 group-hover:text-primary">
                    upload_file
                  </span>
                </div>
                <p className="mb-1 font-bold text-on-background">
                  Cargar inventario en Excel
                </p>
                <p className="text-center text-sm text-on-surface-variant">
                  Si no tienes tienda online, arrastra tu lista de productos
                  aquí para analizarlos.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="relative flex flex-col justify-between overflow-hidden rounded-2xl bg-primary p-8 text-on-primary md:col-span-4">
          <div className="relative z-10">
            <h3 className="mb-6 text-xl font-bold">Disponibilidad</h3>
            <p className="mb-8 text-sm leading-relaxed opacity-80">
              ¿Cuántos días a la semana podés dedicarle al marketing?
            </p>
            <div className="space-y-6">
              <input
                className="h-1 w-full cursor-pointer appearance-none rounded-lg bg-white/30"
                max={7}
                min={1}
                type="range"
                defaultValue={3}
                name="availabilityDays"
              />
              <div className="flex items-end justify-between">
                <div className="text-center">
                  <span className="block text-3xl font-black">3</span>
                  <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                    Días
                  </span>
                </div>
                <div className="text-right">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
                    Plan Moderado
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="absolute -bottom-10 -right-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        </div>

        <div className="rounded-2xl border border-white/40 bg-surface-container-lowest p-8 shadow-sm md:col-span-8">
          <div className="mb-6 flex items-center justify-between">
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
          <div className="grid grid-cols-4 gap-4">
            <div className="group flex aspect-square cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-outline-variant/30 transition-colors hover:border-primary">
              <span className="material-symbols-outlined text-slate-400 transition-colors group-hover:text-primary">
                add_a_photo
              </span>
            </div>
            <div className="group relative aspect-square overflow-hidden rounded-xl">
              <img
                alt=""
                className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuArI73gA8cMjcUSSYBfqi75jtNBvE_7U5W7O7okEuOA7otkD9yxbxSO2H7HoX5UM5k07_N8rLHGXvIS2js5F-rpGNdWVQuoTN3shYYF_rTXnUYOGFoOJFwQd1uWEWs-bQsbL50BHk_TbKfbs4rUqmyaVatAmAv1J1zvAt1MTxHcmNseBDWKr325DN3M7W23NWMdFnIWMKAVR_sMVd_bliiq0MXsBxnY-QLI4CUZ7lDJKKnqRUswVvkgvzc45ERyOlnjP_s_lM7G6xua"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-primary/20 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="material-symbols-outlined text-white">
                  check_circle
                </span>
              </div>
            </div>
            <div className="group relative aspect-square overflow-hidden rounded-xl">
              <img
                alt=""
                className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU8XF3zRehXD6Ojd1o-zElz-VrwKEvWUucymkEQGoqzxNQ7rbKeGJCpgs3rweYaBY-d8YERctCaePn57RlYHQJEzpnh4kNAFcJ0ZVBelhN_vAl-9GIPa71fNw5kLKR_oMDg34ziDnrXXNGChy6mKN-LW-JIp3PRZlOI1yyghakwTc6f_iyD7ZxohzFbeh8sGsS9wtVWhuPfMk7f39UlPVH5uGHo3ERK-daVtkRl0PKt91Rbd3ulzkkhhtuxckS5GRo1ysytWX_p1Rs"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-primary/20 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="material-symbols-outlined text-white">
                  check_circle
                </span>
              </div>
            </div>
            <div className="group relative aspect-square overflow-hidden rounded-xl">
              <img
                alt=""
                className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCSZnoz2oqx3gc7K-z9V8xeqNvVC28kQ_idt-anzjrzhPA0QZ9Y1QeX4MadDZAARWcbh2QFgIWcbqK3WkdsOiUdaQICEWTsZgh05muP2jjSxv85bas-vhuEo2lSIo8a6Soym_4YxEbWBrYJEILtH4fOMcCR2QVw_WDLGG5UnO2eDBaIwgL6rinWmUmx6aApPOkVjzn8Ex5BW4KuIncri_jfpZ4IZkMmrzjGqyrq6Z8k8VG9xQRi4igsBK7eJmkDaLu78XKp9k0mcctA"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-primary/20 opacity-0 transition-opacity group-hover:opacity-100">
                <span className="material-symbols-outlined text-white">
                  check_circle
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-surface-container-high pt-8">
        <button
          type="button"
          className="flex items-center gap-2 px-6 py-3 font-bold text-on-surface-variant transition-colors hover:text-on-background"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Cancelar
        </button>
        <div className="flex gap-4">
          <button
            type="button"
            className="rounded-xl bg-surface-container-high px-8 py-3 font-bold text-on-surface transition-all active:scale-95"
          >
            Guardar Borrador
          </button>
          <button
            type="button"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container px-8 py-3 font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-95"
          >
            Continuar
            <span className="material-symbols-outlined text-sm">
              arrow_forward
            </span>
          </button>
        </div>
      </div>
    </main>
  );
}
