# Desafio Clarke Energia

SPA de escolha de fornecedor de energia com cálculo de economia.

## Tecnologias

- **Frontend**: React (Vite)
- **Backend**: Node.js + Express + Apollo Server (GraphQL)
- **Estilização**: CSS Modules (Vanilla) com Design Premium
- **Infraestrutura**: Docker & Docker Compose

## Instalação e Execução

### Pré-requisitos

- Node.js (v18+)
- Docker (Opcional, mas recomendado)

### 1. Executando Localmente (Sem Docker)

#### Backend
```bash
cd backend
npm install
npm start
```
O servidor GraphQL rodará em `http://localhost:4000`.

#### Frontend
```bash
cd frontend
npm install
npm run dev
```
Acesse `http://localhost:5173`.

### 2. Executando com Docker

Na raiz do projeto:
```bash
docker-compose up --build
```
Acesse a aplicação em `http://localhost:4173` e a API em `http://localhost:4000`.

## Testes

### Backend (Jest)
```bash
cd backend
npm test
```

### Frontend (Cypress)
```bash
cd frontend
npx cypress open
```

## Estrutura do Projeto

- `/backend`: API GraphQL e lógica de cálculo.
- `/frontend`: Interface React.
- `docker-compose.yml`: Orquestração de containers.

## Deploy

Para deploy:
1. Frontend: Recomenda-se Vercel ou Netlify (build command: `npm run build`, output: `dist`).
2. Backend: Recomenda-se Render, Railway ou Fly.io.

## Diferenciais Implementados

- ✅ Aplicação integrada com GraphQL
- ✅ Frontend com testes E2E (Cypress)
- ✅ Backend com testes unitários (Jest)
- ✅ Arquivos de configuração Docker
- ✅ Design Premium "Rich Aesthetics"
