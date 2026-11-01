# LiveMerge

## Live status without the YouTube API

Channel live status is checked by Cloudflare Pages Functions in `functions/api/`:

- `/api/channel?id=UC…` returns the channel name and whether it is live.
- `/api/video?id=…` returns whether a single video is live.
- `/api/resolve?handle=@name` turns an `@handle` into its `UC…` channel ID.

They read public YouTube pages server-side, so no API key, quota or Google login is needed.
Channels can be added by `UC…` ID, `@handle`, or a youtube.com channel URL.

The app re-checks offline channels (and channels whose last check failed) every minute, and verifies live channels
every 5 minutes. A yellow "Check failed" badge on a card means the last check failed and will be retried.

### Tests

```sh
yarn test    # needs Node 22.6+; parser tests for the YouTube page markers in tests/youtube.test.ts
```

If live detection breaks because YouTube changed its markup, add the new page's markers to the fixtures in
`tests/youtube.test.ts` first, then adjust the parsers in `functions/_lib/youtube.ts`.

### Local development

`yarn dev` is enough: a small Vite plugin in `vite.config.ts` runs the functions in `functions/api/` locally.
To test them in the real Cloudflare runtime instead:

```sh
yarn dev                                  # Vite on :5173
npx wrangler pages dev --proxy 5173       # open http://localhost:8788
```

## Cloudflare Pages Deployment

This repository is configured to deploy with GitHub Actions using:
- `wrangler.toml`
- `.github/workflows/cloudflare-pages.yml`

### 1. Create the Cloudflare Pages project

Create a Pages project named `livemerge` in Cloudflare (or rename `CLOUDFLARE_PROJECT_NAME` in the workflow if you use a different name).

### 2. Add GitHub repository secrets

In GitHub repo settings, add:
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Recommended API token permissions:
- `Cloudflare Pages:Edit`
- `Account:Read`

### 3. Deployment behavior

- Manual only: run the `Deploy to Cloudflare Pages` workflow from the GitHub Actions tab.
- The deployment branch is the branch selected when you start the workflow.
