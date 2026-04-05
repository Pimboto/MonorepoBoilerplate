# Claude Code Action Integration — Design Spec

**Date**: 2026-04-05
**Status**: Approved
**Replaces**: `.github/workflows/code-review.yml`
**Does not touch**: `ci.yml`, `weekly-audit.yml`

---

## Goal

Replace the grep/regex-based code review workflow with `anthropics/claude-code-action@v1`, giving CocoStudio semantic AI-powered PR reviews, automatic fixes, and interactive `@claude` support — all powered by a Claude Max subscription.

---

## Architecture

One workflow file: `.github/workflows/claude.yml` with two jobs.

```
claude.yml
├── claude-review       # Automated — runs on every non-draft PR
└── claude-interactive  # On-demand — responds to @claude mentions
```

### Job 1: `claude-review`

**Trigger**: `pull_request: [opened, synchronize, ready_for_review, reopened]`
**Condition**: `!github.event.pull_request.draft`

**Behavior**:
- Checks out the PR branch with full history (`fetch-depth: 0`) so Claude can push fix commits
- Reads the full PR diff via `gh pr diff`
- Reviews against CocoStudio architectural rules (auto-discovered from `CLAUDE.md` at repo root)
- Posts inline comments on specific lines with issues
- Pushes fix commits directly to the PR branch
- Posts a summary comment with overall findings

