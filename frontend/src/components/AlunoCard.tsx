import type { Aluno } from "../types";

interface AlunoCardProps {
  aluno: Aluno;
  aoSelecionar: (aluno: Aluno) => void;
}

function AlunoCard({
  aluno,
  aoSelecionar,
}: AlunoCardProps) {
  const iniciais = aluno.nome
    .split(" ")
    .slice(0, 2)
    .map((parte) => parte[0])
    .join("")
    .toUpperCase();

  return (
    <article className="aluno-card">
      <div className="aluno-card-topo">
        <div className="avatar-iniciais">
          {iniciais}
        </div>

        <span
          className={
            aluno.media >= 6
              ? "status aprovado"
              : "status reprovado"
          }
        >
          {aluno.media >= 6
            ? "Aprovado"
            : "Reprovado"}
        </span>
      </div>

      <h2>{aluno.nome}</h2>

      <p>
        Matrícula: {aluno.matricula}
      </p>

      <div className="aluno-card-dados">
        <div>
          <span>Idade</span>

          <strong>
            {aluno.idade}
          </strong>
        </div>

        <div>
          <span>
            Média
          </span>

          <strong>
            {aluno.media.toFixed(1)}
          </strong>
        </div>
      </div>

      <button
        className="botao-ver-perfil"
        onClick={() =>
          aoSelecionar(aluno)
        }
      >
        Ver perfil
        <span>→</span>
      </button>
    </article>
  );
}

export default AlunoCard;