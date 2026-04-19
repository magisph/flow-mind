-- ============================================
-- Seed: Dados de teste para FlowMind
-- ============================================
-- Nota: Este arquivo é para desenvolvimento/testes apenas
-- Não execute em produção!

-- Verificar se deve executar seed (apenas em modo dev)
-- Descomente a linha abaixo para executar
-- SELECT 'Seed executado em: ' || NOW();

/*
-- Exemplo de seed para usuário de teste
-- Substitua 'user-uuid-aqui' pelo UUID real do usuário Auth

-- Seed de notas
INSERT INTO public.notes (id, user_id, title, content, tags, is_favorite, sync_status, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'user-uuid-aqui', 'Ideia de projeto FlowMind', 
     'Uma app para capturar pensamentos rapidamente...', 
     ARRAY['flowmind', 'ideia'], true, 'synced', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    
    (gen_random_uuid(), 'user-uuid-aqui', 'Lista de compras', 
     '- Leite\n- Pão\n- Café\n- Ovos', 
     ARRAY['pessoal', 'compras'], false, 'synced', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    
    (gen_random_uuid(), 'user-uuid-aqui', 'Artigo sobre TDAH', 
     'Link: https://exemplo.com/artigo-tdah', 
     ARRAY['tdah', 'estudos', 'pendente'], false, 'pending', NOW(), NOW());

-- Seed de links
INSERT INTO public.links (id, user_id, url, title, description, tags, is_favorite, sync_status, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'user-uuid-aqui', 
     'https://www.supabase.com/', 
     'Supabase - Open Source Firebase Alternative',
     'Plataforma backend open-source com PostgreSQL',
     ARRAY['dev', 'backend', 'database'], true, 'synced', 
     NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),
    
    (gen_random_uuid(), 'user-uuid-aqui', 
     'https://dexie.org/', 
     'Dexie.js - IndexedDB Wrapper',
     'Wrapper elegante para IndexedDB',
     ARRAY['dev', 'frontend', 'offline'], false, 'synced', 
     NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day');

-- Seed de arquivos
INSERT INTO public.files (id, user_id, name, type, size, cloud_path, mime_type, tags, sync_status, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'user-uuid-aqui', 
     'referencia-design.pdf', 'documento', 2457600,
     'user-uuid-aqui/file-uuid.pdf',
     'application/pdf',
     ARRAY['design', 'referencia'], 'synced',
     NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),
    
    (gen_random_uuid(), 'user-uuid-aqui', 
     'logo-projeto.png', 'imagem', 512000,
     'user-uuid-aqui/logo.png',
     'image/png',
     ARRAY['design', 'assets'], 'synced',
     NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');
*/
