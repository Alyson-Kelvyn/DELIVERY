-- Script para corrigir a estrutura da tabela products
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar campo category se não existir
ALTER TABLE products ADD COLUMN IF NOT EXISTS category text DEFAULT 'marmitas' CHECK (category IN ('marmitas', 'bebidas', 'sobremesas', 'acompanhamentos'));

-- 2. Adicionar campo stock se não existir
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock integer;

-- 3. Atualizar produtos existentes para terem categoria
UPDATE products SET category = 'marmitas' WHERE category IS NULL;

-- 4. Corrigir políticas de segurança
DROP POLICY IF EXISTS "Admins podem gerenciar produtos" ON products;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar produtos" ON products;
DROP POLICY IF EXISTS "Permitir inserção de produtos para teste" ON products;
DROP POLICY IF EXISTS "Permitir atualização de produtos para teste" ON products;

-- 5. Criar novas políticas mais permissivas
CREATE POLICY "Permitir inserção de produtos"
  ON products
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de produtos"
  ON products
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir seleção de produtos"
  ON products
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Permitir exclusão de produtos"
  ON products
  FOR DELETE
  TO public
  USING (true);

-- 6. Verificar se as alterações foram aplicadas
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 7. Inserir produto de teste para verificar se tudo funciona
INSERT INTO products (id, name, description, price, image_url, available, category, stock, created_at) 
VALUES (
  gen_random_uuid(),
  'Produto Teste',
  'Produto para verificar se a estrutura está correta',
  10.00,
  'https://via.placeholder.com/300x200',
  true,
  'marmitas',
  null,
  now()
);

-- 8. Verificar se o produto foi inserido
SELECT * FROM products WHERE name = 'Produto Teste';

-- 9. Limpar produto de teste
DELETE FROM products WHERE name = 'Produto Teste';