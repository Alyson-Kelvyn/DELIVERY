# 📦 Estoque no Cardápio

## 🎯 Nova Funcionalidade

Implementamos a exibição da quantidade de estoque no cardápio e validação para não permitir comprar mais do que o estoque disponível.

## ✨ Características

### **1. Exibição Visual do Estoque**

- **Badge no card**: Mostra quantidade disponível no canto superior direito
- **Design limpo**: Sem informações extras de estoque
- **Cores intuitivas**: Verde (bom), laranja (baixo), vermelho (zero)

### **2. Validação de Compra**

- **Limite automático**: Não permite adicionar mais do que o estoque
- **Botão desabilitado**: Quando não há estoque ou limite atingido
- **Feedback visual**: Botões ficam cinza quando não podem ser usados
- **Texto dinâmico**: "Sem estoque" quando não há disponibilidade

### **3. Filtro Automático**

- **Produtos ocultos**: Produtos com estoque zero não aparecem no cardápio
- **Controle de estoque**: Só produtos com estoque > 0 ou sem controle
- **Disponibilidade**: Mantém produtos disponíveis mas sem estoque

## 🎨 Design Visual

### **Badge de Estoque**

```
┌─────────────────────────────────┐
│ 🥘 Marmita              📦 15 │
│ ┌─────────────────────────────┐ │
│ │ Imagem do produto          │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### **Informação de Estoque**

```
┌─────────────────────────────────┐
│ Marmita de Picanha             │
│ Descrição do produto...        │
│                                 │
│ R$ 18,90    [+ Adicionar]      │
└─────────────────────────────────┘
```

**Badge no canto superior direito:**

```
┌─────────────────────────────────┐
│ 🥘 Marmita              📦 15 │
│ ┌─────────────────────────────┐ │
│ │ Imagem do produto          │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘
```

### **Estados dos Botões**

```
┌─────────────────────────────────┐
│ Estoque: Sem estoque           │
│                                 │
│ R$ 18,90    [Sem estoque]      │ ← Cinza, desabilitado
└─────────────────────────────────┘
```

## 🔧 Implementação Técnica

### **Verificação de Estoque**

```typescript
const hasStockControl = product.stock !== null && product.stock !== undefined;
const availableStock = hasStockControl ? product.stock : null;
const canAddMore =
  !hasStockControl || (availableStock !== null && quantity < availableStock);
```

### **Validação de Adição**

```typescript
const addToCart = () => {
  if (hasStockControl && availableStock !== null && availableStock <= 0) {
    return; // Não permitir adicionar se não há estoque
  }
  dispatch({ type: "ADD_ITEM", payload: product });
};
```

### **Validação de Quantidade**

```typescript
const updateQuantity = (newQuantity: number) => {
  if (
    hasStockControl &&
    availableStock !== null &&
    newQuantity > availableStock
  ) {
    return; // Não permitir adicionar mais do que o estoque
  }
  // ... resto da lógica
};
```

## 🎯 Estados do Estoque

### **Produto com Controle de Estoque**

- **Estoque > 5**: Verde, badge "15 un"
- **Estoque 1-5**: Laranja, badge "3 un"
- **Estoque = 0**: Vermelho, badge "0 un", botão desabilitado

### **Produto sem Controle de Estoque**

- **Sem badge**: Não mostra quantidade
- **Sem limite**: Pode adicionar quantas quiser
- **Sempre disponível**: Até ser marcado como indisponível

## 📱 Responsividade

### **Desktop**

- Badge no canto superior direito
- Informação completa de estoque
- Barra de progresso visível

### **Mobile**

- Badge adaptado para telas pequenas
- Informação compacta
- Botões touch-friendly

## 🎨 Cores e Estados

### **Cores do Estoque**

- **🟢 Verde**: Estoque > 5 unidades
- **🟠 Laranja**: Estoque 1-5 unidades
- **🔴 Vermelho**: Estoque = 0 unidades

### **Estados dos Botões**

- **Habilitado**: Fundo vermelho, texto branco
- **Desabilitado**: Fundo cinza, texto cinza
- **Sem estoque**: Texto "Sem estoque"

## 🔄 Fluxo de Funcionamento

### **1. Carregamento do Cardápio**

```
Sistema busca produtos
→ Filtra produtos disponíveis
→ Remove produtos com estoque zero
→ Exibe produtos restantes
```

### **2. Adição ao Carrinho**

```
Usuário clica "Adicionar"
→ Sistema verifica estoque
→ Se há estoque: adiciona ao carrinho
→ Se não há: botão desabilitado
```

### **3. Ajuste de Quantidade**

```
Usuário clica "+"
→ Sistema verifica se pode adicionar mais
→ Se pode: aumenta quantidade
→ Se não pode: botão desabilitado
```

## 🎯 Benefícios

### **Para o Cliente**

- **Transparência**: Sabe exatamente quanto estoque há
- **Previsibilidade**: Não tenta comprar produtos sem estoque
- **Confiança**: Vê que o sistema é confiável
- **Experiência**: Interface clara e intuitiva

### **Para o Negócio**

- **Controle**: Produtos sem estoque não aparecem
- **Precisão**: Clientes não tentam comprar o que não há
- **Profissionalismo**: Sistema parece mais robusto
- **Redução de conflitos**: Menos problemas de estoque

## 📋 Exemplos Práticos

### **Cenário 1: Produto com Estoque Alto**

```
Produto: Marmita de Picanha
Badge: 🟢 15 un (canto superior direito)
Ação: Cliente pode adicionar normalmente
```

### **Cenário 2: Produto com Estoque Baixo**

```
Produto: Refrigerante Coca-Cola
Badge: 🟠 3 un (canto superior direito)
Ação: Cliente vê alerta visual
```

### **Cenário 3: Produto sem Estoque**

```
Produto: Pudim de Leite
Badge: 🔴 0 un (canto superior direito)
Ação: Produto não aparece no cardápio
```

### **Cenário 4: Produto sem Controle**

```
Produto: Marmita de Linguiça
Estoque: null (sem controle)
Status: Sem informação de estoque
Ação: Cliente pode adicionar livremente
```

## 🆘 Solução de Problemas

### **Produto não aparece no cardápio**

- Verifique se está marcado como disponível
- Confirme se tem estoque > 0 (se tem controle)
- Verifique se não foi removido automaticamente

### **Botão desabilitado**

- Confirme se o produto tem controle de estoque
- Verifique se o estoque não é zero
- Teste se já atingiu o limite máximo

### **Estoque não atualiza**

- Verifique se o produto tem controle de estoque
- Confirme se o estoque foi atualizado no banco
- Recarregue a página para ver mudanças

## 🎯 Próximos Passos

### **Melhorias Possíveis**

- **Notificação de estoque baixo**: Alertar quando está acabando
- **Reserva de estoque**: Reservar estoque durante o pedido
- **Histórico de estoque**: Mostrar tendências
- **Previsão de reposição**: Informar quando será reposto

### **Integração**

- **Sincronização em tempo real**: Atualizar estoque instantaneamente
- **Notificações push**: Alertar sobre mudanças de estoque
- **Relatórios**: Estatísticas de produtos mais vendidos
- **Automação**: Reposição automática baseada em vendas
