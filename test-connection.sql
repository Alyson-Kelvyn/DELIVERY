-- Script para testar conexão e verificar estado da tabela
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se a tabela existe
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'products'
) as table_exists;

-- 2. Verificar estrutura atual da tabela
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 3. Verificar políticas atuais
SELECT 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'products';

-- 4. Tentar inserir um produto simples
INSERT INTO products (id, name, description, price, image_url, available, created_at) 
VALUES (
  gen_random_uuid(),
  'Teste Simples',
  'Produto de teste',
  10.00,
  'https://via.placeholder.com/300x200',
  true,
  now()
);

-- 5. Verificar se foi inserido
SELECT * FROM products WHERE name = 'Teste Simples';

-- 6. Limpar teste
DELETE FROM products WHERE name = 'Teste Simples';