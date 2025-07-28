/*
  # Sistema de Delivery para Churrascaria - Schema Inicial

  1. Novas Tabelas
    - `products` - Produtos do cardápio
      - `id` (uuid, chave primária)
      - `name` (text, nome do produto)
      - `description` (text, descrição)
      - `price` (decimal, preço)
      - `image_url` (text, URL da imagem)
      - `available` (boolean, disponibilidade)
      - `created_at` (timestamp)

    - `orders` - Pedidos dos clientes
      - `id` (uuid, chave primária)
      - `customer_data` (jsonb, dados do cliente)
      - `items` (jsonb, itens do pedido)
      - `total` (decimal, valor total)
      - `status` (text, status do pedido)
      - `created_at` (timestamp)

    - `admin_users` - Usuários administrativos
      - `id` (uuid, chave primária, referência auth.users)
      - `email` (text, email)
      - `name` (text, nome)
      - `created_at` (timestamp)

  2. Segurança
    - Habilitar RLS em todas as tabelas
    - Políticas para acesso público aos produtos disponíveis
    - Políticas para admin gerenciar tudo
    - Políticas para inserção de pedidos (público)

  3. Índices
    - Índice em products.available para consultas rápidas
    - Índice em orders.created_at para relatórios
    - Índice em orders.status para filtragem
*/

-- Produtos
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  image_url text NOT NULL,
  available boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Pedidos
CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_data jsonb NOT NULL,
  items jsonb NOT NULL,
  total decimal(10,2) NOT NULL,
  status text DEFAULT 'pendente' CHECK (status IN ('pendente', 'confirmado', 'entregue')),
  created_at timestamptz DEFAULT now()
);

-- Usuários administrativos
CREATE TABLE IF NOT EXISTS admin_users (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Políticas para products
CREATE POLICY "Produtos disponíveis são visíveis para todos"
  ON products
  FOR SELECT
  TO public
  USING (available = true);

CREATE POLICY "Admins podem gerenciar produtos"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

-- Políticas para orders
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
      WHERE id = auth.uid()
    )
  );

-- Políticas para admin_users
CREATE POLICY "Admins podem ver outros admins"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid()
    )
  );

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_products_available ON products(available);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Inserir produtos de exemplo
INSERT INTO products (name, description, price, image_url, available) VALUES
  ('Marmita de Picanha', 'Deliciosa picanha grelhada com arroz, feijão, farofa e vinagrete', 18.90, 'https://images.pexels.com/photos/1639557/pexels-photo-1639557.jpeg?auto=compress&cs=tinysrgb&w=500', true),
  ('Marmita de Maminha', 'Suculenta maminha na brasa com acompanhamentos tradicionais', 16.90, 'https://images.pexels.com/photos/2491273/pexels-photo-2491273.jpeg?auto=compress&cs=tinysrgb&w=500', true),
  ('Marmita de Fraldinha', 'Fraldinha temperada na medida certa com todos os acompanhamentos', 15.90, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=500', true),
  ('Marmita de Costela', 'Costela bovina assada lentamente, derretendo na boca', 19.90, 'https://images.pexels.com/photos/1251198/pexels-photo-1251198.jpeg?auto=compress&cs=tinysrgb&w=500', true),
  ('Marmita de Linguiça', 'Linguiça artesanal grelhada com temperos especiais', 13.90, 'https://images.pexels.com/photos/248444/pexels-photo-248444.jpeg?auto=compress&cs=tinysrgb&w=500', true),
  ('Marmita de Alcatra', 'Alcatra macia e suculenta com o sabor inconfundível do churrasco', 17.90, 'https://images.pexels.com/photos/1409050/pexels-photo-1409050.jpeg?auto=compress&cs=tinysrgb&w=500', true)
ON CONFLICT (name) DO NOTHING;