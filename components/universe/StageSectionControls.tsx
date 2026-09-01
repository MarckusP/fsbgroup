"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";

/**
 * Par de botões circulares abaixo do arco: seção anterior e próxima seção.
 *
 * Sem barra de progresso de propósito — o conceito tem uma, mas o pedido foi
 * explicitamente para não indicar o número de seções aqui (a barra lateral já mostra
 * onde a pessoa está).
 */
export function StageSectionControls({
  onPrev,
  onNext,
  hasPrev,
  hasNext,
  prevLabel,
  nextLabel,
}: {
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
  prevLabel: string;
  nextLabel: string;
}) {
  return (
    <div className="flex items-start justify-center gap-10 sm:gap-14">
      <ControlButton label={prevLabel} enabled={hasPrev} onClick={onPrev}>
        <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
      </ControlButton>
      <ControlButton label={nextLabel} enabled={hasNext} onClick={onNext}>
        <ArrowRight className="h-5 w-5" strokeWidth={1.5} />
      </ControlButton>
    </div>
  );
}

/**
 * Anel + rótulo. Nas pontas o botão fica `disabled` em vez de sumir: o par some do lugar
 * se um dos dois desaparecer, e o arco abaixo passaria a "pular" lateralmente a cada
 * troca de seção.
 */
function ControlButton({
  label,
  enabled,
  onClick,
  children,
}: {
  label: string;
  enabled: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!enabled}
      className={`group flex flex-col items-center gap-3 transition-opacity duration-500 ${
        enabled ? "text-bone" : "pointer-events-none opacity-25"
      }`}
    >
      <span
        aria-hidden
        className={`flex h-14 w-14 items-center justify-center rounded-full border transition-all duration-500 ease-[var(--ease-hover)] ${
          enabled
            ? "border-electric/60 bg-electric/[0.06] group-hover:border-electric group-hover:bg-electric/15 group-hover:shadow-[0_0_28px_-6px_var(--color-electric)]"
            : "border-bone/15"
        }`}
      >
        {children}
      </span>
      {/* Mesmo vocabulário de rótulo da barra lateral (`.type-eyebrow` fica em 11px,
          pequeno demais para um controle isolado no meio da coluna). */}
      <span className="font-display text-[0.6875rem] font-semibold uppercase tracking-[0.3em] text-bone/55 transition-colors duration-500 group-hover:text-bone">
        {label}
      </span>
    </button>
  );
}
