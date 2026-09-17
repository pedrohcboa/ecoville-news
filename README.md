# Ecoville News

Portal editorial interno da rede Ecoville. A matriz publica newsletters
recorrentes para os **franqueados**; a leitura é aberta (sem login, mas sem
divulgação) e a publicação acontece num painel `/admin` desenhado para uma
pessoa não técnica.

> **Para quem vai escrever as edições:** leia o
> [**Guia do Editor**](./GUIA-DO-EDITOR.md) — passo a passo, sem termo técnico.
> Este README é a documentação de quem cuida do código.

---

## Stack

| Camada | Tecnologia |
|---|---|
| Aplicação | Next.js 16 (App Router, React 19, TypeScript) |
| Estilo | Tailwind CSS v4 com tokens da marca em `src/app/globals.css` |
| Banco / Auth / Storage | Supabase (PostgreSQL 17) |
| Editor visual | Tiptap 3 (WYSIWYG) |
| Analytics | Vercel Web Analytics + eventos próprios na tabela `events` |

Sem biblioteca de gráficos e sem biblioteca de ícones: ambos são SVG escrito à
mão, para manter o bundle enxuto.

---

## Rodando localmente

```bash
npm install
npm run dev     # http://localhost:3000
```

As credenciais do Supabase já estão em `.env.local` (arquivo não versionado).
Para outro ambiente, copie `.env.example` e preencha:

```
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_...
```

**Modo demonstração:** sem essas variáveis o site continua funcionando com as
edições de exemplo de `src/lib/seed-data.ts` e exibe uma faixa avisando disso.
O painel, nesse modo, mostra uma tela pedindo a configuração.

Variáveis opcionais:

| Variável | Para quê |
|---|---|
| `SUPABASE_SERVICE_ROLE_KEY` | Faz `/api/eventos` gravar com a chave de serviço (ignora RLS). Sem ela, a gravação usa a chave pública e a política `events_insercao_anonima`. |
| `NEXT_PUBLIC_MOSTRAR_FREQUENCIA` / `NEXT_PUBLIC_FREQUENCIA` | Liga o terceiro contador da home (ex.: `true` + `Semanal`). Desligado por padrão — não inventamos periodicidade. |

---

## Backend (Supabase)

Projeto: **ecoville-news** · região `sa-east-1` · custo **US$ 10/mês**.

O schema já está aplicado. Para recriar tudo num projeto novo, rode em ordem os
arquivos de `supabase/migrations/`:

1. `0001_schema_completo.sql` — tabelas, RLS, Storage, funções de métricas e as
   três categorias iniciais;
2. `0002_dados_de_exemplo.sql` — as três edições-modelo (opcional);
3. `0003_categorias_gerenciaveis.sql` — coluna `icone`, tokens de paleta em
   `cor` e as trilhas pedidas pelo cliente.

### Tabelas

| Tabela | Papel |
|---|---|
| `categorias` | Trilhas editoriais, gerenciadas em `/admin/categorias`. Cor e ícone saem das listas fechadas de `src/lib/categorias.ts` (CHECK no banco garante). |
| `newsletters` | As edições. `status` = `rascunho` \| `publicado`. |
| `events` | Eventos anônimos de uso (pageview, abertura, clique, busca, filtro). |
| `editores` | Allowlist de quem pode publicar. |

Bucket de Storage: `newsletter-imagens` (público para leitura, escrita só para
autenticado, 5 MB por arquivo).

### Modelo de acesso

- **Leitura pública:** o papel `anon` só enxerga `newsletters` com
  `status = 'publicado'` e a tabela `categorias`.
- **Publicação:** exige sessão **e** presença em `public.editores`. Estar
  autenticado, sozinho, não dá nenhum direito de escrita — é o que impede que
  um cadastro feito por fora vire acesso de edição.
- **Eventos:** `INSERT` liberado apenas para os cinco tipos conhecidos e com
  limites de tamanho; `SELECT` só para editor.

### Criando o primeiro login do painel

1. Supabase Studio → **Authentication → Users → Add user**;
2. informe e-mail e senha e marque *Auto Confirm User*;
3. entre em `/admin/login` com esses dados.

No primeiro acesso, se a tabela `editores` estiver vazia, o usuário logado é
promovido automaticamente a editor (função `reivindicar_primeiro_editor`). A
partir daí, novos editores entram por:

```sql
insert into public.editores (user_id, email, nome)
select id, email, 'Nome do editor' from auth.users where email = 'novo@ecoville.com.br';
```

> **Recomendado:** em *Authentication → Sign In / Providers*, desligue
> **Allow new users to sign up**. Sem isso, qualquer pessoa com a chave pública
> consegue criar uma conta — ela não conseguiria publicar (a allowlist barra),
> mas é ruído desnecessário.

---

## Não divulgação

O portal é material interno e **não deve ser indexado**:

- `robots` global `noindex, nofollow` em `src/app/layout.tsx`;
- `src/app/robots.ts` bloqueia todos os agentes;
- cabeçalho `X-Robots-Tag: noindex, nofollow, noarchive` em `next.config.ts`;
- **não existe** sitemap público.

---

## Métricas

Duas camadas, complementares:

