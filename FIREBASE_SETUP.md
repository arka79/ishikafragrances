# Firebase setup (free, always on)

The catalogue is stored in Firestore and the site is plain static files.
Nothing needs a server that can sleep: Firebase's free Spark plan stays
available, and the site can be hosted on any free static host.

Order matters: create the owner account **before** you make the project
public, so nobody else can register your admin email first.

## 1. Create the project

1. <https://console.firebase.google.com> → **Add project** (Spark plan, no card).
2. **Build → Firestore Database → Create database** → production mode → pick a region.
3. **Project settings → Your apps → Web (`</>`)** → register the site → copy the
   `firebaseConfig` values into `.env` (see step 5).

## 2. Create the owner account

1. **Authentication → Get started → Sign-in method → Email/Password → Enable.**
2. **Authentication → Users → Add user**, with your email and a long unique password.
3. **Authentication → Settings → User actions** → untick **Enable create (sign-up)**
   if you want no other accounts to exist at all. The rules already refuse
   non-owner accounts, so this is a second lock, not the only one.

## 3. Mark the owner email

1. **Firestore → Start collection**, collection ID `site`, document ID `config`.
2. Add field `adminEmail` (type string) = the email from step 2. Save. Type it
   exactly as the Auth user records it (lowercase) — the rules compare it as a
   case-sensitive string.
3. Do not add other fields and do not create client access to this document:
   `firestore.rules` keeps it closed while still reading it for the owner check.

## 4. Publish the security rules

Either paste `firebase/firestore.rules` into **Firestore → Rules → Publish**,
or run:

```bash
npx firebase-tools deploy --only firestore:rules --project YOUR_PROJECT_ID
```

These rules are the actual protection: the public can read the price list,
only the `adminEmail` account can write it. The admin UI's login screen is
just a convenience on top.

## 5. Configure the site

```bash
cp .env.example .env
```

Paste the web app config values, then restart `npm run dev`.

## 6. First publish

Open <http://localhost:5173/admin>, sign in with the owner account, review the
starter catalogue and press **Publish changes**. From then on every published
change is live for all visitors.

## Deploying

`npm run build` produces a static `dist/` folder. Upload it to any static host
(Netlify, Vercel, GitHub Pages, Cloudflare Pages). No server, no database
running cost, and the free Firestore quota (50k reads / 20k writes per day)
is far above a catalogue site's traffic.

`public/_redirects` makes `/admin` load the admin page on Netlify and
Cloudflare Pages. On hosts without redirect support (for example GitHub
Pages), use `/admin.html` directly, or add the host's own rewrite.

Only the admin chunk loads Firebase; the public page reads one Firestore
document over HTTPS, so visitors download no SDK.

### Vercel

1. Import the GitHub repo as a Vercel project. Framework preset **Vite**,
   build `npm run build`, output `dist` (already set in `vercel.json`).
2. **Settings → Environment Variables** — add all six `VITE_FIREBASE_*`
   values for Production (and Preview if you use preview deploys). `.env` is
   gitignored on purpose, so the build has no config without these.
3. Deploy. `vercel.json` maps `/admin` to `admin.html`, sets a strict CSP and
   security headers, and caches hashed assets.
4. Optional hardening: in Google Cloud → **APIs & Services → Credentials**,
   restrict the browser API key to your Vercel domain (and
   `http://localhost:5173/*` for local dev). Restricting the key does not
   replace the Firestore rules — it only limits quota abuse.
