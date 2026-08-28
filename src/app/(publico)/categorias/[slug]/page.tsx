import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Catalogo } from "@/components/site/Catalogo";
import { IconeCategoria } from "@/components/ui/Icones";
import { aparenciaCategoria } from "@/lib/categorias";
import { listarCategorias, listarPublicadas } from "@/lib/data";

export const revalidate = 0;

export async function generateMetadata({
  params,
}: PageProps<"/categorias/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const categoria = (await listarCategorias()).find((c) => c.slug === slug);
  if (!categoria) return { title: "Trilha não encontrada" };
  return { title: categoria.nome, description: categoria.descricao };
}

export default async function PaginaCategoria({
  params,
}: PageProps<"/categorias/[slug]">) {
  const { slug } = await params;

  const [categorias, { newsletters }] = await Promise.all([
    listarCategorias(),
    listarPublicadas(),
  ]);

  const categoria = categorias.find((c) => c.slug === slug);
  if (!categoria) notFound();

  const daCategoria = newsletters.filter((n) => n.categoria === slug);
  const aparencia = aparenciaCategoria(slug);
  const iconeClaro = slug === "impulsionar-a-loja";

  return (
    <>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <span
            className={`inline-flex size-14 items-center justify-center rounded-2xl ${aparencia.capa}`}
          >
            <IconeCategoria
              categoria={slug}
              className={`size-7 ${iconeClaro ? "text-brand-blue" : "text-white"}`}
            />
          </span>

          <p className="mt-6 text-xs font-bold tracking-[0.16em] text-brand-blue uppercase">
            Trilha
          </p>
          <h1 className="mt-2 text-4xl font-extrabold text-ink sm:text-5xl">
            {categoria.nome}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted">
            {categoria.descricao}
          </p>
          <p className="mt-4 text-sm font-semibold text-ink-faint">
            {daCategoria.length}{" "}
            {daCategoria.length === 1 ? "edição publicada" : "edições publicadas"}
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        {/* Dentro da trilha, o filtro de categoria seria redundante — fica só
            a busca sobre as edições desta trilha. */}
        <Catalogo
          newsletters={daCategoria}
          categorias={categorias}
          categoriaInicial={slug}
          mostrarFiltros={false}
        />
      </div>
    </>
  );
}
