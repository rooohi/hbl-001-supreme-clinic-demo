import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const outputRoot = new URL("../out/", import.meta.url);

async function output(path) {
  return readFile(new URL(path, outputRoot), "utf8");
}

test("exports the complete trust-led homepage", async () => {
  const html = await output("index.html");

  assert.match(html, /AI that works for your business/);
  assert.match(html, /Show Us Your Workflow/);
  assert.match(html, /torvent-logo\.png/);
  assert.doesNotMatch(html, /What does your team repeat every day/);
  assert.doesNotMatch(html, /workflow-playground-hero/);
  assert.doesNotMatch(html, /HOW TORVENT WORKS/);
  assert.doesNotMatch(html, /role-sales\.webp/);
  assert.match(html, /Contact Us/);
  assert.match(html, /ಕನ್ನಡ/);
  assert.match(html, /Sample operating view/);
  assert.match(html, /DESIGNED FOR GLOBAL SCALE/);
  assert.doesNotMatch(html, /WORKFLOW STUDIO/);
  assert.doesNotMatch(html, /WorkflowPrompt/);
  assert.match(html, /TORVENT/);
  assert.doesNotMatch(html, /images\.unsplash\.com/);
  assert.doesNotMatch(html, /hero-intelligence-network-v2\.png/);
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
    "trust/index.html",
    "contact/index.html",
    "privacy/index.html",
    "terms/index.html",
    "cookies/index.html",
  ];

  await Promise.all(routes.map((route) => access(new URL(route, outputRoot))));
  const contact = await output("contact/index.html");
  assert.match(contact, /Show us where the work slows down/);
  assert.match(contact, /Business enquiries are being configured/);
  assert.doesNotMatch(contact, /73532 60596/);
  assert.doesNotMatch(contact, /wa\.me/);

  const about = await output("about/index.html");
  assert.match(about, /Operational AI with responsibility built in/);
  assert.doesNotMatch(about, /Rohit S Kale/);
  assert.doesNotMatch(about, /rohit-s-kale\.jpg/);

  const caseStudies = await output("case-studies/index.html");
  assert.match(caseStudies, /There are no published customer case studies yet/);

  const trust = await output("trust/index.html");
  assert.match(trust, /No certification claims/);

  const agents = await output("ai-agents/index.html");
  assert.match(agents, /DEPLOYMENT BLUEPRINT/);
  assert.match(agents, /Accountable team review/);
  assert.doesNotMatch(agents, /Configured around your process, policies and systems\./);
});

test("exports the device-local CRM and removes the clinic dashboard", async () => {
  const crm = await output("crm/index.html");
  assert.match(crm, /Simple CRM/);
  assert.match(crm, /Device-local by design/);
  await assert.rejects(access(new URL("dashboard/index.html", outputRoot)));
});

test("exports search and social essentials", async () => {
  const [home, robots, sitemap] = await Promise.all([
    output("index.html"),
    output("robots.txt"),
    output("sitemap.xml"),
  ]);

  assert.match(home, /property="og:title"/);
  assert.match(home, /name="twitter:card"/);
  assert.match(home, /application\/ld\+json/);
  assert.match(robots, /Sitemap:/);
  assert.match(robots, /Disallow: \/hbl-001-supreme-clinic-demo\/crm\//);
  assert.match(sitemap, /ai-employees\/sales-agent/);
  assert.match(sitemap, /\/trust/);
  assert.doesNotMatch(sitemap, /\/crm/);
});
