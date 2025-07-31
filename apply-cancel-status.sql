-- Script para adicionar status "cancelado" ao enum order_status
-- Execute este script no SQL Editor do Supabase

-- Verificar se o status 'cancelado' já existe no enum
DO $$
BEGIN
    -- Verificar se o status 'cancelado' já existe no enum
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'cancelado' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'order_status')
    ) THEN
        -- Adicionar o novo status ao enum
        ALTER TYPE order_status ADD VALUE 'cancelado';
        RAISE NOTICE 'Status "cancelado" adicionado com sucesso!';
    ELSE
        RAISE NOTICE 'Status "cancelado" já existe no enum.';
    END IF;
END $$;

-- Verificar todos os status disponíveis
SELECT unnest(enum_range(NULL::order_status)) as status_values; 