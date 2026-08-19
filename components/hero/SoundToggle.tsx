"use client";

import { Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState, type RefObject } from "react";
import type { Dictionary } from "@/lib/dictionaries";

const STORAGE_KEY = "fsb:sound";

/**
 * Controle discreto de som (§6).
 *
 * O vídeo começa mudo porque nenhum navegador permite autoplay com áudio. O primeiro
 * clique conta como interação do usuário e libera a trilha; a escolha fica no
 * localStorage para as próximas visitas.
 */
export function SoundToggle({
  videoRef,
  dict,
  reduceMotion,
  onRequestPlay,
  videoStarted,
}: {
  videoRef: RefObject<HTMLVideoElement | null>;
  dict: Dictionary;
  reduceMotion: boolean;
  onRequestPlay: () => void;
  videoStarted: boolean;
}) {
  const [soundOn, setSoundOn] = useState(false);

  // Com o som já autorizado numa visita anterior, religa assim que o vídeo puder tocar.
  useEffect(() => {
    if (!videoStarted) return;
    if (localStorage.getItem(STORAGE_KEY) !== "on") return;
    const video = videoRef.current;
    if (!video) return;
    video.muted = false;
    void video
      .play()
      .then(() => setSoundOn(true))
      .catch(() => {
        // Ainda sem interação nesta sessão: segue mudo até o clique.
        video.muted = true;
      });
  }, [videoStarted, videoRef]);

  const toggle = () => {
    if (reduceMotion && !videoStarted) {
      onRequestPlay();
      return;
    }
    const video = videoRef.current;
    if (!video) return;
    const next = !soundOn;
    video.muted = !next;
    if (next) void video.play().catch(() => undefined);
    setSoundOn(next);
    localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
  };

  const showPlayIcon = reduceMotion && !videoStarted;
  const label = showPlayIcon
    ? dict.film.play
    : soundOn
      ? dict.hero.sound.disable
      : dict.hero.sound.enable;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      aria-pressed={showPlayIcon ? undefined : soundOn}
      title={label}
      className="hairline fixed bottom-5 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full border bg-midnight-deep/60 text-bone/70 backdrop-blur-md transition hover:border-electric hover:text-bone focus-visible:text-bone md:bottom-8 md:right-8"
    >
      {showPlayIcon ? (
        <Play className="h-4 w-4 translate-x-px" strokeWidth={1.5} />
      ) : soundOn ? (
        <Volume2 className="h-4 w-4" strokeWidth={1.5} />
      ) : (
        <VolumeX className="h-4 w-4" strokeWidth={1.5} />
      )}
    </button>
  );
}
