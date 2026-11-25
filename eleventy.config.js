import fs from "node:fs";
import markdownIt from "markdown-it";

/*
 * First Nest — Eleventy config
 * ---------------------------------------------------------------
 * You normally never need to touch this file.
 *   • Products  → src/_data/products.json
 *   • Tracking IDs & site settings → src/_data/site.json
 *   • Blog posts → src/blog/*.md
 */

const DATA_DIR = "src/_data";
const readJSON = (f) => JSON.parse(fs.readFileSync(`${DATA_DIR}/${f}`, "utf8"));

// Re-read data at the start of every build so `npm start` picks up edits.
let site, products, categories;
function loadData() {
  site = readJSON("site.json");
  products = readJSON("products.json");
  categories = readJSON("categories.json");
}
loadData();

const AMAZON_HOST = /(^|\.)amazon\.[a-z.]+$/i;
const AMAZON_SHORT = /(^|\.)(amzn\.to|amzn\.eu|a\.co|link\.amazon)$/i;

/** Adds the right tracking ID (from site.json) for whichever Amazon store the link points to. */
export function amazonUrl(link, fallbackName = "") {
  let href = (link || "").trim();
  if (!href) {
    // No link yet → Amazon search for the product name, still tagged.
    href = `https://www.${site.amazon.defaultStore}/s?k=${encodeURIComponent(fallbackName)}`;
  }
  let u;
  try {
    u = new URL(href);
  } catch {
    return href;
  }
  const host = u.hostname.replace(/^www\./, "").toLowerCase();
  if (AMAZON_HOST.test(host)) {
    const tag = site.amazon.trackingIds[host];
    if (tag) u.searchParams.set("tag", tag);
  }
  return u.toString();
}

const escapeHtml = (s = "") =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function money(range) {
  const c = site.currency;
  if (!Array.isArray(range)) return escapeHtml(range);
  const [lo, hi] = range;
  return lo === hi || hi == null ? `${c}${lo}` : `${c}${lo}–${c}${hi}`;
}

function findProduct(id) {
  const p = products.find((x) => x.id === id);
  if (!p) {
    throw new Error(
      `[First Nest] No product with id "${id}" in src/_data/products.json. Check the spelling in your post or template.`
    );
  }
  return p;
}

/** The ONE product card markup used everywhere (homepage, categories, blog embeds). */
function productCard(productOrId, opts = {}) {
  const p = typeof productOrId === "string" ? findProduct(productOrId) : productOrId;
  const cat = categories.find((c) => c.slug === p.category) || { name: p.category, slug: p.category, accent: "pink" };
  const href = escapeHtml(amazonUrl(p.affiliateLink, p.name));
  const score = Number(p.score).toFixed(1);
  const pct = Math.max(0, Math.min(100, (p.score / 5) * 100));
  const rank = opts.rank ? `<span class="card__rank" aria-hidden="true">${String(opts.rank).padStart(2, "0")}</span>` : "";
  const badge = p.badge ? `<span class="card__badge">${escapeHtml(p.badge)}</span>` : "";
  const heading = opts.heading || "h3";
  const alt = escapeHtml(p.imageAlt || p.name);
  const linkAttrs = `href="${href}" target="_blank" rel="sponsored nofollow noopener"`;

  // Single line on purpose: keeps Markdown from treating it as a code block.
  return [
    `<article class="card card--${cat.accent}" id="product-${escapeHtml(p.id)}">`,
    `<a class="card__media" ${linkAttrs} tabindex="-1" aria-hidden="true">`,
    `<img src="${escapeHtml(p.image)}" alt="${alt}" width="600" height="600" loading="lazy" decoding="async">`,
    `</a>`,
    rank,
    badge,
    `<div class="card__body">`,
    `<a class="card__cat" href="/categories/${cat.slug}/">${escapeHtml(cat.name)}</a>`,
    `<${heading} class="card__title">${escapeHtml(p.name)}</${heading}>`,
    `<p class="card__desc">${escapeHtml(p.description)}</p>`,
    `<div class="card__meta">`,
    `<div class="score" role="img" aria-label="First Nest score: ${score} out of 5">`,
    `<span class="score__label">First Nest score</span>`,
    `<span class="score__value"><b>${score}</b>/5</span>`,
    `<span class="score__bar"><span style="width:${pct}%"></span></span>`,
    `</div>`,
    `<div class="price"><span class="price__label">Price range</span><span class="price__value">${money(p.priceRange)}</span></div>`,
    `</div>`,
    `<a class="btn btn--amazon" ${linkAttrs}>View on Amazon <span aria-hidden="true">↗</span></a>`,
    `</div>`,
    `</article>`,
  ].join("");
}

