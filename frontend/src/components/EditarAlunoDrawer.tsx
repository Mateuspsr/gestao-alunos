import {
  useEffect,
  useState,
} from "react";

import {
  atualizarAluno,
} from "../api";

import type {
  Aluno,
  AlunoEntrada,
} from "../types";

interface EditarAlunoDrawerProps {
  aberto: boolean;
  aluno: Aluno;
  aoFechar: () => void;
  aoAtualizar: (
    aluno: Aluno
  ) => void;
}

function EditarAlunoDrawer({
  aberto,
  aluno,
  aoFechar,
  aoAtualizar,
}: EditarAlunoDrawerProps) {
  const [nome, setNome] =
    useState(aluno.nome);

  const [
    matricula,
    setMatricula,
  ] = useState(
    aluno.matricula
  );

  const [idade, setIdade] =
    useState(
      String(aluno.idade)
    );

  const [media, setMedia] =
    useState(
      String(aluno.media)
    );

  const [erros, setErros] =
    useState<
      Record<string, string>
    >({});

  const [
    erroGeral,
    setErroGeral,
  ] = useState<string | null>(
    null
  );

  const [
    salvando,
    setSalvando,
  ] = useState(false);

  useEffect(() => {
    if (!aberto) {
      return;
    }

    setNome(aluno.nome);
    setMatricula(
      aluno.matricula
    );
    setIdade(
      String(aluno.idade)
    );
    setMedia(
      String(aluno.media)
    );

    setErros({});
    setErroGeral(null);
  }, [aberto, aluno]);

  useEffect(() => {
    function fecharComEscape(
      evento: KeyboardEvent
    ) {
      if (
        evento.key ===
        "Escape"
      ) {
        aoFechar();
      }
    }

    if (aberto) {
      window.addEventListener(
        "keydown",
        fecharComEscape
      );
    }

    return () => {
      window.removeEventListener(
        "keydown",
        fecharComEscape
      );
    };
  }, [
    aberto,
    aoFechar,
  ]);

  function validar() {
    const novosErros:
      Record<string, string> =
        {};

    if (
      nome.trim().length < 3
    ) {
      novosErros.nome =
        "Informe o nome completo do aluno.";
    }

    if (
      matricula.trim() === ""
    ) {
      novosErros.matricula =
        "Informe a matrícula.";
    }

    const idadeNumero =
      Number(idade);

    if (
      !Number.isInteger(
        idadeNumero
      ) ||
      idadeNumero < 0 ||
      idadeNumero > 120
    ) {
      novosErros.idade =
        "Informe uma idade válida.";
    }

    const mediaNumero =
      Number(media);

    if (
      Number.isNaN(
        mediaNumero
      ) ||
      mediaNumero < 0 ||
      mediaNumero > 10
    ) {
      novosErros.media =
        "A média deve estar entre 0 e 10.";
    }

    setErros(
      novosErros
    );

    return (
      Object.keys(
        novosErros
      ).length === 0
    );
  }

  async function salvar(
    evento:
      React.FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    setErroGeral(null);

    if (!validar()) {
      return;
    }

    const dados:
      AlunoEntrada = {
        nome:
          nome.trim(),

        matricula:
          matricula.trim(),

        idade:
          Number(idade),

        media:
          Number(media),
      };

    try {
      setSalvando(true);

      const atualizado =
        await atualizarAluno(
          aluno.id,
          dados
        );

      aoAtualizar(
        atualizado
      );

      aoFechar();
    } catch (erro) {
      setErroGeral(
        erro instanceof Error
          ? erro.message
          : "Não foi possível atualizar o aluno."
      );
    } finally {
      setSalvando(false);
    }
  }

  if (!aberto) {
    return null;
  }

  return (
    <div
      className="drawer-overlay"
      onMouseDown={
        aoFechar
      }
    >
      <aside
        className="drawer"
        onMouseDown={(
          evento
        ) =>
          evento.stopPropagation()
        }
      >
        <div className="drawer-cabecalho">
          <div>
            <span className="pagina-etiqueta">
              EDIÇÃO
            </span>

            <h2>
              Editar aluno
            </h2>

            <p>
              Atualize os dados
              acadêmicos e pessoais.
            </p>
          </div>

          <button
            className="drawer-fechar"
            type="button"
            onClick={
              aoFechar
            }
            aria-label="Fechar edição"
          >
            ×
          </button>
        </div>

        <form
          className="formulario-aluno"
          onSubmit={
            salvar
          }
        >
          <label>
            <span>
              Nome completo
            </span>

            <input
              type="text"
              value={nome}
              onChange={(evento) =>
                setNome(
                  evento.target.value
                )
              }
              placeholder="Nome do aluno"
            />

            {erros.nome && (
              <small className="campo-erro">
                {erros.nome}
              </small>
            )}
          </label>

          <label>
            <span>
              Matrícula
            </span>

            <input
              type="text"
              value={
                matricula
              }
              onChange={(evento) =>
                setMatricula(
                  evento.target.value
                )
              }
              placeholder="Número da matrícula"
            />

            {erros.matricula && (
              <small className="campo-erro">
                {
                  erros.matricula
                }
              </small>
            )}
          </label>

          <div className="formulario-duas-colunas">
            <label>
              <span>
                Idade
              </span>

              <input
                type="number"
                min="0"
                max="120"
                value={idade}
                onChange={(evento) =>
                  setIdade(
                    evento.target.value
                  )
                }
              />

              {erros.idade && (
                <small className="campo-erro">
                  {
                    erros.idade
                  }
                </small>
              )}
            </label>

            <label>
              <span>
                Média geral
              </span>

              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={media}
                onChange={(evento) =>
                  setMedia(
                    evento.target.value
                  )
                }
              />

              {erros.media && (
                <small className="campo-erro">
                  {
                    erros.media
                  }
                </small>
              )}
            </label>
          </div>

          {erroGeral && (
            <div className="formulario-erro-geral">
              {erroGeral}
            </div>
          )}

          <div className="drawer-acoes">
            <button
              type="button"
              className="botao-secundario"
              onClick={
                aoFechar
              }
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="botao-primario"
              disabled={
                salvando
              }
            >
              {salvando
                ? "Salvando..."
                : "Salvar alterações"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

export default EditarAlunoDrawer;