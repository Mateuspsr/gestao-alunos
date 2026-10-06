# Gestão de Alunos — Módulo III

Aplicação web de gestão escolar construída com **FastAPI + PostgreSQL** no back-end e **HTML/CSS/JavaScript** no front-end.

A versão atual integra o front-end à API, possui autenticação com **JWT/Bearer Token** e está preparada para deploy no Render.

## Estado do projeto — 06/10/2026

| Requisito da entrega | Estado |
|---|---|
| Integração front-end ↔ back-end | ✅ Implementado |
| Consumo real da API com `fetch()` | ✅ Implementado |
| Login | ✅ Implementado |
| JWT / Bearer Token | ✅ Implementado |
| Rotas protegidas | ✅ Implementado |
| PostgreSQL | ✅ Implementado |
| Configuração de deploy | ✅ Preparada em `render.yaml` |
| Link público em produção | ⏳ Próxima etapa: criar o Blueprint no Render e validar |

Prazo da entrega: **08/10/2026**.

## Arquitetura

```text
frontend/
  index.html       interface
  app.js           consumo da API e envio do Bearer Token
  styles.css       apresentação

main.py            rotas HTTP / FastAPI
schemas.py         validação com Pydantic
auth.py            autenticação, hash de senha e JWT
db.py              PostgreSQL e SQL
render.yaml        infraestrutura de deploy
```

Fluxo principal:

```text
Navegador
   ↓
frontend/app.js
   ↓  fetch + Authorization: Bearer <token>
FastAPI (main.py)
   ↓
validação / autenticação
   ↓
db.py
   ↓
PostgreSQL
```

## Funcionalidades

### Autenticação

- `POST /auth/login` — autentica e devolve um JWT.
- `GET /auth/me` — retorna o usuário autenticado.
- As rotas de alunos e disciplinas exigem `Authorization: Bearer <token>`.
- As senhas ficam armazenadas como hash, não em texto puro.

### Alunos

- `POST /alunos`
- `GET /alunos`
- `GET /alunos/{id}`
- `PATCH /alunos/{id}`
- `DELETE /alunos/{id}`
- filtros por idade mínima, média mínima e nome.

### Disciplinas e matrículas

- `POST /disciplinas`
- `GET /disciplinas`
- `DELETE /disciplinas/{id}`
- `POST /alunos/{id}/matricular/{disciplina_id}`
- `GET /alunos/{id}/disciplinas`

## Rodar localmente

### 1. Ativar o ambiente virtual e instalar dependências

```bash
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Configurar variáveis de ambiente

Crie o `.env` a partir do exemplo:

```bash
cp .env.example .env
```

Defina uma chave JWT forte e uma senha de administrador. O arquivo `.env` está no `.gitignore` e **não deve ser enviado ao GitHub**.

### 3. Iniciar o PostgreSQL

```bash
sudo service postgresql start
```

### 4. Iniciar a aplicação

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Abra:

- aplicação: `http://localhost:8000`
- Swagger: `http://localhost:8000/docs`
- health check: `http://localhost:8000/health`

## Teste rápido do Módulo III

Com a API em execução e o `.env` configurado:

```bash
bash testar_api.sh
```

O script comprova:

1. que a aplicação responde;
2. que `/alunos` sem token retorna 401;
3. que o login gera um Bearer Token;
4. que o token permite consumir as rotas protegidas;
5. CRUD de aluno;
6. criação de disciplina e matrícula.

## Deploy

O projeto possui `render.yaml` com:

- Web Service Python;
- PostgreSQL;
- `DATABASE_URL` ligada ao banco;
- `JWT_SECRET` gerada pelo Render;
- `ADMIN_PASSWORD` definida como segredo;
- health check em `/health`;
- start command com Uvicorn.

A próxima etapa é criar um **Blueprint** no Render a partir deste repositório e informar `ADMIN_PASSWORD` quando solicitado. Depois do primeiro deploy, é necessário testar o login, o cadastro de aluno e uma rota protegida no endereço público.

## Segurança

Nunca faça commit de:

- `.env`;
- senha real do banco;
- `JWT_SECRET`;
- senha real do administrador.

Somente `.env.example` deve ficar versionado.
