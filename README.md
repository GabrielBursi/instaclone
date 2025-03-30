# Projeto de Prática JStack: Paginação, Infinite Scroll e Optimistic Updates

Este é um projeto fullstack desenvolvido com **Node.js** no backend e **Next.js** no frontend, com o objetivo de praticar conceitos fundamentais abordados no curso **[JStack](https://jstack.com.br)**. O foco principal está em **paginação, infinite scroll e optimistic updates** utilizando **React Query**.

## Conteúdo Baseado nas Aulas do JStack
Este projeto foi desenvolvido com base nos seguintes conteúdos do curso **JStack**:

1. **Paginação: Offset vs Cursor-based e Valores Pré-computados**  

2. **Optimistic Updates: UIs otimistas com React Query**  

3. **Paginação e Infinite Scroll com React Query**  

## Tecnologias Utilizadas

### Backend
- **Node.js** com **Express**
- Banco de dados (PostgreSQL/MySQL/MongoDB, dependendo da implementação escolhida)
- Prisma/Sequelize/TypeORM (para manipulação do banco de dados)

### Frontend
- **Next.js** (React + SSR/ISR)
- **React Query** para gerenciamento de estado assíncrono
- Styled-components/Tailwind CSS para estilização

## Funcionalidades Implementadas

1. **Paginação:** Implementação de paginação tradicional (offset-based) e cursor-based.
2. **Infinite Scroll:** Carregamento progressivo dos dados conforme o usuário rola a página.
3. **Optimistic Updates:** Atualização otimista de dados para uma melhor experiência do usuário, utilizando **React Query**.

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
