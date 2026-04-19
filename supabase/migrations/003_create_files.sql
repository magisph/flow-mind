-- ============================================
-- Migration: 003_create_files
-- FlowMind: Tabela de Arquivos com RLS
-- ============================================

-- Criar tabela files
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Campos da aplicação
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size BIGINT NOT NULL,
    
    -- Caminhos de armazenamento
    local_path TEXT DEFAULT NULL,  -- Caminho local no IndexedDB (para offline)
    cloud_path TEXT DEFAULT NULL,  -- Caminho no storage do Supabase
    
    -- Metadados
    tags TEXT[] NOT NULL DEFAULT '{}',
    mime_type TEXT DEFAULT NULL,
    
    -- Sincronização
    sync_status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (sync_status IN ('pending', 'synced', 'conflict')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT positive_size CHECK (size >= 0)
);

-- Comentários documentando as colunas
COMMENT ON TABLE public.files IS 'Arquivos dos usuários do FlowMind';
COMMENT ON COLUMN public.files.user_id IS 'ID do usuário autenticado (auth.users)';
COMMENT ON COLUMN public.files.name IS 'Nome original do arquivo';
COMMENT ON COLUMN public.files.type IS 'Tipo/categoria do arquivo (documento, imagem, etc)';
COMMENT ON COLUMN public.files.size IS 'Tamanho em bytes';
COMMENT ON COLUMN public.files.local_path IS 'Referência ao IndexedDB local';
COMMENT ON COLUMN public.files.cloud_path IS 'Caminho no bucket do Supabase Storage';
COMMENT ON COLUMN public.files.mime_type IS 'MIME type do arquivo';
COMMENT ON COLUMN public.files.sync_status IS 'Estado de sincronização: pending, synced, conflict';

-- Índices para queries comuns
CREATE INDEX idx_files_user_id ON public.files(user_id);
CREATE INDEX idx_files_sync_status ON public.files(sync_status);
CREATE INDEX idx_files_type ON public.files(type);
CREATE INDEX idx_files_updated_at ON public.files(updated_at DESC);
CREATE INDEX idx_files_tags ON public.files USING GIN(tags);
CREATE INDEX idx_files_cloud_path ON public.files(cloud_path) WHERE cloud_path IS NOT NULL;

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só podem ver seus próprios arquivos
CREATE POLICY "Users can view own files" 
    ON public.files 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Política: Usuários só podem inserir arquivos próprios
CREATE POLICY "Users can insert own files" 
    ON public.files 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Política: Usuários só podem atualizar arquivos próprios
CREATE POLICY "Users can update own files" 
    ON public.files 
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política: Usuários só podem deletar arquivos próprios
CREATE POLICY "Users can delete own files" 
    ON public.files 
    FOR DELETE 
    USING (auth.uid() = user_id);
