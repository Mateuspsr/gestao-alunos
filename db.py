import os

import psycopg2
from dotenv import load_dotenv
from psycopg2.extras import RealDictCursor


load_dotenv()


CONFIG = {
    "host": os.getenv("DB_HOST", "localhost"),
    "dbname": os.getenv("DB_NAME", "gestao_alunos"),
    "user": os.getenv("DB_USER", "curso"),
    "password": os.getenv("DB_PASSWORD", "senha123"),
}


def conectar():
    return psycopg2.connect(
        **CONFIG,
        cursor_factory=RealDictCursor,
    )


def criar_tabelas():
    conexao = conectar()

    try:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS alunos (
                    id SERIAL PRIMARY KEY,
                    nome VARCHAR(100) NOT NULL,
                    idade INTEGER,
                    matricula VARCHAR(20) UNIQUE NOT NULL,
                    media NUMERIC(4, 2) DEFAULT 0
                )
                """
            )

            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS disciplinas (
                    id SERIAL PRIMARY KEY,
                    nome VARCHAR(100) UNIQUE NOT NULL,
                    carga_horaria INTEGER NOT NULL
                )
                """
            )

            cursor.execute(
                """
                CREATE TABLE IF NOT EXISTS matriculas (
                    id SERIAL PRIMARY KEY,
                    aluno_id INTEGER REFERENCES alunos(id) ON DELETE CASCADE,
                    disciplina_id INTEGER REFERENCES disciplinas(id) ON DELETE CASCADE,
                    UNIQUE (aluno_id, disciplina_id)
                )
                """
            )

        conexao.commit()

    except Exception:
        conexao.rollback()
        raise

    finally:
        conexao.close()


def inserir_aluno(nome, idade, matricula, media=0):
    conexao = conectar()

    try:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO alunos (nome, idade, matricula, media)
                VALUES (%s, %s, %s, %s)
                RETURNING *
                """,
                (nome, idade, matricula, media),
            )
            aluno = cursor.fetchone()

        conexao.commit()
        return aluno

    except Exception:
        conexao.rollback()
        raise

    finally:
        conexao.close()


def listar_alunos(idade_minima=None, media_minima=None, q=None):
    conexao = conectar()

    try:
        consulta = "SELECT * FROM alunos WHERE TRUE"
        valores = []

        if idade_minima is not None:
            consulta += " AND idade >= %s"
            valores.append(idade_minima)

        if media_minima is not None:
            consulta += " AND media >= %s"
            valores.append(media_minima)

        if q:
            consulta += " AND nome ILIKE %s"
            valores.append(f"%{q}%")

        consulta += " ORDER BY id"

        with conexao.cursor() as cursor:
            cursor.execute(consulta, valores)
            return cursor.fetchall()

    finally:
        conexao.close()


def buscar_aluno(aluno_id):
    conexao = conectar()

    try:
        with conexao.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM alunos WHERE id = %s",
                (aluno_id,),
            )
            return cursor.fetchone()

    finally:
        conexao.close()


def atualizar_aluno(aluno_id, **campos):
    if not campos:
        return buscar_aluno(aluno_id)

    colunas_permitidas = {"nome", "idade", "media"}
    campos_validos = {
        coluna: valor
        for coluna, valor in campos.items()
        if coluna in colunas_permitidas
    }

    if not campos_validos:
        return buscar_aluno(aluno_id)

    alteracoes = ", ".join(
        f"{coluna} = %s" for coluna in campos_validos
    )

    valores = list(campos_validos.values())
    valores.append(aluno_id)

    conexao = conectar()

    try:
        with conexao.cursor() as cursor:
            cursor.execute(
                f"""
                UPDATE alunos
                SET {alteracoes}
                WHERE id = %s
                RETURNING *
                """,
                valores,
            )
            aluno = cursor.fetchone()

        conexao.commit()
        return aluno

    except Exception:
        conexao.rollback()
        raise

    finally:
        conexao.close()


def excluir_aluno(aluno_id):
    conexao = conectar()

    try:
        with conexao.cursor() as cursor:
            cursor.execute(
                "DELETE FROM alunos WHERE id = %s",
                (aluno_id,),
            )
            excluido = cursor.rowcount > 0

        conexao.commit()
        return excluido

    except Exception:
        conexao.rollback()
        raise

    finally:
        conexao.close()


def inserir_disciplina(nome, carga_horaria):
    conexao = conectar()

    try:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO disciplinas (nome, carga_horaria)
                VALUES (%s, %s)
                RETURNING *
                """,
                (nome, carga_horaria),
            )
            disciplina = cursor.fetchone()

        conexao.commit()
        return disciplina

    except Exception:
        conexao.rollback()
        raise

    finally:
        conexao.close()


def listar_disciplinas():
    conexao = conectar()

    try:
        with conexao.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM disciplinas ORDER BY id"
            )
            return cursor.fetchall()

    finally:
        conexao.close()


def buscar_disciplina(disciplina_id):
    conexao = conectar()

    try:
        with conexao.cursor() as cursor:
            cursor.execute(
                "SELECT * FROM disciplinas WHERE id = %s",
                (disciplina_id,),
            )
            return cursor.fetchone()

    finally:
        conexao.close()


def excluir_disciplina(disciplina_id):
    conexao = conectar()

    try:
        with conexao.cursor() as cursor:
            cursor.execute(
                "DELETE FROM disciplinas WHERE id = %s",
                (disciplina_id,),
            )
            excluida = cursor.rowcount > 0

        conexao.commit()
        return excluida

    except Exception:
        conexao.rollback()
        raise

    finally:
        conexao.close()


def matricular(aluno_id, disciplina_id):
    conexao = conectar()

    try:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                INSERT INTO matriculas (aluno_id, disciplina_id)
                VALUES (%s, %s)
                ON CONFLICT (aluno_id, disciplina_id) DO NOTHING
                RETURNING *
                """,
                (aluno_id, disciplina_id),
            )
            matricula = cursor.fetchone()

            if matricula is None:
                cursor.execute(
                    """
                    SELECT *
                    FROM matriculas
                    WHERE aluno_id = %s AND disciplina_id = %s
                    """,
                    (aluno_id, disciplina_id),
                )
                matricula = cursor.fetchone()

        conexao.commit()
        return matricula

    except Exception:
        conexao.rollback()
        raise

    finally:
        conexao.close()


def disciplinas_do_aluno(aluno_id):
    conexao = conectar()

    try:
        with conexao.cursor() as cursor:
            cursor.execute(
                """
                SELECT d.*
                FROM disciplinas AS d
                JOIN matriculas AS m
                  ON m.disciplina_id = d.id
                WHERE m.aluno_id = %s
                ORDER BY d.id
                """,
                (aluno_id,),
            )
            return cursor.fetchall()

    finally:
        conexao.close()