-- Solução simples para adicionar status "cancelado"
-- Execute este script no SQL Editor do Supabase

-- 1. Verificar a estrutura atual
SELECT 'Estrutura atual da tabela orders:' as info;
SELECT column_name, data_type, udt_name 
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'status';

-- 2. Verificar constraints atuais
SELECT 'Constraints atuais:' as info;
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass;

-- 3. Tentar adicionar o status cancelado de várias formas
DO $$
BEGIN
    -- Tentar adicionar como enum se existir
    BEGIN
        ALTER TYPE order_status ADD VALUE 'cancelado';
        RAISE NOTICE 'Status "cancelado" adicionado ao enum order_status';
    EXCEPTION WHEN undefined_object THEN
        RAISE NOTICE 'Enum order_status não existe, tentando outras opções...';
    END;
    
    -- Tentar adicionar como enum orders_status se existir
    BEGIN
        ALTER TYPE orders_status ADD VALUE 'cancelado';
        RAISE NOTICE 'Status "cancelado" adicionado ao enum orders_status';
    EXCEPTION WHEN undefined_object THEN
        RAISE NOTICE 'Enum orders_status não existe, tentando constraint...';
    END;
    
    -- Se não funcionou, tentar modificar a constraint
    BEGIN
        -- Remover constraint antiga se existir
        ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
        ALTER TABLE orders DROP CONSTRAINT IF EXISTS check_status;
        
        -- Adicionar nova constraint com cancelado
        ALTER TABLE orders ADD CONSTRAINT orders_status_check 
        CHECK (status IN ('pendente', 'confirmado', 'entregue', 'cancelado'));
        
        RAISE NOTICE 'Constraint atualizada com status "cancelado" adicionado!';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Erro ao atualizar constraint: %', SQLERRM;
    END;
END $$;

-- 4. Verificar resultado final
SELECT 'Status disponíveis após correção:' as info;
SELECT DISTINCT status FROM orders ORDER BY status; 