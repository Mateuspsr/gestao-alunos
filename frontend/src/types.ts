export interface Aluno {
  id: number;
  nome: string;
  idade: number | null;
  matricula: string;
  media: number;
}

export type AlunoEntrada = Omit<Aluno, "id">;
export type AlunoAtualizacao = Partial<Pick<Aluno, "nome" | "idade" | "media">>;

export interface Disciplina {
  id: number;
  nome: string;
  carga_horaria: number;
}

export type DisciplinaEntrada = Omit<Disciplina, "id">;

export interface FiltrosAluno {
  q?: string;
  idade_minima?: number;
  media_minima?: number;
}

export interface Usuario {
  id: number;
  username: string;
}
