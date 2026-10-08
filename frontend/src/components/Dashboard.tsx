import {
  useEffect,
  useState,
} from "react";

import {
  listarDisciplinas,
  listarMatriculas,
} from "../api";

import type {
  Aluno,
  Disciplina,
  MatriculaDisciplina,
} from "../types";

interface DashboardProps {
  alunos: Aluno[];
}

interface DesempenhoDisciplina {
  disciplina: Disciplina;
  total: number;
}

function Dashboard({
  alunos,
}: DashboardProps) {
  const [
    disciplinas,
    setDisciplinas,
  ] = useState<Disciplina[]>([]);

  const [
    matriculas,
    setMatriculas,
  ] = useState<
    MatriculaDisciplina[]
  >([]);

  useEffect(() => {
    async function carregar() {
      const [
        dadosDisciplinas,
        dadosMatriculas,
      ] = await Promise.all([
        listarDisciplinas(),
        listarMatriculas(),
      ]);

      setDisciplinas(
        dadosDisciplinas
      );

      setMatriculas(
        dadosMatriculas
      );
    }

    carregar();
  }, [alunos]);

  const totalAlunos =
    alunos.length;

  const aprovados =
    alunos.filter(
      (aluno) =>
        aluno.media >= 6
    ).length;

  const reprovados =
    totalAlunos -
    aprovados;

  const mediaGeral =
    totalAlunos > 0
      ? alunos.reduce(
          (
            soma,
            aluno
          ) =>
            soma +
            aluno.media,
          0
        ) /
        totalAlunos
      : 0;

  const percentualAprovados =
    totalAlunos > 0
      ? Math.round(
          (aprovados /
            totalAlunos) *
            100
        )
      : 0;

  const percentualReprovados =
    totalAlunos > 0
      ? Math.round(
          (reprovados /
            totalAlunos) *
            100
        )
      : 0;

  const melhoresAlunos = [
    ...alunos,
  ]
    .sort(
      (a, b) =>
        b.media -
        a.media
    )
    .slice(0, 3);

  const desempenho: DesempenhoDisciplina[] = disciplinas.map((disciplina) => ({
    disciplina,
    total: matriculas.filter((vinculo) => vinculo.disciplina_id === disciplina.id).length,
  }));
  const maisMatriculas = [...desempenho].sort((a, b) => b.total - a.total)[0];
  const menosMatriculas = [...desempenho].sort((a, b) => a.total - b.total)[0];

  return (
    <section className="pagina">
      <header className="pagina-cabecalho">
        <div>
          <span className="pagina-etiqueta">
            VISÃO GERAL
          </span>

          <h1>
            Painel acadêmico
          </h1>

          <p>
            Acompanhe os principais
            indicadores da escola.
          </p>
        </div>
      </header>

      <div className="metricas">
        <article className="metrica-card">
          <span>
            Total de alunos
          </span>

          <strong>
            {totalAlunos}
          </strong>
        </article>

        <article className="metrica-card">
          <span>
            Aprovados
          </span>

          <strong>
            {aprovados}
          </strong>
        </article>

        <article className="metrica-card">
          <span>
            Reprovados
          </span>

          <strong>
            {reprovados}
          </strong>
        </article>

        <article className="metrica-card">
          <span>
            Média geral
          </span>

          <strong>
            {mediaGeral.toFixed(
              1
            )}
          </strong>
        </article>
      </div>

      <div className="dashboard-grid">
        <article className="painel-dashboard">
          <div className="painel-titulo">
            <span>
              DESEMPENHO
            </span>

            <h2>
              Situação geral
            </h2>
          </div>

          <div className="desempenho-item">
            <div className="desempenho-cabecalho">
              <span>
                Aprovados
              </span>

              <strong>
                {
                  percentualAprovados
                }
                %
              </strong>
            </div>

            <div className="barra-progresso">
              <div
                className="barra-preenchimento aprovado-barra"
                style={{
                  width:
                    `${percentualAprovados}%`,
                }}
              />
            </div>
          </div>

          <div className="desempenho-item">
            <div className="desempenho-cabecalho">
              <span>
                Reprovados
              </span>

              <strong>
                {
                  percentualReprovados
                }
                %
              </strong>
            </div>

            <div className="barra-progresso">
              <div
                className="barra-preenchimento reprovado-barra"
                style={{
                  width:
                    `${percentualReprovados}%`,
                }}
              />
            </div>
          </div>
        </article>

        <article className="painel-dashboard">
          <div className="painel-titulo">
            <span>
              DESTAQUES
            </span>

            <h2>
              Maiores médias
            </h2>
          </div>

          <div className="ranking">
            {melhoresAlunos.map(
              (
                aluno,
                indice
              ) => (
                <div
                  className="ranking-item"
                  key={
                    aluno.id
                  }
                >
                  <span className="ranking-posicao">
                    {indice +
                      1}
                  </span>

                  <div className="ranking-aluno">
                    <strong>
                      {
                        aluno.nome
                      }
                    </strong>

                    <span>
                      {
                        aluno.matricula
                      }
                    </span>
                  </div>

                  <strong className="ranking-media">
                    {aluno.media.toFixed(
                      1
                    )}
                  </strong>
                </div>
              )
            )}
          </div>
        </article>

        <article className="painel-dashboard painel-disciplinas">
          <div className="painel-titulo">
            <span>
              DISCIPLINAS
            </span>

            <h2>
              Matrículas por
              disciplina
            </h2>
          </div>

          <div className="disciplinas-preview">
            <div className="destaque-disciplina destaque-positivo">
              <span>
                MAIS MATRÍCULAS
              </span>

              <strong>
                {maisMatriculas
                  ?.disciplina
                  .nome ??
                  "Sem dados"}
              </strong>

              <p>
                {maisMatriculas
                  ? `${maisMatriculas.total} alunos matriculados`
                  : ""}
              </p>
            </div>

            <div className="destaque-disciplina destaque-negativo">
              <span>
                MENOS MATRÍCULAS
              </span>

              <strong>
                {menosMatriculas
                  ?.disciplina
                  .nome ??
                  "Sem dados"}
              </strong>

              <p>
                {menosMatriculas
                  ? `${menosMatriculas.total} alunos matriculados`
                  : ""}
              </p>
            </div>
          </div>

          <div className="dashboard-disciplinas-lista">
            {desempenho.map(
              (item) => {
                const percentual =
                  item.total >
                  0
                    ? Math.round(
                        (item.total /
                          alunos.length) *
                          100
                      )
                    : 0;

                return (
                  <div
                    className="dashboard-disciplina-item"
                    key={
                      item.disciplina.id
                    }
                  >
                    <div>
                      <strong>
                        {
                          item.disciplina
                            .nome
                        }
                      </strong>

                      <span>
                        {
                          item.total
                        }{" "}
                        alunos
                      </span>
                    </div>

                    <div className="dashboard-disciplina-barra">
                      <div className="barra-progresso">
                        <div
                          className="barra-preenchimento aprovado-barra"
                          style={{
                            width:
                              `${percentual}%`,
                          }}
                        />
                      </div>

                      <span>
                        {
                          percentual
                        }
                        % dos alunos
                      </span>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        </article>
      </div>
    </section>
  );
}

export default Dashboard;