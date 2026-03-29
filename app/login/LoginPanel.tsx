"use client";

import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

export function LoginPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") ?? "/mi-negocio";
  const authError = searchParams.get("error");

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const safeNext = nextPath.startsWith("/") ? nextPath : "/mi-negocio";

  async function handleEmailAuth(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setPending(true);

    if (mode === "register") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?next=${encodeURIComponent(safeNext)}`,
          data: {
            full_name: email.split("@")[0],
          },
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        setPending(false);
        return;
      }

      if (data.session) {
        router.push(safeNext);
        router.refresh();
      } else {
        setMessage(
          "Si tu proyecto tiene confirmación por email, revisá tu bandeja. Cuando confirmes, podés iniciar sesión.",
        );
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setPending(false);
        return;
      }

      router.push(safeNext);
      router.refresh();
    }

    setPending(false);
  }

  async function handleGoogleLogin() {
    setError(null);
    setPending(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback?next=${encodeURIComponent(safeNext)}`,
      },
    });
    if (oauthError) {
      setError(oauthError.message);
      setPending(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-10 text-center">
          <Link
            href="/"
            className="inline-block bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-2xl font-bold text-transparent"
          >
            Editorial Studio
          </Link>
          <p className="mt-2 text-sm text-on-surface-variant">
            Marketing Hub para tu PYME
          </p>
        </div>

        <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-sm ring-1 ring-outline-variant/20">
          <div className="mb-8 flex rounded-xl bg-surface-container-low p-1">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError(null);
                setMessage(null);
              }}
              className={
                mode === "login"
                  ? "flex-1 rounded-lg bg-white py-2.5 text-sm font-bold text-primary shadow-sm"
                  : "flex-1 rounded-lg py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-background"
              }
            >
              Iniciar sesión
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setError(null);
                setMessage(null);
              }}
              className={
                mode === "register"
                  ? "flex-1 rounded-lg bg-white py-2.5 text-sm font-bold text-primary shadow-sm"
                  : "flex-1 rounded-lg py-2.5 text-sm font-medium text-on-surface-variant transition-colors hover:text-on-background"
              }
            >
              Crear cuenta
            </button>
          </div>

          {authError && (
            <p className="mb-4 rounded-lg bg-error-container/25 px-3 py-2 text-sm text-on-background">
              No se pudo completar el inicio de sesión. Probá de nuevo.
            </p>
          )}

          {error && (
            <p className="mb-4 rounded-lg bg-error-container/25 px-3 py-2 text-sm text-on-background">
              {error}
            </p>
          )}
          {message && (
            <p className="mb-4 rounded-lg bg-secondary-container/40 px-3 py-2 text-sm text-on-background">
              {message}
            </p>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border-0 bg-surface-container-lowest px-4 py-3 ring-1 ring-outline-variant/30 outline-none transition-all focus:ring-2 focus:ring-primary-container/40"
                placeholder="tu@email.com"
              />
            </div>
            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-on-surface-variant"
              >
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={
                  mode === "register" ? "new-password" : "current-password"
                }
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border-0 bg-surface-container-lowest px-4 py-3 ring-1 ring-outline-variant/30 outline-none transition-all focus:ring-2 focus:ring-primary-container/40"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-primary to-primary-container py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 transition-all active:scale-[0.99] disabled:opacity-60"
            >
              {pending
                ? "Procesando…"
                : mode === "register"
                  ? "Registrarme"
                  : "Entrar"}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-outline-variant/30" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-surface-container-lowest px-3 text-xs font-medium text-on-surface-variant">
                o continuá con
              </span>
            </div>
          </div>

          <button
            type="button"
            disabled={pending}
            onClick={handleGoogleLogin}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-outline-variant/30 bg-white py-3.5 text-sm font-semibold text-on-background shadow-sm transition-all hover:bg-surface-container-low disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden>
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuar con Google
          </button>

          <p className="mt-8 text-center text-xs text-on-surface-variant">
            Al crear tu cuenta, generamos tu perfil automáticamente para que
            puedas guardar tu negocio.
          </p>
        </div>

        <p className="mt-6 text-center text-sm text-on-surface-variant">
          <Link href="/" className="font-medium text-primary hover:underline">
            Volver al inicio
          </Link>
        </p>
      </div>
    </div>
  );
}
