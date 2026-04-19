-- ============================================
-- Migration: 005_create_storage_bucket
-- FlowMind: Storage bucket para arquivos de usuários
-- ============================================

-- Nota: Buckets de storage devem ser criados via API ou dashboard
-- Este arquivo documenta a configuração necessária

/*
 * INSTRUÇÕES PARA CRIAÇÃO DO BUCKET VIA DASHBOARD OU API:
 * 
 * 1. Acesse o Dashboard do Supabase
 * 2. Vá em Storage > Buckets
 * 3. Clique em "New Bucket"
 * 4. Configure:
 *    - Name: user-files
 *    - Public: FALSE (privado por padrão)
 *    - File size limit: 50MB (recomendado para mobile)
 *    - Allowed MIME types: * (ou restrinja conforme necessidade)
 */

-- SQL para configuração do bucket via SQL (se tiver permissões admin):
-- INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
-- VALUES ('user-files', 'user-files', false, 52428800, NULL);

-- Políticas RLS para o bucket user-files

-- Política: Usuários podem fazer upload de arquivos na pasta própria
-- O caminho deve seguir o padrão: {user_id}/{file_id}

/*
 * CRIAR VIA DASHBOARD OU API:
 * 
 * Policy 1: Allow authenticated uploads to own folder
 * Name: "Users can upload to own folder"
 * Allowed operation: INSERT
 * Target: user-files
 * Define condition: ((storage.foldername(name))[1] = auth.uid()::text)
 * 
 * Policy 2: Allow reading own files
 * Name: "Users can read own files"
 * Allowed operation: SELECT
 * Target: user-files
 * Define condition: ((storage.foldername(name))[1] = auth.uid()::text)
 * 
 * Policy 3: Allow updating own files
 * Name: "Users can update own files"
 * Allowed operation: UPDATE
 * Target: user-files
 * Define condition: ((storage.foldername(name))[1] = auth.uid()::text)
 * 
 * Policy 4: Allow deleting own files
 * Name: "Users can delete own files"
 * Allowed operation: DELETE
 * Target: user-files
 * Define condition: ((storage.foldername(name))[1] = auth.uid()::text)
 */

-- ============================================
-- Configuração via SQL (requer roles apropriadas)
-- ============================================

-- Criar bucket se não existir (via API storage)
-- NOTA: Executar via Supabase client ou dashboard
/*
do $$
begin
    -- Verificar se bucket existe
    if not exists (select 1 from storage.buckets where id = 'user-files') then
        insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        values ('user-files', 'user-files', false, 52428800, null);
    end if;
end $$;
*/

-- Políticas de Storage via SQL (executar no SQL Editor do Supabase)
/*
-- Upload policy
CREATE POLICY "Users can upload to own folder" 
    ON storage.objects 
    FOR INSERT 
    TO authenticated 
    WITH CHECK (
        bucket_id = 'user-files' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Select policy  
CREATE POLICY "Users can read own files" 
    ON storage.objects 
    FOR SELECT 
    TO authenticated 
    USING (
        bucket_id = 'user-files' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Update policy
CREATE POLICY "Users can update own files" 
    ON storage.objects 
    FOR UPDATE 
    TO authenticated 
    USING (
        bucket_id = 'user-files' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Delete policy
CREATE POLICY "Users can delete own files" 
    ON storage.objects 
    FOR DELETE 
    TO authenticated 
    USING (
        bucket_id = 'user-files' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );
*/
