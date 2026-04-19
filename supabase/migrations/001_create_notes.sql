-- ============================================
-- Migration: 001_create_notes
-- FlowMind: Tabela de Notas com RLS
-- ============================================

-- Habilitar extensão UUID se não estiver habilitada
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Criar tabela notes
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Campos da aplicação
    title TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
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
COMMENT ON TABLE public.notes IS 'Notas dos usuários do FlowMind';
COMMENT ON COLUMN public.notes.user_id IS 'ID do usuário autenticado (auth.users)';
COMMENT ON COLUMN public.notes.tags IS 'Array de tags para organização';
COMMENT ON COLUMN public.notes.sync_status IS 'Estado de sincronização: pending, synced, conflict';

-- Índices para queries comuns
CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_sync_status ON public.notes(sync_status);
CREATE INDEX idx_notes_is_favorite ON public.notes(is_favorite);
CREATE INDEX idx_notes_updated_at ON public.notes(updated_at DESC);
CREATE INDEX idx_notes_tags ON public.notes USING GIN(tags);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

-- Política: Usuários só podem ver suas próprias notas
CREATE POLICY "Users can view own notes" 
    ON public.notes 
    FOR SELECT 
    USING (auth.uid() = user_id);

-- Política: Usuários só podem inserir notas próprias
CREATE POLICY "Users can insert own notes" 
    ON public.notes 
    FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

-- Política: Usuários só podem atualizar notas próprias
CREATE POLICY "Users can update own notes" 
    ON public.notes 
    FOR UPDATE 
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política: Usuários só podem deletar notas próprias
CREATE POLICY "Users can delete own notes" 
    ON public.notes 
    FOR DELETE 
    USING (auth.uid() = user_id);
