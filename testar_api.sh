#!/usr/bin/env bash
# Smoke test do Módulo III: autenticação Bearer + consumo das rotas principais.
# Rode a API em outro terminal antes de executar:
#   bash testar_api.sh

set -euo pipefail

BASE="${BASE:-http://127.0.0.1:8000}"

if [[ -f ".env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

USUARIO="${ADMIN_USERNAME:-admin}"
SENHA="${ADMIN_PASSWORD:-}"

if [[ -z "$SENHA" ]]; then
  echo "ERRO: defina ADMIN_PASSWORD no .env antes de rodar o teste."
  exit 1
fi

echo "== 1) Health check =="
curl -fsS "$BASE/health"
echo -e "\n"

echo "== 2) Rota protegida sem token (esperado: 401) =="
STATUS_SEM_TOKEN=$(curl -s -o /dev/null -w "%{http_code}" "$BASE/alunos")
echo "HTTP $STATUS_SEM_TOKEN"
if [[ "$STATUS_SEM_TOKEN" != "401" ]]; then
  echo "ERRO: /alunos deveria exigir Bearer Token."
  exit 1
fi
echo

echo "== 3) Login e obtenção do Bearer Token =="
LOGIN=$(curl -fsS -X POST "$BASE/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "username=$USUARIO" \
  --data-urlencode "password=$SENHA")

TOKEN=$(printf '%s' "$LOGIN" | python -c 'import json,sys; print(json.load(sys.stdin)["access_token"])')
AUTH="Authorization: Bearer $TOKEN"
echo "Token obtido com sucesso."
echo

SUFIXO=$(date +%s)
MATRICULA="TESTE-$SUFIXO"
DISCIPLINA="Python-$SUFIXO"

echo "== 4) Criar aluno autenticado =="
ALUNO=$(curl -fsS -X POST "$BASE/alunos" \
  -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d "{\"nome\":\"Aluno Teste\",\"idade\":20,\"matricula\":\"$MATRICULA\",\"media\":8.5}")

ALUNO_ID=$(printf '%s' "$ALUNO" | python -c 'import json,sys; print(json.load(sys.stdin)["id"])')
echo "$ALUNO"
echo

echo "== 5) Listar alunos =="
curl -fsS "$BASE/alunos" -H "$AUTH"
echo -e "\n"

echo "== 6) Atualizar aluno =="
curl -fsS -X PATCH "$BASE/alunos/$ALUNO_ID" \
  -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d '{"media":9.5}'
echo -e "\n"

echo "== 7) Criar disciplina =="
DISC=$(curl -fsS -X POST "$BASE/disciplinas" \
  -H "$AUTH" \
  -H "Content-Type: application/json" \
  -d "{\"nome\":\"$DISCIPLINA\",\"carga_horaria\":40}")

DISC_ID=$(printf '%s' "$DISC" | python -c 'import json,sys; print(json.load(sys.stdin)["id"])')
echo "$DISC"
echo

echo "== 8) Matricular aluno na disciplina =="
curl -fsS -X POST "$BASE/alunos/$ALUNO_ID/matricular/$DISC_ID" -H "$AUTH"
echo -e "\n"

echo "== 9) Conferir disciplinas do aluno =="
curl -fsS "$BASE/alunos/$ALUNO_ID/disciplinas" -H "$AUTH"
echo -e "\n"

echo "== 10) Excluir dados criados pelo teste =="
curl -fsS -o /dev/null -X DELETE "$BASE/alunos/$ALUNO_ID" -H "$AUTH"
curl -fsS -o /dev/null -X DELETE "$BASE/disciplinas/$DISC_ID" -H "$AUTH"
echo "Limpeza concluída."
echo

echo "TODOS OS TESTES PRINCIPAIS PASSARAM."
