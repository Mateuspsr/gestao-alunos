from pathlib import Path
from typing import Optional

from fastapi import (
    Depends,
    FastAPI,
    HTTPException,
    Query,
    Response,
    status,
)

from fastapi.responses import (
    RedirectResponse
)

from fastapi.security import (
    OAuth2PasswordRequestForm
)

from fastapi.staticfiles import (
    StaticFiles
)

from psycopg2.errors import (
    UniqueViolation
)

import auth
import db

from schemas import (
    AlunoAtualizacao,
    AlunoEntrada,
    AlunoSaida,
    DisciplinaEntrada,
    DisciplinaSaida,
    TokenSaida,
    UsuarioSaida,
)


app = FastAPI(
    title="Gestão de Alunos",
    version="3.0-base"
)


FRONTEND_DIR = (
    Path(__file__)
    .resolve()
    .parent
    / "frontend"
)


app.mount(
    "/app",
    StaticFiles(
        directory=FRONTEND_DIR,
        html=True
    ),
    name="frontend"
)


@app.on_event("startup")
def ao_iniciar():
    db.criar_tabelas()
    auth.validar_configuracao()
    auth.garantir_admin_inicial()


@app.get(
    "/",
    include_in_schema=False
)
def inicio():
    return RedirectResponse(
        url="/app/"
    )


@app.get("/health")
def health():
    return {
        "status": "ok"
    }


@app.post(
    "/auth/login",
    response_model=TokenSaida
)
def login(
    form_data:
        OAuth2PasswordRequestForm
        = Depends()
):
    usuario = auth.autenticar_usuario(
        form_data.username,
        form_data.password
    )

    if usuario is None:
        raise HTTPException(
            status_code=(
                status.HTTP_401_UNAUTHORIZED
            ),
            detail=(
                "Usuário ou senha inválidos."
            ),
            headers={
                "WWW-Authenticate":
                    "Bearer"
            },
        )

    return {
        "access_token":
            auth.criar_token_acesso(
                usuario["username"]
            ),
        "token_type": "bearer",
    }


@app.get(
    "/auth/me",
    response_model=UsuarioSaida
)
def usuario_atual(
    usuario=Depends(
        auth.obter_usuario_atual
    )
):
    return usuario


@app.post(
    "/alunos",
    response_model=AlunoSaida,
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def criar_aluno(
    payload: AlunoEntrada,
    _usuario=Depends(
        auth.obter_usuario_atual
    ),
):
    try:
        return db.inserir_aluno(
            nome=payload.nome,
            idade=payload.idade,
            matricula=payload.matricula,
            media=payload.media,
        )

    except UniqueViolation as erro:
        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=(
                "Matrícula já cadastrada."
            ),
        ) from erro


@app.get(
    "/alunos",
    response_model=list[AlunoSaida]
)
def listar_alunos(
    idade_minima:
        Optional[int]
        = Query(
            default=None,
            ge=0,
            le=120
        ),

    media_minima:
        Optional[float]
        = Query(
            default=None,
            ge=0,
            le=10
        ),

    q:
        Optional[str]
        = Query(default=None),

    _usuario=Depends(
        auth.obter_usuario_atual
    ),
):
    return db.listar_alunos(
        idade_minima=idade_minima,
        media_minima=media_minima,
        q=q,
    )


@app.get(
    "/alunos/{aluno_id}",
    response_model=AlunoSaida
)
def buscar_aluno(
    aluno_id: int,
    _usuario=Depends(
        auth.obter_usuario_atual
    ),
):
    aluno = db.buscar_aluno(
        aluno_id
    )

    if aluno is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Aluno não encontrado."
            ),
        )

    return aluno


@app.patch(
    "/alunos/{aluno_id}",
    response_model=AlunoSaida
)
def atualizar_aluno(
    aluno_id: int,
    payload: AlunoAtualizacao,
    _usuario=Depends(
        auth.obter_usuario_atual
    ),
):
    campos = payload.model_dump(
        exclude_unset=True
    )

    aluno = db.atualizar_aluno(
        aluno_id,
        **campos
    )

    if aluno is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Aluno não encontrado."
            ),
        )

    return aluno


@app.delete(
    "/alunos/{aluno_id}",
    status_code=(
        status.HTTP_204_NO_CONTENT
    ),
    response_class=Response,
)
def excluir_aluno(
    aluno_id: int,
    _usuario=Depends(
        auth.obter_usuario_atual
    ),
):
    if not db.excluir_aluno(
        aluno_id
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Aluno não encontrado."
            ),
        )

    return Response(
        status_code=(
            status.HTTP_204_NO_CONTENT
        )
    )


@app.post(
    "/disciplinas",
    response_model=DisciplinaSaida,
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def criar_disciplina(
    payload: DisciplinaEntrada,
    _usuario=Depends(
        auth.obter_usuario_atual
    ),
):
    try:
        return db.inserir_disciplina(
            nome=payload.nome,
            carga_horaria=(
                payload.carga_horaria
            ),
        )

    except UniqueViolation as erro:
        raise HTTPException(
            status_code=(
                status.HTTP_409_CONFLICT
            ),
            detail=(
                "Disciplina já cadastrada."
            ),
        ) from erro


@app.get(
    "/disciplinas",
    response_model=list[
        DisciplinaSaida
    ]
)
def listar_disciplinas(
    _usuario=Depends(
        auth.obter_usuario_atual
    )
):
    return db.listar_disciplinas()


@app.delete(
    "/disciplinas/{disciplina_id}",
    status_code=(
        status.HTTP_204_NO_CONTENT
    ),
    response_class=Response,
)
def excluir_disciplina(
    disciplina_id: int,
    _usuario=Depends(
        auth.obter_usuario_atual
    ),
):
    if not db.excluir_disciplina(
        disciplina_id
    ):
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Disciplina não encontrada."
            ),
        )

    return Response(
        status_code=(
            status.HTTP_204_NO_CONTENT
        )
    )


@app.post(
    "/alunos/{aluno_id}/matricular/{disciplina_id}",
    status_code=(
        status.HTTP_201_CREATED
    ),
)
def matricular_aluno(
    aluno_id: int,
    disciplina_id: int,
    _usuario=Depends(
        auth.obter_usuario_atual
    ),
):
    if db.buscar_aluno(
        aluno_id
    ) is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Aluno não encontrado."
            ),
        )

    if db.buscar_disciplina(
        disciplina_id
    ) is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Disciplina não encontrada."
            ),
        )

    return db.matricular(
        aluno_id,
        disciplina_id
    )


@app.get(
    "/alunos/{aluno_id}/disciplinas",
    response_model=list[
        DisciplinaSaida
    ],
)
def listar_disciplinas_do_aluno(
    aluno_id: int,
    _usuario=Depends(
        auth.obter_usuario_atual
    ),
):
    if db.buscar_aluno(
        aluno_id
    ) is None:
        raise HTTPException(
            status_code=(
                status.HTTP_404_NOT_FOUND
            ),
            detail=(
                "Aluno não encontrado."
            ),
        )

    return db.disciplinas_do_aluno(
        aluno_id
    )