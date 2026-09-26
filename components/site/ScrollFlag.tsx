"use client";

import { useEffect } from "react";

/**
 * Marca `<html data-scrolled>` assim que a página sai do topo. O cabeçalho é Server
 * Component e fixo; é pelo CSS (globals.css) que ele ganha fundo translúcido com desfoque
 * quando há conteúdo passando por baixo — no topo continua transparente sobre o vídeo.
 */
export function ScrollFlag() {
  useEffect(() => {
    const root = document.documentElement;
    const update = () => {
      if (window.scrollY > 24) root.dataset.scrolled = "";
      else delete root.dataset.scrolled;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);
  return null;
}
