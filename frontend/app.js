"use strict";

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];
const TOKEN_KEY = "gestao_alunos_token";
let alunos = [];
let disciplinas = [];
let tabAtual = "overview";

const authToken = () => sessionStorage.getItem(TOKEN_KEY);

function aviso(selector, texto = "", tipo = "info") {
  const elemento = $(selector);
  elemento.textContent = texto;
  elemento.className = texto ? "feedback " + tipo : "feedback";
}

function visivel(selector, exibir) {
  $(selector).classList.toggle("hidden", !exibir);
}

function abrirAba(nome) {
  tabAtual = nome;
  $$(".tab").forEach(botao => {
    const ativo = botao.dataset.tab === nome;
    botao.classList.toggle("active", ativo);
    if (ativo) botao.setAttribute("aria-current", "page");
    else botao.removeAttribute("aria-current");
  });
  $$(".tab-page").forEach(pagina => pagina.classList.toggle("hidden", pagina.id !== "tab-" + nome));
}

function sair(mensagem = "") {
  sessionStorage.removeItem(TOKEN_KEY);
  alunos = [];
  disciplinas = [];
  visivel("#dashboard", false);
  visivel("#session-tools", false);
  visivel("#login-card", true);
  aviso("#login-msg", mensagem, mensagem ? "error" : "info");
}

function entrar(usuario) {
  $("#session-user").textContent = usuario;
  visivel("#login-card", false);
  visivel("#dashboard", true);
  visivel("#session-tools", true);
  abrirAba(tabAtual);
}

async function requisicao(caminho, opcoes = {}) {
  const headers = new Headers(opcoes.headers || {});
  const token = authToken();
  if (token) headers.set("Authorization", "Bearer " + token);
  const resposta = await fetch(caminho, { ...opcoes, headers });
  if (resposta.status === 401) {
    sair("A sessão expirou. Entre novamente.");
    throw new Error("Sessão expirada.");
  }
  if (!resposta.ok) {
    let detalhe;
    try {
      const corpo = await resposta.json();
      detalhe = typeof corpo.detail === "string" ? corpo.detail : null;
    } catch (_) {}
    throw new Error(detalhe || "A operação não pôde ser concluída (HTTP " + resposta.status + ").");
  }
  return resposta.status === 204 ? null : resposta.json();
}

function celula(texto, classe = "") {
  const td = document.createElement("td");
  td.textContent = String(texto ?? "—");
  if (classe) td.className = classe;
  return td;
}

function linhaVazia(tbody, colunas, mensagem) {
  const tr = document.createElement("tr");
  const td = celula(mensagem, "empty");
  td.colSpan = colunas;
  tr.append(td);
  tbody.append(tr);
}

function media(aluno) {
  return Number(aluno.media ?? 0);
}

function marcadorMedia(aluno) {
  const td = document.createElement("td");
  const span = document.createElement("span");
  span.className = "score" + (media(aluno) < 7 ? " low" : "");
  span.textContent = media(aluno).toFixed(2);
  td.append(span);
  return td;
}

function preencherSelect(seletor, registros, rotulo, mensagem) {
  const select = $(seletor);
  const anterior = select.value;
  select.replaceChildren();
  const vazio = document.createElement("option");
  vazio.value = "";
  vazio.textContent = mensagem;
  select.append(vazio);
  registros.forEach(registro => {
    const opcao = document.createElement("option");
    opcao.value = String(registro.id);
    opcao.textContent = rotulo(registro);
    select.append(opcao);
  });
  if (registros.some(item => String(item.id) === anterior)) select.value = anterior;
}

function renderizarIndicadores() {
  $("#count-alunos").textContent = alunos.length;
  $("#count-disciplinas").textContent = disciplinas.length;
  $("#count-media").textContent = alunos.length
    ? (alunos.reduce((soma, aluno) => soma + media(aluno), 0) / alunos.length).toFixed(2)
    : "—";
  $("#count-boas-medias").textContent = alunos.filter(aluno => media(aluno) >= 7).length;
  const tbody = $("#recent-body");
  tbody.replaceChildren();
  const recentes = [...alunos].sort((a, b) => b.id - a.id).slice(0, 5);
  if (!recentes.length) linhaVazia(tbody, 4, "Ainda não há alunos cadastrados.");
  recentes.forEach(aluno => {
    const tr = document.createElement("tr");
    tr.append(celula(aluno.nome), celula(aluno.matricula), celula(aluno.idade), marcadorMedia(aluno));
    tbody.append(tr);
  });
}

function botaoAcao(rotulo, acao, classe = "button-light") {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.className = "button button-small " + classe;
  botao.textContent = rotulo;
  botao.addEventListener("click", acao);
  return botao;
}

