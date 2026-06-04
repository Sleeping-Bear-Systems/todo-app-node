import { expect, test } from "@playwright/test";

test("GET /about renders about content", async ({ page }) => {
  await page.goto("/about");

  await expect(page).toHaveTitle("About");
  await expect(
    page.getByRole("heading", { level: 1, name: "About" }),
  ).toBeVisible();
  await expect(page.getByText(/Sleeping Bear Systems/)).toBeVisible();
});
