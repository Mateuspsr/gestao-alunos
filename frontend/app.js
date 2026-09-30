const tokenKey = "gestao_alunos_token";

const loginCard =
  document.querySelector("#login-card");

const dashboard =
  document.querySelector("#dashboard");

const logoutButton =
  document.querySelector("#logout");

const loginForm =
  document.querySelector("#login-form");

const alunoForm =
  document.querySelector("#aluno-form");

const alunosBody =
  document.querySelector("#alunos-body");

const loginMsg =
  document.querySelector("#login-msg");

const listaMsg =
  document.querySelector("#lista-msg");

const cadastroMsg =
  document.querySelector("#cadastro-msg");


function token() {
  return sessionStorage.getItem(
    tokenKey
  );
}


function mostrarMensagem(
  elemento,
  texto,
  tipo = ""
) {
  elemento.textContent = texto;

  elemento.className =
    `mensagem ${tipo}`.trim();
}


function mostrarLogin() {
  loginCard.classList.remove(
    "oculto"
  );

  dashboard.classList.add(
    "oculto"
  );

  logoutButton.classList.add(
    "oculto"
  );
}


function mostrarDashboard() {
  loginCard.classList.add(
    "oculto"
  );

  dashboard.classList.remove(
    "oculto"
  );

  logoutButton.classList.remove(
    "oculto"
  );
}


async function api(
  path,
  options = {}
) {
  const headers = new Headers(
    options.headers || {}
  );

  const accessToken = token();

  if (accessToken) {
    headers.set(
      "Authorization",
      `Bearer ${accessToken}`
    );
  }

  const resposta = await fetch(
    path,
    {
      ...options,
      headers
    }
  );

  if (resposta.status === 401) {
    sessionStorage.removeItem(
      tokenKey
    );

    mostrarLogin();

    throw new Error(
      "Sessão expirada. Entre novamente."
    );
  }

  return resposta;
}


async function carregarAlunos() {
  mostrarMensagem(
    listaMsg,
    "Carregando..."
  );

  try {
    const resposta = await api(
      "/alunos"
    );

    if (!resposta.ok) {
      throw new Error(
        "Não foi possível carregar os alunos."
      );
    }

    const alunos =
      await resposta.json();

    alunosBody.innerHTML = "";

    for (const aluno of alunos) {
      const linha =
        document.createElement("tr");

      linha.innerHTML = `
        <td>${aluno.id}</td>
        <td>${aluno.nome}</td>
        <td>${aluno.matricula}</td>
        <td>${aluno.idade ?? "—"}</td>
        <td>${Number(aluno.media).toFixed(2)}</td>
      `;

      alunosBody.appendChild(
        linha
      );
    }

    mostrarMensagem(
      listaMsg,
      `${alunos.length} aluno(s) carregado(s).`,
      "sucesso"
    );

  } catch (erro) {
    mostrarMensagem(
      listaMsg,
      erro.message,
      "erro"
    );
  }
}


loginForm.addEventListener(
  "submit",
  async (evento) => {

    evento.preventDefault();

    mostrarMensagem(
      loginMsg,
      "Entrando..."
    );

    const dados =
      new URLSearchParams();

    dados.set(
      "username",
      document.querySelector(
        "#username"
      ).value
    );

    dados.set(
      "password",
      document.querySelector(
        "#password"
      ).value
    );

    try {
      const resposta = await fetch(
        "/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/x-www-form-urlencoded"
          },
          body: dados,
        }
      );

      const corpo =
        await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          corpo.detail ||
          "Falha no login."
        );
      }

      sessionStorage.setItem(
        tokenKey,
        corpo.access_token
      );

      mostrarDashboard();

      mostrarMensagem(
        loginMsg,
        ""
      );

      await carregarAlunos();

    } catch (erro) {
      mostrarMensagem(
        loginMsg,
        erro.message,
        "erro"
      );
    }
  }
);


alunoForm.addEventListener(
  "submit",
  async (evento) => {

    evento.preventDefault();

    const idadeTexto =
      document.querySelector(
        "#idade"
      ).value;

    const payload = {
      nome:
        document.querySelector(
          "#nome"
        ).value,

      matricula:
        document.querySelector(
          "#matricula"
        ).value,

      idade:
        idadeTexto === ""
          ? null
          : Number(idadeTexto),

      media:
        Number(
          document.querySelector(
            "#media"
          ).value
        ),
    };

    try {
      const resposta = await api(
        "/alunos",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json"
          },
          body:
            JSON.stringify(payload),
        }
      );

      const corpo =
        resposta.status === 204
          ? null
          : await resposta.json();

      if (!resposta.ok) {
        throw new Error(
          corpo?.detail ||
          "Falha ao cadastrar aluno."
        );
      }

      alunoForm.reset();

      document.querySelector(
        "#media"
      ).value = "0";

      mostrarMensagem(
        cadastroMsg,
        "Aluno cadastrado com sucesso.",
        "sucesso"
      );

      await carregarAlunos();

    } catch (erro) {
      mostrarMensagem(
        cadastroMsg,
        erro.message,
        "erro"
      );
    }
  }
);


document
  .querySelector("#recarregar")
  .addEventListener(
    "click",
    carregarAlunos
  );


logoutButton.addEventListener(
  "click",
  () => {
    sessionStorage.removeItem(
      tokenKey
    );

    mostrarLogin();
  }
);


if (token()) {
  mostrarDashboard();
  carregarAlunos();

} else {
  mostrarLogin();
}