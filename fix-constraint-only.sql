-- Script específico para corrigir a constraint orders_status_check
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar a constraint atual
SELECT 'Constraint atual:' as info;
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass 
AND conname = 'orders_status_check';

-- 2. Remover a constraint antiga
ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;

-- 3. Adicionar nova constraint com status cancelado
ALTER TABLE orders ADD CONSTRAINT orders_status_check 
CHECK (status IN ('pendente', 'confirmado', 'entregue', 'cancelado'));

-- 4. Verificar se a constraint foi atualizada
SELECT 'Constraint atualizada:' as info;
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass 
AND conname = 'orders_status_check';

-- 5. Testar se agora aceita o status cancelado
SELECT 'Teste: Status disponíveis agora:' as info;
SELECT DISTINCT status FROM orders ORDER BY status; 