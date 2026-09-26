/**
 * FSB — recebe o formulário de orçamento do site e cria um card no Notion.
 *
 * O site é estático (GitHub Pages): não dá para guardar o token do Notion no navegador,
 * e a API do Notion não aceita chamadas do browser (CORS). Este Worker é o intermediário
 * — o formulário faz POST aqui, e só aqui o token existe (como secret do Cloudflare).
 *
 * Variáveis (ver wrangler.toml e README):
 *   NOTION_TOKEN          secret — token da integração interna do Notion
 *   NOTION_DATA_SOURCE_ID id da fonte de dados "Pipeline de Leads"
 *   ALLOWED_ORIGINS       origens aceitas, separadas por vírgula
 */

const NOTION_VERSION = "2025-09-03";
const LOCALES = ["pt", "en", "es"];
const ORIGINS = ["Events", "Company"];
/** Limite por campo — o Notion corta rich_text em 2000 caracteres por bloco. */
const MAX_TEXT = 2000;

const worker = {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") ?? "";
    const allowed = (env.ALLOWED_ORIGINS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean);
    const cors = {
      "Access-Control-Allow-Origin": allowed.includes(origin) ? origin : allowed[0] ?? "",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      Vary: "Origin",
    };

    if (request.method === "OPTIONS") return new Response(null, { status: 204, headers: cors });
    if (request.method !== "POST") return json({ error: "method" }, 405, cors);
    if (!allowed.includes(origin)) return json({ error: "origin" }, 403, cors);

    let body;
    try {
      body = await request.json();
    } catch {
      return json({ error: "json" }, 400, cors);
    }

    // Honeypot: campo invisível no formulário. Gente não preenche; robô preenche.
    // Responde 200 para o robô não perceber que foi barrado.
    if (text(body.website)) return json({ ok: true }, 200, cors);

    const lead = {
      name: text(body.name),
      phone: text(body.phone).replace(/[^\d+()\-\s]/g, ""),
      email: text(body.email),
      date: text(body.date),
      type: text(body.type),
      details: text(body.details),
      universe: ORIGINS.find((value) => value.toLowerCase() === text(body.universe).toLowerCase()),
      locale: LOCALES.includes(text(body.locale)) ? text(body.locale) : undefined,
    };

    const phoneDigits = lead.phone.replace(/\D/g, "");
    if (!lead.name || phoneDigits.length < 8 || !/^\d{4}-\d{2}-\d{2}$/.test(lead.date)) {
      return json({ error: "validation" }, 422, cors);
    }
    if (lead.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(lead.email)) {
      return json({ error: "validation" }, 422, cors);
    }

    const properties = {
      Nome: { title: richText(lead.name) },
      Etapa: { select: { name: "Novo" } },
      Telefone: { phone_number: lead.phone },
      "Data desejada": { date: { start: lead.date } },
    };
    if (lead.email) properties["E-mail"] = { email: lead.email };
    if (lead.type) properties.Tipo = { rich_text: richText(lead.type) };
    if (lead.details) properties.Detalhes = { rich_text: richText(lead.details) };
    if (lead.universe) properties.Origem = { select: { name: lead.universe } };
    if (lead.locale) properties.Idioma = { select: { name: lead.locale } };

    const response = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.NOTION_TOKEN}`,
        "Notion-Version": NOTION_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        parent: { type: "data_source_id", data_source_id: env.NOTION_DATA_SOURCE_ID },
        properties,
      }),
    });

    if (!response.ok) {
      // O detalhe fica no log do Worker (`wrangler tail`), nunca na resposta pública.
      console.error("Notion", response.status, await response.text());
      return json({ error: "notion" }, 502, cors);
    }
    return json({ ok: true }, 200, cors);
  },
};

export default worker;

function text(value) {
  return typeof value === "string" ? value.trim().slice(0, MAX_TEXT) : "";
}

function richText(content) {
  return [{ type: "text", text: { content } }];
}

function json(data, status, headers) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...headers, "Content-Type": "application/json" },
  });
}
