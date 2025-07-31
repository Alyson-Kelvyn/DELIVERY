-- Script para corrigir o status "cancelado" - versão final
-- Execute este script no SQL Editor do Supabase

-- 1. Primeiro, vamos verificar como a coluna status está definida
SELECT 
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'status';

-- 2. Verificar todas as constraints da tabela orders
SELECT 
    conname as constraint_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass;

-- 3. Se for uma constraint CHECK, vamos modificá-la
DO $$
DECLARE
    constraint_name text;
    current_check text;
BEGIN
    -- Encontrar a constraint de status
    SELECT conname, pg_get_constraintdef(oid)
    INTO constraint_name, current_check
    FROM pg_constraint 
    WHERE conrelid = 'orders'::regclass 
    AND contype = 'c' 
    AND pg_get_constraintdef(oid) LIKE '%status%';
    
    IF constraint_name IS NOT NULL THEN
        RAISE NOTICE 'Constraint encontrada: %', constraint_name;
        RAISE NOTICE 'Definição atual: %', current_check;
        
        -- Remover a constraint antiga
        EXECUTE format('ALTER TABLE orders DROP CONSTRAINT %I', constraint_name);
        
        -- Adicionar nova constraint com status cancelado
        ALTER TABLE orders ADD CONSTRAINT orders_status_check 
        CHECK (status IN ('pendente', 'confirmado', 'entregue', 'cancelado'));
        
        RAISE NOTICE 'Constraint atualizada com sucesso! Status "cancelado" adicionado.';
    ELSE
        RAISE NOTICE 'Nenhuma constraint de status encontrada.';
    END IF;
END $$;

-- 4. Verificar se a alteração foi aplicada
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass 
AND contype = 'c' 
AND pg_get_constraintdef(oid) LIKE '%status%'; 