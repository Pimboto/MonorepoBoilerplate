# Claude Code Action Integration — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the grep-based code review workflow with `anthropics/claude-code-action@v1` for semantic AI reviews, auto-fixes, and interactive `@claude` support on PRs.

**Architecture:** One workflow file `.github/workflows/claude.yml` with two jobs — `claude-review` (automated on every non-draft PR) and `claude-interactive` (responds to `@claude` mentions). The existing `code-review.yml` is deleted.

**Tech Stack:** GitHub Actions, `anthropics/claude-code-action@v1`, Claude Max OAuth token, Claude GitHub App (OIDC)

**Spec:** `docs/superpowers/specs/2026-04-05-claude-code-action-design.md`

---

## File Structure

| Action | File | Responsibility |
|--------|------|----------------|
| Create | `.github/workflows/claude.yml` | Combined workflow: automated PR review + interactive `@claude` |
| Delete | `.github/workflows/code-review.yml` | Replaced by Claude Code Action |
| Keep | `.github/workflows/ci.yml` | Unchanged — lint, typecheck, test, build |
| Keep | `.github/workflows/weekly-audit.yml` | Unchanged — weekly static analysis |

---

## Task 1: Create the Claude Code Action workflow

**Files:**
- Create: `.github/workflows/claude.yml`

- [ ] **Step 1: Create the workflow file**

Create `.github/workflows/claude.yml` with the complete workflow containing both jobs:

```yaml
name: Claude Code

on:
  # Automated review on every PR
  pull_request:
    types: [opened, synchronize, ready_for_review, reopened]

  # Interactive @claude mentions
  issue_comment:
    types: [created]
  pull_request_review_comment:
    types: [created]
  pull_request_review:
    types: [submitted]
  issues:
    types: [opened, assigned]

jobs:
  # ============================================================
  # Job 1: Automated PR Review
  # Runs on every non-draft PR push. Reviews architecture,
  # posts inline comments, and pushes fix commits.
  # ============================================================
  claude-review:
    if: >
      github.event_name == 'pull_request' &&
      !github.event.pull_request.draft
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
      id-token: write
    steps:
      - name: Checkout PR branch
        uses: actions/checkout@v4
        with:
          ref: ${{ github.event.pull_request.head.ref }}
          fetch-depth: 0

      - name: Run Claude Code Review
        uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          prompt: |
            You are reviewing PR #${{ github.event.pull_request.number }} in the CocoStudio monorepo.

            IMPORTANT: Read CLAUDE.md at the repo root first — it contains all architectural rules.
            Also read docs/DEVELOPMENT_GUIDE.md for file naming conventions and layer rules.

            Review the PR diff and enforce these rules:

            ## Clean Architecture (apps/api)
            - Use cases (src/use-cases/) must NOT import from frameworks/ — dependency rule violation
            - Core entities (src/core/entities/) must NOT import NestJS (@nestjs/*) — must be pure TypeScript
            - Resolvers must be THIN — no business logic, only delegate to use cases
            - Resolvers must have @UseGuards(AuthGuard) on the class (except OTP resolver)
            - Every resolver method must use try/catch with await — catch DomainError and call toGraphQLError()

            ## TypeScript Strictness
            - No `: any` types anywhere (except biome-ignore or // safe: comments)
            - No console.log/error/warn/debug (except test files and biome-ignore lines)
            - Proper `import type` for type-only imports

            ## Database
            - No `new PrismaClient()` — must use `import { prisma } from '@cocostudio/database'`
            - No direct @prisma/client imports in apps

            ## Frontend (apps/web)
            - No localStorage in features/ or lib/ — use GraphQL for state
            - No gql template literals in features/ — queries go in lib/graphql/
            - No hardcoded colors: no text-white, no bg-[#hex] — use theme tokens (text-foreground, bg-content1, etc.)
            - Monochromatic neutral design — no colored accents

            ## Security
            - Use cases must check ownership (userId) before mutating resources
            - No REST endpoints for auth — auth is pure GraphQL

            ## General
            - SOLID principles, no code duplication across apps
            - Workspace boundaries: shared code goes in packages/, not duplicated
            - File naming per DEVELOPMENT_GUIDE.md conventions

            For each issue found:
            1. Post an inline comment on the specific line with the problem and a suggested fix
            2. If the fix is straightforward (type annotation, import correction, missing guard), push a fix commit

            After reviewing, post a summary comment on the PR with:
            - Number of issues found (errors vs warnings)
            - List of fixes applied (if any commits were pushed)
            - Overall assessment

            If the PR looks clean, post a short approval comment.

          claude_args: |
            --allowedTools "mcp__github_inline_comment__create_inline_comment,Bash(gh pr comment:*),Bash(gh pr diff:*),Bash(gh pr view:*),Bash(git:*),Bash(pnpm check),Bash(pnpm test:*),Bash(pnpm build)"

  # ============================================================
  # Job 2: Interactive @claude
  # Responds to @claude mentions in PR comments, issue comments,
  # and PR reviews. Full autonomy to read, write, test, and push.
  # ============================================================
  claude-interactive:
    if: >
      (github.event_name == 'issue_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review_comment' && contains(github.event.comment.body, '@claude')) ||
      (github.event_name == 'pull_request_review' && contains(github.event.review.body, '@claude')) ||
      (github.event_name == 'issues' && (contains(github.event.issue.body, '@claude') || contains(github.event.issue.title, '@claude')))
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      issues: write
      id-token: write
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Run Claude Code
        uses: anthropics/claude-code-action@v1
        with:
          claude_code_oauth_token: ${{ secrets.CLAUDE_CODE_OAUTH_TOKEN }}
          claude_args: |
            --allowedTools "Bash(pnpm:*),Bash(git:*),Bash(gh:*),mcp__github_inline_comment__create_inline_comment"
            --disallowedTools "Bash(rm -rf:*),Bash(git push --force:*),Bash(pnpm db:reset:*)"
```

