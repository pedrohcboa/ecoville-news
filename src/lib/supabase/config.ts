/**
 * Leitura centralizada das variáveis de ambiente do Supabase.
 *
 * O site foi desenhado para funcionar em dois modos:
 *  - **conectado**: as variáveis existem e todo o conteúdo vem do banco;
 *  - **demonstração**: sem variáveis, a área pública renderiza os dados de
 *    exemplo (`seed-data.ts`) e o painel exibe um aviso de configuração.
 *
 * Isso mantém o projeto executável logo após o `npm install`, sem quebrar a
 * build quando o `.env.local` ainda não foi preenchido.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

/**
 * Chave pública do projeto. Aceita tanto a chave `anon` (JWT legado) quanto a
 * nova chave publicável (`sb_publishable_...`).
 */
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** `true` quando há credenciais suficientes para falar com o Supabase. */
export const SUPABASE_CONFIGURADO = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);

/** Nome do bucket de Storage onde ficam capas e imagens do corpo. */
export const BUCKET_IMAGENS = "newsletter-imagens";
