import {
  useCallback,
  useEffect,
  useState,
} from "react";

import Dashboard from "./components/Dashboard";
import IntroPolar from "./components/IntroPolar";
import PaginaAlunos from "./components/PaginaAlunos";
import PaginaDisciplinas from "./components/PaginaDisciplinas";
import PaginaMatriculas from "./components/PaginaMatriculas";
import Sidebar from "./components/Sidebar";

import type {
  Pagina,
} from "./components/Sidebar";

import {
  listarAlunos,
} from "./api";

import type {
  Aluno,
} from "./types";

function App() {
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

  const [
    paginaAtiva,
    setPaginaAtiva,
  ] = useState<Pagina>(
    "dashboard"
  );

  const [
    sidebarRecolhida,
    setSidebarRecolhida,
  ] = useState(false);

  const [
    introAtiva,
    setIntroAtiva,
  ] = useState(() => {
    return (
      sessionStorage.getItem(
        "polar-intro-exibida"
      ) !== "sim"
    );
  });

  const concluirIntro =
    useCallback(() => {
      sessionStorage.setItem(
        "polar-intro-exibida",
        "sim"
      );

      setIntroAtiva(false);
    }, []);

  useEffect(() => {
    async function carregarAlunos() {
      try {
        setCarregando(true);
        setErro(null);

        const dados =
          await listarAlunos();

        setAlunos(dados);
      } catch (erro) {
        if (
          erro instanceof Error
        ) {
          setErro(
            erro.message
          );
        } else {
          setErro(
            "Erro ao carregar os alunos."
          );
        }
      } finally {
        setCarregando(false);
      }
    }

    carregarAlunos();
  }, []);

  useEffect(() => {
    document.title =
      `POLAR — ${alunos.length} alunos`;
  }, [alunos]);

  function renderizarPagina() {
    if (carregando) {
      return (
        <div className="estado-pagina">
          <span className="carregador" />

          <p>
            Carregando POLAR...
          </p>
        </div>
      );
    }

    if (erro) {
      return (
        <div className="estado-pagina">
          <h2>
            Não foi possível carregar
            o sistema
          </h2>

          <p>{erro}</p>
        </div>
      );
    }

    if (
      paginaAtiva ===
      "dashboard"
    ) {
      return (
        <Dashboard
          alunos={alunos}
        />
      );
    }

    if (
      paginaAtiva ===
      "alunos"
    ) {
      return (
        <PaginaAlunos />
      );
    }

    if (
      paginaAtiva ===
      "disciplinas"
    ) {
      return (
        <PaginaDisciplinas />
      );
    }

    return (
      <PaginaMatriculas
        aoAlunoCriado={(
          novoAluno
        ) =>
          setAlunos(
            (atuais) => [
              ...atuais,
              novoAluno,
            ]
          )
        }

        aoAlunoAtualizado={(
          atualizado
        ) =>
          setAlunos(
            (atuais) =>
              atuais.map(
                (aluno) =>
                  aluno.id ===
                  atualizado.id
                    ? atualizado
                    : aluno
              )
          )
        }

        aoExcluirAluno={(
          id
        ) =>
          setAlunos(
            (atuais) =>
              atuais.filter(
                (aluno) =>
                  aluno.id !== id
              )
          )
        }
      />
    );
  }

  return (
    <>
      {introAtiva && (
        <IntroPolar
          aoConcluir={
            concluirIntro
          }
        />
      )}

      <div
        className={`app-shell ${
          sidebarRecolhida
            ? "sidebar-fechada"
            : ""
        } ${
          introAtiva
            ? "app-intro-ativa"
            : "app-pronta"
        }`}
      >
        <Sidebar
          paginaAtiva={
            paginaAtiva
          }
          aoMudarPagina={
            setPaginaAtiva
          }
          recolhida={
            sidebarRecolhida
          }
          aoAlternarSidebar={() =>
            setSidebarRecolhida(
              (valor) => !valor
            )
          }
        />

        <main className="conteudo-principal">
          {renderizarPagina()}
        </main>
      </div>
    </>
  );
}

export default App;