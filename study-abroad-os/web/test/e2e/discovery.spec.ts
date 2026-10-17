import { test as base, expect, type Page } from "@playwright/test";
import { catalog } from "../../src/lib/catalog";

const test = base.extend<{ browserErrors: void }>({
  browserErrors: [
    async ({ page }, use, info) => {
      const errors: string[] = [];
      const pageErrors: string[] = [];
      page.on("pageerror", (error) => pageErrors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await use();
      expect(pageErrors).toEqual([]);
      const expected503 = info.annotations.some(
        (annotation) => annotation.type === "expected-network-error",
      );
      expect(
        errors.filter((error) => !(expected503 && error.includes("503"))),
      ).toEqual([]);
    },
    { auto: true },
  ],
});
async function explore(page: Page) {
  await page.goto("/");
  await page.getByRole("button", { name: "ข้ามไปค้นหา", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "ค้นหาเส้นทางเรียนต่อจีน" }),
  ).toBeVisible();
  await expect(page.getByRole("article")).toHaveCount(catalog.length);
}
async function navigate(page: Page, name: string) {
  const menu = page.getByRole("button", { name: "เปิดเมนู", exact: true });
  if (await menu.isVisible()) await menu.click();
  await page.getByRole("button", { name, exact: true }).click();
}
async function noOverflow(page: Page) {
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth + 1,
    ),
  ).toBe(true);
}

test("loading is visible while the API is pending and browsing remains available", async ({
  page,
}) => {
  let release!: () => void;
  const pending = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route("**/api/workspace", async (route) => {
    await pending;
    await route.continue();
  });
  try {
    await explore(page);
    await expect(
      page.getByText("กำลังโหลดข้อมูลล่าสุด…", { exact: true }),
    ).toBeVisible();
  } finally {
    release();
  }
  await expect(
    page.getByText("กำลังโหลดข้อมูลล่าสุด…", { exact: true }),
  ).toHaveCount(0);
});

test("search, combined filters, empty results and reset", async ({ page }) => {
  await explore(page);
  await page
    .getByRole("textbox", { name: "ค้นหา", exact: true })
    .fill(catalog[0].university.toUpperCase());
  await expect(page.getByRole("article")).toHaveCount(1);
  for (const query of [
    catalog[0].chineseName.split(" · ")[0],
    "มหาวิทยาลัยปักกิ่ง",
  ]) {
    await page.getByRole("textbox", { name: "ค้นหา", exact: true }).fill(query);
    await expect(page.getByRole("article")).toHaveCount(1);
  }
  await page
    .getByRole("textbox", { name: "ค้นหา", exact: true })
    .fill("not-a-real-university-xyz");
  await expect(
    page.getByText("ไม่พบรายการที่ตรงกับตัวกรอง", { exact: true }),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "ล้างตัวกรอง", exact: true })
    .last()
    .click();
  await page
    .getByRole("combobox", { name: "กรองเมือง" })
    .selectOption(catalog[0].city);
  await page
    .getByRole("combobox", { name: "กรองสาขา" })
    .selectOption(catalog[0].subject);
  await expect(page.getByRole("article")).toHaveCount(
    catalog.filter(
      (item) =>
        item.city === catalog[0].city && item.subject === catalog[0].subject,
    ).length,
  );
  await page.getByRole("button", { name: "ล้างตัวกรอง", exact: true }).click();
  await expect(page.getByRole("article")).toHaveCount(catalog.length);
  await page
    .getByRole("checkbox", { name: "มีข้อมูลทุนอ้างอิง", exact: true })
    .check();
  await expect(page.getByRole("article")).toHaveCount(
    catalog.filter((item) => item.scholarships.length > 0).length,
  );
  await page.getByRole("button", { name: "ล้างตัวกรอง", exact: true }).click();
  await noOverflow(page);
});

