import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FormularioEdicao } from "@/components/admin/FormularioEdicao";
import { criarClienteServidor } from "@/lib/supabase/server";
import { CATEGORIAS_PADRAO } from "@/lib/categorias";
import type { Categoria, Newsletter } from "@/lib/types";

export const metadata: Metadata = { title: "Editar edição" };
export const revalidate = 0;

export default async function PaginaEditarEdicao({
  params,
}: PageProps<"/admin/editar/[id]">) {
  const { id } = await params;
  const supabase = await criarClienteServidor();

  const [{ data: newsletter }, { data: categorias }] = await Promise.all([
    supabase
      .from("newsletters")
      .select(
        "id, slug, titulo, categoria, status, data_publicacao, autor, resumo, tempo_leitura_min, capa_url, tags, corpo",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("categorias")
      .select("slug, nome, descricao, cor, icone, ordem")
      .order("ordem"),
  ]);

  if (!newsletter) notFound();

  const lista = (categorias as Categoria[] | null) ?? [];

  return (
    <FormularioEdicao
      newsletter={newsletter as Newsletter}
      categorias={lista.length ? lista : CATEGORIAS_PADRAO}
    />
  );
}
