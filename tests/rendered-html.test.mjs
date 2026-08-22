import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../out/", import.meta.url);

async function output(path) {
  return readFile(new URL(path, outputRoot), "utf8");
}

test("exports the complete interaction-led homepage", async () => {
  const html = await output("index.html");

  assert.match(html, /Meet the AI employee/);
  assert.match(html, /Choose a role/);
  assert.match(html, /Admissions/);
  assert.match(html, /Front desk/);
  assert.match(html, /One conversation\. Every next step connected\./);
  assert.match(html, /AI Automation Hubballi/);
  assert.doesNotMatch(html, /\{\{BRAND_NAME\}\}/);
});

test("exports every primary conversion route", async () => {
  const routes = [
    "ai-agents/index.html",
    "ai-employees/sales-agent/index.html",
    "industries/education/index.html",
    "case-studies/index.html",
    "insights/index.html",
    "about/index.html",
    "contact/index.html",
    "privacy/index.html",
    "terms/index.html",
    "cookies/index.html",
  ];

  await Promise.all(routes.map((route) => access(new URL(route, outputRoot))));
  const contact = await output("contact/index.html");
  assert.match(contact, /Show us what you want to automate\./);
  assert.match(contact, /Request AI Consultation/);
});

test("exports search and social essentials", async () => {
  const [home, robots, sitemap] = await Promise.all([
    output("index.html"),
    output("robots.txt"),
    output("sitemap.xml"),
  ]);

  assert.match(home, /property="og:title"/);
  assert.match(home, /name="twitter:card"/);
  assert.match(robots, /Sitemap:/);
  assert.match(sitemap, /ai-employees\/sales-agent/);
});
