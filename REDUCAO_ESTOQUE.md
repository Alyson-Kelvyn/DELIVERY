# 📦 Redução Automática de Estoque

## 🎯 Funcionalidade Implementada

Quando um pedido é finalizado, o estoque dos produtos é automaticamente reduzido pela quantidade vendida.

## 🔄 Como Funciona

### **1. Verificação Prévia**

- **Antes de finalizar**: Sistema verifica se há estoque suficiente
- **Produtos sem controle**: Não são verificados (estoque = null)
- **Produtos com controle**: Devem ter estoque ≥ quantidade solicitada

### **2. Redução Automática**

- **Após finalizar pedido**: Estoque é reduzido automaticamente
- **Agrupamento**: Itens do mesmo produto são somados
- **Cálculo**: `novo_estoque = estoque_atual - quantidade_vendida`
- **Mínimo**: Estoque nunca fica negativo (mínimo = 0)

### **3. Logs Detalhados**

- **Console do navegador**: Mostra todas as operações
- **Produto por produto**: Log individual de cada redução
- **Status**: Sucesso ou erro para cada operação

## 🛠️ Fluxo Completo

### **1. Adicionar ao Carrinho**

```
Cliente adiciona 2x "Marmita de Picanha" (estoque: 15)
→ Estoque permanece 15 (ainda não vendido)
```

### **2. Finalizar Pedido**

```
Sistema verifica: 15 ≥ 2 ✅
Sistema reduz: 15 - 2 = 13
→ Estoque atualizado para 13
```

### **3. Produto Fica Indisponível**

```
Se estoque chegar a 0:
→ Produto fica indisponível automaticamente
→ Não aparece mais no cardápio
```

## 📋 Verificações Implementadas

### **Verificação de Estoque**

```typescript
// Antes de finalizar o pedido
const stockCheck = checkStockAvailability(state.items);
if (!stockCheck.available) {
  alert("Produto não tem estoque suficiente");
  return;
}
```

### **Redução de Estoque**

```typescript
// Após finalizar o pedido
await reduceStock(state.items);
// Reduz estoque de todos os produtos vendidos
```

### **Logs Informativos**

```
🔄 Reduzindo estoque dos produtos...
📦 Marmita de Picanha: 15 → 13 (2 vendidos)
✅ Estoque de "Marmita de Picanha" atualizado com sucesso
✅ Redução de estoque concluída!
```

## 🔍 Exemplos Práticos

### **Cenário 1: Pedido Normal**

```
Produto: Marmita de Picanha
Estoque inicial: 15
Quantidade pedida: 2
Estoque final: 13
Status: ✅ Disponível
```

### **Cenário 2: Estoque Baixo**

```
Produto: Refrigerante Coca-Cola
Estoque inicial: 3
Quantidade pedida: 2
Estoque final: 1
Status: ✅ Disponível (mas com alerta laranja)
```

### **Cenário 3: Estoque Esgota**

```
Produto: Pudim de Leite
Estoque inicial: 1
Quantidade pedida: 1
Estoque final: 0
Status: ❌ Sem Estoque (indisponível automaticamente)
```

### **Cenário 4: Estoque Insuficiente**

```
Produto: Marmita de Maminha
Estoque disponível: 2
Quantidade pedida: 5
Resultado: ❌ Pedido bloqueado
Mensagem: "Produto não tem estoque suficiente"
```

## ⚙️ Configuração

### **Produtos com Controle de Estoque**

- ✅ Estoque é reduzido automaticamente
- ✅ Verificação prévia de disponibilidade
- ✅ Fica indisponível quando estoque = 0

### **Produtos sem Controle de Estoque**

- ℹ️ Não há redução automática
- ℹ️ Não há verificação de disponibilidade
- ℹ️ Fica disponível até ser marcado manualmente

## 🎯 Benefícios

- **Precisão**: Estoque sempre atualizado
- **Automação**: Sem necessidade de controle manual
- **Segurança**: Verificação prévia evita vendas sem estoque
- **Transparência**: Logs detalhados de todas as operações
- **Flexibilidade**: Produtos podem ter ou não controle de estoque

## 📞 Teste da Funcionalidade

### **1. Criar Produto com Estoque**

1. Vá para Produtos na área administrativa
2. Crie um produto com controle de estoque
3. Defina estoque inicial (ex: 10)

### **2. Fazer Pedido**

1. Adicione o produto ao carrinho
2. Finalize o pedido
3. Verifique o console do navegador

### **3. Verificar Resultado**

1. Volte para Produtos
2. Verifique se o estoque foi reduzido
3. Se estoque = 0, verifique se ficou indisponível

## 🆘 Solução de Problemas

### **Produto não reduz estoque**

- Verifique se tem controle de estoque ativo
- Confirme se o pedido foi finalizado com sucesso
- Verifique logs no console do navegador

### **Erro ao reduzir estoque**

- Verifique conexão com Supabase
- Confirme se as políticas de segurança estão corretas
- Teste com o script `test-stock-reduction.sql`

### **Produto não fica indisponível**

- Execute o script `auto-stock-trigger.sql`
- Verifique se o trigger foi criado corretamente
- Teste manualmente no SQL Editor
