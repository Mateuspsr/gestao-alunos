import {
  useEffect,
  useState,
} from "react";

import LogoPolar from "./LogoPolar";

interface IntroPolarProps {
  aoConcluir: () => void;
}

function IntroPolar({
  aoConcluir,
}: IntroPolarProps) {
  const [
    saindo,
    setSaindo,
  ] = useState(false);

  useEffect(() => {
    const timerMovimento =
      window.setTimeout(
        () => {
          setSaindo(true);
        },
        900
      );

    const timerFinal =
      window.setTimeout(
        () => {
          aoConcluir();
        },
        1750
      );

    return () => {
      window.clearTimeout(
        timerMovimento
      );

      window.clearTimeout(
        timerFinal
      );
    };
  }, [aoConcluir]);

  return (
    <div
      className={
        saindo
          ? "intro-polar intro-polar-saindo"
          : "intro-polar"
      }
    >
      <div className="intro-grade" />

      <div className="intro-conteudo">
        <div className="intro-logo">
          <LogoPolar tamanho={150} />
        </div>

        <div className="intro-nome">
          POLAR
        </div>

        <div className="intro-subtitulo">
          GESTÃO ESCOLAR
        </div>
      </div>

      <div className="intro-status">
        SISTEMA ACADÊMICO
      </div>
    </div>
  );
}

export default IntroPolar;