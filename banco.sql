-- ============================================================
--  BANCO DO ADMIN DE EMELLYN CRACCO
--  Cole este arquivo inteiro no Supabase, em SQL Editor,
--  e clique em Run. Pode rodar mais de uma vez sem medo:
--  tudo aqui foi escrito para nao duplicar nada.
-- ============================================================

-- ------------------------------------------------------------
--  QUEM E A DONA DOS DADOS
--  Troque o e-mail abaixo se um dia voce mudar de login.
--  Ele e usado por todas as regras de seguranca mais adiante.
-- ------------------------------------------------------------
create or replace function public.sou_a_dona()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'emellynsigno@gmail.com';
$$;


-- ============================================================
--  1. TABELAS
-- ============================================================

-- Os videos que aparecem no portfolio.
-- "ordem" decide a posicao na pagina e "visivel" e o olhinho do admin.
create table if not exists public.videos (
  id          uuid primary key default gen_random_uuid(),
  titulo      text not null,
  link        text,
  nicho       text,
  formato     text,
  marca       text,
  destaque    text,               -- exemplo: 2,4M views
  descricao   text,               -- a frase curta embaixo do titulo
  secao       text not null default 'destaque',   -- destaque (os 3 cards grandes) ou trabalho (galeria por nicho)
  ordem       integer not null default 0,
  visivel     boolean not null default true,
  criado_em   timestamptz not null default now()
);

-- Para quem ja tinha a tabela criada antes destas duas colunas existirem:
alter table public.videos add column if not exists descricao text;
alter table public.videos add column if not exists secao text not null default 'destaque';
alter table public.videos drop constraint if exists videos_secao_check;
alter table public.videos add constraint videos_secao_check check (secao in ('destaque', 'trabalho'));

-- A sua base de contatos de empresa.
-- "situacao" so aceita os quatro estagios combinados.
create table if not exists public.marcas (
  id             uuid primary key default gen_random_uuid(),
  nome           text not null,
  instagram      text,
  email          text,
  telefone       text,
  situacao       text not null default 'Lead'
                 check (situacao in ('Lead', 'Conversando', 'Cliente', 'Parada')),
  obs            text,
  ultimo_contato date,
  criado_em      timestamptz not null default now()
);

-- O calendario de gravar, editar e postar.
create table if not exists public.calendario (
  id         uuid primary key default gen_random_uuid(),
  titulo     text not null,
  marca      text,
  tipo       text not null default 'gravar'
             check (tipo in ('gravar', 'editar', 'postar')),
  data       date not null,
  status     text not null default 'a fazer'
             check (status in ('a fazer', 'feito')),
  criado_em  timestamptz not null default now()
);

-- As campanhas, com valores e prazos.
-- O prazo daqui aparece sozinho no calendario, sem voce digitar duas vezes.
create table if not exists public.campanhas (
  id         uuid primary key default gen_random_uuid(),
  campanha   text not null,
  cliente    text,
  tipo       text not null default 'Conteúdo'
             check (tipo in ('Conteúdo', 'Publicidade')),
  status     text not null default 'Briefing'
             check (status in ('Briefing', 'Roteiro', 'Aprovação Roteiro',
                               'Gravação', 'Edição', 'Aprovado', 'Entregue')),
  qtd        integer not null default 1,
  valor      numeric(12,2) not null default 0,
  prazo      date,
  pagamento  text not null default 'pendente'
             check (pagamento in ('pendente', 'pago')),
  ativa      boolean not null default true,
  favorita   boolean not null default false,
  criado_em  timestamptz not null default now()
);

-- Os cupons de afiliada e os links das marcas parceiras.
-- "copias" conta quantas vezes voce ja copiou aquele cupom,
-- para saber qual e o que voce mais divulga.
create table if not exists public.cupons (
  id         uuid primary key default gen_random_uuid(),
  marca      text not null,
  cupom      text,
  desconto   text,               -- exemplo: 10% de desconto
  link       text,
  mensagem   text,               -- a mensagem pronta para enviar, opcional
  obs        text,
  validade   date,
  ativo      boolean not null default true,
  favorito   boolean not null default false,
  copias     integer not null default 0,
  criado_em  timestamptz not null default now()
);

-- O planejamento de conteudo da semana, canal por canal.
-- "origem_id" aponta para o video que deu origem, quando e um
-- conteudo reciclado do TikTok Shop para o Insta shop ou para o Shopee.
create table if not exists public.conteudos (
  id         uuid primary key default gen_random_uuid(),
  canal      text not null default 'tiktok'
             check (canal in ('tiktok', 'instagram_shop', 'shopee', 'instagram')),
  data       date not null,
  hora       text,
  tipo       text,               -- review, unboxing, rotina, oferta...
  assunto    text not null,
  descricao  text,
  marca      text,
  status     text not null default 'ideia'
             check (status in ('ideia', 'gravado', 'editado', 'postado')),
  link       text,
  origem_id  uuid references public.conteudos(id) on delete set null,
  criado_em  timestamptz not null default now()
);
create index if not exists conteudos_data_idx on public.conteudos (data);

