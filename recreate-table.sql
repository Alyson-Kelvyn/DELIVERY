-- Script para recriar a tabela products do zero
-- Execute este script no SQL Editor do Supabase

-- 1. Fazer backup dos dados existentes (se houver)
CREATE TABLE IF NOT EXISTS products_backup AS 
SELECT * FROM products;

-- 2. Dropar tabela atual
DROP TABLE IF EXISTS products CASCADE;

-- 3. Recriar tabela com estrutura correta
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  image_url text NOT NULL,
  available boolean DEFAULT true,
  category text DEFAULT 'marmitas',
  stock integer,
  created_at timestamptz DEFAULT now()
);

-- 4. Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 5. Remover todas as políticas antigas (se houver)
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

-- 6. Criar política única permissiva
CREATE POLICY "Permitir tudo para produtos"
  ON products
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- 7. Inserir produtos de exemplo
INSERT INTO products (name, description, price, image_url, available, category, stock) VALUES
  ('Marmita de Picanha', 'Deliciosa picanha grelhada com arroz, feijão, farofa e vinagrete', 18.90, 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'marmitas', null),
  ('Marmita de Maminha', 'Suculenta maminha na brasa com acompanhamentos tradicionais', 16.90, 'https://images.pexels.com/photos/2491273/pexels-photo-2491273.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'marmitas', null),
  ('Refrigerante Coca-Cola 350ml', 'Refrigerante Coca-Cola gelado', 4.50, 'https://images.pexels.com/photos/1627763/pexels-photo-1627763.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'bebidas', null),
  ('Pudim de Leite', 'Pudim de leite caseiro com calda de caramelo', 8.00, 'https://images.pexels.com/photos/162553/pexels-photo-162553.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'sobremesas', null);

-- 8. Verificar estrutura final
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;

-- 9. Verificar produtos inseridos
SELECT id, name, category, available FROM products ORDER BY name;