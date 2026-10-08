import {
  useEffect,
  useState,
} from "react";

import {
  listarAlunos,
} from "../api";

import type {
  Aluno,
  FiltrosAluno,
} from "../types";

import ListaAlunos from "./ListaAlunos";
import PerfilAluno from "./PerfilAluno";

type Situacao =
  | "todos"
  | "aprovados"
  | "reprovados";

type Ordenacao =
  | "nome-az"
  | "maior-media"
  | "menor-media";

function PaginaAlunos() {
  const [busca, setBusca] =
    useState("");

  const [
    idadeMinima,
    setIdadeMinima,
  ] = useState("");

  const [
    mediaMinima,
    setMediaMinima,
  ] = useState("");

  const [
    situacao,
    setSituacao,
  ] =
    useState<Situacao>(
      "todos"
    );

  const [
    ordenacao,
    setOrdenacao,
  ] =
    useState<Ordenacao>(
      "nome-az"
    );

  const [
    mostrarFiltros,
    setMostrarFiltros,
  ] = useState(false);

  const [
    alunoSelecionado,
    setAlunoSelecionado,
  ] = useState<Aluno | null>(
    null
  );

  const [
    alunos,
    setAlunos,
  ] = useState<Aluno[]>([]);

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    erro,
    setErro,
  ] = useState<string | null>(
    null
  );

  useEffect(() => {
    async function carregar() {
      const filtros:
        FiltrosAluno = {};

      if (busca.trim()) {
        filtros.q =
          busca.trim();
      }

      if (
        idadeMinima !== ""
      ) {
        filtros.idade_minima =
          Number(
            idadeMinima
          );
      }

      if (
        mediaMinima !== ""
      ) {
        filtros.media_minima =
          Number(
            mediaMinima
          );
      }

      try {
        setCarregando(true);
        setErro(null);

        const dados =
          await listarAlunos(
            filtros
          );

        setAlunos(dados);
      } catch (erro) {
        setErro(
          erro instanceof Error
            ? erro.message
            : "Erro ao carregar alunos."
        );
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [
    busca,
    idadeMinima,
    mediaMinima,
  ]);

  let alunosExibidos =
    alunos.filter(
      (aluno) => {
        if (
          situacao ===
          "aprovados"
        ) {
          return aluno.media >= 6;
        }

        if (
          situacao ===
          "reprovados"
        ) {
          return aluno.media < 6;
        }

        return true;
      }
    );

  alunosExibidos = [
    ...alunosExibidos,
  ];

  if (
    ordenacao ===
    "nome-az"
  ) {
    alunosExibidos.sort(
      (a, b) =>
        a.nome.localeCompare(
          b.nome
        )
    );
  }

  if (
    ordenacao ===
    "maior-media"
  ) {
    alunosExibidos.sort(
      (a, b) =>
        b.media -
        a.media
    );
  }

  if (
    ordenacao ===
    "menor-media"
  ) {
    alunosExibidos.sort(
      (a, b) =>
        a.media -
        b.media
    );
  }

  function limparFiltros() {
    setBusca("");
    setIdadeMinima("");
    setMediaMinima("");
    setSituacao("todos");

    setOrdenacao(
      "nome-az"
    );
  }

  if (alunoSelecionado) {
    return (
      <PerfilAluno
        aluno={
          alunoSelecionado
        }
        aoVoltar={() =>
          setAlunoSelecionado(
            null
          )
        }
      />
    );
  }

  return (
    <section className="pagina pagina-alunos">
      <header className="pagina-cabecalho">
        <div>
          <span className="pagina-etiqueta">
            ALUNOS
          </span>

          <h1>
            Consulta de alunos
          </h1>

          <p>
            Consulte informações,
            desempenho e boletim
            dos estudantes.
          </p>
        </div>
      </header>

      <div className="barra-ferramentas">
        <div className="campo-busca">
          <span>⌕</span>

          <input
            type="search"
            placeholder="Buscar por nome ou matrícula..."
            value={busca}
            onChange={(evento) =>
              setBusca(
                evento.target.value
              )
            }
          />
        </div>

        <button
          className="botao-secundario"
          onClick={() =>
            setMostrarFiltros(
              (valor) => !valor
            )
          }
        >
          Filtros
        </button>
      </div>

      <div className="linha-controles">
        <div className="filtros-rapidos">
          <button
            className={
              situacao === "todos"
                ? "filtro-rapido ativo"
                : "filtro-rapido"
            }
            onClick={() =>
              setSituacao("todos")
            }
          >
            Todos
          </button>

          <button
            className={
              situacao ===
              "aprovados"
                ? "filtro-rapido ativo"
                : "filtro-rapido"
            }
            onClick={() =>
              setSituacao(
                "aprovados"
              )
            }
          >
            Aprovados
          </button>

          <button
            className={
              situacao ===
              "reprovados"
                ? "filtro-rapido ativo"
                : "filtro-rapido"
            }
            onClick={() =>
              setSituacao(
                "reprovados"
              )
            }
          >
            Reprovados
          </button>
        </div>

        <label className="ordenacao">
          <span>
            Ordenar
          </span>

          <select
            value={ordenacao}
            onChange={(evento) =>
              setOrdenacao(
                evento.target
                  .value as Ordenacao
              )
            }
          >
            <option value="nome-az">
              Nome A–Z
            </option>

            <option value="maior-media">
              Maior média
            </option>

            <option value="menor-media">
              Menor média
            </option>
          </select>
        </label>
      </div>

      {mostrarFiltros && (
        <div className="painel-filtros">
          <label>
            <span>
              Idade mínima
            </span>

            <input
              type="number"
              min="0"
              max="120"
              value={
                idadeMinima
              }
              onChange={(evento) =>
                setIdadeMinima(
                  evento.target.value
                )
              }
              placeholder="Ex.: 18"
            />
          </label>

          <label>
            <span>
              Média mínima
            </span>

            <input
              type="number"
              min="0"
              max="10"
              step="0.1"
              value={
                mediaMinima
              }
              onChange={(evento) =>
                setMediaMinima(
                  evento.target.value
                )
              }
              placeholder="Ex.: 7"
            />
          </label>

          <button
            className="botao-limpar"
            onClick={
              limparFiltros
            }
          >
            Limpar filtros
          </button>
        </div>
      )}

      <div className="chips-filtros">
        {idadeMinima !== "" && (
          <button
            onClick={() =>
              setIdadeMinima("")
            }
          >
            Idade ≥{" "}
            {idadeMinima} ×
          </button>
        )}

        {mediaMinima !== "" && (
          <button
            onClick={() =>
              setMediaMinima("")
            }
          >
            Média ≥{" "}
            {mediaMinima} ×
          </button>
        )}
      </div>

      <div className="resultado-cabecalho">
        <span>
          {alunosExibidos.length}{" "}
          {alunosExibidos.length ===
          1
            ? "aluno encontrado"
            : "alunos encontrados"}
        </span>
      </div>

      {carregando ? (
        <div className="estado-pagina estado-menor">
          <span className="carregador" />

          <p>
            Atualizando alunos...
          </p>
        </div>
      ) : erro ? (
        <div className="estado-pagina estado-menor">
          <h2>
            Erro ao carregar alunos
          </h2>

          <p>{erro}</p>
        </div>
      ) : alunosExibidos.length ===
        0 ? (
        <div className="estado-pagina estado-menor">
          <h2>
            Nenhum aluno encontrado
          </h2>

          <p>
            Tente alterar ou remover
            os filtros.
          </p>

          <button
            className="botao-secundario"
            onClick={
              limparFiltros
            }
          >
            Limpar filtros
          </button>
        </div>
      ) : (
        <ListaAlunos
          alunos={
            alunosExibidos
          }
          aoSelecionarAluno={
            setAlunoSelecionado
          }
        />
      )}
    </section>
  );
}

export default PaginaAlunos;