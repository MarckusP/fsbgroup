"use client";

import { ArrowUpRight } from "lucide-react";
import { type FormEvent, useState } from "react";
import type { Dictionary, Locale } from "@/content/dictionaries/types";
import type { Universe } from "@/content/media-pool";
import { site } from "@/content/site";

const FIELD_CLASS =
  "hairline rounded-xl border bg-midnight-deep/40 px-3.5 py-2.5 text-sm text-bone placeholder:text-bone/30 outline-none backdrop-blur-md transition focus:border-electric [color-scheme:dark]";

type Status = "idle" | "sending" | "success" | "error";

/**
 * Formulário de orçamento de /company e /events.
 *
 * Envia para o Kanban de leads do Notion através do Worker em `site.leadsEndpoint` (o
 * site é estático — o token do Notion não pode viver no navegador; ver
 * workers/notion-leads). Nome, telefone e data são obrigatórios: o telefone é por onde
 * a equipe retorna o lead.
 *
 * O WhatsApp continua como rede de segurança: sem endpoint configurado, o envio abre a
 * conversa como antes; se o Worker falhar, a mensagem de erro oferece o mesmo atalho já
 * preenchido — o lead nunca se perde.
 */
export function LeadForm({
  form,
  typeLabel,
  universe,
  locale,
}: {
  form: Dictionary["form"];
  /** "Tipo de evento" (Events) ou "Tipo de projeto" (Company). */
  typeLabel: string;
  universe: Universe;
  locale: Locale;
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [type, setType] = useState("");
  const [date, setDate] = useState("");
  const [email, setEmail] = useState("");
  const [details, setDetails] = useState("");
  /** Honeypot — invisível pra gente, preenchido por robôs; o Worker descarta. */
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<Status>("idle");

  const whatsappUrl = () => {
    const lines = [`${form.name}: ${name.trim()}`, `${form.phone}: ${phone.trim()}`, `${form.date}: ${date}`];
    if (type.trim()) lines.push(`${typeLabel}: ${type.trim()}`);
    if (email.trim()) lines.push(`E-mail: ${email.trim()}`);
    if (details.trim()) lines.push(details.trim());
    const digits = site.contact.whatsappHref.replace(/\D/g, "");
    return `https://wa.me/${digits}?text=${encodeURIComponent(lines.join("\n"))}`;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!site.leadsEndpoint) {
      window.open(whatsappUrl(), "_blank", "noopener,noreferrer");
      return;
    }

    setStatus("sending");
    try {
      const response = await fetch(site.leadsEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          type,
          date,
          email,
          details,
          website,
          universe: universe === "events" ? "Events" : "Company",
          locale,
        }),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus("success");
    } catch {
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <p role="status" className="mt-2 max-w-md text-balance text-base text-bone/85">
        {form.success}
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-1 flex w-full max-w-2xl flex-col gap-4 text-left">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-xs text-bone/50">
          {form.name}
          <input
            required
            name="name"
            autoComplete="name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={form.namePlaceholder}
            className={FIELD_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs text-bone/50">
          {form.phone}
          <input
            required
            type="tel"
            name="phone"
            autoComplete="tel"
            inputMode="tel"
            pattern="[0-9+()\-\s]{8,}"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            placeholder={form.phonePlaceholder}
            className={FIELD_CLASS}
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-xs text-bone/50">
          {form.date}
          <input
            required
            type="date"
            name="date"
            value={date}
            onChange={(event) => setDate(event.target.value)}
            className={FIELD_CLASS}
          />
        </label>

        <label className="flex flex-col gap-1.5 text-xs text-bone/50">
          {typeLabel}
          <input
            name="type"
            value={type}
            onChange={(event) => setType(event.target.value)}
            className={FIELD_CLASS}
          />
        </label>
      </div>

      <label className="flex flex-col gap-1.5 text-xs text-bone/50">
        {form.email}
        <input
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder={form.emailPlaceholder}
          className={FIELD_CLASS}
        />
      </label>

      <label className="flex flex-col gap-1.5 text-xs text-bone/50">
        {form.details}
        <textarea
          name="details"
          rows={4}
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          placeholder={form.detailsPlaceholder}
          className={`${FIELD_CLASS} resize-none`}
        />
      </label>

      {/* Honeypot: invisível, sem clique e fora da ordem de tabulação. */}
      <input
        aria-hidden
        tabIndex={-1}
        autoComplete="off"
        name="website"
        value={website}
        onChange={(event) => setWebsite(event.target.value)}
        className="pointer-events-none absolute h-0 w-0 opacity-0"
      />

      {status === "error" && (
        <p role="alert" className="text-center text-sm text-bone/70">
          {form.error}{" "}
          <a
            href={whatsappUrl()}
            target="_blank"
            rel="noopener noreferrer"
            className="text-electric underline underline-offset-4"
          >
            WhatsApp
          </a>
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="mt-1 inline-flex items-center justify-center gap-2 self-center rounded-full border border-electric bg-electric px-6 py-3 text-sm font-medium text-bone transition duration-500 hover:bg-electric/85 disabled:cursor-wait disabled:opacity-60"
      >
        {status === "sending" ? form.sending : form.cta}
        <ArrowUpRight className="h-4 w-4" strokeWidth={1.5} />
      </button>
    </form>
  );
}
