import type { Metadata } from "next";
import { FormularioEdicao } from "@/components/admin/FormularioEdicao";
import { criarClienteServidor } from "@/lib/supabase/server";
import { CATEGORIAS_PADRAO } from "@/lib/categorias";
import type { Categoria } from "@/lib/types";

export const metadata: Metadata = { title: "Nova edição" };
export const revalidate = 0;

export default async function PaginaNovaEdicao() {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("categorias")
    .select("slug, nome, descricao, cor, icone, ordem")
    .order("ordem");

  const categorias = (data as Categoria[] | null) ?? [];

  return (
    <FormularioEdicao
      categorias={categorias.length ? categorias : CATEGORIAS_PADRAO}
    />
  );
}
