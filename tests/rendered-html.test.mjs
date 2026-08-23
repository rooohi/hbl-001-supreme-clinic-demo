import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../out/", import.meta.url);

async function output(path) {
  return readFile(new URL(path, outputRoot), "utf8");
}

test("exports the complete trust-led homepage", async () => {
  const html = await output("index.html");

  assert.match(html, /AI that carries/);
  assert.match(html, /Plan a focused pilot/);
  assert.match(html, /THE OPERATING LAYER/);
  assert.match(html, /ಕನ್ನಡ/);
  assert.match(html, /Workflow performance/);
  assert.match(html, /GROWTH VISION/);
  assert.match(html, /AI Automation Hubballi/);
  assert.doesNotMatch(html, /images\.unsplash\.com/);
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

  const agents = await output("ai-agents/index.html");
  assert.match(agents, /DEPLOYMENT BLUEPRINT/);
  assert.match(agents, /Human control plane/);
  assert.doesNotMatch(agents, /Configured around your process, policies and systems\./);
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
