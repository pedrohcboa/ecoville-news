-- =====================================================================
-- ECOVILLE NEWS — schema completo (versão consolidada e idempotente)
-- ---------------------------------------------------------------------
-- Este arquivo recria o backend inteiro num projeto Supabase novo:
-- tabelas, RLS, Storage, funções de métricas e as categorias iniciais.
--
-- Como aplicar num projeto novo:
--   Supabase Studio > SQL Editor > cole tudo > Run
--   (ou `supabase db push` se estiver usando a CLI)
--
-- O projeto de produção já está com tudo isto aplicado; o arquivo existe
-- para versionar o schema junto do código e permitir recriar o ambiente.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Categorias (trilhas editoriais, extensíveis sem deploy)
-- ---------------------------------------------------------------------
create table if not exists public.categorias (
  slug        text primary key,
  nome        text not null,
  descricao   text not null default '',
  cor         text not null default 'neutra',
  ordem       integer not null default 100,
  created_at  timestamptz not null default now()
);

comment on table public.categorias is
  'Trilhas editoriais do Ecoville News. Novas categorias podem ser criadas aqui sem deploy.';

-- ---------------------------------------------------------------------
-- 2. Newsletters (edições)
-- ---------------------------------------------------------------------
create table if not exists public.newsletters (
  id                uuid primary key default gen_random_uuid(),
  slug              text not null unique,
  titulo            text not null,
  categoria         text not null references public.categorias(slug) on update cascade,
  status            text not null default 'rascunho'
                      check (status in ('rascunho', 'publicado')),
  data_publicacao   date not null default current_date,
  autor             text not null default 'Matriz Ecoville',
  resumo            text not null default '',
  tempo_leitura_min integer not null default 1 check (tempo_leitura_min > 0),
  capa_url          text,
  tags              text[] not null default '{}',
  corpo             text not null default '',
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on column public.newsletters.corpo is
  'HTML rico produzido pelo editor visual do painel, incluindo os acentos da marca.';

create index if not exists newsletters_status_data_idx
  on public.newsletters (status, data_publicacao desc);
create index if not exists newsletters_categoria_idx
  on public.newsletters (categoria);

create or replace function public.tocar_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists newsletters_updated_at on public.newsletters;
create trigger newsletters_updated_at
  before update on public.newsletters
  for each row execute function public.tocar_updated_at();

-- ---------------------------------------------------------------------
-- 3. Eventos de analytics (100% anônimos)
-- ---------------------------------------------------------------------
create table if not exists public.events (
  id            bigint generated always as identity primary key,
  tipo          text not null,  -- pageview | newsletter_open | click | busca | filtro_categoria
  alvo          text,           -- nome do botão/elemento ou termo buscado
  newsletter_id uuid references public.newsletters(id) on delete set null,
  categoria     text,
  path          text,
  session_id    text,           -- UUID aleatório de sessão, sem PII
  referrer      text,
  user_agent    text,
  created_at    timestamptz not null default now()
);

comment on table public.events is
  'Eventos anônimos de uso. Nenhum dado pessoal do leitor é armazenado (sem IP, sem e-mail, sem login).';

create index if not exists events_created_idx      on public.events (created_at desc);
create index if not exists events_tipo_created_idx on public.events (tipo, created_at desc);
create index if not exists events_newsletter_idx   on public.events (newsletter_id);
create index if not exists events_alvo_idx         on public.events (alvo);

-- ---------------------------------------------------------------------
-- 4. Allowlist de editores
--    Estar autenticado não basta: só quem está aqui pode publicar.
--    A coluna `papel` fica reservada para níveis de permissão futuros.
-- ---------------------------------------------------------------------
create table if not exists public.editores (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  email      text not null,
  nome       text,
  papel      text not null default 'editor',
  created_at timestamptz not null default now()
);

comment on table public.editores is
  'Allowlist de quem pode entrar no painel /admin. Adicione uma linha para liberar um novo editor.';

create or replace function public.eh_editor()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.editores e where e.user_id = auth.uid());
$$;

-- Bootstrap: o primeiro login promove o usuário a editor quando a
-- allowlist ainda está vazia. Depois disso a função não faz mais nada.
create or replace function public.reivindicar_primeiro_editor()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  ja_existe boolean;
  usuario   uuid := auth.uid();
  endereco  text;
