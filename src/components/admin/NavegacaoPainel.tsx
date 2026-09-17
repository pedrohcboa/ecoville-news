"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

/** Abas do painel. `/admin` só fica ativa em correspondência exata. */
const ABAS = [
  { rotulo: "Edições", href: "/admin", exato: true },
  { rotulo: "Nova edição", href: "/admin/nova", exato: false },
  { rotulo: "Categorias", href: "/admin/categorias", exato: false },
  { rotulo: "Métricas", href: "/admin/metricas", exato: false },
] as const;

export function NavegacaoPainel() {
  const pathname = usePathname();

  return (
    <nav aria-label="Seções do painel" className="-mb-px flex gap-1 overflow-x-auto">
      {ABAS.map((aba) => {
        const ativa = aba.exato
          ? pathname === aba.href
          : pathname.startsWith(aba.href);

        return (
          <Link
            key={aba.href}
            href={aba.href}
            aria-current={ativa ? "page" : undefined}
            className={cn(
              "border-b-2 px-4 py-3 text-sm font-bold whitespace-nowrap transition-colors",
              ativa
                ? "border-brand-blue text-brand-blue"
                : "border-transparent text-ink-muted hover:border-line-strong hover:text-ink",
            )}
          >
            {aba.rotulo}
          </Link>
        );
      })}
    </nav>
  );
}