**Note**: `use_sticky_comment` is NOT used — it has a [known conflict](https://github.com/anthropics/claude-code-action/issues/955) with inline comments. Each review run posts fresh comments, which is appropriate since each `synchronize` event is a different diff.

**Permissions**:
```yaml
permissions:
  contents: write      # Push fix commits to PR branch
  pull-requests: write # Post PR comments and inline annotations
  issues: write        # Comment on linked issues
  id-token: write      # OIDC exchange with Claude GitHub App
```

**Note on `actions: read`**: Intentionally omitted. The Claude GitHub App [does not yet support `actions: read`](https://github.com/anthropics/claude-code-action/issues/1014). Claude does not need to read CI logs from other workflows — it can run `pnpm check`, `pnpm test`, and `pnpm build` directly on the runner instead.

**Checkout configuration** (required for pushing commits):
```yaml
- uses: actions/checkout@v4
  with:
    ref: ${{ github.event.pull_request.head.ref }}
    fetch-depth: 0
```

**Allowed tools**:
- `mcp__github_inline_comment__create_inline_comment` — inline review annotations on specific PR lines
- `Bash(gh pr comment:*)` — post/update PR comments
- `Bash(gh pr diff:*)` — read PR diff
- `Bash(gh pr view:*)` — read PR metadata
- `Bash(git:*)` — commit and push fixes to PR branch
- `Bash(pnpm check)` — run Biome lint/format
- `Bash(pnpm test:*)` — run Vitest
- `Bash(pnpm build)` — full build verification

**Review prompt** — instructs Claude to enforce:

1. **Clean Architecture compliance**:
   - Use cases must not import from `frameworks/`
   - Core entities must not import NestJS decorators
   - Resolvers must be thin (delegate to use cases, no business logic)
   - Resolvers must have `@UseGuards(AuthGuard)` and `try/catch` with `await`

2. **TypeScript strictness**:
   - No `: any` types
   - No `console.log/error/warn/debug` (except test files and `biome-ignore` lines)
   - Proper `import type` usage

3. **Database discipline**:
   - No `new PrismaClient` — must use `@cocostudio/database`
   - No separate Prisma instances

4. **Frontend rules**:
   - No `localStorage` in `features/` or `lib/`
   - No `gql` template literals in `features/` (queries go in `lib/graphql/`)
   - No hardcoded colors (`text-white`, `bg-[#hex]`) — use theme tokens
   - No colored accents — monochromatic neutral design

5. **Security**:
   - Ownership checks in use cases (`userId` verification)
   - No exposed REST auth endpoints
   - Rate limiting presence

6. **General quality**:
   - SOLID principles
   - No code duplication across apps
   - Proper workspace boundaries
   - File naming conventions per DEVELOPMENT_GUIDE.md

### Job 2: `claude-interactive`

**Trigger**: `issue_comment`, `pull_request_review_comment`, `pull_request_review`, `issues`
**Condition**: Comment/body contains `@claude`

**Behavior**:
- Responds to any request: refactor, add tests, explain code, fix bugs
- Can run `pnpm check`, `pnpm test`, `pnpm build`, `pnpm db:generate`
- Can push commits to the PR branch
- Full read/write access to repository files

**Permissions**: Same as `claude-review`

**Checkout configuration** (full history for pushing commits):
```yaml
- uses: actions/checkout@v4
  with:
    fetch-depth: 0
```

**Allowed tools**:
- `Bash(pnpm:*)` — all pnpm operations (check, test, build, db:generate)
- `Bash(git:*)` — commit and push changes
- `Bash(gh:*)` — GitHub CLI operations
- `mcp__github_inline_comment__create_inline_comment` — inline annotations
- File read/write/edit (default Claude Code tools)

**Disallowed tools** (safety):
- `Bash(rm:*)` — no file deletion via bash
- `Bash(git push --force:*)` — no force pushing
- `Bash(pnpm db:reset:*)` — no database reset

---

## Authentication

### Claude API Auth

**Method**: OAuth token from Claude Max subscription
**Secret**: `CLAUDE_CODE_OAUTH_TOKEN`
**Setup**: Run `claude setup-token` locally, copy the token, add as GitHub repo secret
**Quota**: Uses your Max subscription quota (shared with Claude.ai and Claude Code CLI usage)

### GitHub Auth

**Method**: Install the official [Claude GitHub App](https://github.com/apps/claude) on the repository
**Mechanism**: OIDC — the action gets a short-lived, repo-scoped token automatically
**Requires**: `id-token: write` permission in the workflow
**Comments appear as**: `claude[bot]`

**Safety**: Claude respects branch protection rules. It cannot push to protected branches (like `main`), never force-pushes, and only commits to the PR branch or creates new branches.

---

## CLAUDE.md Auto-Discovery

Claude Code automatically reads `CLAUDE.md` from the repository root at session start. All architectural rules, coding standards, and project context defined there are automatically available to Claude during reviews. The review prompt only needs to specify the review task — not repeat the rules.

---

## What Gets Removed

`.github/workflows/code-review.yml` is deleted entirely. Its grep-based checks are fully subsumed:

| Old grep check | Claude equivalent |
|---|---|
| `console.log/error/warn` detection | Semantic detection + auto-fix |
| `: any` type detection | Full type analysis + suggestion |
| `localStorage` in features/lib | Context-aware detection |
| Use case importing from frameworks | Understands Clean Architecture layers |
| Entity importing NestJS | Understands dependency rule |
| `new PrismaClient` detection | Knows `@cocostudio/database` pattern |

---

## Secrets to Configure

| Secret | How to get | Where to add |
|---|---|---|
| `CLAUDE_CODE_OAUTH_TOKEN` | Run `claude setup-token` in terminal | GitHub repo Settings > Secrets > Actions |

No `ANTHROPIC_API_KEY` needed — OAuth token uses Max subscription quota.

---

## GitHub App Installation

1. Go to https://github.com/apps/claude
2. Click "Install" on the CocoStudio repository
3. Grant requested permissions (contents read/write, PRs, issues)
4. The action uses OIDC to exchange for a short-lived token — no manual token management

---

## Risk & Mitigation

| Risk | Mitigation |
|---|---|
| OAuth token expiration | Monitor for auth failures; regenerate with `claude setup-token` |
| Claude pushes bad code | CI pipeline (`ci.yml`) still runs lint/typecheck/test/build — bad commits fail CI |
| Max quota consumption | Reviews bounded by PR frequency; interactive is on-demand; monitor usage at claude.ai |
| Claude runs destructive commands | Tools are explicitly whitelisted; `rm`, `git push --force`, `db:reset` are disallowed |
| Push to main branch | Branch protection rules prevent direct pushes; Claude respects them |
| Noisy review comments | Prompt is focused on CocoStudio-specific rules; inline comments target specific lines |

---

## Implementation Steps

1. Create `.github/workflows/claude.yml` with both jobs
2. Delete `.github/workflows/code-review.yml`
3. User runs `claude setup-token` and adds `CLAUDE_CODE_OAUTH_TOKEN` to GitHub secrets
4. User installs Claude GitHub App on the repository
5. Ensure branch protection is enabled on `main`
6. Test with a real PR
