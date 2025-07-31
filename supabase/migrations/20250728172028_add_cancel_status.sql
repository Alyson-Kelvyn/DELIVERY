-- Adicionar status "cancelado" ao enum de status dos pedidos
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
    END IF;
END $$; 