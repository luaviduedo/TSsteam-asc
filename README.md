# Steam ASC

Aplicação web construída com **Next.js + TypeScript** para gerar um **ranking de jogos da Steam baseado na dificuldade de completar 100% das conquistas**.

O projeto utiliza **Steam Web API + cache persistente em PostgreSQL** para otimizar performance e reduzir chamadas externas.

---

## 🚀 Tecnologias

- Next.js (App Router)
- TypeScript
- TailwindCSS
- PostgreSQL
- Drizzle ORM
- Jest
- Docker

---

## ⚙️ Como funciona

1. Usuário informa:
   - SteamID64
   - URL (`/profiles` ou `/id`)
   - Vanity name

2. O sistema:
   - Resolve para SteamID64
   - Busca jogos e conquistas na Steam API
   - Calcula dificuldade de conclusão
   - Gera ranking
   - Salva em cache (PostgreSQL)

3. Requisições futuras:
   - Usam cache (TTL: 6h)
   - Podem forçar atualização (`force_refresh`)

---

## 📦 Instalação e execução

### Pré-requisitos

- Node.js
- Docker + Docker Compose

---

### 1. Clone o projeto

```bash
git clone https://github.com/luaviduedo/TSsteam-asc.git
cd TSsteam-asc
```

---

### 2. Instale as dependências

```bash
npm install
```

---

### 3. Configure o `.env`

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/steam_asc
POSTGRES_DB=steam_asc

STEAM_API_KEY_1=your_key
STEAM_API_KEY_2=your_key
STEAM_API_KEY_3=your_key

NODE_ENV=development
```

---

### 4. Rode o projeto

```bash
npm run dev
```

Esse comando:

- sobe o PostgreSQL (Docker)
- aplica o schema (Drizzle)
- inicia o Next.js

Acesse:

```txt
http://localhost:3000
```

---

## 🔌 API

### `GET /api/v1/status`

Healthcheck da aplicação

### `POST /api/v1/steam_games`

Gera ranking de jogos

```json
{
  "req_steam_id_64": "76561197960435530"
}
```

### `GET /api/v1/users`

Lista usuários em cache

### `GET /api/v1/users/[steamId64]`

Detalhes do usuário

### `DELETE /api/v1/users/[steamId64]`

Remove usuário do banco

---

## 🧠 Arquitetura

- `/api/v1/*` → rotas HTTP
- `lib/` → regras de negócio (Steam + cache)
- `drizzle/` → banco e schema
- `infra/` → Docker / serviços
- cache persistente com expiração (não deletado automaticamente)

---

Principais classes:

- `AppError`
- `ValidationError`
- `SteamApiError`
- `SteamProfilePrivateError`
- `CachePersistenceError`

---

## 🧪 Testes

```bash
npm test
```

- Testes de integração com `fetch`
- Uso de orchestrator para subir serviços

---

## 📄 Licença

PolyForm Noncommercial License 1.0.0
