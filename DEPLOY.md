# 🚀 Guia de Deploy na Vercel

## 📋 Pré-requisitos

1. **Conta na Vercel** - [vercel.com](https://vercel.com)
2. **Conta no Supabase** - [supabase.com](https://supabase.com)
3. **Projeto no Supabase** configurado com as tabelas

## 🔧 Configuração do Supabase

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Crie um novo projeto
3. Anote a URL e a chave anônima

### 2. Executar Migrações

Execute as migrações SQL no seu projeto Supabase:

```sql
-- Migração inicial (se ainda não executou)
-- Execute o arquivo: supabase/migrations/20250728170638_cool_jungle.sql

-- Adicionar categorias (nova migração)
ALTER TABLE products ADD COLUMN IF NOT EXISTS category text DEFAULT 'marmitas' CHECK (category IN ('marmitas', 'bebidas', 'sobremesas', 'acompanhamentos'));

UPDATE products SET category = 'marmitas' WHERE category IS NULL;

-- Inserir produtos de exemplo
INSERT INTO products (name, description, price, image_url, available, category) VALUES
  ('Refrigerante Coca-Cola 350ml', 'Refrigerante Coca-Cola gelado', 4.50, 'https://images.pexels.com/photos/1627763/pexels-photo-1627763.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'bebidas'),
  ('Pudim de Leite', 'Pudim de leite caseiro com calda de caramelo', 8.00, 'https://images.pexels.com/photos/162553/pexels-photo-162553.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'sobremesas'),
  ('Farofa de Bacon', 'Farofa temperada com bacon crocante', 4.00, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=500', true, 'acompanhamentos')
ON CONFLICT (name) DO NOTHING;
```

## 🚀 Deploy na Vercel

### Método 1: Deploy via GitHub (Recomendado)

1. **Conecte seu repositório**

   - Faça push do código para o GitHub
   - Conecte o repositório na Vercel

2. **Configure as variáveis de ambiente**

   - Vá para Settings > Environment Variables
   - Adicione:
     ```
     VITE_SUPABASE_URL=sua_url_do_supabase
     VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
     ```

3. **Deploy automático**
   - A Vercel detectará automaticamente que é um projeto Vite
   - O deploy acontecerá automaticamente

### Método 2: Deploy via CLI

1. **Instale a CLI da Vercel**

   ```bash
   npm i -g vercel
   ```

2. **Faça login**

   ```bash
   vercel login
   ```

3. **Configure as variáveis de ambiente**

   ```bash
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

## 🔧 Configurações Importantes

### 1. Variáveis de Ambiente

Certifique-se de configurar no painel da Vercel:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### 2. Build Settings

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 3. Domínio Customizado (Opcional)

- Vá para Settings > Domains
- Adicione seu domínio customizado

## 🐛 Solução de Problemas

### Erro de Build

```bash
# Teste localmente antes do deploy
npm run build
```

### Erro de Variáveis de Ambiente

- Verifique se as variáveis estão configuradas corretamente
- Reinicie o deploy após adicionar variáveis

### Erro de CORS

- Configure as URLs permitidas no Supabase
- Adicione seu domínio da Vercel na lista de URLs permitidas

### Erro de Roteamento

- O arquivo `vercel.json` já está configurado para SPA
- Todas as rotas redirecionam para `index.html`

## 📱 Teste Pós-Deploy

1. **Teste a aplicação principal**

   - Verifique se os produtos carregam
   - Teste o carrinho de compras

2. **Teste a área administrativa**

   - Acesse: `seu-dominio.vercel.app/admin`
   - Login: `admin@demo.com` / `demo123`

3. **Teste as categorias**
   - Verifique se os filtros funcionam
   - Teste a adição de produtos

## 🔄 Atualizações

Para atualizar o deploy:

1. Faça push para o GitHub (deploy automático)
2. Ou use: `vercel --prod`

## 📞 Suporte

Se encontrar problemas:

1. Verifique os logs na Vercel
2. Teste localmente primeiro
3. Verifique as variáveis de ambiente
4. Consulte a documentação da Vercel
