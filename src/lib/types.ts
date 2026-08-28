/**
 * Tipos compartilhados entre area publica e painel.
 * Os nomes dos campos espelham as colunas da tabela `newsletters` no Supabase
 * para evitar camadas de traducao desnecessarias.
 */

export type StatusNewsletter = "rascunho" | "publicado";

export interface Newsletter {
  id: string;
  slug: string;
  titulo: string;
  categoria: string; // slug da categoria (FK -> categorias.slug)
  status: StatusNewsletter;
  data_publicacao: string; // YYYY-MM-DD
  autor: string;
  resumo: string;
  tempo_leitura_min: number;
  capa_url: string | null;
  tags: string[];
  corpo: string; // HTML rico gerado pelo editor visual
  created_at?: string;
  updated_at?: string;
}

/** Campos editaveis no painel (id/timestamps sao do banco). */
export type NewsletterInput = Omit<Newsletter, "id" | "created_at" | "updated_at"> & {
  id?: string;
};

export interface Categoria {
  slug: string;
  nome: string;
  descricao: string;
  /** Token CSS da cor da categoria (ver globals.css). */
  cor: string;
  ordem: number;
}

/** Evento de analytics anonimo. Nunca carrega dado pessoal do leitor. */
export interface EventoInput {
  tipo: string;
  alvo?: string | null;
  newsletter_id?: string | null;
  categoria?: string | null;
  path?: string | null;
}
