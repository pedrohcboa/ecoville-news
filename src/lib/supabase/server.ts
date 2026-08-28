import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_CONFIGURADO, SUPABASE_URL } from "./config";

/**
 * Cliente Supabase para Server Components, Route Handlers e Server Actions.
 * Lê e grava a sessão nos cookies da requisição (necessário para o /admin).
 */
export async function criarClienteServidor() {
  const cookieStore = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Server Components não podem escrever cookies. A renovação da
          // sessão acontece no middleware, então é seguro ignorar aqui.
        }
      },
    },
  });
}

/**
 * Cliente somente-leitura para a área pública.
 *
 * Não depende de cookies (portanto não força renderização dinâmica por causa
 * de sessão) e enxerga apenas o que a política de RLS libera para o papel
 * anônimo — ou seja, newsletters publicadas.
 */
export function criarClientePublico() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

/**
 * Cliente administrativo (service role). Usado **exclusivamente** no servidor,
 * para gravar eventos de analytics sem expor a tabela `events` à escrita
 * pública. Nunca importe este módulo em código de cliente.
 */
export function criarClienteServico() {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_CONFIGURADO || !serviceKey) return null;

  return createClient(SUPABASE_URL, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