export default function (eleventyConfig) {
  eleventyConfig.on("eleventy.before", loadData);

  // ---------- Static files ----------
  eleventyConfig.addPassthroughCopy({ "src/images": "images" });
  eleventyConfig.addPassthroughCopy({ "src/css": "css" });
  eleventyConfig.addPassthroughCopy({ "src/js": "js" });
  eleventyConfig.addPassthroughCopy({ "src/favicon.svg": "favicon.svg" });
  eleventyConfig.addWatchTarget("src/css/");

  // ---------- Markdown ----------
  eleventyConfig.setLibrary(
    "md",
    markdownIt({ html: true, typographer: true, linkify: true })
  );

  // ---------- Collections ----------
  eleventyConfig.addCollection("posts", (api) =>
    api
      .getFilteredByGlob("src/blog/*.md")
      .filter((p) => !p.data.draft)
      .sort((a, b) => b.date - a.date)
  );

  // ---------- Product shortcodes ----------
  // {% productCard product %}           → one card from a product object (templates)
  // {% product "product-id" %}          → one card embedded in a blog post
  // {% productGrid "id-1", "id-2" %}    → a row of cards embedded in a blog post
  eleventyConfig.addShortcode("productCard", (p, rank) => productCard(p, { rank }));
  eleventyConfig.addShortcode(
    "product",
    (id) => `<div class="product-embed product-embed--single">${productCard(id)}</div>`
  );
  eleventyConfig.addShortcode(
    "productGrid",
    (...ids) => `<div class="product-embed product-grid">${ids.map((id) => productCard(id)).join("")}</div>`
  );

  // ---------- Filters ----------
  eleventyConfig.addFilter("amazonUrl", (p) => amazonUrl(p.affiliateLink, p.name));
  eleventyConfig.addFilter("money", money);
  eleventyConfig.addFilter("inCategory", (list, slug) => list.filter((p) => p.category === slug));
  eleventyConfig.addFilter("flagged", (list, flag) => list.filter((p) => p[flag]));
  eleventyConfig.addFilter("under", (list, limit) =>
    list.filter((p) => (Array.isArray(p.priceRange) ? p.priceRange[1] ?? p.priceRange[0] : 0) < limit)
  );
  eleventyConfig.addFilter("byScore", (list) => [...list].sort((a, b) => b.score - a.score));
  eleventyConfig.addFilter("byPrice", (list) => [...list].sort((a, b) => a.priceRange[0] - b.priceRange[0]));
  eleventyConfig.addFilter("exceptUrl", (list, url) => list.filter((p) => p.url !== url));
  eleventyConfig.addFilter("limit", (list, n) => list.slice(0, n));
  eleventyConfig.addFilter("findCategory", (list, slug) => list.find((c) => c.slug === slug));
  eleventyConfig.addFilter("absoluteUrl", (path) => new URL(path || "/", site.url).toString());
  eleventyConfig.addFilter("readableDate", (d) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" })
  );
  eleventyConfig.addFilter("isoDate", (d) => new Date(d).toISOString());
  eleventyConfig.addFilter("readingTime", (html = "") => {
    const words = String(html).replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    return `${Math.max(1, Math.round(words / 230))} min read`;
  });

  // ---------- Safety net: every Amazon link gets the tag + sponsored rel + new tab ----------
  eleventyConfig.addTransform("amazon-links", function (content) {
    if (!(this.page.outputPath || "").endsWith(".html")) return content;
    return content.replace(/<a\b([^>]*?)href="([^"]+)"([^>]*)>/gi, (tag, pre, href, post) => {
      let host;
      try {
        host = new URL(href.replace(/&amp;/g, "&")).hostname.replace(/^www\./, "");
      } catch {
        return tag;
      }
      if (!AMAZON_HOST.test(host) && !AMAZON_SHORT.test(host)) return tag;
      const attrs = (pre + post).replace(/\s(rel|target)="[^"]*"/gi, "");
      const fixed = escapeHtml(amazonUrl(href.replace(/&amp;/g, "&")));
      return `<a${attrs} href="${fixed}" target="_blank" rel="sponsored nofollow noopener">`;
    });
  });

  // Markdown checklists: "- [ ] item" → styled checklist item
  eleventyConfig.addTransform("checklists", function (content) {
    if (!(this.page.outputPath || "").endsWith(".html")) return content;
    return content.replace(/<li>\[ \]\s*/g, '<li class="check-item">');
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    templateFormats: ["njk", "md", "html"],
  };
}
