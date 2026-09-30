import os
from datetime import datetime, timedelta, timezone

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jwt.exceptions import InvalidTokenError
from pwdlib import PasswordHash

import db


load_dotenv()

ALGORITHM = "HS256"
JWT_SECRET = os.getenv("JWT_SECRET")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)

password_hash = PasswordHash.recommended()

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/auth/login"
)


def validar_configuracao():
    if not JWT_SECRET or JWT_SECRET == "troque-por-uma-chave-secreta-grande":
        raise RuntimeError(
            "Defina JWT_SECRET no arquivo .env antes de iniciar a aplicação."
        )


def gerar_hash_senha(senha):
    return password_hash.hash(senha)


def verificar_senha(senha, hash_armazenado):
    return password_hash.verify(
        senha,
        hash_armazenado
    )


def criar_token_acesso(username):
    validar_configuracao()

    expira_em = datetime.now(timezone.utc) + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {
        "sub": username,
        "exp": expira_em,
    }

    return jwt.encode(
        payload,
        JWT_SECRET,
        algorithm=ALGORITHM
    )


def autenticar_usuario(username, senha):
    usuario = db.buscar_usuario_por_username(
        username
    )

    if not usuario or not usuario["ativo"]:
        return None

    if not verificar_senha(
        senha,
        usuario["password_hash"]
    ):
        return None

    return usuario


def obter_usuario_atual(
    token=Depends(oauth2_scheme)
):
    validar_configuracao()

    erro_credenciais = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Token inválido ou expirado.",
        headers={
            "WWW-Authenticate": "Bearer"
        },
    )

    try:
        payload = jwt.decode(
            token,
            JWT_SECRET,
            algorithms=[ALGORITHM]
        )

        username = payload.get("sub")

        if not username:
            raise erro_credenciais

    except InvalidTokenError as erro:
        raise erro_credenciais from erro

    usuario = db.buscar_usuario_por_username(
        username
    )

    if not usuario or not usuario["ativo"]:
        raise erro_credenciais

    return usuario


def garantir_admin_inicial():
    username = os.getenv(
        "ADMIN_USERNAME",
        "admin"
    ).strip()

    senha = os.getenv(
        "ADMIN_PASSWORD",
        ""
    ).strip()

    if not senha or senha == "troque-esta-senha":
        raise RuntimeError(
            "Defina ADMIN_PASSWORD no arquivo .env antes de iniciar a aplicação."
        )

    if db.buscar_usuario_por_username(username) is None:
        db.inserir_usuario(
            username,
            gerar_hash_senha(senha)
        )