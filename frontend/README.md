# Frontend React + Vite para Sistema de Suporte TI

Este frontend usa React, React Router e Vite para criar páginas em JSX.

## Como começar

```bash
cd frontend
npm install
npm run dev
```

A aplicação roteia para:
- `/` → Home (visão geral do sistema)
- `/users` → Usuários (CRUD completo)
- `/tasks` → Tarefas (CRUD com associação a usuários)
- `/equipamentos` → Equipamentos (cadastro e controle de inventário)
- `/emprestimos` → Empréstimos (controle de empréstimos de equipamentos)
- `/chamados` → Chamados (abertura e gestão de chamados técnicos)

O proxy está configurado para enviar `/users`, `/tasks`, `/equipamentos`, `/emprestimos` e `/chamados` ao backend em `http://localhost:8080`.
