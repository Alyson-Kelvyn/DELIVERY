# 📦 Controle Automático de Estoque

## 🎯 Funcionalidade Implementada

Quando um produto tem controle de estoque ativo, ele fica automaticamente indisponível quando o estoque chega a zero.

## 🔄 Como Funciona

### **1. Verificação Automática**

- **Ao carregar produtos**: Sistema verifica produtos com estoque ≤ 0 e os marca como indisponíveis
- **Ao editar estoque**: Mudanças são aplicadas automaticamente
- **Trigger no banco**: Atualização automática via SQL trigger

### **2. Estados do Produto**

#### **✅ Disponível**

- Estoque > 0 OU produto sem controle de estoque
- Aparece no cardápio para clientes

#### **❌ Sem Estoque**

- Estoque = 0 E produto tem controle de estoque
- Não aparece no cardápio para clientes
- Status visual: "✗ Sem Estoque"

#### **❌ Indisponível**

- Produto marcado manualmente como indisponível
- Não aparece no cardápio para clientes
- Status visual: "✗ Indisponível"

### **3. Cores do Estoque**

- **🟢 Verde**: Estoque > 5 unidades
- **🟠 Laranja**: Estoque ≤ 5 unidades (baixo)
- **🔴 Vermelho**: Estoque = 0 unidades

## 🛠️ Como Usar

### **Editar Estoque**

1. Vá para **Produtos** na área administrativa
2. Encontre o produto com controle de estoque
3. Clique no botão **✏️** ao lado do estoque
4. Digite a nova quantidade
5. Clique **OK**

### **Comportamento Automático**

- **Estoque → 0**: Produto fica indisponível automaticamente
- **Estoque > 0**: Produto fica disponível automaticamente
- **Alertas**: Sistema avisa quando produto fica indisponível ou é reativado

## 📋 Scripts Disponíveis

### **auto-stock-trigger.sql**

- Cria trigger automático no banco de dados
- Atualiza disponibilidade automaticamente
- Testa funcionalidade completa

### **Executar no Supabase:**

1. Vá para SQL Editor
2. Cole o conteúdo de `auto-stock-trigger.sql`
3. Execute o script
4. Verifique se os testes passaram

## 🔍 Exemplos Práticos

### **Cenário 1: Produto com Estoque**

```
Produto: Marmita de Picanha
Estoque: 15 unidades
Status: ✅ Disponível
```

### **Cenário 2: Estoque Baixo**

```
Produto: Refrigerante Coca-Cola
Estoque: 3 unidades
Status: ✅ Disponível (mas com alerta laranja)
```

### **Cenário 3: Sem Estoque**

```
Produto: Pudim de Leite
Estoque: 0 unidades
Status: ❌ Sem Estoque (indisponível automaticamente)
```

### **Cenário 4: Estoque Reposto**

```
Produto: Pudim de Leite
Estoque: 0 → 10 unidades
Status: ✅ Disponível (reativado automaticamente)
```

## ⚙️ Configuração

### **Ativar Controle de Estoque**

1. Criar/editar produto
2. Marcar checkbox "Controle de Estoque"
3. Definir quantidade inicial
4. Salvar produto

### **Desativar Controle de Estoque**

1. Editar produto
2. Desmarcar checkbox "Controle de Estoque"
3. Salvar produto
4. Produto fica disponível até ser marcado manualmente

## 🎯 Benefícios

- **Automação**: Sem necessidade de controle manual
- **Precisão**: Produtos indisponíveis não aparecem para clientes
- **Flexibilidade**: Produtos podem ter ou não controle de estoque
- **Visibilidade**: Status claro e cores intuitivas
- **Reativação**: Produtos voltam automaticamente quando estoque é reposto

## 📞 Suporte

Se houver problemas:

1. Verifique se o trigger foi criado no banco
2. Confirme se o produto tem controle de estoque ativo
3. Teste a edição de estoque manualmente
4. Verifique os logs no console do navegador
