import { Mail, MapPin, Phone } from "lucide-react";
import { logos, site } from "@/content/site";
import type { Dictionary } from "@/lib/dictionaries";

export function Footer({ dict }: { dict: Dictionary }) {
  const year = new Date().getFullYear();

  return (
    <footer className="shell hairline relative z-10 border-t bg-midnight-deep pb-10 pt-16">
      <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="space-y-6">
          <img
            src={logos.light}
            srcSet={`${logos.light} 1x, ${logos.lightRetina} 2x`}
            alt={dict.footer.logoAlt}
            width={445}
            height={207}
            loading="lazy"
            className="h-8 w-auto"
          />
          <p className="max-w-xs text-sm leading-relaxed text-bone/55">
            {dict.footer.tagline}
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="type-eyebrow text-bone/35">{dict.footer.contact}</h2>
          <ul className="space-y-3 text-sm text-bone/70">
            <li>
              <a
                href={`mailto:${site.contact.email}`}
                className="inline-flex items-center gap-2.5 transition-colors hover:text-electric"
              >
                <Mail className="h-4 w-4 shrink-0 text-electric" strokeWidth={1.5} />
                {site.contact.email}
              </a>
            </li>
            <li>
              {/* Mesmo número do telefone principal — encaminha pro WhatsApp em vez
                  do discador, porque é ali que o contato é atendido de fato. */}
              <a
                href={site.contact.whatsappHref}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2.5 transition-colors hover:text-electric"
              >
                <Phone className="h-4 w-4 shrink-0 text-electric" strokeWidth={1.5} />
                {site.contact.phoneLabel}
              </a>
            </li>
            <li>
              <a
                href={site.contact.locationHref}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2.5 transition-colors hover:text-electric"
              >
                <MapPin className="h-4 w-4 shrink-0 text-electric" strokeWidth={1.5} />
                {site.contact.location}
              </a>
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="type-eyebrow text-bone/35">{dict.footer.follow}</h2>
          {/* Sem link por enquanto: os perfis ainda não estão confirmados
              (ver TODOs em content/site.ts), então fica só como texto. */}
          <ul className="space-y-3 text-sm text-bone/70">
            {site.socials.map((social) => (
              <li key={social.id}>{social.label}</li>
            ))}
          </ul>
        </div>
      </div>

      <p className="hairline mt-16 border-t pt-6 text-xs text-bone/35">
        © {year} {site.name}. {dict.footer.rights}
      </p>
    </footer>
  );
}
