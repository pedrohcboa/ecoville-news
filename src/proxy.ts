import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { SUPABASE_ANON_KEY, SUPABASE_CONFIGURADO, SUPABASE_URL } from "@/lib/supabase/config";

/**
 * Proxy (antigo middleware) de sessão do painel.
 *
 * Duas responsabilidades:
 *  1. renovar o token do Supabase e reescrever os cookies em toda requisição
 *     do /admin (Server Components não podem gravar cookies);
 *  2. barrar quem não está logado antes mesmo da página renderizar.
 *
 * A área pública não passa por aqui — leitura é aberta e sem login.
 */

/** Rotas do /admin que precisam ficar acessíveis sem sessão. */
const ROTAS_LIVRES = ["/admin/login", "/admin/recuperar", "/admin/nova-senha"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Sem credenciais não há como validar sessão; deixamos o layout do painel
  // exibir a tela de "configure o Supabase".
  if (!SUPABASE_CONFIGURADO) return NextResponse.next();

  let resposta = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }
        resposta = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          resposta.cookies.set(name, value, options);
        }
      },
    },
  });

  // `getUser()` revalida o token no servidor — não confie apenas no cookie.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const rotaLivre = ROTAS_LIVRES.some((rota) => pathname.startsWith(rota));

  if (!user && !rotaLivre) {
    const destino = request.nextUrl.clone();
    destino.pathname = "/admin/login";
    // Guarda para onde o editor queria ir, e volta para lá após o login.
    destino.searchParams.set("proximo", pathname);
    return NextResponse.redirect(destino);
  }

  // Já logado não precisa ver a tela de login de novo.
  if (user && pathname === "/admin/login") {
    const destino = request.nextUrl.clone();
    destino.pathname = "/admin";
    destino.search = "";
    return NextResponse.redirect(destino);
  }

  return resposta;
}

export const config = {
  matcher: ["/admin/:path*"],
};
