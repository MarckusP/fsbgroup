import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // Toda a mídia já sai otimizada de scripts/prepare-media.mjs: WebP no tamanho
    // final, com width/height conhecidos. next/image só acrescentaria uma camada de
    // transformação em cima — e no baralho de fotos dos cards, onde as imagens
    // trocam dezenas de vezes por minuto, atrapalharia mais do que ajudaria.
    files: [
      "components/path/CardLayerStack.tsx",
      "components/sections/SoonScreen.tsx",
      "components/site/Footer.tsx",
      "components/site/Header.tsx",
      "components/hero/CinemaBackdrop.tsx",
    ],
    rules: { "@next/next/no-img-element": "off" },
  },
]);

export default eslintConfig;
