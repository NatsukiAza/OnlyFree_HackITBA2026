import { BusinessForm } from "@/components/BusinessForm";

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

      <BusinessForm />
    </main>
  );
}
