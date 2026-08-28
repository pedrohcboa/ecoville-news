"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EditorRico } from "./EditorRico";
import { CampoTags } from "./CampoTags";
import { Alerta, Campo, Selo, classesBotao, classesEntrada } from "./ui";
import { criarClienteNavegador } from "@/lib/supabase/client";
import { enviarImagem } from "@/lib/upload";
import { aparenciaCategoria, nomeCategoria } from "@/lib/categorias";
import { calcularTempoLeitura, formatarData, gerarSlug, hojeISO } from "@/lib/utils";
import type { Categoria, Newsletter, StatusNewsletter } from "@/lib/types";

/**
 * Formulário de criação e edição de uma newsletter.
 *
 * Pensado para quem não é técnico:
 *  - o endereço da página (slug) é gerado sozinho a partir do título;
 *  - o tempo de leitura é calculado do texto, sem ninguém digitar nada;
 *  - "Salvar rascunho" e "Publicar" são dois botões distintos e explícitos;
 *  - a pré-visualização mostra a página exatamente como o franqueado verá.
 */
export function FormularioEdicao({
  newsletter,
  categorias,
}: {
  /** Ausente ao criar uma edição nova. */
  newsletter?: Newsletter;
  categorias: Categoria[];
}) {
  const router = useRouter();
  const criando = !newsletter;

  const [titulo, setTitulo] = useState(newsletter?.titulo ?? "");
  const [slug, setSlug] = useState(newsletter?.slug ?? "");
  const [slugManual, setSlugManual] = useState(!criando);
  const [categoria, setCategoria] = useState(
    newsletter?.categoria ?? categorias[0]?.slug ?? "produtos",
  );
  const [resumo, setResumo] = useState(newsletter?.resumo ?? "");
  const [autor, setAutor] = useState(newsletter?.autor ?? "Matriz Ecoville");
  const [dataPublicacao, setDataPublicacao] = useState(
    newsletter?.data_publicacao ?? hojeISO(),
  );
  const [tags, setTags] = useState<string[]>(newsletter?.tags ?? []);
  const [capaUrl, setCapaUrl] = useState<string | null>(newsletter?.capa_url ?? null);
  const [corpo, setCorpo] = useState(newsletter?.corpo ?? "");

  const [enviandoCapa, setEnviandoCapa] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState<
    { tom: "erro" | "sucesso"; texto: string } | null
  >(null);
  const [previa, setPrevia] = useState(false);
  const inputCapa = useRef<HTMLInputElement>(null);

  const tempoLeitura = useMemo(() => calcularTempoLeitura(corpo), [corpo]);

  /** Enquanto o editor não mexer no endereço, ele acompanha o título. */
  function aoMudarTitulo(valor: string) {
    setTitulo(valor);
    if (!slugManual) setSlug(gerarSlug(valor));
  }

  async function trocarCapa(arquivo: File) {
    setEnviandoCapa(true);
    setMensagem(null);
    try {
      setCapaUrl(await enviarImagem(arquivo, "capas"));
    } catch (e) {
      setMensagem({
        tom: "erro",
        texto: e instanceof Error ? e.message : "Falha ao enviar a capa.",
      });
    } finally {
      setEnviandoCapa(false);
      if (inputCapa.current) inputCapa.current.value = "";
    }
  }

  function validar(status: StatusNewsletter): string | null {
    if (!titulo.trim()) return "Dê um título à edição antes de salvar.";
    if (!slug.trim()) return "O endereço da página não pode ficar vazio.";
    if (!categoria) return "Escolha uma categoria.";
    if (status === "publicado") {
      if (!resumo.trim())
        return "Escreva um resumo curto — ele aparece nos cards do site.";
      if (calcularTempoLeitura(corpo) < 1 || !corpo.replace(/<[^>]*>/g, "").trim())
        return "A edição está sem conteúdo. Escreva o corpo antes de publicar.";
    }
    return null;
  }

  async function salvar(status: StatusNewsletter) {
    const problema = validar(status);
    if (problema) {
      setMensagem({ tom: "erro", texto: problema });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSalvando(true);
    setMensagem(null);

    const registro = {
      slug: gerarSlug(slug),
      titulo: titulo.trim(),
      categoria,
      status,
      data_publicacao: dataPublicacao,
      autor: autor.trim() || "Matriz Ecoville",
      resumo: resumo.trim(),
      tempo_leitura_min: tempoLeitura,
      capa_url: capaUrl,
      tags,
      corpo,
    };

    try {
      const supabase = criarClienteNavegador();

      if (criando) {
        const { data, error } = await supabase
          .from("newsletters")
          .insert(registro)
          .select("id")
          .single();
        if (error) throw error;
        setMensagem({
          tom: "sucesso",
          texto:
            status === "publicado"
              ? "Edição publicada! Já está no ar para os franqueados."
              : "Rascunho salvo.",
        });
        router.replace(`/admin/editar/${data.id}`);
        router.refresh();
      } else {
        const { error } = await supabase
          .from("newsletters")
          .update(registro)
          .eq("id", newsletter.id);
        if (error) throw error;
        setMensagem({
          tom: "sucesso",
          texto:
            status === "publicado"
              ? "Alterações publicadas."
              : "Rascunho salvo. A edição não aparece no site enquanto estiver assim.",
        });
        router.refresh();
      }
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e) {
      const detalhe = e instanceof Error ? e.message : "erro desconhecido";
      setMensagem({
        tom: "erro",
        texto: detalhe.includes("duplicate key")
          ? "Já existe uma edição com esse endereço de página. Ajuste o campo “Endereço da página”."
          : `Não foi possível salvar: ${detalhe}`,
      });
      window.scrollTo({ top: 0, behavior: "smooth" });
    } finally {
      setSalvando(false);
    }
  }

  const statusAtual: StatusNewsletter = newsletter?.status ?? "rascunho";

  return (
    <div>
      {/* ---------------- Cabeçalho da tela ---------------- */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/admin"
            className="text-sm font-semibold text-brand-blue hover:underline"
          >
            ← Voltar para as edições
          </Link>
          <h1 className="mt-2 text-3xl font-extrabold text-ink">
            {criando ? "Nova edição" : "Editar edição"}
          </h1>
        </div>
        {!criando && <Selo status={statusAtual} />}
      </div>

      {mensagem && (
        <div className="mt-6">
          <Alerta tom={mensagem.tom}>{mensagem.texto}</Alerta>
        </div>
      )}

      <form
        className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]"
        onSubmit={(e) => e.preventDefault()}
      >
        {/* ================= Coluna principal ================= */}
        <div className="space-y-6">
          <Campo id="titulo" rotulo="Título da edição" obrigatorio>
            <input
              id="titulo"
              type="text"
              value={titulo}
              onChange={(e) => aoMudarTitulo(e.target.value)}
              placeholder="Ex.: Como aumentar o giro da linha de desengordurantes"
              className={`${classesEntrada} text-lg font-semibold`}
            />
          </Campo>

          <Campo
            id="resumo"
            rotulo="Resumo"
            ajuda="Uma ou duas frases. É o que aparece nos cards do site e no destaque da home."
            obrigatorio
          >
            <textarea
              id="resumo"
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
              rows={3}
              maxLength={280}
              className={classesEntrada}
              placeholder="O que o franqueado ganha lendo esta edição?"
            />
            <p className="mt-1 text-right text-xs text-ink-faint">
              {resumo.length}/280
            </p>
          </Campo>

          <div>
            <span className="block text-sm font-bold text-ink">
              Conteúdo da edição
            </span>
            <p className="mt-1 mb-2 text-xs text-ink-faint">
              Use <strong>Destaque</strong> (marca-texto amarelo) e{" "}
              <strong>Azul</strong> para dar ênfase aos trechos que importam.
            </p>
            <EditorRico valor={corpo} aoMudar={setCorpo} />
            <p className="mt-2 text-xs text-ink-faint">
              Tempo de leitura calculado automaticamente:{" "}
              <strong>{tempoLeitura} min</strong>
            </p>
          </div>
        </div>

        {/* ================= Barra lateral ================= */}
        <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <div className="space-y-5 rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-extrabold tracking-wide text-ink uppercase">
              Publicação
            </h2>

            <Campo id="categoria" rotulo="Categoria" obrigatorio>
              <select
                id="categoria"
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className={classesEntrada}
              >
                {categorias.map((c) => (
                  <option key={c.slug} value={c.slug}>
                    {c.nome}
                  </option>
                ))}
              </select>
            </Campo>

            <Campo id="data" rotulo="Data de publicação" obrigatorio>
              <input
                id="data"
                type="date"
                value={dataPublicacao}
                onChange={(e) => setDataPublicacao(e.target.value)}
                className={classesEntrada}
              />
            </Campo>

            <Campo id="autor" rotulo="Autor">
              <input
                id="autor"
                type="text"
                value={autor}
                onChange={(e) => setAutor(e.target.value)}
                className={classesEntrada}
              />
            </Campo>

            <Campo
              id="slug"
              rotulo="Endereço da página"
              ajuda="Gerado a partir do título. Só mude se souber o que está fazendo."
            >
              <input
                id="slug"
                type="text"
                value={slug}
                onChange={(e) => {
                  setSlugManual(true);
                  setSlug(e.target.value);
                }}
                className={`${classesEntrada} font-mono text-sm`}
              />
              <p className="mt-1 truncate text-xs text-ink-faint">
                /edicoes/{gerarSlug(slug) || "…"}
              </p>
            </Campo>

            <Campo
              id="tags"
              rotulo="Tags"
              ajuda="Ajudam na busca do site. Ex.: margem, vitrine, treinamento."
            >
              <CampoTags id="tags" tags={tags} aoMudar={setTags} />
            </Campo>
          </div>

          {/* ---------------- Capa ---------------- */}
          <div className="rounded-xl border border-line bg-surface p-5">
            <h2 className="text-sm font-extrabold tracking-wide text-ink uppercase">
              Imagem de capa
            </h2>
            <p className="mt-1 text-xs text-ink-faint">
              Opcional. Sem imagem, o card usa a cor da categoria.
            </p>

            <div className="mt-3 overflow-hidden rounded-lg border border-line">
              {capaUrl ? (
                <div className="relative aspect-[16/9]">
                  <Image
                    src={capaUrl}
                    alt="Pré-visualização da capa"
                    fill
                    sizes="320px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div
                  className={`flex aspect-[16/9] items-center justify-center ${aparenciaCategoria(categoria).capa}`}
                >
                  <span
                    className={`text-xs font-bold ${
                      categoria === "impulsionar-a-loja"
                        ? "text-brand-blue"
                        : "text-white/80"
                    }`}
                  >
                    Cor da categoria
                  </span>
                </div>
              )}
            </div>

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={() => inputCapa.current?.click()}
                disabled={enviandoCapa}
                className={classesBotao("secundario", "flex-1 px-3")}
              >
                {enviandoCapa ? "Enviando…" : capaUrl ? "Trocar" : "Enviar imagem"}
              </button>
              {capaUrl && (
                <button
                  type="button"
                  onClick={() => setCapaUrl(null)}
                  className={classesBotao("fantasma", "px-3")}
                >
                  Remover
                </button>
              )}
            </div>
            <input
              ref={inputCapa}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const arquivo = e.target.files?.[0];
                if (arquivo) void trocarCapa(arquivo);
              }}
            />
          </div>

          {/* ---------------- Ações ---------------- */}
          <div className="space-y-3 rounded-xl border border-line bg-surface p-5">
            <button
              type="button"
              onClick={() => salvar("publicado")}
              disabled={salvando}
              className={classesBotao("primario", "w-full py-3")}
            >
              {salvando ? "Salvando…" : "Publicar"}
            </button>
            <button
              type="button"
              onClick={() => salvar("rascunho")}
              disabled={salvando}
              className={classesBotao("secundario", "w-full")}
            >
              Salvar rascunho
            </button>
            <button
              type="button"
              onClick={() => setPrevia(true)}
              className={classesBotao("fantasma", "w-full")}
            >
              Pré-visualizar
            </button>
            <p className="text-xs leading-relaxed text-ink-faint">
              Rascunhos ficam invisíveis no site. Só o que está publicado
              aparece para os franqueados.
            </p>
          </div>
        </aside>
      </form>

      {previa && (
        <Previa
          aoFechar={() => setPrevia(false)}
          titulo={titulo}
          resumo={resumo}
          corpo={corpo}
          autor={autor}
          data={dataPublicacao}
          tempoLeitura={tempoLeitura}
          categoriaNome={nomeCategoria(categoria, categorias)}
          categoriaSlug={categoria}
          tags={tags}
        />
      )}
    </div>
  );
}

