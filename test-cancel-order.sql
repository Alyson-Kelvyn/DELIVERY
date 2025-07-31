-- Script para testar o cancelamento de pedidos
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar se o status "cancelado" está disponível
SELECT 'Status disponíveis:' as info;
SELECT unnest(enum_range(NULL::order_status)) as status_values;

-- 2. Verificar se há pedidos para testar
SELECT 'Pedidos existentes:' as info;
SELECT id, status, created_at 
FROM orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. Tentar cancelar um pedido (substitua o ID por um pedido real)
-- UPDATE orders SET status = 'cancelado' WHERE id = 'SEU_ID_AQUI';

-- 4. Verificar constraints da tabela
SELECT 'Constraints da tabela orders:' as info;
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass;

-- 5. Testar inserção de um pedido com status cancelado
INSERT INTO orders (
    id, 
    customer_data, 
    items, 
    total, 
    status, 
    created_at
) VALUES (
    gen_random_uuid(),
    '{"name": "Teste", "phone": "123", "deliveryType": "entrega", "paymentMethod": "pix"}',
    '[{"product": {"name": "Teste"}, "quantity": 1}]',
    10.0,
    'cancelado',
    NOW()
) ON CONFLICT DO NOTHING;

-- 6. Verificar se o pedido foi inserido
SELECT 'Pedido de teste inserido:' as info;
SELECT id, status, created_at 
FROM orders 
WHERE customer_data->>'name' = 'Teste'
ORDER BY created_at DESC; 