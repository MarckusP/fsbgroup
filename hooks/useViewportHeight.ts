"use client";

import { useEffect, useState } from "react";

/**
 * Altura da viewport em px, para mapear scroll → progresso das seções.
 *
 * O fallback de 800 vale só no primeiro render (SSR e antes do efeito); como o
 * scroll começa em 0, nenhuma transformação depende dele visualmente.
 */
export function useViewportHeight(fallback = 800) {
  const [height, setHeight] = useState(fallback);

  useEffect(() => {
    const measure = () => setHeight(window.innerHeight);
    measure();
    window.addEventListener("resize", measure, { passive: true });
    return () => window.removeEventListener("resize", measure);
  }, []);

  return height;
}
