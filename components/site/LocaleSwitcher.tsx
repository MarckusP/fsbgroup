"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Globe } from "lucide-react";
import { LOCALES, type Locale } from "@/lib/dictionaries";

/** Nome nativo de cada idioma, mostrado no menu do seletor. */
const NATIVE_NAMES: Record<Locale, string> = {
  pt: "Português",
  en: "English",
  es: "Español",
};

/** Chave usada para lembrar a escolha do usuário entre visitas (ver public/index.html). */
const STORAGE_KEY = "fsb-locale";
/** Posição de rolagem guardada antes da troca de idioma, restaurada após a navegação. */
const SCROLL_KEY = "fsb-locale-scroll";

/**
 * Seletor de idioma: um botão com ícone de globo + código atual, que abre um menu
 * com o nome nativo de cada idioma. Troca apenas o primeiro segmento da URL,
 * preservando a página atual — quem está em /pt/events cai em /en/events, não na home.
 */
export function LocaleSwitcher({
  current,
  label,
}: {
  current: Locale;
  label: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  const hrefFor = (locale: Locale) => {
    const segments = pathname.split("/");
    segments[1] = locale; // segments[0] é sempre "" por causa da barra inicial
    return segments.join("/") || `/${locale}`;
  };

  // Fecha ao clicar fora ou pressionar Escape.
  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  // Depois da troca de idioma, devolve a página à posição de rolagem em que estava.
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = sessionStorage.getItem(SCROLL_KEY);
      sessionStorage.removeItem(SCROLL_KEY);
    } catch {
      return;
    }
    if (saved === null) return;
    const y = Number(saved);
    // Reaplica por alguns frames: o conteúdo novo pode mudar de altura ao hidratar.
    let frames = 0;
    let raf = 0;
    const restore = () => {
      window.scrollTo(0, y);
      if (++frames < 10) raf = requestAnimationFrame(restore);
    };
    restore();
    return () => cancelAnimationFrame(raf);
  }, [pathname]);

  const handleSelect = (locale: Locale) => {
    setOpen(false);
    try {
      sessionStorage.setItem(SCROLL_KEY, String(window.scrollY));
    } catch {
      // sem sessionStorage, o scroll={false} do Link ainda tenta manter a posição.
    }
    try {
      localStorage.setItem(STORAGE_KEY, locale);
    } catch {
      // Armazenamento indisponível (modo privado, cookies bloqueados etc.) — sem problema,
      // a escolha ainda vale para esta navegação.
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full bg-electric px-4 py-2 text-xs font-medium uppercase tracking-widest text-white shadow-[0_10px_30px_-12px_rgb(23_67_244/0.8)] transition hover:bg-electric/85"
      >
        <Globe aria-hidden className="h-4 w-4" />
        {/* "Language" fixo em inglês, em todos os idiomas: é a palavra que quem não lê
            o idioma atual da página reconhece pra achar a troca. */}
        <span>Language</span>
        <span aria-hidden className="text-white/60">
          · {current}
        </span>
      </button>

      {open && (
        <ul
          aria-label={label}
          className="hairline absolute right-0 top-full z-50 mt-2 min-w-[9rem] overflow-hidden rounded-xl border bg-midnight-deep/95 py-1 ring-1 ring-bone/10 backdrop-blur-md"
        >
          {LOCALES.map((locale) => (
            <li key={locale}>
              <Link
                href={hrefFor(locale)}
                hrefLang={locale}
                scroll={false}
                aria-current={locale === current ? "true" : undefined}
                onClick={() => handleSelect(locale)}
                className={`block px-3.5 py-2 text-xs uppercase tracking-wide transition-colors ${
                  locale === current
                    ? "text-bone"
                    : "text-bone/50 hover:text-bone/90"
                }`}
              >
                {NATIVE_NAMES[locale]}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
