"use client";

import { useEffect, useRef, useState } from "react";
import { heroMedia } from "@/content/site";
import type { Dictionary } from "@/lib/dictionaries";
import { Reveal } from "../ui/Reveal";

/**
 * §16 — o filme institucional em formato grande.
 *
 * Por ora reaproveita o hero; quando existir o filme oficial, basta trocar o caminho
 * em content/site.ts. Só carrega e toca quando entra na tela: um segundo vídeo
 * rodando fora de vista é desperdício de bateria.
 */
export function FilmSection({ dict }: { dict: Dictionary }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setVisible(entry.isIntersecting);
        if (entry.isIntersecting) void video.play().catch(() => undefined);
        else video.pause();
      },
      { threshold: 0.25 },
    );
    observer.observe(video);
    return () => observer.disconnect();
  }, []);

  return (
    <section className="shell relative z-10 bg-midnight-deep py-24 md:py-36">
      <Reveal className="mb-10 flex flex-col gap-4">
        <p className="type-eyebrow text-electric">{dict.film.eyebrow}</p>
        <h2 className="type-display max-w-4xl text-[clamp(2rem,6vw,5rem)]">
          {dict.film.title}
        </h2>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="grain hairline relative aspect-video w-full overflow-hidden border bg-midnight">
          <video
            ref={videoRef}
            muted
            loop
            playsInline
            preload="none"
            poster={heroMedia.poster}
            className={`h-full w-full object-cover transition-opacity duration-1000 ${
              visible ? "opacity-100" : "opacity-70"
            }`}
          >
            <source src={heroMedia.webm} type="video/webm" />
            <source src={heroMedia.mp4} type="video/mp4" />
          </video>
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 bg-gradient-to-t from-midnight-deep/60 to-transparent"
          />
        </div>
      </Reveal>
    </section>
  );
}
