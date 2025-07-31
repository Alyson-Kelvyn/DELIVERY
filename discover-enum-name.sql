-- Script para descobrir o nome correto do enum de status
-- Execute este script no SQL Editor do Supabase

-- Verificar todos os tipos enum no banco
SELECT 
    t.typname as enum_name,
    e.enumlabel as enum_value
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typtype = 'e'
ORDER BY t.typname, e.enumsortorder;

-- Verificar a estrutura da tabela orders
SELECT 
    column_name,
    data_type,
    udt_name
FROM information_schema.columns 
WHERE table_name = 'orders' 
AND column_name = 'status';

-- Verificar constraints da tabela orders
SELECT 
    conname as constraint_name,
    pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'orders'::regclass; 