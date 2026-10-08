import {
  useEffect,
  useState,
} from "react";

import {
  excluirAluno,
  listarAlunos,
  listarDisciplinas,
  listarMatriculas,
} from "../api";

import type {
  Aluno,
  Disciplina,
  MatriculaDisciplina,
} from "../types";

import EditarAlunoDrawer from "./EditarAlunoDrawer";
import NovoAlunoDrawer from "./NovoAlunoDrawer";

interface PaginaMatriculasProps {
  aoAlunoCriado: (
    aluno: Aluno
  ) => void;

  aoAlunoAtualizado: (
    aluno: Aluno
  ) => void;

  aoExcluirAluno: (
    id: number
  ) => void;
}

type EtapaExclusao =
  | "fechada"
  | "aviso"
  | "matricula"
  | "confirmacao"
  | "sucesso";

function PaginaMatriculas({
  aoAlunoCriado,
  aoAlunoAtualizado,
  aoExcluirAluno,
}: PaginaMatriculasProps) {
  const [
    alunos,
    setAlunos,
  ] = useState<Aluno[]>([]);

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

  const [
    busca,
    setBusca,
  ] = useState("");

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    drawerNovoAberto,
    setDrawerNovoAberto,
  ] = useState(false);

  const [
    alunoEdicao,
    setAlunoEdicao,
  ] = useState<Aluno | null>(
    null
  );

  const [
    etapa,
    setEtapa,
  ] = useState<EtapaExclusao>(
    "fechada"
  );

  const [
    alunoExclusao,
    setAlunoExclusao,
  ] = useState<Aluno | null>(
    null
  );

  const [
    matriculaDigitada,
    setMatriculaDigitada,
  ] = useState("");

  const [
    erro,
    setErro,
  ] = useState<
    string | null
  >(null);

  const [
    excluindo,
    setExcluindo,
  ] = useState(false);

  useEffect(() => {
    async function carregar() {
      try {
        setCarregando(true);

        const [
          dadosAlunos,
          dadosDisciplinas,
          dadosMatriculas,
        ] = await Promise.all([
          listarAlunos(),
          listarDisciplinas(),
          listarMatriculas(),
        ]);

        setAlunos(
          dadosAlunos
        );

        setDisciplinas(
          dadosDisciplinas
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

  const termo =
    busca
      .toLowerCase()
      .trim();

  const alunosFiltrados =
    alunos.filter(
      (aluno) =>
        aluno.nome
          .toLowerCase()
          .includes(termo) ||
        aluno.matricula
          .toLowerCase()
          .includes(termo)
    );

  function disciplinasDoAluno(
    alunoId: number
  ) {
    return matriculas
      .filter(
        (matricula) =>
          matricula.aluno_id ===
          alunoId
      )
      .map(
        (matricula) => {
          const disciplina =
            disciplinas.find(
              (disciplina) =>
                disciplina.id ===
                matricula.disciplina_id
            );

          return {
            disciplina,
            nota:
              matricula.nota,
          };
        }
      )
      .filter(
        (
          item
        ): item is {
          disciplina: Disciplina;
          nota: number;
        } =>
          item.disciplina !==
          undefined
      );
  }

  function alunoCriado(
    novoAluno: Aluno
  ) {
    setAlunos(
      (atuais) => [
        ...atuais,
        novoAluno,
      ]
    );

    aoAlunoCriado(
      novoAluno
    );
  }

  function alunoAtualizado(
    atualizado: Aluno
  ) {
    setAlunos(
      (atuais) =>
        atuais.map(
          (aluno) =>
            aluno.id ===
            atualizado.id
              ? atualizado
              : aluno
        )
    );

    setAlunoEdicao(
      atualizado
    );

    aoAlunoAtualizado(
      atualizado
    );
  }

  function iniciarExclusao() {
    setAlunoExclusao(null);
    setMatriculaDigitada("");
    setErro(null);

    setEtapa("aviso");
  }

  function cancelarExclusao() {
    setEtapa("fechada");
    setAlunoExclusao(null);
    setMatriculaDigitada("");
    setErro(null);
  }

  function verificarMatricula() {
    const aluno =
      alunos.find(
        (aluno) =>
          aluno.matricula ===
          matriculaDigitada.trim()
      );

    if (!aluno) {
      setErro(
        "Nenhum aluno foi encontrado com essa matrícula."
      );

      return;
    }

    setAlunoExclusao(
      aluno
    );

    setErro(null);

    setEtapa(
      "confirmacao"
    );
  }

  async function confirmarExclusao() {
    if (
      !alunoExclusao
    ) {
      return;
    }

    try {
      setExcluindo(true);
      setErro(null);

      await excluirAluno(
        alunoExclusao.id
      );

      setAlunos(
        (atuais) =>
          atuais.filter(
            (aluno) =>
              aluno.id !==
              alunoExclusao.id
          )
      );

      setMatriculas(
        (atuais) =>
          atuais.filter(
            (matricula) =>
              matricula.aluno_id !==
              alunoExclusao.id
          )
      );

      aoExcluirAluno(
        alunoExclusao.id
      );

      setEtapa(
        "sucesso"
      );
    } catch (erro) {
      setErro(
        erro instanceof Error
          ? erro.message
          : "Não foi possível excluir o aluno."
      );
    } finally {
      setExcluindo(false);
    }
  }

  if (carregando) {
    return (
      <div className="estado-pagina">
        <span className="carregador" />

        <p>
          Carregando matrículas...
        </p>
      </div>
    );
  }

  return (
    <>
      <section className="pagina pagina-matriculas">
        <header className="pagina-cabecalho">
          <div>
            <span className="pagina-etiqueta">
              MATRÍCULAS
            </span>

            <h1>
              Gestão de matrículas
            </h1>

            <p>
              Cadastre e edite
              os registros dos
              alunos.
            </p>
          </div>

          <button
            className="botao-primario"
            onClick={() =>
              setDrawerNovoAberto(
                true
              )
            }
          >
            + Nova matrícula
          </button>
        </header>

        <div className="campo-busca busca-matriculas">
          <span>⌕</span>

          <input
            type="search"
            value={busca}
            onChange={(evento) =>
              setBusca(
                evento.target.value
              )
            }
            placeholder="Buscar por nome ou matrícula..."
          />
        </div>

        <article className="painel-matriculas">
          <div className="matriculas-titulo-linha">
            <div>
              <span className="pagina-etiqueta">
                CADASTROS
              </span>

              <h2>
                Alunos matriculados
              </h2>

              <p>
                Gerencie os dados
                cadastrais dos
                estudantes.
              </p>
            </div>

            <strong className="contador-matriculas">
              {
                alunosFiltrados.length
              }
            </strong>
          </div>

          <div className="lista-matriculas">
            {alunosFiltrados.map(
              (aluno) => (
                <div
                  className="matricula-item matricula-item-administrativo"
                  key={
                    aluno.id
                  }
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

                  <div className="matricula-dados">
                    <strong>
                      {aluno.nome}
                    </strong>

                    <span>
                      Matrícula{" "}
                      {
                        aluno.matricula
                      }
                    </span>
                  </div>

                  <div className="matricula-informacoes">
                    <div>
                      <span>
                        Idade
                      </span>

                      <strong>
                        {
                          aluno.idade
                        }
                      </strong>
                    </div>

                    <div>
                      <span>
                        Média
                      </span>

                      <strong>
                        {aluno.media.toFixed(
                          1
                        )}
                      </strong>
                    </div>
                  </div>

                  <div className="matricula-acoes">
                    <button
                      className="botao-editar-matricula"
                      onClick={() =>
                        setAlunoEdicao(
                          aluno
                        )
                      }
                    >
                      ✎ Editar
                    </button>
                  </div>
                </div>
              )
            )}
          </div>
        </article>

        <article className="zona-critica zona-critica-matriculas">
          <div>
            <span className="zona-etiqueta">
              ZONA CRÍTICA
            </span>

            <h2>
              Exclusão permanente
            </h2>

            <p>
              A exclusão de um aluno
              remove permanentemente
              seu cadastro e seus
              vínculos acadêmicos.
            </p>
          </div>

          <button
            className="botao-perigo"
            onClick={
              iniciarExclusao
            }
          >
            Iniciar exclusão
          </button>
        </article>
      </section>

      <NovoAlunoDrawer
        aberto={
          drawerNovoAberto
        }
        aoFechar={() =>
          setDrawerNovoAberto(
            false
          )
        }
        aoCriar={
          alunoCriado
        }
      />

      {alunoEdicao && (
        <EditarAlunoDrawer
          aberto={true}
          aluno={
            alunoEdicao
          }
          aoFechar={() =>
            setAlunoEdicao(
              null
            )
          }
          aoAtualizar={
            alunoAtualizado
          }
        />
      )}

      {etapa !==
        "fechada" && (
        <div className="modal-overlay">
          <div className="modal-seguranca">

            {etapa ===
              "aviso" && (
              <>
                <span className="zona-etiqueta">
                  ETAPA 1 DE 3
                </span>

                <h2>
                  Exclusão permanente
                </h2>

                <p>
                  Este procedimento
                  deve ser utilizado
                  apenas quando um
                  cadastro realmente
                  precisar ser removido.
                </p>

                <div className="alerta-final">
                  O aluno, seu cadastro
                  e seus vínculos
                  acadêmicos serão
                  excluídos
                  permanentemente.
                </div>

                <p>
                  Esta ação não poderá
                  ser desfeita.
                </p>

                <div className="modal-acoes">
                  <button
                    className="botao-secundario"
                    onClick={
                      cancelarExclusao
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    className="botao-perigo"
                    onClick={() =>
                      setEtapa(
                        "matricula"
                      )
                    }
                  >
                    Estou ciente,
                    continuar
                  </button>
                </div>
              </>
            )}

            {etapa ===
              "matricula" && (
              <>
                <span className="zona-etiqueta">
                  ETAPA 2 DE 3
                </span>

                <h2>
                  Identifique o aluno
                </h2>

                <p>
                  Digite exatamente
                  a matrícula do
                  estudante que deseja
                  excluir.
                </p>

                <label className="campo-confirmacao">
                  <span>
                    Matrícula do aluno
                  </span>

                  <input
                    type="text"
                    value={
                      matriculaDigitada
                    }
                    onChange={(evento) =>
                      setMatriculaDigitada(
                        evento.target.value
                      )
                    }
                    placeholder="Digite a matrícula completa"
                    autoFocus
                  />
                </label>

                {erro && (
                  <div className="formulario-erro-geral">
                    {erro}
                  </div>
                )}

                <div className="modal-acoes">
                  <button
                    className="botao-secundario"
                    onClick={
                      cancelarExclusao
                    }
                  >
                    Cancelar
                  </button>

                  <button
                    className="botao-perigo"
                    onClick={
                      verificarMatricula
                    }
                  >
                    Localizar aluno
                  </button>
                </div>
              </>
            )}

            {etapa ===
              "confirmacao" &&
              alunoExclusao && (
                <>
                  <span className="zona-etiqueta">
                    ETAPA 3 DE 3
                  </span>

                  <h2>
                    Confirme o cadastro
                  </h2>

                  <p>
                    Confira cuidadosamente
                    se este é realmente o
                    aluno que deve ser
                    excluído.
                  </p>

                  <div className="aluno-confirmacao aluno-confirmacao-detalhada">
                    <div className="confirmacao-identidade">
                      <div className="avatar-iniciais avatar-grande">
                        {alunoExclusao.nome
                          .split(" ")
                          .slice(0, 2)
                          .map(
                            (parte) =>
                              parte[0]
                          )
                          .join("")
                          .toUpperCase()}
                      </div>

                      <div>
                        <h3>
                          {
                            alunoExclusao.nome
                          }
                        </h3>

                        <span>
                          Matrícula{" "}
                          {
                            alunoExclusao.matricula
                          }
                        </span>
                      </div>
                    </div>

                    <div className="confirmacao-metricas">
                      <div>
                        <span>
                          Idade
                        </span>

                        <strong>
                          {
                            alunoExclusao.idade
                          }
                        </strong>
                      </div>

                      <div>
                        <span>
                          Média
                        </span>

                        <strong>
                          {alunoExclusao.media.toFixed(
                            1
                          )}
                        </strong>
                      </div>

                      <div>
                        <span>
                          Disciplinas
                        </span>

                        <strong>
                          {
                            disciplinasDoAluno(
                              alunoExclusao.id
                            ).length
                          }
                        </strong>
                      </div>
                    </div>

                    <div className="exclusao-disciplinas">
                      {disciplinasDoAluno(
                        alunoExclusao.id
                      ).map(
                        ({
                          disciplina,
                          nota,
                        }) => (
                          <div
                            key={
                              disciplina.id
                            }
                          >
                            <span>
                              {
                                disciplina.nome
                              }
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
                        )
                      )}
                    </div>
                  </div>

                  <div className="alerta-final">
                    Esta é a última
                    confirmação. Depois
                    da exclusão, o
                    cadastro não poderá
                    ser recuperado.
                  </div>

                  {erro && (
                    <div className="formulario-erro-geral">
                      {erro}
                    </div>
                  )}

                  <div className="modal-acoes">
                    <button
                      className="botao-secundario"
                      onClick={
                        cancelarExclusao
                      }
                    >
                      Cancelar
                    </button>

                    <button
                      className="botao-perigo"
                      disabled={
                        excluindo
                      }
                      onClick={
                        confirmarExclusao
                      }
                    >
                      {excluindo
                        ? "Excluindo..."
                        : "Excluir permanentemente"}
                    </button>
                  </div>
                </>
              )}

            {etapa ===
              "sucesso" && (
              <>
                <span className="pagina-etiqueta">
                  CONCLUÍDO
                </span>

                <h2>
                  Cadastro excluído
                </h2>

                <p>
                  O aluno foi removido
                  permanentemente do
                  sistema.
                </p>

                <div className="modal-acoes">
                  <button
                    className="botao-primario"
                    onClick={
                      cancelarExclusao
                    }
                  >
                    Concluir
                  </button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </>
  );
}

export default PaginaMatriculas;