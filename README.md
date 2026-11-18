# Nicoleta Leu — Portfolio

Static CV site styled like a design-tool canvas, written in plain language for non-technical readers
(technical details sit behind "Show technical details" toggles).

- `index.html` — content (from the CV)
- `styles.css` — layout, light/dark theme, responsive (side panels hide under 1240px / 900px)
- `script.js` — contents panel that follows the section being read, theme toggle, count-up numbers

When you change `styles.css` or `script.js`, bump the `?v=` number in `index.html` so browsers load the new file.

## Run locally

```
npx serve .
```

## Deploy to Vercel

```
npx vercel        # preview
npx vercel --prod # production
```

Or push to GitHub and import the repo at vercel.com/new (framework preset: **Other**, no build command).
