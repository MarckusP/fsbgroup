import Link from "next/link";
import { logos } from "@/content/site";
import type { Dictionary, Locale } from "@/lib/dictionaries";
import { LocaleSwitcher } from "./LocaleSwitcher";

export function Header({ dict, lang }: { dict: Dictionary; lang: Locale }) {
  return (
    <header className="shell fixed inset-x-0 top-0 z-40 flex items-center justify-between bg-gradient-to-b from-midnight-deep/80 to-transparent py-5">
      <Link href={`/${lang}`} aria-label={dict.nav.home} className="block">
        <img
          src={logos.light}
          srcSet={`${logos.light} 1x, ${logos.lightRetina} 2x`}
          alt={dict.footer.logoAlt}
          width={445}
          height={207}
          className="h-6 w-auto md:h-7"
        />
      </Link>
      <LocaleSwitcher current={lang} label={dict.nav.localeLabel} />
    </header>
  );
}
