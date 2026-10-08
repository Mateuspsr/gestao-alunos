import IconeMenu from "./IconeMenu";
import LogoPolar from "./LogoPolar";

export type Pagina =
  | "dashboard"
  | "alunos"
  | "disciplinas"
  | "matriculas";

interface SidebarProps {
  paginaAtiva: Pagina;

  aoMudarPagina: (
    pagina: Pagina
  ) => void;

  recolhida: boolean;

  aoAlternarSidebar: () => void;
}

function Sidebar({
  paginaAtiva,
  aoMudarPagina,
  recolhida,
  aoAlternarSidebar,
}: SidebarProps) {
  return (
    <aside
      className={`sidebar ${
        recolhida
          ? "sidebar-recolhida"
          : ""
      }`}
    >
      <div className="marca">
        <div className="marca-icone">
          <LogoPolar tamanho={38} />
        </div>

        {!recolhida && (
          <div className="marca-texto">
            <strong>
              POLAR
            </strong>

            <span>
              Gestão Escolar
            </span>
          </div>
        )}
      </div>

      <nav
        className="menu-lateral"
        aria-label="Navegação principal"
      >
        <button
          className={
            paginaAtiva ===
            "dashboard"
              ? "menu-ativo"
              : ""
          }
          onClick={() =>
            aoMudarPagina(
              "dashboard"
            )
          }
          title="Visão Geral"
        >
          <span className="menu-simbolo">
            <IconeMenu tipo="dashboard" />
          </span>

          {!recolhida && (
            <span>
              Visão Geral
            </span>
          )}
        </button>

        <button
          className={
            paginaAtiva ===
            "alunos"
              ? "menu-ativo"
              : ""
          }
          onClick={() =>
            aoMudarPagina(
              "alunos"
            )
          }
          title="Alunos"
        >
          <span className="menu-simbolo">
            <IconeMenu tipo="alunos" />
          </span>

          {!recolhida && (
            <span>
              Alunos
            </span>
          )}
        </button>

        <button
          className={
            paginaAtiva ===
            "disciplinas"
              ? "menu-ativo"
              : ""
          }
          onClick={() =>
            aoMudarPagina(
              "disciplinas"
            )
          }
          title="Disciplinas"
        >
          <span className="menu-simbolo">
            <IconeMenu tipo="disciplinas" />
          </span>

          {!recolhida && (
            <span>
              Disciplinas
            </span>
          )}
        </button>

        <button
          className={
            paginaAtiva ===
            "matriculas"
              ? "menu-ativo"
              : ""
          }
          onClick={() =>
            aoMudarPagina(
              "matriculas"
            )
          }
          title="Matrículas"
        >
          <span className="menu-simbolo">
            <IconeMenu tipo="matriculas" />
          </span>

          {!recolhida && (
            <span>
              Matrículas
            </span>
          )}
        </button>
      </nav>

      <button
        className="botao-recolher"
        onClick={
          aoAlternarSidebar
        }
        aria-label={
          recolhida
            ? "Expandir menu"
            : "Recolher menu"
        }
      >
        {recolhida
          ? "›"
          : "‹"}
      </button>
    </aside>
  );
}

export default Sidebar;