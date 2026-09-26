/**
 * Fio decorativo entre os dois cards de caminho (§7–8 e §19) — Company e Events
 * liam como um bloco só; este traço fino e branco, esmaecendo nas pontas, separa
 * os dois sem brigar com o design existente. Puramente ornamental: aria-hidden.
 *
 * Vive numa coluna "auto" de um grid `[1fr_auto_1fr]` (desktop) que colapsa pra
 * uma única coluna no mobile — por isso os dois `<span>` trocam de eixo sozinhos
 * (horizontal empilhado, vertical lado a lado) sem que o pai precise saber qual
 * está ativo. A versão vertical estica com a altura da própria coluna do grid
 * (que o `align-items: stretch` padrão iguala à do card mais alto ao lado) e
 * usa 90% dela via `self-center`.
 */
export function PathDivider() {
  return (
    <div
      aria-hidden
      className="flex items-center justify-center py-2 md:h-full md:w-8 md:py-0 lg:w-12"
    >
      {/* Mobile: traço horizontal entre os cards empilhados. */}
      <span className="h-px w-40 shrink-0 bg-gradient-to-r from-transparent via-white to-transparent md:hidden" />

      {/* Desktop: traço vertical branco, quase da altura inteira do card. */}
      <span className="hidden w-px shrink-0 self-center bg-gradient-to-b from-transparent via-white to-transparent md:block md:h-[90%]" />
    </div>
  );
}
