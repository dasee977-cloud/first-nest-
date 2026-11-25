# First Nest

Amazon affiliate site for dorm rooms and first apartments. It is built with [Eleventy](https://www.11ty.dev/), a static site generator: you write plain data and Markdown files, and it builds fast plain HTML.

## Quick start

```bash
npm install
npm start          # local preview at http://localhost:8080 (reloads when you save)
npm run build      # builds the finished site into _site/
```

## Where things live

| What | File |
| --- | --- |
| **Amazon tracking IDs**, site URL, currency, budget limit | `src/_data/site.json` |
| **All products** | `src/_data/products.json` |
| Categories (names, SEO titles, intros) | `src/_data/categories.json` |
| Navigation links | `src/_data/nav.json` |
| **Blog posts** (Markdown) | `src/blog/*.md` |
| Product images | `src/images/products/` |
| Blog/Pinterest images | `src/images/blog/` |
| Default share image | `src/images/og-default.png` |
| Styles | `src/css/style.css` |
| About page | `src/about.njk` |

## Amazon tracking IDs

In `src/_data/site.json`:

```json
"amazon": {
  "defaultStore": "amazon.com",
  "trackingIds": {
    "amazon.com": "yourtag-20",
    "amazon.co.uk": "yourtag-21"
  }
}
```

Every Amazon link on the site gets the matching tracking ID added automatically, based on the store it points to. This includes links inside blog posts. If you change the ID here, every link updates. Each link also gets `rel="sponsored nofollow noopener"` and `target="_blank"`.

## Add a new product

1. Add the image to `src/images/products/`. Square works best, e.g. 800×800 `.jpg` or `.webp`.
2. Open `src/_data/products.json` and copy an existing `{ … }` block. Paste it after a comma and edit it:

```json
{
  "id": "bed-risers",
  "name": "Heavy-Duty Bed Risers (Set of 4)",
  "description": "Adds 6 inches of under-bed storage in seconds.",
  "score": 4.5,
  "priceRange": [15, 22],
  "category": "storage-organisation",
  "image": "/images/products/bed-risers.jpg",
  "affiliateLink": "https://www.amazon.com/dp/B0XXXXXXX",
  "badge": "No drill",
  "featured": false,
  "topPick": false,
  "bestSeller": false
}
```

- `id`: a unique lowercase slug. Blog posts use it to embed the card.
- `score`: your First Nest score out of 5.
- `priceRange`: `[low, high]`. A product shows on **Budget Picks** automatically when the high price is under `budgetLimit` in `site.json`.
- `category`: one of `sleep-bedding`, `study-desk-setup`, `storage-organisation`, `kitchen-starter-kit`, `decor-lighting`.
- `affiliateLink`: paste the plain Amazon product URL or your SiteStripe link. The tag is added for you. While it's left `""`, the button links to an Amazon search for the product name, still tagged.
- `badge`: optional sticker text. Use `""` for none.
- `featured`: shows the product in the homepage "Featured right now" row.
- `topPick`: shows it in "Top picks this month". Keep 6 of these.
- `bestSeller`: shows it on the Best Sellers page.

That's it. The card appears on its category page and anywhere else its flags put it.

To replace a placeholder image, drop your photo in `src/images/products/` and change that product's `"image"` path. You can also overwrite the `.svg` file, keeping the same name.

## Add a new blog post

1. Make a Pinterest image, ideally **1000×1500 (2:3)**, and save it to `src/images/blog/`.
2. Create `src/blog/your-post-slug.md`. The file name becomes the URL: `/blog/your-post-slug/`.

```markdown
---
title: "10 Desk Setup Ideas for Tiny Dorm Rooms"
metaTitle: "Small Dorm Desk Setup Ideas (Student-Tested) | First Nest"
description: "Meta description for Google, about 150 characters, keyword-rich."
pinDescription: "Longer, punchy text for Pinterest with a few #hashtags."
date: 2026-12-01
category: Study
image: /images/blog/desk-setup-ideas.png
imageAlt: "Describe the image"
shopThePost:
  - clip-desk-lamp
  - laptop-stand
---

Your intro paragraph…

## A heading

Embed one product card:

{% product "clip-desk-lamp" %}

Embed a row of cards:

{% productGrid "laptop-stand", "desk-organiser", "seat-cushion" %}

Checklists work too:

- [ ] Desk lamp
- [ ] Power strip
```

- `metaTitle`, `pinDescription` and `shopThePost` are optional.
- `title` is used as the Pinterest/Facebook share title. `metaTitle` is the Google `<title>`.
- Add `draft: true` to hide a post until it's ready.
- If you mistype a product id, the build stops and tells you which one.

The post appears on `/blog/`, in the homepage blog section, in "Keep reading" on other posts, and in `sitemap.xml`.

## Deploy free on Netlify

**Option A: GitHub (recommended, auto-deploys every time you push)**

1. Put this folder in a GitHub repository. `node_modules/` and `_site/` are already git-ignored.
2. On netlify.com, go to **Add new site → Import an existing project → GitHub** and pick the repo.
3. Netlify reads `netlify.toml`: build command `npm run build`, publish directory `_site`. Click **Deploy**.
4. Under **Site configuration → Change site name**, pick e.g. `firstnest`. Then put the final URL in `"url"` in `src/_data/site.json`, commit and push. Open Graph images, canonical links and the sitemap need it.
5. Optional: add a custom domain under **Domain management**. Update `"url"` again if you do.

**Option B: drag and drop (no Git)**

1. Run `npm run build`.
2. Go to app.netlify.com/drop and drag the `_site` folder onto the page.

You'll need to rebuild and re-drag after every change.

## After launch

- Submit `https://YOUR-SITE/sitemap.xml` in Google Search Console.
- **Pinterest:** claim your website in Pinterest settings. Put the `p:domain_verify` code in `pinterestDomainVerify` in `site.json` and redeploy. Pages already carry Open Graph article tags for rich pins.
- Fill in your social links in `site.json`.
- Edit the About page bio in `src/about.njk` and replace `src/images/about-placeholder.svg`.

## Placeholder image scripts (optional)

- `node scripts/make-placeholders.mjs` creates placeholder SVGs for any new product whose image path ends in `.svg` and doesn't exist yet.
- `node scripts/make-share-images.mjs` regenerates the starter Pinterest PNGs. It needs Playwright, and most people will use Canva instead.
