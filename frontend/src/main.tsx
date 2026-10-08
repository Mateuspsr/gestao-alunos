// main.tsx — o PONTO DE ENTRADA do app (já vem pronto).
// Ele pega a <div id="root"> do index.html e "monta" o React dentro dela.
// Você não precisa mexer neste arquivo.
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