-- O que voce ja marcou no checklist do portfolio.
-- Cada item tem uma chave de texto propria, por isso ela e a chave da tabela.
create table if not exists public.marcados (
  chave      text primary key,
  marcado    boolean not null default true,
  criado_em  timestamptz not null default now()
);

-- As visitas do portfolio, para as metricas.
-- Nao guarda nada que identifique a pessoa: so data, pagina e de onde veio.
create table if not exists public.visitas (
  id         bigserial primary key,
  data       date not null default current_date,
  pagina     text,
  origem     text,
  criado_em  timestamptz not null default now()
);

-- Indices para as listas abrirem rapido mesmo com muita linha.
create index if not exists videos_ordem_idx     on public.videos (ordem);
create index if not exists calendario_data_idx  on public.calendario (data);
create index if not exists campanhas_prazo_idx  on public.campanhas (prazo);
create index if not exists visitas_data_idx     on public.visitas (data);


-- ============================================================
--  2. A TRANCA (RLS)
--  Ligar o RLS e como trancar a porta. Sem nenhuma regra escrita,
--  a tabela fica fechada para todo mundo, inclusive para voce.
--  Por isso, logo abaixo, escrevemos as regras uma a uma.
-- ============================================================

alter table public.videos     enable row level security;
alter table public.marcas     enable row level security;
alter table public.calendario enable row level security;
alter table public.campanhas  enable row level security;
alter table public.marcados   enable row level security;
alter table public.visitas    enable row level security;
alter table public.cupons     enable row level security;
alter table public.conteudos  enable row level security;

-- Apaga regras antigas, para voce poder rodar este arquivo de novo
-- sem receber erro de "ja existe".
do $$
declare r record;
begin
  for r in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename in ('videos','marcas','calendario','campanhas','marcados','visitas','cupons','conteudos')
  loop
    execute format('drop policy if exists %I on %I.%I', r.policyname, r.schemaname, r.tablename);
  end loop;
end $$;


-- ------------------------------------------------------------
--  REGRA GERAL: so a dona logada le e escreve.
--  Quem nao esta logado nao le absolutamente nada.
-- ------------------------------------------------------------

-- VIDEOS
create policy "dona le videos"      on public.videos for select to authenticated using (public.sou_a_dona());
create policy "dona cria videos"    on public.videos for insert to authenticated with check (public.sou_a_dona());
create policy "dona edita videos"   on public.videos for update to authenticated using (public.sou_a_dona()) with check (public.sou_a_dona());
create policy "dona apaga videos"   on public.videos for delete to authenticated using (public.sou_a_dona());

-- MARCAS
create policy "dona le marcas"      on public.marcas for select to authenticated using (public.sou_a_dona());
create policy "dona cria marcas"    on public.marcas for insert to authenticated with check (public.sou_a_dona());
create policy "dona edita marcas"   on public.marcas for update to authenticated using (public.sou_a_dona()) with check (public.sou_a_dona());
create policy "dona apaga marcas"   on public.marcas for delete to authenticated using (public.sou_a_dona());

-- CALENDARIO
create policy "dona le agenda"      on public.calendario for select to authenticated using (public.sou_a_dona());
create policy "dona cria agenda"    on public.calendario for insert to authenticated with check (public.sou_a_dona());
create policy "dona edita agenda"   on public.calendario for update to authenticated using (public.sou_a_dona()) with check (public.sou_a_dona());
create policy "dona apaga agenda"   on public.calendario for delete to authenticated using (public.sou_a_dona());

-- CAMPANHAS
create policy "dona le campanhas"    on public.campanhas for select to authenticated using (public.sou_a_dona());
create policy "dona cria campanhas"  on public.campanhas for insert to authenticated with check (public.sou_a_dona());
create policy "dona edita campanhas" on public.campanhas for update to authenticated using (public.sou_a_dona()) with check (public.sou_a_dona());
create policy "dona apaga campanhas" on public.campanhas for delete to authenticated using (public.sou_a_dona());

-- MARCADOS (o checklist)
create policy "dona le marcados"    on public.marcados for select to authenticated using (public.sou_a_dona());
create policy "dona cria marcados"  on public.marcados for insert to authenticated with check (public.sou_a_dona());
create policy "dona edita marcados" on public.marcados for update to authenticated using (public.sou_a_dona()) with check (public.sou_a_dona());
create policy "dona apaga marcados" on public.marcados for delete to authenticated using (public.sou_a_dona());

