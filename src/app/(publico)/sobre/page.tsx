import type { Metadata } from "next";
import { LinkRastreado } from "@/components/site/LinkRastreado";
import { IconeCategoria, IconeSeta } from "@/components/ui/Icones";
import { aparenciaCategoria } from "@/lib/categorias";
import { listarCategorias } from "@/lib/data";

export const metadata: Metadata = {
  title: "Como funciona",
  description:
    "O que é o Ecoville News, para quem é e como usar o conteúdo na sua unidade.",
};

export default async function PaginaSobre() {
  const categorias = await listarCategorias();

  return (
    <>
      <header className="on-blue bg-brand-blue text-white">
        <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:py-20">
          <p className="text-xs font-bold tracking-[0.2em] text-brand-yellow uppercase">
            Como funciona
          </p>
          <h1 className="mt-4 text-4xl leading-tight font-extrabold sm:text-5xl">
            Material interno, feito para quem opera a loja.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-white/80">
            O Ecoville News é o canal editorial da matriz para as unidades
            franqueadas. Cada edição existe para virar decisão na semana
            seguinte — não para ser lida e esquecida.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6">
        <section aria-labelledby="para-quem">
          <h2 id="para-quem" className="text-2xl font-extrabold text-ink">
            Para quem é
          </h2>
          <p className="mt-3 leading-relaxed text-ink-muted">
            Franqueados, gerentes e equipes das unidades Ecoville. A linguagem é
            de operação de franquia e varejo: margem, giro, conversão, ficha
            técnica. Não é material de comunicação com o consumidor final e não
            deve ser reaproveitado como tal.
          </p>
        </section>

        <section aria-labelledby="periodicidade" className="mt-12">
          <h2 id="periodicidade" className="text-2xl font-extrabold text-ink">
            Periodicidade
          </h2>
          <p className="mt-3 leading-relaxed text-ink-muted">
            As edições são publicadas de forma recorrente pela matriz. Toda
            edição nova aparece automaticamente na home e no arquivo — não há
            cadastro nem e-mail para receber: basta acessar o link interno.
          </p>
        </section>

        <section aria-labelledby="trilhas" className="mt-12">
          <h2 id="trilhas" className="text-2xl font-extrabold text-ink">
            As trilhas
          </h2>
          <ul className="mt-5 space-y-4">
            {categorias.map((c) => {
              const aparencia = aparenciaCategoria(c.slug);
              return (
                <li
                  key={c.slug}
                  className="flex gap-4 rounded-2xl border border-line bg-surface p-5"
                >
                  <span
                    className={`inline-flex size-11 shrink-0 items-center justify-center rounded-xl ${aparencia.capa}`}
                  >
                    <IconeCategoria
                      categoria={c.slug}
                      className={`size-5 ${
                        c.slug === "impulsionar-a-loja"
                          ? "text-brand-blue"
                          : "text-white"
                      }`}
                    />
                  </span>
                  <div>
                    <h3 className="font-bold text-ink">{c.nome}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                      {c.descricao}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="como-usar" className="mt-12">
          <h2 id="como-usar" className="text-2xl font-extrabold text-ink">
            Como usar na unidade
          </h2>
          <ol className="mt-5 space-y-4">
            {[
              "Leia a edição antes da abertura e escolha um único ponto para executar na semana.",
              "Compartilhe o trecho relevante com a equipe de balcão — o conteúdo é escrito para virar script.",
              "Ao fim da semana, compare o indicador que a edição citou (conversão, margem, giro) com a semana anterior.",
              "Guarde o que funcionou: o arquivo é pesquisável e serve de manual da unidade.",
            ].map((passo, i) => (
              <li key={passo} className="flex gap-4">
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brand-blue font-display text-sm font-extrabold text-white">
                  {i + 1}
                </span>
                <p className="pt-1 leading-relaxed text-ink-muted">{passo}</p>
              </li>
            ))}
          </ol>
        </section>

        <section
          aria-labelledby="confidencial"
          className="mt-12 rounded-2xl border-l-4 border-brand-yellow bg-surface p-6 shadow-card"
        >
          <h2 id="confidencial" className="text-lg font-extrabold text-ink">
            Conteúdo interno
          </h2>
          <p className="mt-2 leading-relaxed text-ink-muted">
            Este portal não é indexado por buscadores e não deve ser divulgado
            fora da rede. O link é de circulação interna entre matriz e
            unidades franqueadas.
          </p>
        </section>

        <div className="mt-12 text-center">
          <LinkRastreado
            href="/edicoes"
            alvo="sobre_ir_arquivo"
            className="inline-flex items-center gap-2 rounded-lg bg-brand-blue px-6 py-3.5 font-bold text-white transition-colors hover:bg-brand-blue-deep"
          >
            Ver o arquivo de edições
            <IconeSeta className="size-4" />
          </LinkRastreado>
        </div>
      </div>
    </>
  );
}
