# Architecture

Cave Hunt uses hexagonal architecture (ports and adapters) with a small,
dependency-light package structure. Game rules and topology form the domain
core; external concerns interact with that core through explicit ports and
adapters. The initial bootstrap contains package boundaries only; it does not
implement game rules.

## Hexagonal boundaries

- `internal/game` and `internal/cave` are the domain core. They contain no
  terminal, command-line, persistence, or other infrastructure concerns.
- Inbound ports are application operations exposed by the domain core. The
  command parser and terminal interface are inbound adapters that translate
  external input into calls to those operations.
- Outbound ports needed by the domain, such as a source of randomness, are
  defined at the point where the core consumes them. Concrete adapters are
  supplied from outside the core.
- `cmd/cave-hunt` is the composition root. It creates adapters and connects them
  to ports; it does not contain domain behavior.

Dependencies must point toward the domain core. The core must never import an
adapter merely to satisfy an infrastructure concern.

## Packages

### `internal/cave`

Owns the immutable cave topology and topology validation. It represents rooms
and undirected tunnel connections without knowing about players, hazards,
commands, or terminal output.

### `internal/game`

Owns game state, actions, events, terminal results, and rule transitions. It
uses `internal/cave` for topology. Random choices must be made through an
injected source so tests can be deterministic. This package must not perform
terminal I/O or parse user-entered text.

### `internal/command`

Normalizes and parses command text into typed game actions or non-game control
commands. It reports syntax and validation errors without mutating game state.
It must not implement game rules.

### `internal/terminal`

Owns the interactive input/output loop and renders game information and events
for a text terminal. It coordinates command parsing and game transitions but
does not decide rule outcomes itself. Reader and writer dependencies should be
injectable for tests.

### `cmd/cave-hunt`

Is the composition root for the executable. It wires concrete dependencies,
chooses runtime configuration, and delegates to the terminal package. It should
contain no game rules.

## Dependency direction

Dependencies point inward toward domain behavior, as required by the hexagonal
architecture:

```text
cmd/cave-hunt -> internal/terminal -> internal/command
                              |              |
                              +----------> internal/game -> internal/cave
```

Packages must not import `cmd/cave-hunt`. `internal/cave` is independent of the
other project packages. Cyclic dependencies are not permitted.

## State and transitions

Game state should have one owner. A submitted action produces an explicit state
transition and observable events. Terminal results are represented in domain
state, and termination is idempotent: later actions cannot mutate a completed
game.

Random setup, bat relocation, errant arrow movement, and monster movement use a
single explicitly supplied random source. Tests should use controlled sources
or fixed seeds rather than global randomness. Reproducibility is required only
within the same implementation and configuration, as specified in
`GAME_SPEC.md`.

## Error boundaries

User input errors are expected command errors and do not consume a turn.
Invalid topology, impossible internal state, and exhausted safety guards are
internal errors. Packages should return errors to their caller rather than log
or terminate the process directly.

## Testing strategy

- Test cave invariants independently from game transitions.
- Test every game transition without terminal I/O.
- Test command normalization and parsing with table-driven cases.
- Test terminal behavior with in-memory readers and writers.
- Add end-to-end executable tests only for behavior that package tests cannot
  verify economically.
