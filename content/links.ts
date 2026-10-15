import type { Locale } from "@/content/dictionaries/types";

/**
 * Copy da página de links ("link na bio" do Instagram) — /[lang]/links.
 * Contatos e URLs vêm de content/site.ts; aqui só vive o texto, por idioma.
 * Público principal: Orlando, FL (EUA) — por isso o link da bio aponta para /en/links/.
 */
export type LinksCopy = {
  readonly title: string;
  readonly description: string;
  readonly handle: string;
  readonly bio: string;
  readonly tags: readonly string[];
  readonly whatsapp: { label: string; hint: string };
  readonly site: { label: string; hint: string };
  readonly events: { label: string; hint: string };
  readonly company: { label: string; hint: string };
  readonly call: { label: string; hint: string };
  readonly email: { label: string; hint: string };
  readonly map: { label: string; hint: string };
  readonly footer: string;
};

export const linksCopy: Record<Locale, LinksCopy> = {
  en: {
    title: "FSB Production — Links",
    description:
      "Events, photo & video and brand content in Orlando, FL. Get a free quote on WhatsApp.",
    handle: "Orlando, Florida",
    bio: "Events, audiovisual production and brand content in Orlando, FL — experiences that last, brands that grow.",
    tags: ["Weddings", "Quinceañeras", "Corporate", "Photo & Video", "Brands"],
    whatsapp: { label: "Get a free quote", hint: "Chat with us on WhatsApp" },
    site: { label: "Visit our website", hint: "portalfsb.com" },
    events: { label: "Events", hint: "Weddings, quinceañeras, corporate, DJ & LED" },
    company: { label: "Brands & Content", hint: "Photo, video, social media, websites" },
    call: { label: "Call us", hint: "+1 (407) 686-8511" },
    email: { label: "Email us", hint: "contact@portalfsb.com" },
    map: { label: "Find us in Orlando", hint: "2295 S Hiawassee Rd, Ste 313" },
    footer: "Experiences that last. Brands that grow.",
  },
  es: {
    title: "FSB Production — Enlaces",
    description:
      "Eventos, foto y video y contenido para marcas en Orlando, FL. Pide tu cotización gratis por WhatsApp.",
    handle: "Orlando, Florida",
    bio: "Eventos, producción audiovisual y contenido para marcas en Orlando, FL — experiencias que perduran, marcas que crecen.",
    tags: ["Bodas", "Quinceañeras", "Corporativo", "Foto y Video", "Marcas"],
    whatsapp: { label: "Cotización gratis", hint: "Escríbenos por WhatsApp" },
    site: { label: "Visita nuestro sitio", hint: "portalfsb.com" },
    events: { label: "Eventos", hint: "Bodas, quinceañeras, corporativo, DJ y LED" },
    company: { label: "Marcas y Contenido", hint: "Foto, video, redes sociales, sitios web" },
    call: { label: "Llámanos", hint: "+1 (407) 686-8511" },
    email: { label: "Escríbenos", hint: "contact@portalfsb.com" },
    map: { label: "Encuéntranos en Orlando", hint: "2295 S Hiawassee Rd, Ste 313" },
    footer: "Experiencias que perduran. Marcas que crecen.",
  },
  pt: {
    title: "FSB Production — Links",
    description:
      "Eventos, foto e vídeo e conteúdo para marcas em Orlando, FL. Peça um orçamento grátis pelo WhatsApp.",
    handle: "Orlando, Flórida",
    bio: "Eventos, produção audiovisual e conteúdo para marcas em Orlando, FL — experiências que ficam, marcas que crescem.",
    tags: ["Casamentos", "Quinceañeras", "Corporativo", "Foto e Vídeo", "Marcas"],
    whatsapp: { label: "Orçamento grátis", hint: "Fale com a gente no WhatsApp" },
    site: { label: "Visite nosso site", hint: "portalfsb.com" },
    events: { label: "Eventos", hint: "Casamentos, quinceañeras, corporativo, DJ e LED" },
    company: { label: "Marcas e Conteúdo", hint: "Foto, vídeo, redes sociais, sites" },
    call: { label: "Ligue para nós", hint: "+1 (407) 686-8511" },
    email: { label: "Envie um e-mail", hint: "contact@portalfsb.com" },
    map: { label: "Encontre-nos em Orlando", hint: "2295 S Hiawassee Rd, Ste 313" },
    footer: "Experiências que ficam. Marcas que crescem.",
  },
};
