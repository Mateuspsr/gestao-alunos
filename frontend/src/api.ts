import type {
  Aluno,
  AlunoEntrada,
  AlunoAtualizacao,
  Disciplina,
  DisciplinaEntrada,
  FiltrosAluno,
  Usuario,
} from "./types";

const TOKEN_KEY = "gestao_alunos_token";

export function temSessao(): boolean {
  return Boolean(sessionStorage.getItem(TOKEN_KEY));
}

export function encerrarSessao(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

async function solicitar<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  const token = sessionStorage.getItem(TOKEN_KEY);

  if (token) headers.set("Authorization", `Bearer ${token}`);

  const resposta = await fetch(url, { ...options, headers });

  if (resposta.status === 401) {
    encerrarSessao();
    window.dispatchEvent(new Event("sessao-expirada"));
  }

  if (!resposta.ok) {
    const corpo = await resposta.json().catch(() => null);
    const detalhe = typeof corpo?.detail === "string" ? corpo.detail : null;
    throw new Error(detalhe ?? `Erro HTTP ${resposta.status}.`);
  }

  return (resposta.status === 204 ? undefined : await resposta.json()) as T;
}

function json(method: string, data?: object): RequestInit {
  return {
    method,
    headers: { "Content-Type": "application/json" },
    body: data ? JSON.stringify(data) : undefined,
  };
}

export async function fazerLogin(usuario: string, senha: string): Promise<void> {
  const dados = new URLSearchParams({ username: usuario, password: senha });
  const resposta = await fetch("/auth/login", { method: "POST", body: dados });
  if (!resposta.ok) throw new Error("Usuário ou senha inválidos.");

  const resultado = (await resposta.json()) as { access_token: string };
  sessionStorage.setItem(TOKEN_KEY, resultado.access_token);
}

export const usuarioAtual = (): Promise<Usuario> => solicitar("/auth/me");

export function listarAlunos(filtros: FiltrosAluno = {}): Promise<Aluno[]> {
  const query = new URLSearchParams();
  if (filtros.q) query.set("q", filtros.q);
  if (filtros.idade_minima !== undefined) query.set("idade_minima", String(filtros.idade_minima));
  if (filtros.media_minima !== undefined) query.set("media_minima", String(filtros.media_minima));

  return solicitar(`/alunos${query.size ? `?${query}` : ""}`);
}

export const criarAluno = (dados: AlunoEntrada): Promise<Aluno> =>
  solicitar("/alunos", json("POST", dados));

export const atualizarAluno = (id: number, dados: AlunoAtualizacao): Promise<Aluno> =>
  solicitar(`/alunos/${id}`, json("PATCH", dados));

export const excluirAluno = (id: number): Promise<void> =>
  solicitar(`/alunos/${id}`, { method: "DELETE" });

export const listarDisciplinas = (): Promise<Disciplina[]> => solicitar("/disciplinas");

export const criarDisciplina = (dados: DisciplinaEntrada): Promise<Disciplina> =>
  solicitar("/disciplinas", json("POST", dados));

export const excluirDisciplina = (id: number): Promise<void> =>
  solicitar(`/disciplinas/${id}`, { method: "DELETE" });

export const matricularAluno = (alunoId: number, disciplinaId: number): Promise<void> =>
  solicitar(`/alunos/${alunoId}/matricular/${disciplinaId}`, { method: "POST" });

export const disciplinasDoAluno = (alunoId: number): Promise<Disciplina[]> =>
  solicitar(`/alunos/${alunoId}/disciplinas`);