/**
 * Pré-visualização em tela cheia. Usa as mesmas classes da página pública
 * (`.conteudo`), então o que aparece aqui é o que o franqueado verá.
 */
function Previa({
  aoFechar,
  titulo,
  resumo,
  corpo,
  autor,
  data,
  tempoLeitura,
  categoriaNome,
  categoriaSlug,
  tags,
}: {
  aoFechar: () => void;
  titulo: string;
  resumo: string;
  corpo: string;
  autor: string;
  data: string;
  tempoLeitura: number;
  categoriaNome: string;
  categoriaSlug: string;
  tags: string[];
}) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Pré-visualização da edição"
      className="fixed inset-0 z-50 overflow-y-auto bg-ink/70 p-4 sm:p-8"
    >
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl bg-surface">
        <div className="sticky top-0 flex items-center justify-between border-b border-line bg-canvas px-5 py-3">
          <p className="text-sm font-bold text-ink">
            Pré-visualização — assim o franqueado vê
          </p>
          <button
            type="button"
            onClick={aoFechar}
            className={classesBotao("fantasma", "px-3")}
          >
            Fechar
          </button>
        </div>

        <div className="px-6 py-8 sm:px-10 sm:py-10">
          <span
            className={`inline-flex items-center rounded-full px-3 py-1 text-[0.6875rem] font-bold tracking-[0.08em] uppercase ${aparenciaCategoria(categoriaSlug).chip}`}
          >
            {categoriaNome}
          </span>

          <h1 className="mt-4 text-3xl leading-tight font-extrabold text-ink">
            {titulo || "Sem título"}
          </h1>
          {resumo && (
            <p className="mt-4 text-lg leading-relaxed text-ink-muted">{resumo}</p>
          )}

          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-line pt-4 text-sm text-ink-faint">
            <span>{formatarData(data)}</span>
            <span aria-hidden>·</span>
            <span>Por {autor}</span>
            <span aria-hidden>·</span>
            <span>{tempoLeitura} min de leitura</span>
          </div>

          <div
            className="conteudo mt-8"
            dangerouslySetInnerHTML={{ __html: corpo }}
          />

          {tags.length > 0 && (
            <ul className="mt-10 flex flex-wrap gap-2 border-t border-line pt-6">
              {tags.map((tag) => (
                <li
                  key={tag}
                  className="rounded-full border border-line px-3 py-1.5 text-sm text-ink-muted"
                >
                  {tag}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
