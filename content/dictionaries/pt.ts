import type { Dictionary } from "./types";

/** Textos conforme o briefing (§2, §8, §16–19, §28). */
export const pt: Dictionary = {
  meta: {
    title: "FSB Production — Experiências que ficam. Marcas que crescem.",
    description:
      "A FSB conecta criatividade, tecnologia e produção em uma única experiência. " +
      "Eventos, audiovisual, marcas, produtos, conteúdo e tecnologia.",
  },
  nav: {
    skipToContent: "Ir para o conteúdo",
    home: "Início",
    localeLabel: "Idioma",
  },
  hero: {
    words: ["EVENTOS", "ANIVERSÁRIOS", "MARCAS", "PRODUTOS", "EXPERIÊNCIAS"],
    signature: ["EXPERIÊNCIAS QUE FICAM.", "MARCAS QUE CRESCEM."],
    scrollHint: "Role para escolher",
    sound: { enable: "Ativar som", disable: "Desativar som" },
  },
  paths: {
    eyebrow: "Escolha o seu caminho",
    hint: "Passe o mouse para atravessar os nossos trabalhos",
    events: {
      name: "EVENTS",
      tagline:
        "Criamos, registramos e amplificamos experiências que merecem ser lembradas.",
      cta: "Entrar em Events",
    },
    company: {
      name: "COMPANY",
      tagline:
        "Transformamos produtos, marcas e ideias em experiências capazes de gerar atenção e vendas.",
      cta: "Entrar em Company",
    },
  },
  film: {
    eyebrow: "FSB",
    title: "IDEIAS QUE SE TORNAM EXPERIÊNCIAS.",
    play: "Reproduzir o filme institucional",
  },
  vision: {
    eyebrow: "A visão FSB",
    title: "MAIS DO QUE PRODUÇÃO.",
    lead:
      "Criamos experiências que permanecem na memória e desenvolvemos estratégias " +
      "que fazem produtos chegarem mais longe.",
    pillars: [
      { scope: "Para eventos", text: "transformamos momentos em experiências." },
      { scope: "Para marcas", text: "transformamos produtos em desejo." },
      {
        scope: "Para empresas",
        text: "transformamos ideias em comunicação, conteúdo e tecnologia.",
      },
    ],
    manifesto: [
      "A FSB nasceu para conectar criatividade, tecnologia e produção em uma única experiência.",
      "Criamos momentos que merecem ser lembrados, registramos histórias que merecem ser contadas e desenvolvemos experiências capazes de aproximar marcas e pessoas.",
      "Nos eventos, transformamos cada detalhe em experiência.",
      "Nas marcas, transformamos produtos em percepção, desejo e valor.",
      "Na tecnologia, transformamos ideias em soluções digitais.",
    ],
    closing: ["Porque não basta estar presente.", "É preciso ser lembrado."],
  },
  finalPaths: {
    title: "E AGORA?",
    events: {
      name: "EVENTS",
      tagline: "Eventos, experiências e produção audiovisual.",
      cta: "Explorar Events",
    },
    company: {
      name: "COMPANY",
      tagline: "Marcas, produtos, conteúdo, marketing e tecnologia.",
      cta: "Explorar Company",
    },
  },
  footer: {
    tagline: "Experiências que ficam. Marcas que crescem.",
    contact: "Contato",
    follow: "Siga a FSB",
    rights: "Todos os direitos reservados.",
    logoAlt: "FSB Production",
  },
  soon: {
    badge: "Em breve",
    back: "Voltar para a home",
    events: {
      title: "EVENTS",
      text:
        "Estamos montando o universo Events: casamentos, debutantes, aniversários, " +
        "corporativos, DJ, LED, fotografia, filmagem e pós-produção.",
    },
    company: {
      title: "COMPANY",
      text:
        "Estamos montando o universo Company: branding, campanhas, conteúdo, " +
        "fotografia e vídeo de produto, cursos, e-books, sites e tecnologia.",
    },
  },
};
