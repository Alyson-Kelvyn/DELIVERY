-- Cria tabela de vínculo produto-complemento (ambos em products)
create table if not exists public.product_complements (
  product_id uuid not null references public.products(id) on delete cascade,
  complement_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (product_id, complement_id)
);

-- Habilita RLS
alter table public.product_complements enable row level security;

-- Políticas: leitura pública (cliente precisa saber complementos de um produto)
drop policy if exists "Leitura pública de vínculos" on public.product_complements;
create policy "Leitura pública de vínculos"
  on public.product_complements
  for select
  to public
  using (true);

-- Políticas de escrita apenas para admins autenticados
drop policy if exists "Auth podem inserir vínculos" on public.product_complements;
drop policy if exists "Auth podem deletar vínculos" on public.product_complements;

-- Políticas simplificadas: apenas usuários autenticados podem inserir/deletar vínculos
create policy "Auth podem inserir vínculos"
  on public.product_complements
  for insert
  to authenticated
  with check (auth.uid() is not null);

create policy "Auth podem deletar vínculos"
  on public.product_complements
  for delete
  to authenticated
  using (auth.uid() is not null);

comment on table public.product_complements is 'Vínculo entre um produto principal e seus complementos (ambos registros em products)';