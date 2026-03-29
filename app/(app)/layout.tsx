"use client";

import { createBrowserClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

import { BUSINESS_PROFILE_UPDATED_EVENT } from "@/lib/appEvents";

const SIDEBAR_STORAGE_KEY = "marketing-hub-sidebar-collapsed";

const HEADER_ACTION_BUTTONS = [
  {
    id: "signout",
    label: "Cerrar sesión",
    icon: "logout",
    variant: "danger" as const,
  },
];

const headerBtnDefaultClass =
  "flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-indigo-600 sm:px-3";
const headerBtnDangerClass =
  "flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-2 text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600 sm:px-3";

const SIDEBAR_LOCK_HINT =
  "Completá el nombre y el sector en Mi negocio para acceder a esta sección.";

type NavItem = {
  href: string;
  label: string;
  icon: string;
  title: string;
};

/** Primera entrada: resumen Tienda Nube; el resto del flujo editorial. */
const NAV_LINKS_MAIN: NavItem[] = [
  {
    href: "/panel",
    label: "Panel",
    icon: "dashboard",
    title: "Panel — resumen de tu tienda",
  },
  {
    href: "/estrategia-semanal",
    label: "Estrategia",
    icon: "calendar_today",
    title: "Estrategia",
  },
  {
    href: "/contenido-ia",
    label: "Contenido IA",
    icon: "auto_awesome",
    title: "Contenido IA",
  },
  {
    href: "/potencia-con-ads",
    label: "Potencia con Ads",
    icon: "campaign",
    title: "Potencia con Ads",
  },
];

const NAV_LINK_MI_NEGOCIO: NavItem = {
  href: "/mi-negocio",
  label: "Mi Negocio",
  icon: "storefront",
  title: "Mi Negocio",
};

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
  const [collapsed, setCollapsed] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  /** Preferencia: @username, luego display_name, luego email */
  const [userDisplay, setUserDisplay] = useState<string | null>(null);
  /** Nombre + rubro en DB: habilita el resto del sidebar (null = cargando). */
  const [businessBasicsComplete, setBusinessBasicsComplete] = useState<
    boolean | null
  >(null);

  const supabase = useMemo(
    () =>
      createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      ),
    [],
  );

  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        setCollapsed(localStorage.getItem(SIDEBAR_STORAGE_KEY) === "1");
      }
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function syncUserProfile() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (cancelled) return;
      setUserEmail(user?.email ?? null);
      if (!user?.id) {
        setUserDisplay(null);
        setBusinessBasicsComplete(false);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("username, display_name")
        .eq("id", user.id)
        .maybeSingle();
      if (cancelled) return;
      const u = profile?.username?.trim();
      const dn = profile?.display_name?.trim();
      if (u) {
        setUserDisplay(`@${u}`);
      } else if (dn) {
        setUserDisplay(dn);
      } else {
        setUserDisplay(user.email ?? null);
      }

      const { data: biz } = await supabase
        .from("business_context")
        .select("name, rubro")
        .eq("user_id", user.id)
        .maybeSingle();
      if (cancelled) return;
      setBusinessBasicsComplete(
        Boolean(biz?.name?.trim() && biz?.rubro?.trim()),
      );
    }

    void syncUserProfile();
    const onBusinessSaved = () => {
      void syncUserProfile();
    };
    if (typeof window !== "undefined") {
      window.addEventListener(BUSINESS_PROFILE_UPDATED_EVENT, onBusinessSaved);
    }
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      void syncUserProfile();
    });
    return () => {
      cancelled = true;
      if (typeof window !== "undefined") {
        window.removeEventListener(
          BUSINESS_PROFILE_UPDATED_EVENT,
          onBusinessSaved,
        );
      }
      subscription.unsubscribe();
    };
  }, [supabase]);

  const toggleSidebar = useCallback(() => {
    setCollapsed((c) => {
      const next = !c;
      try {
        localStorage.setItem(SIDEBAR_STORAGE_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const active =
    "flex items-center gap-3 px-4 py-3 bg-white text-indigo-600 rounded-xl shadow-sm font-['Inter'] text-sm font-medium";
  const idle =
    "flex items-center gap-3 px-4 py-3 text-slate-500 hover:translate-x-1 transition-transform font-['Inter'] text-sm font-medium hover:text-indigo-500";

  const activeCollapsed =
    "flex items-center justify-center px-2 py-3 bg-white text-indigo-600 rounded-xl shadow-sm";
  const idleCollapsed =
    "flex items-center justify-center px-2 py-3 text-slate-500 rounded-xl transition-transform hover:text-indigo-500 hover:bg-slate-200/40";

  const is = (href: string) => routeMatches(pathname, href);

  function renderNavLink(link: NavItem) {
    const { href, label, icon, title } = link;
    /** Panel e inicio de negocio siempre accesibles; el resto hasta nombre + rubro. */
    const locked =
      sidebarOtherLocked &&
      href !== "/mi-negocio" &&
      href !== "/panel";
    const cls = `${navClass(href)}${
      locked ? " opacity-45 cursor-not-allowed pointer-events-none" : ""
    }`;
    const labelEl = (
      <span className={collapsed ? "sr-only" : undefined}>{label}</span>
    );
    if (locked) {
      return (
        <span
          key={href}
          role="link"
          aria-disabled="true"
          aria-current={is(href) ? "page" : undefined}
          title={SIDEBAR_LOCK_HINT}
          className={cls}
        >
          <span className={iconClass(href)}>{icon}</span>
          {labelEl}
        </span>
      );
    }
    return (
      <Link
        key={href}
        href={href}
        className={cls}
        aria-current={is(href) ? "page" : undefined}
        title={title}
      >
        <span className={iconClass(href)}>{icon}</span>
        {labelEl}
      </Link>
    );
  }

  function navClass(href: string) {
    if (collapsed) {
      return is(href) ? activeCollapsed : idleCollapsed;
    }
    return is(href) ? active : idle;
  }

  function iconClass(href: string) {
    const base = "material-symbols-outlined shrink-0";
    if (!is(href)) return base;
    return `${base} text-indigo-600`;
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const asideWidth = collapsed ? "w-20" : "w-64";
  const mainMargin = collapsed ? "md:ml-20" : "md:ml-64";

  /** Hasta tener nombre + rubro: Panel y Mi negocio sí; el resto del menú no. */
  const sidebarOtherLocked = businessBasicsComplete !== true;

  return (
    <div className="flex min-h-screen pt-16">
      <header className="fixed top-0 z-40 h-16 w-full bg-white/80 shadow-sm shadow-slate-200/50 backdrop-blur-xl">
        <div className="mx-auto flex h-full w-full max-w-screen-2xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            href="/"
            className="flex shrink-0 items-center gap-2 sm:gap-2.5"
          >
            <Image
              src={encodeURI("/Logo hackitba-04.png")}
              alt=""
              width={40}
              height={40}
              className="h-9 w-auto object-contain sm:h-10"
              priority
            />
            <span className="bg-gradient-to-r from-indigo-600 to-indigo-400 bg-clip-text text-lg font-bold text-transparent sm:text-xl">
              MarketMate
            </span>
          </Link>
          <div className="flex min-w-0 flex-1 items-center justify-end gap-1 sm:gap-2 md:gap-3">
          <span
              className="ml-1 min-w-0 max-w-[11rem] shrink truncate border-l border-slate-200 pl-2 text-right text-xs font-medium text-slate-600 sm:ml-2 sm:max-w-[18rem] sm:pl-3 sm:text-sm md:max-w-[22rem]"
              title={
                userEmail
                  ? userDisplay && userDisplay !== userEmail
                    ? `${userDisplay} · ${userEmail}`
                    : userEmail
                  : undefined
              }
            >
              {userDisplay ?? userEmail ?? "…"}
            </span>
            {HEADER_ACTION_BUTTONS.map((btn) => (
              <button
                key={btn.id}
                type="button"
                className={
                  btn.variant === "danger" ? headerBtnDangerClass : headerBtnDefaultClass
                }
                title={btn.label}
                aria-label={btn.label}
                onClick={() => {
                  if (btn.id === "signout") void handleSignOut();
                }}
              >
                <span className="material-symbols-outlined text-[22px]">
                  {btn.icon}
                </span>
                <span className="hidden text-sm font-medium lg:inline">
                  {btn.label}
                </span>
              </button>
            ))}

          </div>
        </div>
        <div className="absolute bottom-0 h-[1px] w-full bg-slate-100/50" />
      </header>

      <aside
        className={`fixed bottom-0 left-0 top-0 z-30 flex h-screen flex-col gap-2 bg-[#f5f7f9] pt-20 transition-[width] duration-200 ease-out ${asideWidth} ${collapsed ? "px-2 py-4" : "p-4"}`}
      >
        <div
          className={`mb-4 flex ${collapsed ? "flex-col items-center gap-3" : "items-center gap-3"} ${collapsed ? "px-0" : "px-2"}`}
        >
          <button
            type="button"
            onClick={toggleSidebar}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-600 transition-colors hover:bg-slate-200/70"
            aria-label={collapsed ? "Expandir menú lateral" : "Minimizar menú lateral"}
            aria-expanded={!collapsed}
          >
            <span className="material-symbols-outlined">
              {collapsed ? "menu_open" : "menu"}
            </span>
          </button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <nav
            className="flex flex-col gap-1"
            aria-label="Secciones principales"
          >
            {NAV_LINKS_MAIN.map((link) => renderNavLink(link))}
          </nav>

          <nav
            className={`mt-auto border-t border-slate-200/80 pt-3 ${collapsed ? "px-0" : ""}`}
            aria-label="Configuración del negocio"
          >
            {renderNavLink(NAV_LINK_MI_NEGOCIO)}
          </nav>
        </div>
      </aside>

      <div
        className={`min-w-0 flex-1 transition-[margin] duration-200 ease-out ml-0 ${mainMargin}`}
      >
        {children}
      </div>
    </div>
  );
}
