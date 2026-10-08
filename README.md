# POLAR — Gestão Escolar

Portal de gestão acadêmica com **React + TypeScript** no front-end e **FastAPI + PostgreSQL** no back-end. O projeto reúne autenticação, cadastro de alunos, disciplinas e matrículas em uma única aplicação.

## Tecnologias

- React 19, TypeScript e Vite 7;
- Python, FastAPI, Pydantic e PostgreSQL;
- JWT para autenticação e rotas protegidas com Bearer Token;
- Render para hospedagem e banco de dados.

## Organização

```text
frontend/
  src/
    api.ts                  # Requisições HTTP e autenticação
    types.ts                # Contratos de dados
    App.tsx                 # Estado da aplicação e navegação
    components/
      Login.tsx             # Formulário de autenticação
      Dashboard.tsx         # Indicadores do sistema
      Alunos.tsx            # Cadastro, filtros, edição e exclusão
      Disciplinas.tsx       # Disciplinas e matrículas
    main.tsx
    styles.css
  index.html
  vite.config.ts
  package.json

main.py                    # Endpoints HTTP
schemas.py                 # Validação das entradas
db.py                      # Consultas e operações no banco
auth.py                    # JWT e senhas
render.yaml                # Configuração de produção
testar_api.sh              # Testes HTTP
```

Os dados exibidos no navegador são obtidos pela API. Não há uma lista local simulando alunos nem notas por disciplina que não existam no banco.

## Execução local

É necessário ter Python 3, Node.js 20.19+ e PostgreSQL.

**Primeiro terminal — API**

```bash
cd ~/Projetos/gestao-alunos
source venv/bin/activate
pip install -r requirements.txt
sudo service postgresql start
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Antes de iniciar, configure o arquivo `.env` com a conexão PostgreSQL, `JWT_SECRET` e `ADMIN_PASSWORD`. O backend exige um build inicial do front-end para servir a página por `/app/`; para desenvolvimento com recarga automática, use o servidor Vite abaixo.

**Segundo terminal — front-end**

```bash
cd ~/Projetos/gestao-alunos/frontend
npm install
npm run dev
```

Abra o endereço exibido pelo Vite (normalmente `http://localhost:5173`). O Vite encaminha as requisições `/auth`, `/alunos` e `/disciplinas` ao FastAPI local.

Para compilar o front-end de produção, execute:

```bash
cd ~/Projetos/gestao-alunos/frontend
npm run build
```

Depois, o mesmo front-end pode ser acessado em `http://localhost:8000/app/`.

## Recursos principais

- Login por `POST /auth/login` e identificação do usuário por `GET /auth/me`;
- JWT transmitido em `Authorization: Bearer <token>`;
- bloqueio HTTP 401 nas rotas privadas sem credenciais válidas;
- alunos: `GET`, `POST`, `PATCH` e `DELETE`;
- filtros combináveis por nome, idade mínima e média mínima;
- disciplinas: cadastro, listagem e exclusão;
- matrícula de alunos em disciplinas e consulta dos vínculos por `JOIN`;
- indicadores gerais calculados a partir dos registros armazenados.

A matrícula é um identificador único. Durante a edição de aluno, ela não pode ser alterada. Como a API não armazena notas individuais por disciplina, o portal exibe apenas a média geral do aluno.

## Publicação

O `render.yaml` usa o mesmo Web Service Python para servir a API e o front-end React compilado. O comando de build executa a instalação das dependências Python, a instalação dos pacotes do front-end e o `npm run build`.

O Render deve receber as variáveis `DATABASE_URL`, `JWT_SECRET`, `ADMIN_USERNAME` e `ADMIN_PASSWORD`. Senhas reais e tokens não devem ser incluídos no GitHub.

- Aplicação: https://gestao-alunos-w90j.onrender.com
- Documentação da API: https://gestao-alunos-w90j.onrender.com/docs
- Teste de saúde: https://gestao-alunos-w90j.onrender.com/health

Execute `bash testar_api.sh` com o servidor rodando para testar autenticação e operações principais.

## Observações

Os componentes React não conhecem SQL nem manipulam credenciais do banco. Toda comunicação com o servidor fica em `frontend/src/api.ts`; as regras de validação e o acesso ao PostgreSQL permanecem na API.
