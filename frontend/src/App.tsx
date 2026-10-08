import { useEffect, useState } from "react";
import { encerrarSessao, temSessao, usuarioAtual } from "./api";
import Login from "./components/Login";
import Polar from "./Polar";

export default function App() {
  const [autenticado, setAutenticado] = useState(temSessao);
  const [verificando, setVerificando] = useState(temSessao);

  useEffect(() => {
    if (!autenticado) {
      setVerificando(false);
      return;
    }
    let ativo = true;
    usuarioAtual()
      .catch(() => {
        if (ativo) {
          encerrarSessao();
          setAutenticado(false);
        }
      })
      .finally(() => { if (ativo) setVerificando(false); });

    return () => { ativo = false; };
  }, [autenticado]);

  useEffect(() => {
    const expirada = () => {
      encerrarSessao();
      setAutenticado(false);
    };
    window.addEventListener("sessao-expirada", expirada);
    return () => window.removeEventListener("sessao-expirada", expirada);
  }, []);

  if (verificando) return <main className="login-aguardando">Verificando sessão...</main>;
  return autenticado ? <Polar /> : <Login aoEntrar={() => setAutenticado(true)} />;
}
