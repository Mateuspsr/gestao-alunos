import type {
  Aluno, AlunoEntrada, AlunoAtualizacao, Disciplina,
  DisciplinaDoAluno, DisciplinaEntrada, FiltrosAluno,
  MatriculaDisciplina, Usuario,
} from "./types";

const TOKEN_KEY = "gestao_alunos_token";

export const temSessao = () => Boolean(sessionStorage.getItem(TOKEN_KEY));
export const encerrarSessao = () => sessionStorage.removeItem(TOKEN_KEY);

function dadosJson(metodo: string, dados?: object): RequestInit {
  return {
    method: metodo,
    headers: { "Content-Type": "application/json" },
    body: dados === undefined ? undefined : JSON.stringify(dados),
  };
}

async function solicitar<T>(caminho: string, opcoes: RequestInit = {}): Promise<T> {
  const headers = new Headers(opcoes.headers);
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) headers.set("Authorization", `Bearer ${token}`);

  let resposta: Response;
  try {
    resposta = await fetch(caminho, { ...opcoes, headers });
  } catch {
    throw new Error("Não foi possível comunicar com o servidor. Tente novamente.");
  }

  if (resposta.status === 401) {
    encerrarSessao();
    window.dispatchEvent(new Event("sessao-expirada"));
    throw new Error("Sua sessão expirou. Entre novamente.");
  }

  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => null);
    const detalhe = corpo?.detail;
    const mensagem = typeof detalhe === "string"
      ? detalhe
      : resposta.status === 422
        ? "Verifique os campos informados."
        : `Erro HTTP ${resposta.status}. Tente novamente.`;
    throw new Error(mensagem);
  }

  if (resposta.status === 204) return undefined as T;
  return resposta.json() as Promise<T>;
}

export async function fazerLogin(username: string, password: string): Promise<void> {
  const body = new URLSearchParams({ username, password });
  let resposta: Response;
  try {
    resposta = await fetch("/auth/login", { method: "POST", body });
  } catch {
    throw new Error("Servidor indisponível. Tente novamente.");
  }
  if (!resposta.ok) throw new Error("Usuário ou senha inválidos.");
  const { access_token } = await resposta.json() as { access_token: string };
  sessionStorage.setItem(TOKEN_KEY, access_token);
}

export const usuarioAtual = (): Promise<Usuario> => solicitar("/auth/me");

export function listarAlunos(filtros: FiltrosAluno = {}): Promise<Aluno[]> {
  const params = new URLSearchParams();
  if (filtros.q?.trim()) params.set("q", filtros.q.trim());
  if (filtros.idade_minima !== undefined) params.set("idade_minima", String(filtros.idade_minima));
  if (filtros.media_minima !== undefined) params.set("media_minima", String(filtros.media_minima));
  return solicitar(`/alunos${params.size ? `?${params.toString()}` : ""}`);
}

export const buscarAluno = (id: number): Promise<Aluno> => solicitar(`/alunos/${id}`);
export const criarAluno = (dados: AlunoEntrada): Promise<Aluno> =>
  solicitar("/alunos", dadosJson("POST", dados));
export const atualizarAluno = (id: number, campos: AlunoAtualizacao): Promise<Aluno> =>
  solicitar(`/alunos/${id}`, dadosJson("PATCH", campos));
export const excluirAluno = (id: number): Promise<void> =>
  solicitar(`/alunos/${id}`, { method: "DELETE" });

export const listarDisciplinas = (): Promise<Disciplina[]> => solicitar("/disciplinas");
export const criarDisciplina = (dados: DisciplinaEntrada): Promise<Disciplina> =>
  solicitar("/disciplinas", dadosJson("POST", dados));
export const excluirDisciplina = (id: number): Promise<void> =>
  solicitar(`/disciplinas/${id}`, { method: "DELETE" });

export const listarMatriculas = (): Promise<MatriculaDisciplina[]> =>
  solicitar("/matriculas");
export const matricularAluno = (alunoId: number, disciplinaId: number): Promise<void> =>
  solicitar(`/alunos/${alunoId}/matricular/${disciplinaId}`, { method: "POST" });
export const listarDisciplinasDoAluno = (id: number): Promise<DisciplinaDoAluno[]> =>
  solicitar(`/alunos/${id}/disciplinas`);
export const disciplinasDoAluno = listarDisciplinasDoAluno;
