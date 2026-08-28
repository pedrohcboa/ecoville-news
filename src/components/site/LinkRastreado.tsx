"use client";

import Link from "next/link";
import type { ComponentProps, MouseEvent } from "react";
import { eventos } from "@/lib/analytics";

/**
 * `<Link>` que registra um evento de clique antes de navegar.
 *
 * Cada botão relevante do site passa por aqui com um `alvo` estável (ex.:
 * `hero_cta_primary`, `card_ler`), que é exatamente o rótulo que aparece no
 * ranking de cliques do painel de métricas.
 */
interface LinkRastreadoProps extends ComponentProps<typeof Link> {
  /** Nome do botão no relatório de métricas. Use snake_case e mantenha estável. */
  alvo: string;
  /** Edição associada, quando o clique acontece dentro/sobre uma newsletter. */
  newsletterId?: string;
  categoria?: string;
}

export function LinkRastreado({
  alvo,
  newsletterId,
  categoria,
  onClick,
  ...props
}: LinkRastreadoProps) {
  function aoClicar(e: MouseEvent<HTMLAnchorElement>) {
    eventos.clique(alvo, {
      newsletter_id: newsletterId ?? null,
      categoria: categoria ?? null,
    });
    onClick?.(e);
  }

  return <Link {...props} onClick={aoClicar} />;
}

/**
 * Versão para links externos (abrem em nova aba). Registrada com o mesmo
 * mecanismo para que saídas do site também apareçam no relatório.
 */
export function LinkExternoRastreado({
  alvo,
  href,
  children,
  className,
}: {
  alvo: string;
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => eventos.clique(alvo)}
    >
      {children}
    </a>
  );
}
