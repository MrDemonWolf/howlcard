# AGENTS.md

## Deploy rule

**Never deploy from a laptop.** Production changes reach Cloudflare only through the GitHub Actions deploy workflow, on `main`, after the `CI / Verify` check has passed on the pull request and on the merge. `main` requires a pull request and that check, and the `production` environment accepts deployments from `main` only. The deploy script exits unless `GITHUB_ACTIONS=true` and `GITHUB_REF=refs/heads/main`. Do not run `wrangler deploy` or any other production write by hand, and never weaken these guards to ship a change — open a pull request.