function renderizarAlunos() {
  const busca = $("#busca").value.trim().toLocaleLowerCase("pt-BR");
  const filtro = $("#filtro-media").value;
  const filtrados = alunos.filter(aluno => {
    const texto = (aluno.nome + " " + aluno.matricula).toLocaleLowerCase("pt-BR");
    return (!busca || texto.includes(busca))
      && (filtro === "all" || (filtro === "high" ? media(aluno) >= 7 : media(aluno) < 7));
  });
  $("#student-count-label").textContent = filtrados.length + " registro(s) encontrado(s)";
  const tbody = $("#alunos-body");
  tbody.replaceChildren();
  if (!filtrados.length) linhaVazia(tbody, 5, "Nenhum aluno corresponde à pesquisa.");
  filtrados.forEach(aluno => {
    const tr = document.createElement("tr");
    const acoes = document.createElement("td");
    const grupo = document.createElement("div");
    grupo.className = "table-actions";
    grupo.append(
      botaoAcao("Editar", () => editarAluno(aluno)),
      botaoAcao("Excluir", () => excluirAluno(aluno), "button-danger")
    );
    acoes.append(grupo);
    tr.append(celula(aluno.nome), celula(aluno.matricula), celula(aluno.idade), marcadorMedia(aluno), acoes);
    tbody.append(tr);
  });
}

function renderizarDisciplinas() {
  const tbody = $("#disciplinas-body");
  tbody.replaceChildren();
  if (!disciplinas.length) linhaVazia(tbody, 3, "Nenhuma disciplina cadastrada.");
  disciplinas.forEach(disciplina => {
    const tr = document.createElement("tr");
    const acoes = document.createElement("td");
    acoes.append(botaoAcao("Excluir", () => excluirDisciplina(disciplina), "button-danger"));
    tr.append(celula(disciplina.nome), celula(disciplina.carga_horaria + " h"), acoes);
    tbody.append(tr);
  });
  preencherSelect("#matricula-aluno", alunos, aluno => aluno.nome + " — " + aluno.matricula, "Selecione um aluno");
  preencherSelect("#consulta-aluno", alunos, aluno => aluno.nome + " — " + aluno.matricula, "Selecione um aluno");
  preencherSelect("#matricula-disciplina", disciplinas, disciplina => disciplina.nome, "Selecione uma disciplina");
}

async function carregarDisciplinasDoAluno() {
  const id = $("#consulta-aluno").value;
  const lista = $("#disciplinas-do-aluno");
  lista.replaceChildren();
  if (!id) {
    const li = document.createElement("li");
    li.textContent = "Selecione um aluno para visualizar suas disciplinas.";
    lista.append(li);
    return;
  }
  try {
    const registros = await requisicao("/alunos/" + id + "/disciplinas");
    if (!registros.length) {
      const li = document.createElement("li");
      li.textContent = "Este aluno ainda não possui disciplinas.";
      lista.append(li);
    }
    registros.forEach(disciplina => {
      const li = document.createElement("li");
      const carga = document.createElement("span");
      carga.textContent = disciplina.carga_horaria + " h";
      const nome = document.createElement("span");
      nome.textContent = disciplina.nome;
      li.append(nome, carga);
      lista.append(li);
    });
  } catch (erro) {
    const li = document.createElement("li");
    li.textContent = erro.message;
    lista.append(li);
  }
}

async function carregarTudo() {
  try {
    [alunos, disciplinas] = await Promise.all([
      requisicao("/alunos"), requisicao("/disciplinas")
    ]);
    renderizarIndicadores();
    renderizarAlunos();
    renderizarDisciplinas();
    await carregarDisciplinasDoAluno();
    aviso("#app-msg");
  } catch (erro) {
    aviso("#app-msg", erro.message, "error");
  }
}

function limparFormularioAluno() {
  $("#aluno-form").reset();
  $("#aluno-id").value = "";
  $("#matricula").readOnly = false;
  $("#salvar-aluno").textContent = "Cadastrar aluno";
  $("#student-form-caption").textContent = "Insira os dados para criar um registro.";
  visivel("#cancelar-edicao", false);
}

function editarAluno(aluno) {
  abrirAba("students");
  $("#aluno-id").value = aluno.id;
  $("#nome").value = aluno.nome;
  $("#matricula").value = aluno.matricula;
  $("#matricula").readOnly = true;
  $("#idade").value = aluno.idade ?? "";
  $("#media").value = media(aluno);
  $("#salvar-aluno").textContent = "Salvar alterações";
  $("#student-form-caption").textContent = "Atualizando o cadastro selecionado.";
  visivel("#cancelar-edicao", true);
  aviso("#cadastro-msg");
  $("#aluno-form").scrollIntoView({ behavior: "smooth", block: "center" });
  $("#nome").focus();
}

