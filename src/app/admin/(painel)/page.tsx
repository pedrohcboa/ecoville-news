import type { Metadata } from "next";
import Link from "next/link";
import { ListaEdicoes } from "@/components/admin/ListaEdicoes";
import { Alerta, classesBotao } from "@/components/admin/ui";
import { criarClienteServidor } from "@/lib/supabase/server";
import { CATEGORIAS_PADRAO } from "@/lib/categorias";
import type { Categoria, Newsletter } from "@/lib/types";

export const metadata: Metadata = { title: "Edições" };
export const revalidate = 0;

/** Lista de edições do painel: rascunhos e publicadas, com busca e filtros. */
export default async function PaginaEdicoes() {
  const supabase = await criarClienteServidor();

  const [{ data: newsletters, error }, { data: categorias }] = await Promise.all([
    supabase
      .from("newsletters")
      .select(
        "id, slug, titulo, categoria, status, data_publicacao, autor, resumo, tempo_leitura_min, capa_url, tags, corpo",
      )
      .order("data_publicacao", { ascending: false }),
    supabase
      .from("categorias")
      .select("slug, nome, descricao, cor, icone, ordem")
      .order("ordem"),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-ink">Edições</h1>
          <p className="mt-1 text-ink-muted">
            Crie, edite e publique as newsletters do Ecoville News.
          </p>
        </div>
        <Link href="/admin/nova" className={classesBotao("primario")}>
          + Nova edição
        </Link>
      </div>

      {error && (
        <div className="mt-6">
          <Alerta tom="erro">
            Não foi possível carregar as edições: {error.message}
          </Alerta>
        </div>
      )}

      <div className="mt-8">
        <ListaEdicoes
          newsletters={(newsletters ?? []) as Newsletter[]}
          categorias={((categorias ?? []) as Categoria[]).length
            ? (categorias as Categoria[])
            : CATEGORIAS_PADRAO}
        />
      </div>
    </div>
  );
}
