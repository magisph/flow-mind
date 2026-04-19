# FlowMind

Sistema de captura de pensamentos — zero fricção, máximo fluxo.

PWA construído com React 19, TypeScript 6, Vite 8, Tailwind CSS e Supabase.

## Configuração do Projeto

### Pré-requisitos

- Node.js 18+
- npm ou pnpm

### Variáveis de Ambiente

Este projeto usa variáveis de ambiente para conectar ao Supabase. Copie o arquivo de exemplo e preencha com suas credenciais:

```bash
cp .env.example .env.local
```

| Variável | Descrição | Exemplo |
|---|---|---|
| `VITE_SUPABASE_URL` | URL do projeto Supabase | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Chave pública anon do Supabase | `eyJhbGciOi...` |

> ⚠️ **Nunca** commite `.env.local` no repositório. Ele já está no `.gitignore`.

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview (produção local)

```bash
npm run preview
```

## Stack Técnica

- **React 19** + **TypeScript 6**
- **Vite 8** com HMR
- **Tailwind CSS 3** para estilização
- **Supabase** (Auth, Database, Realtime)
- **Zustand** para state management
- **Dexie** (IndexedDB) para storage offline
- **vite-plugin-pwa** para Progressive Web App

## Licença

Privado — todos os direitos reservados.
