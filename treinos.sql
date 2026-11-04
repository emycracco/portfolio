-- ============================================================
--  ROTINA DE TREINO
--
--  O que este arquivo faz: cria a tabela onde ficam guardados
--  os treinos que voce anota no painel, na aba Rotina de treino.
--
--  Nada e apagado. Pode rodar mais de uma vez sem medo.
--
--  ONDE COLAR:
--  Supabase, menu da esquerda, SQL Editor, New query, Run.
-- ============================================================


-- ------------------------------------------------------------
--  1. A TABELA
--
--  modalidade = calistenia, flexibilidade, pole, danca ou outro
--  o_que      = o que voce fez naquele dia, com as suas palavras
--  duracao    = quanto tempo, se voce quiser anotar (ex: 40 min)
--  nota       = como foi, como voce se sentiu
-- ------------------------------------------------------------
create table if not exists public.treinos (
  id          uuid primary key default gen_random_uuid(),
  data        date not null,
  modalidade  text not null default 'calistenia'
              check (modalidade in ('calistenia', 'flexibilidade', 'pole', 'danca', 'outro')),
  o_que       text not null,
  duracao     text,
  nota        text,
  criado_em   timestamptz not null default now()
);

create index if not exists treinos_data_idx on public.treinos (data);


-- ------------------------------------------------------------
--  2. A TRANCA (RLS)
--  So voce, logada, le e escreve nesta tabela.
-- ------------------------------------------------------------
alter table public.treinos enable row level security;

-- Apaga regras antigas, para este arquivo poder rodar de novo
-- sem dar erro de "ja existe".
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public' and tablename = 'treinos'
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;

create policy "dona le treinos"    on public.treinos for select to authenticated using (public.sou_a_dona());
create policy "dona cria treinos"  on public.treinos for insert to authenticated with check (public.sou_a_dona());
create policy "dona edita treinos" on public.treinos for update to authenticated using (public.sou_a_dona()) with check (public.sou_a_dona());
create policy "dona apaga treinos" on public.treinos for delete to authenticated using (public.sou_a_dona());
