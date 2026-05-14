# UPL Foundation

> A bounded-warrant framework for AI infrastructure assurance.

**Status: exploration.** This is an active research programme, not a finished
product. Vocabulary, claims, and code are work in progress and explicitly
bounded.

**One bounded instance witnessed**: `demo_06` (σ = checked under stated
boundary B). See `demo_06/output/judgment.json` for the executed witness
chain, or tag `demo_06-checked-v1.0`.

---

## What this is

Most discussions about artificial intelligence operate at one of two ends of
the computing stack. Above, AI safety reasons about prompts, outputs,
alignment, and semantic behaviour. Below, chip security reasons about timing
channels, hardware faults, and microarchitectural state. The middle of the
stack — where coordinated execution becomes encoded representation —
receives comparatively little systematic attention.

UPL Foundation introduces a vocabulary for that middle zone.

## The research question

> Which lower-layer execution conditions, propagating through the L2–L3
> bridge, can be witnessed, mapped, checked, and ruled out as claim-bearing
> for an upper-layer AI output boundary?

## The framework in one expression

The Universal Provenance Layer (UPL) adjudicates claims of the form

    Γ ⊢ K @ B ⇐ W : σ

where:

- **Γ** is a set of stated assumptions,
- **K** is the claim,
- **B** is the boundary within which K is asserted,
- **W** is the witness chain offered in support,
- **σ** is the status returned by adjudication.

The status space is finite and explicit: `unsupported`, `observed`,
`witnessed`, `pending_check`, `checked`, `failed`, `disputed`,
`incomplete`, `out_of_boundary`. UPL does not validate truth; it adjudicates
admissibility under bounded conditions.

For layer-effect claims — those that assert a lower-layer execution
condition shifts an upper-layer output — the witness chain has six required
components: input condition, execution, map, contract, effect check, and
ruleout. All six are mandatory. A chain with fewer than six is `incomplete`.

## The L2–L3 bridge

The framework locates the transition from L2 *Operation* (kernels, ops,
computation graphs) to L3 *Representation* (activations, weights, attention,
encoded state) as the structural place where lower-layer chip-level
conditions first become capable of carrying claims about model behaviour.
This is the *bounded-warrant gap*.

The L2.5 Interlayer (UPL Reversible Influence Model, RIM) extends this with
explicit operator structure and bidirectional reversibility. See Figure 2 of
the paper.

Diagrams are in `figures/` and reproduced in the paper.

---

## Repository contents

| Path | What it is |
|---|---|
| `paper/` | The foundational paper v0.3 (LaTeX source, references, compiled PDF) |
| `docs/` | Methodology documents and research notes |
| `src/` | TypeScript exploration: UPL Core (Layer A) and Discovery (Layer B) |
| `demo_06/` | Executed witnessed layer-effect claim (Python; σ = checked) |
| `figures/` | Stand-alone diagrams |
| `LICENSE` | Licence terms |

### Where to start

- **5 minutes**: read the abstract of `paper/paper.pdf`.
- **30 minutes**: read the paper.
- **One hour**: read the paper, then inspect `demo_06/output/judgment.json`
  for one fully executed bounded witness chain.
- **Two hours**: read the paper plus `docs/signal-discovery-v0.1.md`,
  `docs/disruption-spectrum-v0.1.md`, and
  `docs/candidate-readiness-ranking-v0.1.md`.
- **Half a day**: read everything above, then look at `demo_06/` end-to-end
  and try to find the holes.

Holes welcome. The work is more useful when it is challenged than when it is
assumed.

---

## Status of components

- **Paper**: v0.3 draft. Not peer reviewed.
- **Discovery methodology** (`docs/signal-discovery-v0.1.md`): exploration.
- **Disruption Spectrum** (`docs/disruption-spectrum-v0.1.md`): exploration.
- **Candidate Readiness Ranking** (`docs/candidate-readiness-ranking-v0.1.md`):
  exploration.
- **demo_06 design** (`docs/demo_06_design_v0.1.md`): exploration.
- **TypeScript Layer A (UPL Core)**: prototype.
- **TypeScript Layer B (Discovery)**: prototype.
- **`demo_06/`**: **one bounded instance witnessed**. Toy binary linear
  classifier under fp32/fp16 precision contrast, adjudicated with
  σ = checked under stated boundary B. Scenario B,
  `control_flips = 0`, `margin_flips = 1`. Full witness chain in
  `demo_06/output/`. Pinned by tag `demo_06-checked-v1.0`.

This establishes the feasibility of the UPL witness discipline in one
bounded case. It does not establish broader claims about LLMs, production
AI systems, or hardware behaviour generally.

---

## Bounded-warrant discipline

This work is conducted under bounded-warrant discipline:

- No canonical claims. All artefacts carry exploration status.
- No fault, attack, breach, or exploit language. The vocabulary is
  *execution conditions*, *candidate signals*, *layer-effect claims*, and
  *adjudication*.
- Every claim travels with its witness, its boundary, and its assumptions.
- Adjudication outcomes are bounded: `checked`, `failed`, and `incomplete`
  are all valid results.
- A `failed` adjudication is not equivalent to refutation of the claim;
  it means the witness offered did not support the claim within the stated
  boundary. Refutation is its own claim and requires its own witnesses.
- No claim travels farther than its evidence.

The discipline is taken seriously. Contributions, critiques, and challenges
are welcome to the same standard.

---

## What this work is not

- **Not an AI safety framework.** AI safety reasons about model behaviour
  and alignment. UPL reasons about provenance across the stack.
- **Not a chip security framework.** Chip security reasons about
  adversarial control of execution. UPL reasons about whether execution
  conditions can be claim-bearing for upper-layer behaviour.
- **Not a benchmark.** UPL produces adjudication statuses, not scores.
- **Not a claim that chip-level conditions matter for AI semantics in
  general.** UPL provides the vocabulary in which such claims could be
  stated and adjudicated, locally, bounded, witnessed.

UPL is a provenance vocabulary that may inform AI safety and chip security
without belonging to either. Whether the vocabulary is adopted depends on
whether the bounded warrants it demands can in fact be constructed.

---

## Citing

If you reference this work in your own, please cite the paper:

> Vasen, W. (2026). *The L2–L3 Bridge: A Bounded-Warrant Framework for
> Tracing Chip-Level Execution Conditions into AI Representations.*
> Draft v0.3.

For the executed witnessed instance:

> Vasen, W. (2026). *Demo_06: One Bounded Witnessed Instance of a
> Layer-Effect Claim under UPL Discipline.* UPL Foundation.
> https://github.com/wiard/upl-foundation/tree/demo_06-checked-v1.0/demo_06

A formal citation entry will be added if and when the paper is posted to a
preprint server.

---

## Author

Wiard Vasen — independent researcher, IJmuiden, the Netherlands.

Correspondence and serious engagement welcome. Casual demos of fp16
producing wrong outputs are not what this is about; the discipline is the
work.

---

## Licence

See [LICENSE](LICENSE).
