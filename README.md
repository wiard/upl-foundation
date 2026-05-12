# UPL Foundation

A bounded-warrant framework for tracing chip-level execution conditions into AI representations.

**Status:** exploration

## Research question

Which lower-layer execution conditions, propagating through the L2–L3 bridge, can be witnessed, mapped, checked, and ruled out as claim-bearing for an upper-layer AI output boundary?

## Core idea

UPL does not assume that chip signals explain AI semantics.

It asks which lower-layer execution conditions can be observed, mapped, checked, and bounded before any claim is allowed to travel upward.

## Current contents

- `src/` — TypeScript exploration of UPL judgment/adjudication logic
- `docs/` — methodology documents
- `demo_06/` — first bounded Python demo attempt; currently incomplete

## Non-claims

This repository does not claim:
- production AI behaviour is caused by chip-level effects
- fp16 is bad
- the framework is canonical
- any result is validated yet

The work is exploratory and bounded.
