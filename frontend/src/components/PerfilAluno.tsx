import { useEffect, useState } from "react";
import { buscarAluno, listarDisciplinasDoAluno } from "../api";
import type { Aluno, Disciplina } from "../types";

interface PerfilAlunoProps {
  aluno: Aluno;
  aoVoltar: () => void;
}

export default function PerfilAluno({ aluno, aoVoltar }: PerfilAlunoProps) {
  const [perfil, setPerfil] = useState(aluno);
  const [disciplinas, setDisciplinas] = useState<Disciplina[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;
    setCarregando(true);
    Promise.all([buscarAluno(aluno.id), listarDisciplinasDoAluno(aluno.id)])
      .then(([registro, lista]) => {
        if (!ativo) return;
        setPerfil(registro);
        setDisciplinas(lista);
        setErro("");
      })
      .catch((falha) => {
        if (ativo) setErro(falha instanceof Error ? falha.message : "Erro ao carregar perfil.");
      })
      .finally(() => { if (ativo) setCarregando(false); });
    return () => { ativo = false; };
  }, [aluno.id]);

  const iniciais = perfil.nome.split(" ").slice(0, 2)
    .map((parte) => parte[0]).join("").toUpperCase();
  const cargaTotal = disciplinas.reduce((soma, d) => soma + d.carga_horaria, 0);

  return (
    <section className="pagina perfil-aluno">
      <button className="botao-voltar" onClick={aoVoltar}>← Voltar para alunos</button>
      <header className="perfil-card-principal">
        <div className="perfil-identidade">
          <div className="perfil-avatar">{iniciais}</div>
          <div>
            <span className="pagina-etiqueta">PERFIL DO ESTUDANTE</span>
            <h1>{perfil.nome}</h1>
            <p>Matrícula {perfil.matricula}</p>
          </div>
          <span className={perfil.media >= 6 ? "perfil-status aprovado" : "perfil-status reprovado"}>
            {perfil.media >= 6 ? "Aprovado" : "Reprovado"}
          </span>
        </div>

        <div className="perfil-metricas">
          <div><span>Média geral</span><strong>{perfil.media.toFixed(1)}</strong></div>
          <div><span>Idade</span><strong>{perfil.idade ?? "—"}</strong></div>
          <div><span>Disciplinas</span><strong>{disciplinas.length}</strong></div>
          <div><span>Carga horária</span><strong>{cargaTotal}h</strong></div>
        </div>
      </header>

      <div className="perfil-conteudo-grid">
        <article className="perfil-painel perfil-disciplinas-painel">
          <div className="perfil-painel-cabecalho">
            <div>
              <span className="pagina-etiqueta">MATRÍCULAS</span>
              <h2>Disciplinas cursadas</h2>
              <p>Vínculos registrados no sistema.</p>
            </div>
            <span className="contador-disciplinas">{disciplinas.length}</span>
          </div>

          {carregando && <div className="estado-pagina estado-menor"><span className="carregador"/><p>Carregando...</p></div>}
          {erro && <p className="formulario-erro-geral" role="alert">{erro}</p>}
          {!carregando && !erro && (
            disciplinas.length === 0 ? (
              <div className="perfil-vazio">
                <h3>Nenhuma disciplina</h3>
                <p>Não existem disciplinas vinculadas a este aluno.</p>
              </div>
            ) : (
              <div className="perfil-lista-disciplinas">
                {disciplinas.map((disciplina) => (
                  <div className="perfil-disciplina" key={disciplina.id}>
                    <div className="perfil-disciplina-icone">▤</div>
                    <div className="perfil-disciplina-info">
                      <strong>{disciplina.nome}</strong>
                      <span>{disciplina.carga_horaria} horas</span>
                    </div>
                    <span className="mini-status mini-aprovado">Matriculado</span>
                  </div>
                ))}
              </div>
            )
          )}
        </article>

        <aside className="perfil-painel perfil-resumo">
          <span className="pagina-etiqueta">RESUMO ACADÊMICO</span>
          <h2>Informações do aluno</h2>
          <div className="resumo-grande">
            <span>Média geral cadastrada</span>
            <strong>{perfil.media.toFixed(1)}</strong>
          </div>
          <div className="resumo-linha">
            <span>Disciplinas vinculadas</span>
            <strong>{disciplinas.length}</strong>
          </div>
          <div className="resumo-linha">
            <span>Carga horária total</span>
            <strong>{cargaTotal} h</strong>
          </div>
          <p className="muted">As notas individuais por disciplina não fazem parte do cadastro.</p>
        </aside>
      </div>
    </section>
  );
}
