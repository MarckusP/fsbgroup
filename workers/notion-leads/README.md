# fsb-notion-leads

Cloudflare Worker que recebe o formulário de orçamento de /events e /company e cria um
card na coluna **Novo** do Kanban "Pipeline de Leads" no Notion.

## Publicar (uma vez)

1. **Integração no Notion** — em https://www.notion.so/profile/integrations crie uma
   integração *interna* ("FSB Site"), com permissão de *inserir conteúdo*. Copie o token
   (`ntn_...`).
2. **Dar acesso ao banco** — abra a página *FSB — Leads do Site* no Notion → `•••` →
   *Conexões* → adicione "FSB Site". Sem isto, a API responde 404.
3. **Publicar o Worker** (precisa de Node instalado e de uma conta Cloudflare gratuita):

   ```sh
   cd workers/notion-leads
   npx wrangler login
   npx wrangler secret put NOTION_TOKEN   # cole o token do passo 1
   npx wrangler deploy
   ```

   O deploy imprime a URL, algo como `https://fsb-notion-leads.<conta>.workers.dev`.
4. **Ligar o site** — cole essa URL em `leadsEndpoint`, em `content/site.ts`, e publique o
   site.

## Testar

`npx wrangler tail` mostra os logs em tempo real (erros do Notion aparecem aqui).
Para testar do `next dev`, `http://localhost:3000` já está em `ALLOWED_ORIGINS`.
