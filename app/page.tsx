import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 py-16">
      <div className="mx-auto max-w-2xl text-center">
        <p className="mb-3 text-xs font-bold uppercase tracking-widest text-primary">
          Editorial Studio
        </p>
        <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-on-background md:text-5xl">
          Tu community manager automático, sin complicarte con el marketing.
        </h1>
        <p className="mb-10 text-lg leading-relaxed text-on-surface-variant">
          Analizá tu negocio, seguí las tendencias y recibí cada semana qué
          publicar. Pensado para PYMEs con poco tiempo.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-primary to-primary-container px-8 py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all hover:opacity-95 active:scale-[0.99]"
          >
            Entrar o registrarse
          </Link>
          <Link
            href="/login?next=/mi-negocio"
            className="inline-flex items-center justify-center rounded-xl border border-outline-variant/40 bg-surface-container-lowest px-8 py-3.5 text-sm font-semibold text-on-background transition-colors hover:bg-surface-container-low"
          >
            Ir al panel
          </Link>
        </div>
      </div>
    </div>
  );
}
