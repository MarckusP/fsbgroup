"use client";

import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { heroMedia } from "@/content/site";
import type { Dictionary } from "@/lib/dictionaries";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { useIntroDone } from "@/lib/intro";
import { HeroPlayTrigger, HeroSoundButton } from "./SoundToggle";

/**
 * O vídeo de fundo do hero (§1/§7) — toca em loop desde o primeiro frame, sem
 * abertura em tela cheia segurando o resto da página. Escurece, desfoca e amplia
 * conforme o scroll, e some de vez depois da seção de escolha de caminho.
 */
export function CinemaBackdrop({ dict }: { dict: Dictionary }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canPlay, setCanPlay] = useState(false);
  const [forcePlay, setForcePlay] = useState(false);
  const [muted, setMuted] = useState(true);
  // O hero saiu de cena (vídeo com opacidade 0): o som não pode continuar tocando.
  const [offStage, setOffStage] = useState(false);
  // Preferência da pessoa — devolvida ao vídeo quando o hero volta à tela.
  const soundPreferred = useRef(true);
  const reduceMotion = useReducedMotion();

  // Com movimento reduzido, o vídeo só carrega se a pessoa pedir pelo botão.
  // `reduceMotion` é null até o primeiro efeito do motion, e null não é false —
  // por isso a comparação estrita, que segura o carregamento até haver resposta.
  // E, com movimento liberado, só depois que a abertura da logo pousa (IntroLogo) — até
  // lá o poster segura a tela.
  const introDone = useIntroDone();
  const wantsVideo = forcePlay || (reduceMotion === false && introDone);
  const vh = useViewportHeight();

  const { scrollY } = useScroll();
  // 0–1vh: hero. 1–2vh: escolha do caminho, vídeo recuando. >2vh: fora de cena.
  const brightness = useTransform(scrollY, [0, vh, vh * 2], [1, 0.62, 0.42]);
  const blur = useTransform(scrollY, [0, vh, vh * 2], [0, 3, 6]);
  const scrollScale = useTransform(scrollY, [0, vh * 2], [1.04, 1.16]);
  const opacity = useTransform(scrollY, [vh * 2, vh * 2.6], [1, 0]);
  const filter = useTransform(
    [brightness, blur],
    ([b, px]: number[]) => `brightness(${b}) blur(${px}px)`,
  );

  useMotionValueEvent(scrollY, "change", (y) => setOffStage(y > vh * 2.6));

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (offStage) video.muted = true;
    else if (soundPreferred.current) video.muted = false;
  }, [offStage]);

  const toggleSound = () => {
    const video = videoRef.current;
    if (!video) return;
    soundPreferred.current = video.muted;
    video.muted = !video.muted;
    void video.play().catch(() => undefined);
  };

  // Só carrega o vídeo depois de saber o viewport: a versão mobile é 9:16 e pesa 1/3.
  // Até lá o poster (já no HTML) segura a tela, então não há salto visual.
  useEffect(() => {
    if (!wantsVideo) return;
    const video = videoRef.current;
    if (!video) return;

    const isMobile = window.matchMedia("(max-width: 767px)").matches;
    const sources = isMobile
      ? [{ src: heroMedia.mp4Mobile, type: "video/mp4" }]
      : [
          { src: heroMedia.webm, type: "video/webm" },
          { src: heroMedia.mp4, type: "video/mp4" },
        ];

    for (const { src, type } of sources) {
      const el = document.createElement("source");
      el.src = src;
      el.type = type;
      video.appendChild(el);
    }
    video.preload = "auto";
    video.load();

    // Tenta tocar já com som. Navegadores só liberam áudio automático se o usuário já
    // interagiu com o site (ou se o site tem alto engajamento); senão o play() é recusado
    // e caímos para mudo, ligando o som na primeira interação real (clique, toque, tecla —
    // scroll sozinho não conta como gesto).
    const events = ["pointerdown", "keydown", "touchend", "click"] as const;
    const unmute = (event: Event) => {
      // O botão de som cuida do próprio toggle; senão o pointerdown liga e o click desliga.
      if ((event.target as Element | null)?.closest?.("[data-hero-sound]")) return;
      video.muted = false;
      void video.play().catch(() => undefined);
      removeListeners();
    };
    const removeListeners = () => {
      for (const name of events) window.removeEventListener(name, unmute);
    };

    video.muted = false;
    video.play().catch(() => {
      video.muted = true;
      void video.play().catch(() => undefined);
      for (const name of events) window.addEventListener(name, unmute, { once: true });
    });

    return removeListeners;
  }, [wantsVideo]);

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-midnight-deep"
        style={{ opacity }}
      >
        <motion.div className="absolute inset-0" style={{ filter, scale: scrollScale }}>
          {/* Poster no HTML inicial: é ele que pinta primeiro e vira o LCP. */}
          <picture>
            <source media="(max-width: 767px)" srcSet={heroMedia.posterMobile} />
            <img
              src={heroMedia.poster}
              alt=""
              width={1280}
              height={720}
              fetchPriority="high"
              className="absolute inset-0 h-full w-full object-cover"
            />
          </picture>

          <video
            ref={videoRef}
            loop
            playsInline
            preload="none"
            onCanPlay={(event) => {
              setCanPlay(true);
              setMuted(event.currentTarget.muted);
            }}
            onVolumeChange={(event) => setMuted(event.currentTarget.muted)}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
              canPlay ? "opacity-100" : "opacity-0"
            }`}
          />
        </motion.div>

        {/* Grão, vinheta e rampa escura garantem contraste do texto sobre qualquer
            frame do vídeo. */}
        <div className="grain vignette absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-midnight-deep/70 via-midnight/40 to-midnight-deep" />
        </div>
      </motion.div>

      <HeroSoundButton
        dict={dict}
        muted={muted}
        visible={canPlay && !offStage}
        onToggle={toggleSound}
      />

      <HeroPlayTrigger
        dict={dict}
        reduceMotion={Boolean(reduceMotion)}
        onRequestPlay={() => setForcePlay(true)}
        videoStarted={canPlay}
      />
    </>
  );
}
