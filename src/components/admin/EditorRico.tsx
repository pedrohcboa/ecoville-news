"use client";

import { useCallback, useRef, useState } from "react";
import { EditorContent, useEditor, useEditorState } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import Image from "@tiptap/extension-image";
import Placeholder from "@tiptap/extension-placeholder";
import { Color, TextStyle } from "@tiptap/extension-text-style";
import { TableKit } from "@tiptap/extension-table";
import { enviarImagem } from "@/lib/upload";
import { cn } from "@/lib/utils";

/**
 * EDITOR VISUAL DAS EDIÇÕES (WYSIWYG).
 * -------------------------------------------------------------------------
 * O que o editor vê aqui é exatamente o que sai no site: o conteúdo usa a
 * mesma classe `.conteudo` da página pública.
 *
 * Além da formatação usual, a barra traz a **ferramenta de acento da marca**:
 *  - "Destaque" aplica o marca-texto amarelo (`<mark>`);
 *  - "Azul" pinta o trecho selecionado com o azul Ecoville.
 * Esses acentos são escolhidos edição a edição — não há destaque automático.
 */

const AZUL_MARCA = "#0213C1";

export function EditorRico({
  valor,
  aoMudar,
}: {
  valor: string;
  /** Recebe o HTML atualizado a cada alteração. */
  aoMudar: (html: string) => void;
}) {
  const inputImagem = useRef<HTMLInputElement>(null);
  const [enviandoImagem, setEnviandoImagem] = useState(false);
  const [erroImagem, setErroImagem] = useState<string | null>(null);

  const editor = useEditor({
    // Evita divergência entre servidor e navegador na primeira renderização.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] }, // H1 é o título da edição, definido no formulário
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: "noopener noreferrer" },
        },
      }),
      TextStyle,
      Color,
      Highlight, // marca-texto amarelo (estilizado em globals.css)
      Image.configure({ HTMLAttributes: { loading: "lazy" } }),
      TableKit.configure({ table: { resizable: false } }),
      Placeholder.configure({
        placeholder:
          "Escreva a edição aqui. Use os títulos para separar os blocos e o Destaque para marcar o que não pode passar batido.",
      }),
    ],
    content: valor,
    editorProps: {
      attributes: {
        class: "conteudo min-h-[28rem] px-5 py-6 focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => aoMudar(editor.getHTML()),
  });

  // Estados dos botões da barra, recalculados só quando algo muda.
  const estado = useEditorState({
    editor,
    selector: ({ editor }) => ({
      negrito: !!editor?.isActive("bold"),
      italico: !!editor?.isActive("italic"),
      sublinhado: !!editor?.isActive("underline"),
      titulo2: !!editor?.isActive("heading", { level: 2 }),
      titulo3: !!editor?.isActive("heading", { level: 3 }),
      listaMarcadores: !!editor?.isActive("bulletList"),
      listaNumerada: !!editor?.isActive("orderedList"),
      citacao: !!editor?.isActive("blockquote"),
      link: !!editor?.isActive("link"),
      destaque: !!editor?.isActive("highlight"),
      azul: !!editor?.isActive("textStyle", { color: AZUL_MARCA }),
      naTabela: !!editor?.isActive("table"),
      podeDesfazer: !!editor?.can().undo(),
      podeRefazer: !!editor?.can().redo(),
    }),
  });

  const definirLink = useCallback(() => {
    if (!editor) return;
    const atual = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("Endereço do link (deixe vazio para remover):", atual ?? "https://");

    if (url === null) return; // cancelou
    if (url.trim() === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: url.trim() })
      .run();
  }, [editor]);

  async function inserirImagem(arquivo: File) {
    if (!editor) return;
    setErroImagem(null);
    setEnviandoImagem(true);
    try {
      const url = await enviarImagem(arquivo, "corpo");
      const alt =
        window.prompt(
          "Descreva a imagem para quem não pode vê-la (acessibilidade):",
          "",
        ) ?? "";
      editor.chain().focus().setImage({ src: url, alt }).run();
    } catch (e) {
      setErroImagem(e instanceof Error ? e.message : "Falha ao enviar a imagem.");
    } finally {
      setEnviandoImagem(false);
      if (inputImagem.current) inputImagem.current.value = "";
    }
  }

  if (!editor) {
    return (
      <div className="min-h-[32rem] animate-pulse rounded-xl border border-line bg-surface" />
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-line bg-surface focus-within:border-brand-blue">
      {/* ---------------- Barra de ferramentas ---------------- */}
      <div
        role="toolbar"
        aria-label="Formatação do texto"
        className="flex flex-wrap items-center gap-1 border-b border-line bg-canvas px-2 py-2"
      >
        <BotaoBarra
          rotulo="Desfazer"
          onClick={() => editor.chain().focus().undo().run()}
          desabilitado={!estado?.podeDesfazer}
        >
          ↶
        </BotaoBarra>
        <BotaoBarra
          rotulo="Refazer"
          onClick={() => editor.chain().focus().redo().run()}
          desabilitado={!estado?.podeRefazer}
        >
          ↷
        </BotaoBarra>

        <Separador />

        <BotaoBarra
          rotulo="Título de seção"
          ativo={estado?.titulo2}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <span className="font-display font-extrabold">T1</span>
        </BotaoBarra>
        <BotaoBarra
          rotulo="Subtítulo"
          ativo={estado?.titulo3}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <span className="font-display text-xs font-extrabold">T2</span>
        </BotaoBarra>
        <BotaoBarra
          rotulo="Texto normal"
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <span className="text-xs font-semibold">Texto</span>
        </BotaoBarra>

        <Separador />

        <BotaoBarra
          rotulo="Negrito"
          ativo={estado?.negrito}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <strong>N</strong>
        </BotaoBarra>
        <BotaoBarra
          rotulo="Itálico"
          ativo={estado?.italico}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <em>I</em>
        </BotaoBarra>
        <BotaoBarra
          rotulo="Sublinhado"
          ativo={estado?.sublinhado}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <u>S</u>
        </BotaoBarra>

        <Separador />

        {/* --- Acentos da marca: é aqui que o editor cria os destaques --- */}
        <BotaoBarra
          rotulo="Destaque amarelo (marca-texto)"
          ativo={estado?.destaque}
          onClick={() => editor.chain().focus().toggleHighlight().run()}
        >
          <span className="rounded-sm bg-brand-yellow px-1 text-ink">Aa</span>
        </BotaoBarra>
        <BotaoBarra
          rotulo="Texto em azul Ecoville"
          ativo={estado?.azul}
          onClick={() =>
            estado?.azul
              ? editor.chain().focus().unsetColor().run()
              : editor.chain().focus().setColor(AZUL_MARCA).run()
          }
        >
          <span className="font-bold text-brand-blue">Aa</span>
        </BotaoBarra>
        <BotaoBarra
          rotulo="Limpar formatação"
          onClick={() =>
            editor.chain().focus().unsetAllMarks().clearNodes().run()
          }
        >
          <span className="text-xs font-semibold">Limpar</span>
        </BotaoBarra>

        <Separador />

        <BotaoBarra
          rotulo="Lista com marcadores"
          ativo={estado?.listaMarcadores}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          •—
        </BotaoBarra>
        <BotaoBarra
          rotulo="Lista numerada"
          ativo={estado?.listaNumerada}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          1—
        </BotaoBarra>
        <BotaoBarra
          rotulo="Citação"
          ativo={estado?.citacao}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <span className="font-display text-base font-extrabold">&rdquo;</span>
        </BotaoBarra>
        <BotaoBarra
          rotulo="Linha divisória"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          —
        </BotaoBarra>

        <Separador />

        <BotaoBarra
          rotulo={estado?.link ? "Editar ou remover link" : "Inserir link"}
          ativo={estado?.link}
          onClick={definirLink}
        >
          <span className="text-xs font-semibold">Link</span>
        </BotaoBarra>

        <BotaoBarra
          rotulo="Inserir imagem"
          onClick={() => inputImagem.current?.click()}
          desabilitado={enviandoImagem}
        >
          <span className="text-xs font-semibold">
            {enviandoImagem ? "Enviando…" : "Imagem"}
          </span>
        </BotaoBarra>
        <input
          ref={inputImagem}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const arquivo = e.target.files?.[0];
            if (arquivo) void inserirImagem(arquivo);
          }}
        />

        <Separador />

        <BotaoBarra
          rotulo="Inserir tabela 3x3"
          onClick={() =>
            editor
              .chain()
              .focus()
              .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
              .run()
          }
        >
          <span className="text-xs font-semibold">Tabela</span>
        </BotaoBarra>

        {/* Controles de tabela só aparecem quando o cursor está dentro de uma. */}
        {estado?.naTabela && (
          <>
            <BotaoBarra
              rotulo="Adicionar coluna"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
            >
              <span className="text-xs">+col</span>
            </BotaoBarra>
            <BotaoBarra
              rotulo="Adicionar linha"
              onClick={() => editor.chain().focus().addRowAfter().run()}
            >
              <span className="text-xs">+lin</span>
            </BotaoBarra>
            <BotaoBarra
              rotulo="Remover coluna"
              onClick={() => editor.chain().focus().deleteColumn().run()}
            >
              <span className="text-xs">−col</span>
            </BotaoBarra>
            <BotaoBarra
              rotulo="Remover linha"
              onClick={() => editor.chain().focus().deleteRow().run()}
            >
              <span className="text-xs">−lin</span>
            </BotaoBarra>
            <BotaoBarra
              rotulo="Excluir tabela"
              onClick={() => editor.chain().focus().deleteTable().run()}
            >
              <span className="text-xs">excluir</span>
            </BotaoBarra>
          </>
        )}
      </div>

      {erroImagem && (
        <p role="alert" className="border-b border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-800">
          {erroImagem}
        </p>
      )}

      {/* ---------------- Área de escrita ---------------- */}
      <EditorContent editor={editor} />
    </div>
  );
}

function BotaoBarra({
  rotulo,
  ativo,
  desabilitado,
  onClick,
  children,
}: {
  rotulo: string;
  ativo?: boolean;
  desabilitado?: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desabilitado}
      title={rotulo}
      aria-label={rotulo}
      aria-pressed={ativo}
      className={cn(
        "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm transition-colors",
        ativo
          ? "bg-brand-blue text-white"
          : "text-ink-muted hover:bg-brand-blue-soft hover:text-brand-blue",
        desabilitado && "cursor-not-allowed opacity-40 hover:bg-transparent",
      )}
    >
      {children}
    </button>
  );
}

function Separador() {
  return <span aria-hidden className="mx-1 h-6 w-px bg-line" />;
}
