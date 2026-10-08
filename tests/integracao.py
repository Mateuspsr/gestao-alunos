#!/usr/bin/env python3
"""Verificação HTTP da aplicação com autenticação e PostgreSQL de teste."""

import json
import os
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import Request, urlopen
from uuid import uuid4

BASE = os.getenv("BASE", "http://127.0.0.1:8000")
ADMIN = os.getenv("ADMIN_USERNAME", "admin")
PASSWORD = os.environ["ADMIN_PASSWORD"]
TOTAL = 0


def solicitar(method, path, data=None, token=None, form=False):
    headers = {}
    if token:
        headers["Authorization"] = "Bearer " + token
    if data is not None:
        if form:
            payload = urlencode(data).encode()
            headers["Content-Type"] = "application/x-www-form-urlencoded"
        else:
            payload = json.dumps(data).encode()
            headers["Content-Type"] = "application/json"
    else:
        payload = None

    request = Request(BASE + path, data=payload, method=method, headers=headers)
    try:
        with urlopen(request, timeout=15) as response:
            status, raw = response.status, response.read()
    except HTTPError as error:
        status, raw = error.code, error.read()
    except URLError as error:
        raise AssertionError(f"Servidor inacessível: {error}") from error

    if not raw:
        return status, None
    if b"<!doctype" in raw.lower() or b"<html" in raw.lower():
        return status, raw.decode(errors="replace")
    return status, json.loads(raw)


def verificar(nome, obtido, esperado):
    global TOTAL
    assert obtido == esperado, f"{nome}: esperado {esperado}, encontrado {obtido}"
    TOTAL += 1
    print(f"OK {TOTAL:02d}: {nome} (HTTP {obtido})")


