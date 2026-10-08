# POLAR — Gestão Escolar

Sistema de gestão de alunos, disciplinas e matrículas desenvolvido com **React + TypeScript** no frontend, **FastAPI** no backend e **PostgreSQL** para persistência.

O Módulo III integra a interface POLAR criada no [Módulo II](https://github.com/Mateuspsr/gestao-alunos-frontend) à API do Módulo I, mantendo a identidade visual, a introdução animada, o menu lateral, os cards de alunos e as telas de consulta e administração.

## Funcionalidades

- Login JWT; envio de `Authorization: Bearer <token>` nas chamadas protegidas.
- Alunos: cadastro, consulta, filtros por nome/idade/média, edição e exclusão.
- Pesquisa, ordenação, perfil e indicadores de médias dos alunos.
- Cadastro e exclusão de disciplinas.
- Vínculo aluno-disciplina, consulta das matrículas e prevenção de duplicatas.
- Dados persistidos no PostgreSQL e carregados novamente ao abrir as páginas.
- Tratamento de erro, carregamento e respostas HTTP.

Os indicadores de aprovação e reprovação **gerais** são calculados a partir de `aluno.media` (limite 6). O contrato não possui notas individuais por disciplina. Por isso, as telas de disciplinas e perfil exibem quantidade de matrículas e carga horária, sem boletim fictício.

## Estrutura

```text
.
├── main.py                 # Rotas FastAPI e códigos HTTP
├── schemas.py              # Contratos de entrada e saída (Pydantic)
├── db.py                   # SQL parametrizado e PostgreSQL
├── auth.py                 # JWT, hash de senhas e usuário
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx         # Controle da sessão
│       ├── Polar.tsx       # Composição do frontend original
│       ├── api.ts          # HTTP e Bearer Token
│       ├── types.ts        # Interfaces TypeScript
│       ├── index.css       # Tema POLAR original
│       ├── login.css
│       └── components/     # Telas, logo, menu, cards e formulários
├── tests/
│   ├── integracao.py       # Testes HTTP com PostgreSQL
│   └── interface.spec.ts   # Testes de interface no navegador
├── testar_api.sh
└── render.yaml
```

Todos os componentes usam `api.ts` para acessar os dados. O arquivo de mock do Módulo II não participa da aplicação integrada.

## Requisitos locais

- Python 3.11 ou superior
- Node.js 20.19 ou superior
- PostgreSQL em execução

### 1. Preparar banco e variáveis

Crie um banco PostgreSQL chamado `gestao_alunos` e um usuário com privilégios de criação de tabelas. Copie `.env.example` para `.env` e ajuste as variáveis de conexão do banco, `JWT_SECRET`, `ADMIN_USERNAME` e `ADMIN_PASSWORD`.

```bash
cp .env.example .env
```

Uma chave JWT de desenvolvimento pode ser criada com `openssl rand -hex 32`. Não coloque senhas reais, o arquivo `.env` ou tokens no repositório.

### 2. Instalar e compilar o React

```bash
cd frontend
npm install
npm run build
cd ..
```

O comando `npm run build` verifica o TypeScript e gera `frontend/dist`, que é servido pelo FastAPI. Esse diretório deve existir antes de iniciar o backend na configuração de produção.

### 3. Iniciar a API

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python -m uvicorn main:app --reload --port 8000
```

- Aplicação: http://127.0.0.1:8000/app/
- Documentação da API: http://127.0.0.1:8000/docs
- Saúde do serviço: http://127.0.0.1:8000/health

Para editar o React com atualização automática, mantenha a API rodando e, em outro terminal, execute:

```bash
cd frontend
npm run dev
```

O proxy de `vite.config.ts` encaminha as chamadas `/auth`, `/alunos` e `/disciplinas` ao FastAPI. O Vite usa a base `/app/`; abra o endereço informado no terminal com esse caminho.

## Integração e autenticação

O login envia um formulário a `POST /auth/login`, recebe o JWT e o armazena em `sessionStorage` até o encerramento da sessão.

Cada operação protegida usa:

```http
Authorization: Bearer <token>
```

A função HTTP de `frontend/src/api.ts` trata 200, 201, 204, 401, 404, 409 e 422, sem interpretar corpo JSON em uma exclusão que retorne 204.

O fluxo de cadastro é:

```text
Formulario React -> src/api.ts -> POST /alunos -> FastAPI
    -> Pydantic -> db.py -> PostgreSQL -> JSON -> React
```

O endpoint `GET /matriculas` foi adicionado como **extensão** para exibir todos os vínculos na interface original. Ele retorna apenas `id`, `aluno_id` e `disciplina_id`, com dados extraídos do PostgreSQL. Os endpoints oficiais de matrícula e o `JOIN` por aluno continuam disponíveis.

## Testes

Com PostgreSQL e FastAPI iniciados e as variáveis configuradas:

```bash
bash testar_api.sh
python tests/integracao.py
```

A verificação automatizada no GitHub Actions cria um PostgreSQL descartável, compila React, inicia FastAPI, testa as rotas autenticadas e executa testes de interface no Chromium.

**Diferença para o script original do Módulo I:** o roteiro fornecido pelo professor envia requisições sem autenticação. Neste Módulo III, as rotas estão protegidas por JWT; portanto, executar o script original sem alterações recebe HTTP 401. Os testes deste repositório reproduzem as operações com um Bearer Token válido e verificam também a proteção.

## Captura do sistema

Uma captura da tela do POLAR original é gerada no teste de navegador e disponibilizada como artefato **captura-polar** na [execução de verificação da aplicação](https://github.com/Mateuspsr/gestao-alunos/actions/workflows/verificar.yml). Abra a execução mais recente concluída e procure o artefato na seção *Artifacts*.

## Publicação

O `render.yaml` configura um Web Service Python e um banco PostgreSQL. O comando de build instala dependências Python e Node, verifica TypeScript, compila Vite e serve os arquivos pelo FastAPI.

- [Aplicação pública](https://gestao-alunos-w90j.onrender.com)
- [Documentação Swagger](https://gestao-alunos-w90j.onrender.com/docs)
- [Teste de disponibilidade](https://gestao-alunos-w90j.onrender.com/health)

Em produção, `DATABASE_URL`, `JWT_SECRET` e `ADMIN_PASSWORD` são variáveis privadas do Render.

## Sobre os dados

A matrícula escolar do aluno (`aluno.matricula`) é um código único. A matrícula em disciplinas é um relacionamento muitos-para-muitos na tabela `matriculas`. Nenhum valor de nota por disciplina é gerado ou inferido a partir da média geral do aluno.

O banco permite `idade` nula em registros anteriores, enquanto o formulário de cadastro da interface requer uma idade válida. Quando um registro não possui idade, a consulta apresenta o campo sem valor.
