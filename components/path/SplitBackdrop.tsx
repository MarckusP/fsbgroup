/**
 * Fundo dividido ATRÁS dos cards de caminho: a página partida em duas metades de ponta a
 * ponta da tela — um azul escuro do lado de Events e um azul quase preto do lado de Company —
 * dois tons do mesmo azul, com contraste leve, não dois blocos. No mobile, com os cards empilhados, a divisão vira horizontal (azul em cima).
 *
 * Vai dentro de um wrapper `relative isolate`: o `isolate` prende o `-z-10` ali dentro,
 * pra metade ficar atrás dos cards sem descer pra trás do resto da página. `w-screen`
 * centrado estoura o `.shell` do pai e cobre a largura toda; a divisa cai exatamente no
 * meio, onde está o `PathDivider` da coluna central do grid. As pontas de cima e de baixo
 * esmaecem por máscara (transparente → pleno → transparente), então a faixa entra e sai do site sem linha dura.
 */
export function SplitBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-y-0 left-1/2 -z-10 w-screen -translate-x-1/2 bg-[linear-gradient(to_bottom,rgb(11_31_110/0.5)_0%,rgb(11_31_110/0.42)_42%,rgb(3_8_36/0.6)_58%,rgb(3_8_36/0.7)_100%)] md:bg-[linear-gradient(to_right,rgb(11_31_110/0.5)_0%,rgb(11_31_110/0.42)_40%,rgb(3_8_36/0.6)_60%,rgb(3_8_36/0.7)_100%)] [-webkit-mask-image:linear-gradient(to_bottom,transparent,black_28%,black_72%,transparent)] [mask-image:linear-gradient(to_bottom,transparent,black_28%,black_72%,transparent)]"
    />
  );
}
