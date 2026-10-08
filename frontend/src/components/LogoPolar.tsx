interface LogoPolarProps {
  tamanho?: number;
}

function LogoPolar({ tamanho = 36 }: LogoPolarProps) {
  return (
    <svg
      width={tamanho}
      height={tamanho}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        cx="24"
        cy="24"
        r="21"
        stroke="currentColor"
        strokeWidth="1.5"
        opacity="0.3"
      />

      <path
        d="M24 4L29 19L24 24L19 19L24 4Z"
        fill="currentColor"
      />

      <path
        d="M24 44L19 29L24 24L29 29L24 44Z"
        fill="currentColor"
        opacity="0.45"
      />

      <path
        d="M4 24L19 19L24 24L19 29L4 24Z"
        fill="currentColor"
        opacity="0.45"
      />

      <path
        d="M44 24L29 29L24 24L29 19L44 24Z"
        fill="currentColor"
        opacity="0.75"
      />

      <circle
        cx="24"
        cy="24"
        r="3.5"
        fill="currentColor"
      />
    </svg>
  );
}

export default LogoPolar;