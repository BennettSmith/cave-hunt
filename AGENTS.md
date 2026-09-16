# Agent Instructions

Cave Hunt is an exercise repository for small, reviewable agentic-development
tasks. Optimize for correctness, clarity, deterministic behavior, and easy
verification rather than feature velocity.

## Sources of truth

- `GAME_SPEC.md` is authoritative for game behavior.
- `ARCHITECTURE.md` defines the required hexagonal architecture, package
  responsibilities, ports and adapters, and dependency direction.
- `ROADMAP.md` defines milestone boundaries, not permission to implement future
  milestones early.
- The task currently assigned to you limits scope further than the roadmap.

If code and the specification disagree, do not silently preserve the code's
behavior. Report the conflict and make the smallest change appropriate to the
assigned task.

## Working rules

1. Inspect the worktree and relevant documentation before editing.
2. Preserve unrelated and user-authored changes.
3. Keep each change within one narrow milestone with explicit acceptance
   criteria.
4. Do not add third-party dependencies without explicit approval.
5. Inject sources of randomness and use explicit seeds in deterministic tests.
6. Keep game rules out of command parsing and terminal presentation code.
7. Preserve hexagonal boundaries: adapters may depend on the domain core, but
   the domain core must not depend on adapters or infrastructure.
8. Prefer table-driven tests for rule cases and topology invariants.
9. Avoid exported APIs until a concrete caller requires them.
10. Update specifications only when a task explicitly changes the intended
   behavior; do not alter them to make an implementation pass.
11. Do not commit unless the task explicitly requests a commit. When creating a
    commit, its message must follow Conventional Commits using the form
    `<type>[optional scope][!]: <description>`.

## Required checks

Run these commands before declaring a Go change complete:

```sh
make fmt
make test
make vet
make build
```

Also run any narrower test commands relevant to the changed package. Report
commands that could not be run and why.
