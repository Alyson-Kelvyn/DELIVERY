-- Cria tabela de vínculo categoria-complemento
create table if not exists public.category_complements (
  category text not null check (category in ('marmitas', 'bebidas', 'sobremesas')),
  complement_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (category, complement_id)
);

-- Habilita RLS
alter table public.category_complements enable row level security;

-- Políticas: leitura pública (cliente precisa saber complementos de uma categoria)
drop policy if exists "Leitura pública de vínculos de categoria" on public.category_complements;
create policy "Leitura pública de vínculos de categoria"
  on public.category_complements
  for select
  to public
  using (true);

-- Políticas de escrita apenas para admins autenticados
drop policy if exists "Auth podem inserir vínculos de categoria" on public.category_complements;
drop policy if exists "Auth podem deletar vínculos de categoria" on public.category_complements;

create policy "Auth podem inserir vínculos de categoria"
  on public.category_complements
  for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "Auth podem deletar vínculos de categoria"
  on public.category_complements
  for delete
  to authenticated
  using (auth.uid() is not null);

comment on table public.category_complements is 'Vínculo entre uma categoria de produto e seus complementos (compartilhados por todos produtos da categoria)';
