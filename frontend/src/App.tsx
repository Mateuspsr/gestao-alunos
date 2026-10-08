import { useCallback, useEffect, useState } from "react";
import { encerrarSessao, listarAlunos, listarDisciplinas, temSessao, usuarioAtual } from "./api";
import type { Aluno, Disciplina } from "./types";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import Alunos from "./components/Alunos";
import Disciplinas from "./components/Disciplinas";

type Pagina = "inicio" | "alunos" | "disciplinas";

export default function App() {
  const [autenticado, setAutenticado] = useState(temSessao);
  const [usuario, setUsuario] = useState("");
  const [pagina, setPagina] = useState<Pagina>("inicio");
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [revisao, setRevisao] = useState(0);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  const atualizarDados = useCallback(async () => {
    const [listaAlunos, listaDisciplinas] = await Promise.all([
      listarAlunos(),
      listarDisciplinas(),
    ]);

    setAlunos(listaAlunos);
    setDisciplinas(listaDisciplinas);
    setRevisao((atual) => atual + 1);
  }, []);

  const sair = useCallback(() => {
    encerrarSessao();
    setAutenticado(false);
    setUsuario("");
    setAlunos([]);
    setDisciplinas([]);
  }, []);

  useEffect(() => {
    window.addEventListener("sessao-expirada", sair);
    return () => window.removeEventListener("sessao-expirada", sair);
  }, [sair]);

  useEffect(() => {
    if (!autenticado) return;
    let ativo = true;

    async function iniciar() {
      setCarregando(true);
      try {
        const perfil = await usuarioAtual();
        if (!ativo) return;
        setUsuario(perfil.username);
        await atualizarDados();
        if (ativo) setErro("");
      } catch (falha) {
        if (ativo) setErro(falha instanceof Error ? falha.message : "Erro ao carregar os dados.");
      } finally {
        if (ativo) setCarregando(false);
      }
    }

    void iniciar();
    return () => { ativo = false; };
  }, [autenticado, atualizarDados]);

  useEffect(() => {
    document.title = `POLAR — ${alunos.length} alunos`;
  }, [alunos.length]);

  if (!autenticado) return <Login aoEntrar={() => setAutenticado(true)} />;

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-brand"><span className="logo">P</span><div><strong>POLAR</strong><small>Gestão Escolar</small></div></div>
        <nav aria-label="Navegação principal">
          <button className={pagina === "inicio" ? "selected" : ""} onClick={() => setPagina("inicio")}>Visão geral</button>
          <button className={pagina === "alunos" ? "selected" : ""} onClick={() => setPagina("alunos")}>Alunos</button>
          <button className={pagina === "disciplinas" ? "selected" : ""} onClick={() => setPagina("disciplinas")}>Disciplinas e matrículas</button>
        </nav>
        <div className="sidebar-footer"><span>{usuario || "Usuário"}</span><button onClick={sair}>Sair</button></div>
      </aside>

      <main className="content">
        <div className="mobile-bar"><strong>POLAR</strong><button onClick={sair}>Sair</button></div>
        {carregando && <p className="muted">Carregando dados...</p>}
        {erro && <p className="erro" role="alert">{erro}</p>}
        {!carregando && (
          <>
            {pagina === "inicio" && <Dashboard alunos={alunos} disciplinas={disciplinas} />}
            {pagina === "alunos" && <Alunos revisao={revisao} aoAlterar={atualizarDados} />}
            {pagina === "disciplinas" && <Disciplinas alunos={alunos} disciplinas={disciplinas} aoAlterar={atualizarDados} />}
          </>
        )}
      </main>
    </div>
  );
}
