-- Script final para corrigir a tabela products
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar estrutura atual
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 2. Adicionar campos se não existirem
ALTER TABLE products ADD COLUMN IF NOT EXISTS category text DEFAULT 'marmitas';
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock integer;

-- 3. Atualizar produtos existentes
UPDATE products SET category = 'marmitas' WHERE category IS NULL;

-- 4. Remover todas as políticas antigas
DROP POLICY IF EXISTS "Admins podem gerenciar produtos" ON products;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar produtos" ON products;
DROP POLICY IF EXISTS "Permitir inserção de produtos para teste" ON products;
DROP POLICY IF EXISTS "Permitir atualização de produtos para teste" ON products;
DROP POLICY IF EXISTS "Produtos disponíveis são visíveis para todos" ON products;
DROP POLICY IF EXISTS "Permitir inserção de produtos" ON products;
DROP POLICY IF EXISTS "Permitir atualização de produtos" ON products;
DROP POLICY IF EXISTS "Permitir seleção de produtos" ON products;
DROP POLICY IF EXISTS "Permitir exclusão de produtos" ON products;
DROP POLICY IF EXISTS "Permitir tudo para produtos" ON products;

-- 5. Criar política única permissiva
CREATE POLICY "Permitir tudo para produtos"
  ON products
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- 6. Verificar estrutura final
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 7. Testar inserção
INSERT INTO products (name, description, price, image_url, available, category, stock) 
VALUES (
  'Produto Teste Final',
  'Produto para testar a estrutura corrigida',
  15.00,
  'https://via.placeholder.com/300x200',
  true,
  'marmitas',
  null
);

-- 8. Verificar se foi inserido
SELECT id, name, category, stock FROM products WHERE name = 'Produto Teste Final';

-- 9. Limpar teste
DELETE FROM products WHERE name = 'Produto Teste Final';

-- 10. Mostrar produtos existentes
SELECT id, name, category, available FROM products ORDER BY name;