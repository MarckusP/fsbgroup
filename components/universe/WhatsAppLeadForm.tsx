"use client";

import { ArrowUpRight } from "lucide-react";
import { type FormEvent, useState } from "react";
import { site } from "@/content/site";

const FIELD_CLASS =
  "hairline rounded-xl border bg-midnight-deep/40 px-3.5 py-2.5 text-sm text-bone placeholder:text-bone/30 outline-none backdrop-blur-md transition focus:border-electric [color-scheme:dark]";

/**
 * Formulário de contato de /company e /events, encaminhado pro WhatsApp em vez de um
 * POST (o site é estático, não tem backend pra receber lead).
 *
 * Só nome e data são obrigatórios — tipo, e-mail e detalhes ajudam a qualificar o
 * lead, mas não podem travar o envio de quem só quer marcar uma conversa rápida.
 *
 * Vive uma única vez por página, em `UniverseContactSection` (depois de todas as
 * seções do `UniverseStage`) — não remonta mais ao trocar de seção, então `defaultType`
 * chega vazio e quem preenche escolhe o próprio tipo.
 */
export function WhatsAppLeadForm({
  defaultType,
  typeLabel,
  nameLabel,
  namePlaceholder,
  dateLabel,
  emailLabel,
  emailPlaceholder,
  detailsLabel,
  detailsPlaceholder,
  cta,
}: {
  defaultType: string;
  typeLabel: string;
  nameLabel: string;
  namePlaceholder: string;
  dateLabel: string;
  emailLabel: string;
  emailPlaceholder: string;
  detailsLabel: string;
  detailsPlaceholder: string;
  cta: string;
}) {
  const [name, setName] = useState("");
  const [type, setType] = useState(defaultType);
  const [date, setDate] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const lines = [`Olá! Meu nome é ${name.trim()}.`, `Data: ${date}`];
    if (type.trim()) lines.push(`${typeLabel}: ${type.trim()}`);
    if (email.trim()) lines.push(`E-mail: ${email.trim()}`);
    if (details.trim()) lines.push(`Detalhes: ${details.trim()}`);

    const digits = site.contact.whatsappHref.replace(/\D/g, "");
    const url = `https://wa.me/${digits}?text=${encodeURIComponent(lines.join("\n"))}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-1 flex w-full max-w-2xl flex-col gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-xs text-bone/50">
          {nameLabel}
          <input
            required
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={namePlaceholder}
            className={FIELD_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs text-bone/50">
          {dateLabel}
          <input
            required
            type="date"
            name="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={FIELD_CLASS}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-xs text-bone/50">
          {typeLabel}
          <input
            name="type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            className={FIELD_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs text-bone/50">
          {emailLabel}
          <input
            type="email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder={emailPlaceholder}
            className={FIELD_CLASS}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-xs text-bone/50">
        {detailsLabel}
        <textarea
          name="details"
          rows={4}
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder={detailsPlaceholder}
          className={`${FIELD_CLASS} resize-none`}
        />
      </label>

      <button
        type="submit"
        className="mt-1 inline-flex items-center justify-center gap-2 self-center rounded-full border border-electric bg-electric px-6 py-3 text-sm font-medium text-bone transition duration-500 hover:bg-electric/85"
      >
        {cta}
        <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </form>
  );
}
