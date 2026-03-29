import { Suspense } from "react";
import { LoginPanel } from "./LoginPanel";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background text-on-surface-variant">
          Cargando…
        </div>
      }
    >
      <LoginPanel />
    </Suspense>
  );
}
