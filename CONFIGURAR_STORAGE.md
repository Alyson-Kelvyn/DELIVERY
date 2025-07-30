# 📸 Configuração do Supabase Storage para Upload de Imagens

## 🚀 Passo a Passo

### **1. Criar Bucket no Supabase**

1. Acesse o [Dashboard do Supabase](https://supabase.com/dashboard)
2. Selecione seu projeto
3. Vá para **Storage** no menu lateral
4. Clique em **"New Bucket"**
5. Configure:
   - **Name**: `products`
   - **Public bucket**: ✅ Marque como público
   - **File size limit**: 50MB (ou o valor desejado)
6. Clique em **"Create bucket"**

### **2. Configurar Políticas de Acesso**

Execute este script no **SQL Editor** do Supabase:

```sql
-- Permitir upload de imagens para usuários autenticados
CREATE POLICY "Usuários autenticados podem fazer upload de imagens"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'products');

-- Permitir visualização pública das imagens
CREATE POLICY "Imagens são visíveis publicamente"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'products');

-- Permitir que usuários autenticados atualizem suas imagens
CREATE POLICY "Usuários autenticados podem atualizar imagens"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'products')
WITH CHECK (bucket_id = 'products');

-- Permitir que usuários autenticados deletem suas imagens
CREATE POLICY "Usuários autenticados podem deletar imagens"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'products');
```

### **3. Configurar CORS**

1. Vá para **Settings > API** no Dashboard
2. Na seção **CORS**, adicione:
   - `http://localhost:5173` (desenvolvimento)
   - `https://seu-dominio.vercel.app` (produção)
3. Clique em **"Save"**

### **4. Testar Upload**

1. Acesse a área administrativa do seu app
2. Vá para **Produtos**
3. Clique em **"Adicionar Produto"**
4. Selecione uma imagem
5. Verifique se:
   - ✅ Upload funciona
   - ✅ Preview aparece
   - ✅ Notificação de sucesso
   - ✅ Imagem salva permanentemente

## 🔧 Solução de Problemas

### **Erro: "Bucket not found"**

- Verifique se o bucket `products` foi criado
- Confirme o nome exato do bucket

### **Erro: "Policy violation"**

- Execute o script de políticas novamente
- Verifique se está logado como usuário autenticado

### **Erro: "CORS error"**

- Configure CORS no Supabase
- Adicione seu domínio na lista

### **Erro: "File too large"**

- Aumente o limite de tamanho do bucket
- Comprima a imagem antes do upload

## ✅ Checklist Final

- [ ] Bucket `products` criado
- [ ] Bucket marcado como público
- [ ] Políticas de acesso configuradas
- [ ] CORS configurado
- [ ] Upload funcionando
- [ ] Preview aparecendo
- [ ] URLs permanentes geradas

## 🎯 Resultado Esperado

Após a configuração:

- ✅ Imagens são salvas permanentemente no Supabase Storage
- ✅ URLs públicas são geradas automaticamente
- ✅ Preview das imagens funciona
- ✅ Upload com progresso e notificações
- ✅ Imagens acessíveis publicamente
