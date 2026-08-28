"use client";

import { useState } from "react";
import { Wordmark } from "@/components/brand/Wordmark";
import { LinkRastreado } from "./LinkRastreado";
import { IconeCadeado, IconeFechar, IconeMenu } from "@/components/ui/Icones";
import { cn } from "@/lib/utils";

/**
 * Header fixo da área pública.
 *
 * Fundo azul da marca com texto branco (combinação segura) e o amarelo
 * reservado para o estado ativo/hover e para o selo "Área do Franqueado".
 */

const NAVEGACAO = [
  { rotulo: "Últimas", href: "/#ultimas", alvo: "nav_ultimas" },
  { rotulo: "Categorias", href: "/#categorias", alvo: "nav_categorias" },
  { rotulo: "Arquivo", href: "/edicoes", alvo: "nav_arquivo" },
  { rotulo: "Buscar", href: "/edicoes#busca", alvo: "nav_buscar" },
] as const;

export function Header() {
  const [aberto, setAberto] = useState(false);

  return (
    <header className="on-blue sticky top-0 z-50 bg-brand-blue text-white shadow-[0_1px_0_rgba(255,255,255,0.12)]">
      <a
        href="#conteudo-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-md focus:bg-brand-yellow focus:px-4 focus:py-2 focus:font-semibold focus:text-brand-blue"
      >
        Pular para o conteúdo
      </a>

      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6 lg:h-[4.5rem]">
        <Wordmark tom="claro" comoLink />

        <nav aria-label="Navegação principal" className="ml-auto hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAVEGACAO.map((item) => (
              <li key={item.href}>
                <LinkRastreado
                  href={item.href}
                  alvo={item.alvo}
                  className="relative block rounded-md px-3 py-2 text-sm font-semibold text-white/90 transition-colors hover:text-brand-yellow"
                >
                  {item.rotulo}
                </LinkRastreado>
              </li>
            ))}
          </ul>
        </nav>

        {/* Selo discreto: reforça que o material é interno da rede. */}
        <span className="ml-auto hidden items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-xs font-semibold tracking-wide text-white/85 lg:ml-4 lg:inline-flex">
          <IconeCadeado className="size-3.5" />
          Área do Franqueado
        </span>

        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          aria-expanded={aberto}
          aria-controls="menu-movel"
          className="ml-auto inline-flex size-10 items-center justify-center rounded-lg border border-white/25 lg:hidden"
        >
          <span className="sr-only">{aberto ? "Fechar menu" : "Abrir menu"}</span>
          {aberto ? (
            <IconeFechar className="size-5" />
          ) : (
            <IconeMenu className="size-5" />
          )}
        </button>
      </div>

      {/* Menu móvel */}
      <div
        id="menu-movel"
        hidden={!aberto}
        className="border-t border-white/15 bg-brand-blue-deep lg:hidden"
      >
        <nav aria-label="Navegação principal (móvel)">
          <ul className="mx-auto max-w-6xl px-4 py-3 sm:px-6">
            {NAVEGACAO.map((item) => (
              <li key={item.href}>
                <LinkRastreado
                  href={item.href}
                  alvo={`${item.alvo}_mobile`}
                  onClick={() => setAberto(false)}
                  className={cn(
                    "block rounded-md px-2 py-3 text-base font-semibold text-white",
                    "border-b border-white/10 last:border-b-0",
                  )}
                >
                  {item.rotulo}
                </LinkRastreado>
              </li>
            ))}
            <li className="pt-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-white/25 px-3 py-1.5 text-xs font-semibold text-white/85">
                <IconeCadeado className="size-3.5" />
                Área do Franqueado
              </span>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}
