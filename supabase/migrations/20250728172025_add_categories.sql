-- Adicionar campo category à tabela products
ALTER TABLE products ADD COLUMN IF NOT EXISTS category text DEFAULT 'marmitas' CHECK (category IN ('marmitas', 'bebidas', 'sobremesas', 'acompanhamentos'));

-- Atualizar produtos existentes para terem a categoria 'marmitas'
UPDATE products SET category = 'marmitas' WHERE category IS NULL;

-- Inserir novos produtos com categorias
INSERT INTO products (name, description, price, image_url, available, category) VALUES
  -- Bebidas
  ('Refrigerante Coca-Cola 350ml', 'Refrigerante Coca-Cola gelado', 4.50, 'https://images.pexels.com/photos/1627763/pexels-photo-1627763.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'bebidas'),
  ('Refrigerante Pepsi 350ml', 'Refrigerante Pepsi gelado', 4.50, 'https://images.pexels.com/photos/1627763/pexels-photo-1627763.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'bebidas'),
  ('Suco de Laranja Natural 300ml', 'Suco de laranja natural e fresco', 5.00, 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'bebidas'),
  ('Água Mineral 500ml', 'Água mineral sem gás', 3.00, 'https://images.pexels.com/photos/1187766/pexels-photo-1187766.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'bebidas'),
  ('Cerveja Heineken 350ml', 'Cerveja Heineken gelada', 6.50, 'https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'bebidas'),
  
  -- Sobremesas
  ('Pudim de Leite', 'Pudim de leite caseiro com calda de caramelo', 8.00, 'https://images.pexels.com/photos/162553/pexels-photo-162553.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'sobremesas'),
  ('Brigadeiro', 'Brigadeiro caseiro com chocolate belga', 3.50, 'https://images.pexels.com/photos/162553/pexels-photo-162553.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'sobremesas'),
  ('Sorvete de Creme', 'Sorvete de creme artesanal', 6.00, 'https://images.pexels.com/photos/1352281/pexels-photo-1352281.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'sobremesas'),
  ('Torta de Limão', 'Torta de limão com merengue', 12.00, 'https://images.pexels.com/photos/162553/pexels-photo-162553.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'sobremesas'),
  ('Mousse de Chocolate', 'Mousse de chocolate belga', 7.50, 'https://images.pexels.com/photos/162553/pexels-photo-162553.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'sobremesas'),
  
  -- Acompanhamentos
  ('Farofa de Bacon', 'Farofa temperada com bacon crocante', 4.00, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'acompanhamentos'),
  ('Vinagrete', 'Vinagrete tradicional com tomate, cebola e pimentão', 3.00, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'acompanhamentos'),
  ('Molho Chimichurri', 'Molho chimichurri argentino', 2.50, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'acompanhamentos'),
  ('Pão de Alho', 'Pão de alho torrado na brasa', 3.50, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'acompanhamentos'),
  ('Queijo Coalho', 'Queijo coalho grelhado na brasa', 5.00, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'acompanhamentos')
ON CONFLICT (name) DO NOTHING; 