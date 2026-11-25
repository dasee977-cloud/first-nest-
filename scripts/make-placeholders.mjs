// Generates the placeholder SVGs (category icons + one image per product).
// Run with: node scripts/make-placeholders.mjs
// It never overwrites an image you've already replaced unless you pass --force.
import fs from "node:fs";

const INK = "#0B1340", PINK = "#FF6FB1", YELLOW = "#FFE14A", COBALT = "#2337E8", CREAM = "#FFF7E8";
const force = process.argv.includes("--force");
const s = `stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

const icons = {
  "sleep-bedding": `
    <rect x="12" y="22" width="12" height="54" rx="4" fill="${PINK}" ${s}/>
    <rect x="12" y="46" width="74" height="22" rx="6" fill="#fff" ${s}/>
    <rect x="27" y="35" width="22" height="12" rx="6" fill="${YELLOW}" ${s}/>
    <path d="M50 46h36v22H50z" fill="${COBALT}" ${s}/>
    <path d="M18 68v10M80 68v10" ${s} fill="none"/>
    <path d="M60 14h10l-10 10h10M74 6h7l-7 7h7" fill="none" ${s}/>`,
  "study-desk-setup": `
    <circle cx="66" cy="44" r="16" fill="${YELLOW}" opacity=".6"/>
    <rect x="20" y="78" width="44" height="8" rx="4" fill="${PINK}" ${s}/>
    <path d="M42 78 30 48 52 30" fill="none" ${s.replace("stroke-width=\"3\"","stroke-width=\"5\"")}/>
    <circle cx="30" cy="48" r="4" fill="#fff" ${s}/>
    <path d="M48 20l26 8-8 20-26-10z" fill="${COBALT}" ${s}/>`,
  "storage-organisation": `
    <rect x="14" y="52" width="34" height="30" rx="3" fill="${YELLOW}" ${s}/>
    <rect x="50" y="52" width="34" height="30" rx="3" fill="${PINK}" ${s}/>
    <rect x="30" y="18" width="38" height="32" rx="3" fill="#fff" ${s}/>
    <path d="M24 64h14M60 64h14M42 30h14" ${s} fill="none"/>`,
  "kitchen-starter-kit": `
    <path d="M30 22c0-6 6-6 6-12M42 22c0-6 6-6 6-12M54 22c0-6 6-6 6-12" fill="none" ${s}/>
    <ellipse cx="45" cy="54" rx="31" ry="10" fill="${PINK}" ${s}/>
    <path d="M14 54c0 18 14 26 31 26s31-8 31-26" fill="${COBALT}" ${s}/>
    <path d="M76 52h14" ${s.replace("stroke-width=\"3\"","stroke-width=\"7\"")} fill="none"/>`,
  "decor-lighting": `
    <path d="M48 6v8M20 18l6 6M76 18l-6 6M10 46h8M78 46h8" fill="none" ${s}/>
    <path d="M48 22a22 22 0 0 0-13 40c3 2 4 6 4 9h18c0-3 1-7 4-9a22 22 0 0 0-13-40z" fill="${YELLOW}" ${s}/>
    <rect x="38" y="72" width="20" height="8" rx="2" fill="${PINK}" ${s}/>
    <rect x="41" y="80" width="14" height="6" rx="2" fill="#fff" ${s}/>
    <path d="M42 50l6 8 6-8" fill="none" ${s}/>`,
};

const write = (path, content) => {
  if (fs.existsSync(path) && !force) return false;
  fs.writeFileSync(path, content.trim() + "\n");
  return true;
};

for (const [slug, body] of Object.entries(icons)) {
  write(`src/images/icons/${slug}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">${body}</svg>`);
}

const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
function wrap(text, max = 20) {
  const words = text.replace(/\s*\(.*?\)\s*/g, " ").trim().split(/\s+/);
  const lines = [""];
  for (const w of words) {
    const cur = lines[lines.length - 1];
    if ((cur + " " + w).trim().length > max && cur) lines.push(w);
    else lines[lines.length - 1] = (cur + " " + w).trim();
  }
  if (lines.length > 2) { lines.length = 2; lines[1] += "…"; }
  return lines;
}

const bgs = [[CREAM, PINK], ["#FFE9F3", YELLOW], ["#FFF6C9", PINK], ["#E7EBFF", YELLOW]];
const products = JSON.parse(fs.readFileSync("src/_data/products.json", "utf8"));
let made = 0;
products.forEach((p, i) => {
  if (!p.image || !p.image.endsWith(".svg")) return;
  const [bg, blob] = bgs[i % bgs.length];
  const lines = wrap(p.name);
  const text = lines.map((l, j) =>
    `<text x="300" y="${492 + j * 40}" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="700" font-size="32" fill="${INK}">${esc(l)}</text>`).join("");
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600" width="600" height="600" role="img" aria-label="${esc(p.name)} (placeholder image)">
  <rect width="600" height="600" fill="${bg}"/>
  <circle cx="300" cy="250" r="170" fill="${blob}" opacity=".55"/>
  <circle cx="470" cy="110" r="26" fill="${COBALT}" opacity=".18"/>
  <circle cx="110" cy="400" r="16" fill="${COBALT}" opacity=".18"/>
  <g transform="translate(156 106) scale(3)">${icons[p.category] || icons["decor-lighting"]}</g>
  ${text}
  <rect x="209" y="548" width="182" height="34" rx="17" fill="${INK}"/>
  <text x="300" y="571" text-anchor="middle" font-family="DM Sans, Arial, sans-serif" font-weight="700" font-size="14" letter-spacing="1.5" fill="#fff">PLACEHOLDER</text>
</svg>`;
  if (write("src" + p.image, svg)) made++;
});

write("src/images/about-placeholder.svg", `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" width="600" height="750">
  <rect width="600" height="750" fill="${PINK}"/>
  <circle cx="300" cy="300" r="120" fill="${YELLOW}" stroke="${INK}" stroke-width="6"/>
  <path d="M110 750c0-130 85-210 190-210s190 80 190 210" fill="${COBALT}" stroke="${INK}" stroke-width="6"/>
  <circle cx="258" cy="290" r="10" fill="${INK}"/><circle cx="342" cy="290" r="10" fill="${INK}"/>
  <path d="M255 340c25 22 65 22 90 0" fill="none" stroke="${INK}" stroke-width="6" stroke-linecap="round"/>
  <text x="300" y="96" text-anchor="middle" font-family="Unbounded, Arial Black, sans-serif" font-weight="700" font-size="30" fill="${INK}">YOUR PHOTO HERE</text>
</svg>`);

console.log(`Placeholders ready (${made} product images written${force ? ", forced" : ""}).`);
