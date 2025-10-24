-- =====================================================
-- POLÍTICAS DE SEGURANÇA DETALHADAS - SISTEMA CHURRASCARIA
-- =====================================================
-- Este arquivo contém políticas de segurança mais específicas
-- e detalhadas para o sistema de delivery da churrascaria

-- =====================================================
-- 1. POLÍTICAS PARA TABELA PRODUCTS
-- =====================================================

-- Remover políticas existentes para recriar
DROP POLICY IF EXISTS "Produtos disponíveis são visíveis para todos" ON products;
DROP POLICY IF EXISTS "Usuários autenticados podem gerenciar produtos" ON products;
DROP POLICY IF EXISTS "Permitir inserção de produtos para teste" ON products;
DROP POLICY IF EXISTS "Permitir atualização de produtos para teste" ON products;

-- Política para leitura pública de produtos disponíveis
CREATE POLICY "Produtos disponíveis são visíveis para todos"
  ON products
  FOR SELECT
  TO public
  USING (available = true);

-- Política para usuários autenticados gerenciarem produtos
CREATE POLICY "Usuários autenticados podem gerenciar produtos"
  ON products
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true
    )
  );

-- Política específica para inserção de produtos
CREATE POLICY "Admins podem inserir produtos"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true
    )
  );

-- Política específica para atualização de produtos
CREATE POLICY "Admins podem atualizar produtos"
  ON products
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true
    )
  );

-- Política específica para exclusão de produtos
CREATE POLICY "Admins podem excluir produtos"
  ON products
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true AND role = 'admin'
    )
  );

-- =====================================================
-- 2. POLÍTICAS PARA TABELA ORDERS
-- =====================================================

-- Remover políticas existentes para recriar
DROP POLICY IF EXISTS "Qualquer um pode criar pedidos" ON orders;
DROP POLICY IF EXISTS "Admins podem ver e gerenciar pedidos" ON orders;

-- Política para criação de pedidos (público)
CREATE POLICY "Qualquer um pode criar pedidos"
  ON orders
  FOR INSERT
  TO public
  WITH CHECK (
    -- Validar que customer_data contém campos obrigatórios
    customer_data ? 'name' AND 
    customer_data ? 'phone' AND 
    customer_data ? 'paymentMethod' AND
    customer_data ? 'deliveryType' AND
    -- Validar que items é um array não vazio
    jsonb_array_length(items) > 0 AND
    -- Validar que total é positivo
    total > 0
  );

-- Política para admins visualizarem todos os pedidos
CREATE POLICY "Admins podem visualizar todos os pedidos"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true
    )
  );

-- Política para admins atualizarem status dos pedidos
CREATE POLICY "Admins podem atualizar pedidos"
  ON orders
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true
    )
  );

-- Política para admins excluírem pedidos (apenas admins)
CREATE POLICY "Apenas admins podem excluir pedidos"
  ON orders
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true AND role = 'admin'
    )
  );

-- =====================================================
-- 3. POLÍTICAS PARA TABELA ADMIN_USERS
-- =====================================================

-- Remover políticas existentes para recriar
DROP POLICY IF EXISTS "Admins podem ver outros admins" ON admin_users;
DROP POLICY IF EXISTS "Admins podem gerenciar outros admins" ON admin_users;

-- Política para admins visualizarem outros admins
CREATE POLICY "Admins podem visualizar outros admins"
  ON admin_users
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true
    )
  );

-- Política para admins inserirem novos usuários
CREATE POLICY "Admins podem inserir novos usuários"
  ON admin_users
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true AND role = 'admin'
    )
  );

-- Política para admins atualizarem outros admins
CREATE POLICY "Admins podem atualizar outros admins"
  ON admin_users
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true AND role = 'admin'
    )
  );

-- Política para admins excluírem outros admins
CREATE POLICY "Admins podem excluir outros admins"
  ON admin_users
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true AND role = 'admin'
    )
    AND auth.uid() != id -- Não pode excluir a si mesmo
  );

