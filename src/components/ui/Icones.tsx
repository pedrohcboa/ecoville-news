import type { SVGProps } from "react";
import { aparenciaCategoria } from "@/lib/categorias";

/**
 * Ícones desenhados à mão em SVG inline.
 * Evitamos uma biblioteca de ícones inteira para manter o bundle pequeno —
 * são poucos símbolos e todos ficam aqui.
 */

type Props = SVGProps<SVGSVGElement>;

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

/** Frasco de produto — trilha Produtos. */
export function IconeFrasco(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M10 2h4v3h-4z" />
      <path d="M9 5h6l1.6 3.2A6 6 0 0 1 17 11v8a3 3 0 0 1-3 3h-4a3 3 0 0 1-3-3v-8a6 6 0 0 1 .4-2.8Z" />
      <path d="M7 14h10" />
    </svg>
  );
}

/** Megafone — trilha Impulsionar a Loja. */
export function IconeMegafone(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M3 11v2a2 2 0 0 0 2 2h2l7 4V5L7 9H5a2 2 0 0 0-2 2Z" />
      <path d="M18 9a4 4 0 0 1 0 6" />
      <path d="M7 15v4a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-3" />
    </svg>
  );
}

/** Moeda — trilha Dicas Econômicas. */
export function IconeMoeda(props: Props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M14.5 9.2A3 3 0 0 0 12 8c-1.7 0-3 .9-3 2.1 0 2.6 6 1.3 6 3.8 0 1.2-1.3 2.1-3 2.1a3 3 0 0 1-2.5-1.2" />
      <path d="M12 6.3v1.6M12 16v1.7" />
    </svg>
  );
}

/** Estrela — fallback para categorias novas criadas pelo banco. */
export function IconeEstrela(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9Z" />
    </svg>
  );
}

export function IconeBusca(props: Props) {
  return (
    <svg {...base} {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

export function IconeSeta(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

export function IconeRelogio(props: Props) {
  return (
    <svg {...base} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function IconeCadeado(props: Props) {
  return (
    <svg {...base} {...props}>
      <rect x="4" y="10" width="16" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function IconeMenu(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function IconeFechar(props: Props) {
  return (
    <svg {...base} {...props}>
      <path d="M6 6l12 12M18 6 6 18" />
    </svg>
  );
}

/** Escolhe o ícone certo a partir do slug da categoria. */
export function IconeCategoria({
  categoria,
  ...props
}: Props & { categoria: string }) {
  switch (aparenciaCategoria(categoria).icone) {
    case "frasco":
      return <IconeFrasco {...props} />;
    case "megafone":
      return <IconeMegafone {...props} />;
    case "moeda":
      return <IconeMoeda {...props} />;
    default:
      return <IconeEstrela {...props} />;
  }
}
