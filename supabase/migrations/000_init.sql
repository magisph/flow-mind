-- ============================================
-- Migration: 000_init
-- FlowMind: Setup inicial completo
-- ============================================
-- Este arquivo pode ser executado em uma única vez
-- para configurar todo o schema do FlowMind

-- ============================================
-- 1. EXTENSÃO UUID
-- ============================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 2. TABELA NOTES
-- ============================================
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT '',
    content TEXT NOT NULL DEFAULT '',
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    sync_status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (sync_status IN ('pending', 'synced', 'conflict')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_notes_user_id ON public.notes(user_id);
CREATE INDEX idx_notes_sync_status ON public.notes(sync_status);
CREATE INDEX idx_notes_is_favorite ON public.notes(is_favorite);
CREATE INDEX idx_notes_updated_at ON public.notes(updated_at DESC);
CREATE INDEX idx_notes_tags ON public.notes USING GIN(tags);

ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notes" ON public.notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notes" ON public.notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notes" ON public.notes FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own notes" ON public.notes FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 3. TABELA LINKS
-- ============================================
CREATE TABLE IF NOT EXISTS public.links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    title TEXT NOT NULL DEFAULT '',
    description TEXT DEFAULT NULL,
    thumbnail TEXT DEFAULT NULL,
    favicon TEXT DEFAULT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    sync_status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (sync_status IN ('pending', 'synced', 'conflict')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_links_user_id ON public.links(user_id);
CREATE INDEX idx_links_sync_status ON public.links(sync_status);
CREATE INDEX idx_links_is_favorite ON public.links(is_favorite);
CREATE INDEX idx_links_updated_at ON public.links(updated_at DESC);
CREATE INDEX idx_links_tags ON public.links USING GIN(tags);
CREATE INDEX idx_links_url ON public.links(url);

ALTER TABLE public.links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own links" ON public.links FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own links" ON public.links FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own links" ON public.links FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own links" ON public.links FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. TABELA FILES
-- ============================================
CREATE TABLE IF NOT EXISTS public.files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    size BIGINT NOT NULL,
    local_path TEXT DEFAULT NULL,
    cloud_path TEXT DEFAULT NULL,
    tags TEXT[] NOT NULL DEFAULT '{}',
    mime_type TEXT DEFAULT NULL,
    sync_status VARCHAR(20) NOT NULL DEFAULT 'pending' 
        CHECK (sync_status IN ('pending', 'synced', 'conflict')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT positive_size CHECK (size >= 0)
);

CREATE INDEX idx_files_user_id ON public.files(user_id);
CREATE INDEX idx_files_sync_status ON public.files(sync_status);
CREATE INDEX idx_files_type ON public.files(type);
CREATE INDEX idx_files_updated_at ON public.files(updated_at DESC);
CREATE INDEX idx_files_tags ON public.files USING GIN(tags);
CREATE INDEX idx_files_cloud_path ON public.files(cloud_path) WHERE cloud_path IS NOT NULL;

ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own files" ON public.files FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own files" ON public.files FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own files" ON public.files FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own files" ON public.files FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 5. TRIGGER updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS set_notes_updated_at ON public.notes;
CREATE TRIGGER set_notes_updated_at BEFORE UPDATE ON public.notes
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_links_updated_at ON public.links;
CREATE TRIGGER set_links_updated_at BEFORE UPDATE ON public.links
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_files_updated_at ON public.files;
CREATE TRIGGER set_files_updated_at BEFORE UPDATE ON public.files
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================
-- 6. FUNÇÕES AUXILIARES DE SYNC
-- ============================================

-- Função: Listar pendências
CREATE OR REPLACE FUNCTION public.get_pending_sync(p_user_id UUID, p_table_name TEXT DEFAULT NULL)
RETURNS TABLE (table_name TEXT, item_id UUID, sync_status VARCHAR(20), updated_at TIMESTAMPTZ) AS $$
BEGIN
    IF p_table_name IS NULL OR p_table_name = 'notes' THEN
        RETURN QUERY
        SELECT 'notes'::TEXT, n.id, n.sync_status, n.updated_at
        FROM public.notes n WHERE n.user_id = p_user_id AND n.sync_status != 'synced';
    END IF;
    IF p_table_name IS NULL OR p_table_name = 'links' THEN
        RETURN QUERY
        SELECT 'links'::TEXT, l.id, l.sync_status, l.updated_at
        FROM public.links l WHERE l.user_id = p_user_id AND l.sync_status != 'synced';
    END IF;
    IF p_table_name IS NULL OR p_table_name = 'files' THEN
        RETURN QUERY
        SELECT 'files'::TEXT, f.id, f.sync_status, f.updated_at
        FROM public.files f WHERE f.user_id = p_user_id AND f.sync_status != 'synced';
    END IF;
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: Marcar como sincronizado
CREATE OR REPLACE FUNCTION public.mark_as_synced(p_table_name TEXT, p_item_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE v_updated INT;
BEGIN
    CASE p_table_name
        WHEN 'notes' THEN UPDATE public.notes SET sync_status = 'synced' WHERE id = p_item_id AND user_id = p_user_id; GET DIAGNOSTICS v_updated = ROW_COUNT;
        WHEN 'links' THEN UPDATE public.links SET sync_status = 'synced' WHERE id = p_item_id AND user_id = p_user_id; GET DIAGNOSTICS v_updated = ROW_COUNT;
        WHEN 'files' THEN UPDATE public.files SET sync_status = 'synced' WHERE id = p_item_id AND user_id = p_user_id; GET DIAGNOSTICS v_updated = ROW_COUNT;
        ELSE RAISE EXCEPTION 'Tabela desconhecida: %', p_table_name;
    END CASE;
    RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: Resolver conflito
CREATE OR REPLACE FUNCTION public.resolve_conflict(p_table_name TEXT, p_item_id UUID, p_user_id UUID, p_use_server_version BOOLEAN DEFAULT TRUE)
RETURNS BOOLEAN AS $$
DECLARE v_updated INT;
BEGIN
    CASE p_table_name
        WHEN 'notes' THEN UPDATE public.notes SET sync_status = 'synced' WHERE id = p_item_id AND user_id = p_user_id AND sync_status = 'conflict'; GET DIAGNOSTICS v_updated = ROW_COUNT;
        WHEN 'links' THEN UPDATE public.links SET sync_status = 'synced' WHERE id = p_item_id AND user_id = p_user_id AND sync_status = 'conflict'; GET DIAGNOSTICS v_updated = ROW_COUNT;
        WHEN 'files' THEN UPDATE public.files SET sync_status = 'synced' WHERE id = p_item_id AND user_id = p_user_id AND sync_status = 'conflict'; GET DIAGNOSTICS v_updated = ROW_COUNT;
        ELSE RAISE EXCEPTION 'Tabela desconhecida: %', p_table_name;
    END CASE;
    RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função: Timestamp última sync
CREATE OR REPLACE FUNCTION public.get_last_sync_timestamp(p_user_id UUID)
RETURNS TABLE (table_name TEXT, last_sync TIMESTAMPTZ) AS $$
BEGIN
    RETURN QUERY
    SELECT 'notes'::TEXT, MAX(updated_at) FROM public.notes WHERE user_id = p_user_id AND sync_status = 'synced'
    UNION ALL
    SELECT 'links'::TEXT, MAX(updated_at) FROM public.links WHERE user_id = p_user_id AND sync_status = 'synced'
    UNION ALL
    SELECT 'files'::TEXT, MAX(updated_at) FROM public.files WHERE user_id = p_user_id AND sync_status = 'synced';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- FIM
-- ============================================
SELECT '✅ FlowMind schema criado com sucesso em ' || NOW() AS status;
