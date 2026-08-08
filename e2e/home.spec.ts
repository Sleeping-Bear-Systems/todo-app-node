import { expect, type Page, test } from "@playwright/test";

async function signInAsAdmin(page: Page) {
  await page.goto("/login");
  await page.getByLabel("Username").fill("admin");
  await page.getByLabel("Password").fill("password1234");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/auth\/home$/);
}

async function addTask(page: Page, title: string, description: string) {
  await page.goto("/auth/add-task");
  await page.getByLabel("Title").fill(title);
  await page.getByLabel("Description").fill(description);
  await page.getByRole("button", { name: "Add" }).click();
  await expect(page).toHaveURL(/\/auth\/home$/);
}

test("GET /auth/home redirects unauthenticated users to /login", async ({
  page,
}) => {
  await page.goto("/auth/home");

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Login" }),
  ).toBeVisible();
});

test("Authenticated user can view the home page", async ({ page }) => {
  await signInAsAdmin(page);

  await expect(page).toHaveURL(/\/auth\/home$/);
  await expect(page).toHaveTitle("Home");
  await expect(
    page.getByRole("heading", { level: 1, name: "Home" }),
  ).toBeVisible();
  await expect(page.locator("#home-calendar")).not.toBeVisible();
  await expect(page.locator("#home-calendar")).toHaveClass(/\bfc\b/);
  await expect(page.getByRole("link", { name: "Add Task" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Add Task" })).toHaveAttribute(
    "href",
    "/auth/add-task",
  );
  await expect(page.getByRole("button", { name: "Sign out" })).toBeVisible();
});

test("User can navigate to add-task page from home page", async ({ page }) => {
  await signInAsAdmin(page);

  await page.getByRole("link", { name: "Add Task" }).click();

  await expect(page).toHaveURL(/\/auth\/add-task$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Add Task" }),
  ).toBeVisible();
});

test("User can sign out from home page", async ({ page }) => {
  await signInAsAdmin(page);
  await page.getByRole("button", { name: "Sign out" }).click();

  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { level: 1, name: "Login" }),
  ).toBeVisible();

  await page.goto("/auth/home");
  await expect(page).toHaveURL(/\/login$/);
});

test("User can complete an active task from home page", async ({ page }) => {
  await signInAsAdmin(page);

  const taskTitle = `Complete task ${Date.now()}`;
  const taskDescription = "Task ready to complete";
  await addTask(page, taskTitle, taskDescription);

  const taskRow = page.locator("tr", {
    has: page.getByRole("cell", { name: taskTitle }),
  });

  await expect(taskRow).toBeVisible();
  await expect(taskRow.getByRole("cell", { name: "Active" })).toBeVisible();

  await taskRow.getByRole("button", { name: "Complete task" }).click();

  await expect(taskRow.getByRole("cell", { name: "Completed" })).toBeVisible();
  await expect(
    taskRow.getByRole("button", { name: "Complete task" }),
  ).toHaveCount(0);
  await expect(
    taskRow.getByRole("button", { name: "Remove task" }),
  ).toHaveCount(0);
});

test("User can remove an active task from home page", async ({ page }) => {
  await signInAsAdmin(page);

  const taskTitle = `Remove task ${Date.now()}`;
  const taskDescription = "Task ready to remove";
  await addTask(page, taskTitle, taskDescription);

  const taskRow = page.locator("tr", {
    has: page.getByRole("cell", { name: taskTitle }),
  });

  await expect(taskRow).toBeVisible();

  await taskRow.getByRole("button", { name: "Remove task" }).click();

  await expect(taskRow.getByRole("cell", { name: "Removed" })).toBeVisible();
  await expect(
    taskRow.getByRole("button", { name: "Complete task" }),
  ).toHaveCount(0);
  await expect(
    taskRow.getByRole("button", { name: "Remove task" }),
  ).toHaveCount(0);
});
