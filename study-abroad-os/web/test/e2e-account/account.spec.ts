import { test as base, expect, type Page } from "@playwright/test";
import { Pool } from "pg";
import { catalog } from "../../src/lib/catalog";
import { makeTasks } from "../../src/lib/domain";

const password = "e2e-account-pass-123";
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
const test = base.extend<{ browserErrors: void }>({
  browserErrors: [
    async ({ page }, use, info) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await use();
      const allowed = info.annotations.filter((a) => a.type === "expected-status").map((a) => a.description!);
      expect(errors.filter((error) => !allowed.some((status) => error.includes(status)))).toEqual([]);
    },
    { auto: true },
  ],
});
// Every test signs in from 127.0.0.1; Better Auth allows 3 sign-in/up calls per 10 s per IP.
test.beforeEach(async () => { await pool.query(`DELETE FROM "rateLimit"`); });
test.afterAll(async () => { await pool.end(); });

const uniqueEmail = (label: string) => `${label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.test`;
async function navigate(page: Page, name: string) {
  const menu = page.getByRole("button", { name: "เปิดเมนู", exact: true });
  if (await menu.isVisible()) await menu.click();
  // Nav items gain a count once signed in, e.g. "ที่บันทึก 1".
  await page.getByRole("button", { name: new RegExp(`^${name}(?: \\d+)?$`) }).click();
}
async function openExplore(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "ข้ามไปค้นหา", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(catalog.length);
}
const topLogin = (page: Page) => page.getByRole("banner").getByRole("button", { name: "เข้าสู่ระบบ", exact: true });
async function authenticate(page: Page, mode: "signup" | "signin", email: string, secret = password) {
  await topLogin(page).click();
  const dialog = page.getByRole("dialog", { name: "เข้าสู่ระบบ", exact: true });
  await expect(dialog).toBeVisible();
  // The dialog remembers its last mode, so switch only when it is showing the other one.
  const toggle = dialog.getByRole("button", { name: mode === "signup" ? "ยังไม่มีบัญชี? สมัครสมาชิก" : "มีบัญชีแล้ว? เข้าสู่ระบบ", exact: true });
  if (await toggle.isVisible()) await toggle.click();
  if (mode === "signup") await dialog.getByLabel("ชื่อ", { exact: true }).fill("นักเรียน E2E");
  await dialog.getByLabel("อีเมล", { exact: true }).fill(email);
  await dialog.getByLabel("รหัสผ่าน", { exact: true }).fill(secret);
  await dialog.getByRole("button", { name: mode === "signup" ? "สมัครสมาชิก" : "เข้าสู่ระบบ", exact: true }).click();
}
async function signOut(page: Page) {
  const menu = page.getByRole("button", { name: "เปิดเมนู", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("button", { name: "ออกจากระบบ", exact: true }).click();
  await expect(topLogin(page)).toBeVisible();
  const closeMenu = page.getByRole("button", { name: "ปิดเมนู", exact: true });
  // The open drawer covers the middle of the scrim, so tap its uncovered right edge.
  if (await closeMenu.isVisible()) await closeMenu.click({ position: { x: (await closeMenu.boundingBox())!.width - 10, y: 200 } });
}
// The notes <label> wraps the textarea, so its accessible name also contains the typed note.
const notesLabel = /^บันทึกส่วนตัว/;
const planFor = (page: Page, name: string) => page.getByRole("article").filter({ has: page.getByRole("heading", { name, exact: true }) });

test("student signs up, shortlists, builds a plan and gets it back after signing in again", async ({ page }) => {
  const program = catalog[0];
  const email = uniqueEmail("journey");
  const total = makeTasks(program).length;
  await openExplore(page);
  await authenticate(page, "signup", email);
  await expect(page.getByRole("status").filter({ hasText: "สร้างบัญชีแล้ว" })).toBeVisible();
  await expect(topLogin(page)).toHaveCount(0);

  const card = page.getByRole("article").filter({ hasText: program.university });
  await card.getByRole("button", { name: "บันทึกตัวเลือก", exact: true }).click();
  await expect(card.getByRole("button", { name: "นำออกจากที่บันทึก", exact: true })).toBeVisible();
  await navigate(page, "ที่บันทึก");
  await expect(page.getByRole("article")).toHaveCount(1);
  await expect(page.getByRole("article")).toContainText(program.university);

  await page.getByRole("article").getByRole("button", { name: "รายละเอียด", exact: true }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByLabel("ปีเป้าหมาย", { exact: true }).fill("2027");
  await dialog.getByRole("button", { name: "สร้างแผนสมัคร", exact: true }).click();
  await expect(page.getByRole("heading", { name: "แผนสมัครเรียน", exact: true })).toBeVisible();
  const plan = planFor(page, program.name);
  await expect(plan).toContainText(`เป้าหมายปี 2027 · 0/${total} งานเสร็จแล้ว`);

  // Task checkboxes are controlled and only tick once the server confirms the save.
  await plan.locator(".task input[type=checkbox]").first().click();
  await expect(plan.locator(".task input[type=checkbox]").first()).toBeChecked();
  await expect(plan).toContainText(`1/${total} งานเสร็จแล้ว`);
  await plan.getByRole("textbox", { name: notesLabel }).fill("ถามเรื่องใบรับรองผลการเรียน");
  await plan.getByRole("button", { name: "บันทึกโน้ต", exact: true }).click();
  await expect(plan.getByText("บันทึกแล้ว", { exact: true })).toBeVisible();

  await page.reload();
  await navigate(page, "แผนสมัคร");
  await expect(planFor(page, program.name)).toContainText(`1/${total} งานเสร็จแล้ว`);
  await expect(planFor(page, program.name).getByRole("textbox", { name: notesLabel })).toHaveValue("ถามเรื่องใบรับรองผลการเรียน");

  await signOut(page);
  await navigate(page, "แผนสมัคร");
  await expect(page.getByText("เข้าสู่ระบบเพื่อใช้พื้นที่ส่วนตัว", { exact: true })).toBeVisible();

  await authenticate(page, "signin", email);
  await expect(page.getByRole("status").filter({ hasText: "เข้าสู่ระบบแล้ว" })).toBeVisible();
  await navigate(page, "แผนสมัคร");
  await expect(planFor(page, program.name)).toContainText(`1/${total} งานเสร็จแล้ว`);
  await navigate(page, "ที่บันทึก");
  await expect(page.getByRole("article")).toHaveCount(1);
});

test("a wrong password keeps the student signed out", async ({ page }, info) => {
  info.annotations.push({ type: "expected-status", description: "401" });
  const email = uniqueEmail("wrong");
  await openExplore(page);
  await authenticate(page, "signup", email);
  await expect(topLogin(page)).toHaveCount(0);
  await signOut(page);
  await authenticate(page, "signin", email, "not-the-right-password");
  await expect(page.getByRole("dialog", { name: "เข้าสู่ระบบ", exact: true })).toBeVisible();
  await expect(page.getByRole("status").filter({ hasText: /Invalid email or password|ไม่สำเร็จ/ })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(topLogin(page)).toBeVisible();
});

test("a stale second tab sees a conflict instead of overwriting the plan", async ({ page, context }, info) => {
  info.annotations.push({ type: "expected-status", description: "409" });
  const program = catalog[1];
  await openExplore(page);
  await authenticate(page, "signup", uniqueEmail("conflict"));
  await expect(topLogin(page)).toHaveCount(0);
  await page.getByRole("article").filter({ hasText: program.university }).getByRole("button", { name: "รายละเอียด", exact: true }).click();
  await page.getByRole("dialog").getByRole("button", { name: "สร้างแผนสมัคร", exact: true }).click();
  const plan = planFor(page, program.name);
  await expect(plan).toBeVisible();

  const stale = await context.newPage();
  await stale.goto("/");
  await navigate(stale, "แผนสมัคร");
  const stalePlan = planFor(stale, program.name);
  await expect(stalePlan).toBeVisible();

  await plan.getByRole("textbox", { name: notesLabel }).fill("แก้จากแท็บแรก");
  await plan.getByRole("button", { name: "บันทึกโน้ต", exact: true }).click();
  await expect(plan.getByText("บันทึกแล้ว", { exact: true })).toBeVisible();

  await stalePlan.locator(".task input[type=checkbox]").first().click();
  await expect(stalePlan.getByText("มีข้อมูลใหม่จากอีกหน้า กรุณาโหลดข้อมูลล่าสุด", { exact: true })).toBeVisible();
  await stalePlan.getByRole("button", { name: "โหลดข้อมูลล่าสุด", exact: true }).click();
  await expect(stalePlan.getByRole("textbox", { name: notesLabel })).toHaveValue("แก้จากแท็บแรก");
  await stale.close();
});
