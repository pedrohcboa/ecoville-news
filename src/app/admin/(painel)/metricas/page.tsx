import type { Metadata } from "next";
import {
  BarrasHorizontais,
  GraficoLinha,
  SemDados,
  type ItemBarra,
  type PontoDiario,
} from "@/components/admin/Graficos";
import { SeletorPeriodo } from "@/components/admin/SeletorPeriodo";
import { Alerta } from "@/components/admin/ui";
import { criarClienteServidor } from "@/lib/supabase/server";
import { formatarNumero } from "@/lib/utils";

export const metadata: Metadata = { title: "Métricas" };
export const revalidate = 0;

/** Rótulos amigáveis para os nomes técnicos dos botões rastreados. */
const NOMES_DE_BOTAO: Record<string, string> = {
  hero_cta_primary: "Hero — “Ver últimas edições”",
  hero_cta_secondary: "Hero — “Explorar categorias”",
  destaque_ler: "Destaque da home — “Ler edição”",
  card_ler: "Card de edição no catálogo",
  categoria_card: "Card de categoria",
  home_ver_arquivo: "Home — “Ver arquivo completo”",
  catalogo_carregar_mais: "Catálogo — “Carregar mais”",
  artigo_proxima: "Edição — próxima",
  artigo_anterior: "Edição — anterior",
  artigo_voltar_arquivo: "Edição — voltar ao arquivo",
  sobre_ir_arquivo: "Página “Como funciona” — ir ao arquivo",
  nav_ultimas: "Menu — Últimas",
  nav_categorias: "Menu — Categorias",
  nav_arquivo: "Menu — Arquivo",
  nav_buscar: "Menu — Buscar",
  nav_ultimas_mobile: "Menu (celular) — Últimas",
  nav_categorias_mobile: "Menu (celular) — Categorias",
  nav_arquivo_mobile: "Menu (celular) — Arquivo",
  nav_buscar_mobile: "Menu (celular) — Buscar",
};

interface Totais {
  pageviews: number;
  aberturas: number;
  cliques: number;
  buscas: number;
  visitantes: number;
}

