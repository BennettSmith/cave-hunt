# Cave Hunt Game Specification

This document is the authoritative, implementation-neutral specification for
Cave Hunt. The rules in the **Normative rules** section define required game
behavior. Ideas listed under **Out of scope** are non-normative and are not
requirements for the initial game.

## Normative rules

### World

The cave has twenty numbered rooms. Tunnels are undirected. Each room connects
to exactly three rooms:

| Room | Connected rooms |
| ---: | :-------------- |
|    1 | 2, 5, 8         |
|    2 | 1, 3, 10        |
|    3 | 2, 4, 12        |
|    4 | 3, 5, 14        |
|    5 | 1, 4, 6         |
|    6 | 5, 7, 15        |
|    7 | 6, 8, 17        |
|    8 | 1, 7, 9         |
|    9 | 8, 10, 18       |
|   10 | 2, 9, 11        |
|   11 | 10, 12, 19      |
|   12 | 3, 11, 13       |
|   13 | 12, 14, 20      |
|   14 | 4, 13, 15       |
|   15 | 6, 14, 16       |
|   16 | 15, 17, 20      |
|   17 | 7, 16, 18       |
|   18 | 9, 17, 19       |
|   19 | 11, 18, 20      |
|   20 | 13, 16, 19      |

The topology must satisfy all of these invariants:

- There are exactly twenty rooms.
- Every room has exactly three distinct neighbors.
- No room connects to itself.
- Connections are symmetric: if room A connects to room B, room B connects to
  room A.
- The graph is connected, so every room is reachable from every other room.

### Initial state

The following six occupants are placed in six distinct rooms:

- The player
- One monster
- Two pits
- Two bat colonies

The player begins with five arrows.

Random setup must accept an explicit seed. Given the same implementation,
configuration, and seed, setup must produce the same initial state. States are
not required to remain reproducible across materially different program
versions.

### Turn information

At the beginning of every playable turn, report:

- The player's current room
- The room's three connected rooms
- The number of remaining arrows
- A foul-smell warning if the monster is in an adjacent room
- A draft warning if one or more pits are in adjacent rooms
- A wings warning if one or more bat colonies are in adjacent rooms

Each warning type appears at most once per turn, even when multiple hazards of
that type are adjacent. A warning identifies only the hazard type, not its
exact room.

### Commands

The initial command set is:

- `move ROOM`
- `shoot ROOM [ROOM ...]`
- `help`
- `quit`

Commands and keywords are case-insensitive. Leading and trailing whitespace is
ignored. Any run of internal whitespace is treated as one separator.

Invalid commands do not consume a turn and do not mutate game state. `help`
does not consume a turn. `quit` terminates the game with the `quit` result.

### Movement

A move destination must be directly connected to the player's current room.
After a valid move, resolve the destination immediately:

- **Empty room:** Begin the next turn.
- **Pit:** The player loses with `lost_to_pit`.
- **Bat colony:** Move the player to a uniformly selected random room, then
  resolve that room. Bat relocation can chain.
- **Monster:** Startle the monster. It has a 75% chance to move and a 25% chance
  to stay. When it moves, select uniformly among its three adjacent rooms. If
  the monster finishes in the player's room, the player loses with
  `lost_to_monster`. Otherwise, play continues with the next turn.

Hazard resolution must have a finite implementation safety guard so malformed
test fixtures or pathologically injected randomness cannot create an infinite
bat loop. Reaching the guard is an internal error resulting in
`internal_error`, not a normal game result.

### Shooting

A shot contains between one and five requested room numbers and consumes one
arrow.

The arrow starts in the player's room. For each requested room, in order:

1. If the requested room is adjacent to the arrow's current room, the arrow
   enters it.
2. Otherwise, the arrow enters a uniformly selected room adjacent to its
   current room.
3. If the arrow enters the monster's room, the player wins immediately with
   `won`.
4. If the arrow enters the player's room, the player loses immediately with
   `lost_to_arrow`.
5. Otherwise, resolution continues with the next requested room.

Pits and bat colonies do not affect arrows. An arrow is consumed even if the
requested path contains a step that is not connected to the arrow's current
room; that step is resolved randomly as described above.

If the shot completes without hitting the player or monster:

1. The arrow is consumed.
2. If no arrows remain, the player loses with `lost_no_arrows`.
3. Otherwise, startle the monster using the same 75%-move and 25%-stay behavior
   used during movement into the monster's room.
4. If the monster finishes in the player's room, the player loses with
   `lost_to_monster`.
5. Otherwise, begin the next turn.

### Terminal results

The complete set of terminal results is:

- `won`
- `lost_to_monster`
- `lost_to_pit`
- `lost_to_arrow`
- `lost_no_arrows`
- `quit`
- `internal_error`

A game terminates exactly once. Actions submitted after termination must not
mutate state.

### Rule precedence

Use this precedence whenever outcomes could otherwise appear simultaneous:

- Arrow hits are resolved immediately during each path step.
- A successful monster hit wins even when the shot used the player's final
  arrow.
- A self-hit loses immediately.
- After an ordinary miss, running out of arrows is resolved before monster
  movement.
- Entering a hazard is resolved before a new turn begins.

## Out of scope

The following ideas are explicitly out of scope for the initial game:

- Save/load
- Networked or multiplayer play
- Procedural cave generation
- Combat beyond arrows
- Inventory
- Scoring
- Difficulty modes
- Mouse input
- Localization
- Animation
- Modding
- Alternate maps

These ideas may be proposed for later work, but their mention does not imply a
requirement or pre-authorize implementation.
