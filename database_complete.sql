-- =====================================================
-- SISTEMA DE DELIVERY PARA CHURRASCARIA - BANCO COMPLETO
-- =====================================================
-- Este arquivo contém todo o esquema do banco de dados
-- incluindo tabelas, políticas de segurança, índices e dados de exemplo

-- =====================================================
-- 1. CRIAÇÃO DAS TABELAS
-- =====================================================

-- Tabela de produtos do cardápio
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL CHECK (price >= 0),
  image_url text NOT NULL,
  available boolean DEFAULT true,
  stock integer, -- Quantidade em estoque (NULL = sem controle de estoque)
  category text DEFAULT 'marmitas' CHECK (category IN ('marmitas', 'bebidas', 'sobremesas', 'acompanhamentos')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Comentário sobre o campo stock
COMMENT ON COLUMN products.stock IS 'Quantidade em estoque. NULL significa que o produto não usa controle de estoque.';

-- Tabela de pedidos dos clientes
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_data jsonb NOT NULL, -- Dados do cliente (nome, telefone, endereço, etc.)
  items jsonb NOT NULL, -- Itens do pedido (produtos e quantidades)
  total decimal(10,2) NOT NULL CHECK (total >= 0),
  delivery_fee decimal(10,2) DEFAULT 0 CHECK (delivery_fee >= 0),
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'entregue', 'cancelado')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Tabela de usuários administrativos
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  role text DEFAULT 'admin' CHECK (role IN ('admin', 'manager')),
  active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- 3. POLÍTICAS DE SEGURANÇA
-- =====================================================

-- Políticas para tabela products
CREATE POLICY "Produtos disponíveis são visíveis para todos"
  ON products
  FOR SELECT
  TO public
  USING (available = true);

CREATE POLICY "Usuários autenticados podem gerenciar produtos"
  ON products
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Permitir inserção de produtos para teste"
  ON products
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Permitir atualização de produtos para teste"
  ON products
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Políticas para tabela orders
CREATE POLICY "Qualquer um pode criar pedidos"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Admins podem ver e gerenciar pedidos"
  ON orders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true
    )
  );

-- Políticas para tabela admin_users
CREATE POLICY "Admins podem ver outros admins"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true
    )
  );

CREATE POLICY "Admins podem gerenciar outros admins"
  ON admin_users
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true AND role = 'admin'
    )
  );

-- =====================================================
-- 4. ÍNDICES PARA PERFORMANCE
-- =====================================================

-- Índices para tabela products
CREATE INDEX IF NOT EXISTS idx_products_available ON products(available);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at);
CREATE INDEX IF NOT EXISTS idx_products_name ON products USING gin(to_tsvector('portuguese', name));

-- Índices para tabela orders
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_customer_data ON orders USING gin(customer_data);
CREATE INDEX IF NOT EXISTS idx_orders_items ON orders USING gin(items);

-- Índices para tabela admin_users
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);
CREATE INDEX IF NOT EXISTS idx_admin_users_active ON admin_users(active);

-- =====================================================
-- 5. FUNÇÕES E TRIGGERS
-- =====================================================

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para atualizar updated_at
CREATE TRIGGER update_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at 
    BEFORE UPDATE ON admin_users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Função para validar dados do cliente
CREATE OR REPLACE FUNCTION validate_customer_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Verificar se customer_data contém campos obrigatórios
    IF NOT (NEW.customer_data ? 'name' AND NEW.customer_data ? 'phone' AND NEW.customer_data ? 'paymentMethod') THEN
        RAISE EXCEPTION 'customer_data deve conter name, phone e paymentMethod';
    END IF;
    
    -- Verificar se items é um array válido
    IF NOT (jsonb_typeof(NEW.items) = 'array') THEN
        RAISE EXCEPTION 'items deve ser um array';
    END IF;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para validar dados do pedido
CREATE TRIGGER validate_order_data
    BEFORE INSERT OR UPDATE ON orders
    FOR EACH ROW EXECUTE FUNCTION validate_customer_data();

-- =====================================================
-- 6. DADOS DE EXEMPLO
-- =====================================================

