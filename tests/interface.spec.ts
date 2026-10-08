import { test, expect } from "@playwright/test";

test("POLAR: login, cadastro, filtros, edição, disciplinas e matrícula", async ({ page }) => {
  const id = Date.now().toString();
  const nome = "Aluno Navegador " + id;
  const matricula = "UI" + id;
  const disciplina = "Disciplina Navegador " + id;
  const erros: string[] = [];

  page.on("pageerror", (erro) => erros.push(erro.message));
  await page.goto("http://127.0.0.1:8000/app/");
  await expect(page.getByRole("heading", { name: "Bem-vindo ao POLAR" })).toBeVisible();

  await page.getByLabel("Usuário").fill("admin");
  await page.getByLabel("Senha").fill(process.env.ADMIN_PASSWORD ?? "");
  await page.getByRole("button", { name: "Entrar" }).click();
  await expect(page.locator(".sidebar .marca")).toContainText("POLAR");

  await page.locator('button[title="Matrículas"]').click();
  await page.getByRole("button", { name: /Nova matrícula/ }).click();
  await page.locator("#nome").fill(nome);
  await page.locator("#matricula").fill(matricula);
  await page.locator("#idade").fill("20");
  await page.locator("#media").fill("8.5");
  await page.getByRole("button", { name: "Cadastrar aluno" }).click();
  await expect(page.locator(".matricula-item").filter({ hasText: matricula })).toBeVisible();

  await page.reload();
  await page.locator('button[title="Matrículas"]').click();
  const registro = page.locator(".matricula-item").filter({ hasText: matricula });
  await expect(registro).toBeVisible();
  await registro.locator(".botao-editar-matricula").click();
  await page.getByLabel("Média geral").fill("9.5");
  await page.getByRole("button", { name: "Salvar alterações" }).click();
  await expect(page.locator(".matricula-item").filter({ hasText: matricula })).toContainText("9.5");

  await page.locator('button[title="Alunos"]').click();
  await page.getByPlaceholder("Buscar por nome...").fill(nome);
  await expect(page.locator(".aluno-card").filter({ hasText: nome })).toBeVisible();
  await page.locator(".aluno-card").filter({ hasText: nome }).getByRole("button", { name: /Ver perfil/ }).click();
  await expect(page.locator(".perfil-aluno h1")).toContainText(nome);
  await expect(page.locator(".perfil-lista-disciplinas")).not.toBeVisible();

  await page.locator('button[title="Disciplinas"]').click();
  await page.getByLabel("Nome da disciplina").fill(disciplina);
  await page.getByLabel("Carga horária").fill("40");
  await page.getByRole("button", { name: "Cadastrar disciplina" }).click();
  await expect(page.getByText("Disciplina cadastrada.")).toBeVisible();

  await page.getByLabel("Aluno", { exact: true }).selectOption({ label: nome + " — " + matricula });
  await page.getByLabel("Disciplina", { exact: true }).selectOption({ label: disciplina });
  await page.getByRole("button", { name: "Registrar matrícula" }).click();
  await expect(page.getByText(/Matrícula registrada/)).toBeVisible();

  await page.reload();
  await page.locator('button[title="Disciplinas"]').click();
  await page.locator(".disciplina-card").filter({ hasText: disciplina }).click();
  await expect(page.locator(".modal-disciplina")).toContainText(nome);

  expect(erros, "Erros JavaScript capturados no navegador").toEqual([]);
});
