# 🔧 Solução para Problema de Criação de Produtos

## 🚨 Problema Identificado

Os produtos não estão sendo criados no banco de dados nem aparecendo no cardápio.

## 🔍 Possíveis Causas

### 1. **Migrações não aplicadas**

- O campo `stock` foi adicionado ao tipo TypeScript mas não existe na tabela
- As políticas de segurança podem estar bloqueando inserções

### 2. **Variáveis de ambiente**

- Arquivo `.env` pode não estar configurado
- Chaves do Supabase podem estar incorretas

### 3. **Autenticação**

- Usuário pode não estar autenticado
- Políticas de segurança podem estar muito restritivas

## 🛠️ Soluções

### **Passo 1: Aplicar Migrações**

```bash
# Instalar Supabase CLI (se não tiver)
npm install -g supabase

# Aplicar migrações
supabase db push
```

### **Passo 2: Verificar Variáveis de Ambiente**

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_SUPABASE_URL=https://iwcnryrnwatbfjwyqcrn.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Y25yeXJud2F0YmZqd3lxY3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MjI4NDAsImV4cCI6MjA2OTI5ODg0MH0.jfKnZhuQChEUBTVYVu3Ms9J0dRZ7DtZlcF47XlrzkD0
```

### **Passo 3: Testar no Painel Admin**

1. Acesse a área administrativa
2. Vá para a seção "Produtos"
3. Clique em "Testar Conexão" para verificar se está funcionando
4. Clique em "Verificar Estrutura" para testar a inserção

### **Passo 4: Verificar Logs**

Abra o console do navegador (F12) e verifique:

- Se há erros de conexão
- Se as variáveis de ambiente estão carregadas
- Se o usuário está autenticado

## 🔧 Migrações Criadas

### **20250728172026_add_stock.sql**

- Adiciona campo `stock` à tabela `products`

### **20250728172027_fix_policies.sql**

- Corrige políticas de segurança para permitir inserção
- Permite usuários autenticados gerenciar produtos

## 📋 Checklist de Verificação

- [ ] Migrações aplicadas no Supabase
- [ ] Arquivo `.env` criado com as chaves corretas
- [ ] Usuário logado na área administrativa
- [ ] Teste de conexão passou
- [ ] Teste de estrutura passou
- [ ] Produtos aparecem na lista
- [ ] Criação de novos produtos funciona

## 🆘 Se ainda não funcionar

1. **Verifique o painel do Supabase**:

   - Vá para https://supabase.com
   - Acesse seu projeto
   - Verifique se as tabelas existem
   - Verifique se as políticas estão aplicadas

2. **Verifique os logs**:

   - Console do navegador
   - Logs do Supabase no painel

3. **Teste manual**:
   - Tente inserir um produto diretamente no painel do Supabase
   - Verifique se há erros de permissão

## 📞 Suporte

Se o problema persistir, verifique:

- Status do Supabase (https://status.supabase.com)
- Documentação do Supabase
- Logs detalhados no console do navegador
