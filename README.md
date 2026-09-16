# Cave Hunt

**Status:** bootstrap/scaffolding only. Game rules are specified but not yet
implemented.

Cave Hunt is a terminal game in which a player explores a twenty-room cave,
avoids pits and bat colonies, and tries to shoot a hidden monster. This
repository is also a test bed for agentic-development exercises, emphasizing
narrow milestones, deterministic behavior, and independently verifiable
acceptance criteria. The project is built using hexagonal architecture (ports
and adapters), with game behavior isolated in the domain core.

Project documentation:

- [Game specification](GAME_SPEC.md)
- [Architecture](ARCHITECTURE.md)
- [Roadmap](ROADMAP.md)
- [Contributing](CONTRIBUTING.md)
- [Agent instructions](AGENTS.md)

## Prerequisites

- Go 1.26 or a compatible newer toolchain
- `make`

## Commands

```sh
make fmt    # format Go packages
make test   # run tests
make vet    # run static checks
make build  # compile all packages and commands
make run    # run the scaffolded executable
```

`GAME_SPEC.md` is authoritative whenever intended implementation behavior is
unclear.
