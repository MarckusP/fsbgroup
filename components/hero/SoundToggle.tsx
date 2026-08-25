"use client";

import { Play } from "lucide-react";
import type { Dictionary } from "@/lib/dictionaries";

/**
 * Gatilho de reprodução do hero (§6), sem áudio.
 *
 * O vídeo do hero não tem trilha — só existe para pessoas com movimento reduzido, que
 * não recebem o vídeo automaticamente (ver `wantsVideo` em `CinemaBackdrop`). Uma vez
 * que o vídeo começa, o botão some.
 */
export function HeroPlayTrigger({
  dict,
  reduceMotion,
  onRequestPlay,
  videoStarted,
}: {
  dict: Dictionary;
  reduceMotion: boolean;
  onRequestPlay: () => void;
  videoStarted: boolean;
}) {
  if (!reduceMotion || videoStarted) return null;

  return (
    <button
      type="button"
      onClick={onRequestPlay}
      aria-label={dict.film.play}
      title={dict.film.play}
      className="hairline fixed bottom-5 right-5 z-50 flex h-15 w-15 items-center justify-center rounded-full border bg-midnight-deep/60 text-bone/70 backdrop-blur-md transition hover:border-electric hover:text-bone focus-visible:text-bone md:bottom-8 md:right-8"
    >
      <Play className="h-6 w-6 translate-x-px" strokeWidth={1.5} />
    </button>
  );
}
