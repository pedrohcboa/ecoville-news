import Link from "next/link";
import { redirect } from "next/navigation";
import { Wordmark } from "@/components/brand/Wordmark";
import { BotaoSair } from "@/components/admin/BotaoSair";
import { NavegacaoPainel } from "@/components/admin/NavegacaoPainel";
import { Alerta } from "@/components/admin/ui";
import { MolduraAutenticacao } from "@/components/admin/MolduraAutenticacao";
import { criarClienteServidor } from "@/lib/supabase/server";
import { SUPABASE_CONFIGURADO } from "@/lib/supabase/config";

/**
 * Área protegida do painel.
 *
 * Duas camadas de proteção, de propósito:
 *  - o middleware barra quem não tem sessão antes da renderização;
 *  - este layout confirma a sessão no servidor **e** exige que o usuário
 *    esteja na allowlist `public.editores`.
 *
 * Estar apenas autenticado não dá direito de publicar.
 */
export default async function LayoutPainel({ children }: LayoutProps<"/admin">) {
  if (!SUPABASE_CONFIGURADO) {
    return (
      <MolduraAutenticacao
        titulo="Backend não configurado"
        descricao="O painel precisa das credenciais do Supabase para funcionar."
      >
        <Alerta tom="aviso">
          Preencha <code className="font-mono">NEXT_PUBLIC_SUPABASE_URL</code> e{" "}
          <code className="font-mono">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> no
          arquivo <code className="font-mono">.env.local</code> e reinicie o
          servidor.
        </Alerta>
      </MolduraAutenticacao>
    );
  }

  const supabase = await criarClienteServidor();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");

  // Confere a allowlist. Na primeira vez (tabela vazia) o usuário logado é
  // promovido automaticamente a editor — ver `reivindicar_primeiro_editor`.
  let { data: editor } = await supabase
    .from("editores")
    .select("user_id, nome, papel")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!editor) {
    await supabase.rpc("reivindicar_primeiro_editor");
    ({ data: editor } = await supabase
      .from("editores")
      .select("user_id, nome, papel")
      .eq("user_id", user.id)
      .maybeSingle());
  }

  if (!editor) {
    return (
      <MolduraAutenticacao
        titulo="Sem permissão de edição"
        descricao="Sua conta existe, mas ainda não está autorizada a publicar no Ecoville News."
        rodape={<BotaoSair />}
      >
        <Alerta tom="aviso">
          Peça a um editor atual para liberar seu acesso adicionando seu e-mail
          (<strong>{user.email}</strong>) à tabela{" "}
          <code className="font-mono">editores</code> no Supabase.
        </Alerta>
      </MolduraAutenticacao>
    );
  }

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-4 gap-y-2 px-4 py-4 sm:px-6">
          <Link href="/admin" className="rounded-md">
            <Wordmark tamanho="sm" />
          </Link>
          <span className="rounded-full bg-brand-blue-soft px-2.5 py-1 text-[0.6875rem] font-bold tracking-wide text-brand-blue-deep uppercase">
            Painel
          </span>

          <div className="ml-auto flex items-center gap-3">
            <Link
              href="/"
              target="_blank"
              className="text-sm font-semibold text-brand-blue hover:underline"
            >
              Ver site
            </Link>
            <span
              className="hidden text-sm text-ink-faint sm:inline"
              title={user.email ?? undefined}
            >
              {user.email}
            </span>
            <BotaoSair compacto />
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <NavegacaoPainel />
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
