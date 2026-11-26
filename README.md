# Shwe Chee Myint Zaw — Portfolio

Plain HTML, CSS and JavaScript. No build step, no dependencies.

## Put it on GitHub Pages
1. Create a repository (for a root URL, name it `<your-username>.github.io`).
2. Upload everything in this folder (keep the folder structure, including the empty `.nojekyll` file).
3. In the repo: **Settings → Pages → Build and deployment → Deploy from a branch**, choose `main` and `/ (root)`, then Save.
4. The site appears at `https://<your-username>.github.io/` (or `/<repo-name>/`) within a minute or two.

All links are relative, so it works from either address.

## Files
- `index.html` — landing page (name, selected work, index, about, contact)
- `projects/*.html` — one page per project
- `assets/css/style.css` — all styles (colours and fonts are at the top in `:root`)
- `assets/js/main.js` — interactions: oversized fit-to-width type, hero reveal lens,
  horizontal scroll galleries, cursor image previews, lightbox
- `assets/img/<project>/` — images as WebP: `name.webp` (large) and `name-sm.webp` (720px)
- `assets/fonts/` — Archivo (variable) and JetBrains Mono, both SIL Open Font License

## Editing
- Text: edit the HTML directly (captions are in each `<figcaption>`).
- To add an image, export it as WebP at two sizes (about 720px and 1600–2400px on the long edge),
  then copy an existing `<figure class="fig">` block and change the file names, width/height and caption.
- Test locally with `python3 -m http.server` in this folder, then open http://localhost:8000.
