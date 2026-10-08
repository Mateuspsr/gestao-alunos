import type { Aluno } from "../types";
import AlunoCard from "./AlunoCard";

interface ListaAlunosProps {
  alunos: Aluno[];
  aoSelecionarAluno: (
    aluno: Aluno
  ) => void;
}

function ListaAlunos({
  alunos,
  aoSelecionarAluno,
}: ListaAlunosProps) {
  return (
    <section className="lista-alunos">
      {alunos.map((aluno) => (
        <AlunoCard
          key={aluno.id}
          aluno={aluno}
          aoSelecionar={
            aoSelecionarAluno
          }
        />
      ))}
    </section>
  );
}

export default ListaAlunos;