-- Script simples para corrigir a estrutura da tabela products
-- Execute este script no SQL Editor do Supabase

-- 1. Adicionar campo category
ALTER TABLE products ADD COLUMN IF NOT EXISTS category text DEFAULT 'marmitas';

-- 2. Adicionar campo stock
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock integer;

-- 3. Atualizar produtos existentes
UPDATE products SET category = 'marmitas' WHERE category IS NULL;

-- 4. Remover políticas antigas
DROP POLICY IF EXISTS "Admins podem gerenciar produtos" ON products;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar produtos" ON products;
DROP POLICY IF EXISTS "Permitir inserção de produtos para teste" ON products;
DROP POLICY IF EXISTS "Permitir atualização de produtos para teste" ON products;
DROP POLICY IF EXISTS "Produtos disponíveis são visíveis para todos" ON products;

-- 5. Criar políticas simples
CREATE POLICY "Permitir tudo para produtos"
  ON products
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- 6. Verificar estrutura
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;