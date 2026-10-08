import {
  useEffect,
  useState,
} from "react";

import {
  listarAlunos,
  listarDisciplinas,
  listarMatriculas,
  matricularAluno,
} from "../api";

import type {
  Aluno,
  Disciplina,
  MatriculaDisciplina,
} from "../types";

interface EstatisticaDisciplina {
  disciplina: Disciplina;
  alunos: number;
  naoVinculados: number;
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

  const [alunoId, setAlunoId] = useState("");
  const [disciplinaId, setDisciplinaId] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  async function registrarMatricula(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    if (!alunoId || !disciplinaId || enviando) return;
    setEnviando(true);
    setErro("");
    setMensagem("");
    try {
      await matricularAluno(Number(alunoId), Number(disciplinaId));
      setMatriculas(await listarMatriculas());
      setMensagem("Matrícula registrada. O vínculo também é mantido após atualizar a página.");
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível registrar a matrícula.");
    } finally {
      setEnviando(false);
    }
  }

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
      } catch (falha) {
        setErro(falha instanceof Error ? falha.message : "Erro ao carregar disciplinas.");
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, []);

  const estatisticas: EstatisticaDisciplina[] = disciplinas.map((disciplina) => {
    const quantidade = matriculas.filter((item) => item.disciplina_id === disciplina.id).length;
    return {
      disciplina,
      alunos: quantidade,
      naoVinculados: alunos.length - quantidade,
    };
  });

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

  const alunosDaDisciplina = detalhe
    ? matriculas
        .filter((item) => item.disciplina_id === detalhe.disciplina.id)
        .map((item) => alunos.find((aluno) => aluno.id === item.aluno_id))
        .filter((aluno): aluno is Aluno => aluno !== undefined)
        .sort((a, b) => a.nome.localeCompare(b.nome))
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
            Consulte as disciplinas e
            estudantes vinculados
            às disciplinas.
          </p>
        </div>
      </header>

      <form className="painel-matriculas" onSubmit={registrarMatricula}>
        <h2>Matricular aluno em uma disciplina</h2>
        <div className="formulario-duas-colunas">
          <label>
            <span>Aluno</span>
            <select value={alunoId} onChange={(evento) => setAlunoId(evento.target.value)} required>
              <option value="">Selecione um aluno</option>
              {alunos.map((aluno) => (
                <option key={aluno.id} value={aluno.id}>{aluno.nome} — {aluno.matricula}</option>
              ))}
            </select>
          </label>
          <label>
            <span>Disciplina</span>
            <select value={disciplinaId} onChange={(evento) => setDisciplinaId(evento.target.value)} required>
              <option value="">Selecione uma disciplina</option>
              {disciplinas.map((disciplina) => (
                <option key={disciplina.id} value={disciplina.id}>{disciplina.nome}</option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" className="botao-secundario" disabled={enviando}>
          {enviando ? "Registrando..." : "Registrar matrícula"}
        </button>
        {mensagem && <p className="formulario-sucesso" role="status">{mensagem}</p>}
        {erro && <p className="formulario-erro-geral" role="alert">{erro}</p>}
      </form>

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
                    Carga horária
                  </span>

                  <strong>
                    {item.disciplina.carga_horaria}
                  </strong>
                </div>
              </div>

              <div className="disciplina-status">
                <span className="disciplina-aprovados">
                  {item.alunos}{" "}
                  matriculados
                </span>

                <span className="disciplina-reprovados">
                  {item.naoVinculados}{" "}
                  não vinculados
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
                  Carga horária
                </span>

                <strong>
                  {detalhe.media.toFixed(
                    1
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Matriculados
                </span>

                <strong className="texto-verde">
                  {
                    detalhe.alunos
                  }
                </strong>
              </div>

              <div>
                <span>
                  Não vinculados
                </span>

                <strong className="texto-vermelho">
                  {
                    detalhe.naoVinculados
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
                (aluno) => (
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
                      <span>Média geral do aluno</span>
                      <strong>{aluno.media.toFixed(1)}</strong>
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