# 🔍 Diagnóstico de Problemas de Deploy

## 🚨 Problemas Comuns e Soluções

### 1. **Erro: "Build failed"**

**Sintomas:**

- Build falha na Vercel
- Erros de TypeScript
- Dependências não encontradas

**Soluções:**

```bash
# Teste localmente
npm run build

# Verifique dependências
npm install

# Limpe cache
rm -rf node_modules package-lock.json
npm install
```

### 2. **Erro: "Environment variables not found"**

**Sintomas:**

- Aplicação não carrega
- Erros no console sobre Supabase
- Página em branco

**Soluções:**

1. **Configure as variáveis na Vercel:**

   - Vá para Settings > Environment Variables
   - Adicione:
     ```
     VITE_SUPABASE_URL=https://iwcnryrnwatbfjwyqcrn.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Y25yeXJud2F0YmZqd3lxY3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MjI4NDAsImV4cCI6MjA2OTI5ODg0MH0.jfKnZhuQChEUBTVYVu3Ms9J0dRZ7DtZlcF47XlrzkD0
     ```

2. **Reinicie o deploy após adicionar variáveis**

### 3. **Erro: "Page not found" (404)**

**Sintomas:**

- Rotas não funcionam
- `/admin` retorna 404
- Navegação quebra

**Soluções:**

- O arquivo `vercel.json` já está configurado
- Verifique se o arquivo está no repositório

### 4. **Erro: "CORS error"**

**Sintomas:**

- Erros no console do navegador
- Não consegue conectar ao Supabase
- Requisições bloqueadas

**Soluções:**

1. **Configure CORS no Supabase:**
   - Vá para Settings > API
   - Adicione seu domínio da Vercel na lista de URLs permitidas
   - Exemplo: `https://seu-projeto.vercel.app`

### 5. **Erro: "Module not found"**

**Sintomas:**

- Erros de importação
- Dependências faltando
- Build falha

**Soluções:**

```bash
# Verifique package.json
npm list

# Reinstale dependências
npm install

# Limpe cache
npm cache clean --force
```

## 🔧 Passos de Diagnóstico

### **Passo 1: Teste Local**

```bash
# Clone o repositório em uma pasta limpa
git clone seu-repositorio
cd seu-repositorio

# Instale dependências
npm install

# Teste o build
npm run build

# Teste localmente
npm run dev
```

### **Passo 2: Verifique Variáveis de Ambiente**

```bash
# Crie arquivo .env local
echo "VITE_SUPABASE_URL=https://iwcnryrnwatbfjwyqcrn.supabase.co" > .env
echo "VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml3Y25yeXJud2F0YmZqd3lxY3JuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3MjI4NDAsImV4cCI6MjA2OTI5ODg0MH0.jfKnZhuQChEUBTVYVu3Ms9J0dRZ7DtZlcF47XlrzkD0" >> .env
```

### **Passo 3: Verifique Logs da Vercel**

1. Acesse o painel da Vercel
2. Vá para seu projeto
3. Clique em "Deployments"
4. Clique no deploy mais recente
5. Verifique os logs de build

### **Passo 4: Teste Funcionalidades**

1. **Aplicação Principal:**

   - Carrega sem erros?
   - Produtos aparecem?
   - Carrinho funciona?

2. **Área Administrativa:**
   - Acesse: `seu-dominio.vercel.app/admin`
   - Login funciona?
   - Produtos carregam?

## 🚀 Deploy Manual

Se o deploy automático não funcionar:

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

## 📞 Logs de Erro Comuns

### **Build Error:**

```
Error: Cannot find module 'react'
```

**Solução:** `npm install`

### **Runtime Error:**

```
Uncaught ReferenceError: process is not defined
```

**Solução:** Verifique se está usando `import.meta.env`

### **CORS Error:**

```
Access to fetch at 'https://...' from origin 'https://...' has been blocked
```

**Solução:** Configure CORS no Supabase

## ✅ Checklist de Verificação

- [ ] Build local funciona (`npm run build`)
- [ ] Variáveis de ambiente configuradas na Vercel
- [ ] CORS configurado no Supabase
- [ ] Arquivo `vercel.json` presente
- [ ] Todas as dependências no `package.json`
- [ ] TypeScript sem erros
- [ ] Logs da Vercel verificados

## 🆘 Suporte

Se ainda houver problemas:

1. **Compartilhe os logs da Vercel**
2. **Teste localmente primeiro**
3. **Verifique o console do navegador**
4. **Teste em modo incógnito**

**🎯 O problema mais comum é a falta de variáveis de ambiente na Vercel!**
