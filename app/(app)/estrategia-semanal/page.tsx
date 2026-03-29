import { Suspense } from "react";

import { EstrategiaSemanalView } from "./EstrategiaSemanalView";

export default function EstrategiaSemanalPage() {
  return (
    <main className="px-8 pb-12 pt-24">
      <div className="mx-auto max-w-5xl">
        <Suspense
          fallback={
            <div className="h-64 animate-pulse rounded-2xl bg-surface-container-low" />
          }
        >
          <EstrategiaSemanalView />
        </Suspense>
      </div>
    </main>
  );
}