-- Inserir produtos de exemplo
INSERT INTO products (name, description, price, image_url, available, category, stock) VALUES
  -- Marmitas
  ('Marmita de Picanha', 'Deliciosa picanha grelhada com arroz, feijão, farofa e vinagrete', 18.90, 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'marmitas', 50),
  ('Marmita de Maminha', 'Suculenta maminha na brasa com acompanhamentos tradicionais', 16.90, 'https://images.pexels.com/photos/2491273/pexels-photo-2491273.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'marmitas', 45),
  ('Marmita de Fraldinha', 'Fraldinha temperada na medida certa com todos os acompanhamentos', 15.90, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'marmitas', 60),
  ('Marmita de Costela', 'Costela bovina assada lentamente, derretendo na boca', 19.90, 'https://images.pexels.com/photos/1251198/pexels-photo-1251198.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'marmitas', 30),
  ('Marmita de Linguiça', 'Linguiça artesanal grelhada com temperos especiais', 13.90, 'https://images.pexels.com/photos/248444/pexels-photo-248444.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'marmitas', 40),
  ('Marmita de Alcatra', 'Alcatra macia e suculenta com o sabor inconfundível do churrasco', 17.90, 'https://images.pexels.com/photos/1409050/pexels-photo-1409050.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'marmitas', 55),
  ('Marmita de Carne de Sol', 'Carne de sol desfiada com queijo coalho e manteiga da terra', 22.90, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'marmitas', 25),
  ('Marmita de Frango', 'Frango grelhado com molho especial e acompanhamentos', 16.90, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'marmitas', 70),
  
  -- Bebidas
  ('Refrigerante Coca-Cola 350ml', 'Refrigerante Coca-Cola gelado', 4.50, 'https://images.pexels.com/photos/1627763/pexels-photo-1627763.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'bebidas', 100),
  ('Refrigerante Pepsi 350ml', 'Refrigerante Pepsi gelado', 4.50, 'https://images.pexels.com/photos/1627763/pexels-photo-1627763.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'bebidas', 100),
  ('Suco de Laranja Natural 300ml', 'Suco de laranja natural e fresco', 5.00, 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'bebidas', 50),
  ('Água Mineral 500ml', 'Água mineral sem gás', 3.00, 'https://images.pexels.com/photos/1187766/pexels-photo-1187766.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'bebidas', 80),
  ('Cerveja Heineken 350ml', 'Cerveja Heineken gelada', 6.50, 'https://images.pexels.com/photos/1283219/pexels-photo-1283219.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'bebidas', 60),
  ('Guaraná Natural 300ml', 'Guaraná natural caseiro', 4.00, 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'bebidas', 40),
  
  -- Sobremesas
  ('Pudim de Leite', 'Pudim de leite caseiro com calda de caramelo', 8.00, 'https://images.pexels.com/photos/162553/pexels-photo-162553.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'sobremesas', 20),
  ('Brigadeiro', 'Brigadeiro caseiro com chocolate belga', 3.50, 'https://images.pexels.com/photos/162553/pexels-photo-162553.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'sobremesas', 30),
  ('Sorvete de Creme', 'Sorvete de creme artesanal', 6.00, 'https://images.pexels.com/photos/1352281/pexels-photo-1352281.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'sobremesas', 25),
  ('Torta de Limão', 'Torta de limão com merengue', 12.00, 'https://images.pexels.com/photos/162553/pexels-photo-162553.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'sobremesas', 15),
  ('Mousse de Chocolate', 'Mousse de chocolate belga', 7.50, 'https://images.pexels.com/photos/162553/pexels-photo-162553.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'sobremesas', 20),
  
  -- Acompanhamentos
  ('Farofa de Bacon', 'Farofa temperada com bacon crocante', 4.00, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'acompanhamentos', 40),
  ('Vinagrete', 'Vinagrete tradicional com tomate, cebola e pimentão', 3.00, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'acompanhamentos', 50),
  ('Molho Chimichurri', 'Molho chimichurri argentino', 2.50, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'acompanhamentos', 30),
  ('Pão de Alho', 'Pão de alho torrado na brasa', 3.50, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'acompanhamentos', 35),
  ('Queijo Coalho', 'Queijo coalho grelhado na brasa', 5.00, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'acompanhamentos', 25)
ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- 7. VIEWS ÚTEIS
-- =====================================================

-- View para produtos disponíveis
CREATE OR REPLACE VIEW available_products AS
SELECT 
  id,
  name,
  description,
  price,
  image_url,
  category,
  stock,
  created_at
FROM products 
WHERE available = true
ORDER BY category, name;

-- View para resumo de pedidos por status
CREATE OR REPLACE VIEW orders_summary AS
SELECT 
  status,
  COUNT(*) as total_orders,
  SUM(total) as total_revenue,
  AVG(total) as avg_order_value
FROM orders 
WHERE created_at >= CURRENT_DATE
GROUP BY status
ORDER BY status;

-- View para produtos mais vendidos
CREATE OR REPLACE VIEW top_products AS
SELECT 
  p.name,
  p.category,
  p.price,
  COUNT(*) as times_ordered,
  SUM((item->>'quantity')::int) as total_quantity
FROM products p
JOIN orders o ON true
CROSS JOIN LATERAL jsonb_array_elements(o.items) as item
WHERE item->>'product'->>'id' = p.id::text
  AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY p.id, p.name, p.category, p.price
ORDER BY total_quantity DESC;

-- =====================================================
-- 8. FUNÇÕES DE UTILIDADE
-- =====================================================

-- Função para buscar produtos por categoria
CREATE OR REPLACE FUNCTION get_products_by_category(category_name text)
RETURNS TABLE (
  id uuid,
  name text,
  description text,
  price decimal,
  image_url text,
  category text,
  stock integer
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.description, p.price, p.image_url, p.category, p.stock
  FROM products p
  WHERE p.available = true AND p.category = category_name
  ORDER BY p.name;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular estatísticas de vendas
CREATE OR REPLACE FUNCTION get_sales_stats(start_date date, end_date date)
RETURNS TABLE (
  total_orders bigint,
  total_revenue decimal,
  avg_order_value decimal,
  total_delivery_fees decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*) as total_orders,
    COALESCE(SUM(total), 0) as total_revenue,
    COALESCE(AVG(total), 0) as avg_order_value,
    COALESCE(SUM(delivery_fee), 0) as total_delivery_fees
  FROM orders
  WHERE DATE(created_at) BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql;

-- Função para verificar estoque baixo
CREATE OR REPLACE FUNCTION get_low_stock_products(threshold integer DEFAULT 10)
RETURNS TABLE (
  id uuid,
  name text,
  category text,
  current_stock integer,
  price decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT p.id, p.name, p.category, p.stock, p.price
  FROM products p
  WHERE p.stock IS NOT NULL 
    AND p.stock <= threshold 
    AND p.available = true
  ORDER BY p.stock ASC;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. COMENTÁRIOS E DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE products IS 'Tabela de produtos do cardápio da churrascaria';
COMMENT ON TABLE orders IS 'Tabela de pedidos dos clientes';
COMMENT ON TABLE admin_users IS 'Tabela de usuários administrativos do sistema';

COMMENT ON COLUMN products.stock IS 'Quantidade em estoque. NULL significa que o produto não usa controle de estoque.';
COMMENT ON COLUMN products.category IS 'Categoria do produto: marmitas, bebidas, sobremesas, acompanhamentos';
COMMENT ON COLUMN orders.customer_data IS 'Dados do cliente em formato JSON (nome, telefone, endereço, método de pagamento)';
COMMENT ON COLUMN orders.items IS 'Itens do pedido em formato JSON (produtos e quantidades)';
COMMENT ON COLUMN orders.status IS 'Status do pedido: pendente, confirmado, entregue, cancelado';
COMMENT ON COLUMN admin_users.role IS 'Papel do usuário: admin (acesso total) ou manager (acesso limitado)';

-- =====================================================
-- 10. CONFIGURAÇÕES ADICIONAIS
-- =====================================================

-- Configurar timezone
SET timezone = 'America/Fortaleza';

-- Configurar locale para português
SET lc_messages = 'pt_BR.UTF-8';

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
