"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { heroMedia } from "@/content/site";
import type { Dictionary } from "@/lib/dictionaries";
import { useViewportHeight } from "@/hooks/useViewportHeight";
import { useIntro } from "./IntroProvider";
import { HeroPlayTrigger } from "./SoundToggle";

/**
 * O vídeo — abertura primeiro, fundo depois.
 *
 * Durante a abertura (§3) ele é o site inteiro: quadro limpo, sem gradiente, sem
 * vinheta, sem escala. Quando termina, `finish()` abre a página e o mesmo elemento
 * assume o papel de fundo do §7 — escurece, desfoca e amplia conforme o scroll, sem
 * nunca desmontar, porque desmontar mataria o áudio no meio da navegação.
 */
export function CinemaBackdrop({ dict }: { dict: Dictionary }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [canPlay, setCanPlay] = useState(false);
  const [forcePlay, setForcePlay] = useState(false);
  const reduceMotion = useReducedMotion();
  const { revealed, notePlayable, finish } = useIntro();

  // Com movimento reduzido, o vídeo só carrega se a pessoa pedir pelo botão.
  // `reduceMotion` é null até o primeiro efeito do motion, e null não é false —
  // por isso a comparação estrita, que segura o carregamento até haver resposta.
  const wantsVideo = forcePlay || reduceMotion === false;
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
    // A abertura espera por este arquivo, então ele deixa de ser opcional.
    video.preload = "auto";
    video.load();
    void video.play().catch(() => {
      // Autoplay bloqueado mesmo mudo. Não dá para abrir com um vídeo que não toca:
      // a página monta sobre o poster e o SoundToggle vira o botão de play.
      finish();
    });
  }, [wantsVideo, finish]);

  return (
    <>
      <motion.div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-midnight-deep"
        style={{ opacity }}
      >
        <motion.div
          className="absolute inset-0"
          style={{ filter }}
          // Na abertura o quadro é exato: escala 1, sem recorte. Ao revelar, ele recua
          // para o 1.04 de repouso e passa a obedecer ao scroll.
          animate={{ scale: revealed ? 1.04 : 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <motion.div className="absolute inset-0" style={{ scale: scrollScale }}>
            {/* Poster no HTML inicial: é ele que pinta primeiro e vira o LCP. */}
            <picture>
              <source
                media="(max-width: 767px)"
                srcSet={heroMedia.posterMobile}
              />
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
              muted
              playsInline
              preload="none"
              onCanPlay={() => {
                setCanPlay(true);
                notePlayable();
              }}
              onEnded={(event) => {
                // Fim do trailer: a página abre e o mesmo elemento vira fundo em loop.
                const video = event.currentTarget;
                video.loop = true;
                void video.play().catch(() => undefined);
                finish();
              }}
              className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${
                canPlay ? "opacity-100" : "opacity-0"
              }`}
            />
          </motion.div>
        </motion.div>

        {/* Grão, vinheta e rampa escura são o tratamento de FUNDO: garantem contraste
            do texto sobre qualquer frame. Na abertura não há texto, e eles sujariam o
            trailer — por isso entram junto com a página. */}
        <motion.div
          className="grain vignette absolute inset-0"
          initial={false}
          animate={{ opacity: revealed ? 1 : 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-midnight-deep/70 via-midnight/40 to-midnight-deep" />
        </motion.div>
      </motion.div>

      <HeroPlayTrigger
        dict={dict}
        reduceMotion={Boolean(reduceMotion)}
        onRequestPlay={() => setForcePlay(true)}
        videoStarted={canPlay}
      />
    </>
  );
}
