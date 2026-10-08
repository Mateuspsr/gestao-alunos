type TipoIcone =
  | "dashboard"
  | "alunos"
  | "disciplinas"
  | "matriculas";

interface IconeMenuProps {
  tipo: TipoIcone;
}

function IconeMenu({
  tipo,
}: IconeMenuProps) {
  if (tipo === "dashboard") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <rect
          x="3.5"
          y="3.5"
          width="6.5"
          height="6.5"
          rx="1.5"
        />

        <rect
          x="14"
          y="3.5"
          width="6.5"
          height="6.5"
          rx="1.5"
        />

        <rect
          x="3.5"
          y="14"
          width="6.5"
          height="6.5"
          rx="1.5"
        />

        <rect
          x="14"
          y="14"
          width="6.5"
          height="6.5"
          rx="1.5"
        />
      </svg>
    );
  }

  if (tipo === "alunos") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          cx="12"
          cy="8"
          r="3.5"
        />

        <path
          d="M5 20c.5-4 2.8-6 7-6s6.5 2 7 6"
        />
      </svg>
    );
  }

  if (tipo === "disciplinas") {
    return (
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path
          d="M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 1-3-3Z"
        />

        <path
          d="M5 17a3 3 0 0 1 3-3h11"
        />

        <path
          d="M9 8h6"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        cx="7"
        cy="7"
        r="2.5"
      />

      <circle
        cx="17"
        cy="17"
        r="2.5"
      />

      <path
        d="m9 9 6 6"
      />

      <path
        d="M14 6h4a2 2 0 0 1 2 2v4"
      />

      <path
        d="M10 18H6a2 2 0 0 1-2-2v-4"
      />
    </svg>
  );
}

export default IconeMenu;