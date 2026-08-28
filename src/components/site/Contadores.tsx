import { formatarNumero } from "@/lib/utils";

/**
 * Contadores de estatística.
 *
 * IMPORTANTE: todos os números vêm dos dados reais do banco (contagem de
 * edições publicadas e de categorias). Nada é fixo no código.
 *
 * O terceiro contador — frequência de publicação — é **opcional** e só aparece
 * quando `NEXT_PUBLIC_MOSTRAR_FREQUENCIA` e `NEXT_PUBLIC_FREQUENCIA` estão
 * definidos no `.env.local`. Sem isso, não inventamos uma periodicidade.
 */
export function Contadores({
  totalEdicoes,
  totalCategorias,
}: {
  totalEdicoes: number;
  totalCategorias: number;
}) {
  const mostrarFrequencia =
    process.env.NEXT_PUBLIC_MOSTRAR_FREQUENCIA === "true" &&
    Boolean(process.env.NEXT_PUBLIC_FREQUENCIA);

  const itens = [
    { valor: formatarNumero(totalEdicoes), rotulo: "edições publicadas" },
    { valor: formatarNumero(totalCategorias), rotulo: "trilhas de conteúdo" },
    ...(mostrarFrequencia
      ? [
          {
            valor: process.env.NEXT_PUBLIC_FREQUENCIA as string,
            rotulo: "ritmo de publicação",
          },
        ]
      : []),
  ];

  return (
    <section
      aria-label="Números do Ecoville News"
      className="border-y border-line bg-surface"
    >
      <dl className="mx-auto grid max-w-6xl grid-cols-2 divide-line px-4 sm:px-6 md:grid-cols-3 md:divide-x">
        {itens.map((item, i) => (
          <div
            key={item.rotulo}
            className={`py-8 md:px-8 ${i === 0 ? "md:pl-0" : ""}`}
          >
            <dt className="sr-only">{item.rotulo}</dt>
            <dd>
              <span className="block font-display text-4xl font-extrabold text-brand-blue sm:text-5xl">
                {item.valor}
              </span>
              <span className="mt-1 block text-sm font-medium text-ink-muted">
                {item.rotulo}
              </span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
