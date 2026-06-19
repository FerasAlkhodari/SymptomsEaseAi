# Deploying the SymptomsEase AI website to feraswe.com

The site is a **static** site — just HTML/CSS/JS + images in this `website/` folder.
No build step, no server code. Fonts load from Google Fonts (CDN). All paths are
**relative**, so it works at a domain root, a subdomain, or a sub-path.

> **Recommended:** publish it on a **subdomain** — `symptomsease.feraswe.com` —
> so your portfolio at `feraswe.com` stays untouched. (Using the apex `feraswe.com`
> would replace your current site.)

---

## Step 0 — Host the download, then point the button at it (do this first)

The Windows app (`SymptomsEaseAI-Windows.zip`, ~619 MB) is **too big for git/static hosts**
and is intentionally `.gitignore`d. Host it as a **GitHub Release asset** (free, up to 2 GB):

1. Go to your repo → **Releases** → **Draft a new release**.
2. Tag e.g. `v1.0.0`, title "SymptomsEase AI v1.0.0".
3. **Drag `website/SymptomsEaseAI-Windows.zip`** into the "Attach binaries" box. Publish.
4. Copy the asset URL — it looks like:
   `https://github.com/FerasAlkhodari/SymptomsEaseAi/releases/download/v1.0.0/SymptomsEaseAI-Windows.zip`
5. Open **`website/app.js`**, set:
   ```js
   var DOWNLOAD_URL = "https://github.com/FerasAlkhodari/SymptomsEaseAi/releases/download/v1.0.0/SymptomsEaseAI-Windows.zip";
   ```
6. Commit & push that change.

Now the "Download for Windows" button works for everyone.

---

## Step 1 — Pick a host

All four options below give free HTTPS and a custom domain. Pick **one**.
For every git-connected option, set the **publish / root directory to `website`** — the
zip is gitignored so it will **not** be uploaded.

### Option A — Netlify  *(easiest)*
1. netlify.com → **Add new site → Import an existing project** → pick your GitHub repo.
2. Branch: `combined`. **Base directory:** `website`. **Publish directory:** `website`.
   Build command: *(leave empty)*.
3. Deploy. You get `something.netlify.app`. (Custom domain in Step 2.)

### Option B — Cloudflare Pages
1. dash.cloudflare.com → **Workers & Pages → Create → Pages → Connect to Git**.
2. Pick the repo, branch `combined`. Framework preset: **None**.
   Build command: *(empty)*. **Build output directory:** `website`.
3. Deploy → `something.pages.dev`.

### Option C — Vercel
1. vercel.com → **Add New → Project** → import the repo.
2. Framework Preset: **Other**. **Root Directory:** `website`. Build command: *(empty)*.
3. Deploy → `something.vercel.app`.

### Option D — GitHub Pages  *(free, but needs the files at repo root or `/docs`)*
GitHub Pages can only serve from the repo **root** or a **`/docs`** folder, not `/website`.
Two ways:
- **Simplest:** copy the site into `docs/`:
  ```bash
  git mv website docs        # or copy the files
  git commit -m "chore: move site to docs/ for GitHub Pages"
  git push origin combined
  ```
  Then repo **Settings → Pages → Source: Deploy from a branch → branch `combined`, folder `/docs`**.
- **Or** keep `website/` and add a deploy workflow (`.github/workflows/pages.yml`) that
  uploads `website/` — ask if you want that file generated.

---

## Step 2 — Connect `symptomsease.feraswe.com` (DNS)

Add **one** record at your domain registrar / DNS provider for `feraswe.com`, then add the
domain inside the host's dashboard.

| Host | In the host dashboard | DNS record to add for the subdomain |
|---|---|---|
| **Netlify** | Site → Domain management → **Add domain** `symptomsease.feraswe.com` | `CNAME  symptomsease  →  <your-site>.netlify.app` |
| **Cloudflare Pages** | Project → **Custom domains → Set up** | `CNAME  symptomsease  →  <your-project>.pages.dev` |
| **Vercel** | Project → Settings → **Domains → Add** | `CNAME  symptomsease  →  cname.vercel-dns.com` |
| **GitHub Pages** | Settings → Pages → **Custom domain** = `symptomsease.feraswe.com` | `CNAME  symptomsease  →  ferasalkhodari.github.io` |

DNS usually propagates in minutes (up to a few hours). HTTPS certificates are issued
automatically by all four hosts once DNS resolves.

> **Want it on the apex `feraswe.com` instead?** Use the host's apex instructions:
> Netlify/Vercel/Cloudflare give you A/ALIAS records to add; GitHub Pages uses the four
> A records `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
> (+ AAAA). This **replaces** whatever currently serves `feraswe.com`.

### Already self-hosting feraswe.com (cPanel / VPS / Nginx)?
Just upload the **contents of `website/`** (not the zip) to a folder and serve it:
- **cPanel:** File Manager → upload `index.html`, `styles.css`, `app.js`, `content.js`,
  and the `assets/` folder into `public_html/symptomsease/` (or a subdomain doc-root).
- **Nginx/Apache:** point a `server`/`VirtualHost` for `symptomsease.feraswe.com` at that
  folder. No special config needed — it's plain static files. Enable HTTPS (e.g. certbot).

---

## Step 3 — Verify

Open `https://symptomsease.feraswe.com` and check:
- [ ] Page loads with the serif headline and the purple→blue theme.
- [ ] 🌙/☀️ theme toggle and EN/العربية (RTL) toggle work.
- [ ] Screenshots and the logo show.
- [ ] **"Download for Windows"** starts the GitHub Release download (Step 0).
- [ ] Padlock (HTTPS) is green.

---

## Updating the site later

- **Git-connected hosts (A–D):** just `git push origin combined` — it redeploys automatically.
- **Self-hosted:** re-upload the changed files in `website/`.
- **New app version:** upload the new zip to a new GitHub Release and update `DOWNLOAD_URL`
  in `app.js`, then push.

---

## Notes
- Do **not** upload `SymptomsEaseAI-Windows.zip` to the static host (size limits; it's gitignored).
- The site needs internet for the Google Fonts; it still renders with system fonts if the CDN is blocked.
- `?lang=ar` / `?theme=light` query params let you share a pre-set language/theme link.
