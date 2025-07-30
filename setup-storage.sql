-- Script para configurar o Supabase Storage para upload de imagens de produtos
-- Execute este script no SQL Editor do Supabase

-- 1. Criar bucket para imagens de produtos (se não existir)
-- Nota: Buckets devem ser criados via Dashboard do Supabase ou API
-- Vá para Storage > New Bucket e crie um bucket chamado 'products'

-- 2. Configurar políticas de acesso ao bucket
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

-- 3. Configurar CORS para permitir upload de imagens
-- Isso deve ser feito via Dashboard do Supabase ou API
-- Vá para Settings > API > CORS e adicione:
-- - http://localhost:5173 (para desenvolvimento)
-- - https://seu-dominio.vercel.app (para produção)

-- 4. Verificar se o bucket existe
SELECT name, public FROM storage.buckets WHERE name = 'products';

-- 5. Listar objetos no bucket (se houver)
SELECT name, created_at FROM storage.objects WHERE bucket_id = 'products' ORDER BY created_at DESC; 