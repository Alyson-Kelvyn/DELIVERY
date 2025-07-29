-- Script para criar trigger automático de estoque
-- Execute este script no SQL Editor do Supabase

-- 1. Criar função para atualizar disponibilidade automaticamente
CREATE OR REPLACE FUNCTION update_product_availability()
RETURNS TRIGGER AS $$
BEGIN
  -- Se o produto tem controle de estoque (stock não é null)
  IF NEW.stock IS NOT NULL THEN
    -- Se estoque chegou a zero, tornar indisponível
    IF NEW.stock <= 0 THEN
      NEW.available = false;
    -- Se estoque foi reposto e produto estava indisponível por falta de estoque, reativar
    ELSIF NEW.stock > 0 AND OLD.stock <= 0 AND NOT OLD.available THEN
      NEW.available = true;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Criar trigger que executa antes de INSERT ou UPDATE
DROP TRIGGER IF EXISTS trigger_update_product_availability ON products;

CREATE TRIGGER trigger_update_product_availability
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_product_availability();

-- 3. Verificar se o trigger foi criado
SELECT 
  trigger_name,
  event_manipulation,
  action_timing,
  action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'products';

-- 4. Testar o trigger com um produto de exemplo
INSERT INTO products (name, description, price, image_url, available, category, stock) 
VALUES (
  'Produto Teste Trigger',
  'Produto para testar o trigger automático',
  20.00,
  'https://via.placeholder.com/300x200',
  true,
  'marmitas',
  5
);

-- 5. Verificar se foi inserido
SELECT id, name, available, stock FROM products WHERE name = 'Produto Teste Trigger';

-- 6. Testar atualização de estoque para zero
UPDATE products 
SET stock = 0 
WHERE name = 'Produto Teste Trigger';

-- 7. Verificar se ficou indisponível
SELECT id, name, available, stock FROM products WHERE name = 'Produto Teste Trigger';

-- 8. Testar reposição de estoque
UPDATE products 
SET stock = 10 
WHERE name = 'Produto Teste Trigger';

-- 9. Verificar se foi reativado
SELECT id, name, available, stock FROM products WHERE name = 'Produto Teste Trigger';

-- 10. Limpar teste
DELETE FROM products WHERE name = 'Produto Teste Trigger';

-- 11. Mostrar produtos existentes
SELECT id, name, category, available, stock FROM products ORDER BY name;