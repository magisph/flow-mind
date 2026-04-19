-- ============================================
-- Migration: 002_create_links
-- FlowMind: Tabela de Links com RLS
-- ============================================

-- Criar tabela links
CREATE TABLE IF NOT EXISTS public.links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Campos da aplicação
    url TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    description TEXT DEFAULT NULL,
    thumbnail TEXT DEFAULT NULL,
    favicon TEXT DEFAULT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    
    -- Sincronização
    sync_status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (sync_status IN ('pending', 'synced', 'conflict')),
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Comentários documentando as colunas
COMMENT ON TABLE public.links IS 'Links salvos dos usuários do FlowMind';
COMMENT ON COLUMN public.links.user_id IS 'ID do usuário autenticado (auth.users)';
COMMENT ON COLUMN public.links.url IS 'URL do link (obrigatório)';
COMMENT ON COLUMN public.links.thumbnail IS 'URL da imagem thumbnail';
COMMENT ON COLUMN public.links.favicon IS 'URL do favicon do site';
COMMENT ON COLUMN public.links.sync_status IS 'Estado de sincronização: pending, synced, conflict';

-- Índices para queries comuns
CREATE INDEX idx_links_user_id ON public.links(user_id);
CREATE INDEX idx_links_sync_status ON public.links(sync_status);
CREATE INDEX idx_links_is_favorite ON public.links(is_favorite);
CREATE INDEX idx_links_updated_at ON public.links(updated_at DESC);
CREATE INDEX idx_links_tags ON public.links USING GIN(tags);
CREATE INDEX idx_links_url ON public.links(url);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só podem ver seus próprios links
CREATE POLICY "Users can view own links" 
    ON public.links 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Política: Usuários só podem inserir links próprios
CREATE POLICY "Users can insert own links" 
    ON public.links 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Política: Usuários só podem atualizar links próprios
CREATE POLICY "Users can update own links" 
    ON public.links 
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política: Usuários só podem deletar links próprios
CREATE POLICY "Users can delete own links" 
    ON public.links 
    FOR DELETE 
    USING (auth.uid() = user_id);