begin
  if usuario is null then
    return false;
  end if;

  select exists (select 1 from public.editores) into ja_existe;
  if ja_existe then
    return false;
  end if;

  select u.email into endereco from auth.users u where u.id = usuario;

  insert into public.editores (user_id, email, nome, papel)
  values (usuario, coalesce(endereco, 'sem-email'), 'Primeiro editor', 'editor')
  on conflict (user_id) do nothing;

  return true;
end;
$$;

-- =====================================================================
-- 5. Row Level Security
--    Leitura pública: apenas newsletters publicadas e categorias.
--    Escrita e métricas: apenas quem está em `editores`.
--    Eventos: INSERT liberado (tipos conhecidos), SELECT só para editor.
-- =====================================================================
alter table public.categorias  enable row level security;
alter table public.newsletters enable row level security;
alter table public.events      enable row level security;
alter table public.editores    enable row level security;

drop policy if exists categorias_leitura_publica on public.categorias;
create policy categorias_leitura_publica on public.categorias
  for select to anon, authenticated using (true);

drop policy if exists categorias_gestao_editor on public.categorias;
create policy categorias_gestao_editor on public.categorias
  for all to authenticated using (public.eh_editor()) with check (public.eh_editor());

drop policy if exists newsletters_leitura_publicadas on public.newsletters;
create policy newsletters_leitura_publicadas on public.newsletters
  for select to anon using (status = 'publicado');

drop policy if exists newsletters_gestao_editor on public.newsletters;
create policy newsletters_gestao_editor on public.newsletters
  for all to authenticated using (public.eh_editor()) with check (public.eh_editor());

drop policy if exists editores_leitura on public.editores;
create policy editores_leitura on public.editores
  for select to authenticated using (public.eh_editor());

drop policy if exists events_leitura_editor on public.events;
create policy events_leitura_editor on public.events
  for select to authenticated using (public.eh_editor());

-- A rota /api/eventos grava com a chave pública quando não há service key.
-- Só INSERT, só os tipos conhecidos e com limites de tamanho.
drop policy if exists events_insercao_anonima on public.events;
create policy events_insercao_anonima on public.events
  for insert to anon, authenticated
  with check (
    tipo in ('pageview', 'newsletter_open', 'click', 'busca', 'filtro_categoria')
    and coalesce(length(alvo), 0) <= 120
    and coalesce(length(path), 0) <= 300
    and coalesce(length(session_id), 0) <= 64
  );

-- =====================================================================
-- 6. Storage: bucket público de imagens (capas e imagens do corpo)
-- =====================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'newsletter-imagens', 'newsletter-imagens', true, 5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "imagens leitura publica" on storage.objects;
create policy "imagens leitura publica" on storage.objects
  for select to anon, authenticated using (bucket_id = 'newsletter-imagens');

drop policy if exists "imagens envio editor" on storage.objects;
create policy "imagens envio editor" on storage.objects
  for insert to authenticated with check (bucket_id = 'newsletter-imagens');

drop policy if exists "imagens atualizacao editor" on storage.objects;
create policy "imagens atualizacao editor" on storage.objects
  for update to authenticated using (bucket_id = 'newsletter-imagens');

drop policy if exists "imagens remocao editor" on storage.objects;
create policy "imagens remocao editor" on storage.objects
  for delete to authenticated using (bucket_id = 'newsletter-imagens');

-- =====================================================================
-- 7. Funções de métricas (SECURITY INVOKER — passam pela RLS de `events`)
-- =====================================================================
create or replace function public.metricas_serie_diaria(dias integer default 30)
returns table (dia date, pageviews bigint, aberturas bigint, cliques bigint, visitantes bigint)
language sql stable security invoker set search_path = public
as $$
  select
    d::date                                            as dia,
    count(*) filter (where e.tipo = 'pageview')        as pageviews,
    count(*) filter (where e.tipo = 'newsletter_open') as aberturas,
    count(*) filter (where e.tipo = 'click')           as cliques,
    count(distinct e.session_id)                       as visitantes
  from generate_series(current_date - (greatest(dias, 1) - 1), current_date, interval '1 day') as d
  left join public.events e
    on e.created_at >= d and e.created_at < d + interval '1 day'
  group by d
  order by d;
$$;

-- Totais do período. Separado da série diária porque "visitantes" precisa ser
-- o número de sessões distintas no período inteiro — somar os distintos de
-- cada dia contaria duas vezes quem voltou.
create or replace function public.metricas_totais(dias integer default 30)
returns table (pageviews bigint, aberturas bigint, cliques bigint, buscas bigint, visitantes bigint)
language sql stable security invoker set search_path = public
as $$
  select
    count(*) filter (where e.tipo = 'pageview'),
    count(*) filter (where e.tipo = 'newsletter_open'),
    count(*) filter (where e.tipo = 'click'),
    count(*) filter (where e.tipo = 'busca'),
    count(distinct e.session_id)
  from public.events e
  where e.created_at >= current_date - (greatest(dias, 1) - 1);
