import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import { criarAluno } from "../api";
import type { Aluno } from "../types";

interface NovoAlunoDrawerProps {
  aberto: boolean;
  aoFechar: () => void;
  aoCriar: (aluno: Aluno) => void;
}

interface ErrosFormulario {
  nome?: string;
  matricula?: string;
  idade?: string;
  media?: string;
}

function NovoAlunoDrawer({
  aberto,
  aoFechar,
  aoCriar,
}: NovoAlunoDrawerProps) {
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] =
    useState("");
  const [idade, setIdade] = useState("");
  const [media, setMedia] = useState("");

  const [erros, setErros] =
    useState<ErrosFormulario>({});

  const [erroGeral, setErroGeral] =
    useState<string | null>(null);

  const [enviando, setEnviando] =
    useState(false);

  useEffect(() => {
    if (!aberto) {
      return;
    }

    function fecharComEsc(evento: KeyboardEvent) {
      if (evento.key === "Escape") {
        aoFechar();
      }
    }

    window.addEventListener(
      "keydown",
      fecharComEsc
    );

    return () => {
      window.removeEventListener(
        "keydown",
        fecharComEsc
      );
    };
  }, [aberto, aoFechar]);

  function limparFormulario() {
    setNome("");
    setMatricula("");
    setIdade("");
    setMedia("");
    setErros({});
    setErroGeral(null);
  }

  function validar() {
    const novosErros: ErrosFormulario = {};

    if (!nome.trim()) {
      novosErros.nome =
        "Informe o nome do aluno.";
    }

    if (!matricula.trim()) {
      novosErros.matricula =
        "Informe a matrícula.";
    }

    const idadeNumero = Number(idade);

    if (
      idade === "" ||
      !Number.isInteger(idadeNumero) ||
      idadeNumero < 0 ||
      idadeNumero > 120
    ) {
      novosErros.idade =
        "A idade deve ser um inteiro entre 0 e 120.";
    }

    const mediaNumero = Number(media);

    if (
      media === "" ||
      Number.isNaN(mediaNumero) ||
      mediaNumero < 0 ||
      mediaNumero > 10
    ) {
      novosErros.media =
        "A média deve estar entre 0 e 10.";
    }

    setErros(novosErros);

    return (
      Object.keys(novosErros).length === 0
    );
  }

  async function enviarFormulario(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    if (!validar()) {
      return;
    }

    try {
      setEnviando(true);
      setErroGeral(null);

      const novoAluno = await criarAluno({
        nome: nome.trim(),
        matricula: matricula.trim(),
        idade: Number(idade),
        media: Number(media),
      });

      aoCriar(novoAluno);
      limparFormulario();
      aoFechar();
    } catch (erro) {
      setErroGeral(
        erro instanceof Error
          ? erro.message
          : "Não foi possível cadastrar o aluno."
      );
    } finally {
      setEnviando(false);
    }
  }

  if (!aberto) {
    return null;
  }

  return (
    <div className="drawer-overlay">
      <aside
        className="drawer"
        aria-label="Cadastro de aluno"
      >
        <div className="drawer-cabecalho">
          <div>
            <span className="pagina-etiqueta">
              NOVO ALUNO
            </span>

            <h2>Cadastrar estudante</h2>

            <p>
              Adicione um novo aluno ao POLAR.
            </p>
          </div>

          <button
            className="drawer-fechar"
            onClick={aoFechar}
            aria-label="Fechar formulário"
            type="button"
          >
            ×
          </button>
        </div>

        <form
          className="formulario-aluno"
          onSubmit={enviarFormulario}
        >
          <label htmlFor="nome">
            <span>Nome completo</span>

            <input
              id="nome"
              type="text"
              value={nome}
              onChange={(evento) =>
                setNome(evento.target.value)
              }
              placeholder="Ex.: Ana Souza"
            />

            {erros.nome && (
              <small className="campo-erro">
                {erros.nome}
              </small>
            )}
          </label>

          <label htmlFor="matricula">
            <span>Matrícula</span>

            <input
              id="matricula"
              type="text"
              value={matricula}
              onChange={(evento) =>
                setMatricula(
                  evento.target.value
                )
              }
              placeholder="Ex.: 2026007"
            />

            {erros.matricula && (
              <small className="campo-erro">
                {erros.matricula}
              </small>
            )}
          </label>

          <div className="formulario-duas-colunas">
            <label htmlFor="idade">
              <span>Idade</span>

              <input
                id="idade"
                type="number"
                min="0"
                max="120"
                value={idade}
                onChange={(evento) =>
                  setIdade(
                    evento.target.value
                  )
                }
                placeholder="18"
              />

              {erros.idade && (
                <small className="campo-erro">
                  {erros.idade}
                </small>
              )}
            </label>

            <label htmlFor="media">
              <span>Média</span>

              <input
                id="media"
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
                placeholder="8.5"
              />

              {erros.media && (
                <small className="campo-erro">
                  {erros.media}
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
              onClick={aoFechar}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="botao-primario"
              disabled={enviando}
            >
              {enviando
                ? "Cadastrando..."
                : "Cadastrar aluno"}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

export default NovoAlunoDrawer;