"use client";

import { useSyncExternalStore } from "react";

/**
 * Sinal global "a abertura da logo terminou" (ver `IntroLogo`).
 *
 * Vive no módulo, não num estado de componente: sobrevive à navegação client-side, então
 * voltar pra home a partir de /events não repete a abertura — ela é de quem ABRE o site.
 * O vídeo e as palavras do hero esperam por este sinal pra começar.
 */
let done = false;
const listeners = new Set<() => void>();

export function markIntroDone() {
  if (done) return;
  done = true;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** `false` no HTML do servidor: a primeira pintura sempre é a da abertura. */
export function useIntroDone() {
  return useSyncExternalStore(
    subscribe,
    () => done,
    () => false,
  );
}
