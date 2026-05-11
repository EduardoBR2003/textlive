# TextLive

Editor de texto colaborativo em tempo real. Simples, rápido e seguro.

## Funcionalidades

- Criação de sessões compartilháveis via link
- Edição colaborativa em tempo real via WebSocket
- Proteção por senha
- Controle de permissões (visualização ou edição)
- Limite de dispositivos conectados
- QR Code para compartilhamento rápido
- Tema claro/escuro
- Responsivo (desktop e mobile)

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | NestJS, TypeScript, Socket.IO |
| Banco | PostgreSQL + TypeORM |
| Infra | Docker, Docker Compose |

## Arquitetura

```
backend/src/
├── main.ts                         # Bootstrap da aplicação
├── app.module.ts                   # Módulo raiz (TypeORM, Config)
├── config/
│   └── database.config.ts          # Configuração do PostgreSQL
└── modules/
    └── sessions/
        ├── sessions.module.ts      # Módulo de sessões
        ├── sessions.controller.ts  # Endpoints HTTP REST
        ├── sessions.service.ts     # Regras de negócio
        ├── sessions.gateway.ts     # WebSocket (Socket.IO)
        ├── sessions.repository.ts  # Acesso ao banco (TypeORM)
        ├── dto/                    # Validação de entrada
        ├── entities/               # Entidades do banco
        └── types/                  # Tipos compartilhados

frontend/src/
├── App.tsx                         # Rotas e guarda de sessão
├── pages/                          # Telas principais
├── components/                     # Componentes reutilizáveis
├── hooks/                          # Lógica reutilizável
├── services/                       # Comunicação com backend
├── types/                          # Tipos TypeScript
└── utils/                          # Funções auxiliares
```

### Separação de responsabilidades

- **Controller** → recebe HTTP, valida DTOs, delega ao Service
- **Service** → regras de negócio (valida dono, senha, limite, permissões)
- **Gateway** → WebSocket (salas, eventos em tempo real), nunca acessa banco direto
- **Repository** → acesso ao banco via TypeORM
- **Pages** → composição de componentes, roteamento
- **Components** → visuais puros, sem regra de negócio
- **Hooks** → lógica reutilizável (socket, clipboard, debounce)

## Requisitos

- Docker e Docker Compose
- Ou Node.js 20+ e PostgreSQL 16+

## Executando com Docker

```bash
# Subir todos os serviços (PostgreSQL, Backend, Frontend)
docker compose up -d

# Acessar
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
# PostgreSQL: localhost:5433

# Parar
docker compose down
```

## Executando sem Docker

### Backend

```bash
cd backend
cp .env.example .env    # Ajuste as variáveis conforme necessário
npm install
npm run start:dev       # http://localhost:3001
```

### Frontend

```bash
cd frontend
npm install
npm run dev             # http://localhost:5173
```

### PostgreSQL

É necessário um banco PostgreSQL rodando. Configure a conexão no arquivo `backend/.env`.

## Endpoints da API

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/sessions` | Criar nova sessão |
| `GET` | `/api/sessions/:slug/verify` | Verificar se sessão existe |
| `GET` | `/api/sessions/:slug` | Obter dados da sessão |
| `POST` | `/api/sessions/:slug/join` | Entrar em uma sessão |
| `PATCH` | `/api/sessions/:slug/content` | Atualizar conteúdo (dono) |
| `PATCH` | `/api/sessions/:slug/permissions` | Atualizar permissões (dono) |
| `PATCH` | `/api/sessions/:slug/password` | Atualizar senha (dono) |
| `POST` | `/api/sessions/:slug/owner/verify` | Verificar token de dono |
| `DELETE` | `/api/sessions/:slug` | Excluir sessão (dono) |
| `GET` | `/api/sessions/:slug/devices` | Quantidade de dispositivos |

## Eventos WebSocket

Namespace: `/sessions`

**Cliente → Servidor:**
| Evento | Payload |
|--------|---------|
| `join-session` | `{ slug, deviceId, password?, ownerToken? }` |
| `leave-session` | `{ slug, deviceId }` |
| `update-content` | `{ slug, content, ownerToken }` |
| `request-session-state` | `{ slug }` |

**Servidor → Cliente:**
| Evento | Payload |
|--------|---------|
| `session-joined` | `{ slug, content, permission, hasPassword, deviceCount, deviceLimit, isOwner }` |
| `content-updated` | `{ slug, content, updatedAt }` |
| `content-saved` | `{ slug, updatedAt }` |
| `device-count-changed` | `{ slug, count }` |
| `session-state` | `{ slug, content, permission, hasPassword, deviceCount, deviceLimit }` |

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `3001` | Porta do servidor backend |
| `CORS_ORIGIN` | `*` | Origem permitida para CORS |
| `DB_HOST` | `localhost` | Host do PostgreSQL |
| `DB_PORT` | `5432` | Porta do PostgreSQL |
| `DB_USERNAME` | `textlive` | Usuário do banco |
| `DB_PASSWORD` | `textlive` | Senha do banco |
| `DB_DATABASE` | `textlive` | Nome do banco |
| `DB_SYNCHRONIZE` | `true` | Sincronizar schema automaticamente |
