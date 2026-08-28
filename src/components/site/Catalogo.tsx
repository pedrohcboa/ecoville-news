"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { NewsletterCard } from "./NewsletterCard";
import { IconeBusca, IconeFechar } from "@/components/ui/Icones";
import { eventos } from "@/lib/analytics";
import { cn, normalizarBusca } from "@/lib/utils";
import type { Categoria, Newsletter } from "@/lib/types";

/**
 * Catálogo de edições: busca em tempo real + filtro por categoria + "carregar
 * mais". Tudo acontece no cliente sobre a lista já publicada (o volume de
 * edições de uma newsletter interna é pequeno, então filtrar em memória é mais
 * rápido e mais simples do que ida e volta ao servidor).
 */

const POR_PAGINA = 9;
/** Espera antes de registrar a busca — evita um evento por tecla digitada. */
const ATRASO_EVENTO_BUSCA = 900;

export function Catalogo({
  newsletters,
  categorias,
  categoriaInicial = "todas",
  mostrarFiltros = true,
}: {
  newsletters: Newsletter[];
  categorias: Categoria[];
  categoriaInicial?: string;
  mostrarFiltros?: boolean;
}) {
  const [termo, setTermo] = useState("");
  const [categoria, setCategoria] = useState(categoriaInicial);
  const [visiveis, setVisiveis] = useState(POR_PAGINA);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Registra o termo buscado só depois que o usuário para de digitar.
  useEffect(() => {
    if (!termo.trim()) return;
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(
      () => eventos.busca(termo.trim()),
      ATRASO_EVENTO_BUSCA,
    );
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, [termo]);

  const filtradas = useMemo(() => {
    const busca = normalizarBusca(termo.trim());

    return newsletters.filter((n) => {
      if (categoria !== "todas" && n.categoria !== categoria) return false;
      if (!busca) return true;

      // A busca cobre título, resumo e tags — o que o franqueado lembra.
      const alvo = normalizarBusca(
        `${n.titulo} ${n.resumo} ${n.tags.join(" ")}`,
      );
      return busca.split(/\s+/).every((parte) => alvo.includes(parte));
    });
  }, [newsletters, termo, categoria]);

  // Buscar ou filtrar volta a listagem para a primeira "página".
  function trocarTermo(valor: string) {
    setTermo(valor);
    setVisiveis(POR_PAGINA);
  }

  function trocarCategoria(slug: string) {
    setCategoria(slug);
    setVisiveis(POR_PAGINA);
    eventos.filtroCategoria(slug);
  }

  const listadas = filtradas.slice(0, visiveis);
  const restantes = filtradas.length - listadas.length;

  return (
    <div>
      {/* ---------- Busca ---------- */}
      <div id="busca" className="scroll-mt-28">
        <label htmlFor="campo-busca" className="sr-only">
          Buscar edições por título, resumo ou tag
        </label>
        <div className="relative">
          <IconeBusca className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-faint" />
          <input
            id="campo-busca"
            type="search"
            value={termo}
            onChange={(e) => trocarTermo(e.target.value)}
            placeholder="Buscar por título, resumo ou tag…"
            autoComplete="off"
            className="w-full rounded-xl border border-line bg-surface py-3.5 pr-12 pl-12 text-base text-ink shadow-card outline-none placeholder:text-ink-faint focus:border-brand-blue"
          />
          {termo && (
            <button
              type="button"
              onClick={() => trocarTermo("")}
              className="absolute top-1/2 right-3 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-lg text-ink-faint hover:bg-canvas hover:text-ink"
            >
              <span className="sr-only">Limpar busca</span>
              <IconeFechar className="size-4" />
            </button>
          )}
        </div>
      </div>

      {/* ---------- Filtro por categoria ---------- */}
      {mostrarFiltros && (
        <div className="mt-5">
          <h3 className="sr-only">Filtrar por categoria</h3>
          <div className="flex flex-wrap gap-2">
            <BotaoFiltro
              ativo={categoria === "todas"}
              onClick={() => trocarCategoria("todas")}
            >
              Todas
            </BotaoFiltro>
            {categorias.map((c) => (
              <BotaoFiltro
                key={c.slug}
                ativo={categoria === c.slug}
                onClick={() => trocarCategoria(c.slug)}
              >
                {c.nome}
              </BotaoFiltro>
            ))}
          </div>
        </div>
      )}

      {/* ---------- Resultado ---------- */}
      <p
        aria-live="polite"
        className="mt-6 text-sm font-medium text-ink-muted"
      >
        {filtradas.length === 0
          ? "Nenhuma edição encontrada"
          : `${filtradas.length} ${filtradas.length === 1 ? "edição encontrada" : "edições encontradas"}`}
      </p>

      {filtradas.length === 0 ? (
        <EstadoVazio
          termo={termo}
          aoLimpar={() => {
            trocarTermo("");
            setCategoria("todas");
          }}
        />
      ) : (
        <>
          <ul className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {listadas.map((n, i) => (
              <li key={n.id}>
                <NewsletterCard
                  newsletter={n}
                  categorias={categorias}
                  prioridadeImagem={i < 3}
                />
              </li>
            ))}
          </ul>

          {restantes > 0 && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => {
                  setVisiveis((v) => v + POR_PAGINA);
                  eventos.clique("catalogo_carregar_mais");
                }}
                className="rounded-lg border-2 border-brand-blue px-6 py-3 text-sm font-bold text-brand-blue transition-colors hover:bg-brand-blue hover:text-white"
              >
                Carregar mais ({restantes})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function BotaoFiltro({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
        ativo
          ? "border-brand-blue bg-brand-blue text-white"
          : "border-line bg-surface text-ink-muted hover:border-brand-blue/40 hover:text-brand-blue",
      )}
    >
      {children}
    </button>
  );
}

function EstadoVazio({
  termo,
  aoLimpar,
}: {
  termo: string;
  aoLimpar: () => void;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-line-strong bg-surface p-10 text-center">
      <IconeBusca className="mx-auto size-10 text-ink-faint" />
      <p className="mt-4 text-lg font-bold text-ink">
        Nada encontrado{termo ? ` para “${termo}”` : ""}
      </p>
      <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">
        Tente outro termo ou remova o filtro de categoria. Se o assunto ainda
        não foi publicado, ele pode entrar em uma próxima edição.
      </p>
      <button
        type="button"
        onClick={aoLimpar}
        className="mt-6 rounded-lg bg-brand-blue px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-blue-deep"
      >
        Limpar filtros
      </button>
    </div>
  );
}
