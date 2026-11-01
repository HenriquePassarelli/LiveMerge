# LiveMerge

Watch multiple YouTube live streams together in one clean wall, with live chat and a setup that persists in your browser.

> **Not affiliated with YouTube or Google.** LiveMerge is an independent project. YouTube is a trademark of Google LLC.
> See [Disclaimer](#disclaimer) before deploying your own copy.

## Features

- A responsive grid of YouTube players (1, 2 or 3 columns), with a focus mode for one stream (press `Esc` to leave it).
- Add single streams by URL, or whole channels by `UC…` ID, `@handle` or channel URL.
- Channels are checked for live status automatically. When a channel goes live its stream starts muted and jumps
  close to the live edge. Offline channels sink to the bottom of the grid and return to their place when live again.
- A floating, draggable live chat panel.
- Sort A–Z or with a custom order. Changing the sort never reloads the videos.
- No account, no API key and no Google login. Everything is saved in your browser's local storage.

## Getting started

Requires Node 22.6 or newer (the tests run TypeScript directly) and [Yarn](https://yarnpkg.com).

```sh
yarn install
yarn dev        # http://localhost:5173
```

| Script         | What it does                                          |
| -------------- | ----------------------------------------------------- |
| `yarn dev`     | Vite dev server, including the `/api` functions       |
| `yarn build`   | Typecheck and production build into `dist/`           |
| `yarn lint`    | ESLint                                                |
| `yarn test`    | Parser and sort tests (`tests/`)                      |
| `yarn format`  | Prettier                                              |
| `yarn preview` | Serve the production build                            |

## How live detection works (no YouTube API)

Live status is checked by Cloudflare Pages Functions in `functions/api/`:

- `/api/channel?id=UC…` returns the channel name and whether it is live.
- `/api/video?id=…` returns whether a single video is live.
- `/api/resolve?handle=@name` turns an `@handle` into its `UC…` channel ID.

They read public YouTube pages server-side, because browsers cannot fetch those pages directly (no CORS headers).
Answers are cached for about a minute so many viewers share one request to YouTube.

The app re-checks offline channels (and channels whose last check failed) every minute, and verifies live channels
every 5 minutes. A yellow "Check failed" badge on a card means the last check failed and will be retried.

Because this depends on YouTube's page markup, it can break when YouTube changes it. If live detection stops working,
see [CONTRIBUTING.md](CONTRIBUTING.md#when-live-detection-breaks).

### Local development with the Cloudflare runtime

`yarn dev` is enough: a small Vite plugin in `vite.config.ts` runs the functions in `functions/api/` locally.
To test them in the real Cloudflare runtime instead:

```sh
yarn dev                                  # Vite on :5173
npx wrangler pages dev --proxy 5173       # open http://localhost:8788
```

## Project structure

```
functions/        Cloudflare Pages Functions (live-status API) and their shared parsers
src/livemerge/    App code: components, hooks, services, utils
src/App.tsx       Page composition and state wiring
tests/            Node test runner tests for the parsers and sorting
public/           Static files, including the privacy page
```

## Cloudflare Pages deployment

This repository is configured to deploy with GitHub Actions using:

- `wrangler.toml`
- `.github/workflows/cloudflare-pages.yml`

### 1. Create the Cloudflare Pages project

Create a Pages project named `livemerge` in Cloudflare (or rename `CLOUDFLARE_PROJECT_NAME` in the workflow if you use
a different name).

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
- If the Pages project's production branch differs from the one you deploy, the result is a preview deployment, not
  your live site.

## Disclaimer

LiveMerge embeds YouTube's own players and chat, and its server functions read publicly available YouTube pages to find
out whether a channel is live. Automated access to YouTube may go against the
[YouTube Terms of Service](https://www.youtube.com/t/terms). The project is provided for personal and educational use,
and you are responsible for how you use or deploy it. If you want an officially supported route, the YouTube Data API
works with an API key and no login, at the cost of quota limits.

## Contributing

Contributions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) and the
[Code of Conduct](CODE_OF_CONDUCT.md). To report a security problem, see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE) © 2026 Henrique Passarelli
