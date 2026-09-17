import type { Metadata } from "next";
import { GestaoCategorias } from "@/components/admin/GestaoCategorias";
import { Alerta } from "@/components/admin/ui";
import { criarClienteServidor } from "@/lib/supabase/server";
import type { Categoria } from "@/lib/types";

export const metadata: Metadata = { title: "Categorias" };
export const revalidate = 0;

/**
 * Gestão das trilhas editoriais.
 *
 * Existe para que a Ecoville crie e ajuste categorias sem depender de deploy.
 * A permissão já vinha do 0001 (`categorias_gestao_editor`); esta tela é só a
 * interface. A contagem de edições por trilha é carregada junto porque decide
 * se o botão de excluir fica disponível — o banco recusa apagar uma categoria
 * que ainda tem edição apontando para ela.
 */
export default async function PaginaCategorias() {
  const supabase = await criarClienteServidor();

  const [{ data: categorias, error }, { data: newsletters }] = await Promise.all([
    supabase
      .from("categorias")
      .select("slug, nome, descricao, cor, icone, ordem")
      .order("ordem"),
    supabase.from("newsletters").select("categoria"),
  ]);

  const contagem: Record<string, number> = {};
  for (const { categoria } of (newsletters ?? []) as { categoria: string }[]) {
    contagem[categoria] = (contagem[categoria] ?? 0) + 1;
  }

  return (
    <div>
      <div>
        <h1 className="text-3xl font-extrabold text-ink">Categorias</h1>
        <p className="mt-1 max-w-2xl text-ink-muted">
          As trilhas que organizam as edições no site. Criar uma aqui já a faz
          aparecer no menu, na home e no arquivo — sem precisar de programador.
        </p>
      </div>

      {error && (
        <div className="mt-6">
          <Alerta tom="erro">
            Não foi possível carregar as categorias: {error.message}
          </Alerta>
        </div>
      )}

      <div className="mt-8">
        <GestaoCategorias
          categorias={(categorias ?? []) as Categoria[]}
          contagem={contagem}
        />
      </div>
    </div>
  );
}
