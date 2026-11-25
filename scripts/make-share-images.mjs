// Generates placeholder Pinterest/Open Graph PNGs (1000x1500 pins + 1200x630 default).
// Optional helper: needs Playwright (npx playwright install chromium). Replace the PNGs with
// your own Canva designs whenever you like; this script won't overwrite them unless --force.
import fs from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const force = process.argv.includes("--force");
const jobs = [
  { out: "src/images/og-default.png", w: 1200, h: 630, kicker: "Dorm & first-apartment picks", title: "Your first room, <em>sorted.</em>", sub: "Renter-friendly picks for dorms, uni rooms & first apartments", icon: "decor-lighting", layout: "wide" },
  { out: "src/images/blog/dorm-room-essentials-checklist.png", w: 1000, h: 1500, kicker: "The complete", title: "Dorm room <em>essentials</em> checklist", sub: "Bedding · Desk · Storage · Kitchen · Decor", icon: "sleep-bedding", bg: "#2337E8" },
  { out: "src/images/blog/no-drill-storage-ideas-small-rooms.png", w: 1000, h: 1500, kicker: "Renter-friendly", title: "Small room storage. <em>No drill.</em>", sub: "10 ideas that won't cost you your deposit", icon: "storage-organisation", bg: "#FF6FB1" },
  { out: "src/images/blog/cosy-bare-room-under-100.png", w: 1000, h: 1500, kicker: "Budget makeover", title: "Bare room → <em>cosy</em> for under $100", sub: "Full shopping list + price breakdown", icon: "decor-lighting", bg: "#FFE14A" },
];

const browser = await chromium.launch();
for (const j of jobs) {
  if (fs.existsSync(j.out) && !force) continue;
  const icon = fs.readFileSync(`src/images/icons/${j.icon}.svg`, "utf8");
  const dark = (j.bg || "#2337E8") === "#2337E8";
  const page = await browser.newPage({ viewport: { width: j.w, height: j.h } });
  await page.setContent(`<!doctype html><html><head>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@500;700&family=Unbounded:wght@700;900&display=block" rel="stylesheet">
<style>
*{box-sizing:border-box;margin:0}
body{width:${j.w}px;height:${j.h}px;background:${j.bg || "#2337E8"};color:${dark ? "#fff" : "#0B1340"};font-family:'DM Sans',sans-serif;overflow:hidden;position:relative;
 background-image:radial-gradient(${dark ? "rgba(255,255,255,.12)" : "rgba(11,19,64,.12)"} 2px,transparent 2px);background-size:30px 30px}
.wrap{position:absolute;inset:${j.layout === "wide" ? "60px 70px" : "90px 80px"};display:flex;flex-direction:column;${j.layout === "wide" ? "justify-content:center;max-width:720px" : ""}}
.k{align-self:flex-start;font-family:Unbounded;font-weight:700;font-size:${j.layout === "wide" ? 22 : 30}px;text-transform:uppercase;letter-spacing:.08em;background:#0B1340;color:#FFE14A;padding:12px 22px;border-radius:99px;transform:rotate(-3deg)}
h1{font-family:Unbounded;font-weight:900;font-size:${j.layout === "wide" ? 76 : 112}px;line-height:.95;letter-spacing:-.03em;margin:${j.layout === "wide" ? 26 : 48}px 0 28px}
em{font-style:normal;color:${j.bg === "#FFE14A" ? "#2337E8" : j.bg === "#FF6FB1" ? "#fff" : "#FFE14A"}}
p{font-size:${j.layout === "wide" ? 28 : 40}px;font-weight:700;max-width:16em}
.art{position:absolute;${j.layout === "wide" ? "right:70px;top:50%;width:330px;height:330px;margin-top:-165px" : "left:50%;bottom:210px;width:520px;height:520px;margin-left:-260px"};background:#fff;border:6px solid #0B1340;border-radius:50%;box-shadow:14px 14px 0 #0B1340;display:grid;place-items:center;transform:rotate(-6deg)}
.art svg{width:70%;height:70%}
.brand{position:absolute;${j.layout === "wide" ? "right:70px;bottom:44px" : "left:80px;bottom:80px"};font-family:Unbounded;font-weight:900;font-size:34px;background:#FFE14A;color:#0B1340;border:5px solid #0B1340;border-radius:99px;padding:10px 28px;box-shadow:8px 8px 0 #0B1340}
.url{position:absolute;right:80px;bottom:98px;font-weight:700;font-size:26px;display:${j.layout === "wide" ? "none" : "block"}}
</style></head><body>
<div class="wrap"><span class="k">${j.kicker}</span><h1>${j.title}</h1><p>${j.sub}</p></div>
<div class="art">${icon}</div><div class="brand">First Nest</div><div class="url">Read the guide →</div>
</body></html>`, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: j.out });
  await page.close();
  console.log("wrote", j.out);
}
await browser.close();
