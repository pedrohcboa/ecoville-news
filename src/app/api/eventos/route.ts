import { NextResponse } from "next/server";
import { criarClientePublico, criarClienteServico } from "@/lib/supabase/server";
import { SUPABASE_CONFIGURADO } from "@/lib/supabase/config";

/**
 * Coleta de eventos anônimos.
 * -------------------------------------------------------------------------
 * Recebe os eventos disparados por `src/lib/analytics.ts` e grava em
 * `public.events`.
 *
 * Privacidade: gravamos apenas o tipo do evento, o alvo (nome do botão), a
 * edição relacionada, o caminho da página, o referrer e o user-agent truncado.
 * **Não** guardamos IP, e-mail, nome nem qualquer identificador persistente —
 * o `session_id` é aleatório e vive só enquanto a aba estiver aberta.
 */

/** Tipos aceitos — precisa bater com a política RLS `events_insercao_anonima`. */
const TIPOS_VALIDOS = new Set([
  "pageview",
  "newsletter_open",
  "click",
  "busca",
  "filtro_categoria",
]);

/** Corta strings para não deixar o cliente inflar a tabela. */
function limitar(valor: unknown, max: number): string | null {
  if (typeof valor !== "string") return null;
  const limpo = valor.trim();
  return limpo ? limpo.slice(0, max) : null;
}

export async function POST(request: Request) {
  // Sem backend configurado, o site funciona em modo demonstração e os
  // eventos simplesmente não são gravados.
  if (!SUPABASE_CONFIGURADO) {
    return new NextResponse(null, { status: 204 });
  }

  let corpo: Record<string, unknown>;
  try {
    corpo = await request.json();
  } catch {
    return NextResponse.json({ erro: "JSON inválido" }, { status: 400 });
  }

  const tipo = limitar(corpo.tipo, 40);
  if (!tipo || !TIPOS_VALIDOS.has(tipo)) {
    return NextResponse.json({ erro: "Tipo de evento inválido" }, { status: 400 });
  }

  const newsletterId = limitar(corpo.newsletter_id, 36);
  const registro = {
    tipo,
    alvo: limitar(corpo.alvo, 120),
    // Só aceitamos UUID para não quebrar a foreign key com lixo.
    newsletter_id:
      newsletterId &&
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        newsletterId,
      )
        ? newsletterId
        : null,
    categoria: limitar(corpo.categoria, 60),
    path: limitar(corpo.path, 300),
    session_id: limitar(corpo.session_id, 64),
    referrer: limitar(request.headers.get("referer"), 300),
    user_agent: limitar(request.headers.get("user-agent"), 300),
  };

  // Preferimos a service key (ignora RLS) quando ela existe; caso contrário a
  // chave pública grava via política de INSERT restrita.
  const supabase = criarClienteServico() ?? criarClientePublico();
  const { error } = await supabase.from("events").insert(registro);

  if (error) {
    console.error("[ecoville-news] falha ao registrar evento:", error.message);
    // Analytics nunca deve virar erro visível para o leitor.
    return new NextResponse(null, { status: 204 });
  }

  return new NextResponse(null, { status: 204 });
}
