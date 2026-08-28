/** Utilidades puras compartilhadas (sem dependência de React ou Supabase). */

/** Faixa Unicode dos sinais diacríticos combinantes gerados por `NFD`. */
const DIACRITICOS = /[̀-ͯ]/g;

/**
 * Converte um título em slug de URL: minúsculo, sem acento, sem símbolo.
 * Ex.: "Precificação & Margem 2026" -> "precificacao-margem-2026"
 */
export function gerarSlug(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(DIACRITICOS, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/**
 * Tempo de leitura em minutos, calculado a partir do HTML do corpo.
 * Base: 200 palavras por minuto (leitura técnica em português), mínimo de 1.
 */
export function calcularTempoLeitura(html: string): number {
  const texto = html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .trim();
  const palavras = texto ? texto.split(/\s+/).length : 0;
  return Math.max(1, Math.round(palavras / 200));
}

/**
 * Data ISO (YYYY-MM-DD) -> "12 de março de 2026".
 * Fixamos meio-dia UTC para que o fuso do navegador nunca puxe a data para o
 * dia anterior.
 */
export function formatarData(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T12:00:00Z`));
}

/** Data ISO -> "12/03/2026" (usado nas tabelas do painel). */
export function formatarDataCurta(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC" }).format(
    new Date(`${iso}T12:00:00Z`),
  );
}

/** Data de hoje no formato YYYY-MM-DD. */
export function hojeISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Remove acentos e caixa para comparação de busca. */
export function normalizarBusca(texto: string): string {
  return texto.normalize("NFD").replace(DIACRITICOS, "").toLowerCase();
}

/** Formata números com separador de milhar brasileiro. */
export function formatarNumero(n: number): string {
  return new Intl.NumberFormat("pt-BR").format(n);
}

/** Junta classes ignorando valores falsos — versão mínima do `clsx`. */
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * Slug único para uma cópia de edição. O sufixo em base 36 evita colidir com
 * o original (o slug é `unique` no banco).
 */
export function slugDeCopia(titulo: string): string {
  return `${gerarSlug(titulo)}-${Date.now().toString(36)}`;
}
