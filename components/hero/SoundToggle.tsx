"use client";

import { Play, Volume2, VolumeX } from "lucide-react";
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

/**
 * Liga/desliga o som do vídeo do hero. Fica no canto inferior esquerdo (o gatilho de
 * play ocupa o direito) e só aparece com o vídeo rodando e o hero na tela.
 */
export function HeroSoundButton({
  dict,
  muted,
  visible,
  onToggle,
}: {
  dict: Dictionary;
  muted: boolean;
  visible: boolean;
  onToggle: () => void;
}) {
  if (!visible) return null;

  const label = muted ? dict.film.unmute : dict.film.mute;
  const Icon = muted ? VolumeX : Volume2;

  return (
    <button
      type="button"
      onClick={onToggle}
      data-hero-sound
      aria-label={label}
      aria-pressed={!muted}
      title={label}
      className="hairline fixed bottom-5 left-5 z-50 flex h-12 w-12 items-center justify-center rounded-full border bg-midnight-deep/60 text-bone/70 backdrop-blur-md transition hover:border-electric hover:text-bone focus-visible:text-bone md:bottom-8 md:left-8"
    >
      <Icon className="h-5 w-5" strokeWidth={1.5} />
    </button>
  );
}
