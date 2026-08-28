"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Alerta, Selo, classesBotao, classesEntrada } from "./ui";
import { criarClienteNavegador } from "@/lib/supabase/client";
import { nomeCategoria } from "@/lib/categorias";
import { formatarDataCurta, normalizarBusca, slugDeCopia } from "@/lib/utils";
import type { Categoria, Newsletter } from "@/lib/types";

/**
 * Tabela de edições com busca, filtros e as três ações do dia a dia:
 * **editar**, **duplicar** (útil para criar a próxima edição a partir de um
 * modelo) e **excluir** (com confirmação em duas etapas).
 */
export function ListaEdicoes({
  newsletters,
  categorias,
}: {
  newsletters: Newsletter[];
  categorias: Categoria[];
}) {
  const router = useRouter();
  const [pendente, iniciarTransicao] = useTransition();

  const [termo, setTermo] = useState("");
  const [status, setStatus] = useState<"todos" | "rascunho" | "publicado">("todos");
  const [categoria, setCategoria] = useState("todas");
  const [confirmandoExclusao, setConfirmandoExclusao] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<{ tom: "erro" | "sucesso"; texto: string } | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const filtradas = useMemo(() => {
    const busca = normalizarBusca(termo.trim());
    return newsletters.filter((n) => {
      if (status !== "todos" && n.status !== status) return false;
      if (categoria !== "todas" && n.categoria !== categoria) return false;
      if (!busca) return true;
      return normalizarBusca(`${n.titulo} ${n.resumo} ${n.tags.join(" ")}`).includes(busca);
    });
  }, [newsletters, termo, status, categoria]);

  /** Copia a edição como rascunho novo, com slug e título marcados. */
  async function duplicar(original: Newsletter) {
    setOcupado(true);
    setMensagem(null);
    try {
      const supabase = criarClienteNavegador();
      const tituloCopia = `${original.titulo} (cópia)`;
      const { data, error } = await supabase
        .from("newsletters")
        .insert({
          slug: slugDeCopia(tituloCopia),
          titulo: tituloCopia,
          categoria: original.categoria,
          status: "rascunho",
          data_publicacao: original.data_publicacao,
          autor: original.autor,
          resumo: original.resumo,
          tempo_leitura_min: original.tempo_leitura_min,
          capa_url: original.capa_url,
          tags: original.tags,
          corpo: original.corpo,
        })
        .select("id")
        .single();

      if (error) throw new Error(error.message);
      setMensagem({ tom: "sucesso", texto: "Cópia criada como rascunho." });
      iniciarTransicao(() => router.push(`/admin/editar/${data.id}`));
    } catch (e) {
      setMensagem({
        tom: "erro",
        texto: e instanceof Error ? `Não foi possível duplicar: ${e.message}` : "Erro inesperado.",
      });
    } finally {
      setOcupado(false);
    }
  }

  async function excluir(id: string) {
    setOcupado(true);
    setMensagem(null);
    try {
      const supabase = criarClienteNavegador();
      const { error } = await supabase.from("newsletters").delete().eq("id", id);
      if (error) throw new Error(error.message);
      setConfirmandoExclusao(null);
      setMensagem({ tom: "sucesso", texto: "Edição excluída." });
      iniciarTransicao(() => router.refresh());
    } catch (e) {
      setMensagem({
        tom: "erro",
        texto: e instanceof Error ? `Não foi possível excluir: ${e.message}` : "Erro inesperado.",
      });
    } finally {
      setOcupado(false);
    }
  }

  return (
    <div>
      {mensagem && (
        <div className="mb-5">
          <Alerta tom={mensagem.tom}>{mensagem.texto}</Alerta>
        </div>
      )}

      {/* ---------- Filtros ---------- */}
      <div className="grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-3">
        <div>
          <label htmlFor="busca-admin" className="sr-only">
            Buscar edições
          </label>
          <input
            id="busca-admin"
            type="search"
            value={termo}
            onChange={(e) => setTermo(e.target.value)}
            placeholder="Buscar por título, resumo ou tag…"
            className={classesEntrada}
          />
        </div>
        <div>
          <label htmlFor="filtro-status" className="sr-only">
            Filtrar por status
          </label>
          <select
            id="filtro-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className={classesEntrada}
          >
            <option value="todos">Todos os status</option>
            <option value="publicado">Publicados</option>
            <option value="rascunho">Rascunhos</option>
          </select>
        </div>
        <div>
          <label htmlFor="filtro-categoria" className="sr-only">
            Filtrar por categoria
          </label>
          <select
            id="filtro-categoria"
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            className={classesEntrada}
          >
            <option value="todas">Todas as categorias</option>
            {categorias.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.nome}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ---------- Lista ---------- */}
      {filtradas.length === 0 ? (
        <div className="mt-6 rounded-xl border border-dashed border-line-strong bg-surface p-12 text-center">
          <p className="text-lg font-bold text-ink">
            {newsletters.length === 0
              ? "Você ainda não criou nenhuma edição"
              : "Nenhuma edição corresponde aos filtros"}
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
            {newsletters.length === 0
              ? "Clique em “Nova edição” para escrever a primeira newsletter da rede."
              : "Ajuste a busca, o status ou a categoria para ver mais resultados."}
          </p>
          {newsletters.length === 0 && (
            <Link href="/admin/nova" className={classesBotao("primario", "mt-6")}>
              + Nova edição
            </Link>
          )}
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {filtradas.map((n) => (
            <li
              key={n.id}
              className="rounded-xl border border-line bg-surface p-4 sm:p-5"
            >
              <div className="flex flex-wrap items-start gap-4">
                <div className="min-w-64 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Selo status={n.status} />
                    <span className="text-xs font-semibold text-ink-faint">
                      {nomeCategoria(n.categoria, categorias)}
                    </span>
                    <span className="text-xs text-ink-faint" aria-hidden>
                      ·
                    </span>
                    <span className="text-xs text-ink-faint">
                      {formatarDataCurta(n.data_publicacao)}
                    </span>
                    <span className="text-xs text-ink-faint" aria-hidden>
                      ·
                    </span>
                    <span className="text-xs text-ink-faint">
                      {n.tempo_leitura_min} min
                    </span>
                  </div>

                  <h2 className="mt-2 text-lg leading-snug font-bold text-ink">
                    <Link
                      href={`/admin/editar/${n.id}`}
                      className="hover:text-brand-blue"
                    >
                      {n.titulo}
                    </Link>
                  </h2>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-muted">
                    {n.resumo || "Sem resumo."}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {n.status === "publicado" && (
                    <Link
                      href={`/edicoes/${n.slug}`}
                      target="_blank"
                      className={classesBotao("fantasma", "px-3")}
                    >
                      Ver no site
                    </Link>
                  )}
                  <button
                    type="button"
                    onClick={() => duplicar(n)}
                    disabled={ocupado || pendente}
                    className={classesBotao("fantasma", "px-3")}
                  >
                    Duplicar
                  </button>
                  <Link
                    href={`/admin/editar/${n.id}`}
                    className={classesBotao("secundario", "px-3")}
                  >
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => setConfirmandoExclusao(n.id)}
                    disabled={ocupado || pendente}
                    className={classesBotao("perigo", "px-3")}
                  >
                    Excluir
                  </button>
                </div>
              </div>

              {/* Confirmação em duas etapas: excluir é irreversível. */}
              {confirmandoExclusao === n.id && (
                <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-800">
                    Excluir “{n.titulo}” definitivamente? Esta ação não pode ser
                    desfeita.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => excluir(n.id)}
                      disabled={ocupado}
                      className="rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-60"
                    >
                      {ocupado ? "Excluindo…" : "Sim, excluir"}
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmandoExclusao(null)}
                      className={classesBotao("fantasma")}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
