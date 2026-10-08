import {
  useEffect,
  useState,
} from "react";

import {
  listarDisciplinasDoAluno,
} from "../api";

import type {
  Aluno,
  DisciplinaDoAluno,
} from "../types";

interface PerfilAlunoProps {
  aluno: Aluno;
  aoVoltar: () => void;
}

function PerfilAluno({
  aluno,
  aoVoltar,
}: PerfilAlunoProps) {
  const [
    disciplinas,
    setDisciplinas,
  ] = useState<
    DisciplinaDoAluno[]
  >([]);

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);

        const dados =
          await listarDisciplinasDoAluno(
            aluno.id
          );

        setDisciplinas(dados);
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [aluno.id]);

  const aprovadas =
    disciplinas.filter(
      (disciplina) =>
        disciplina.nota >= 6
    ).length;

  const reprovadas =
    disciplinas.length -
    aprovadas;

  const mediaDisciplinas =
    disciplinas.length > 0
      ? disciplinas.reduce(
          (
            soma,
            disciplina
          ) =>
            soma +
            disciplina.nota,
          0
        ) /
        disciplinas.length
      : 0;

  const iniciais =
    aluno.nome
      .split(" ")
      .slice(0, 2)
      .map(
        (parte) =>
          parte[0]
      )
      .join("")
      .toUpperCase();

  return (
    <section className="pagina perfil-aluno">
      <button
        className="botao-voltar"
        onClick={
          aoVoltar
        }
      >
        ← Voltar para alunos
      </button>

      <div className="perfil-card-principal">
        <div className="perfil-identidade">
          <div className="perfil-avatar">
            {iniciais}
          </div>

          <div>
            <span className="pagina-etiqueta">
              PERFIL ACADÊMICO
            </span>

            <h1>
              {aluno.nome}
            </h1>

            <p>
              Matrícula{" "}
              {aluno.matricula}
            </p>
          </div>

          <span
            className={
              aluno.media >= 6
                ? "perfil-status aprovado"
                : "perfil-status reprovado"
            }
          >
            {aluno.media >= 6
              ? "Aprovado"
              : "Reprovado"}
          </span>
        </div>

        <div className="perfil-metricas">
          <div>
            <span>
              Média geral
            </span>

            <strong>
              {aluno.media.toFixed(1)}
            </strong>
          </div>

          <div>
            <span>
              Idade
            </span>

            <strong>
              {aluno.idade}
            </strong>
          </div>

          <div>
            <span>
              Disciplinas
            </span>

            <strong>
              {disciplinas.length}
            </strong>
          </div>

          <div>
            <span>
              Aprovações
            </span>

            <strong className="texto-verde">
              {aprovadas}
            </strong>
          </div>
        </div>
      </div>

      <div className="perfil-conteudo-grid">
        <article className="perfil-painel perfil-disciplinas-painel">
          <div className="perfil-painel-cabecalho">
            <div>
              <span className="pagina-etiqueta">
                BOLETIM
              </span>

              <h2>
                Disciplinas e notas
              </h2>

              <p>
                Desempenho acadêmico
                do estudante.
              </p>
            </div>

            <span className="contador-disciplinas">
              {disciplinas.length}
            </span>
          </div>

          {carregando ? (
            <div className="estado-pagina estado-menor">
              <span className="carregador" />

              <p>
                Carregando boletim...
              </p>
            </div>
          ) : disciplinas.length ===
            0 ? (
            <div className="perfil-vazio">
              <h3>
                Nenhuma disciplina
              </h3>

              <p>
                Não existem disciplinas
                vinculadas a este aluno.
              </p>
            </div>
          ) : (
            <div className="perfil-lista-disciplinas">
              {disciplinas.map(
                (disciplina) => (
                  <div
                    className="perfil-disciplina"
                    key={
                      disciplina.id
                    }
                  >
                    <div className="perfil-disciplina-icone">
                      ▤
                    </div>

                    <div className="perfil-disciplina-info">
                      <strong>
                        {disciplina.nome}
                      </strong>

                      <span>
                        {
                          disciplina.carga_horaria
                        }{" "}
                        horas
                      </span>
                    </div>

                    <div className="perfil-disciplina-nota">
                      <span>
                        Nota
                      </span>

                      <strong
                        className={
                          disciplina.nota >=
                          6
                            ? "texto-verde"
                            : "texto-vermelho"
                        }
                      >
                        {disciplina.nota.toFixed(
                          1
                        )}
                      </strong>
                    </div>

                    <span
                      className={
                        disciplina.nota >=
                        6
                          ? "mini-status mini-aprovado"
                          : "mini-status mini-reprovado"
                      }
                    >
                      {disciplina.nota >=
                      6
                        ? "Aprovado"
                        : "Reprovado"}
                    </span>
                  </div>
                )
              )}
            </div>
          )}
        </article>

        <aside className="perfil-painel perfil-resumo">
          <span className="pagina-etiqueta">
            DESEMPENHO
          </span>

          <h2>
            Resumo acadêmico
          </h2>

          <div className="resumo-grande">
            <span>
              Média nas disciplinas
            </span>

            <strong>
              {mediaDisciplinas.toFixed(
                1
              )}
            </strong>
          </div>

          <div className="resumo-linha">
            <span>
              Aprovadas
            </span>

            <strong className="texto-verde">
              {aprovadas}
            </strong>
          </div>

          <div className="resumo-linha">
            <span>
              Reprovadas
            </span>

            <strong className="texto-vermelho">
              {reprovadas}
            </strong>
          </div>

          <div className="resumo-linha">
            <span>
              Total
            </span>

            <strong>
              {disciplinas.length}
            </strong>
          </div>
        </aside>
      </div>
    </section>
  );
}

export default PerfilAluno;