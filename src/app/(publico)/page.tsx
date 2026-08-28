import Link from "next/link";
import { Hero } from "@/components/site/Hero";
import { Contadores } from "@/components/site/Contadores";
import { Destaque } from "@/components/site/Destaque";
import { GradeCategorias } from "@/components/site/GradeCategorias";
import { NewsletterCard } from "@/components/site/NewsletterCard";
import { LinkRastreado } from "@/components/site/LinkRastreado";
import { AvisoDemonstracao } from "@/components/site/AvisoDemonstracao";
import { IconeSeta } from "@/components/ui/Icones";
import { contarPorCategoria, listarCategorias, listarPublicadas } from "@/lib/data";

/** A home reflete o banco a cada requisição — publicar aparece na hora. */
export const revalidate = 0;

export default async function Home() {
  const [{ newsletters, exemplo }, categorias] = await Promise.all([
    listarPublicadas(),
    listarCategorias(),
  ]);

  const [maisRecente, ...demais] = newsletters;
  const contagem = contarPorCategoria(newsletters);

  return (
    <>
      {exemplo && <AvisoDemonstracao />}

      <Hero />

      {/* Números calculados a partir do conteúdo real — nunca fixos. */}
      <Contadores
        totalEdicoes={newsletters.length}
        totalCategorias={categorias.length}
      />

      {/* ---------------- Destaque da última edição ---------------- */}
      {maisRecente && (
        <section
          id="ultimas"
          aria-labelledby="titulo-destaque"
          className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-16 sm:px-6 lg:pt-20"
        >
          <h2
            id="titulo-destaque"
            className="text-xs font-bold tracking-[0.16em] text-brand-blue uppercase"
          >
            Em destaque
          </h2>
          <div className="mt-5">
            <Destaque newsletter={maisRecente} categorias={categorias} />
          </div>
        </section>
      )}

      {/* ---------------- Edições recentes ---------------- */}
      {demais.length > 0 && (
        <section
          aria-labelledby="titulo-recentes"
          className="mx-auto max-w-6xl px-4 pt-16 sm:px-6"
        >
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2
                id="titulo-recentes"
                className="text-3xl font-extrabold text-ink"
              >
                Edições recentes
              </h2>
              <p className="mt-2 text-ink-muted">
                O que a rede publicou por último.
              </p>
            </div>
            <LinkRastreado
              href="/edicoes"
              alvo="home_ver_arquivo"
              className="inline-flex items-center gap-2 text-sm font-bold text-brand-blue hover:underline"
            >
              Ver arquivo completo
              <IconeSeta className="size-4" />
            </LinkRastreado>
          </div>

          <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {demais.slice(0, 6).map((n) => (
              <li key={n.id}>
                <NewsletterCard newsletter={n} categorias={categorias} />
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* ---------------- Estado vazio (nenhuma edição publicada) ------- */}
      {newsletters.length === 0 && (
        <section className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6">
          <h2 className="text-3xl font-extrabold text-ink">
            Nenhuma edição publicada ainda
          </h2>
          <p className="mt-4 text-ink-muted">
            Assim que a matriz publicar a primeira newsletter, ela aparece aqui.
          </p>
          <Link
            href="/admin"
            className="mt-8 inline-block rounded-lg bg-brand-blue px-6 py-3 font-bold text-white hover:bg-brand-blue-deep"
          >
            Ir para o painel do editor
          </Link>
        </section>
      )}

      {/* ---------------- Navegação por categoria ---------------- */}
      <section
        id="categorias"
        aria-labelledby="titulo-categorias"
        className="mx-auto max-w-6xl scroll-mt-24 px-4 pt-20 sm:px-6"
      >
        <h2 id="titulo-categorias" className="text-3xl font-extrabold text-ink">
          Trilhas de conteúdo
        </h2>
        <p className="mt-2 max-w-2xl text-ink-muted">
          Cada trilha responde a uma pergunta diferente da operação. Escolha por
          onde começar.
        </p>
        <div className="mt-8">
          <GradeCategorias categorias={categorias} contagem={contagem} />
        </div>
      </section>

      {/* ---------------- Como funciona ---------------- */}
      <section
        id="sobre"
        aria-labelledby="titulo-sobre"
        className="mx-auto mt-24 max-w-6xl scroll-mt-24 px-4 sm:px-6"
      >
        <div className="grid gap-10 rounded-3xl border border-line bg-surface p-8 shadow-card sm:p-12 lg:grid-cols-2">
          <div>
            <h2
              id="titulo-sobre"
              className="text-3xl font-extrabold text-ink"
            >
              Como usar o <span className="marca-texto">Ecoville News</span>
            </h2>
            <p className="mt-4 leading-relaxed text-ink-muted">
              O Ecoville News é o canal da matriz para levar às unidades o que
              muda o resultado do mês: o que está entrando no portfólio, o que
              executar na loja e o que revisar na planilha. Material interno,
              escrito para quem opera.
            </p>
            <Link
              href="/sobre"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-blue hover:underline"
            >
              Entender a proposta
              <IconeSeta className="size-4" />
            </Link>
          </div>

          <ol className="space-y-5">
            {[
              {
                titulo: "Leia com a equipe",
                texto:
                  "Use as edições como pauta de reunião rápida antes da abertura da loja.",
              },
              {
                titulo: "Transforme em ação",
                texto:
                  "Cada edição fecha com passos aplicáveis na semana — escolha um e execute.",
              },
              {
                titulo: "Volte quando precisar",
                texto:
                  "O arquivo fica sempre disponível e é pesquisável por título, resumo e tag.",
              },
            ].map((passo, i) => (
              <li key={passo.titulo} className="flex gap-4">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-brand-blue font-display text-sm font-extrabold text-white">
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold text-ink">{passo.titulo}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {passo.texto}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
