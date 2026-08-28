"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { MolduraAutenticacao } from "./MolduraAutenticacao";
import { Alerta, Campo, classesBotao, classesEntrada } from "./ui";
import { criarClienteNavegador } from "@/lib/supabase/client";
import { SUPABASE_CONFIGURADO } from "@/lib/supabase/config";

/**
 * Tela de entrada do painel (Supabase Auth, e-mail + senha).
 * Mensagens de erro traduzidas — o editor não deve ver texto em inglês.
 */
export function FormularioLogin() {
  const router = useRouter();
  const parametros = useSearchParams();
  const proximo = parametros.get("proximo") ?? "/admin";

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function entrar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);
    setEnviando(true);

    try {
      const supabase = criarClienteNavegador();
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: senha,
      });

      if (error) {
        setErro(
          error.message.includes("Invalid login credentials")
            ? "E-mail ou senha incorretos. Confira e tente de novo."
            : `Não foi possível entrar: ${error.message}`,
        );
        return;
      }

      // `refresh` faz o servidor reler os cookies de sessão recém-gravados.
      router.replace(proximo.startsWith("/admin") ? proximo : "/admin");
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Erro inesperado ao entrar.");
    } finally {
      setEnviando(false);
    }
  }

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

  return (
    <MolduraAutenticacao
      titulo="Entrar no painel"
      descricao="Use o e-mail e a senha cadastrados para publicar as edições do Ecoville News."
      rodape={
        <Link
          href="/admin/recuperar"
          className="font-semibold text-brand-blue hover:underline"
        >
          Esqueci minha senha
        </Link>
      }
    >
      <form onSubmit={entrar} className="space-y-5">
        {erro && <Alerta tom="erro">{erro}</Alerta>}

        <Campo id="email" rotulo="E-mail" obrigatorio>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={classesEntrada}
            placeholder="voce@ecoville.com.br"
          />
        </Campo>

        <Campo id="senha" rotulo="Senha" obrigatorio>
          <input
            id="senha"
            type="password"
            required
            autoComplete="current-password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            className={classesEntrada}
            placeholder="••••••••"
          />
        </Campo>

        <button
          type="submit"
          disabled={enviando}
          className={classesBotao("primario", "w-full py-3")}
        >
          {enviando ? "Entrando…" : "Entrar"}
        </button>
      </form>
    </MolduraAutenticacao>
  );
}
