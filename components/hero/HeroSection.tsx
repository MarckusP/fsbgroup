import type { Dictionary } from "@/lib/dictionaries";
import { HeroWords } from "./HeroWords";
import { ScrollHint } from "../ui/ScrollHint";

/** §1 — tela cheia, vídeo atrás (renderizado por CinemaBackdrop), tipografia em HTML. */
export function HeroSection({ dict }: { dict: Dictionary }) {
  return (
    <section
      id="conteudo"
      className="shell relative z-10 flex min-h-svh flex-col justify-end pb-24 pt-32 md:pb-28"
    >
      <HeroWords dict={dict} />
      <ScrollHint label={dict.hero.scrollHint} className="mt-14" />
    </section>
  );
}
