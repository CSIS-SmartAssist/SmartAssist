# Contributing

## Branch Workflow

All changes must follow this workflow:

```
feature-branch → development → main
```

1. Create a feature/fix branch from `development`
2. Raise a PR to merge into `development`
3. After approval, raise a PR from `development` to `main`

**Branch purposes:**
- `development` — Integration branch for ongoing development
- `main` — Production-ready code

> **Important:** Never raise PRs directly to `main`

---

## Branch Naming

Branch names must follow this pattern: `^(feature|bugfix|update|release)/[a-z0-9._-]+$`

| Type | Prefix | Example |
|------|--------|---------|
| New feature | `feature/` | `feature/add-testimonials-carousel` |
| Bug fix | `bugfix/` | `bugfix/contact-form-validation` |
| Update/Enhancement | `update/` | `update/footer-links` |
| Release | `release/` | `release/v1.2.0` |

---

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) format:

```
<type>: <short description>
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `chore`, `test`

**Examples:**
- `feat: add login page with Google OAuth`
- `fix: chat input focus ring in dark mode`
- `docs: update README setup steps`
- `style: use design tokens for button colors`
- `refactor: extract RAG client to lib`
- `chore: bump prisma to 7.0.1`
- `test: add unit tests for booking conflict check`
