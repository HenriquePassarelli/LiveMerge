# Security Policy

## Supported versions

Only the latest version on the `main` branch receives fixes.

## Reporting a vulnerability

Please do not report security problems in a public issue.

Use GitHub's private reporting instead: open the repository's **Security** tab and choose **Report a vulnerability**.
Include what you found, how to reproduce it, and the impact you expect.

You can expect an acknowledgement within a few days. This is a small project maintained in spare time, so fixes may
take longer, but reports are taken seriously and you will be kept updated.

## Scope

In scope:

- The Cloudflare Pages Functions in `functions/api/` (for example input handling, or ways to make them fetch anything
  other than the YouTube pages they are meant to read).
- The web app in `src/` (for example script injection through stream titles or URLs).

Out of scope:

- Vulnerabilities in YouTube, Google, Cloudflare or other third-party services.
- Changes in YouTube's markup that break live detection. Report those as normal bugs.
