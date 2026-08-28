import { aparenciaCategoria } from "@/lib/categorias";
import { cn } from "@/lib/utils";

/**
 * Tag de categoria. As combinações de cor vêm de `aparenciaCategoria`, que já
 * garante contraste AA (branco sobre azul, azul sobre amarelo, branco sobre
 * tinta) — nunca amarelo sobre branco.
 */
export function ChipCategoria({
  categoria,
  nome,
  className,
}: {
  categoria: string;
  nome: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[0.6875rem] font-bold tracking-[0.08em] uppercase",
        aparenciaCategoria(categoria).chip,
        className,
      )}
    >
      {nome}
    </span>
  );
}
