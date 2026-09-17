import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChipCategoria } from "@/components/site/ChipCategoria";
import { LinkRastreado } from "@/components/site/LinkRastreado";
import { RastreadorDeAbertura } from "@/components/site/RastreadorDePagina";
import { IconeRelogio, IconeSeta } from "@/components/ui/Icones";
import { aparenciaCategoria, nomeCategoria } from "@/lib/categorias";
import { buscarPorSlug, listarCategorias, listarPublicadas, vizinhas } from "@/lib/data";
import { higienizarHtml } from "@/lib/sanitize";
import { formatarData } from "@/lib/utils";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: PageProps<"/edicoes/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const newsletter = await buscarPorSlug(slug);
  if (!newsletter) return { title: "Edição não encontrada" };
  return { title: newsletter.titulo, description: newsletter.resumo };
}

export default async function PaginaNewsletter({
  params,
}: PageProps<"/edicoes/[slug]">) {
  const { slug } = await params;

  const [newsletter, categorias, { newsletters }] = await Promise.all([
    buscarPorSlug(slug),
    listarCategorias(),
    listarPublicadas(),
  ]);

  if (!newsletter) notFound();

  const { anterior, proxima } = vizinhas(newsletters, slug);
  const categoria = categorias.find((c) => c.slug === newsletter.categoria);
  const aparencia = aparenciaCategoria(categoria);
  // O corpo vem do editor visual; higienizamos antes de injetar no HTML.
  const corpo = higienizarHtml(newsletter.corpo);

  return (
    <article>
      {/* Registra a abertura desta edição para o ranking do painel. */}
      <RastreadorDeAbertura
        newsletterId={newsletter.id}
        categoria={newsletter.categoria}
      />

      {/* ---------------- Cabeçalho ---------------- */}
      <header className="border-b border-line bg-surface">
        <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
          <nav aria-label="Trilha de navegação" className="text-sm">
            <Link
              href="/edicoes"
              className="font-semibold text-brand-blue hover:underline"
            >
              Arquivo
            </Link>
            <span className="mx-2 text-ink-faint" aria-hidden>
              /
            </span>
            <Link
              href={`/categorias/${newsletter.categoria}`}
              className="text-ink-muted hover:text-brand-blue"
            >
              {nomeCategoria(newsletter.categoria, categorias)}
            </Link>
          </nav>

          <div className="mt-6">
            <ChipCategoria
              cor={categoria?.cor ?? "neutra"}
              nome={nomeCategoria(newsletter.categoria, categorias)}
            />
          </div>

          <h1 className="mt-5 text-3xl leading-tight font-extrabold text-ink sm:text-4xl lg:text-[2.75rem]">
            {newsletter.titulo}
          </h1>

          <p className="mt-5 text-lg leading-relaxed text-ink-muted">
            {newsletter.resumo}
          </p>

          <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-line pt-5 text-sm text-ink-faint">
            <time dateTime={newsletter.data_publicacao}>
              {formatarData(newsletter.data_publicacao)}
            </time>
            <span aria-hidden>·</span>
            <span>Por {newsletter.autor}</span>
            <span aria-hidden>·</span>
            <span className="inline-flex items-center gap-1">
              <IconeRelogio className="size-4" />
              {newsletter.tempo_leitura_min} min de leitura
            </span>
          </div>
        </div>
      </header>

      {/* ---------------- Capa ---------------- */}
      {newsletter.capa_url && (
        <div className="mx-auto max-w-4xl px-4 pt-10 sm:px-6">
          <div className={`relative aspect-[16/7] overflow-hidden rounded-2xl ${aparencia.capa}`}>
            <Image
              src={newsletter.capa_url}
              alt={`Capa da edição: ${newsletter.titulo}`}
              fill
              sizes="(min-width: 896px) 896px, 100vw"
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* ---------------- Corpo ---------------- */}
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* O HTML já passou por allowlist estrita em `higienizarHtml`. */}
        <div
          className="conteudo"
          dangerouslySetInnerHTML={{ __html: corpo }}
        />

        {/* ---------------- Tags ---------------- */}
        {newsletter.tags.length > 0 && (
          <div className="mt-14 border-t border-line pt-8">
            <h2 className="text-xs font-bold tracking-[0.14em] text-ink-faint uppercase">
              Tags
            </h2>
            <ul className="mt-3 flex flex-wrap gap-2">
              {newsletter.tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-sm text-ink-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ---------------- Navegação anterior/próxima ---------------- */}
        <nav
          aria-label="Outras edições"
          className="mt-10 grid gap-4 border-t border-line pt-8 sm:grid-cols-2"
        >
          {anterior ? (
            <LinkRastreado
              href={`/edicoes/${anterior.slug}`}
              alvo="artigo_anterior"
              newsletterId={anterior.id}
              categoria={anterior.categoria}
              className="group rounded-xl border border-line bg-surface p-5 transition-colors hover:border-brand-blue/40"
            >
              <span className="flex items-center gap-2 text-xs font-bold tracking-wide text-ink-faint uppercase">
                <IconeSeta className="size-4 rotate-180" />
                Edição anterior
              </span>
              <span className="mt-2 block font-bold text-ink group-hover:text-brand-blue">
                {anterior.titulo}
              </span>
            </LinkRastreado>
          ) : (
            <span aria-hidden />
          )}

          {proxima && (
            <LinkRastreado
              href={`/edicoes/${proxima.slug}`}
              alvo="artigo_proxima"
              newsletterId={proxima.id}
              categoria={proxima.categoria}
              className="group rounded-xl border border-line bg-surface p-5 text-right transition-colors hover:border-brand-blue/40 sm:col-start-2"
            >
              <span className="flex items-center justify-end gap-2 text-xs font-bold tracking-wide text-ink-faint uppercase">
                Próxima edição
                <IconeSeta className="size-4" />
              </span>
              <span className="mt-2 block font-bold text-ink group-hover:text-brand-blue">
                {proxima.titulo}
              </span>
            </LinkRastreado>
          )}
        </nav>

        <div className="mt-10 text-center">
          <LinkRastreado
            href="/edicoes"
            alvo="artigo_voltar_arquivo"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-brand-blue px-5 py-2.5 text-sm font-bold text-brand-blue transition-colors hover:bg-brand-blue hover:text-white"
          >
            Voltar ao arquivo
          </LinkRastreado>
        </div>
      </div>
    </article>
  );
}
