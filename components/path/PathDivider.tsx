/**
 * Fio decorativo entre os dois cards de caminho (§7–8 e §19) — Company e Events
 * liam como um bloco só; este traço fino com um ponto elétrico no meio separa
 * os dois sem brigar com o design existente. Puramente ornamental: aria-hidden.
 *
 * Vive numa coluna "auto" de um grid `[1fr_auto_1fr]` (desktop) que colapsa pra
 * uma única coluna no mobile — por isso os dois `<span>` trocam de eixo sozinhos
 * (horizontal empilhado, vertical lado a lado) sem que o pai precise saber qual
 * está ativo. A versão vertical estica com a altura da própria coluna do grid
 * (que o `align-items: stretch` padrão iguala à do card mais alto ao lado) e
 * usa só 70% dela via `self-center`, como pedido.
 */
export function PathDivider() {
  return (
    <div
      aria-hidden
      className="flex items-center justify-center py-1 md:h-full md:w-8 md:py-0 lg:w-12"
    >
      {/* Mobile: traço horizontal entre os cards empilhados. */}
      <span className="h-px w-16 shrink-0 bg-gradient-to-r from-transparent via-electric/40 to-transparent md:hidden" />

      {/* Desktop: traço vertical, 70% da altura do card, com o ponto no centro. */}
      <span className="relative hidden w-px shrink-0 self-center bg-gradient-to-b from-transparent via-electric/40 to-transparent md:block md:h-[70%]">
        <span className="absolute top-1/2 left-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rotate-45 bg-electric shadow-[0_0_10px_2px_rgb(23_67_244/0.55)]" />
      </span>
    </div>
  );
}
