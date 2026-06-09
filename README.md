# Sistema de Planejamento de Metas

Aplicação web para planejamento e acompanhamento de metas pessoais com suporte a IA.

## Stack

- **Frontend + Backend**: Next.js (App Router) + TypeScript
- **Banco de dados**: PostgreSQL 16
- **ORM**: Prisma
- **Autenticação**: NextAuth.js (credenciais email/senha)
- **Estilização**: Tailwind CSS
- **Containerização**: Docker + Docker Compose

## Estrutura do banco de dados

| Tabela                 | Descrição                                     |
| ---------------------- | --------------------------------------------- |
| `users`                | Usuários da aplicação                         |
| `goals`                | Metas com prazo, categoria e status           |
| `annual_plans`         | Planos anuais vinculados a metas              |
| `quarterly_milestones` | Marcos trimestrais por plano anual            |
| `weekly_tasks`         | Tarefas semanais vinculadas a marcos          |
| `daily_habits`         | Hábitos diários vinculados a tarefas          |
| `weekly_reviews`       | Revisões semanais com reflexão e rating       |
| `plan_generation_logs` | Histórico de geração de planos pela IA        |
| `accounts`             | Contas OAuth (NextAuth)                       |
| `sessions`             | Sessões ativas (NextAuth)                     |
| `verification_tokens`  | Tokens de verificação de email (NextAuth)     |

---

## Pré-requisitos

- [Node.js](https://nodejs.org/) 20+
- [Docker](https://www.docker.com/) e [Docker Compose](https://docs.docker.com/compose/)

---

## Desenvolvimento local

### 1. Clone e instale dependências

```bash
git clone <url-do-repo>
cd <nome-do-projeto>
npm install
```

### 2. Configure variáveis de ambiente

```bash
cp .env.example .env
```

Para desenvolvimento local os valores padrão do `.env.example` já funcionam com o Docker Compose.

### 3. Suba o banco de dados

```bash
docker compose -f docker-compose.dev.yml up -d
```

### 4. Execute as migrations do Prisma

```bash
npx prisma migrate dev --name init
```

### 5. Inicie a aplicação

```bash
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000).

---

## Produção com Docker Compose

Sobe banco de dados **e** aplicação:

```bash
docker compose up -d --build

# Executar migrations no container (primeira vez)
docker compose exec app npx prisma migrate deploy
```

---

## Endpoints da API

| Método | Rota                      | Descrição                    | Auth? |
| ------ | ------------------------- | ---------------------------- | ----- |
| POST   | `/api/auth/[...nextauth]` | Login via NextAuth.js        | Não   |
| POST   | `/api/register`           | Cadastro de novo usuário     | Não   |
| GET    | `/api/me`                 | Dados do usuário autenticado | Sim   |

### Exemplo — Registro de usuário

```bash
curl -X POST http://localhost:3000/api/register \
  -H "Content-Type: application/json" \
  -d '{"name":"João","email":"joao@example.com","password":"senha123"}'
```

### Exemplo — Login via NextAuth

```bash
curl -X POST http://localhost:3000/api/auth/callback/credentials \
  -H "Content-Type: application/json" \
  -d '{"email":"joao@example.com","password":"senha123"}'
```

---

## Comandos úteis

```bash
# Rodar migrations em desenvolvimento
npx prisma migrate dev

# Abrir Prisma Studio (interface visual do banco)
npx prisma studio

# Gerar cliente Prisma após alterar schema
npx prisma generate

# Aplicar migrations em produção
npx prisma migrate deploy
```

---

## Variáveis de ambiente

| Variável               | Descrição                                              | Obrigatório |
| ---------------------- | ------------------------------------------------------ | ----------- |
| `DATABASE_URL`         | String de conexão PostgreSQL                           | Sim         |
| `NEXTAUTH_URL`         | URL base da aplicação                                  | Sim         |
| `NEXTAUTH_SECRET`      | Chave secreta para JWT (`openssl rand -base64 32`)     | Sim         |
| `GITHUB_ID`            | Client ID para login com GitHub (opcional)             | Não         |
| `GITHUB_SECRET`        | Client Secret para login com GitHub (opcional)         | Não         |
| `GOOGLE_CLIENT_ID`     | Client ID para login com Google (opcional)             | Não         |
| `GOOGLE_CLIENT_SECRET` | Client Secret para login com Google (opcional)         | Não         |
