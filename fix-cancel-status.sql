-- Script para adicionar status "cancelado" - versão corrigida
-- Execute este script no SQL Editor do Supabase

-- Primeiro, vamos descobrir o nome correto do enum
DO $$
DECLARE
    enum_name text;
    enum_exists boolean;
BEGIN
    -- Tentar diferentes nomes possíveis para o enum
    FOR enum_name IN SELECT unnest(ARRAY['order_status', 'orders_status', 'status_enum', 'order_status_enum']) LOOP
        -- Verificar se o enum existe
        SELECT EXISTS (
            SELECT 1 FROM pg_type WHERE typname = enum_name
        ) INTO enum_exists;
        
        IF enum_exists THEN
            RAISE NOTICE 'Enum encontrado: %', enum_name;
            
            -- Verificar se o status 'cancelado' já existe
            IF NOT EXISTS (
                SELECT 1 FROM pg_enum 
                WHERE enumlabel = 'cancelado' 
                AND enumtypid = (SELECT oid FROM pg_type WHERE typname = enum_name)
            ) THEN
                -- Adicionar o novo status ao enum
                EXECUTE format('ALTER TYPE %I ADD VALUE %L', enum_name, 'cancelado');
                RAISE NOTICE 'Status "cancelado" adicionado com sucesso ao enum %!', enum_name;
            ELSE
                RAISE NOTICE 'Status "cancelado" já existe no enum %!', enum_name;
            END IF;
            
            -- Sair do loop após encontrar o enum
            EXIT;
        END IF;
    END LOOP;
    
    IF NOT enum_exists THEN
        RAISE NOTICE 'Nenhum enum encontrado. Verifique a estrutura da tabela orders.';
    END IF;
END $$;

-- Verificar todos os enums e seus valores
SELECT 
    t.typname as enum_name,
    array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typtype = 'e'
GROUP BY t.typname; 