"use client";

import type { EventoInput } from "./types";

/**
 * Rastreamento de eventos — camada de cliente.
 * -------------------------------------------------------------------------
 * Complementa o Vercel Web Analytics (que entrega tráfego agregado) com o dado
 * que ele não dá: **qual botão foi clicado e em qual edição**.
 *
 * Privacidade: nenhum dado pessoal é coletado. O leitor é identificado apenas
 * por um `session_id` aleatório guardado em `sessionStorage`, que morre quando
 * a aba fecha e não permite reidentificar ninguém.
 */

const CHAVE_SESSAO = "ecoville_news_sid";

function idDeSessao(): string {
  if (typeof window === "undefined") return "";
  try {
    let id = window.sessionStorage.getItem(CHAVE_SESSAO);
    if (!id) {
      id = crypto.randomUUID();
      window.sessionStorage.setItem(CHAVE_SESSAO, id);
    }
    return id;
  } catch {
    // Navegação anônima ou storage bloqueado: seguimos sem identificar a
    // sessão. O evento ainda é contabilizado, só não agrupa por visitante.
    return "";
  }
}

/**
 * Envia um evento para `/api/eventos`.
 *
 * Usa `navigator.sendBeacon` quando disponível para que o registro sobreviva à
 * navegação imediata (o caso típico: clicar num link e sair da página).
 * Falhas são silenciosas de propósito — analytics nunca deve atrapalhar a
 * leitura.
 */
export function registrarEvento(evento: EventoInput): void {
  if (typeof window === "undefined") return;

  const corpo = JSON.stringify({
    ...evento,
    session_id: idDeSessao(),
    path: evento.path ?? window.location.pathname,
  });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/eventos",
        new Blob([corpo], { type: "application/json" }),
      );
      return;
    }
    void fetch("/api/eventos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: corpo,
      keepalive: true,
    });
  } catch {
    /* analytics é best-effort */
  }
}

/** Atalhos nomeados para os eventos usados no site. */
export const eventos = {
  pageview: (path: string) => registrarEvento({ tipo: "pageview", path }),

  /** Abertura da página de uma edição. */
  aberturaNewsletter: (newsletterId: string, categoria: string) =>
    registrarEvento({
      tipo: "newsletter_open",
      newsletter_id: newsletterId,
      categoria,
    }),

  /** Clique em um botão/CTA nomeado. */
  clique: (alvo: string, extra: Partial<EventoInput> = {}) =>
    registrarEvento({ tipo: "click", alvo, ...extra }),

  /** Termo pesquisado (registrado só quando o usuário para de digitar). */
  busca: (termo: string) =>
    registrarEvento({ tipo: "busca", alvo: termo.slice(0, 80) }),

  /** Filtro de categoria aplicado no catálogo. */
  filtroCategoria: (categoria: string) =>
    registrarEvento({ tipo: "filtro_categoria", alvo: categoria, categoria }),
};
