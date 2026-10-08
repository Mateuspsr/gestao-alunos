import type { Aluno, Disciplina } from "../types";

interface Props {
  alunos: Aluno[];
  disciplinas: Disciplina[];
}

export default function Dashboard({ alunos, disciplinas }: Props) {
  const aprovados = alunos.filter((aluno) => aluno.media >= 6).length;
  const mediaGeral = alunos.length
    ? alunos.reduce((soma, aluno) => soma + aluno.media, 0) / alunos.length
    : 0;
  const destaques = [...alunos].sort((a, b) => b.media - a.media).slice(0, 5);

  return (
    <section>
      <header className="page-header">
        <span className="eyebrow">VISÃO GERAL</span>
        <h1>Painel acadêmico</h1>
        <p className="muted">Indicadores calculados a partir dos dados cadastrados.</p>
      </header>
      <div className="stats">
        <article className="stat"><span>Alunos</span><strong>{alunos.length}</strong></article>
        <article className="stat"><span>Disciplinas</span><strong>{disciplinas.length}</strong></article>
        <article className="stat"><span>Média geral</span><strong>{mediaGeral.toFixed(1)}</strong></article>
        <article className="stat"><span>Médias a partir de 6</span><strong>{aprovados}</strong></article>
      </div>

      <div className="panel">
        <h2>Maiores médias</h2>
        {destaques.length === 0 ? (
          <p className="muted">Ainda não há alunos cadastrados.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Aluno</th><th>Matrícula</th><th>Média</th></tr></thead>
              <tbody>
                {destaques.map((aluno) => (
                  <tr key={aluno.id}>
                    <td>{aluno.nome}</td>
                    <td>{aluno.matricula}</td>
                    <td><span className="tag">{aluno.media.toFixed(1)}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}
