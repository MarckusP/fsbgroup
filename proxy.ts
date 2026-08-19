import { NextResponse, type NextRequest } from "next/server";
import { DEFAULT_LOCALE, LOCALES } from "@/content/dictionaries/types";

/**
 * Todo conteúdo vive sob /pt ou /en. Uma URL sem locale é redirecionada,
 * usando o Accept-Language só como dica — o padrão é PT.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const hasLocale = LOCALES.some(
    (locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`),
  );
  if (hasLocale) return NextResponse.next();

  const preferred = request.headers.get("accept-language") ?? "";
  const locale =
    LOCALES.find((l) => preferred.toLowerCase().startsWith(l)) ?? DEFAULT_LOCALE;

  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Deixa passar arquivos estáticos, /media e as rotas internas do Next.
  matcher: ["/((?!_next|media|favicon|icon|apple-icon|robots.txt|sitemap.xml).*)"],
};
