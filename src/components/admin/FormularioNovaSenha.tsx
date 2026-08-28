"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { MolduraAutenticacao } from "./MolduraAutenticacao";
import { Alerta, Campo, classesBotao, classesEntrada } from "./ui";
import { criarClienteNavegador } from "@/lib/supabase/client";

const MINIMO_SENHA = 8;

/**
 * Define uma senha nova depois que o editor clica no link recebido por e-mail.
 * O Supabase troca o link por uma sessão temporária; a partir dela basta
 * chamar `updateUser`.
 */
export function FormularioNovaSenha() {
  const router = useRouter();
  const [pronto, setPronto] = useState(false);
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  // Espera o Supabase processar o link de recuperação (evento PASSWORD_RECOVERY).
  useEffect(() => {
    const supabase = criarClienteNavegador();
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setPronto(true);
    });
    const { data: assinatura } = supabase.auth.onAuthStateChange((_evento, sessao) => {
      if (sessao) setPronto(true);
    });
    return () => assinatura.subscription.unsubscribe();
  }, []);

  async function salvar(evento: React.FormEvent) {
    evento.preventDefault();
    setErro(null);

    if (senha.length < MINIMO_SENHA) {
      setErro(`A senha precisa ter pelo menos ${MINIMO_SENHA} caracteres.`);
      return;
    }
    if (senha !== confirmacao) {
      setErro("As duas senhas não são iguais.");
      return;
    }

    setSalvando(true);
    try {
      const supabase = criarClienteNavegador();
      const { error } = await supabase.auth.updateUser({ password: senha });
      if (error) throw new Error(error.message);
      router.replace("/admin");
      router.refresh();
    } catch (e) {
      setErro(
        e instanceof Error
          ? `Não foi possível salvar: ${e.message}`
          : "Erro inesperado.",
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <MolduraAutenticacao
      titulo="Criar nova senha"
      descricao="Escolha uma senha com pelo menos 8 caracteres. Ela substitui a anterior imediatamente."
    >
      {!pronto ? (
        <Alerta tom="aviso">
          Abra esta página pelo link enviado ao seu e-mail. Se o link expirou,
          peça um novo em “Esqueci minha senha”.
        </Alerta>
      ) : (
        <form onSubmit={salvar} className="space-y-5">
          {erro && <Alerta tom="erro">{erro}</Alerta>}

          <Campo id="nova-senha" rotulo="Nova senha" obrigatorio>
            <input
              id="nova-senha"
              type="password"
              required
              autoComplete="new-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className={classesEntrada}
            />
          </Campo>

          <Campo id="confirmar-senha" rotulo="Repita a nova senha" obrigatorio>
            <input
              id="confirmar-senha"
              type="password"
              required
              autoComplete="new-password"
              value={confirmacao}
              onChange={(e) => setConfirmacao(e.target.value)}
              className={classesEntrada}
            />
          </Campo>

          <button
            type="submit"
            disabled={salvando}
            className={classesBotao("primario", "w-full py-3")}
          >
            {salvando ? "Salvando…" : "Salvar nova senha"}
          </button>
        </form>
      )}
    </MolduraAutenticacao>
  );
}
