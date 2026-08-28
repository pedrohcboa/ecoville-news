import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * ASSINATURA DA MARCA — PLACEHOLDER.
 * -------------------------------------------------------------------------
 * A logo oficial em alta resolução ainda não está disponível, então usamos um
 * wordmark tipográfico com a mesma personalidade (Archivo extrabold + detalhe
 * amarelo evocando o traço da marca).
 *
 * COMO TROCAR PELA LOGO REAL (é o único lugar a mexer):
 *   1. coloque o arquivo em `public/logo-ecoville-news.svg` (ou .png);
 *   2. substitua o bloco <span>…</span> abaixo por:
 *        <Image src="/logo-ecoville-news.svg" alt="Ecoville News"
 *               width={168} height={32} priority />
 *      usando uma versão branca no header (`tom="claro"`) e uma azul no
 *      footer/impressos (`tom="escuro"`);
 *   3. nada mais no site precisa mudar — header, footer e login consomem
 *      este mesmo componente.
 */

interface WordmarkProps {
  /** "claro" = sobre fundo azul; "escuro" = sobre fundo claro. */
  tom?: "claro" | "escuro";
  /** Envolve a marca num link para a home. */
  comoLink?: boolean;
  tamanho?: "sm" | "md" | "lg";
  className?: string;
}

const TAMANHOS = {
  sm: "text-lg",
  md: "text-xl sm:text-[1.375rem]",
  lg: "text-3xl sm:text-4xl",
} as const;

export function Wordmark({
  tom = "escuro",
  comoLink = false,
  tamanho = "md",
  className,
}: WordmarkProps) {
  const marca = (
    <span
      className={cn(
        "font-display font-extrabold tracking-tight whitespace-nowrap",
        TAMANHOS[tamanho],
        tom === "claro" ? "text-white" : "text-brand-blue",
        className,
      )}
    >
      Ecoville
      {/* O "News" ganha o traço amarelo da marca. Em fundo claro o amarelo
          nunca carrega texto — ele é apenas sublinhado. */}
      <span className="relative ml-1.5">
        <span className="relative z-10">News</span>
        <span
          aria-hidden
          className="absolute inset-x-0 -bottom-0.5 h-[0.18em] rounded-full bg-brand-yellow"
        />
      </span>
    </span>
  );

  if (!comoLink) return marca;

  return (
    <Link
      href="/"
      aria-label="Ecoville News — página inicial"
      className="inline-flex items-center rounded-md"
    >
      {marca}
    </Link>
  );
}
