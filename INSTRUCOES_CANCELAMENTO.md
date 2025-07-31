# 🔧 Instruções para Aplicar Status "Cancelado"

## ❌ Problema Atual

O erro `orders_status_check` indica que o banco de dados não aceita o status "cancelado" porque ele não foi adicionado ao enum `order_status`.

## ✅ Solução

### Passo 1: Acessar o Supabase Dashboard

1. Vá para [supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Acesse o projeto da Churrascaria

### Passo 2: Executar o Script SQL

1. No painel do Supabase, vá para **SQL Editor**
2. Clique em **New Query**
3. **Execute o script específico para a constraint**:

   - Copie e cole o conteúdo do arquivo `fix-constraint-only.sql`
   - Clique em **Run**
   - Este script corrige especificamente a constraint orders_status_check

4. **Execute o script de teste**:
   - Copie e cole o conteúdo do arquivo `test-cancel-order.sql`
   - Clique em **Run**
   - Este script verificará se tudo está funcionando

### Passo 3: Verificar se Funcionou

Após executar o script, você deve ver:

- Uma mensagem de sucesso no console
- Uma lista com todos os status: `pendente`, `confirmado`, `entregue`, `cancelado`

## 🎯 Resultado Esperado

Após aplicar a migração:

- ✅ Pedidos podem ser cancelados
- ✅ Status "cancelado" aparece no filtro
- ✅ Pedidos cancelados não têm mais opções de ação
- ✅ Interface mostra "❌ Cancelado" para pedidos cancelados

## 📁 Arquivos Relacionados

- `apply-cancel-status.sql` - Script para executar no Supabase
- `src/components/admin/Orders.tsx` - Interface administrativa
- `src/types/index.ts` - Tipos TypeScript

## 🚨 Se o Problema Persistir

Se ainda houver erro após executar o script:

1. Verifique se o script foi executado com sucesso
2. Recarregue a página da aplicação
3. Tente cancelar um pedido novamente
