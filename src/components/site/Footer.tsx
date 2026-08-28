import Link from "next/link";
import { Wordmark } from "@/components/brand/Wordmark";
import type { Categoria } from "@/lib/types";

/**
 * Footer em colunas: marca, trilhas editoriais e navegação de apoio.
 * Fecha com o aviso de uso interno e a assinatura da marca.
 */
export function Footer({ categorias }: { categorias: Categoria[] }) {
  const ano = new Date().getFullYear();

  return (
    <footer className="on-blue mt-24 bg-brand-blue text-white">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Wordmark tom="claro" tamanho="md" />
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/75">
              Publicação interna da rede Ecoville para franqueados. Conteúdo
              operacional e estratégico para aplicar na unidade — produto,
              loja e resultado.
            </p>
          </div>

          <nav aria-labelledby="rodape-trilhas">
            <h2
              id="rodape-trilhas"
              className="text-xs font-bold tracking-[0.14em] text-brand-yellow uppercase"
            >
              Trilhas
            </h2>
            <ul className="mt-4 space-y-2.5">
              {categorias.map((c) => (
                <li key={c.slug}>
                  <Link
                    href={`/categorias/${c.slug}`}
                    className="text-sm text-white/80 transition-colors hover:text-brand-yellow"
                  >
                    {c.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="rodape-navegacao">
            <h2
              id="rodape-navegacao"
              className="text-xs font-bold tracking-[0.14em] text-brand-yellow uppercase"
            >
              Navegar
            </h2>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link
                  href="/edicoes"
                  className="text-sm text-white/80 transition-colors hover:text-brand-yellow"
                >
                  Arquivo de edições
                </Link>
              </li>
              <li>
                <Link
                  href="/sobre"
                  className="text-sm text-white/80 transition-colors hover:text-brand-yellow"
                >
                  Como funciona
                </Link>
              </li>
              <li>
                <Link
                  href="/admin"
                  className="text-sm text-white/80 transition-colors hover:text-brand-yellow"
                >
                  Painel do editor
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <div className="mt-12 rounded-xl border border-white/20 bg-white/5 p-4 text-sm text-white/80">
          <strong className="font-semibold text-white">
            Uso interno e confidencial.
          </strong>{" "}
          Material dirigido exclusivamente a franqueados e equipes das unidades
          Ecoville. Não divulgue o link nem o conteúdo fora da rede.
        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/15 pt-6 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {ano} Ecoville. Todos os direitos reservados.</p>
          <p className="font-semibold tracking-wide text-brand-yellow">
            Especialista em Limpeza
          </p>
        </div>
      </div>
    </footer>
  );
}
