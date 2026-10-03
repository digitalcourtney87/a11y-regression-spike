/**
 * Named setup functions for journeys (HANDOFF §7.2, §10.2; DR-0066).
 * Playwright establishes state only: a setup step runs between AT segments,
 * never inside one, and never inside an observation window. A setup that
 * throws makes the next AT step ENV_FAILURE (P24).
 */
import type { Page } from "playwright";

export type SetupFn = (page: Page) => Promise<void>;

async function settle(page: Page, ms = 500): Promise<void> {
  await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined);
  await page.waitForTimeout(ms);
}

export const SETUPS: Readonly<Record<string, SetupFn>> = {
  /** Waits for the network to go quiet, then half a second. */
  settle: async (page) => {
    await settle(page);
  },
  /** Atomic CRM, contact create: fill the required fields with a fixed contact, Ada Lovelace. */
  "acrm.fill-contact": async (page) => {
    await page.locator('input[name="first_name"]').fill("Ada");
    await page.locator('input[name="last_name"]').fill("Lovelace");
    await settle(page, 300);
  },
  /** Atomic CRM, contact create: a LinkedIn URL that is a valid URL but not linkedin.com, so its validator reports an error on save. */
  "acrm.invalid-linkedin": async (page) => {
    await page.locator('input[name="linkedin_url"]').fill("https://example.com/ada");
    await settle(page, 300);
  },
  /** Atomic CRM, company create: fill the required name with a fixed company, Ada Corp. */
  "acrm.fill-company": async (page) => {
    await page.locator('input[name="name"]').first().fill("Ada Corp");
    await settle(page, 300);
  },
  /** Atomic CRM, contact page: type a fixed note into the Add a note box. */
  "acrm.type-note": async (page) => {
    await page.getByRole("textbox", { name: "Add a note" }).first().fill("Called about the renewal");
    await settle(page, 300);
  },
  /** react-admin "simple", post edit: change the title, so that the Save button is enabled. */
  "ras.edit-post-title": async (page) => {
    const title = page.locator('input[name="title"]').first();
    await title.fill(`${await title.inputValue()} (edited)`);
    await settle(page, 300);
  },
  /** react-admin "simple", comment create: choose the first post in the Post select so that its Show button appears. */
  "ras.choose-first-post": async (page) => {
    await page.getByRole("combobox", { name: /post/i }).first().click();
    await page.getByRole("option").first().click();
    await settle(page);
  },
};

export const SETUP_NAMES: ReadonlySet<string> = new Set(Object.keys(SETUPS));