-- CUPONS (só a dona, nem leitura nem escrita para quem não está logado)
create policy "dona le cupons"      on public.cupons for select to authenticated using (public.sou_a_dona());
create policy "dona cria cupons"    on public.cupons for insert to authenticated with check (public.sou_a_dona());
create policy "dona edita cupons"   on public.cupons for update to authenticated using (public.sou_a_dona()) with check (public.sou_a_dona());
create policy "dona apaga cupons"   on public.cupons for delete to authenticated using (public.sou_a_dona());

-- CONTEUDOS (o planejamento da semana, so a dona)
create policy "dona le conteudos"    on public.conteudos for select to authenticated using (public.sou_a_dona());
create policy "dona cria conteudos"  on public.conteudos for insert to authenticated with check (public.sou_a_dona());
create policy "dona edita conteudos" on public.conteudos for update to authenticated using (public.sou_a_dona()) with check (public.sou_a_dona());
create policy "dona apaga conteudos" on public.conteudos for delete to authenticated using (public.sou_a_dona());

-- VISITAS
create policy "dona le visitas"     on public.visitas for select to authenticated using (public.sou_a_dona());
create policy "dona apaga visitas"  on public.visitas for delete to authenticated using (public.sou_a_dona());


-- ------------------------------------------------------------
--  EXCECAO 1: qualquer pessoa pode INSERIR em marcas.
--  E o formulario de contato do portfolio. So entra como Lead,
--  e ninguem deslogado consegue ler, editar nem apagar a base.
-- ------------------------------------------------------------
create policy "site manda lead"
  on public.marcas for insert to anon
  with check (situacao = 'Lead');

-- ------------------------------------------------------------
--  EXCECAO 2: qualquer pessoa pode INSERIR em visitas.
--  E o contador de visitas do portfolio. Ler, so voce.
-- ------------------------------------------------------------
create policy "site registra visita"
  on public.visitas for insert to anon
  with check (true);

-- ------------------------------------------------------------
--  EXCECAO 3, QUE VOCE PRECISA DECIDIR:
--  o portfolio e uma pagina publica, sem login. Para os videos
--  que voce cadastra no admin aparecerem no site sozinhos,
--  o visitante precisa poder LER a tabela videos.
--  A regra abaixo libera a leitura apenas dos videos marcados
--  como visiveis, que sao justamente os que voce ja escolheu
--  mostrar para o mundo. Nada mais da tabela fica exposto.
--  Se voce preferir seguir a regra de "ninguem deslogado le nada",
--  apague este bloco. O site continua funcionando, mas passa a
--  mostrar sempre os tres videos fixos que ja estao no codigo.
-- ------------------------------------------------------------
create policy "site mostra videos visiveis"
  on public.videos for select to anon
  using (visivel = true);


-- ============================================================
--  3. UMA LINHA DE EXEMPLO EM CADA LISTA
--  Servem so para voce ver o formato. Todas estao escritas
--  com a palavra EXEMPLO, e voce apaga quando quiser.
--  O video de exemplo entra escondido, para nao aparecer no site.
-- ============================================================

insert into public.videos (titulo, link, nicho, formato, marca, destaque, ordem, visivel)
select 'EXEMPLO, pode apagar', 'https://youtube.com/shorts/ZvDNc4IgmOE', 'beleza', 'vídeo 9:16', 'Marca de exemplo', '0 views', 99, false
where not exists (select 1 from public.videos);

insert into public.marcas (nome, instagram, email, telefone, situacao, obs)
select 'EXEMPLO, pode apagar', '@exemplo', 'exemplo@email.com', '41900000000', 'Lead', 'Linha de exemplo so para ver o formato'
where not exists (select 1 from public.marcas);

insert into public.calendario (titulo, marca, tipo, data, status)
select 'EXEMPLO, pode apagar', 'Marca de exemplo', 'gravar', current_date, 'a fazer'
where not exists (select 1 from public.calendario);

insert into public.campanhas (campanha, cliente, tipo, status, qtd, valor, prazo, pagamento, ativa, favorita)
select 'EXEMPLO, pode apagar', 'Cliente de exemplo', 'Conteúdo', 'Briefing', 1, 0, current_date + 7, 'pendente', true, false
where not exists (select 1 from public.campanhas);

insert into public.cupons (marca, cupom, desconto, link, obs, validade, ativo, favorito)
select 'EXEMPLO, pode apagar', 'EMY10', '10% de desconto', 'https://marcadeexemplo.com.br', 'Linha de exemplo so para ver o formato', current_date + 30, true, false
where not exists (select 1 from public.cupons);

-- As tabelas marcados e visitas comecam vazias de proposito:
-- marcados enche conforme voce marca o checklist, e visitas
-- enche sozinha conforme as pessoas entram no seu portfolio.
