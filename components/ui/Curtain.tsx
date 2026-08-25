"use client";

import { useIntro } from "@/components/hero/IntroProvider";

/**
 * Segura um pedaço da página atrás da abertura.
 *
 * Os filhos continuam sendo server components — o Curtain só troca opacidade e
 * deslocamento, nunca desmonta. Isso é deliberado: o `<h1>`, os cards e o footer
 * precisam existir no HTML servido, senão o conteúdo do site passa a depender de uma
 * animação de 10 s. O `data-curtain` é o gancho da regra de `<noscript>` no layout.
 */
export function Curtain({
  children,
  delay = 0,
  lift = true,
  className = "",
}: {
  children: React.ReactNode;
  /** Escalonamento da entrada, em ms. */
  delay?: number;
  /**
   * Sobe alguns pixels ao entrar. Desligado no header: `transform` num ancestral vira
   * bloco de contenção e o `position: fixed` dele passaria a se ancorar na cortina.
   */
  lift?: boolean;
  className?: string;
}) {
  const { revealed } = useIntro();

  return (
    <div
      data-curtain=""
      // `inert` evita que o teclado caia dentro do que está invisível.
      inert={!revealed}
      className={`transition-[opacity,transform] duration-1000 ease-[var(--ease-cinema)] ${
        revealed ? "opacity-100" : `opacity-0 ${lift ? "translate-y-4" : ""}`
      } ${className}`}
      style={{ transitionDelay: revealed ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}