test("details show evidence and uncertainty, keyboard closes and restores focus", async ({
  page,
}, info) => {
  await explore(page);
  await page.screenshot({
    path: info.outputPath("explore.png"),
    fullPage: true,
    animations: "disabled",
  });
  const button = page
    .getByRole("button", { name: "รายละเอียด", exact: true })
    .first();
  await button.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await expect(
    dialog.getByRole("button", { name: "กลับ", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(
    dialog.getByRole("button", { name: "สร้างแผนสมัคร", exact: true }),
  ).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(
    dialog.getByRole("button", { name: "กลับ", exact: true }),
  ).toBeFocused();
  await expect(
    dialog.getByText("รอตรวจสอบค่าเรียน", { exact: true }),
  ).toBeVisible();
  const source = dialog.getByText("แหล่งทางการ", { exact: true });
  await source.scrollIntoViewIfNeeded();
  await expect(source).toBeVisible();
  const links = dialog.locator(".official-link-list a");
  await expect(links.first()).toHaveAttribute("href", /^https:\/\//);
  await expect(links.first()).toHaveAttribute("target", "_blank");
  const expectedUrl = await links.first().getAttribute("href");
  await page
    .context()
    .route(expectedUrl!, (route) =>
      route.fulfill({ body: "Source navigation test fixture" }),
    );
  const popupPromise = page.waitForEvent("popup");
  await links.first().click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(expectedUrl!);
  await popup.close();
  await expect(dialog.getByText(/ตรวจข้อมูลล่าสุด/)).toBeVisible();
  await noOverflow(page);
  await dialog.screenshot({ path: info.outputPath("details.png") });
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(button).toBeFocused();
});

test("first visit can save preferences, edit and forget local profile", async ({
  page,
}, info) => {
  await page.goto("/");
  await page
    .getByLabel("ชื่อที่ใช้เรียก (เว้นได้)", { exact: true })
    .fill("ผู้สมัครทดสอบ");
  await expect(
    page.getByRole("combobox", { name: "ภาษาเรียน", exact: true }),
  ).toHaveCount(0);
  await noOverflow(page);
  await page.screenshot({
    path: info.outputPath("onboarding.png"),
    fullPage: true,
    animations: "disabled",
  });
  await page
    .getByLabel("งบค่าเรียนต่อปี (CNY, เว้นได้)", { exact: true })
    .fill("80000");
  await page
    .getByRole("button", { name: "ดูตัวเลือกของฉัน", exact: true })
    .click();
  await expect(page.getByRole("article")).toHaveCount(catalog.length);
  await page.reload();
  await expect(
    page.getByRole("button", { name: "ปรับความต้องการ", exact: true }),
  ).toBeVisible();
  await navigate(page, "ตั้งค่า");
  await expect(
    page.getByRole("combobox", { name: "ภาษาเรียนที่สนใจ", exact: true }),
  ).toHaveValue("ทั้งหมด");
  await page
    .getByRole("combobox", { name: "ภาษาเรียนที่สนใจ", exact: true })
    .selectOption("English");
  await page
    .getByRole("button", { name: "บันทึกการตั้งค่า", exact: true })
    .click();
  await page.reload();
  await navigate(page, "ตั้งค่า");
  await expect(
    page.getByRole("combobox", { name: "ภาษาเรียนที่สนใจ", exact: true }),
  ).toHaveValue("English");
  await navigate(page, "สำรวจหลักสูตร");
  await expect(page.getByRole("article").first()).toContainText("ภาษาอังกฤษ");
  await expect(page.getByRole("article").first()).toContainText("ตรงภาษาเรียน");
  await navigate(page, "โปรไฟล์");
  await page.screenshot({
    path: info.outputPath("profile.png"),
    fullPage: true,
    animations: "disabled",
  });
  await page
    .getByLabel("ชื่อที่ใช้เรียก", { exact: true })
    .fill("แก้ไขผู้สมัคร");
  await page
    .getByRole("button", { name: "บันทึกโปรไฟล์", exact: true })
    .click();
  await page.reload();
  await navigate(page, "โปรไฟล์");
  await expect(page.getByLabel("ชื่อที่ใช้เรียก", { exact: true })).toHaveValue(
    "แก้ไขผู้สมัคร",
  );
  await navigate(page, "ตั้งค่า");
  await expect(
    page.getByRole("combobox", { name: "ภาษาเรียนที่สนใจ", exact: true }),
  ).toHaveValue("English");
  await navigate(page, "โปรไฟล์");
  await page
    .getByRole("button", { name: "ลบโปรไฟล์บนอุปกรณ์นี้", exact: true })
    .click();
  await expect(page.getByLabel("ชื่อที่ใช้เรียก", { exact: true })).toHaveValue(
    "",
  );
  await navigate(page, "สำรวจหลักสูตร");
  await expect(page.getByRole("combobox", { name: "กรองภาษา" })).toHaveCount(0);
  await noOverflow(page);
});

test("workspace errors recover without breaking catalog browsing", async ({
  page,
}, info) => {
  info.annotations.push({
    type: "expected-network-error",
    description: "Intentional 503",
  });
  let fail = true;
  await page.route("**/api/workspace", async (route) => {
    if (fail)
      await route.fulfill({ status: 503, json: { error: "ทดสอบข้อผิดพลาด" } });
    else await route.continue();
  });
  await explore(page);
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "โหลดข้อมูลไม่สำเร็จ",
  );
  fail = false;
  await page.getByRole("button", { name: "ลองโหลดใหม่", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
});

test("database-free API has the shared format and guest actions stay gated", async ({
  page,
  request,
}) => {
  const response = await request.get("/api/workspace");
  expect(response.ok()).toBe(true);
  const data = await response.json();
  expect(data.configured).toBe(false);
  expect(data.catalogSource).toBe("bundled");
  expect(data.programs.length).toBe(catalog.length);
  await explore(page);
  await page
    .getByRole("button", { name: "บันทึกตัวเลือก", exact: true })
    .first()
    .click();
  await expect(
    page.getByRole("dialog", { name: "เข้าสู่ระบบ", exact: true }),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("invalid API data stays visibly unknown, and valid empty results stay empty", async ({
  page,
}) => {
  let empty = false;
  await page.route("**/api/workspace", (route) =>
    route.fulfill({
      json: {
        programs: empty ? [] : [{ university: "ข้อมูลตัวอย่างที่ไม่ครบ" }],
        user: null,
        profile: null,
        saved: [],
        applications: [],
        configured: false,
        catalogSource: "bundled",
      },
    }),
  );
  await explore(page);
  await expect(page.getByRole("main").getByRole("alert")).toContainText(
    "รูปแบบข้อมูลไม่สมบูรณ์",
  );
  empty = true;
  await page.getByRole("button", { name: "ลองโหลดใหม่", exact: true }).click();
  await expect(page.getByRole("main").getByRole("alert")).toHaveCount(0);
  await expect(page.getByRole("article")).toHaveCount(0);
  await expect(
    page.getByText("ยังไม่มีรายการในชุดข้อมูลนี้", { exact: true }),
  ).toBeVisible();
});

test("blocked storage still allows browsing and labels unsaved profile correctly", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, "setItem", {
      value() {
        throw new Error("Storage disabled for test");
      },
    });
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "ดูตัวเลือกของฉัน", exact: true })
    .click();
  await expect(page.getByRole("article")).toHaveCount(catalog.length);
  await expect(
    page.getByText(
      "ใช้ข้อมูลได้ในหน้านี้ แต่เบราว์เซอร์ไม่อนุญาตให้บันทึกบนอุปกรณ์",
      { exact: true },
    ),
  ).toBeVisible();
});

test("scholarship dates remain unconfirmed and a 320px screen does not overflow", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 812 });
  await explore(page);
  await noOverflow(page);
  await navigate(page, "ทุนการศึกษา");
  await expect(page.getByText(/รอตรวจสอบรอบที่สมัคร/).first()).toBeVisible();
  await noOverflow(page);
});
