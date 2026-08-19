import type { Dictionary } from "@/lib/dictionaries";
import { Reveal } from "../ui/Reveal";

/** §17–18 — o propósito da FSB, em layout editorial. Nada de lista de serviços aqui. */
export function VisionSection({ dict }: { dict: Dictionary }) {
  const { eyebrow, title, lead, pillars, manifesto, closing } = dict.vision;

  return (
    <section className="shell relative z-10 bg-midnight-deep pb-28 md:pb-40">
      <Reveal className="mb-14">
        <p className="type-eyebrow mb-6 text-electric">{eyebrow}</p>
        <h2 className="type-display max-w-4xl text-[clamp(2rem,6vw,5rem)]">
          {title}
        </h2>
      </Reveal>

      <div className="grid gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-24">
        <div>
          <Reveal>
            <p className="text-balance text-[clamp(1.25rem,2.4vw,2rem)] leading-[1.35] text-bone">
              {lead}
            </p>
          </Reveal>

          {/* O fundo opaco fica no <li>, fora do Reveal: o Reveal anima opacidade e,
              se carregasse o fundo, deixaria vazar o cinza das linhas divisórias. */}
          <ul className="mt-14 space-y-px bg-bone/10">
            {pillars.map((pillar, index) => (
              <li key={pillar.scope} className="bg-midnight-deep py-6">
                <Reveal delay={index * 0.08}>
                  <p className="text-base leading-relaxed text-bone/75 md:text-lg">
                    <span className="type-eyebrow mr-3 align-middle text-electric">
                      {pillar.scope}
                    </span>
                    {pillar.text}
                  </p>
                </Reveal>
              </li>
            ))}
          </ul>
        </div>

        <div className="lg:pt-3">
          {manifesto.map((paragraph, index) => (
            <Reveal key={paragraph} delay={index * 0.05}>
              <p className="mb-5 text-sm leading-relaxed text-bone/55 md:text-base">
                {paragraph}
              </p>
            </Reveal>
          ))}

          <Reveal delay={0.15}>
            <p className="type-display mt-10 text-[clamp(1.5rem,3vw,2.5rem)]">
              <span className="block text-bone">{closing[0]}</span>
              <span className="block text-electric">{closing[1]}</span>
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
