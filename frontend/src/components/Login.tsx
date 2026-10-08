import { useState, type FormEvent } from "react";
import { fazerLogin } from "../api";

interface Props {
  aoEntrar: () => void;
}

export default function Login({ aoEntrar }: Props) {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function entrar(evento: FormEvent) {
    evento.preventDefault();
    setErro("");
    setEnviando(true);

    try {
      await fazerLogin(usuario.trim(), senha);
      aoEntrar();
    } catch (falha) {
      setErro(falha instanceof Error ? falha.message : "Não foi possível entrar.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="login-page">
      <div className="login-description">
        <div className="logo logo-large">P</div>
        <span className="eyebrow">GESTÃO ESCOLAR</span>
        <h1>Organização acadêmica em um só lugar.</h1>
        <p>Cadastre alunos, acompanhe médias e gerencie disciplinas e matrículas.</p>
      </div>

      <section className="panel login-panel">
        <span className="eyebrow">ACESSO AO SISTEMA</span>
        <h2>Bem-vindo ao POLAR</h2>
        <p className="muted">Entre com suas credenciais para continuar.</p>
        <form onSubmit={entrar}>
          <label htmlFor="usuario">Usuário</label>
          <input id="usuario" autoComplete="username" value={usuario}
            onChange={(e) => setUsuario(e.target.value)} required />
          <label htmlFor="senha">Senha</label>
          <input id="senha" type="password" autoComplete="current-password"
            value={senha} onChange={(e) => setSenha(e.target.value)} required />
          {erro && <p className="erro" role="alert">{erro}</p>}
          <button className="primary full" type="submit" disabled={enviando}>
            {enviando ? "Entrando..." : "Entrar"}
          </button>
        </form>
      </section>
    </div>
  );
}
