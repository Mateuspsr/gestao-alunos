from typing import Optional

from fastapi import FastAPI, HTTPException, Query, Response, status
from psycopg2.errors import UniqueViolation

import db
from schemas import (
    AlunoAtualizacao,
    AlunoEntrada,
    AlunoSaida,
    DisciplinaEntrada,
    DisciplinaSaida,
)


app = FastAPI(title="Gestão de Alunos")


@app.on_event("startup")
def ao_iniciar():
    db.criar_tabelas()


@app.get("/")
def inicio():
    return {
        "mensagem": "API de Gestão de Alunos funcionando.",
        "documentacao": "/docs",
    }


@app.post(
    "/alunos",
    response_model=AlunoSaida,
    status_code=status.HTTP_201_CREATED,
)
def criar_aluno(payload: AlunoEntrada):
    try:
        return db.inserir_aluno(
            nome=payload.nome,
            idade=payload.idade,
            matricula=payload.matricula,
            media=payload.media,
        )

    except UniqueViolation as erro:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Matrícula já cadastrada.",
        ) from erro


@app.get("/alunos", response_model=list[AlunoSaida])
def listar_alunos(
    idade_minima: Optional[int] = Query(default=None, ge=0, le=120),
    media_minima: Optional[float] = Query(default=None, ge=0, le=10),
    q: Optional[str] = Query(default=None),
):
    return db.listar_alunos(
        idade_minima=idade_minima,
        media_minima=media_minima,
        q=q,
    )


@app.get("/alunos/{aluno_id}", response_model=AlunoSaida)
def buscar_aluno(aluno_id: int):
    aluno = db.buscar_aluno(aluno_id)

    if aluno is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado.",
        )

    return aluno


@app.patch("/alunos/{aluno_id}", response_model=AlunoSaida)
def atualizar_aluno(aluno_id: int, payload: AlunoAtualizacao):
    campos = payload.model_dump(exclude_unset=True)
    aluno = db.atualizar_aluno(aluno_id, **campos)

    if aluno is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado.",
        )

    return aluno


@app.delete(
    "/alunos/{aluno_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def excluir_aluno(aluno_id: int):
    if not db.excluir_aluno(aluno_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado.",
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.post(
    "/disciplinas",
    response_model=DisciplinaSaida,
    status_code=status.HTTP_201_CREATED,
)
def criar_disciplina(payload: DisciplinaEntrada):
    try:
        return db.inserir_disciplina(
            nome=payload.nome,
            carga_horaria=payload.carga_horaria,
        )

    except UniqueViolation as erro:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Disciplina já cadastrada.",
        ) from erro


@app.get("/disciplinas", response_model=list[DisciplinaSaida])
def listar_disciplinas():
    return db.listar_disciplinas()


@app.delete(
    "/disciplinas/{disciplina_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
def excluir_disciplina(disciplina_id: int):
    if not db.excluir_disciplina(disciplina_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disciplina não encontrada.",
        )

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@app.post(
    "/alunos/{aluno_id}/matricular/{disciplina_id}",
    status_code=status.HTTP_201_CREATED,
)
def matricular_aluno(aluno_id: int, disciplina_id: int):
    if db.buscar_aluno(aluno_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado.",
        )

    if db.buscar_disciplina(disciplina_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Disciplina não encontrada.",
        )

    return db.matricular(aluno_id, disciplina_id)


@app.get(
    "/alunos/{aluno_id}/disciplinas",
    response_model=list[DisciplinaSaida],
)
def listar_disciplinas_do_aluno(aluno_id: int):
    if db.buscar_aluno(aluno_id) is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aluno não encontrado.",
        )

    return db.disciplinas_do_aluno(aluno_id)
