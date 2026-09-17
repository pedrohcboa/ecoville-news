import Image from "next/image";
import { formatarData } from "@/lib/utils";
import type { Categoria, Newsletter } from "@/lib/types";
import { aparenciaCategoria } from "@/lib/categorias";
import { ChipCategoria } from "./ChipCategoria";
import { LinkRastreado } from "./LinkRastreado";
import { IconeCategoria, IconeRelogio, IconeSeta } from "@/components/ui/Icones";

/**
 * Card do catálogo: categoria, título, resumo, data e tempo de leitura.
 *
 * O card inteiro é clicável (o link do título cobre a área via `after:`), mas
 * só existe **um** link para leitores de tela — evita a navegação duplicada
 * típica de cards com título e botão apontando para o mesmo lugar.
 */
export function NewsletterCard({
  newsletter,
  categorias,
  prioridadeImagem = false,
}: {
  newsletter: Newsletter;
  categorias: Categoria[];
  prioridadeImagem?: boolean;
}) {
  const categoria = categorias.find((c) => c.slug === newsletter.categoria);
  const aparencia = aparenciaCategoria(categoria);

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-blue/30 hover:shadow-card-hover focus-within:-translate-y-0.5">
      {/* Capa: imagem enviada pelo editor ou faixa colorida da categoria. */}
      <div className={`relative h-36 shrink-0 ${aparencia.capa}`}>
        {newsletter.capa_url ? (
          <Image
            src={newsletter.capa_url}
            alt=""
            fill
            sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
            priority={prioridadeImagem}
          />
        ) : (
          <IconeCategoria
            icone={categoria?.icone ?? "estrela"}
            className={`absolute right-4 bottom-4 size-16 ${aparencia.marcaDagua}`}
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <ChipCategoria
          cor={categoria?.cor ?? "neutra"}
          nome={categoria?.nome ?? newsletter.categoria}
          className="self-start"
        />

        <h3 className="mt-3 text-lg leading-snug font-bold text-ink">
          <LinkRastreado
            href={`/edicoes/${newsletter.slug}`}
            alvo="card_ler"
            newsletterId={newsletter.id}
            categoria={newsletter.categoria}
            className="after:absolute after:inset-0 after:content-[''] hover:text-brand-blue"
          >
            {newsletter.titulo}
          </LinkRastreado>
        </h3>

        <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink-muted">
          {newsletter.resumo}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-5 text-xs font-medium text-ink-faint">
          <time dateTime={newsletter.data_publicacao}>
            {formatarData(newsletter.data_publicacao)}
          </time>
          <span aria-hidden>·</span>
          <span className="inline-flex items-center gap-1">
            <IconeRelogio className="size-3.5" />
            {newsletter.tempo_leitura_min} min de leitura
          </span>
          <IconeSeta className="ml-auto size-4 text-brand-blue transition-transform duration-200 group-hover:translate-x-1" />
        </div>
      </div>
    </article>
  );
}
