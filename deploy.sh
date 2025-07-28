#!/bin/bash

echo "🚀 Iniciando deploy na Vercel..."

# Verificar se o build funciona
echo "📦 Testando build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build realizado com sucesso!"
else
    echo "❌ Erro no build. Verifique os erros acima."
    exit 1
fi

# Verificar se a CLI da Vercel está instalada
if ! command -v vercel &> /dev/null; then
    echo "📥 Instalando CLI da Vercel..."
    npm install -g vercel
fi

# Fazer deploy
echo "🚀 Fazendo deploy..."
vercel --prod

echo "✅ Deploy concluído!"
echo "🌐 Acesse sua aplicação no link fornecido acima" 