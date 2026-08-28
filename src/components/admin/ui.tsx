import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Peças reutilizadas pelas telas do painel.
 * Rótulos sempre visíveis, mensagens em português e nada de jargão técnico —
 * o painel é usado por quem não programa.
 */

export function Campo({
  id,
  rotulo,
  ajuda,
  obrigatorio,
  children,
}: {
  id: string;
  rotulo: string;
  ajuda?: string;
  obrigatorio?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-bold text-ink">
        {rotulo}
        {obrigatorio && (
          <span className="ml-1 text-brand-blue" aria-hidden>
            *
          </span>
        )}
      </label>
      {ajuda && <p className="mt-1 text-xs text-ink-faint">{ajuda}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

export const classesEntrada =
  "w-full rounded-lg border border-line bg-surface px-3.5 py-2.5 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-ink-faint focus:border-brand-blue disabled:bg-canvas disabled:text-ink-faint";

type VarianteBotao = "primario" | "secundario" | "perigo" | "fantasma";

const VARIANTES: Record<VarianteBotao, string> = {
  primario:
    "bg-brand-blue text-white hover:bg-brand-blue-deep disabled:bg-brand-blue/50",
  secundario:
    "border-2 border-brand-blue text-brand-blue hover:bg-brand-blue hover:text-white disabled:opacity-50",
  perigo:
    "border border-line text-red-700 hover:border-red-300 hover:bg-red-50 disabled:opacity-50",
  fantasma: "text-ink-muted hover:bg-canvas hover:text-ink disabled:opacity-50",
};

export function classesBotao(
  variante: VarianteBotao = "primario",
  extra?: string,
) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-bold transition-colors disabled:cursor-not-allowed",
    VARIANTES[variante],
    extra,
  );
}

export function Alerta({
  tom,
  children,
}: {
  tom: "erro" | "sucesso" | "aviso" | "info";
  children: ReactNode;
}) {
  const estilos = {
    erro: "border-red-200 bg-red-50 text-red-800",
    sucesso: "border-emerald-200 bg-emerald-50 text-emerald-800",
    aviso: "border-amber-200 bg-amber-50 text-amber-900",
    info: "border-line bg-brand-blue-soft text-brand-blue-deep",
  }[tom];

  return (
    <div
      role={tom === "erro" ? "alert" : "status"}
      className={cn("rounded-lg border px-4 py-3 text-sm font-medium", estilos)}
    >
      {children}
    </div>
  );
}

/** Etiqueta de status usada na lista de edições. */
export function Selo({ status }: { status: string }) {
  const publicado = status === "publicado";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold",
        publicado
          ? "bg-emerald-100 text-emerald-800"
          : "bg-amber-100 text-amber-900",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-1.5 rounded-full",
          publicado ? "bg-emerald-600" : "bg-amber-600",
        )}
      />
      {publicado ? "Publicado" : "Rascunho"}
    </span>
  );
}
