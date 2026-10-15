import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowUpRight,
  Globe,
  Mail,
  MapPin,
  MessageCircle,
  PartyPopper,
  Phone,
  Sparkles,
} from "lucide-react";
import type { ReactNode } from "react";
import { linksCopy } from "@/content/links";
import { logos, site } from "@/content/site";
import { HTML_LANG, isLocale, LOCALES, type Locale } from "@/lib/dictionaries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const copy = linksCopy[lang];
  return {
    title: copy.title,
    description: copy.description,
    alternates: { canonical: `/${lang}/links/` },
    openGraph: { title: copy.title, description: copy.description },
  };
}

type LinkItem = {
  readonly href: string;
  readonly label: string;
  readonly hint: string;
  readonly icon: ReactNode;
  readonly external?: boolean;
  readonly primary?: boolean;
};

export default async function LinksPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const copy = linksCopy[lang];
  const utm = "?utm_source=instagram&utm_medium=bio&utm_campaign=link_in_bio";
  const icon = "h-5 w-5";

  const items: LinkItem[] = [
    {
      href: site.contact.whatsappHref,
      label: copy.whatsapp.label,
      hint: copy.whatsapp.hint,
      icon: <MessageCircle className={icon} strokeWidth={1.6} />,
      external: true,
      primary: true,
    },
    {
      href: `${site.url}/${lang}/${utm}`,
      label: copy.site.label,
      hint: copy.site.hint,
      icon: <Globe className={icon} strokeWidth={1.6} />,
      external: true,
    },
    {
      href: `${site.url}/${lang}/events/${utm}`,
      label: copy.events.label,
      hint: copy.events.hint,
      icon: <PartyPopper className={icon} strokeWidth={1.6} />,
      external: true,
    },
    {
      href: `${site.url}/${lang}/company/${utm}`,
      label: copy.company.label,
      hint: copy.company.hint,
      icon: <Sparkles className={icon} strokeWidth={1.6} />,
      external: true,
    },
    {
      href: site.contact.phoneHref,
      label: copy.call.label,
      hint: copy.call.hint,
      icon: <Phone className={icon} strokeWidth={1.6} />,
    },
    {
      href: `mailto:${site.contact.email}`,
      label: copy.email.label,
      hint: copy.email.hint,
      icon: <Mail className={icon} strokeWidth={1.6} />,
    },
    {
      href: site.contact.locationHref,
      label: copy.map.label,
      hint: copy.map.hint,
      icon: <MapPin className={icon} strokeWidth={1.6} />,
      external: true,
    },
  ];

  return (
    <main className="stage-ambient relative isolate flex min-h-svh justify-center overflow-hidden px-5 py-12">
      <div className="relative z-10 flex w-full max-w-md flex-col items-center text-center">
        <img
          src={logos.light}
          srcSet={`${logos.light} 1x, ${logos.lightRetina} 2x`}
          alt="FSB Production"
          width={128}
          height={128}
          className="h-28 w-auto"
        />
        <h1 className="type-display mt-6 text-3xl">{site.name}</h1>
        <p className="type-eyebrow mt-3 text-electric">{copy.handle}</p>
        <p className="mt-5 text-balance text-[0.95rem] leading-relaxed text-bone/70">
          {copy.bio}
        </p>

        <ul className="mt-5 flex flex-wrap justify-center gap-2">
          {copy.tags.map((tag) => (
            <li
              key={tag}
              className="hairline rounded-full border px-3 py-1 text-xs text-bone/70"
            >
              {tag}
            </li>
          ))}
        </ul>

        <ul className="mt-8 flex w-full flex-col gap-3">
          {items.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                {...(item.external
                  ? { target: "_blank", rel: "noreferrer noopener" }
                  : {})}
                className={
                  "group flex items-center gap-4 rounded-2xl border px-5 py-4 text-left transition-[background-color,border-color,transform] duration-300 ease-[var(--ease-hover)] hover:-translate-y-0.5 " +
                  (item.primary
                    ? "border-electric bg-electric text-white hover:bg-[#2a55ff]"
                    : "hairline bg-bone/[0.04] hover:border-electric/60 hover:bg-bone/[0.08]")
                }
              >
                <span
                  className={item.primary ? "text-white" : "text-electric"}
                  aria-hidden="true"
                >
                  {item.icon}
                </span>
                <span className="flex min-w-0 flex-1 flex-col">
                  <span className="font-semibold">{item.label}</span>
                  <span
                    className={
                      "truncate text-xs " +
                      (item.primary ? "text-white/80" : "text-bone/50")
                    }
                  >
                    {item.hint}
                  </span>
                </span>
                <ArrowUpRight
                  className="h-4 w-4 shrink-0 opacity-50 transition-opacity group-hover:opacity-100"
                  strokeWidth={1.6}
                  aria-hidden="true"
                />
              </a>
            </li>
          ))}
        </ul>

        <nav
          aria-label="Language"
          className="mt-8 flex items-center gap-4 text-xs uppercase tracking-widest text-bone/45"
        >
          {LOCALES.map((l: Locale) => (
            <Link
              key={l}
              href={`/${l}/links/`}
              hrefLang={HTML_LANG[l]}
              aria-current={l === lang ? "page" : undefined}
              className={
                l === lang ? "text-bone" : "transition-colors hover:text-electric"
              }
            >
              {l}
            </Link>
          ))}
        </nav>

        <p className="mt-6 text-xs text-bone/35">{copy.footer}</p>
      </div>
    </main>
  );
}