1. **Vercel Web Analytics** (`<Analytics />` no layout raiz) — visitantes,
   páginas vistas e origens, no painel da Vercel.
2. **Eventos próprios** — o que a Vercel não dá: *qual botão* foi clicado e *em
   qual edição*. Fluxo:
   `src/lib/analytics.ts` (cliente, `sendBeacon`) → `POST /api/eventos`
   (valida e enriquece com referrer/user-agent) → tabela `events` →
   funções `metricas_*` → `/admin/metricas`.

Botões rastreados incluem `hero_cta_primary`, `hero_cta_secondary`,
`categoria_card`, `card_ler`, `destaque_ler`, `artigo_proxima`,
`artigo_anterior`, os itens do menu e `catalogo_carregar_mais`. Para rastrear
um botão novo, use `<LinkRastreado alvo="nome_do_botao">` e adicione o rótulo
legível no mapa `NOMES_DE_BOTAO` de `src/app/admin/(painel)/metricas/page.tsx`.

**Privacidade:** nenhum dado pessoal é coletado. O `session_id` é um UUID
aleatório guardado em `sessionStorage`, que morre quando a aba fecha. Não
gravamos IP, nome nem e-mail de leitor.

---

## Estrutura

```
src/
  app/
    (publico)/            área de leitura — home, arquivo, edição, trilha, sobre
    admin/
      login|recuperar|nova-senha/   fora da área protegida
      (painel)/           lista, nova, editar/[id], categorias, métricas — exige editor
    api/eventos/          coleta de eventos
    robots.ts             noindex global
  components/
    brand/Wordmark.tsx    ← ÚNICO lugar a trocar quando a logo chegar
    site/                 header, footer, hero, cards, catálogo, rastreadores
    admin/                formulários, editor Tiptap, gráficos, gestão de trilhas
    ui/Icones.tsx         ícones SVG
  lib/
    data.ts               leitura pública (com fallback para os exemplos)
    analytics.ts          disparo de eventos
    sanitize.ts           allowlist de HTML do editor
    upload.ts             otimização + envio de imagens
    categorias.ts         paleta e ícones + fallback de demonstração
    supabase/             clientes navegador / servidor / serviço
  proxy.ts                sessão e proteção do /admin
supabase/migrations/      schema versionado
```

---

## Identidade visual

Tokens em `src/app/globals.css` (`@theme`):

| Token | Hex | Papel |
|---|---|---|
| `brand-blue` | `#0213C1` | Cor dominante: header, footer, hero, botões primários |
| `brand-yellow` | `#FFF301` | Acento de alta energia — CTAs, marca-texto, sublinhados |
| `surface` / `canvas` | `#FFFFFF` / `#F7F8FC` | Superfícies de conteúdo e fundo |
| `ink` / `ink-muted` | `#111318` / `#4A5060` | Texto |

Regras aplicadas em todo o projeto: texto de leitura **nunca** em amarelo;
nunca amarelo sobre branco; combinações seguras são branco sobre azul, azul
sobre branco e azul sobre amarelo. Nos gráficos, o amarelo puro é ilegível como
traço — lá usamos as cores validadas documentadas em
`src/components/admin/Graficos.tsx`.

Tipografia: **Archivo** (títulos e wordmark) e **Inter** (corpo), via
`next/font`.

### Aparência das categorias

Cada categoria guarda um token de paleta em `categorias.cor` e um nome de
ícone em `categorias.icone`. Ambos são listas fechadas — `PALETA` e `ICONES`
em `src/lib/categorias.ts`, espelhadas por CHECK no banco — porque o Tailwind
só gera o CSS das classes que enxerga escritas no código-fonte. A lista fechada
também garante que nenhuma escolha do editor produza amarelo sobre branco ou
texto de leitura em amarelo.

Toda entrada da paleta define `chip`, `capa`, `barra`, `sobreCapa` (ícone
sólido sobre a capa) e `marcaDagua` (o mesmo ícone atenuado). Esses dois
últimos existem para substituir o `categoria === "impulsionar-a-loja"` que
antes estava espalhado por cinco componentes decidindo se o ícone era branco ou
azul.

**Para acrescentar uma cor ou um ícone:** adicione a entrada em
`src/lib/categorias.ts`, desenhe o SVG em `src/components/ui/Icones.tsx` (se
for ícone) e estenda o CHECK correspondente no banco. Só isso exige deploy —
criar, renomear, recolorir e reordenar categorias, não.

### Trocar o wordmark pela logo real

A logo oficial ainda não chegou; hoje usamos um wordmark tipográfico. Quando o
arquivo em alta resolução existir, mexa **só** em
`src/components/brand/Wordmark.tsx` — header, footer, login e 404 consomem esse
mesmo componente. As instruções estão no comentário do topo do arquivo.

---

## Deploy

1. Suba o repositório e importe na Vercel;
2. configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (e `SUPABASE_SERVICE_ROLE_KEY`, se quiser) nas variáveis do projeto;
3. ative **Web Analytics** no projeto da Vercel;
4. em Supabase → *Authentication → URL Configuration*, adicione o domínio final
   em **Redirect URLs** para que o link de recuperação de senha funcione.

## Comandos

```bash
npm run dev      # desenvolvimento
npm run build    # build de produção (roda o TypeScript)
npm run lint     # ESLint
```
