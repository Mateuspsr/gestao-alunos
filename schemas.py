from typing import Optional

from pydantic import BaseModel, Field


class AlunoEntrada(BaseModel):
    nome: str = Field(min_length=1, max_length=100)
    idade: Optional[int] = Field(default=None, ge=0, le=120)
    matricula: str = Field(min_length=1, max_length=20)
    media: float = Field(default=0, ge=0, le=10)


class AlunoAtualizacao(BaseModel):
    nome: Optional[str] = Field(default=None, min_length=1, max_length=100)
    idade: Optional[int] = Field(default=None, ge=0, le=120)
    media: Optional[float] = Field(default=None, ge=0, le=10)


class AlunoSaida(BaseModel):
    id: int
    nome: str
    idade: Optional[int]
    matricula: str
    media: float


class DisciplinaEntrada(BaseModel):
    nome: str = Field(min_length=1, max_length=100)
    carga_horaria: int = Field(gt=0)


class DisciplinaSaida(BaseModel):
    id: int
    nome: str
    carga_horaria: int