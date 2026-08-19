# FSB Production — site institucional

Home cinematográfica em Next.js 16 (App Router) + TypeScript + Tailwind v4 + Motion.
PT-BR e EN completos. `/events` e `/company` são telas provisórias "em breve".

```bash
npm install
npm run dev            # http://localhost:3000  → redireciona para /pt
npm run build
node scripts/prepare-media.mjs          # regera /public/media a partir dos masters
node scripts/prepare-media.mjs --force  # refaz tudo, ignorando o que já existe
```

---

## ⚠️ Antes de publicar

| # | Pendência | Onde |
|---|---|---|
| 1 | **Preencher contato e redes.** Tudo é placeholder marcado com `TODO:` | `content/site.ts` |
| 2 | **Definir o domínio** (usado em metadata, OpenGraph e sitemap) | `content/site.ts` → `site.url` |
| 3 | Revisar as exclusões de imagens da seção abaixo | `content/media-pool.ts` |

---

## Achados da auditoria de mídia

O pipeline e o site já contornam tudo isto, mas vale saber:

**Marca d'água do Veo no hero.** O master `hero/fsb-hero.mp4` tem o ✨ do Google fixo no
canto inferior direito em todos os frames. O pipeline remove com `delogo` (a região é
escura e sem detalhe no clipe inteiro, então não sobra artefato). Se o hero for regerado
sem marca, apague a constante `DELOGO` em `scripts/prepare-media.mjs`.

**Hero em 720p.** 1280×720, 10 s. Em monitor grande fica suave. O Hero compensa com
vinheta, grão e gradiente, o que faz a suavidade ler como cinematográfica em vez de baixa
resolução. Para melhorar de verdade, regere no Veo em 1080p+ com o prompt do §4 do
briefing e substitua o arquivo — nada no código muda.

**Áudio de 10 s em loop.** O clipe tem whooshes marcados; com o som ligado, o loop fica
repetitivo. Uma faixa ambiente dedicada de 60–90 s resolveria; a arquitetura do
`SoundToggle` já aceita.

**Logos.** Os SVGs originais eram auto-vetorizados (160–330 KB, milhares de micro-paths) e
foram descartados. O pipeline recorta o vazio dos PNGs 1080×1080 e exporta WebP de ~23 KB
em 1x/2x. O selo circular (`fsb-reduzida-*`) traz **"STORYTELLIHC"** no anel externo, um
erro do arquivo original — por isso ele só aparece grande e apagado como textura de fundo.
**Corrija na fonte antes de qualquer uso impresso.**

### Imagens bloqueadas

Seis imagens **não** entram no site. Os arquivos continuam em `/public/media`; a lista com
o motivo de cada uma está em `content/media-pool.ts` (`BLOCKED`) — apagar a linha reativa.

| Arquivo | Motivo |
|---|---|
| `company-campanhas-publicitarias` | Propaganda eleitoral com candidatos reais (nomes, números, rostos) |
| `company-product-luxury-perfum` | Campanha David Beckham — celebridade e marca de terceiros |
| `company-perfume-luxo` | Jimmy Choo em destaque no quadro |
| `company-brand-campaigns` | Colagem com logos Dove, Crumbl, Rhode |
| `company-lifestyle-product` | Campanha de marca de terceiros |
| `events-fotografo-imprensa-evento` | Uniforme com marca de concorrente legível (perfocal.com) |

Exibir campanhas de terceiros num site institucional sugere que a FSB as produziu, e o
material eleitoral ainda associa a marca a candidatos específicos.

**Consequência:** o pool Company caiu de 13 para **8** imagens (Events tem 22). O briefing
pede 12–20 por universo. Funciona, mas o card Company repete visivelmente mais rápido —
**+6 imagens de produto/estúdio equilibram**. Basta jogar na pasta `company/` e rodar o
pipeline.

---

## Estrutura

```
company/ events/ hero/ logos/   masters brutos — fora do git, entrada do pipeline
public/media/                   derivados web — o que o site consome
scripts/prepare-media.mjs       ffmpeg: recorte, WebP, delogo, versões mobile, manifesto

app/[lang]/                     /pt e /en, ambos estáticos
proxy.ts                        "/" → /pt (Accept-Language como dica)

content/dictionaries/           types.ts é a fonte da verdade; pt.ts e en.ts são tipados
                                contra ela, então chave faltando QUEBRA O BUILD
content/media-pool.generated.ts inventário gerado (não editar)
content/media-pool.ts           curadoria: ordem de exibição e lista de bloqueio
content/site.ts                 contato, redes, caminhos de mídia

components/hero/                CinemaBackdrop (vídeo fixo), HeroWords, SoundToggle
components/path/                PathSelector, PathCard, CardLayerStack
hooks/usePointerDeck.ts         movimento do cursor → sequência de imagens
```

### Duas decisões que valem entender

**O vídeo do hero é um único elemento `fixed`** que atravessa o Hero e a seção de escolha,
escurecendo e desfocando conforme o scroll (§7 do briefing: "o vídeo não terminou, ele
continua atrás"). Ele **nunca desmonta** — só vai a `opacity: 0` — porque desmontar
mataria o áudio no meio da navegação.

**O baralho de fotos (`usePointerDeck`)** não é parallax: é a *distância percorrida* pelo
cursor que puxa a próxima imagem, a cada 90 px, entrando na direção do movimento com
escala e blur (§10: "a câmera está atravessando diferentes trabalhos da FSB"). Durante o
movimento o React não re-renderiza — o rAF escreve duas CSS custom properties no card e as
camadas leem no próprio `transform`. Só a troca discreta de imagem toca o estado.

---

## Acessibilidade

`prefers-reduced-motion` desliga o baralho, o parallax e o autoplay do vídeo (fica no
poster, com botão de play). Cards navegáveis por teclado, foco visível, skip link,
imagens do pool marcadas como decorativas. Responsivo de 320 px em diante.

## Idiomas

Adicionar um idioma: incluir o código em `LOCALES` (`content/dictionaries/types.ts`),
criar o dicionário e registrá-lo em `lib/dictionaries.ts`. As rotas, o `hreflang`, o
sitemap e o seletor PT | EN se ajustam sozinhos.
