# 🔧 Soluções Consolidadas - Churrascaria

## 📋 Índice

1. [🚀 Deploy e Configuração](#-deploy-e-configuração)
2. [📦 Controle de Estoque](#-controle-de-estoque)
3. [🔔 Sistema de Notificações](#-sistema-de-notificações)
4. [🍽️ Cardápio e Produtos](#️-cardápio-e-produtos)
5. [📸 Upload de Imagens](#-upload-de-imagens)
6. [🛠️ Troubleshooting Geral](#️-troubleshooting-geral)
7. [📊 Produtos Mais Vendidos](#-produtos-mais-vendidos)
8. [🔧 Correções de Banco de Dados](#-correções-de-banco-de-dados)

---

## 🚀 Deploy e Configuração

### **Problema Mais Comum: Variáveis de Ambiente**

**90% dos problemas de deploy são causados por variáveis de ambiente não configuradas!**

#### ✅ **Solução Imediata:**

1. **Acesse o painel da Vercel**

   - Vá para [vercel.com](https://vercel.com)
   - Clique no seu projeto
   - Vá em **Settings > Environment Variables**

2. **Adicione as variáveis:**

   ```
   VITE_SUPABASE_URL = https://iwcnryrnwatbfjwyqcrn.supabase.co
   VITE_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Y25yeXJud2F0YmZqd3lxY3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MjI4NDAsImV4cCI6MjA2OTI5ODg0MH0.jfKnZhuQChEUBTVYVu3Ms9J0dRZ7DtZlcF47XlrzkD0
   ```

3. **Reinicie o deploy**
   - Vá em **Deployments**
   - Clique em **Redeploy** no último deploy

### **Outros Problemas Comuns:**

#### **1. CORS Error**

**Solução:** Configure CORS no Supabase

- Vá para Settings > API no Supabase
- Adicione seu domínio da Vercel: `https://seu-projeto.vercel.app`

#### **2. Build Failed**

**Solução:** Teste localmente primeiro

```bash
npm install
npm run build
```

#### **3. Page Not Found (404)**

**Solução:** O `vercel.json` já está configurado corretamente

### **Deploy Manual (Se necessário):**

```bash
# Instale CLI da Vercel
npm install -g vercel

# Login
vercel login

# Configure variáveis
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY

# Deploy
vercel --prod
```

---

## 📦 Controle de Estoque

### **Nova Funcionalidade: Estoque no Cardápio**

Implementamos a exibição da quantidade de estoque no cardápio e validação para não permitir comprar mais do que o estoque disponível.

#### **Características:**

1. **Exibição Visual do Estoque**

   - Badge no card: Mostra quantidade disponível no canto superior direito
   - Design limpo: Sem informações extras de estoque
   - Cores intuitivas: Verde (bom), laranja (baixo), vermelho (zero)

2. **Validação de Compra**

   - Limite automático: Não permite adicionar mais do que o estoque
   - Botão desabilitado: Quando não há estoque ou limite atingido
   - Feedback visual: Botões ficam cinza quando não podem ser usados
   - Texto dinâmico: "Sem estoque" quando não há disponibilidade

3. **Filtro Automático**
   - Produtos ocultos: Produtos com estoque zero não aparecem no cardápio
   - Controle de estoque: Só produtos com estoque > 0 ou sem controle
   - Disponibilidade: Mantém produtos disponíveis mas sem estoque

#### **Estados do Estoque:**

- **Produto com Controle de Estoque:**

  - Estoque > 5: Verde, badge "15 un"
  - Estoque 1-5: Laranja, badge "3 un"
  - Estoque = 0: Vermelho, badge "0 un", botão desabilitado

- **Produto sem Controle de Estoque:**
  - Sem badge: Não mostra quantidade
  - Sem limite: Pode adicionar quantas quiser
  - Sempre disponível: Até ser marcado como indisponível

#### **Implementação Técnica:**

```typescript
// Verificação de Estoque
const hasStockControl = product.stock !== null && product.stock !== undefined;
const availableStock = hasStockControl ? product.stock : null;
const canAddMore =
  !hasStockControl || (availableStock !== null && quantity < availableStock);

// Validação de Adição
const addToCart = () => {
  if (hasStockControl && availableStock !== null && availableStock <= 0) {
    return; // Não permitir adicionar se não há estoque
  }
  dispatch({ type: "ADD_ITEM", payload: product });
};
```

---

## 🔔 Sistema de Notificações

### **Nova Funcionalidade: Notificações Modernas**

Substituímos os `alerts` por um sistema de notificações moderno e elegante que aparece na tela.

#### **Características:**

1. **Design Moderno**

   - Posicionamento: Canto superior direito
   - Animações suaves: Slide-in e slide-out
   - Cores temáticas: Diferentes cores para cada tipo
   - Ícones intuitivos: Visual claro do tipo de mensagem

2. **Tipos de Notificação**

   - ✅ Success: Verde - Operações bem-sucedidas
   - ❌ Error: Vermelho - Erros e problemas
   - ⚠️ Warning: Amarelo - Avisos importantes
   - ℹ️ Info: Azul - Informações gerais

3. **Comportamento Inteligente**
   - Auto-dismiss: Desaparece automaticamente após 4 segundos
   - Fechamento manual: Botão X para fechar
   - Não intrusivo: Não bloqueia a interface
   - Responsivo: Funciona bem em mobile e desktop

#### **Implementação Técnica:**

```typescript
interface NotificationProps {
  message: string;
  type: "success" | "error" | "warning" | "info";
  isVisible: boolean;
  onClose: () => void;
  duration?: number;
}

// Estados no Products.tsx
const [notification, setNotification] = useState<{
  message: string;
  type: "success" | "error" | "warning" | "info";
  isVisible: boolean;
}>({
  message: "",
  type: "info",
  isVisible: false,
});

// Função para Mostrar Notificações
const showNotification = (
  message: string,
  type: "success" | "error" | "warning" | "info" = "info"
) => {
  setNotification({
    message,
    type,
    isVisible: true,
  });
};
```

#### **Casos de Uso:**

```typescript
// Estoque Reposto
showNotification(
  `Produto "${product.name}" foi reativado! Estoque reposto.`,
  "success"
);

// Estoque Esgotado
showNotification(
  `Produto "${product.name}" ficou indisponível por falta de estoque.`,
  "warning"
);

// Erro de Atualização
showNotification("Erro ao atualizar estoque: " + error.message, "error");
```

---

## 🍽️ Cardápio e Produtos

### **Problema: Produtos não aparecem no cardápio**

#### **Diagnóstico Passo a Passo:**

1. **Verificar Configuração**

   - Abra o console do navegador (F12)
   - Recarregue a página
   - Verifique se aparecem as mensagens:
     - ✅ "URL: ✅ Definida"
     - ✅ "Key: ✅ Definida"

2. **Testar Conexão**

   - Execute o script `test-connection.sql` no SQL Editor do Supabase
   - Verifique se a tabela existe e estrutura está correta

3. **Corrigir Estrutura**

   - Execute o script `fix-final.sql` no SQL Editor do Supabase
   - Verifique se o teste de inserção passou

4. **Testar no Aplicativo**
   - Volte para o aplicativo
   - Acesse a área administrativa
   - Vá para "Produtos"
   - Tente criar um novo produto

#### **Scripts Disponíveis:**

1. **test-connection.sql** - Testa se a tabela existe
2. **fix-final.sql** ⭐ **RECOMENDADO** - Corrige a estrutura da tabela
3. **recreate-table.sql** - Recria a tabela do zero
4. **fix-database-simple.sql** - Adiciona campos faltantes

#### **Checklist de Verificação:**

- [ ] Arquivo `.env` criado
- [ ] Variáveis de ambiente carregadas
- [ ] Console mostra "✅ Definida" para URL e Key
- [ ] Tabela `products` existe
- [ ] Coluna `category` existe
- [ ] Coluna `stock` existe
- [ ] **Campo `useStock` NÃO existe** (é apenas para UI)
- [ ] Políticas de segurança aplicadas

---

## 📸 Upload de Imagens

### **Problema: Imagens não são salvas permanentemente**

O sistema atual estava usando `URL.createObjectURL()` que cria URLs temporárias apenas para visualização, mas não salva as imagens permanentemente.

#### **Solução Implementada:**

1. **Configuração do Supabase Storage**

   - Criar bucket `products` no Supabase Storage
   - Configurar políticas de acesso
   - Configurar CORS para permitir upload

2. **Upload Real de Imagens**

   - Implementado upload para Supabase Storage
   - Geração de nomes únicos para arquivos
   - Obtenção de URLs públicas permanentes

3. **Melhorias na Interface**
   - Preview da imagem após upload
   - Indicador de progresso durante upload
   - Notificações de sucesso/erro
   - Botão desabilitado durante upload

#### **Configuração Necessária:**

1. **Criar Bucket no Supabase:**

   - Vá para Storage no Dashboard do Supabase
   - Clique em "New Bucket"
   - Nome: `products`
   - Marque como público

2. **Executar Script de Configuração:**

   ```sql
   -- Execute o script setup-storage.sql no SQL Editor
   ```

3. **Configurar CORS:**
   - Vá para Settings > API no Supabase
   - Adicione em CORS:
     - `http://localhost:5173` (desenvolvimento)
     - `https://seu-dominio.vercel.app` (produção)

#### **Funcionalidades Implementadas:**

- ✅ Upload real para Supabase Storage
- ✅ URLs permanentes para imagens
- ✅ Preview da imagem após upload
- ✅ Indicador de progresso
- ✅ Notificações de status
- ✅ Validação de tipos de arquivo
- ✅ Nomes únicos para evitar conflitos

#### **Código Implementado:**

```typescript
// Função de upload
const uploadImage = async (file: File): Promise<string> => {
  try {
    setUploadingImage(true);

    // Gerar nome único
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `product-images/${fileName}`;

    // Upload para Supabase Storage
    const { data, error } = await supabase.storage
      .from("products")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) throw error;

    // Obter URL pública
    const {
      data: { publicUrl },
    } = supabase.storage.from("products").getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    throw error;
  } finally {
    setUploadingImage(false);
  }
};
```

#### **Checklist de Verificação:**

- [ ] Bucket `products` criado no Supabase Storage
- [ ] Políticas de acesso configuradas
- [ ] CORS configurado para desenvolvimento e produção
- [ ] Upload de imagens funcionando
- [ ] Preview das imagens aparecendo
- [ ] URLs permanentes sendo geradas
- [ ] Notificações de status funcionando

---

## 🛠️ Troubleshooting Geral

### **Problemas Comuns e Soluções:**

#### **1. Erro: "Build failed"**

```bash
# Teste localmente
npm run build

# Verifique dependências
npm install

# Limpe cache
rm -rf node_modules package-lock.json
npm install
```

#### **2. Erro: "Environment variables not found"**

- Configure as variáveis na Vercel
- Reinicie o deploy após adicionar variáveis

#### **3. Erro: "Page not found" (404)**

- O arquivo `vercel.json` já está configurado
- Verifique se o arquivo está no repositório

#### **4. Erro: "CORS error"**

- Configure CORS no Supabase
- Adicione seu domínio da Vercel na lista de URLs permitidas

#### **5. Erro: "Module not found"**

```bash
# Verifique package.json
npm list

# Reinstale dependências
npm install

# Limpe cache
npm cache clean --force
```

### **Passos de Diagnóstico:**

1. **Teste Local**

   ```bash
   git clone seu-repositorio
   cd seu-repositorio
   npm install
   npm run build
   npm run dev
   ```

2. **Verifique Variáveis de Ambiente**

   ```bash
   echo "VITE_SUPABASE_URL=https://iwcnryrnwatbfjwyqcrn.supabase.co" > .env
   echo "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Y25yeXJud2F0YmZqd3lxY3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MjI4NDAsImV4cCI6MjA2OTI5ODg0MH0.jfKnZhuQChEUBTVYVu3Ms9J0dRZ7DtZlcF47XlrzkD0" >> .env
   ```

3. **Verifique Logs da Vercel**
   - Acesse o painel da Vercel
   - Vá para seu projeto
   - Clique em "Deployments"
   - Clique no deploy mais recente
   - Verifique os logs de build

### **Checklist de Verificação:**

- [ ] Build local funciona (`npm run build`)
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] CORS configurado no Supabase
- [ ] Arquivo `vercel.json` presente
- [ ] Todas as dependências no `package.json`
- [ ] TypeScript sem erros
- [ ] Logs da Vercel verificados

---

## 📊 Produtos Mais Vendidos

### **Funcionalidade: Relatório de Vendas**

Sistema para acompanhar e exibir os produtos mais vendidos do estabelecimento.

#### **Características:**

1. **Coleta de Dados**

   - Registra cada venda de produto
   - Conta quantidade vendida
   - Armazena data da venda

2. **Análise de Tendências**

   - Produtos mais populares
   - Períodos de maior venda
   - Estatísticas de consumo

3. **Relatórios Visuais**
   - Gráficos de vendas
   - Ranking de produtos
   - Histórico de vendas

#### **Implementação:**

```sql
-- Tabela de vendas
CREATE TABLE sales (
  id SERIAL PRIMARY KEY,
  product_id INTEGER REFERENCES products(id),
  quantity INTEGER NOT NULL,
  sale_date TIMESTAMP DEFAULT NOW()
);

-- Query para produtos mais vendidos
SELECT
  p.name,
  COUNT(s.id) as total_sales,
  SUM(s.quantity) as total_quantity
FROM products p
LEFT JOIN sales s ON p.id = s.product_id
GROUP BY p.id, p.name
ORDER BY total_quantity DESC;
```

---

## 🔧 Correções de Banco de Dados

### **Scripts de Correção Disponíveis:**

#### **1. fix-final.sql** ⭐ **PRINCIPAL**

- Corrige a estrutura da tabela
- Remove campo `useStock` (que causava erro)
- Aplica políticas corretas
- Testa inserção

#### **2. recreate-table.sql**

- Recria a tabela do zero
- Aplica estrutura correta
- Insere produtos de exemplo
- Configura políticas permissivas

#### **3. fix-database-simple.sql**

- Adiciona campos faltantes
- Corrige políticas
- Versão mais simples

#### **4. auto-stock-trigger.sql**

- Cria trigger para controle automático de estoque
- Atualiza disponibilidade baseada no estoque
- Mantém consistência dos dados

### **Comandos Úteis:**

#### **Verificar Estrutura da Tabela:**

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
```

#### **Verificar Políticas:**

```sql
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'products';
```

#### **Testar Inserção:**

```sql
INSERT INTO products (name, description, price, image_url, available, category, stock)
VALUES ('Teste', 'Descrição', 10.00, 'https://via.placeholder.com/300x200', true, 'marmitas', null);
```

---

## 🎯 Soluções por Problema

### **Erro: "Could not find the 'category' column"**

**Solução:** Execute `fix-final.sql`

### **Erro: "Could not find the 'useStock' column"**

**Solução:** Execute `fix-final.sql` (campo `useStock` é apenas para UI)

### **Erro: "Variáveis de ambiente não encontradas"**

**Solução:** Crie arquivo `.env` com as chaves do Supabase

### **Erro: "Política de segurança bloqueia inserção"**

**Solução:** Execute `fix-final.sql`

### **Erro: "Conexão falha"**

**Solução:**

1. Verifique se está no projeto correto
2. Confirme as chaves do Supabase
3. Teste com `test-connection.sql`

---

## 📞 Próximos Passos

1. **Execute o diagnóstico** (Passo 1 e 2)
2. **Execute `fix-final.sql`** (Passo 3)
3. **Teste no aplicativo** (Passo 4)
4. **Me informe o resultado**

## 🎯 Resultado Esperado

Após executar o `fix-final.sql`:

- ✅ Produtos aparecem na lista
- ✅ Criação de produtos funciona
- ✅ Controle de estoque disponível
- ✅ Todas as funcionalidades operacionais
- ✅ Sem erros de campos inexistentes

---

## 📋 Checklist Final

### **Configuração:**

- [ ] Arquivo `.env` criado
- [ ] Variáveis de ambiente carregadas
- [ ] Console mostra "✅ Definida" para URL e Key

### **Banco de Dados:**

- [ ] Tabela `products` existe
- [ ] Coluna `category` existe
- [ ] Coluna `stock` existe
- [ ] **Campo `useStock` NÃO existe** (é apenas para UI)
- [ ] Políticas de segurança aplicadas

### **Aplicação:**

- [ ] Conexão com Supabase funciona
- [ ] Produtos aparecem na lista
- [ ] Criação de produtos funciona
- [ ] Edição de produtos funciona
- [ ] Sistema de notificações funciona
- [ ] Controle de estoque funciona

### **Deploy:**

- [ ] Build local funciona (`npm run build`)
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] CORS configurado no Supabase
- [ ] Arquivo `vercel.json` presente
- [ ] Todas as dependências instaladas

---

**🎉 Com essas soluções, seu sistema de churrascaria estará funcionando perfeitamente!**
