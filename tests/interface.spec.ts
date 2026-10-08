import { test, expect } from "@playwright/test";
import { mkdirSync } from "node:fs";

test("POLAR: login, cadastro, filtros, edição, disciplinas e matrícula", async ({ page }) => {
  test.setTimeout(60_000);
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
  await page.locator(".intro-polar").waitFor({ state: "hidden", timeout: 12000 });
  mkdirSync("capturas", { recursive: true });
  await page.screenshot({ path: "capturas/polar-dashboard.png", fullPage: true });

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

  const formulario = page.locator("form").filter({
    has: page.getByRole("heading", { name: "Matricular aluno em uma disciplina" }),
  });
  await formulario.locator("select").first().selectOption({ label: nome + " — " + matricula });
  await formulario.locator("select").nth(1).selectOption({ label: disciplina });
  await page.getByRole("button", { name: "Registrar matrícula" }).click();
  await expect(page.getByText(/Matrícula registrada/)).toBeVisible();

  await page.reload();
  await page.locator('button[title="Disciplinas"]').click();
  await page.locator(".disciplina-card").filter({ hasText: disciplina }).click();
  await expect(page.locator(".modal-disciplina")).toContainText(nome);

  expect(erros, "Erros JavaScript capturados no navegador").toEqual([]);
});
