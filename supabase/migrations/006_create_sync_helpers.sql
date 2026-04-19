-- ============================================
-- Migration: 006_create_sync_helpers
-- FlowMind: Funções auxiliares para sincronização
-- ============================================

-- ============================================
-- Função: Obter todos os itens pendentes de sync
-- ============================================
CREATE OR REPLACE FUNCTION public.get_pending_sync(p_user_id UUID, p_table_name TEXT DEFAULT NULL)
RETURNS TABLE (
    table_name TEXT,
    item_id UUID,
    sync_status VARCHAR(20),
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    -- Retornar notas pendentes
    IF p_table_name IS NULL OR p_table_name = 'notes' THEN
        RETURN QUERY
        SELECT 'notes'::TEXT, n.id, n.sync_status, n.updated_at
        FROM public.notes n
        WHERE n.user_id = p_user_id AND n.sync_status != 'synced';
    END IF;
    
    -- Retornar links pendentes
    IF p_table_name IS NULL OR p_table_name = 'links' THEN
        RETURN QUERY
        SELECT 'links'::TEXT, l.id, l.sync_status, l.updated_at
        FROM public.links l
        WHERE l.user_id = p_user_id AND l.sync_status != 'synced';
    END IF;
    
    -- Retornar files pendentes
    IF p_table_name IS NULL OR p_table_name = 'files' THEN
        RETURN QUERY
        SELECT 'files'::TEXT, f.id, f.sync_status, f.updated_at
        FROM public.files f
        WHERE f.user_id = p_user_id AND f.sync_status != 'synced';
    END IF;
    
    RETURN;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_pending_sync(UUID, TEXT) IS 
    'Retorna todos os itens pendentes de sincronização para um usuário';

-- ============================================
-- Função: Marcar item como sincronizado
-- ============================================
CREATE OR REPLACE FUNCTION public.mark_as_synced(
    p_table_name TEXT,
    p_item_id UUID,
    p_user_id UUID
)
RETURNS BOOLEAN AS $$
DECLARE
    v_updated INT;
BEGIN
    CASE p_table_name
        WHEN 'notes' THEN
            UPDATE public.notes 
            SET sync_status = 'synced'
            WHERE id = p_item_id AND user_id = p_user_id;
            GET DIAGNOSTICS v_updated = ROW_COUNT;
            
        WHEN 'links' THEN
            UPDATE public.links 
            SET sync_status = 'synced'
            WHERE id = p_item_id AND user_id = p_user_id;
            GET DIAGNOSTICS v_updated = ROW_COUNT;
            
        WHEN 'files' THEN
            UPDATE public.files 
            SET sync_status = 'synced'
            WHERE id = p_item_id AND user_id = p_user_id;
            GET DIAGNOSTICS v_updated = ROW_COUNT;
            
        ELSE
            RAISE EXCEPTION 'Tabela desconhecida: %', p_table_name;
    END CASE;
    
    RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.mark_as_synced(TEXT, UUID, UUID) IS 
    'Marca um item específico como sincronizado';

-- ============================================
-- Função: Resolução de conflitos (último vence)
-- ============================================
CREATE OR REPLACE FUNCTION public.resolve_conflict(
    p_table_name TEXT,
    p_item_id UUID,
    p_user_id UUID,
    p_use_server_version BOOLEAN DEFAULT TRUE
)
RETURNS BOOLEAN AS $$
DECLARE
    v_updated INT;
BEGIN
    -- Marca conflito como resolvido
    CASE p_table_name
        WHEN 'notes' THEN
            -- Se use_server_version = true, não faz nada (servidor já tem a versão)
            -- Se false, o cliente vai sobrescrever depois
            UPDATE public.notes 
            SET sync_status = 'synced'
            WHERE id = p_item_id 
              AND user_id = p_user_id 
              AND sync_status = 'conflict';
            GET DIAGNOSTICS v_updated = ROW_COUNT;
            
        WHEN 'links' THEN
            UPDATE public.links 
            SET sync_status = 'synced'
            WHERE id = p_item_id 
              AND user_id = p_user_id 
              AND sync_status = 'conflict';
            GET DIAGNOSTICS v_updated = ROW_COUNT;
            
        WHEN 'files' THEN
            UPDATE public.files 
            SET sync_status = 'synced'
            WHERE id = p_item_id 
              AND user_id = p_user_id 
              AND sync_status = 'conflict';
            GET DIAGNOSTICS v_updated = ROW_COUNT;
            
        ELSE
            RAISE EXCEPTION 'Tabela desconhecida: %', p_table_name;
    END CASE;
    
    RETURN v_updated > 0;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.resolve_conflict(TEXT, UUID, UUID, BOOLEAN) IS 
    'Marca um conflito como resolvido';

-- ============================================
-- Função: Obter timestamp de última sincronização
-- ============================================
CREATE OR REPLACE FUNCTION public.get_last_sync_timestamp(p_user_id UUID)
RETURNS TABLE (
    table_name TEXT,
    last_sync TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 'notes'::TEXT, MAX(updated_at)
    FROM public.notes 
    WHERE user_id = p_user_id AND sync_status = 'synced'
    
    UNION ALL
    
    SELECT 'links'::TEXT, MAX(updated_at)
    FROM public.links 
    WHERE user_id = p_user_id AND sync_status = 'synced'
    
    UNION ALL
    
    SELECT 'files'::TEXT, MAX(updated_at)
    FROM public.files 
    WHERE user_id = p_user_id AND sync_status = 'synced';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.get_last_sync_timestamp(UUID) IS 
    'Retorna o timestamp da última sincronização bem-sucedida por tabela';