def executar():
    sufixo = uuid4().hex[:10]
    aluno_a = aluno_b = disciplina = None
    token = None
    try:
        status, conteudo = solicitar("GET", "/health")
        verificar("Servidor ativo", status, 200)
        assert conteudo == {"status": "ok"}

        verificar("Proteção sem token", solicitar("GET", "/alunos")[0], 401)
        verificar("Proteção de matrículas", solicitar("GET", "/matriculas")[0], 401)
        verificar("Senha incorreta", solicitar("POST", "/auth/login",
                 {"username": ADMIN, "password": "senha-errada"}, form=True)[0], 401)

        status, conteudo = solicitar("POST", "/auth/login",
                                     {"username": ADMIN, "password": PASSWORD}, form=True)
        verificar("Login", status, 200)
        token = conteudo["access_token"]
        status, usuario = solicitar("GET", "/auth/me", token=token)
        verificar("Usuário autenticado", status, 200)
        assert usuario["username"] == ADMIN

        dado = {"nome": f"Teste Alfa {sufixo}", "idade": 20,
                "matricula": f"A-{sufixo}", "media": 8.5}
        status, aluno_a = solicitar("POST", "/alunos", dado, token)
        verificar("Criar aluno", status, 201)
        assert aluno_a["id"] > 0

        verificar("Matrícula escolar repetida",
                 solicitar("POST", "/alunos", dado, token)[0], 409)
        verificar("Nome apenas com espaços",
                 solicitar("POST", "/alunos", {**dado, "nome": "   ", "matricula": "X-" + sufixo}, token)[0], 422)
        verificar("Idade fora da faixa",
                 solicitar("POST", "/alunos", {**dado, "idade": 130, "matricula": "Y-" + sufixo}, token)[0], 422)
        verificar("Média fora da faixa",
                 solicitar("POST", "/alunos", {**dado, "media": 11, "matricula": "Z-" + sufixo}, token)[0], 422)

        status, aluno_b = solicitar("POST", "/alunos",
              {"nome": f"Teste Beta {sufixo}", "idade": 17,
               "matricula": f"B-{sufixo}", "media": 4.5}, token)
        verificar("Criar segundo aluno", status, 201)

        status, lista = solicitar("GET", f"/alunos?q=alfa&idade_minima=18&media_minima=7", token=token)
        verificar("Filtros combinados", status, 200)
        assert len([x for x in lista if x["id"] == aluno_a["id"]]) == 1
        assert not any(x["id"] == aluno_b["id"] for x in lista)

        status, detalhe = solicitar("GET", f"/alunos/{aluno_a['id']}", token=token)
        verificar("Consulta por ID", status, 200)
        assert detalhe["nome"] == dado["nome"]

        status, atualizado = solicitar("PATCH", f"/alunos/{aluno_a['id']}", {"media": 9.25}, token)
        verificar("PATCH parcial", status, 200)
        assert atualizado["media"] == 9.25 and atualizado["matricula"] == dado["matricula"]
        verificar("Aluno inexistente",
                 solicitar("GET", "/alunos/99999999", token=token)[0], 404)

        status, disciplina = solicitar("POST", "/disciplinas",
             {"nome": "Disciplina CI " + sufixo, "carga_horaria": 40}, token)
        verificar("Criar disciplina", status, 201)
        verificar("Disciplina duplicada",
                 solicitar("POST", "/disciplinas",
                   {"nome": "Disciplina CI " + sufixo, "carga_horaria": 40}, token)[0], 409)
        verificar("Carga horária inválida",
                 solicitar("POST", "/disciplinas",
                   {"nome": "Inválida " + sufixo, "carga_horaria": 0}, token)[0], 422)
        status, disciplinas = solicitar("GET", "/disciplinas", token=token)
        verificar("Listar disciplinas", status, 200)
        assert any(d["id"] == disciplina["id"] for d in disciplinas)

        rota = f"/alunos/{aluno_a['id']}/matricular/{disciplina['id']}"
        verificar("Vincular aluno e disciplina", solicitar("POST", rota, token=token)[0], 201)
        verificar("Vínculo repetido é idempotente", solicitar("POST", rota, token=token)[0], 201)

        status, vinculos = solicitar("GET", "/matriculas", token=token)
        verificar("Listagem real de matrículas", status, 200)
        assert sum(1 for v in vinculos if v["aluno_id"] == aluno_a["id"]
                   and v["disciplina_id"] == disciplina["id"]) == 1
        status, aulas = solicitar("GET", f"/alunos/{aluno_a['id']}/disciplinas", token=token)
        verificar("JOIN por aluno", status, 200)
        assert any(d["id"] == disciplina["id"] for d in aulas)

        verificar("Aluno inexistente no vínculo",
                 solicitar("POST", f"/alunos/99999999/matricular/{disciplina['id']}", token=token)[0], 404)
        verificar("Disciplina inexistente no vínculo",
                 solicitar("POST", f"/alunos/{aluno_a['id']}/matricular/99999999", token=token)[0], 404)

        verificar("Excluir aluno", solicitar("DELETE", f"/alunos/{aluno_a['id']}", token=token)[0], 204)
        aluno_a = None
        status, vinculos = solicitar("GET", "/matriculas", token=token)
        verificar("Remoção em cascata", status, 200)
        assert not any(v["disciplina_id"] == disciplina["id"] for v in vinculos)
        verificar("Excluir aluno inexistente",
                 solicitar("DELETE", "/alunos/99999999", token=token)[0], 404)

        verificar("Excluir disciplina",
                 solicitar("DELETE", f"/disciplinas/{disciplina['id']}", token=token)[0], 204)
        disciplina = None
        verificar("Excluir disciplina inexistente",
                 solicitar("DELETE", "/disciplinas/99999999", token=token)[0], 404)

        status, html = solicitar("GET", "/app/")
        verificar("Frontend compilado servido pelo FastAPI", status, 200)
        assert 'id="root"' in html and "/app/assets/" in html
    finally:
        if token:
            if aluno_a:
                solicitar("DELETE", f"/alunos/{aluno_a['id']}", token=token)
            if aluno_b:
                solicitar("DELETE", f"/alunos/{aluno_b['id']}", token=token)
            if disciplina:
                solicitar("DELETE", f"/disciplinas/{disciplina['id']}", token=token)
    print(f"\n{TOTAL} verificações HTTP aprovadas.")


if __name__ == "__main__":
    executar()