- [ ] **Step 2: Validate the YAML syntax**

Run:
```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/claude.yml'))" && echo "YAML valid"
```

If python3 is not available:
```bash
npx yaml-lint .github/workflows/claude.yml || echo "Install: npm i -g yaml-lint"
```

Expected: No syntax errors.

- [ ] **Step 3: Commit the new workflow**

```bash
git add .github/workflows/claude.yml
git commit -m "feat: add Claude Code Action workflow for AI-powered PR reviews

Adds .github/workflows/claude.yml with two jobs:
- claude-review: automated review on every non-draft PR
- claude-interactive: responds to @claude mentions in comments

Uses Claude Max OAuth token (CLAUDE_CODE_OAUTH_TOKEN secret).
Requires Claude GitHub App installed on the repository."
```

---

## Task 2: Delete the old code-review workflow

**Files:**
- Delete: `.github/workflows/code-review.yml`

- [ ] **Step 1: Delete the file**

```bash
git rm .github/workflows/code-review.yml
```

- [ ] **Step 2: Commit the deletion**

```bash
git commit -m "chore: remove grep-based code review workflow

Replaced by Claude Code Action (claude.yml) which provides
semantic AI-powered reviews instead of regex pattern matching."
```

---

## Task 3: Verify no references to the old workflow

**Files:**
- Check: all `.md` files and workflow files for references to `code-review.yml`

- [ ] **Step 1: Search for references**

```bash
grep -r "code-review" .github/ docs/ README.md CLAUDE.md --include="*.md" --include="*.yml" --include="*.yaml"
```

Expected: No results (or only the design spec mentioning it historically).

- [ ] **Step 2: If references found, update them**

If any documentation references `code-review.yml`, update it to reference `claude.yml` instead.

- [ ] **Step 3: Commit any doc updates (if needed)**

```bash
git add -A
git commit -m "docs: update references from code-review.yml to claude.yml"
```

Only commit if there were changes in Step 2.

---

## Task 4: Final verification

- [ ] **Step 1: Verify all workflow files are valid**

```bash
ls -la .github/workflows/
```

Expected output should show exactly 3 files:
- `ci.yml` (unchanged)
- `claude.yml` (new)
- `weekly-audit.yml` (unchanged)

- [ ] **Step 2: Verify ci.yml and weekly-audit.yml are unchanged**

```bash
git diff .github/workflows/ci.yml
git diff .github/workflows/weekly-audit.yml
```

Expected: No output (no changes).

- [ ] **Step 3: Verify the new workflow has correct structure**

```bash
grep -c "claude-review:" .github/workflows/claude.yml
grep -c "claude-interactive:" .github/workflows/claude.yml
grep -c "CLAUDE_CODE_OAUTH_TOKEN" .github/workflows/claude.yml
```

Expected: `1`, `1`, `2` (one job definition each, two secret references).

---

## Post-Implementation: Manual Steps (User)

These cannot be automated — the user must do them:

1. **Generate OAuth token**: Run `claude setup-token` in terminal, copy the output
2. **Add GitHub secret**: Go to repo Settings > Secrets and variables > Actions > New repository secret > Name: `CLAUDE_CODE_OAUTH_TOKEN`, Value: the token
3. **Install Claude GitHub App**: Go to https://github.com/apps/claude, install on the CocoStudio repo
4. **Verify branch protection**: Ensure `main` branch has protection rules (require PR, require status checks)
5. **Test**: Create a test PR with a deliberate violation (e.g., `: any` type) and verify Claude catches it
