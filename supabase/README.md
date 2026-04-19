# FlowMind - Supabase Schema

Este diretório contém as migrations e configurações do Supabase para o projeto FlowMind.

## 📁 Estrutura

```
supabase/
├── migrations/           # Migrations SQL executáveis
│   ├── 000_init.sql         # Setup completo (único arquivo)
│   ├── 001_create_notes.sql
│   ├── 002_create_links.sql
│   ├── 003_create_files.sql
│   ├── 004_create_updated_at_trigger.sql
│   ├── 005_create_storage_bucket.sql
│   └── 006_create_sync_helpers.sql
└── seed/
    └── seed.sql         # Dados de teste (opcional)
```

## 🚀 Setup

### Opção 1: Setup Completo (Recomendado)

Execute apenas o arquivo `000_init.sql` no SQL Editor do Supabase:

```sql
-- Copie o conteúdo de 000_init.sql e execute
```

### Opção 2: Passo a Passo

Execute as migrations em ordem (001, 002, 003...)

Via Dashboard SQL Editor ou via Supabase CLI:

```bash
# Instalar Supabase CLI se não tiver
npm install -g supabase

# Login
supabase login

# Executar migrations
supabase db reset              # Reset local
supabase db push               # Push para remoto
```

### 2. Configurar Storage Bucket

O bucket `user-files` deve ser criado via Dashboard:

1. Acesse **Storage → Buckets**
2. Clique em **New Bucket**
3. Configure:
   - **Nome**: `user-files`
   - **Public**: `FALSE` (privado)
   - **File size limit**: `50MB`

4. Criar políticas RLS no bucket:
   - Upload: `(storage.foldername(name))[1] = auth.uid()::text`
   - Select: `(storage.foldername(name))[1] = auth.uid()::text`
   - Update: `(storage.foldername(name))[1] = auth.uid()::text`
   - Delete: `(storage.foldername(name))[1] = auth.uid()::text`

## 📊 Schema

### Tabelas

| Tabela | Descrição | RLS |
|--------|-----------|-----|
| `notes` | Notas dos usuários | ✅ User isolado |
| `links` | Links salvos | ✅ User isolado |
| `files` | Metadados de arquivos | ✅ User isolado |

### Colunas Comuns

```sql
id UUID PRIMARY KEY
user_id UUID REFERENCES auth.users
sync_status VARCHAR(20) -- 'pending' | 'synced' | 'conflict'
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ  -- Atualizado via trigger
```

### Índices

Cada tabela possui índices para:
- `user_id` (filtragem por usuário)
- `sync_status` (filtragem de pendências)
- `updated_at` (ordenação por data)
- `tags` (GIN index para busca em array)

## 🔧 Funções Auxiliares

### `get_pending_sync(user_id, table_name?)`
Retorna todos os itens pendentes de sincronização.

```sql
SELECT * FROM get_pending_sync('user-uuid', 'notes');
-- ou para todas as tabelas:
SELECT * FROM get_pending_sync('user-uuid', null);
```

### `mark_as_synced(table_name, item_id, user_id)`
Marca um item específico como sincronizado.

### `resolve_conflict(table_name, item_id, user_id, use_server_version)`
Marca um conflito como resolvido.

### `get_last_sync_timestamp(user_id)`
Retorna quando foi a última sync bem-sucedida por tabela.

## 🔐 RLS (Row Level Security)

Todas as tabelas possuem RLS ativado com políticas CRUD:

```sql
-- Política padrão (exemplo: notes)
CREATE POLICY "Users can CRUD own notes" ON notes
    FOR ALL USING (auth.uid() = user_id);
```

## 📱 Sync Status

- `pending`: Item novo ou modificado, aguardando sync
- `synced`: Item sincronizado com servidor
- `conflict`: Conflito detectado, requer resolução

## 🔄 Fluxo de Sincronização

1. App salva localmente com `sync_status = 'pending'`
2. Background sync envia pendências para Supabase
3. Após sucesso, server marca como `synced`
4. Conflitos são marcados como `conflict`, app resolve
