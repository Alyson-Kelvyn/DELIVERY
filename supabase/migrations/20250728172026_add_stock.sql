-- Adicionar campo stock à tabela products
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock integer;

-- Comentário explicativo sobre o campo stock
COMMENT ON COLUMN products.stock IS 'Quantidade em estoque. NULL significa que o produto não usa controle de estoque.';