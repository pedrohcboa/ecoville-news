import { LinkRastreado } from "./LinkRastreado";
import { IconeSeta } from "@/components/ui/Icones";

/**
 * Hero da home: promessa curta, palavra-chave destacada e dois CTAs
 * nomeados (rastreados como `hero_cta_primary` / `hero_cta_secondary`).
 */
export function Hero() {
  return (
    <section className="on-blue relative overflow-hidden bg-brand-blue text-white">
      {/* Textura sutil: círculos amarelos muito translúcidos, só para dar
          profundidade ao bloco azul sem competir com o texto. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-24 -right-24 size-[28rem] rounded-full bg-brand-yellow/10 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-20 size-[22rem] rounded-full bg-white/5 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:py-28">
        <p className="text-xs font-bold tracking-[0.2em] text-brand-yellow uppercase">
          Newsletter da rede · Especialista em Limpeza
        </p>

        <h1 className="mt-5 max-w-3xl text-4xl leading-[1.05] font-extrabold sm:text-5xl lg:text-6xl">
          Conteúdo que faz sua{" "}
          <span className="text-brand-yellow">unidade</span> vender mais.
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
          Edições recorrentes com o que a operação precisa saber: ficha técnica
          de produto, execução de loja e gestão de margem. Direto da matriz para
          os franqueados Ecoville.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <LinkRastreado
            href="/#ultimas"
            alvo="hero_cta_primary"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-yellow px-6 py-3.5 text-base font-bold text-brand-blue transition-colors hover:bg-brand-yellow-deep"
          >
            Ver últimas edições
            <IconeSeta className="size-4" />
          </LinkRastreado>

          <LinkRastreado
            href="/#categorias"
            alvo="hero_cta_secondary"
            className="inline-flex items-center justify-center gap-2 rounded-lg border-2 border-white/35 px-6 py-3.5 text-base font-bold text-white transition-colors hover:border-white hover:bg-white/10"
          >
            Explorar categorias
          </LinkRastreado>
        </div>
      </div>
    </section>
  );
}
