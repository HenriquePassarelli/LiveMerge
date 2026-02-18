# LiveMerge

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
