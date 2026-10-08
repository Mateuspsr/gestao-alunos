import {
  useEffect,
  useState,
} from "react";

import {
  listarAlunos,
  listarDisciplinas,
  listarMatriculas,
} from "../api";

import type {
  Aluno,
  Disciplina,
  MatriculaDisciplina,
} from "../types";

interface EstatisticaDisciplina {
  disciplina: Disciplina;
  alunos: number;
  aprovados: number;
  reprovados: number;
  media: number;
}

function PaginaDisciplinas() {
  const [
    disciplinas,
    setDisciplinas,
  ] = useState<Disciplina[]>([]);

  const [
    alunos,
    setAlunos,
  ] = useState<Aluno[]>([]);

  const [
    matriculas,
    setMatriculas,
  ] = useState<
    MatriculaDisciplina[]
  >([]);

  const [
    busca,
    setBusca,
  ] = useState("");

  const [
    disciplinaSelecionada,
    setDisciplinaSelecionada,
  ] = useState<number | null>(
    null
  );

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);

        const [
          dadosDisciplinas,
          dadosAlunos,
          dadosMatriculas,
        ] = await Promise.all([
          listarDisciplinas(),
          listarAlunos(),
          listarMatriculas(),
        ]);

        setDisciplinas(
          dadosDisciplinas
        );

        setAlunos(
          dadosAlunos
        );

        setMatriculas(
          dadosMatriculas
        );
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  const estatisticas:
    EstatisticaDisciplina[] =
      disciplinas.map(
        (disciplina) => {
          const vinculos =
            matriculas.filter(
              (matricula) =>
                matricula.disciplina_id ===
                disciplina.id
            );

          const aprovados =
            vinculos.filter(
              (matricula) =>
                matricula.nota >= 6
            ).length;

          const reprovados =
            vinculos.length -
            aprovados;

          const media =
            vinculos.length > 0
              ? vinculos.reduce(
                  (
                    soma,
                    matricula
                  ) =>
                    soma +
                    matricula.nota,
                  0
                ) /
                vinculos.length
              : 0;

          return {
            disciplina,
            alunos:
              vinculos.length,
            aprovados,
            reprovados,
            media,
          };
        }
      );

  const disciplinasFiltradas =
    estatisticas.filter(
      (item) =>
        item.disciplina.nome
          .toLowerCase()
          .includes(
            busca.toLowerCase()
          )
    );

  const detalhe =
    disciplinaSelecionada !==
    null
      ? estatisticas.find(
          (item) =>
            item.disciplina.id ===
            disciplinaSelecionada
        )
      : null;

  const alunosDaDisciplina =
    detalhe
      ? matriculas
          .filter(
            (matricula) =>
              matricula.disciplina_id ===
              detalhe.disciplina.id
          )
          .map(
            (matricula) => {
              const aluno =
                alunos.find(
                  (aluno) =>
                    aluno.id ===
                    matricula.aluno_id
                );

              return {
                aluno,
                nota:
                  matricula.nota,
              };
            }
          )
          .filter(
            (
              item
            ): item is {
              aluno: Aluno;
              nota: number;
            } =>
              item.aluno !==
              undefined
          )
          .sort(
            (a, b) =>
              b.nota - a.nota
          )
      : [];

  if (carregando) {
    return (
      <div className="estado-pagina">
        <span className="carregador" />

        <p>
          Carregando disciplinas...
        </p>
      </div>
    );
  }

  return (
    <section className="pagina">
      <header className="pagina-cabecalho">
        <div>
          <span className="pagina-etiqueta">
            DISCIPLINAS
          </span>

          <h1>
            Gestão de disciplinas
          </h1>

          <p>
            Analise desempenho e
            estudantes vinculados
            às disciplinas.
          </p>
        </div>
      </header>

      <div className="campo-busca busca-disciplinas">
        <span>⌕</span>

        <input
          type="search"
          placeholder="Buscar disciplina..."
          value={busca}
          onChange={(evento) =>
            setBusca(
              evento.target.value
            )
          }
        />
      </div>

      <div className="disciplinas-grid">
        {disciplinasFiltradas.map(
          (item) => (
            <button
              className="disciplina-card"
              key={
                item.disciplina.id
              }
              onClick={() =>
                setDisciplinaSelecionada(
                  item.disciplina.id
                )
              }
            >
              <div className="disciplina-card-topo">
                <div className="disciplina-icone">
                  ▤
                </div>

                <span>
                  {
                    item.disciplina
                      .carga_horaria
                  }h
                </span>
              </div>

              <h2>
                {
                  item.disciplina
                    .nome
                }
              </h2>

              <div className="disciplina-metricas">
                <div>
                  <span>
                    Alunos
                  </span>

                  <strong>
                    {item.alunos}
                  </strong>
                </div>

                <div>
                  <span>
                    Média
                  </span>

                  <strong>
                    {item.media.toFixed(
                      1
                    )}
                  </strong>
                </div>
              </div>

              <div className="disciplina-status">
                <span className="disciplina-aprovados">
                  {item.aprovados}{" "}
                  aprovados
                </span>

                <span className="disciplina-reprovados">
                  {item.reprovados}{" "}
                  reprovados
                </span>
              </div>
            </button>
          )
        )}
      </div>

      {detalhe && (
        <div className="modal-overlay">
          <div className="modal-disciplina">
            <div className="modal-disciplina-cabecalho">
              <div>
                <span className="pagina-etiqueta">
                  DISCIPLINA
                </span>

                <h2>
                  {
                    detalhe.disciplina
                      .nome
                  }
                </h2>

                <p>
                  {
                    detalhe.disciplina
                      .carga_horaria
                  }{" "}
                  horas
                </p>
              </div>

              <button
                className="drawer-fechar"
                onClick={() =>
                  setDisciplinaSelecionada(
                    null
                  )
                }
                aria-label="Fechar disciplina"
              >
                ×
              </button>
            </div>

            <div className="detalhe-metricas">
              <div>
                <span>
                  Alunos
                </span>

                <strong>
                  {detalhe.alunos}
                </strong>
              </div>

              <div>
                <span>
                  Média
                </span>

                <strong>
                  {detalhe.media.toFixed(
                    1
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Aprovados
                </span>

                <strong className="texto-verde">
                  {
                    detalhe.aprovados
                  }
                </strong>
              </div>

              <div>
                <span>
                  Reprovados
                </span>

                <strong className="texto-vermelho">
                  {
                    detalhe.reprovados
                  }
                </strong>
              </div>
            </div>

            <div className="lista-disciplina-alunos">
              <div className="lista-disciplina-titulo">
                <span>
                  ESTUDANTES
                </span>

                <strong>
                  {
                    alunosDaDisciplina.length
                  }
                </strong>
              </div>

              {alunosDaDisciplina.map(
                ({
                  aluno,
                  nota,
                }) => (
                  <div
                    className="disciplina-aluno-item"
                    key={aluno.id}
                  >
                    <div className="avatar-iniciais">
                      {aluno.nome
                        .split(" ")
                        .slice(0, 2)
                        .map(
                          (parte) =>
                            parte[0]
                        )
                        .join("")
                        .toUpperCase()}
                    </div>

                    <div className="disciplina-aluno-dados">
                      <strong>
                        {aluno.nome}
                      </strong>

                      <span>
                        {
                          aluno.matricula
                        }
                      </span>
                    </div>

                    <div className="disciplina-aluno-nota">
                      <span>
                        Nota
                      </span>

                      <strong
                        className={
                          nota >= 6
                            ? "texto-verde"
                            : "texto-vermelho"
                        }
                      >
                        {nota.toFixed(
                          1
                        )}
                      </strong>
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default PaginaDisciplinas;