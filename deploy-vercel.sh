#!/bin/bash

echo "🚀 Iniciando deploy na Vercel..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para imprimir com cores
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar se o Node.js está instalado
if ! command -v node &> /dev/null; then
    print_error "Node.js não está instalado"
    exit 1
fi

print_status "Node.js encontrado: $(node --version)"

# Verificar se o npm está instalado
if ! command -v npm &> /dev/null; then
    print_error "npm não está instalado"
    exit 1
fi

print_status "npm encontrado: $(npm --version)"

# Limpar cache e node_modules se necessário
if [ "$1" = "--clean" ]; then
    print_warning "Limpando cache e reinstalando dependências..."
    rm -rf node_modules package-lock.json
    npm cache clean --force
fi

# Instalar dependências
print_status "Instalando dependências..."
npm install

if [ $? -ne 0 ]; then
    print_error "Falha ao instalar dependências"
    exit 1
fi

# Verificar se o build funciona
print_status "Testando build..."
npm run build

if [ $? -ne 0 ]; then
    print_error "Build falhou. Verifique os erros acima."
    exit 1
fi

print_status "Build realizado com sucesso!"

# Verificar se a CLI da Vercel está instalada
if ! command -v vercel &> /dev/null; then
    print_warning "CLI da Vercel não encontrada. Instalando..."
    npm install -g vercel
fi

# Verificar se está logado na Vercel
vercel whoami &> /dev/null
if [ $? -ne 0 ]; then
    print_warning "Faça login na Vercel primeiro:"
    echo "vercel login"
    exit 1
fi

# Fazer deploy
print_status "Fazendo deploy na Vercel..."
vercel --prod

if [ $? -eq 0 ]; then
    print_status "Deploy concluído com sucesso!"
    echo ""
    echo "🌐 Acesse sua aplicação no link fornecido acima"
    echo ""
    echo "📋 Próximos passos:"
    echo "1. Configure as variáveis de ambiente na Vercel:"
    echo "   - VITE_SUPABASE_URL=https://iwcnryrnwatbfjwyqcrn.supabase.co"
    echo "   - VITE_SUPABASE_ANON_KEY=sua_chave_aqui"
    echo "2. Teste a aplicação"
    echo "3. Teste a área administrativa: /admin"
else
    print_error "Deploy falhou. Verifique os erros acima."
    exit 1
fi