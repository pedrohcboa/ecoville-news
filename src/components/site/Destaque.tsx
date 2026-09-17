import Image from "next/image";
import { aparenciaCategoria } from "@/lib/categorias";
import { formatarData } from "@/lib/utils";
import type { Categoria, Newsletter } from "@/lib/types";
import { ChipCategoria } from "./ChipCategoria";
import { LinkRastreado } from "./LinkRastreado";
import { IconeCategoria, IconeRelogio, IconeSeta } from "@/components/ui/Icones";

/**
 * Card grande da edição mais recente. Ocupa a largura toda logo abaixo dos
 * contadores e é o principal caminho de leitura da home.
 */
export function Destaque({
  newsletter,
  categorias,
}: {
  newsletter: Newsletter;
  categorias: Categoria[];
}) {
  const categoria = categorias.find((c) => c.slug === newsletter.categoria);
  const aparencia = aparenciaCategoria(categoria);

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-line bg-surface shadow-card transition-shadow hover:shadow-card-hover">
      <div className="grid lg:grid-cols-5">
        <div className={`relative min-h-56 lg:col-span-2 ${aparencia.capa}`}>
          {newsletter.capa_url ? (
            <Image
              src={newsletter.capa_url}
              alt=""
              fill
              sizes="(min-width: 1024px) 40vw, 100vw"
              className="object-cover"
              priority
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <IconeCategoria
                icone={categoria?.icone ?? "estrela"}
                className={`size-24 ${aparencia.marcaDagua}`}
              />
            </div>
          )}
        </div>

        <div className="p-7 sm:p-10 lg:col-span-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-brand-blue-soft px-3 py-1 text-[0.6875rem] font-bold tracking-[0.08em] text-brand-blue-deep uppercase">
              Última edição
            </span>
            <ChipCategoria
              cor={categoria?.cor ?? "neutra"}
              nome={categoria?.nome ?? newsletter.categoria}
            />
          </div>

          <h2 className="mt-5 text-2xl leading-tight font-extrabold text-ink sm:text-3xl">
            {newsletter.titulo}
          </h2>

          <p className="mt-4 text-base leading-relaxed text-ink-muted">
            {newsletter.resumo}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-faint">
            <time dateTime={newsletter.data_publicacao}>
              {formatarData(newsletter.data_publicacao)}
            </time>
            <span aria-hidden>·</span>
            <span>{newsletter.autor}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <IconeRelogio className="size-4" />
              {newsletter.tempo_leitura_min} min
            </span>
          </div>

          <LinkRastreado
            href={`/edicoes/${newsletter.slug}`}
            alvo="destaque_ler"
            newsletterId={newsletter.id}
            categoria={newsletter.categoria}
            className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-blue px-6 py-3.5 text-base font-bold text-white transition-colors hover:bg-brand-blue-deep"
          >
            Ler edição
            <IconeSeta className="size-4 transition-transform group-hover:translate-x-0.5" />
          </LinkRastreado>
        </div>
      </div>
    </article>
  );
}
