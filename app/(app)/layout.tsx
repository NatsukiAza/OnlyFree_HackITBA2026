"use client";

import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo } from "react";

const AVATAR_SRC =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuCjhKAv5BfX7pDpbD-_D-1YwMyKr783E84P01X_3IhbrP2pO-noMK8oiLgi_p0ib0SPmlteum5gYdJy1UukmrXmhUwhyC3lj6B5D87-rpZsoXhU12omZr3Jj4ZrTfkSwnNpnriB3JwkLgNbbSIhabFOoGz2aNHHZYVf754qZMRevz8NjekH2SnX3UzsexqJtv9m1Ej_E_3iCLaM5-itmoThAAwYXaoN6wGObhzvspO9fYaXbv9bd5eETeIP_CCn42EZ_70X6UDzmdtz";

function routeMatches(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function AppShellLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const router = useRouter();

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  const active =
    "flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 rounded-xl shadow-sm font-['Inter'] text-sm font-medium";
  const idle =
    "flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:translate-x-1 transition-transform font-['Inter'] text-sm font-medium hover:text-indigo-500";

  const is = (href: string) => routeMatches(pathname, href);

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen pt-16">
      <header className="fixed top-0 z-40 h-16 w-full bg-white/80 shadow-sm shadow-slate-200/50 backdrop-blur-xl dark:bg-slate-900/80 dark:shadow-none">
        <div className="mx-auto flex h-full w-full max-w-screen-2xl items-center justify-between px-6">
          <Link
            href="/"
            className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-xl font-bold text-transparent"
          >
            Editorial Studio
          </Link>
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="rounded-full p-2 text-slate-500 transition-all duration-300 hover:bg-slate-50"
            >
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button
              type="button"
              className="rounded-full p-2 text-slate-500 transition-all duration-300 hover:bg-slate-50"
            >
              <span className="material-symbols-outlined">help_outline</span>
            </button>
            <div className="ml-2 flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-primary-container">
              <img
                alt="User profile avatar"
                className="h-full w-full object-cover"
                src={AVATAR_SRC}
              />
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 h-[1px] w-full bg-slate-100/50 dark:bg-slate-800/50" />
      </header>

      <aside className="fixed bottom-0 left-0 top-0 z-30 flex h-screen w-64 flex-col gap-2 bg-[#f5f7f9] p-4 pt-20 dark:bg-slate-950">
        <div className="mb-6 px-4">
          <div className="mb-1 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
              <span className="material-symbols-outlined">rocket_launch</span>
            </div>
            <div>
              <p className="text-lg font-black leading-tight text-slate-800 dark:text-slate-100">
                Marketing Hub
              </p>
              <p className="text-xs font-medium text-slate-500">
                Small Biz Growth
              </p>
            </div>
          </div>
        </div>
        <nav className="flex flex-grow flex-col gap-1">
          <Link
            href="/mi-negocio"
            className={is("/mi-negocio") ? active : idle}
            aria-current={is("/mi-negocio") ? "page" : undefined}
          >
            <span
              className={
                is("/mi-negocio")
                  ? "material-symbols-outlined text-indigo-600"
                  : "material-symbols-outlined"
              }
            >
              storefront
            </span>
            Mi Negocio
          </Link>
          <Link
            href="/estrategia-semanal"
            className={is("/estrategia-semanal") ? active : idle}
            aria-current={is("/estrategia-semanal") ? "page" : undefined}
          >
            <span
              className={
                is("/estrategia-semanal")
                  ? "material-symbols-outlined text-indigo-600"
                  : "material-symbols-outlined"
              }
            >
              calendar_today
            </span>
            Estrategia
          </Link>
          <Link
            href="/contenido-ia"
            className={is("/contenido-ia") ? active : idle}
            aria-current={is("/contenido-ia") ? "page" : undefined}
          >
            <span
              className={
                is("/contenido-ia")
                  ? "material-symbols-outlined text-indigo-600"
                  : "material-symbols-outlined"
              }
            >
              auto_awesome
            </span>
            Contenido IA
          </Link>
          <Link
            href="/potencia-con-ads"
            className={is("/potencia-con-ads") ? active : idle}
            aria-current={is("/potencia-con-ads") ? "page" : undefined}
          >
            <span
              className={
                is("/potencia-con-ads")
                  ? "material-symbols-outlined text-indigo-600"
                  : "material-symbols-outlined"
              }
            >
              campaign
            </span>
            Potencia con Ads
          </Link>
        </nav>
        <div className="mt-auto flex flex-col gap-1 border-t border-slate-200/50 pt-4">
          <button
            type="button"
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-3 text-left font-['Inter'] text-sm font-medium text-slate-500 hover:text-indigo-500 dark:text-slate-400"
          >
            <span className="material-symbols-outlined">logout</span>
            Cerrar sesión
          </button>
          <a
            className="flex items-center gap-3 px-4 py-3 font-['Inter'] text-sm font-medium text-slate-500 hover:text-indigo-500 dark:text-slate-400"
            href="#"
          >
            <span className="material-symbols-outlined">settings</span>
            Settings
          </a>
          <a
            className="flex items-center gap-3 px-4 py-3 font-['Inter'] text-sm font-medium text-slate-500 hover:text-indigo-500 dark:text-slate-400"
            href="#"
          >
            <span className="material-symbols-outlined">contact_support</span>
            Support
          </a>
        </div>
      </aside>

      {children}
    </div>
  );
}
