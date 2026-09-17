-- =====================================================================
-- 0003 — Categorias gerenciáveis pelo painel
-- ---------------------------------------------------------------------
-- Duas mudanças:
--
--   1. a coluna `cor` passa a valer alguma coisa. Ela existia desde o
--      0001 guardando o nome da trilha ('produtos', 'impulsionar'...) e
--      nada no código a lia — a aparência era um mapa fixo por slug, o
--      que fazia toda categoria nova nascer cinza. Agora ela guarda um
--      token de paleta e ganha uma coluna `icone` ao lado;
--
--   2. entram as trilhas pedidas pelo cliente, sem mexer nas antigas —
--      "Impulsionar a Loja" e "Dicas Econômicas" têm edições publicadas
--      e continuam no ar.
--
-- A RLS não muda: `categorias_gestao_editor` (0001) já dá insert/update/
-- delete a quem está em `public.editores`.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Ícone
-- ---------------------------------------------------------------------
alter table public.categorias
  add column if not exists icone text not null default 'estrela';

comment on column public.categorias.cor is
  'Token de paleta lido por aparenciaCategoria() em src/lib/categorias.ts.';
comment on column public.categorias.icone is
  'Nome do ícone SVG desenhado em src/components/ui/Icones.tsx.';

-- ---------------------------------------------------------------------
-- 2. Converte os valores antigos de `cor` para tokens de paleta
-- ---------------------------------------------------------------------
update public.categorias set cor = 'azul',   icone = 'frasco'   where slug = 'produtos';
update public.categorias set cor = 'tinta',  icone = 'moeda'    where slug = 'dicas-economicas';

-- "Impulsionar a Loja" era a trilha amarela. O amarelo agora é de
-- "Vendas e Lojas", que ocupa o mesmo espaço editorial — deixar as duas
-- amarelas confundiria. A trilha antiga fica no neutro.
update public.categorias set cor = 'neutra', icone = 'megafone' where slug = 'impulsionar-a-loja';

-- Rede de segurança para qualquer linha criada fora destas três.
update public.categorias
   set cor = 'neutra'
 where cor not in ('azul', 'amarelo', 'tinta', 'azul-profundo', 'azul-claro', 'neutra');

-- ---------------------------------------------------------------------
-- 3. Restringe aos valores que o código sabe desenhar
--
-- O Tailwind precisa enxergar a classe inteira no código-fonte, então a
-- paleta é finita por natureza. O CHECK não tira o "criar sem deploy":
-- cor e ícone novos exigiriam mudança de código de qualquer forma.
-- ---------------------------------------------------------------------
alter table public.categorias drop constraint if exists categorias_cor_valida;
alter table public.categorias add constraint categorias_cor_valida
  check (cor in ('azul', 'amarelo', 'tinta', 'azul-profundo', 'azul-claro', 'neutra'));

alter table public.categorias drop constraint if exists categorias_icone_valido;
alter table public.categorias add constraint categorias_icone_valido
  check (icone in ('frasco', 'megafone', 'moeda', 'loja', 'radar', 'pessoas', 'estrela'));

-- ---------------------------------------------------------------------
-- 4. As trilhas pedidas pelo cliente
-- ---------------------------------------------------------------------
insert into public.categorias (slug, nome, descricao, cor, icone, ordem) values
  ('vendas-e-lojas', 'Vendas e Lojas',
   'Desempenho das lojas, metas, vitrine, atendimento e o que está convertendo no balcão.',
   'amarelo', 'loja', 1),
  ('radar-do-setor', 'Radar do Setor',
   'Movimentos do mercado, concorrência, tendências, regulação e o que vem pela frente.',
   'azul-profundo', 'radar', 2),
  ('rede-e-comunidade', 'Rede e Comunidade',
   'Novidades entre franqueados, conquistas, eventos, treinamentos e histórias da rede.',
   'azul-claro', 'pessoas', 3)
on conflict (slug) do update
  set nome      = excluded.nome,
      descricao = excluded.descricao,
      cor       = excluded.cor,
      icone     = excluded.icone,
      ordem     = excluded.ordem;

-- ---------------------------------------------------------------------
-- 5. Ordem de exibição: as novas primeiro, as herdadas em seguida
-- ---------------------------------------------------------------------
update public.categorias set ordem = 4 where slug = 'produtos';
update public.categorias set ordem = 5 where slug = 'impulsionar-a-loja';
update public.categorias set ordem = 6 where slug = 'dicas-economicas';
