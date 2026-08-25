"use client";

import { Play } from "lucide-react";
import { useRef, useState } from "react";
import { filmMedia } from "@/content/site";
import type { Dictionary } from "@/lib/dictionaries";
import { Reveal } from "../ui/Reveal";

/**
 * §16 — o filme institucional em formato grande.
 *
 * Só toca por clique — nunca sozinho, nem na primeira vez nem nas seguintes. Ao
 * terminar, volta pro primeiro frame e mostra o botão de novo: repetir também exige
 * um clique.
 */
export function FilmSection({ dict }: { dict: Dictionary }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const handlePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    setPlaying(true);
    void video.play().catch(() => setPlaying(false));
  };

  const handleEnded = () => {
    const video = videoRef.current;
    if (video) video.currentTime = 0;
    setPlaying(false);
  };

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
            playsInline
            preload="none"
            poster={filmMedia.poster}
            controls={playing}
            onEnded={handleEnded}
            className="h-full w-full object-cover"
          >
            <source src={filmMedia.webm} type="video/webm" />
            <source src={filmMedia.mp4} type="video/mp4" />
          </video>

          {!playing && (
            <>
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-midnight-deep/60 to-transparent"
              />
              <button
                type="button"
                onClick={handlePlay}
                aria-label={dict.film.play}
                title={dict.film.play}
                className="group absolute inset-0 flex items-center justify-center bg-midnight-deep/10 transition hover:bg-midnight-deep/20"
              >
                <span className="hairline flex h-20 w-20 items-center justify-center rounded-full border bg-midnight-deep/60 text-bone backdrop-blur-md transition group-hover:border-electric group-hover:text-electric md:h-24 md:w-24">
                  <Play className="h-8 w-8 translate-x-0.5" strokeWidth={1.5} />
                </span>
              </button>
            </>
          )}
        </div>
      </Reveal>
    </section>
  );
}
