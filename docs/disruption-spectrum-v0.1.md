# Disruption Spectrum v0.1

Status: exploration | Canonical: no | Ledger: not active

## Purpose

This document extends signal discovery with a two-axis disruption spectrum:

1. magnitude — how much the output boundary moves when the signal changes
2. frequency — how often the relevant condition occurs inside the declared workload boundary

This is not a UPL core change.

UPL core remains:

```text
Γ ⊢ K @ B ⇐ W : σ
```

The spectrum enriches discovery and effect-bridge methodology.

UPL does not measure magnitude or frequency.
UPL adjudicates claims about magnitude and frequency only when witnesses and checks exist.

## Non-goals

This document does not:
- prove relevance
- prove effect
- measure frequency
- establish semantic correctness
- claim AI safety
- modify UPL core
- create canonical status
- create ledger state

## Core distinction

Relevance asks whether W can bear K.

Effect asks whether a controlled change in S changes output boundary Y.

Disruption asks how much Y moves and how often the condition occurs inside B.

Short form:

Relevance is not effect.
Effect is not frequency.
Frequency is not generality.

## Axis 1 — Magnitude

Magnitude asks:

How far does the output boundary move when the signal changes?

Values:

- marginal: measurable shift, no class or declared label change
- medium: material confidence/ranking/margin change
- large: class, token boundary, or declared output label changes
- catastrophic: NaN, crash, invalid output, semantic-contract failure, or model-level failure

Magnitude requires controlled comparison.

No disruption-magnitude claim without controlled output-boundary comparison.

## Axis 2 — Frequency

Frequency asks:

How often does the relevant condition occur inside the declared workload boundary?

Values:

- rare: fabricated/pathological edge cases inside B
- occasional: specific input subsets or edge regions
- frequent: many ordinary inferences inside B
- systemic: structurally present in nearly every relevant execution inside B

Frequency requires workload boundary or distribution witness.

No disruption-frequency claim without explicit workload boundary.

Frequency is not generality.

## Four priority regions

| Region | Meaning | Discovery priority |
|---|---|---|
| rare + marginal | low-impact edge | catalog, low priority |
| rare + catastrophic | latent tail risk | edge-case fabrication |
| frequent + marginal | systematic noise | calibration / drift analysis |
| frequent + large/catastrophic | dominant mechanism | urgent investigation |

## Relation to bridges

Relevance bridge:
identifies whether a signal may be claim-bearing.

Effect bridge:
measures whether a controlled change in S moves Y.

Frequency witness:
estimates occurrence inside B.

Disruption spectrum:
adds magnitude and frequency characterization to effect-oriented discovery.

## UPL judgment form

Future disruption claims should use:

```text
Γ ⊢ "signal S shifts output boundary Y with magnitude M and frequency F"
  @ B_disruption
  ⇐ (W_baseline ⊕ W_counterfactual ⊕ W_map ⊕ W_contract ⊕ W_effect_check ⊕ W_frequency)
  : σ
```

If W_frequency is missing:
frequency claim remains incomplete.

If W_effect_check is missing:
magnitude claim remains pending_check or incomplete.

If only one trace exists:
effect claim remains incomplete.

If more than one variable changed:
controlled-difference claim is unsupported or incomplete.

## Example candidates

### fp32 → fp16 precision transition

Hypothesis:
precision transition may shift an output boundary near threshold.

Expected spectrum:
magnitude: marginal or medium
frequency: occasional

Status:
hypothesis / incomplete

Forbidden overclaim:
fp16 causes semantic error.

### near-boundary threshold branch

Hypothesis:
threshold comparison branch may be claim-bearing for class-boundary behavior.

Expected spectrum:
magnitude: large if class flips
frequency: rare unless boundary-near inputs are common inside B

Status:
candidate_relevance / pending_check

Forbidden overclaim:
threshold branch affects AI output.

### FPU rounding or subnormal edge case

Hypothesis:
numeric edge behavior may shift logits or class boundaries.

Expected spectrum:
magnitude: medium or large
frequency: rare unless workload distribution shows otherwise

Status:
hypothesis / incomplete

Forbidden overclaim:
rounding behavior causes semantic failure.

### cache-stress condition

Hypothesis:
cache or memory-access perturbation may affect runtime stability or output-boundary stability.

Expected spectrum:
magnitude: marginal unless mapped to output divergence
frequency: frequent or workload-dependent

Status:
hypothesis / incomplete

Forbidden overclaim:
cache behavior explains model semantics.

### memory-access perturbation around weights

Hypothesis:
memory-access patterns around weights may be relevant to model computation traceability.

Expected spectrum:
magnitude: unknown
frequency: workload-dependent

Status:
candidate_relevance / incomplete

Forbidden overclaim:
memory access pattern proves semantic correctness.

## Forbidden overclaims

Do not claim:

- this signal affects AI semantics
- this proves AI safety relevance
- this frequency generalizes beyond B
- catastrophic risk is established
- fp16 causes semantic error
- chip event explains model behavior
- disruption is measured
- effect is checked
- semantic correctness is shown

Correct language:

- this is a disruption hypothesis
- this candidate may feed the effect bridge
- magnitude requires controlled comparison
- frequency requires workload boundary
- status remains incomplete or pending_check until witnessed and checked

## Closing discipline

Relevance is not effect.
Effect is not frequency.
Frequency is not generality.
No semantic claim without relevance bridge.
No effect claim without controlled contrast.
No disruption-magnitude claim without controlled output-boundary comparison.
No disruption-frequency claim without explicit workload boundary.
No claim travels farther than its evidence.
