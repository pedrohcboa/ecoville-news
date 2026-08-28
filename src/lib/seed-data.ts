import type { Newsletter } from "./types";

/**
 * DADOS DE EXEMPLO (PLACEHOLDERS).
 * -------------------------------------------------------------------------
 * Servem para (1) popular o Supabase na primeira carga e (2) manter o site
 * navegável enquanto o backend ainda não está conectado.
 *
 * Todo o conteúdo abaixo é fictício e serve apenas como modelo editorial.
 * Nenhum número, política ou informação institucional real da Ecoville foi
 * usado aqui. O editor pode apagar ou reescrever tudo pelo painel /admin.
 */
export const NEWSLETTERS_EXEMPLO: Newsletter[] = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    slug: "exemplo-ficha-tecnica-no-balcao",
    titulo: "Exemplo: como usar a ficha técnica de um desengordurante no balcão",
    categoria: "produtos",
    status: "publicado",
    data_publicacao: "2026-08-18",
    autor: "Matriz Ecoville",
    resumo:
      "Edição-modelo mostrando como transformar dado técnico de rótulo em argumento de venda durante o atendimento presencial.",
    tempo_leitura_min: 4,
    capa_url: null,
    tags: ["exemplo", "ficha técnica", "argumento de venda", "treinamento"],
    corpo: `
<p><strong>Conteúdo de exemplo.</strong> Esta edição existe para demonstrar o formato. Substitua pelo material real da rede.</p>
<h2>Por que a ficha técnica vende</h2>
<p>Diluição, pH e rendimento não são detalhe de rótulo: são o argumento que separa uma venda por preço de uma venda por <mark>custo por litro pronto</mark>. Quem domina o número conduz a conversa.</p>
<h3>Os três números que o balconista precisa saber de cor</h3>
<ul>
  <li><strong>Diluição recomendada</strong> — quantos litros de produto pronto saem de uma embalagem.</li>
  <li><strong>Custo por litro pronto</strong> — preço de venda dividido pelo rendimento real.</li>
  <li><strong>Tempo de ação</strong> — quanto o cliente espera antes de enxaguar.</li>
</ul>
<h2>Roteiro de 30 segundos no balcão</h2>
<ol>
  <li>Pergunte qual a superfície e a frequência de limpeza.</li>
  <li>Traduza a diluição em <strong>número de baldes</strong>, não em proporção.</li>
  <li>Compare o custo por litro pronto com a alternativa que o cliente já usa.</li>
  <li>Feche indicando a embalagem de giro mais rápido para o perfil dele.</li>
</ol>
<blockquote><p>Regra prática: se o cliente perguntou por que esse produto é mais caro, ele já está comprando. Responda com rendimento, não com desconto.</p></blockquote>
<h2>Cuidados de estoque</h2>
<table>
  <thead><tr><th>Item</th><th>Ponto de atenção</th></tr></thead>
  <tbody>
    <tr><td>Empilhamento</td><td>Respeitar a altura máxima indicada na caixa.</td></tr>
    <tr><td>Exposição ao sol</td><td>Evitar área próxima à vitrine sem película.</td></tr>
    <tr><td>Giro</td><td>PEPS: primeiro que entra, primeiro que sai.</td></tr>
  </tbody>
</table>
<p><em>Placeholder editorial — dados técnicos reais devem vir da área de produtos da matriz.</em></p>
`.trim(),
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    slug: "exemplo-vitrine-que-converte-em-7-dias",
    titulo: "Exemplo: reorganizando a vitrine para aumentar conversão em 7 dias",
    categoria: "impulsionar-a-loja",
    status: "publicado",
    data_publicacao: "2026-08-11",
    autor: "Matriz Ecoville",
    resumo:
      "Edição-modelo com um plano semanal de vitrine, ponto extra e script de abordagem para elevar a taxa de conversão da unidade.",
    tempo_leitura_min: 5,
    capa_url: null,
    tags: ["exemplo", "vitrine", "conversão", "marketing local"],
    corpo: `
<p><strong>Conteúdo de exemplo.</strong> Use como esqueleto de uma edição real da trilha Impulsionar a Loja.</p>
<h2>O problema não é fluxo, é conversão</h2>
<p>Antes de investir em mídia local, olhe para quem já entra na loja. Aumentar a <mark>taxa de conversão</mark> costuma sair mais barato do que comprar mais visitantes.</p>
<h3>Plano de 7 dias</h3>
<ol>
  <li><strong>Dias 1 e 2</strong> — medir: contagem de entrada contra cupons emitidos.</li>
  <li><strong>Dia 3</strong> — limpar a vitrine: no máximo três famílias de produto em destaque.</li>
  <li><strong>Dia 4</strong> — montar ponto extra perto do caixa com item de recompra.</li>
  <li><strong>Dia 5</strong> — treinar o script de abordagem com a equipe.</li>
  <li><strong>Dias 6 e 7</strong> — medir de novo e comparar.</li>
</ol>
<h2>Script de abordagem</h2>
<blockquote><p>Perguntar o que o cliente vai limpar hoje funciona melhor do que perguntar se pode ajudar. A primeira pergunta abre diagnóstico; a segunda abre um não, obrigado.</p></blockquote>
<h2>Erros comuns de vitrine</h2>
<ul>
  <li>Empilhar muitas famílias de produto e diluir a mensagem.</li>
  <li>Preços sem destaque legível a três metros de distância.</li>
  <li>Ponto extra fora do fluxo natural até o caixa.</li>
</ul>
<p><em>Placeholder editorial — metas e números reais devem ser definidos pela matriz.</em></p>
`.trim(),
  },
  {
    id: "00000000-0000-4000-8000-000000000003",
    slug: "exemplo-precificacao-sem-perder-margem",
    titulo: "Exemplo: revisando a precificação sem perder margem no atacado",
    categoria: "dicas-economicas",
    status: "publicado",
    data_publicacao: "2026-08-04",
    autor: "Matriz Ecoville",
    resumo:
      "Edição-modelo sobre markup, política de desconto e checklist de negociação para pedidos de maior volume.",
    tempo_leitura_min: 6,
    capa_url: null,
    tags: ["exemplo", "precificação", "margem", "negociação"],
    corpo: `
<p><strong>Conteúdo de exemplo.</strong> Serve de modelo para a trilha Dicas Econômicas.</p>
<h2>Markup não é margem</h2>
<p>Confundir os dois é a causa mais comum de desconto que destrói resultado. O <mark>markup</mark> parte do custo; a <mark>margem</mark> parte do preço de venda.</p>
<table>
  <thead><tr><th>Markup sobre o custo</th><th>Margem sobre a venda</th></tr></thead>
  <tbody>
    <tr><td>+50%</td><td>33,3%</td></tr>
    <tr><td>+100%</td><td>50,0%</td></tr>
    <tr><td>+150%</td><td>60,0%</td></tr>
  </tbody>
</table>
<h2>Política de desconto por faixa</h2>
<ol>
  <li>Defina o <strong>piso de margem</strong> por família de produto antes de negociar.</li>
  <li>Amarre desconto a <strong>volume</strong> ou a <strong>prazo</strong>, nunca à insistência.</li>
  <li>Registre a exceção: desconto sem registro vira regra em 30 dias.</li>
</ol>
<h3>Checklist antes de fechar um atacado</h3>
<ul>
  <li>O pedido cobre o custo de entrega?</li>
  <li>O prazo de pagamento cabe no capital de giro da unidade?</li>
  <li>O item tem giro suficiente para repor sem furo de estoque?</li>
</ul>
<blockquote><p>Um pedido grande com margem negativa não é faturamento: é financiamento do cliente com o dinheiro da sua unidade.</p></blockquote>
<p><em>Placeholder editorial — pisos de margem reais devem ser definidos pela matriz.</em></p>
`.trim(),
  },
];
