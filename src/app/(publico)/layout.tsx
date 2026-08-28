import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { RastreadorDePagina } from "@/components/site/RastreadorDePagina";
import { listarCategorias } from "@/lib/data";

/**
 * Layout da área pública (leitura aberta, sem login).
 * O painel `/admin` tem o seu próprio layout e não passa por aqui.
 */
export default async function LayoutPublico({
  children,
}: LayoutProps<"/">) {
  const categorias = await listarCategorias();

  return (
    <>
      <Header />
      <main id="conteudo-principal" className="flex-1">
        {children}
      </main>
      <Footer categorias={categorias} />
      <RastreadorDePagina />
    </>
  );
}
