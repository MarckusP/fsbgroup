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
    back: "Voltar para a home",
  },
  hero: {
    words: ["EVENTOS", "ANIVERSÁRIOS", "MARCAS", "PRODUTOS", "EXPERIÊNCIAS"],
    signature: ["EXPERIÊNCIAS QUE FICAM.", "MARCAS QUE CRESCEM."],
    scrollHint: "Role para escolher",
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
  stage: {
    sections: "Seções",
    gallery: "Galeria da seção",
    showImage: "Ver imagem {n}",
    openSite: "Abrir {host} em uma nova aba",
    prevSection: "Seção anterior",
    nextSection: "Próxima seção",
  },
  events: {
    eyebrow: "EVENTS",
    title: "EVENTOS QUE VIRAM MEMÓRIA.",
    intro:
      "Do primeiro brief à última luz apagada, cuidamos de cada camada do seu evento — " +
      "cenografia, som, imagem e experiência.",
    formTypeLabel: "Tipo de evento",
    sections: {
      weddings: {
        navLabel: "Casamentos",
        eyebrow: "CASAMENTOS",
        title: "O dia mais importante, contado do jeito certo.",
        description:
          "Planejamos e registramos casamentos do primeiro ensaio à festa — cenografia, " +
          "iluminação, som e um time de imagem dedicado a não perder nenhum instante.",
        cta: "Falar sobre meu casamento",
      },
      socials: {
        navLabel: "Social",
        eyebrow: "DEBUTANTES & ANIVERSÁRIOS",
        title: "Celebrações com a assinatura FSB.",
        description:
          "Debutantes, aniversários e comemorações que merecem tanto cuidado quanto " +
          "qualquer grande produção — do convite ao último brinde.",
        cta: "Planejar minha celebração",
      },
      corporate: {
        navLabel: "Corporativo",
        eyebrow: "CORPORATIVO",
        title: "Eventos que comunicam a sua marca.",
        description:
          "Convenções, lançamentos e confraternizações pensados como experiência de " +
          "marca — cada detalhe reforça a mensagem que sua empresa quer deixar.",
        cta: "Falar sobre meu evento corporativo",
      },
      production: {
        navLabel: "Produção",
        eyebrow: "PRODUÇÃO AUDIOVISUAL",
        title: "DJ, LED, fotografia e filmagem — tudo integrado.",
        description:
          "Som, iluminação, telões de LED, fotografia e filmagem sob uma única produção, " +
          "para o evento parecer — e soar — profissional do início ao fim.",
        cta: "Montar minha produção",
      },
    },
  },
  company: {
    eyebrow: "COMPANY",
    title: "IDEIAS QUE VIRAM NEGÓCIO.",
    intro:
      "Da identidade visual ao produto pronto para vender: unimos criatividade, " +
      "tecnologia e produção para fazer sua marca crescer.",
    formTypeLabel: "Tipo de projeto",
    sections: {
      branding: {
        navLabel: "Marca & Tráfego",
        eyebrow: "MARCA, CAMPANHAS & TRÁFEGO",
        title: "Marca com identidade, tráfego com resultado.",
        description:
          "Identidade visual, posicionamento e campanhas — mais a gestão de redes " +
          "sociais e do Google Meu Negócio que coloca sua empresa na frente de quem " +
          "já está procurando.",
        cta: "Falar sobre minha marca",
      },
      product: {
        navLabel: "Foto & Vídeo",
        eyebrow: "FOTOGRAFIA & VÍDEO",
        title: "Seu produto, sua equipe e você em imagem.",
        description:
          "Estúdio ou locação: foto de produto para catálogo e e-commerce, ensaio de " +
          "modelo, retrato de posicionamento para empresários e o registro do dia a " +
          "dia da empresa.",
        cta: "Agendar uma produção",
      },
      content: {
        navLabel: "Conteúdo",
        eyebrow: "CONTEÚDO, CURSOS & PODCAST",
        title: "Conteúdo que educa e vende.",
        description:
          "Gravação de cursos e podcasts, criação de e-books e conteúdo educativo com " +
          "produção de ponta a ponta — do roteiro à entrega final.",
        cta: "Criar meu conteúdo",
      },
      web: {
        navLabel: "Web",
        eyebrow: "SITES, APPS & PRESENÇA DIGITAL",
        title: "Presença digital que sustenta o negócio.",
        description:
          "Sites, aplicativos, Google Meu Negócio e as páginas que fazem sua empresa ser " +
          "encontrada — tecnologia a serviço da experiência da marca.",
        cta: "Falar sobre tecnologia",
      },
    },
  },
  form: {
    eyebrow: "Vamos conversar",
    title: "Conte pra gente o que você quer criar.",
    name: "Nome",
    namePlaceholder: "Seu nome",
    date: "Data do evento",
    email: "E-mail (opcional)",
    emailPlaceholder: "seu@email.com",
    details: "Detalhes (opcional)",
    detailsPlaceholder: "Convidados, local, orçamento — o que for relevante.",
    cta: "Falar no WhatsApp",
  },
};
