-- =====================================================
-- QUERIES ÚTEIS - SISTEMA CHURRASCARIA
-- =====================================================
-- Este arquivo contém queries úteis e consultas comuns
-- para o sistema de delivery da churrascaria

-- =====================================================
-- 1. CONSULTAS DE PRODUTOS
-- =====================================================

-- Buscar todos os produtos disponíveis
SELECT id, name, description, price, image_url, category, stock
FROM products 
WHERE available = true 
ORDER BY category, name;

-- Buscar produtos por categoria
SELECT id, name, description, price, image_url, stock
FROM products 
WHERE available = true AND category = 'marmitas'
ORDER BY name;

-- Buscar produtos com estoque baixo (menos de 10 unidades)
SELECT id, name, category, stock, price
FROM products 
WHERE available = true AND stock IS NOT NULL AND stock <= 10
ORDER BY stock ASC;

-- Buscar produtos por faixa de preço
SELECT id, name, price, category
FROM products 
WHERE available = true AND price BETWEEN 10.00 AND 20.00
ORDER BY price;

-- Contar produtos por categoria
SELECT category, COUNT(*) as total_products
FROM products 
WHERE available = true
GROUP BY category
ORDER BY total_products DESC;

-- =====================================================
-- 2. CONSULTAS DE PEDIDOS
-- =====================================================

-- Buscar pedidos do dia atual
SELECT 
  id,
  customer_data->>'name' as customer_name,
  customer_data->>'phone' as customer_phone,
  total,
  status,
  created_at
FROM orders 
WHERE DATE(created_at) = CURRENT_DATE
ORDER BY created_at DESC;

-- Buscar pedidos por status
SELECT 
  id,
  customer_data->>'name' as customer_name,
  customer_data->>'phone' as customer_phone,
  total,
  created_at
FROM orders 
WHERE status = 'pendente'
ORDER BY created_at ASC;

-- Buscar pedidos de um cliente específico (por telefone)
SELECT 
  id,
  customer_data->>'name' as customer_name,
  customer_data->>'address' as customer_address,
  total,
  status,
  created_at
FROM orders 
WHERE customer_data->>'phone' = '(85) 99999-9999'
ORDER BY created_at DESC;

-- Calcular total de vendas do dia
SELECT 
  COUNT(*) as total_orders,
  SUM(total) as total_revenue,
  AVG(total) as avg_order_value
FROM orders 
WHERE DATE(created_at) = CURRENT_DATE AND status != 'cancelado';

-- Buscar pedidos com entrega (deliveryType = 'entrega')
SELECT 
  id,
  customer_data->>'name' as customer_name,
  customer_data->>'phone' as customer_phone,
  customer_data->>'address' as customer_address,
  total,
  status,
  created_at
FROM orders 
WHERE customer_data->>'deliveryType' = 'entrega'
ORDER BY created_at DESC;

-- =====================================================
-- 3. CONSULTAS DE ITENS DOS PEDIDOS
-- =====================================================

-- Buscar produtos mais vendidos (últimos 30 dias)
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
  AND o.status != 'cancelado'
GROUP BY p.id, p.name, p.category, p.price
ORDER BY total_quantity DESC;

-- Buscar itens de um pedido específico
SELECT 
  item->>'product'->>'name' as product_name,
  (item->>'quantity')::int as quantity,
  (item->>'product'->>'price')::decimal as unit_price,
  ((item->>'quantity')::int * (item->>'product'->>'price')::decimal) as total_price
FROM orders o
CROSS JOIN LATERAL jsonb_array_elements(o.items) as item
WHERE o.id = 'uuid-do-pedido-aqui'
ORDER BY item->>'product'->>'name';

-- Calcular total de itens vendidos por categoria (últimos 7 dias)
SELECT 
  p.category,
  SUM((item->>'quantity')::int) as total_quantity,
  SUM((item->>'quantity')::int * (item->>'product'->>'price')::decimal) as total_revenue
FROM products p
JOIN orders o ON true
CROSS JOIN LATERAL jsonb_array_elements(o.items) as item
WHERE item->>'product'->>'id' = p.id::text
  AND o.created_at >= CURRENT_DATE - INTERVAL '7 days'
  AND o.status != 'cancelado'
GROUP BY p.category
ORDER BY total_revenue DESC;

-- =====================================================
-- 4. CONSULTAS DE RELATÓRIOS
-- =====================================================

-- Relatório de vendas por período
SELECT 
  DATE(created_at) as sale_date,
  COUNT(*) as total_orders,
  SUM(total) as total_revenue,
  AVG(total) as avg_order_value,
  SUM(delivery_fee) as total_delivery_fees
FROM orders 
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31'
  AND status != 'cancelado'
GROUP BY DATE(created_at)
ORDER BY sale_date DESC;

-- Relatório de status dos pedidos (últimos 7 dias)
SELECT 
  status,
  COUNT(*) as total_orders,
  SUM(total) as total_revenue,
  ROUND(AVG(total), 2) as avg_order_value
FROM orders 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY status
ORDER BY total_orders DESC;

-- Relatório de métodos de pagamento
SELECT 
  customer_data->>'paymentMethod' as payment_method,
  COUNT(*) as total_orders,
  SUM(total) as total_revenue,
  ROUND(AVG(total), 2) as avg_order_value
FROM orders 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND status != 'cancelado'
GROUP BY customer_data->>'paymentMethod'
ORDER BY total_revenue DESC;

