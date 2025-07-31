#!/bin/bash

echo "Aplicando migração para adicionar status 'cancelado'..."

# Aplicar a migração no Supabase
supabase db push

echo "Migração aplicada com sucesso!"
echo "Status disponíveis agora: pendente, confirmado, entregue, cancelado" 