async function excluirAluno(aluno) {
  if (!confirm('Excluir o aluno "' + aluno.nome + '"? Suas matrículas também serão removidas.')) return;
  try {
    await requisicao("/alunos/" + aluno.id, { method: "DELETE" });
    if ($("#aluno-id").value === String(aluno.id)) limparFormularioAluno();
    await carregarTudo();
    aviso("#app-msg", "Aluno excluído.", "success");
  } catch (erro) { aviso("#app-msg", erro.message, "error"); }
}

async function excluirDisciplina(disciplina) {
  if (!confirm('Excluir a disciplina "' + disciplina.nome + '"?')) return;
  try {
    await requisicao("/disciplinas/" + disciplina.id, { method: "DELETE" });
    await carregarTudo();
    aviso("#disciplina-msg", "Disciplina excluída.", "success");
  } catch (erro) { aviso("#disciplina-msg", erro.message, "error"); }
}

$("#login-form").addEventListener("submit", async evento => {
  evento.preventDefault();
  const usuario = $("#username").value.trim();
  const senha = $("#password").value;
  const botao = $("#login-form button[type=submit]");
  botao.disabled = true;
  aviso("#login-msg", "Verificando credenciais...");
  try {
    const dados = new URLSearchParams({ username: usuario, password: senha });
    const resposta = await fetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: dados
    });
    if (!resposta.ok) throw new Error("Usuário ou senha inválidos.");
    const resultado = await resposta.json();
    sessionStorage.setItem(TOKEN_KEY, resultado.access_token);
    $("#password").value = "";
    aviso("#login-msg");
    entrar(usuario);
    await carregarTudo();
  } catch (erro) { aviso("#login-msg", erro.message, "error"); }
  finally { botao.disabled = false; }
});

$("#aluno-form").addEventListener("submit", async evento => {
  evento.preventDefault();
  const id = $("#aluno-id").value;
  const payload = {
    nome: $("#nome").value.trim(),
    idade: $("#idade").value === "" ? null : Number($("#idade").value),
    media: Number($("#media").value)
  };
  if (!id) payload.matricula = $("#matricula").value.trim();
  try {
    await requisicao(id ? "/alunos/" + id : "/alunos", {
      method: id ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    limparFormularioAluno();
    await carregarTudo();
    aviso("#cadastro-msg", id ? "Dados atualizados." : "Aluno cadastrado.", "success");
  } catch (erro) { aviso("#cadastro-msg", erro.message, "error"); }
});

$("#disciplina-form").addEventListener("submit", async evento => {
  evento.preventDefault();
  try {
    await requisicao("/disciplinas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nome: $("#disciplina-nome").value.trim(),
        carga_horaria: Number($("#disciplina-carga").value)
      })
    });
    evento.target.reset();
    await carregarTudo();
    aviso("#disciplina-msg", "Disciplina cadastrada.", "success");
  } catch (erro) { aviso("#disciplina-msg", erro.message, "error"); }
});

$("#matricula-form").addEventListener("submit", async evento => {
  evento.preventDefault();
  const alunoId = $("#matricula-aluno").value;
  const disciplinaId = $("#matricula-disciplina").value;
  if (!alunoId || !disciplinaId) {
    aviso("#matricula-msg", "Selecione o aluno e a disciplina.", "error");
    return;
  }
  try {
    await requisicao("/alunos/" + alunoId + "/matricular/" + disciplinaId, { method: "POST" });
    $("#consulta-aluno").value = alunoId;
    await carregarDisciplinasDoAluno();
    aviso("#matricula-msg", "Matrícula registrada.", "success");
  } catch (erro) { aviso("#matricula-msg", erro.message, "error"); }
});

$$(".tab").forEach(botao => botao.addEventListener("click", () => abrirAba(botao.dataset.tab)));
$$("[data-open-tab]").forEach(botao => botao.addEventListener("click", () => abrirAba(botao.dataset.openTab)));
$("#busca").addEventListener("input", renderizarAlunos);
$("#filtro-media").addEventListener("change", renderizarAlunos);
$("#consulta-aluno").addEventListener("change", carregarDisciplinasDoAluno);
$("#cancelar-edicao").addEventListener("click", () => { limparFormularioAluno(); aviso("#cadastro-msg"); });
$("#recarregar").addEventListener("click", carregarTudo);
$("#logout").addEventListener("click", () => sair());

(async () => {
  if (!authToken()) { sair(); return; }
  try {
    const usuario = await requisicao("/auth/me");
    entrar(usuario.username);
    await carregarTudo();
  } catch (_) { sair("Entre para acessar o sistema."); }
})();
