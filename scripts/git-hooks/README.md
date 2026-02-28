# Git hooks (used via Husky)

These scripts are invoked by [Husky](https://github.com/typicode/husky) from `.husky/`.

| Hook        | Script            | Purpose                                                                 |
|-------------|-------------------|-------------------------------------------------------------------------|
| `pre-commit`| `pre-commit.js`    | Validates branch name (feature/bugfix/update/release/* or main/development). |
| `commit-msg`| `commit-msg.js`    | Enforces conventional commit format (`<type>: <description>`).          |

After `npm install`, the `prepare` script runs `husky` and configures Git to use `.husky/` as the hooks directory. No manual setup needed.

**Branch naming:** `^(feature|bugfix|update|release)/[a-z0-9._-]+$` or `main` / `development`.  
**Commit types:** `feat`, `fix`, `docs`, `style`, `refactor`, `chore`, `test`.

See [CONTRIBUTING.md](../../CONTRIBUTING.md) for full workflow.
