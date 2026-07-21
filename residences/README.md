# WC — Private Residences · 3D Landing Page

A self-contained, static luxury landing page: a Three.js architectural-wireframe
hero over stark black, and a gated "digital twin" section for embedding Matterport /
Treedis virtual tours without exposing property addresses or client data.

No build step, no framework, no server required. It drops straight into your existing
GitHub Pages deploy.

---

## File structure

```
luxury-3d-landing/
├── index.html            # page markup + import map for Three.js
├── styles.css            # all styling (black / white minimalist system)
├── main.js               # ← the ONLY file you edit to add your tours
├── vendor/
│   └── three.module.js   # Three.js r160, vendored locally (no CDN dependency)
└── assets/               # (optional) drop poster images / logo here
```

---

## 1. Swapping in your own property tours

Open **`main.js`** and edit the `TOURS` array near the top. Nothing else needs to change.

```js
const TOURS = [
  {
    name:     "Residence 01",              // a code name — NEVER a street address
    region:   "Ridge — Henderson",         // a neighbourhood/area, kept vague
    spec:     "5 Bed · 6,200 Sq Ft",       // shown publicly; keep it generic
    provider: "matterport",                // "matterport" | "treedis" | "iframe"
    embed:    "SxQL3iGyoDo",               // see formats below
    locked:   true,                        // true = hidden until access code entered
  },
  // add as many as you like — the grid lays out automatically
];
```

### `embed` value by provider

| provider     | what to put in `embed`                                             | where to find it |
|--------------|-------------------------------------------------------------------|------------------|
| `matterport` | just the **model id** — the `m=` value in the share link          | Matterport → Share → the `...?m=**SxQL3iGyoDo**` part |
| `treedis`    | the **full embed URL** Treedis gives you                          | Treedis → Share / Embed → copy the `src` URL |
| `iframe`     | any **full URL** (Kuula, CloudPano, a YouTube 360, your own host) | that tool's embed/share dialog |

That's it. Reload the page and your tours appear as cards.

---

## 2. How the privacy gate works

- Every card marked `locked: true` shows **"Locked — Private Access"** and reveals **no
  address** — only the code name, region and spec you chose.
- The tour's embed URL is **not written into the page** until a visitor actually opens an
  unlocked tour. So "View Source" on the landing page reveals nothing about which property
  or Matterport model is behind a card.
- Visitors unlock the collection by entering an **access code** in the *Private Access*
  section. Set the valid codes in `main.js`:

  ```js
  const ACCESS_CODES = new Set(["WC-PRIVATE", "PREVIEW"]);
  ```

> **Important — this is presentation-level gating, not security.** Because everything runs
> in the browser, a determined technical visitor could read the codes and tour list out of
> `main.js`. That's fine for "don't broadcast my clients' addresses to the public / to
> search engines," which is the stated goal. If you ever need *true* access control (e.g.
> a tour that must never leak), move the `TOURS` data behind a small authenticated endpoint
> and have `main.js` `fetch()` it only after a code is validated server-side. The UI is
> already structured for that — you'd swap the local `TOURS`/`ACCESS_CODES` for a fetch in
> the access-form handler.

---

## 3. Performance / battery (already handled)

The Three.js hero is tuned so it won't lag or drain battery:

- **Pixel ratio capped** at 1.5 — the single biggest lever on Retina/4K screens.
- **Render loop fully stops** when the tab is hidden *or* the hero scrolls off-screen
  (an `IntersectionObserver` + `visibilitychange` gate the loop). It is not just throttled —
  it stops calling `requestAnimationFrame`, so idle CPU/GPU is ~0.
- **`prefers-reduced-motion`** is honoured: the scene renders a single static frame and never
  animates for users who ask for reduced motion.
- Fewer particles on small screens; `antialias` off (points/lines don't need it); fog culls
  distant geometry so overdraw stays low.
- Graceful fallback: if WebGL is unavailable the hero is simply pure black (still legible).

To make the motion even calmer/faster, in `main.js` you can lower the particle `COUNT`,
reduce `PointsMaterial.size`, or slow the drift multipliers in `frame()`.

---

## 4. Run it locally

ES modules + the import map require HTTP (not opening the file directly):

```bash
cd luxury-3d-landing
python3 -m http.server 8811
# open http://localhost:8811
```

## 5. Deploy

It's fully static. Any of these work with zero config:

- **GitHub Pages** — commit the folder to a repo (or a subfolder of your existing site) and
  enable Pages. Because Three.js is vendored in `vendor/`, there are no external runtime
  dependencies.
- **Netlify / Vercel / Cloudflare Pages** — drag-and-drop the folder, no build command.

---

## Design system (if you want to tweak the look)

All tokens live at the top of `styles.css` under `:root`. It is deliberately restricted to
black, white, and a few white-opacity greys for the strict-minimalist, high-contrast brief.
Type is Helvetica Neue. Change `--font` there to swap in a licensed display face later.