-- Relatório de tipos de entrega
SELECT 
  customer_data->>'deliveryType' as delivery_type,
  COUNT(*) as total_orders,
  SUM(total) as total_revenue,
  SUM(delivery_fee) as total_delivery_fees,
  ROUND(AVG(total), 2) as avg_order_value
FROM orders 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND status != 'cancelado'
GROUP BY customer_data->>'deliveryType'
ORDER BY total_orders DESC;

-- =====================================================
-- 5. CONSULTAS DE ESTOQUE
-- =====================================================

-- Produtos com estoque baixo
SELECT 
  name,
  category,
  stock,
  price,
  CASE 
    WHEN stock <= 5 THEN 'CRÍTICO'
    WHEN stock <= 10 THEN 'BAIXO'
    ELSE 'NORMAL'
  END as stock_status
FROM products 
WHERE available = true AND stock IS NOT NULL
ORDER BY stock ASC;

-- Produtos sem estoque
SELECT 
  name,
  category,
  price
FROM products 
WHERE available = true AND stock = 0
ORDER BY category, name;

-- Produtos que não usam controle de estoque
SELECT 
  name,
  category,
  price
FROM products 
WHERE available = true AND stock IS NULL
ORDER BY category, name;

-- =====================================================
-- 6. CONSULTAS DE CLIENTES
-- =====================================================

-- Clientes mais frequentes (últimos 30 dias)
SELECT 
  customer_data->>'name' as customer_name,
  customer_data->>'phone' as customer_phone,
  COUNT(*) as total_orders,
  SUM(total) as total_spent,
  ROUND(AVG(total), 2) as avg_order_value
FROM orders 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
  AND status != 'cancelado'
GROUP BY customer_data->>'name', customer_data->>'phone'
HAVING COUNT(*) > 1
ORDER BY total_orders DESC, total_spent DESC;

-- Clientes que fazem pedidos de entrega
SELECT 
  customer_data->>'name' as customer_name,
  customer_data->>'phone' as customer_phone,
  customer_data->>'address' as customer_address,
  COUNT(*) as total_orders
FROM orders 
WHERE customer_data->>'deliveryType' = 'entrega'
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY customer_data->>'name', customer_data->>'phone', customer_data->>'address'
ORDER BY total_orders DESC;

-- =====================================================
-- 7. CONSULTAS DE PERFORMANCE
-- =====================================================

-- Tempo médio de processamento dos pedidos (por status)
SELECT 
  status,
  COUNT(*) as total_orders,
  ROUND(AVG(EXTRACT(EPOCH FROM (updated_at - created_at))/60), 2) as avg_processing_minutes
FROM orders 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
  AND updated_at IS NOT NULL
GROUP BY status
ORDER BY avg_processing_minutes;

-- Horários de pico de pedidos (últimos 7 dias)
SELECT 
  EXTRACT(HOUR FROM created_at) as hour_of_day,
  COUNT(*) as total_orders
FROM orders 
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY EXTRACT(HOUR FROM created_at)
ORDER BY total_orders DESC;

-- =====================================================
-- 8. CONSULTAS DE MANUTENÇÃO
-- =====================================================

-- Pedidos antigos (mais de 30 dias)
SELECT 
  id,
  customer_data->>'name' as customer_name,
  total,
  status,
  created_at
FROM orders 
WHERE created_at < CURRENT_DATE - INTERVAL '30 days'
  AND status IN ('pendente', 'confirmado')
ORDER BY created_at ASC;

-- Produtos não utilizados (sem vendas nos últimos 30 dias)
SELECT 
  p.id,
  p.name,
  p.category,
  p.price
FROM products p
WHERE p.available = true
  AND NOT EXISTS (
    SELECT 1 FROM orders o
    CROSS JOIN LATERAL jsonb_array_elements(o.items) as item
    WHERE item->>'product'->>'id' = p.id::text
      AND o.created_at >= CURRENT_DATE - INTERVAL '30 days'
  )
ORDER BY p.category, p.name;

-- =====================================================
-- 9. CONSULTAS DE BACKUP E AUDITORIA
-- =====================================================

-- Backup de todos os pedidos de um período
SELECT 
  id,
  customer_data,
  items,
  total,
  delivery_fee,
  status,
  created_at,
  updated_at
FROM orders 
WHERE created_at BETWEEN '2024-01-01' AND '2024-12-31'
ORDER BY created_at;

-- Log de alterações de status dos pedidos
SELECT 
  id,
  status,
  created_at,
  updated_at,
  CASE 
    WHEN updated_at > created_at THEN 'MODIFICADO'
    ELSE 'CRIADO'
  END as action_type
FROM orders 
WHERE updated_at IS NOT NULL
ORDER BY updated_at DESC;

-- =====================================================
-- 10. CONSULTAS DE TESTE E DESENVOLVIMENTO
-- =====================================================

-- Verificar integridade dos dados
SELECT 
  'orders_without_customer_name' as issue,
  COUNT(*) as count
FROM orders 
WHERE NOT (customer_data ? 'name')
UNION ALL
SELECT 
  'orders_without_items' as issue,
  COUNT(*) as count
FROM orders 
WHERE jsonb_array_length(items) = 0
UNION ALL
SELECT 
  'products_without_price' as issue,
  COUNT(*) as count
FROM products 
WHERE price IS NULL OR price <= 0;

-- Verificar performance dos índices
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;

-- =====================================================
-- FIM DAS QUERIES ÚTEIS
-- =====================================================
