#!/bin/bash

echo "🔄 Aplicando migrações no Supabase..."

# Verificar se o Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI não encontrado. Instale com: npm install -g supabase"
    exit 1
fi

# Aplicar migrações
echo "📦 Aplicando migrações..."
supabase db push

echo "✅ Migrações aplicadas com sucesso!"
echo "🔗 Verifique o painel do Supabase para confirmar as mudanças."