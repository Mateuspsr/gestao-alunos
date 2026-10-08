import { useEffect, useState, type FormEvent } from "react";
import { atualizarAluno, criarAluno, excluirAluno, listarAlunos } from "../api";
import type { Aluno, FiltrosAluno } from "../types";

interface Props {
  revisao: number;
  aoAlterar: () => Promise<void>;
}

export default function Alunos({ revisao, aoAlterar }: Props) {
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [busca, setBusca] = useState("");
  const [idadeMinima, setIdadeMinima] = useState("");
  const [mediaMinima, setMediaMinima] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [edicao, setEdicao] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [matricula, setMatricula] = useState("");
  const [idade, setIdade] = useState("");
  const [media, setMedia] = useState("0");

  useEffect(() => {
    let ativo = true;
    const filtros: FiltrosAluno = {};
    if (busca.trim()) filtros.q = busca.trim();
    if (idadeMinima !== "") filtros.idade_minima = Number(idadeMinima);
    if (mediaMinima !== "") filtros.media_minima = Number(mediaMinima);

    setCarregando(true);
    listarAlunos(filtros)
      .then((dados) => { if (ativo) { setAlunos(dados); setErro(""); } })
      .catch((falha) => { if (ativo) setErro(falha.message); })
      .finally(() => { if (ativo) setCarregando(false); });

    return () => { ativo = false; };
  }, [busca, idadeMinima, mediaMinima, revisao]);

  function limparFormulario() {
    setEdicao(null);
    setNome("");
    setMatricula("");
    setIdade("");
    setMedia("0");
  }

  function editar(aluno: Aluno) {
    setEdicao(aluno.id);
    setNome(aluno.nome);
    setMatricula(aluno.matricula);
    setIdade(aluno.idade === null ? "" : String(aluno.idade));
    setMedia(String(aluno.media));
    setMensagem("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function salvar(evento: FormEvent) {
    evento.preventDefault();
    setErro("");
    setMensagem("");

    const dados = {
      nome: nome.trim(),
      idade: idade === "" ? null : Number(idade),
      media: Number(media),
    };

    try {
      if (edicao !== null) {
        await atualizarAluno(edicao, dados);
        setMensagem("Aluno atualizado com sucesso.");
      } else {
        await criarAluno({ ...dados, matricula: matricula.trim() });
        setMensagem("Aluno cadastrado com sucesso.");
      }
      limparFormulario();
      await aoAlterar();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Erro ao salvar aluno.");
    }
  }

  async function excluir(aluno: Aluno) {
    if (!window.confirm(`Excluir ${aluno.nome} e suas matrículas?`)) return;
    try {
      await excluirAluno(aluno.id);
      await aoAlterar();
      setMensagem("Aluno excluído.");
      setErro("");
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível excluir.");
    }
  }

  return (
    <section>
      <header className="page-header">
        <span className="eyebrow">ALUNOS</span>
        <h1>Gestão de alunos</h1>
        <p className="muted">Cadastros e consultas realizados diretamente na API.</p>
      </header>
      <div className="panel form-panel">
        <h2>{edicao === null ? "Cadastrar aluno" : "Editar aluno"}</h2>
        <form className="form-grid" onSubmit={salvar}>
          <label>Nome
            <input value={nome} onChange={(e) => setNome(e.target.value)}
              minLength={1} maxLength={100} required />
          </label>
          <label>Matrícula
            <input value={matricula} onChange={(e) => setMatricula(e.target.value)}
              maxLength={20} required readOnly={edicao !== null} />
          </label>
          <label>Idade (opcional)
            <input type="number" min="0" max="120" value={idade}
              onChange={(e) => setIdade(e.target.value)} />
          </label>
          <label>Média
            <input type="number" min="0" max="10" step="0.01" value={media}
              onChange={(e) => setMedia(e.target.value)} required />
          </label>
          <div className="actions">
            <button className="primary" type="submit">{edicao === null ? "Cadastrar" : "Salvar alterações"}</button>
            {edicao !== null && <button type="button" className="secondary" onClick={limparFormulario}>Cancelar</button>}
          </div>
        </form>
        {mensagem && <p className="sucesso" role="status">{mensagem}</p>}
        {erro && <p className="erro" role="alert">{erro}</p>}
      </div>

      <div className="panel">
        <div className="section-heading"><h2>Lista de alunos</h2><span>{alunos.length} registro(s)</span></div>
        <div className="filters">
          <label>Buscar por nome
            <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Nome do aluno" />
          </label>
          <label>Idade mínima
            <input type="number" min="0" max="120" value={idadeMinima}
              onChange={(e) => setIdadeMinima(e.target.value)} />
          </label>
          <label>Média mínima
            <input type="number" min="0" max="10" step="0.1" value={mediaMinima}
              onChange={(e) => setMediaMinima(e.target.value)} />
          </label>
        </div>
        {carregando ? <p className="muted">Carregando alunos...</p> : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Nome</th><th>Matrícula</th><th>Idade</th><th>Média</th><th>Ações</th></tr></thead>
              <tbody>
                {alunos.map((aluno) => (
                  <tr key={aluno.id}>
                    <td>{aluno.nome}</td><td>{aluno.matricula}</td>
                    <td>{aluno.idade ?? "—"}</td><td>{aluno.media.toFixed(1)}</td>
                    <td><div className="row-actions">
                      <button type="button" className="secondary small" onClick={() => editar(aluno)}>Editar</button>
                      <button type="button" className="danger small" onClick={() => excluir(aluno)}>Excluir</button>
                    </div></td>
                  </tr>
                ))}
              </tbody>
            </table>
            {alunos.length === 0 && <p className="empty">Nenhum aluno encontrado.</p>}
          </div>
        )}
      </div>
    </section>
  );
}
