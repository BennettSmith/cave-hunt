# Roadmap

Each milestone is intentionally narrow. A later milestone is not part of an
earlier milestone's acceptance criteria, and work should not implement later
features speculatively.

## Milestone 0: Repository bootstrap

Scope: documentation, package boundaries, and a compilable executable with no
gameplay.

Acceptance criteria:

- The documented repository structure exists.
- `go test ./...`, `go vet ./...`, and `go build ./...` succeed.
- Running `go run ./cmd/cave-hunt` reports that gameplay is not implemented.
- No third-party Go dependencies are present.

## Milestone 1: Cave topology

Scope: represent the fixed cave and validate all topology invariants.

Acceptance criteria:

- The room connections exactly match `GAME_SPEC.md`.
- Automated tests independently verify room count, degree, uniqueness,
  self-connection absence, symmetry, and connectivity.
- The topology cannot be mutated through the package's public API.

## Milestone 2: Initial game state

Scope: place occupants and initialize arrows using an explicit seed.

Acceptance criteria:

- All six occupants are in distinct valid rooms.
- The player starts with five arrows.
- The same implementation, configuration, and seed reproduce the same state.
- Tests cover many seeds without relying on a particular unspecified random
  algorithm.

## Milestone 3: Commands and turn information

Scope: parse the initial command set and report observable turn information.

Acceptance criteria:

- Whitespace and case behavior match `GAME_SPEC.md`.
- Invalid commands and `help` do not mutate state or consume a turn.
- Warnings identify adjacent hazard types at most once and never reveal rooms.

## Milestone 4: Movement and hazards

Scope: implement movement, pits, bats, and movement-triggered monster behavior.

Acceptance criteria:

- Non-adjacent moves are rejected without state mutation.
- Every destination outcome follows the specified precedence.
- Bat chains are deterministic under controlled randomness and have a tested
  finite safety guard.
- Monster movement probabilities are expressed without biased selection.

## Milestone 5: Shooting

Scope: implement arrow paths, hits, misses, arrow depletion, and subsequent
monster movement.

Acceptance criteria:

- Shots accept one through five requested rooms and consume one arrow.
- Connected and random fallback steps follow `GAME_SPEC.md`.
- Tests cover monster hits, self-hits, final-arrow wins, final-arrow misses, and
  post-miss monster movement.
- Pits and bats do not affect arrows.

## Milestone 6: Terminal integration

Scope: connect all implemented rules in the interactive executable.

Acceptance criteria:

- The terminal loop supports `move`, `shoot`, `help`, and `quit`.
- Each playable turn reports all required information.
- Every terminal result is rendered and the game terminates exactly once.
- Scripted input/output tests cover a complete win, loss, and quit session.

## Future proposals

Ideas listed as out of scope in `GAME_SPEC.md` require a separate proposal and
must not influence the initial architecture without a demonstrated need.
