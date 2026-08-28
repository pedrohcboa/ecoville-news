import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";

/**
 * Moldura das telas de autenticação (entrar, recuperar senha, nova senha).
 * Um cartão centralizado sobre o azul da marca — sem distrações.
 */
export function MolduraAutenticacao({
  titulo,
  descricao,
  children,
  rodape,
}: {
  titulo: string;
  descricao: string;
  children: React.ReactNode;
  rodape?: React.ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-brand-blue px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <Wordmark tom="claro" tamanho="lg" />
          <p className="mt-3 text-sm font-semibold tracking-wide text-brand-yellow">
            Painel do editor
          </p>
        </div>

        <div className="rounded-2xl bg-surface p-7 shadow-xl sm:p-9">
          <h1 className="text-2xl font-extrabold text-ink">{titulo}</h1>
          <p className="mt-2 text-sm leading-relaxed text-ink-muted">
            {descricao}
          </p>
          <div className="mt-6">{children}</div>
          {rodape && <div className="mt-6 text-sm">{rodape}</div>}
        </div>

        <p className="mt-6 text-center text-sm text-white/70">
          <Link href="/" className="underline hover:text-brand-yellow">
            Voltar para o site
          </Link>
        </p>
      </div>
    </div>
  );
}
