/**
 * Curvas e tempos da troca de seção do stage de /company e /events.
 *
 * Vive fora dos componentes porque os dois lados da troca — a coluna de texto e o bloco do
 * arco — precisam sair e entrar com a MESMA cadência para a cena ler como uma coisa só.
 * Ajuste fino de tempo se faz aqui, não espalhado pelos dois arquivos.
 *
 * Tudo aqui é dirigido por JS, então o `@media (prefers-reduced-motion)` do globals.css
 * (que só zera `animation-duration`/`transition-duration` do CSS) NÃO alcança estas
 * animações — daí cada fábrica receber `reduce` e devolver uma versão sem deslocamento,
 * sem blur e sem duração.
 *
 * O atraso de cada linha é passado à mão (`index`) em vez de sair de `staggerChildren`
 * numa variante de pai: a orquestração por variantes só dispara quando o próprio pai tem
 * valores animáveis, e aqui o pai é só um contêiner de layout — a cascata simplesmente não
 * acontecia. Com o atraso explícito, o que se lê no código é o que roda na tela.
 */

/** Mesma curva do `--ease-cinema` do globals.css, na forma que o `motion` aceita. */
export const STAGE_EASE = [0.16, 1, 0.3, 1] as const;

const TEXT_ENTER = 0.65;
const TEXT_EXIT = 0.3;
/** Intervalo entre eyebrow, título e descrição na entrada. */
const TEXT_STAGGER = 0.07;

/**
 * Uma linha da coluna de texto — `index` é a posição na cascata (0 = eyebrow).
 *
 * Sem `exit`: quem sai é o bloco inteiro, de uma vez (ver `textBlockExit`). Escalonar
 * também a saída dobraria o tempo em que a coluna está pela metade, e ali o que se quer é
 * liberar o espaço rápido pro texto novo assumir.
 */
export const textLine = (reduce: boolean, index: number) =>
  reduce
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, y: 18, filter: "blur(12px)" },
        animate: { opacity: 1, y: 0, filter: "blur(0px)" },
        transition: {
          duration: TEXT_ENTER,
          ease: STAGE_EASE,
          delay: 0.05 + index * TEXT_STAGGER,
        },
      };

/**
 * A saída do bloco de texto inteiro, no elemento que o `AnimatePresence` observa.
 *
 * Sobe ao sair, como sobe ao entrar: a coluna lê como um rolo de texto passando, não como
 * um elemento que vai e volta pelo mesmo caminho. A `transition` vai DENTRO do `exit` pra
 * não vazar para a entrada das linhas, que tem tempo próprio.
 */
export const textBlockExit = (reduce: boolean) =>
  reduce
    ? { exit: { opacity: 0, transition: { duration: 0 } } }
    : {
        exit: {
          opacity: 0,
          y: -14,
          filter: "blur(12px)",
          transition: { duration: TEXT_EXIT, ease: STAGE_EASE },
        },
      };
