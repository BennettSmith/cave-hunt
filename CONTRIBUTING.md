# Contributing

Contributions should be small, deterministic, and independently verifiable.
Read `GAME_SPEC.md`, `ARCHITECTURE.md`, `ROADMAP.md`, and `AGENTS.md` before
changing behavior.

## Workflow

1. Choose one narrowly defined task or roadmap milestone.
2. State acceptance criteria before implementation when they are not already
   explicit.
3. Add or update tests for observable behavior.
4. Make the smallest change that satisfies the criteria.
5. Run formatting, tests, vetting, and the build.
6. Keep documentation synchronized with intentional interface or behavior
   changes.
7. Use a Conventional Commits message when creating a commit.

Use the standard Go toolchain and avoid third-party dependencies unless a task
explicitly approves one. Random behavior must be controllable with an explicit
seed or injected random source. Tests must not depend on wall-clock timing,
network access, global random state, or execution order.

## Commit messages

Every commit message must follow the Conventional Commits format:

```text
<type>[optional scope][!]: <description>
```

Use a concise, imperative description. Common types include `feat`, `fix`,
`docs`, `test`, `refactor`, `build`, and `chore`. Mark breaking changes with
`!` or a `BREAKING CHANGE:` footer. Examples:

```text
feat(game): add deterministic initial placement
fix(cave): reject asymmetric tunnel maps
docs: clarify shooting precedence
```

## Validation

```sh
make fmt
make test
make vet
make build
```

Run the scaffolded executable with:

```sh
make run
```

The repository currently has no selected license. A contribution does not make
the repository open source or grant reuse rights; see `LICENSE.md`.
