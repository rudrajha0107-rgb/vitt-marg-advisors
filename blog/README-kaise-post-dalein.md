# Naya article kaise daalein (2 kadam)

## Kadam 1 — article ka folder banao

1. Is `blog` folder ke andar `_template` folder hai. Uske andar `index.html` file hai.
2. Us file ko copy karke apne computer par kholo (Notepad ya VS Code se).
3. Ye cheezein badlo:
   - `ARTICLE TITLE — Vitt-Marg Advisors` → Google mein dikhne wala title (60 letters ke andar)
   - `ONE LINE SUMMARY FOR GOOGLE...` → 1 line ka summary (155 letters ke andar)
   - `ARTICLE HEADING SHOWN ON THE PAGE` → page par dikhne wala bada heading
   - `MONTH YEAR` → jaise `September 2026`
   - `2026-01-01` → publish ki date (`YYYY-MM-DD`)
   - `GST` → tag: GST / Income Tax / ROC / Startups
   - `<meta name="robots" content="noindex, nofollow" />` → ise `<meta name="robots" content="index, follow" />` kar do
   - `https://vittmarg.com/blog/_template/` → `https://vittmarg.com/blog/aapka-slug/` (4 jagah aayega)
   - Neeche `<article class="prose">` ke andar apna content likho

   Content ke tags:
   - `<h2>Heading</h2>` — section ka heading
   - `<p>Paragraph</p>` — normal paragraph
   - `<strong>Bold</strong>` — bold text
   - `<ul><li>Point</li></ul>` — bullet points
   - `<ol><li>Step</li></ol>` — numbered steps
   - `<p class="note">Zaroori baat</p>` — highlight box

4. GitHub par `blog` folder mein jao → **Add file → Create new file** → naam mein likho:
   `aapka-slug/index.html` (jaise `advance-tax-guide/index.html`)
   Slug chhota, English mein aur hyphen ke saath ho: `advance-tax-guide` ✅ , `Advance Tax!` ❌
5. Upar wali file ka poora content paste karke **Commit changes**.

## Kadam 2 — list mein naam jodo

`blog/posts.json` file kholo → pencil (edit) icon dabao → sabse upar naya block jodo:

```json
[
  {
    "slug": "aapka-slug",
    "tag": "GST",
    "date": "October 2026",
    "title": "Article ka heading",
    "summary": "Do line ka summary jo card par dikhega."
  },
  {
    "...purane article yahin rehne do..."
  }
]
```

Dhyan rahe: har block ke beech comma `,` ho, aur aakhri block ke baad comma **na** ho.

Commit karte hi article `vittmarg.com/blog/` par dikhne lagega — sabse naya sabse upar.

## Kadam 3 — Google ko batao

1. `sitemap.xml` (root folder mein) kholo, edit karo aur naya line jodo:
   `<url><loc>https://vittmarg.com/blog/aapka-slug/</loc><lastmod>2026-10-05</lastmod></url>`
2. Search Console → URL Inspection mein naya link daalo → **Request indexing**.
