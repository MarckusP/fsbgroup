"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Entrada por scroll usada em todas as seções abaixo do hero.
 *
 * `whileInView` já respeita prefers-reduced-motion via a redução global de duração
 * do globals.css; ainda assim o estado final é sempre opacidade 1, então nada some
 * para quem desativa animação.
 */
export function Reveal({
  children,
  delay = 0,
  y = 26,
  className = "",
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-12% 0px" }}
      transition={{ duration: 0.85, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}