export default async function PaginaMetricas({
  searchParams,
}: PageProps<"/admin/metricas">) {
  const parametros = await searchParams;
  const bruto = Number(
    Array.isArray(parametros.dias) ? parametros.dias[0] : parametros.dias,
  );
  const dias = [7, 30, 90].includes(bruto) ? bruto : 30;

  const supabase = await criarClienteServidor();

  const [serie, totais, topNewsletters, porBotao, buscas] = await Promise.all([
    supabase.rpc("metricas_serie_diaria", { dias }),
    supabase.rpc("metricas_totais", { dias }),
    supabase.rpc("metricas_top_newsletters", { dias, limite: 10 }),
    supabase.rpc("metricas_por_botao", { dias }),
    supabase.rpc("metricas_buscas", { dias, limite: 10 }),
  ]);

  const erro =
    serie.error ?? totais.error ?? topNewsletters.error ?? porBotao.error ?? buscas.error;

  const dadosSerie = (serie.data ?? []) as PontoDiario[];
  const resumo = ((totais.data ?? [])[0] ?? {
    pageviews: 0,
    aberturas: 0,
    cliques: 0,
    buscas: 0,
    visitantes: 0,
  }) as Totais;

  const barrasNewsletters: ItemBarra[] = (
    (topNewsletters.data ?? []) as Array<{
      titulo: string;
      categoria: string;
      aberturas: number;
      cliques: number;
    }>
  ).map((n) => ({
    rotulo: n.titulo,
    valor: n.aberturas,
    detalhe: `${formatarNumero(n.cliques)} cliques`,
  }));

  const barrasBotoes: ItemBarra[] = (
    (porBotao.data ?? []) as Array<{ alvo: string; cliques: number }>
  )
    .slice(0, 12)
    .map((b) => ({
      rotulo: NOMES_DE_BOTAO[b.alvo] ?? b.alvo,
      valor: b.cliques,
    }));

  const termosBuscados = (buscas.data ?? []) as Array<{
    termo: string;
    ocorrencias: number;
  }>;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-ink">Métricas</h1>
          <p className="mt-1 text-ink-muted">
            Uso do portal pelos franqueados nos últimos {dias} dias.
          </p>
        </div>
        <SeletorPeriodo atual={dias} />
      </div>

      {erro && (
        <div className="mt-6">
          <Alerta tom="erro">
            Não foi possível carregar as métricas: {erro.message}
          </Alerta>
        </div>
      )}

      {/* ---------------- Visão geral ---------------- */}
      <section aria-labelledby="visao-geral" className="mt-8">
        <h2 id="visao-geral" className="sr-only">
          Visão geral do período
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Indicador
            valor={resumo.visitantes}
            rotulo="Visitantes"
            ajuda="Sessões distintas no período"
          />
          <Indicador
            valor={resumo.pageviews}
            rotulo="Páginas vistas"
            ajuda="Total de carregamentos de página"
          />
          <Indicador
            valor={resumo.aberturas}
            rotulo="Aberturas de edição"
            ajuda="Quantas vezes uma newsletter foi aberta"
          />
          <Indicador
            valor={resumo.cliques}
            rotulo="Cliques em botões"
            ajuda="Somatório de todos os botões rastreados"
          />
        </div>
      </section>

      {/* ---------------- Evolução diária ---------------- */}
      <section aria-labelledby="evolucao" className="mt-8">
        <div className="rounded-xl border border-line bg-surface p-5 sm:p-6">
          <h2 id="evolucao" className="text-lg font-extrabold text-ink">
            Evolução diária
          </h2>
          <p className="mt-1 mb-4 text-sm text-ink-muted">
            Passe o mouse sobre o gráfico para ver os números de cada dia.
          </p>
          <GraficoLinha dados={dadosSerie} />
        </div>
      </section>

      {/* ---------------- Rankings ---------------- */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section
          aria-labelledby="top-edicoes"
          className="rounded-xl border border-line bg-surface p-5 sm:p-6"
        >
          <h2 id="top-edicoes" className="text-lg font-extrabold text-ink">
            Edições mais abertas
          </h2>
          <p className="mt-1 mb-5 text-sm text-ink-muted">
            Quantas vezes cada edição foi aberta no período.
          </p>
          <BarrasHorizontais itens={barrasNewsletters} unidade="aberturas" />
        </section>

        <section
          aria-labelledby="por-botao"
          className="rounded-xl border border-line bg-surface p-5 sm:p-6"
        >
          <h2 id="por-botao" className="text-lg font-extrabold text-ink">
            Cliques por botão
          </h2>
          <p className="mt-1 mb-5 text-sm text-ink-muted">
            Quais chamadas para ação realmente funcionam.
          </p>
          <BarrasHorizontais itens={barrasBotoes} unidade="cliques" />
        </section>
      </div>

      {/* ---------------- Termos buscados ---------------- */}
      <section
        aria-labelledby="buscas"
        className="mt-6 rounded-xl border border-line bg-surface p-5 sm:p-6"
      >
        <h2 id="buscas" className="text-lg font-extrabold text-ink">
          O que os franqueados procuram
        </h2>
        <p className="mt-1 mb-5 text-sm text-ink-muted">
          Termos digitados na busca — bom indicador de pauta para as próximas
          edições.
        </p>
        {termosBuscados.length === 0 ? (
          <SemDados />
        ) : (
          <ul className="flex flex-wrap gap-2">
            {termosBuscados.map((t) => (
              <li
                key={t.termo}
                className="rounded-full border border-line px-3.5 py-1.5 text-sm text-ink-muted"
              >
                {t.termo}
                <span className="ml-2 font-bold text-brand-blue tabular-nums">
                  {t.ocorrencias}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-8 text-xs leading-relaxed text-ink-faint">
        Estes números vêm da tabela de eventos do próprio portal e são
        totalmente anônimos: não guardamos IP, nome nem e-mail de quem lê. O
        tráfego agregado também está disponível no painel do Vercel (Web
        Analytics).
      </p>
    </div>
  );
}

/** Cartão de indicador: número grande + o que ele significa. */
function Indicador({
  valor,
  rotulo,
  ajuda,
}: {
  valor: number;
  rotulo: string;
  ajuda: string;
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-5">
      <p className="font-display text-4xl font-extrabold text-brand-blue tabular-nums">
        {formatarNumero(valor)}
      </p>
      <p className="mt-1 text-sm font-bold text-ink">{rotulo}</p>
      <p className="mt-0.5 text-xs text-ink-faint">{ajuda}</p>
    </div>
  );
}
