import { useEffect, useState, type FormEvent } from "react";
import { criarDisciplina, disciplinasDoAluno, excluirDisciplina, matricularAluno } from "../api";
import type { Aluno, Disciplina } from "../types";

interface Props {
  alunos: Aluno[];
  disciplinas: Disciplina[];
  aoAlterar: () => Promise<void>;
}

export default function Disciplinas({ alunos, disciplinas, aoAlterar }: Props) {
  const [nome, setNome] = useState("");
  const [carga, setCarga] = useState("40");
  const [alunoId, setAlunoId] = useState("");
  const [disciplinaId, setDisciplinaId] = useState("");
  const [vinculos, setVinculos] = useState<Disciplina[]>([]);
  const [mensagem, setMensagem] = useState("");
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    if (!alunoId) { setVinculos([]); return; }
    disciplinasDoAluno(Number(alunoId))
      .then((dados) => { if (ativo) setVinculos(dados); })
      .catch((falha) => { if (ativo) setErro(falha.message); });
    return () => { ativo = false; };
  }, [alunoId, disciplinas]);

  async function adicionar(evento: FormEvent) {
    evento.preventDefault();
    try {
      await criarDisciplina({ nome: nome.trim(), carga_horaria: Number(carga) });
      setNome("");
      setCarga("40");
      await aoAlterar();
      setMensagem("Disciplina cadastrada.");
      setErro("");
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível cadastrar.");
    }
  }

  async function vincular(evento: FormEvent) {
    evento.preventDefault();
    if (!alunoId || !disciplinaId) return;
    try {
      await matricularAluno(Number(alunoId), Number(disciplinaId));
      setVinculos(await disciplinasDoAluno(Number(alunoId)));
      setMensagem("Matrícula registrada.");
      setErro("");
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível matricular.");
    }
  }

  async function remover(disciplina: Disciplina) {
    if (!window.confirm(`Excluir a disciplina ${disciplina.nome}?`)) return;
    try {
      await excluirDisciplina(disciplina.id);
      await aoAlterar();
      setMensagem("Disciplina excluída.");
      setErro("");
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível excluir.");
    }
  }

  return (
    <section>
      <header className="page-header">
        <span className="eyebrow">DISCIPLINAS E MATRÍCULAS</span>
        <h1>Organização curricular</h1>
        <p className="muted">Gerencie disciplinas e vincule alunos aos componentes curriculares.</p>
      </header>

      <div className="columns">
        <div className="panel">
          <h2>Nova disciplina</h2>
          <form className="stack" onSubmit={adicionar}>
            <label>Nome
              <input value={nome} onChange={(e) => setNome(e.target.value)}
                maxLength={100} placeholder="Ex.: Matemática" required />
            </label>
            <label>Carga horária
              <input type="number" min="1" value={carga} onChange={(e) => setCarga(e.target.value)} required />
            </label>
            <button type="submit" className="primary">Cadastrar disciplina</button>
          </form>
        </div>

        <div className="panel">
          <h2>Matricular aluno</h2>
          <form className="stack" onSubmit={vincular}>
            <label>Aluno
              <select value={alunoId} onChange={(e) => setAlunoId(e.target.value)} required>
                <option value="">Selecione</option>
                {alunos.map((aluno) => <option key={aluno.id} value={aluno.id}>{aluno.nome}</option>)}
              </select>
            </label>
            <label>Disciplina
              <select value={disciplinaId} onChange={(e) => setDisciplinaId(e.target.value)} required>
                <option value="">Selecione</option>
                {disciplinas.map((d) => <option key={d.id} value={d.id}>{d.nome}</option>)}
              </select>
            </label>
            <button type="submit" className="primary">Registrar matrícula</button>
          </form>
        </div>
      </div>

      {erro && <p className="erro" role="alert">{erro}</p>}
      {mensagem && <p className="sucesso" role="status">{mensagem}</p>}

      <div className="columns">
        <div className="panel">
          <h2>Disciplinas cadastradas</h2>
          {disciplinas.length === 0 ? <p className="muted">Nenhuma disciplina cadastrada.</p> : (
            <ul className="subjects">
              {disciplinas.map((disciplina) => (
                <li key={disciplina.id}>
                  <span><strong>{disciplina.nome}</strong><small>{disciplina.carga_horaria} horas</small></span>
                  <button type="button" className="danger small" onClick={() => remover(disciplina)}>Excluir</button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="panel">
          <h2>Disciplinas do aluno selecionado</h2>
          {!alunoId ? <p className="muted">Selecione um aluno no formulário acima.</p>
            : vinculos.length === 0 ? <p className="muted">Nenhuma matrícula registrada para esse aluno.</p>
            : <ul className="subjects">
                {vinculos.map((disciplina) => (
                  <li key={disciplina.id}><strong>{disciplina.nome}</strong><small>{disciplina.carga_horaria} horas</small></li>
                ))}
              </ul>}
        </div>
      </div>
    </section>
  );
}
