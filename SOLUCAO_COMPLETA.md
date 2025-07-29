# 🔧 Solução Completa para Problema de Produtos

## 🚨 Problema Atual

Os produtos não estão sendo criados no banco de dados nem aparecendo no cardápio.

## 🔍 Diagnóstico Passo a Passo

### **Passo 1: Verificar Configuração**

1. Abra o console do navegador (F12)
2. Recarregue a página
3. Verifique se aparecem as mensagens:
   - ✅ "URL: ✅ Definida"
   - ✅ "Key: ✅ Definida"

**Se aparecer "❌ Não definida":**

- Crie um arquivo `.env` na raiz do projeto
- Adicione as variáveis do `env.example`

### **Passo 2: Testar Conexão**

1. Execute o script `test-connection.sql` no SQL Editor do Supabase
2. Verifique se:
   - A tabela existe
   - A estrutura está correta
   - As políticas estão aplicadas

### **Passo 3: Corrigir Estrutura**

Execute o script `fix-final.sql` no SQL Editor do Supabase:

1. Vá para SQL Editor do Supabase
2. Cole o conteúdo de `fix-final.sql`
3. Execute o script
4. Verifique se o teste de inserção passou

### **Passo 4: Testar no Aplicativo**

1. Volte para o aplicativo
2. Acesse a área administrativa
3. Vá para "Produtos"
4. Tente criar um novo produto

## 🛠️ Scripts Disponíveis

### **1. test-connection.sql**

- Testa se a tabela existe
- Verifica estrutura atual
- Testa inserção simples
- Mostra políticas atuais

### **2. fix-final.sql** ⭐ **RECOMENDADO**

- Corrige a estrutura da tabela
- Remove campo `useStock` (que causava erro)
- Aplica políticas corretas
- Testa inserção

### **3. recreate-table.sql**

- Recria a tabela do zero
- Aplica estrutura correta
- Insere produtos de exemplo
- Configura políticas permissivas

### **4. fix-database-simple.sql**

- Adiciona campos faltantes
- Corrige políticas
- Versão mais simples

## 📋 Checklist de Verificação

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

## 🆘 Soluções por Problema

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

## 🔧 Comandos Úteis

### **Verificar Estrutura da Tabela:**

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
```

### **Verificar Políticas:**

```sql
SELECT policyname, cmd, roles
FROM pg_policies
WHERE tablename = 'products';
```

### **Testar Inserção:**

```sql
INSERT INTO products (name, description, price, image_url, available, category, stock)
VALUES ('Teste', 'Descrição', 10.00, 'https://via.placeholder.com/300x200', true, 'marmitas', null);
```

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
