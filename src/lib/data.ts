import "server-only";

import { CATEGORIAS_PADRAO } from "./categorias";
import { NEWSLETTERS_EXEMPLO } from "./seed-data";
import { criarClientePublico } from "./supabase/server";
import { SUPABASE_CONFIGURADO } from "./supabase/config";
import type { Categoria, Newsletter } from "./types";

/**
 * Camada de leitura da área pública.
 *
 * Todas as funções caem no conteúdo de exemplo quando o Supabase não está
 * configurado (ou quando a consulta falha), para que o site nunca fique em
 * branco. O modo em uso é reportado por `usandoDadosDeExemplo`.
 */

const COLUNAS =
  "id, slug, titulo, categoria, status, data_publicacao, autor, resumo, tempo_leitura_min, capa_url, tags, corpo";

/** Publicadas primeiro as mais recentes; empate resolvido pelo título. */
function ordenarPorData(lista: Newsletter[]): Newsletter[] {
  return [...lista].sort(
    (a, b) =>
      b.data_publicacao.localeCompare(a.data_publicacao) ||
      a.titulo.localeCompare(b.titulo, "pt-BR"),
  );
}

function exemplosPublicados(): Newsletter[] {
  return ordenarPorData(
    NEWSLETTERS_EXEMPLO.filter((n) => n.status === "publicado"),
  );
}

export interface ResultadoNewsletters {
  newsletters: Newsletter[];
  /** `true` quando o conteúdo exibido veio de `seed-data.ts`. */
  exemplo: boolean;
}

/** Lista todas as edições **publicadas**, da mais recente para a mais antiga. */
export async function listarPublicadas(): Promise<ResultadoNewsletters> {
  if (!SUPABASE_CONFIGURADO) {
    return { newsletters: exemplosPublicados(), exemplo: true };
  }

  const supabase = criarClientePublico();
  const { data, error } = await supabase
    .from("newsletters")
    .select(COLUNAS)
    .eq("status", "publicado")
    .order("data_publicacao", { ascending: false });

  if (error || !data) {
    console.error("[ecoville-news] falha ao listar newsletters:", error?.message);
    return { newsletters: exemplosPublicados(), exemplo: true };
  }

  return { newsletters: data as Newsletter[], exemplo: false };
}

/** Busca uma edição publicada pelo slug. Retorna `null` se não existir. */
export async function buscarPorSlug(slug: string): Promise<Newsletter | null> {
  if (!SUPABASE_CONFIGURADO) {
    return exemplosPublicados().find((n) => n.slug === slug) ?? null;
  }

  const supabase = criarClientePublico();
  const { data, error } = await supabase
    .from("newsletters")
    .select(COLUNAS)
    .eq("slug", slug)
    .eq("status", "publicado")
    .maybeSingle();

  if (error) {
    console.error("[ecoville-news] falha ao buscar newsletter:", error.message);
    return exemplosPublicados().find((n) => n.slug === slug) ?? null;
  }

  return (data as Newsletter | null) ?? null;
}

/** Categorias cadastradas, em ordem de exibição. */
export async function listarCategorias(): Promise<Categoria[]> {
  if (!SUPABASE_CONFIGURADO) return CATEGORIAS_PADRAO;

  const supabase = criarClientePublico();
  const { data, error } = await supabase
    .from("categorias")
    .select("slug, nome, descricao, cor, ordem")
    .order("ordem", { ascending: true });

  if (error || !data?.length) return CATEGORIAS_PADRAO;
  return data as Categoria[];
}

/**
 * Vizinhas cronológicas de uma edição, para a navegação anterior/próxima.
 * "Próxima" é a edição mais recente que a atual.
 */
export function vizinhas(lista: Newsletter[], slug: string) {
  const i = lista.findIndex((n) => n.slug === slug);
  if (i === -1) return { anterior: null, proxima: null };
  return {
    proxima: i > 0 ? lista[i - 1] : null,
    anterior: i < lista.length - 1 ? lista[i + 1] : null,
  };
}

/** Contagem de edições publicadas por slug de categoria. */
export function contarPorCategoria(lista: Newsletter[]): Record<string, number> {
  return lista.reduce<Record<string, number>>((acc, n) => {
    acc[n.categoria] = (acc[n.categoria] ?? 0) + 1;
    return acc;
  }, {});
}
