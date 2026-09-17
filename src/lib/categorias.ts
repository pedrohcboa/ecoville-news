import type { Categoria } from "./types";

/**
 * Catálogo e aparência das trilhas editoriais.
 *
 * As categorias vivem na tabela `categorias` do Supabase e são criadas pelo
 * painel (`/admin/categorias`) — sem deploy. Este arquivo guarda duas coisas
 * que **não** podem morar no banco:
 *
 *  - o *fallback* usado quando o backend não está conectado (modo demonstração);
 *  - a paleta e os ícones, porque o Tailwind precisa enxergar a string completa
 *    da classe no código-fonte para gerar o CSS (montar nome de classe
 *    dinamicamente não funciona).
 *
 * Por isso a categoria não escolhe uma cor livre: ela escolhe um dos tokens de
 * `PALETA`, todos já validados contra as regras da marca (texto de leitura
 * nunca em amarelo, nunca amarelo sobre branco).
 */

export interface AparenciaCategoria {
  /** Chip/tag da categoria. Contraste AA garantido em todas as entradas. */
  chip: string;
  /** Gradiente usado como capa de fallback quando não há imagem. */
  capa: string;
  /** Cor sólida para barras e detalhes. */
  barra: string;
  /** Ícone sólido sobre a capa (cartão de trilha). */
  sobreCapa: string;
  /** Mesmo ícone como marca d'água discreta sobre a capa. */
  marcaDagua: string;
}

/**
 * Tokens de cor disponíveis para uma categoria.
 *
 * Mantenha em sincronia com o CHECK `categorias_cor_valida`
 * (`supabase/migrations/0003_categorias_gerenciaveis.sql`).
 */
export const PALETA: Record<string, AparenciaCategoria & { rotulo: string }> = {
  azul: {
    rotulo: "Azul Ecoville",
    chip: "bg-brand-blue text-white",
    capa: "bg-linear-to-br from-brand-blue to-brand-blue-deep",
    barra: "bg-brand-blue",
    sobreCapa: "text-white",
    marcaDagua: "text-white/30",
  },
  amarelo: {
    rotulo: "Amarelo",
    // Azul sobre amarelo: uma das combinações seguras da marca.
    chip: "bg-brand-yellow text-brand-blue",
    capa: "bg-linear-to-br from-brand-yellow to-brand-yellow-deep",
    barra: "bg-brand-yellow",
    sobreCapa: "text-brand-blue",
    marcaDagua: "text-brand-blue/35",
  },
  "azul-profundo": {
    rotulo: "Azul profundo",
    chip: "bg-brand-blue-deep text-white",
    capa: "bg-linear-to-br from-brand-blue-deep to-[#000740]",
    barra: "bg-brand-blue-deep",
    sobreCapa: "text-white",
    marcaDagua: "text-white/30",
  },
  "azul-claro": {
    rotulo: "Azul claro",
    chip: "bg-brand-blue-soft text-brand-blue-deep",
    capa: "bg-linear-to-br from-brand-blue-soft to-line-strong",
    barra: "bg-brand-blue-soft",
    sobreCapa: "text-brand-blue",
    marcaDagua: "text-brand-blue/35",
  },
  tinta: {
    rotulo: "Tinta",
    chip: "bg-ink text-white",
    capa: "bg-linear-to-br from-ink to-[#2b3550]",
    barra: "bg-ink",
    sobreCapa: "text-white",
    marcaDagua: "text-white/30",
  },
  neutra: {
    rotulo: "Cinza",
    chip: "bg-line-strong text-ink",
    capa: "bg-linear-to-br from-ink-faint to-ink-muted",
    barra: "bg-ink-faint",
    sobreCapa: "text-white",
    marcaDagua: "text-white/30",
  },
};

/** Ordem em que a paleta aparece no seletor do painel. */
export const CORES_DISPONIVEIS = Object.keys(PALETA);

/**
 * Ícones que uma categoria pode usar. O desenho de cada um está em
 * `src/components/ui/Icones.tsx`; aqui fica só o rótulo legível do seletor.
 *
 * Mantenha em sincronia com o CHECK `categorias_icone_valido`.
 */
export const ICONES: Record<string, string> = {
  frasco: "Frasco",
  loja: "Loja",
  megafone: "Megafone",
  moeda: "Moeda",
  radar: "Radar",
  pessoas: "Pessoas",
  estrela: "Estrela",
};

export const ICONES_DISPONIVEIS = Object.keys(ICONES);

const APARENCIA_NEUTRA = PALETA.neutra;

/** Aparência de uma categoria já carregada do banco. */
export function aparenciaCategoria(
  categoria: Pick<Categoria, "cor"> | undefined | null,
): AparenciaCategoria {
  return (categoria && PALETA[categoria.cor]) ?? APARENCIA_NEUTRA;
}

/** Aparência a partir de um token de cor solto (usado nas prévias do painel). */
export function aparenciaPorCor(cor: string): AparenciaCategoria {
  return PALETA[cor] ?? APARENCIA_NEUTRA;
}

/**
 * Aparência a partir do slug, procurando na lista de categorias carregada.
 * Usado onde só temos `newsletter.categoria` em mãos.
 */
export function aparenciaPorSlug(
  slug: string,
  categorias: Categoria[],
): AparenciaCategoria {
  return aparenciaCategoria(categorias.find((c) => c.slug === slug));
}

/** Ícone de uma categoria pelo slug, com fallback para a estrela. */
export function iconePorSlug(slug: string, categorias: Categoria[]): string {
  return categorias.find((c) => c.slug === slug)?.icone ?? "estrela";
}

/** Nome legível de uma categoria, com fallback para o próprio slug. */
export function nomeCategoria(slug: string, categorias: Categoria[]): string {
  return categorias.find((c) => c.slug === slug)?.nome ?? slug;
}

/**
 * Fallback do modo demonstração — espelha o que a migration 0003 deixa no
 * banco. Só aparece quando o Supabase não está configurado.
 */
export const CATEGORIAS_PADRAO: Categoria[] = [
  {
    slug: "vendas-e-lojas",
    nome: "Vendas e Lojas",
    descricao:
      "Desempenho das lojas, metas, vitrine, atendimento e o que está convertendo no balcão.",
    cor: "amarelo",
    icone: "loja",
    ordem: 1,
  },
  {
    slug: "radar-do-setor",
    nome: "Radar do Setor",
    descricao:
      "Movimentos do mercado, concorrência, tendências, regulação e o que vem pela frente.",
    cor: "azul-profundo",
    icone: "radar",
    ordem: 2,
  },
  {
    slug: "rede-e-comunidade",
    nome: "Rede e Comunidade",
    descricao:
      "Novidades entre franqueados, conquistas, eventos, treinamentos e histórias da rede.",
    cor: "azul-claro",
    icone: "pessoas",
    ordem: 3,
  },
  {
    slug: "produtos",
    nome: "Produtos",
    descricao:
      "Lançamentos, fichas técnicas, diferenciais, argumentos de venda e cuidados de uso e estoque.",
    cor: "azul",
    icone: "frasco",
    ordem: 4,
  },
  {
    slug: "impulsionar-a-loja",
    nome: "Impulsionar a Loja",
    descricao:
      "Marketing local, vitrine, campanhas, atendimento, conversão e giro de estoque.",
    cor: "neutra",
    icone: "megafone",
    ordem: 5,
  },
  {
    slug: "dicas-economicas",
    nome: "Dicas Econômicas",
    descricao:
      "Gestão de custos, precificação, margem, negociação e eficiência operacional.",
    cor: "tinta",
    icone: "moeda",
    ordem: 6,
  },
];
