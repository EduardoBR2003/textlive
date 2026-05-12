<div align="center">
  <h1>TextLive</h1>
  <p>Editor de texto colaborativo em tempo real — simples, rápido e seguro.</p>

  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socket.io&logoColor=white" alt="Socket.IO" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Tailwind-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
</div>

---

## Funcionalidades

- Criação de sessões compartilháveis via link
- Edição colaborativa em tempo real via WebSocket
- Proteção por senha
- Controle de permissões (visualização ou edição)
- Limite de dispositivos conectados com validação atômica
- QR Code para compartilhamento rápido
- Tema claro/escuro
- Responsivo (desktop e mobile)
- Saída automática ao fechar a aba
- Sessão encerrada quando o dono desconecta

---

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

| Camada | Responsabilidade |
|--------|-----------------|
| **Controller** | Recebe HTTP, valida DTOs, delega ao Service |
| **Service** | Regras de negócio (dono, senha, limite, permissões) |
| **Gateway** | WebSocket — salas e eventos em tempo real |
| **Repository** | Acesso ao banco via TypeORM |
| **Pages** | Composição de componentes e roteamento |
| **Components** | Visuais puros, sem regra de negócio |
| **Hooks** | Lógica reutilizável (socket, clipboard, debounce) |

---

## Executando

### Docker (recomendado)

```bash
docker compose up -d
```

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:3001 |
| PostgreSQL | `localhost:5433` |

```bash
docker compose down   # parar tudo
```

### Manual

**Backend**

```bash
cd backend
cp .env.example .env
npm install
npm run start:dev       # http://localhost:3001
```

**Frontend**

```bash
cd frontend
npm install
npm run dev             # http://localhost:5173
```

É necessário um PostgreSQL rodando. Configure a conexão em `backend/.env`.

---

## API

| Método | Rota | Descrição |
|--------|------|-----------|
| `POST` | `/api/sessions` | Criar nova sessão |
| `GET` | `/api/sessions/:slug/verify` | Verificar se sessão existe |
| `GET` | `/api/sessions/:slug` | Obter dados da sessão |
| `POST` | `/api/sessions/:slug/join` | Entrar na sessão |
| `POST` | `/api/sessions/:slug/leave` | Sair da sessão |
| `POST` | `/api/sessions/:slug/end` | Encerrar sessão (dono) |
| `PATCH` | `/api/sessions/:slug/content` | Atualizar conteúdo |
| `PATCH` | `/api/sessions/:slug/permissions` | Atualizar permissões (dono) |
| `PATCH` | `/api/sessions/:slug/password` | Atualizar senha (dono) |
| `DELETE` | `/api/sessions/:slug` | Excluir sessão (dono) |
| `GET` | `/api/sessions/:slug/devices` | Quantidade de dispositivos |

## WebSocket — `/sessions`

### Cliente → Servidor

| Evento | Payload |
|--------|---------|
| `join-session` | `slug, deviceId, password?, ownerToken?` |
| `leave-session` | `slug, deviceId` |
| `update-content` | `slug, content, ownerToken?, deviceId?` |

### Servidor → Cliente

| Evento | Descrição |
|--------|-----------|
| `session-joined` | Dados iniciais da sessão |
| `content-updated` | Texto atualizado por outro participante |
| `content-saved` | Confirmação de salvamento |
| `device-count-changed` | Mudança no número de dispositivos |
| `permissions-changed` | Permissão/limite alterados pelo dono |
| `session-ended` | Sessão encerrada pelo dono |

---

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|----------|--------|-----------|
| `PORT` | `3001` | Porta do backend |
| `DB_HOST` | `localhost` | Host do PostgreSQL |
| `DB_PORT` | `5432` | Porta do PostgreSQL |
| `DB_USERNAME` | `textlive` | Usuário do banco |
| `DB_PASSWORD` | `textlive` | Senha do banco |
| `DB_DATABASE` | `textlive` | Nome do banco |
| `DB_SYNCHRONIZE` | `true` | Sincronizar schema |
| `CORS_ORIGIN` | `*` | Origem CORS |
