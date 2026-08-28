/**
 * Faixa exibida quando o site está rodando com o conteúdo de exemplo — ou
 * seja, sem conexão com o Supabase. Deixa explícito para quem estiver
 * avaliando o projeto que aqueles textos são placeholders.
 */
export function AvisoDemonstracao() {
  return (
    <div className="border-b border-brand-yellow-deep bg-brand-yellow">
      <p className="mx-auto max-w-6xl px-4 py-2.5 text-center text-sm font-semibold text-brand-blue sm:px-6">
        Modo demonstração: exibindo edições de exemplo. Configure as variáveis
        do Supabase em <code className="font-mono">.env.local</code> para usar o
        conteúdo real.
      </p>
    </div>
  );
}
