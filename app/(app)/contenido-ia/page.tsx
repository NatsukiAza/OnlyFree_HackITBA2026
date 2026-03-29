import { Suspense } from "react";

import ContenidoIaView from "./ContenidoIaView";

export default function ContenidoIAPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen px-6 pb-12 pt-24">
          <div className="mx-auto max-w-screen-lg">
            <div className="h-8 w-48 rounded-lg skeleton-shimmer" />
            <div className="mt-4 h-12 w-72 rounded-lg skeleton-shimmer" />
          </div>
        </main>
      }
    >
      <ContenidoIaView />
    </Suspense>
  );
}
