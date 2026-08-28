import type { Categoria } from "./types";

/**
 * Catálogo de categorias.
 *
 * As categorias vivem na tabela `categorias` do Supabase — extensível pelo
 * banco, sem precisar de deploy. Este arquivo guarda apenas o *fallback* usado
 * quando o backend ainda não está conectado, mais o mapa de aparência
 * (cor/ícone), que é inerentemente visual. Categorias novas criadas no banco
 * herdam a aparência neutra definida em `APARENCIA_NEUTRA`.
 */
export const CATEGORIAS_PADRAO: Categoria[] = [
  {
    slug: "produtos",
    nome: "Produtos",
    descricao:
      "Lançamentos, fichas técnicas, diferenciais, argumentos de venda e cuidados de uso e estoque.",
    cor: "produtos",
    ordem: 1,
  },
  {
    slug: "impulsionar-a-loja",
    nome: "Impulsionar a Loja",
    descricao:
      "Marketing local, vitrine, campanhas, atendimento, conversão e giro de estoque.",
    cor: "impulsionar",
    ordem: 2,
  },
  {
    slug: "dicas-economicas",
    nome: "Dicas Econômicas",
    descricao:
      "Gestão de custos, precificação, margem, negociação e eficiência operacional.",
    cor: "dicas",
    ordem: 3,
  },
];

/**
 * Aparência de cada categoria: classes utilitárias já resolvidas, porque o
 * Tailwind precisa enxergar a string completa no código-fonte para gerar o CSS
 * (montar nome de classe dinamicamente não funciona).
 */
export interface AparenciaCategoria {
  /** Chip/tag da categoria. */
  chip: string;
  /** Gradiente usado como capa de fallback quando não há imagem. */
  capa: string;
  /** Cor sólida para barras e detalhes. */
  barra: string;
  /** Ícone representativo (desenhado em `IconeCategoria`). */
  icone: "frasco" | "megafone" | "moeda" | "estrela";
}

const APARENCIAS: Record<string, AparenciaCategoria> = {
  produtos: {
    chip: "bg-brand-blue text-white",
    capa: "bg-linear-to-br from-brand-blue to-brand-blue-deep",
    barra: "bg-brand-blue",
    icone: "frasco",
  },
  "impulsionar-a-loja": {
    // Azul sobre amarelo: uma das combinações seguras da marca.
    chip: "bg-brand-yellow text-brand-blue",
    capa: "bg-linear-to-br from-brand-yellow to-brand-yellow-deep",
    barra: "bg-brand-yellow",
    icone: "megafone",
  },
  "dicas-economicas": {
    chip: "bg-ink text-white",
    capa: "bg-linear-to-br from-ink to-[#2b3550]",
    barra: "bg-ink",
    icone: "moeda",
  },
};

const APARENCIA_NEUTRA: AparenciaCategoria = {
  chip: "bg-brand-blue-soft text-brand-blue-deep",
  capa: "bg-linear-to-br from-brand-blue-soft to-line-strong",
  barra: "bg-brand-blue-soft",
  icone: "estrela",
};

export function aparenciaCategoria(slug: string): AparenciaCategoria {
  return APARENCIAS[slug] ?? APARENCIA_NEUTRA;
}

/** Nome legível de uma categoria, com fallback para o próprio slug. */
export function nomeCategoria(slug: string, categorias: Categoria[]): string {
  return categorias.find((c) => c.slug === slug)?.nome ?? slug;
}