-- =====================================================
-- 4. POLÍTICAS ESPECÍFICAS PARA FUNCIONALIDADES
-- =====================================================

-- Política para permitir busca de produtos por categoria
CREATE POLICY "Busca pública de produtos por categoria"
  ON products
  FOR SELECT
  TO public
  USING (
    available = true AND 
    category IN ('marmitas', 'bebidas', 'sobremesas', 'acompanhamentos')
  );

-- Política para permitir filtros de produtos
CREATE POLICY "Filtros públicos de produtos"
  ON products
  FOR SELECT
  TO public
  USING (
    available = true
  );

-- Política para permitir consulta de estoque (apenas admins)
CREATE POLICY "Admins podem consultar estoque"
  ON products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true
    )
  );

-- =====================================================
-- 5. POLÍTICAS PARA RELATÓRIOS E ESTATÍSTICAS
-- =====================================================

-- Política para admins acessarem relatórios de vendas
CREATE POLICY "Admins podem acessar relatórios de vendas"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true
    )
  );

-- Política para admins acessarem estatísticas de produtos
CREATE POLICY "Admins podem acessar estatísticas de produtos"
  ON products
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true
    )
  );

-- =====================================================
-- 6. POLÍTICAS DE AUDITORIA E LOGS
-- =====================================================

-- Política para permitir logs de auditoria (apenas admins)
CREATE POLICY "Admins podem acessar logs de auditoria"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true AND role = 'admin'
    )
  );

-- =====================================================
-- 7. POLÍTICAS DE BACKUP E MANUTENÇÃO
-- =====================================================

-- Política para permitir backup de dados (apenas super admins)
CREATE POLICY "Super admins podem fazer backup"
  ON orders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users 
      WHERE id = auth.uid() AND active = true AND role = 'admin'
    )
  );

-- =====================================================
-- 8. FUNÇÕES DE VALIDAÇÃO PARA POLÍTICAS
-- =====================================================

-- Função para validar se o usuário é admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() AND active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para validar se o usuário é super admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users 
    WHERE id = auth.uid() AND active = true AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para validar dados do pedido
CREATE OR REPLACE FUNCTION validate_order_data(order_data jsonb, order_items jsonb, order_total decimal)
RETURNS boolean AS $$
BEGIN
  -- Validar customer_data
  IF NOT (order_data ? 'name' AND order_data ? 'phone' AND order_data ? 'paymentMethod') THEN
    RETURN false;
  END IF;
  
  -- Validar items
  IF jsonb_array_length(order_items) = 0 THEN
    RETURN false;
  END IF;
  
  -- Validar total
  IF order_total <= 0 THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 9. COMENTÁRIOS SOBRE AS POLÍTICAS
-- =====================================================

COMMENT ON POLICY "Produtos disponíveis são visíveis para todos" ON products IS 'Permite que qualquer pessoa veja produtos disponíveis no cardápio';
COMMENT ON POLICY "Usuários autenticados podem gerenciar produtos" ON products IS 'Permite que admins gerenciem produtos (CRUD)';
COMMENT ON POLICY "Qualquer um pode criar pedidos" ON orders IS 'Permite que clientes façam pedidos através do app';
COMMENT ON POLICY "Admins podem visualizar todos os pedidos" ON orders IS 'Permite que admins vejam todos os pedidos para gerenciamento';
COMMENT ON POLICY "Admins podem atualizar pedidos" ON orders IS 'Permite que admins atualizem status dos pedidos';
COMMENT ON POLICY "Admins podem visualizar outros admins" ON admin_users IS 'Permite que admins vejam outros usuários do sistema';
COMMENT ON POLICY "Admins podem gerenciar outros admins" ON admin_users IS 'Permite que super admins gerenciem outros usuários';

-- =====================================================
-- FIM DAS POLÍTICAS DE SEGURANÇA
-- =====================================================
