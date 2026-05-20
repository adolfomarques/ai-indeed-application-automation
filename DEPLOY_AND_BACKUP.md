# Deploy & Version Backup Guide

## Overview
This document provides a **standardized workflow** for deploying the project to a cloud platform (currently Vercel) and creating reliable version backups. It is written generically so any extension (e.g., new API routes, UI components, scripts) can follow the same process.

---
### 1. Prepare Your Code
1. **Commit locally** – Ensure all changes are committed to the `main` branch.
2. **Run lint & tests** – `npm run lint && npm test` (or your custom test command).
3. **Build locally** – `npm run build` to verify the production build succeeds.

---
### 2. Deploy to Vercel (Production)
| Step | Command | Description |
|------|---------|-------------|
| a | `npx vercel --prod --yes` | Deploys the current HEAD to Vercel production. The `--yes` flag skips interactive prompts. |
| b | `vercel env add <NAME> <value> --prod` | Add any required environment variables (e.g., `GEMINI_API_KEY`). |
| c | `vercel logs <deployment-url> --since 5m` | Verify runtime logs after deployment. |

> **Tip:** Keep the `installCommand` set to `npm ci` (added to `vercel.json`) so Vercel uses the exact lockfile.

---
### 3. Automatic Deploy via GitHub (Recommended)
1. Push to `main` – Vercel will automatically trigger a new deployment.
2. Enable **Preview Deployments** – Every PR creates a preview URL for QA.
3. Protect `main` with branch protection rules to prevent accidental pushes.

---
### 4. Version Backup Strategy
1. **Git Tagging** – After a successful production deploy, create a tag:
   ```bash
   git tag -a v$(date +%Y.%m.%d.%H%M) -m "Deploy $(date)"
   git push origin --tags
   ```
2. **GitHub Release** – Use the tag to draft a GitHub Release (includes changelog). This provides a snapshot of source code.
3. **Artifact Backup** – The built `.next` directory (or `.vercel/output`) can be archived:
   ```bash
   tar -czf release-$(git rev-parse --short HEAD).tar.gz .vercel/output
   ```
   Store the archive in a safe location (e.g., an S3 bucket) if you need to retrieve the exact build artifacts.
4. **Database / External State** – If the extension adds persistent storage, back it up using the provider’s snapshot feature and reference the snapshot ID in the release notes.

---
### 5. Rollback Procedure
1. Identify the previous tag (e.g., `v2026.05.15.1015`).
2. Deploy that tag:
   ```bash
   git checkout tags/<tag>
   npx vercel --prod --yes --force
   ```
3. Verify the rollback URL and monitor logs.

---
### 6. Checklist for New Extensions
- [ ] Code passes lint and unit tests.
- [ ] Build succeeds locally.
- [ ] All new environment variables are added to Vercel.
- [ ] Documentation updated (this file) with any new commands.
- [ ] Tag created after successful deploy.
- [ ] Release drafted on GitHub.

---
### 7. Common Pitfalls
- **Missing `installCommand`** – Vercel defaults to `pnpm`; ensure `npm ci` is set in `vercel.json`.
- **Large files** – Add heavy binaries to `.gitignore` and store them in external storage.
- **Environment variable mismatch** – Deploy will fail if a required variable is not set; double‑check the Vercel dashboard.

---
*This guide is version‑agnostic and can be extended for other hosting providers (Netlify, Render, etc.) by swapping the CLI commands while keeping the overall workflow.*
