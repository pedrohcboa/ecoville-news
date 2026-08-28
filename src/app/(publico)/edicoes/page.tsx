import type { Metadata } from "next";
import { Catalogo } from "@/components/site/Catalogo";
import { AvisoDemonstracao } from "@/components/site/AvisoDemonstracao";
import { listarCategorias, listarPublicadas } from "@/lib/data";

export const revalidate = 0;

export const metadata: Metadata = {
  title: "Arquivo de edições",
  description:
    "Todas as edições publicadas do Ecoville News, com busca e filtro por trilha.",
};

export default async function PaginaArquivo() {
  const [{ newsletters, exemplo }, categorias] = await Promise.all([
    listarPublicadas(),
    listarCategorias(),
  ]);

  return (
    <>
      {exemplo && <AvisoDemonstracao />}

      <header className="border-b border-line bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <p className="text-xs font-bold tracking-[0.16em] text-brand-blue uppercase">
            Arquivo
          </p>
          <h1 className="mt-3 text-4xl font-extrabold text-ink sm:text-5xl">
            Todas as <span className="marca-texto">edições</span>
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-ink-muted">
            Ordenadas da mais recente para a mais antiga. Use a busca ou filtre
            por trilha para achar o material que você precisa agora.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <Catalogo newsletters={newsletters} categorias={categorias} />
      </div>
    </>
  );
}
