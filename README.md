# Projeto de Prática JStack: Clone do Instagram com Paginação, Infinite Scroll e Optimistic Updates

Este é um projeto fullstack desenvolvido com **Node.js** no backend e **Next.js** no frontend, com o objetivo de praticar conceitos abordados no curso **[JStack](https://jstack.com.br)**. O foco principal está em **paginação**, **infinite scroll** e **optimistic updates** com **React Query**.

Além desses conceitos, o projeto simula uma rede social inspirada no Instagram, com funcionalidades de **usuários**, **postagens**, **curtidas** e **sistema de seguidores**.

---

## 🔧 Funcionalidades do Projeto

### 👤 Usuários

- Criar novo usuário (`POST /users`)
- Listar usuários com paginação (`GET /users`)
- Buscar usuário por ID (`GET /users/:id`)

### 📸 Postagens

- Criar novo post (`POST /posts`)
- Listar posts com paginação (cursor-based) (`GET /posts`)
- Excluir post (`DELETE /posts/:id`)

### ❤️ Curtidas

- Curtir um post (`POST /likes/like`)
- Remover curtida (`POST /likes/unlike`)
- Listar curtidas de um post com paginação (`GET /likes/:post_id`)

### 👥 Seguidores

- Seguir um usuário (`POST /followers/follow`)
- Deixar de seguir (`POST /followers/unfollow`)
- Listar seguidores de um usuário (`GET /followers/:user_id`)
- Listar quem o usuário está seguindo (`GET /followers/:user_id/following`)

---

## 📚 Conteúdo Baseado nas Aulas do JStack

Este projeto aplica os seguintes conceitos ensinados no curso:

1. **Paginação: Offset vs Cursor-based e Valores Pré-computados**
2. **Infinite Scroll com React Query**
3. **Optimistic Updates (UIs otimistas)** para ações como curtir e seguir usuários

---

## 🛠️ Tecnologias Utilizadas

### Backend

- **Node.js** com **Fastify**
- **PostgreSQL**
- **Zod** para validação de dados

### Frontend

- **Next.js**
- **React Query** para gerenciamento de cache e dados assíncronos
- **Tailwind CSS** + **shadcn/ui** para estilização
- **React Virtualized** para virtualização do feed

## Como Rodar o Projeto

### Backend

1. Acesse a pasta `backend` e instale as dependências:
   ```sh
   cd backend
   npm install
   ```
2. Configure o banco de dados no arquivo `.env`.
3. Execute o servidor:
   ```sh
   npm run dev
   ```

### Frontend

1. Acesse a pasta `frontend` e instale as dependências:
   ```sh
   cd frontend
   npm install
   ```
2. Execute a aplicação:
   ```sh
   npm run dev
   ```
