# Gestão de Alunos

Sistema web para administração de alunos, disciplinas e matrículas. O projeto utiliza **FastAPI**, **PostgreSQL** e uma interface responsiva em **HTML, CSS e JavaScript**.

## Recursos

- Login com senha armazenada por hash Argon2 e autenticação JWT.
- Rotas de dados protegidas por Bearer Token.
- Painel com total de alunos, disciplinas, média geral e indicador de desempenho.
- Cadastro, consulta, edição e exclusão de alunos.
- Pesquisa de alunos e filtro por média.
- Cadastro, listagem e exclusão de disciplinas.
- Matrícula de alunos em disciplinas e consulta dos vínculos.
- Persistência em PostgreSQL.
- Interface responsiva com requisições HTTP à própria API.

## Estrutura

```text
.
├── auth.py               # Autenticação e controle de acesso
├── db.py                 # Acesso ao PostgreSQL
├── main.py               # Endpoints FastAPI
├── schemas.py            # Modelos e validação
├── frontend/
│   ├── index.html        # Estrutura da interface
│   ├── styles.css        # Estilos responsivos
│   └── app.js            # Interações e consumo da API
├── requirements.txt
├── .env.example
├── render.yaml           # Infraestrutura do Render
└── testar_api.sh         # Teste de integração por HTTP
```

## Requisitos

- Python 3.11 ou superior.
- PostgreSQL.
- Git, se desejar clonar o repositório.

## Executar localmente

Clone o repositório e entre na pasta do projeto.

```bash
git clone https://github.com/Mateuspsr/gestao-alunos.git
cd gestao-alunos
git checkout modulo-iii
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
```

Preencha as variáveis de conexão e autenticação em `.env`. Gere uma chave JWT com `openssl rand -hex 32`. Configure o banco `gestao_alunos` e um usuário PostgreSQL com permissões no esquema `public`.

Inicie o serviço:

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

No navegador, acesse:

- Interface: http://localhost:8000
- Documentação da API: http://localhost:8000/docs
- Verificação de disponibilidade: http://localhost:8000/health

O administrador inicial é criado na primeira inicialização utilizando `ADMIN_USERNAME` e `ADMIN_PASSWORD`. Alterar `ADMIN_PASSWORD` no ambiente não redefine a senha de um administrador que já existe no banco.

## Teste de integração

Com a API em execução, abra outro terminal e rode:

```bash
bash testar_api.sh
```

O teste verifica a rota de saúde, bloqueio de acesso não autenticado, emissão de token JWT, criação, consulta, edição e exclusão de alunos, além de disciplinas e matrículas.

## Autenticação

O endpoint `POST /auth/login` aceita dados `application/x-www-form-urlencoded` com `username` e `password`, e retorna `access_token` e `token_type`.

A interface utiliza a resposta no cabeçalho HTTP:

```http
Authorization: Bearer <access_token>
```

As requisições sem token válido a rotas protegidas retornam HTTP 401.

## Publicação no Render

O arquivo `render.yaml` configura o serviço web, o PostgreSQL e a integração via `DATABASE_URL`.

- Conecte o repositório GitHub a um Blueprint no Render.
- Selecione a branch `modulo-iii`.
- Configure `ADMIN_PASSWORD` nas variáveis de ambiente do serviço, usando uma senha exclusiva para produção.
- Confirme a presença de `DATABASE_URL`, `JWT_SECRET` e `ADMIN_USERNAME`.
- Aguarde o deploy ficar **Live**.
- Acesse o endereço público, faça login e verifique cadastro e listagem de alunos.

**Importante:** nunca versione o arquivo `.env` nem credenciais reais. As variáveis confidenciais devem ficar apenas no ambiente local ou na configuração privada do Render.

## Endpoints principais

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/auth/login` | Autenticar usuário |
| GET | `/auth/me` | Consultar usuário autenticado |
| GET | `/alunos` | Listar alunos |
| POST | `/alunos` | Cadastrar aluno |
| GET | `/alunos/{id}` | Consultar aluno |
| PATCH | `/alunos/{id}` | Atualizar cadastro |
| DELETE | `/alunos/{id}` | Excluir cadastro |
| GET | `/disciplinas` | Listar disciplinas |
| POST | `/disciplinas` | Cadastrar disciplina |
| DELETE | `/disciplinas/{id}` | Excluir disciplina |
| POST | `/alunos/{id}/matricular/{disciplina_id}` | Registrar matrícula |
| GET | `/alunos/{id}/disciplinas` | Consultar matrículas |

Projeto desenvolvido para a disciplina de desenvolvimento de sistemas.
