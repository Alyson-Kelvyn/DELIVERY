-- Script para testar redução de estoque
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar produtos com estoque atual
SELECT id, name, stock, available FROM products WHERE stock IS NOT NULL ORDER BY name;

-- 2. Criar produto de teste com estoque
INSERT INTO products (name, description, price, image_url, available, category, stock) 
VALUES (
  'Produto Teste Estoque',
  'Produto para testar redução de estoque',
  25.00,
  'https://via.placeholder.com/300x200',
  true,
  'marmitas',
  10
) ON CONFLICT (name) DO NOTHING;

-- 3. Verificar se foi inserido
SELECT id, name, stock, available FROM products WHERE name = 'Produto Teste Estoque';

-- 4. Simular redução de estoque (como seria feito pelo pedido)
UPDATE products 
SET stock = stock - 3 
WHERE name = 'Produto Teste Estoque';

-- 5. Verificar estoque após redução
SELECT id, name, stock, available FROM products WHERE name = 'Produto Teste Estoque';

-- 6. Simular redução para zero
UPDATE products 
SET stock = 0 
WHERE name = 'Produto Teste Estoque';

-- 7. Verificar se ficou indisponível (deve ser false devido ao trigger)
SELECT id, name, stock, available FROM products WHERE name = 'Produto Teste Estoque';

-- 8. Simular reposição de estoque
UPDATE products 
SET stock = 5 
WHERE name = 'Produto Teste Estoque';

-- 9. Verificar se foi reativado
SELECT id, name, stock, available FROM products WHERE name = 'Produto Teste Estoque';

-- 10. Limpar produto de teste
DELETE FROM products WHERE name = 'Produto Teste Estoque';

-- 11. Mostrar produtos finais
SELECT id, name, stock, available FROM products WHERE stock IS NOT NULL ORDER BY name;