$$;

create or replace function public.metricas_top_newsletters(dias integer default 30, limite integer default 10)
returns table (newsletter_id uuid, titulo text, categoria text, slug text, aberturas bigint, cliques bigint)
language sql stable security invoker set search_path = public
as $$
  select n.id, n.titulo, n.categoria, n.slug,
         count(*) filter (where e.tipo = 'newsletter_open') as aberturas,
         count(*) filter (where e.tipo = 'click')           as cliques
  from public.newsletters n
  join public.events e on e.newsletter_id = n.id
  where e.created_at >= current_date - (greatest(dias, 1) - 1)
  group by n.id, n.titulo, n.categoria, n.slug
  having count(*) filter (where e.tipo = 'newsletter_open') > 0
      or count(*) filter (where e.tipo = 'click') > 0
  order by aberturas desc, cliques desc
  limit greatest(limite, 1);
$$;

create or replace function public.metricas_por_botao(dias integer default 30)
returns table (alvo text, cliques bigint)
language sql stable security invoker set search_path = public
as $$
  select coalesce(e.alvo, '(sem nome)') as alvo, count(*) as cliques
  from public.events e
  where e.tipo = 'click' and e.created_at >= current_date - (greatest(dias, 1) - 1)
  group by 1
  order by cliques desc;
$$;

create or replace function public.metricas_buscas(dias integer default 30, limite integer default 15)
returns table (termo text, ocorrencias bigint)
language sql stable security invoker set search_path = public
as $$
  select e.alvo as termo, count(*) as ocorrencias
  from public.events e
  where e.tipo = 'busca'
    and e.alvo is not null
    and length(trim(e.alvo)) > 0
    and e.created_at >= current_date - (greatest(dias, 1) - 1)
  group by e.alvo
  order by ocorrencias desc
  limit greatest(limite, 1);
$$;

-- ---------------------------------------------------------------------
-- 8. Permissões de execução
--    Nada de métricas nem de funções SECURITY DEFINER para o papel anônimo.
--    `authenticated` precisa de EXECUTE em `eh_editor()` porque as políticas
--    de RLS a avaliam no contexto de quem faz a consulta.
-- ---------------------------------------------------------------------
revoke execute on function public.eh_editor()                                from public, anon;
revoke execute on function public.reivindicar_primeiro_editor()              from public, anon;
revoke execute on function public.metricas_serie_diaria(integer)             from public, anon;
revoke execute on function public.metricas_totais(integer)                   from public, anon;
revoke execute on function public.metricas_top_newsletters(integer, integer) from public, anon;
revoke execute on function public.metricas_por_botao(integer)                from public, anon;
revoke execute on function public.metricas_buscas(integer, integer)          from public, anon;

grant execute on function public.eh_editor()                                to authenticated;
grant execute on function public.reivindicar_primeiro_editor()              to authenticated;
grant execute on function public.metricas_serie_diaria(integer)             to authenticated;
grant execute on function public.metricas_totais(integer)                   to authenticated;
grant execute on function public.metricas_top_newsletters(integer, integer) to authenticated;
grant execute on function public.metricas_por_botao(integer)                to authenticated;
grant execute on function public.metricas_buscas(integer, integer)          to authenticated;

-- =====================================================================
-- 9. Categorias iniciais
--    As edições de exemplo estão em 0002_dados_de_exemplo.sql.
-- =====================================================================
insert into public.categorias (slug, nome, descricao, cor, ordem) values
  ('produtos', 'Produtos',
   'Lançamentos, fichas técnicas, diferenciais, argumentos de venda e cuidados de uso e estoque.',
   'produtos', 1),
  ('impulsionar-a-loja', 'Impulsionar a Loja',
   'Marketing local, vitrine, campanhas, atendimento, conversão e giro de estoque.',
   'impulsionar', 2),
  ('dicas-economicas', 'Dicas Econômicas',
   'Gestão de custos, precificação, margem, negociação e eficiência operacional.',
   'dicas', 3)
on conflict (slug) do update
  set nome = excluded.nome,
      descricao = excluded.descricao,
      cor = excluded.cor,
      ordem = excluded.ordem;
