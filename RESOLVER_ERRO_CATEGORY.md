# 🔧 Resolver Erro: "Could not find the 'category' column"

## 🚨 Problema

O erro indica que a coluna `category` não existe na tabela `products` no Supabase.

## 🛠️ Solução Passo a Passo

### **Passo 1: Acessar o Painel do Supabase**

1. Vá para https://supabase.com
2. Faça login na sua conta
3. Acesse seu projeto `iwcnryrnwatbfjwyqcrn`

### **Passo 2: Executar Script SQL**

1. No painel do Supabase, clique em **"SQL Editor"** no menu lateral
2. Clique em **"New Query"**
3. **Tente primeiro o script simples:**
   - Copie e cole todo o conteúdo do arquivo `fix-database-simple.sql`
   - Clique em **"Run"**
4. **Se não funcionar, use o script completo:**
   - Copie e cole todo o conteúdo do arquivo `fix-database.sql`
   - Clique em **"Run"**

### **Passo 3: Verificar Resultados**

Após executar o script, você deve ver:

- ✅ Mensagem de sucesso
- ✅ Lista das colunas da tabela `products`
- ✅ Produto de teste sendo inserido e removido (script completo)

### **Passo 4: Testar no Aplicativo**

1. Volte para o aplicativo
2. Acesse a área administrativa
3. Vá para "Produtos"
4. Tente criar um novo produto

## 🔍 Verificação Manual

### **Verificar Estrutura da Tabela**

No SQL Editor do Supabase, execute:

```sql
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'products'
ORDER BY ordinal_position;
```

**Resultado esperado:**

```
column_name  | data_type    | is_nullable | column_default
-------------|--------------|-------------|----------------
id           | uuid         | NO          | gen_random_uuid()
name         | text         | NO          |
description  | text         | NO          |
price        | decimal      | NO          |
image_url    | text         | NO          |
available    | boolean      | YES         | true
category     | text         | YES         | 'marmitas'
stock        | integer      | YES         |
created_at   | timestamptz  | YES         | now()
```

### **Verificar Políticas**

Execute:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'products';
```

## 🆘 Se ainda não funcionar

### **Opção 1: Recriar Tabela**

Se o problema persistir, execute este script para recriar a tabela:

```sql
-- Backup dos dados existentes
CREATE TABLE products_backup AS SELECT * FROM products;

-- Dropar tabela atual
DROP TABLE products;

-- Recriar tabela com estrutura correta
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  image_url text NOT NULL,
  available boolean DEFAULT true,
  category text DEFAULT 'marmitas',
  stock integer,
  created_at timestamptz DEFAULT now()
);

-- Restaurar dados
INSERT INTO products SELECT * FROM products_backup;

-- Aplicar políticas
CREATE POLICY "Permitir tudo para produtos" ON products FOR ALL TO public USING (true) WITH CHECK (true);
```

### **Opção 2: Verificar Logs**

1. Abra o console do navegador (F12)
2. Vá para a aba "Console"
3. Tente criar um produto
4. Verifique se há erros específicos

## 📞 Suporte Adicional

Se o problema persistir:

1. Verifique se está no projeto correto do Supabase
2. Confirme se as variáveis de ambiente estão corretas
3. Tente limpar o cache do navegador
4. Verifique se há conflitos de políticas RLS

## ✅ Checklist Final

- [ ] Script SQL executado com sucesso
- [ ] Coluna `category` existe na tabela
- [ ] Coluna `stock` existe na tabela
- [ ] Políticas de segurança aplicadas
- [ ] Criação de produtos funciona
