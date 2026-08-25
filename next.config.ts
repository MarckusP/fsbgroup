import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // GitHub Pages só serve arquivos estáticos: sem servidor Node, sem Proxy. `out/`
  // vira o conteúdo publicado (ver .github/workflows/deploy.yml).
  output: "export",
  // `/pt` → `/pt/index.html` em vez de `/pt.html`: é o formato que hosts baseados em
  // diretório (GitHub Pages incluído) resolvem corretamente ao servir uma pasta.
  trailingSlash: true,
};

export default nextConfig;
