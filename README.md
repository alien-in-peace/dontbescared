# Don't Be Scared

Static site. No build step, no server required. Every page is plain
HTML/CSS/JS and can be deployed as-is.

Live at: https://dontbescared.dontbescared-website.workers.dev
(free Cloudflare Workers static hosting — no custom domain purchased,
by choice, to keep running cost at £0).

## Local preview

```
python -m http.server 8080
```

then open http://localhost:8080/index.html. (`fetch()` for the debunks
backlog needs an actual HTTP server — opening the file directly with
`file://` will fail to load `data/debunks.json`.)

## Deploying

Currently deployed to Cloudflare Workers static assets (configured via
`wrangler.jsonc`). To redeploy after making changes:

```
npx wrangler deploy
```

`.assetsignore` keeps `.git` and `.wrangler` out of the publicly
served files — don't remove it.

If a custom domain gets bought later (e.g. dontbescared.co.uk), attach
it in the Cloudflare dashboard under this Worker's **Domains &
Routes** — no rebuild needed, and update the `og:url`/`twitter:image`
meta tags and footer text across the pages to match.

## Wiring up the "Ask The Cosmos" form

The form in `ask.html` posts to [Web3Forms](https://web3forms.com):

1. Go to web3forms.com and get a free access key (email verification
   only, no account/dashboard signup required).
2. In `ask.html`, replace `YOUR_WEB3FORMS_ACCESS_KEY` (in the hidden
   `access_key` input) with your real key.
3. Submissions will land in your inbox as email. That's it — no server
   code needed.

The form also has a hidden honeypot field (`botcheck`) for basic spam
protection; leave it alone.

## Publishing a submitted debunk to the backlog

The public backlog on `ask.html` reads from `data/debunks.json` only.
Nothing you haven't explicitly added shows up publicly — that's the
moderation gate:

1. New submissions arrive by email via Web3Forms. They are **not**
   automatically published anywhere.
2. Optionally stage claims you're still researching in
   `data/debunks-pending.json` (a plain array, same shape as below,
   not linked from any page — just a personal holding pen).
3. Once you've written the answer, add an entry to
   `data/debunks.json`:

```json
{
  "id": "d004",
  "tag": "Short category label",
  "question": "The claim, in the submitter's own words or paraphrased.",
  "date": "2026-09-20",
  "submittedBy": "Name or Anonymous",
  "answers": [
    "First paragraph of the answer.",
    "Second paragraph, if needed."
  ]
}
```

4. Redeploy (or just push — most static hosts auto-deploy on push).
   The backlog list on `ask.html` sorts by `date` automatically and
   supports live search out of the box.

## Social preview image

`images/og-image.png` is used for link previews (Open Graph / Twitter
cards) on every page. Regenerate it if you change the splash design —
it should stay 1200×630.
