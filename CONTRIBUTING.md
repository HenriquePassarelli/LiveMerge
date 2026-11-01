# Contributing to LiveMerge

Thanks for helping out. This guide covers how to set the project up, what to check before opening a pull request, and
how to fix the most likely thing to break: live detection.

## Setup

Requires Node 22.6 or newer and Yarn.

```sh
yarn install
yarn dev
```

Before opening a pull request, run all three and make sure they pass:

```sh
yarn lint
yarn test
yarn build     # includes the TypeScript typecheck
```

CI runs the same checks on every pull request.

## Code style

- TypeScript, React function components and hooks. Formatting is handled by Prettier (`yarn format`).
- Keep state that must survive a reload in `useStorage` with a key from `STORAGE_KEYS` in `src/livemerge/constants.ts`.
- Do not reorder the DOM nodes of stream cards. Moving an iframe reloads the video, so the grid keeps a fixed DOM order
  and positions cards with CSS `order`.
- Keep the project free of API keys and sign-in. Live status comes from the functions in `functions/api/`.

## When live detection breaks

Live status is read from YouTube's public pages, so it can break when YouTube changes its markup. Typical symptom: a
channel that is live shows "Not Broadcasting".

1. Open `/api/channel?id=<channel id>&debug=1` while the channel is live. It shows the page length, canonical link,
   whether player data is present, and what the parser decided.
2. Find which marker in the real page now signals "live" (see `isLiveNow` in `functions/_lib/youtube.ts` for the ones
   in use today).
3. Add a small fixture with that marker to `tests/youtube.test.ts` first, so the test fails.
4. Fix the parser in `functions/_lib/youtube.ts` until the test passes.

Please keep fixtures small and synthetic. Do not commit saved copies of full YouTube pages.

## Pull requests

- Keep each pull request focused on one change.
- Describe what changed and why, and how you tested it. Screenshots help for UI changes.
- Add or update tests when you change the parsers in `functions/_lib/` or the sorting in `src/livemerge/utils/`.
- Update the README when behavior or setup changes.

## Reporting bugs and ideas

Use the issue templates. For security problems, do not open a public issue; follow [SECURITY.md](SECURITY.md).

## Conduct

By taking part you agree to follow the [Code of Conduct](CODE_OF_CONDUCT.md).
