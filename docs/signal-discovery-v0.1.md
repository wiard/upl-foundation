# UPL Foundation — Signal Discovery Candidates v0.1

Status: exploration  
Canonical: no  
Ledger: not active  
Purpose: identify which chip-level data to **choose** or **generate** so later claims about AI-output semantics or effect can be adjudicated by UPL.

## UPL intake

K: Build a first signal-discovery table for chip-level data that may become claim-bearing for bounded AI semantic-output or effect claims.  
B: Exploration methodology only; toy workload / toy precision-boundary direction; no real RPK trace, PPK proof, semantic check, or canonical ledger event.  
W: Design rationale from the current UPL/RPK/PPK discussion; no execution witness yet.  
σ: incomplete / design_candidate  
Gap: Human probe selection, trace capture, trace-to-model mapping witness, semantic-output contract, and check artifacts are still missing.

## Core distinction

Discovery is not adjudication.

Discovery asks:

> What should we observe or generate?

UPL adjudication asks:

> What may we claim from what was witnessed?

The current table does **not** claim semantic relevance or causal effect. It proposes candidate signals and controlled contrasts that may later feed the relevance bridge or effect bridge.

## Hard rules

- Observation is not claim.
- Trace is not truth.
- Relevance is not effect.
- No semantic claim without a relevance bridge.
- No effect claim without controlled contrast.
- No claim travels farther than its evidence.

## Claim levels

| Level | Question | Required bridge | Possible status before check |
|---|---|---|---|
| Descriptive execution | What happened in the trace? | trace capture | witnessed / incomplete |
| Relevance | Does this trace feature bear the semantic-output claim? | `S_trace → V_model → Y_output → L_contract → K_sem` | candidate_relevance / pending_check |
| Effect | Does a controlled change alter the output boundary? | baseline + counterfactual + mapping + contract + effect check | incomplete / pending_check |

## Discovery strategies

| Strategy | Mode | Meaning |
|---|---|---|
| A — Architecture-driven selection | choosing | Use model/workload knowledge to select candidate chip signals. |
| B — Differential narrowing | choosing | Compare traces from nearby workload/input variants and collect differing events as candidates. |
| C — Domain-convention instrumentation | choosing | Use existing hardware counters/flags that are plausibly AI-relevant. |
| D — Controlled perturbation | generating | Change exactly one declared variable and compare baseline vs counterfactual. |
| E — Edge-case fabrication | generating | Create inputs near decision/precision/memory boundaries to increase signal visibility. |
| F — Synthetic toy workload | generating | Use a small AI-like probe to shorten the trace-to-output chain. |

---

# A. Choosing signals for the relevance bridge

These signals are selected from execution behavior that may already exist in the run.  
Current status for all rows: `candidate_relevance` unless a later mapping/check changes it.

| ID | Candidate signal `S_trace` | Strategy | How to observe | Intended model link `V_model` | Intended semantic target | Why it may matter | Required witnesses | Current status | Forbidden overclaim |
|---|---|---|---|---|---|---|---|---|---|
| C01 | Register holding `logit` | A | register trace / replay | `logit` | output boundary `logit > 0` | logit is closest model variable to class boundary | `W_trace`, `W_map`, `W_contract`, `W_check` | candidate_relevance | “register value proves classification correctness” |
| C02 | Threshold comparison branch | A | instruction + branch trace | comparison `logit > 0` | class decision boundary | branch may encode the transition from numeric output to class | `W_trace`, `W_map`, `W_contract`, `W_check` | candidate_relevance | “branch causes meaning” |
| C03 | Register or memory slot holding `class` | A | register/memory trace | output class variable | declared label under task contract | class is the immediate output used by the semantic contract | `W_trace`, `W_map`, `W_contract`, `W_check` | candidate_relevance | “class value proves semantic truth” |
| C04 | Registers holding intermediate activations `h0`, `h1` | A | register trace / replay | hidden model states | supports output-boundary reconstruction | intermediate states help reconstruct whether output came from declared computation | `W_trace`, `W_map`, `W_contract`, `W_check` | candidate_relevance | “hidden activation explains behavior” |
| C05 | Memory access to weights/constants | A/C | memory trace / address mapping | model constants / weights | computation path consistency | wrong or unexpected memory access may break the trace-to-model mapping | `W_trace`, `W_map`, `W_check` | candidate_relevance | “memory access proves model correctness” |
| C06 | Instruction order for model operations | A/B | instruction trace | operation sequence | declared computation path | operation order may be needed to connect trace to model semantics | `W_trace`, `W_map`, `W_check` | candidate_relevance | “instruction order proves output meaning” |
| C07 | FPU rounding / precision path | A/C | FPU trace, flags, instruction class, precision mode | numeric computation state | output boundary stability | precision effects may shift values near the boundary | `W_trace`, `W_map`, `W_contract`, `W_check` | candidate_relevance | “rounding causes classification change” |
| C08 | FP exception flags: overflow, underflow, invalid, inexact | C/E | FPU status flags / perf counters | numeric validity state | boundary trustworthiness | exceptions can invalidate or qualify semantic-output claims | `W_trace`, `W_map`, `W_contract`, `W_check` | candidate_relevance | “exception flag proves semantic failure” |
| C09 | Input buffer and output buffer addresses | A/C | memory trace | input/output variables | trace-to-model binding | helps prove that the traced data corresponds to the intended workload | `W_trace`, `W_map`, `W_check` | candidate_relevance | “buffer access proves task correctness” |
| C10 | Cache miss / memory stall counters near model operation | C | perf counters | runtime condition around computation | possible perturbation target | may matter for timing-sensitive or non-deterministic paths, but often orthogonal to semantic output | `W_trace`, `W_map`, `W_check`; effect claim needs counterfactual | candidate_relevance / possible_orthogonal | “cache behavior changes semantics” |

## Relevance-bridge admissible claim template

Only after the required mapping, contract, and check exist:

```text
Γ ⊢ K_sem @ B_sem
  ⇐ (W_trace ⊕ W_map ⊕ W_contract ⊕ W_check)
  : checked
```

Example for toy XOR:

```text
K_sem:
trace-derived class matches the declared XOR semantic label

B_sem:
toy_xor_mlp_int_v0.1 only;
four declared XOR inputs only;
exact arithmetic boundary as declared;
no natural-language semantics;
no AI-safety claim
```

---

# B. Generating signals for the effect bridge

These are controlled experiments designed to produce baseline and counterfactual witnesses.  
Current status for all rows: `design_candidate` or `incomplete` until baseline/counterfactual traces and checks exist.

| ID | Controlled contrast `ΔS` | Strategy | How to generate | Held fixed | Intended output boundary `Y` | Intended effect claim | Required witnesses | Current status | Forbidden overclaim |
|---|---|---|---|---|---|---|---|---|---|
| E01 | Precision mode `fp32 → fp16` | D | run same toy precision-boundary workload in fp32 and fp16 | input, model, runtime, trace method, semantic contract | logit/class boundary | changing precision shifts trace-derived output boundary inside `B_effect` | `W_baseline`, `W_counterfactual`, `W_map`, `W_contract`, `W_effect_check` | design_candidate | “fp16 causes semantic error” |
| E02 | Near-boundary input below/above threshold | E | fabricate inputs around decision threshold | model, runtime, precision, trace method | class boundary | input boundary proximity makes branch/logit sensitivity checkable | `W_baseline`, `W_counterfactual`, `W_map`, `W_contract`, `W_effect_check` | design_candidate | “near-boundary input proves general instability” |
| E03 | Rounding mode change | D/E | compare declared rounding modes where available | input, model, precision family, runtime except rounding mode | numeric/logit boundary | controlled rounding variation changes or preserves output boundary | `W_baseline`, `W_counterfactual`, `W_map`, `W_contract`, `W_effect_check` | design_candidate | “rounding changes AI meaning” |
| E04 | Quantized vs non-quantized computation | D | same workload with quantized and non-quantized path | input, task, trace method; model boundary must explicitly allow variant | output class/token boundary | quantization condition changes mapped output boundary | `W_baseline`, `W_counterfactual`, `W_map`, `W_contract`, `W_effect_check` | design_candidate | “quantization is unsafe” |
| E05 | Branch-path perturbation at threshold | D/E | choose input that flips threshold branch under one controlled condition | model, runtime, precision or declared perturbation only | threshold branch / class output | controlled branch-path difference maps to class-boundary difference | `W_baseline`, `W_counterfactual`, `W_map`, `W_contract`, `W_effect_check` | design_candidate | “branch causes semantics” |
| E06 | Edge numeric values: subnormal / overflow / underflow | E | fabricate values near numeric edge cases | model, runtime, trace method; input range explicitly bounded | numeric validity / output boundary | numeric edge case changes or qualifies semantic-output claim inside B | `W_baseline`, `W_counterfactual`, `W_map`, `W_contract`, `W_effect_check` | design_candidate | “edge case proves model unreliability” |
| E07 | Cache-stable vs cache-stressed condition | D/C | compare baseline run with controlled cache stress | workload, input, model, trace method; cache condition only | runtime/output stability boundary | cache condition affects trace timing or output only if mapped and checked | `W_baseline`, `W_counterfactual`, `W_map`, `W_contract`, `W_effect_check` | design_candidate / likely_orthogonal for pure deterministic toy | “cache stress affects classification” |

## Effect-bridge admissible claim template

Only after controlled baseline/counterfactual witnesses, mapping, semantic contract, and effect check exist:

```text
Γ ⊢ K_effect @ B_effect
  ⇐ (W_baseline ⊕ W_counterfactual ⊕ W_map ⊕ W_contract ⊕ W_effect_check)
  : checked
```

Example candidate claim:

```text
K_effect:
Changing precision mode from fp32 to fp16 changes the trace-derived output boundary for the selected toy precision-boundary input.

B_effect:
same workload;
same input;
same model;
same runtime;
same chip/simulator;
same trace method;
same semantic contract;
only declared precision mode differs;
no claim outside this probe.
```

---

# C. Recommended next probe direction

## Candidate probe

```text
toy_precision_boundary_float_v0.1
```

Status:

```text
design_candidate
```

Purpose:

```text
Make a precision-induced output-boundary shift checkable.
```

Candidate structure:

```text
logit = (x + delta) - 1.0
class = 1 if logit > 0 else 0
```

Candidate intervention:

```text
baseline: fp32
counterfactual: fp16
```

Required before any effect claim:

```text
W_baseline
W_counterfactual
W_map
W_contract
W_effect_check
```

Allowed wording:

```text
This probe is designed to make a bounded precision-effect claim checkable.
```

Forbidden wording:

```text
fp16 causes semantic error.
The chip changes AI meaning.
This proves AI-safety relevance.
```

---

# D. Next calibration requests

## CalibrationRequest 1 — build a negative semantic fixture

Target gap: show that an execution witness alone cannot carry a semantic-output claim.  
Required witness: one execution-style witness only.  
Required check: none, or deliberately absent.  
Expected result: `pending_check`, `incomplete`, `unsupported`, or `out_of_boundary`.  
Claim it makes checkable: none; this is an overclaim-blocking fixture.

## CalibrationRequest 2 — define semantic contract for toy precision probe

Target gap: output boundary needs task meaning.  
Required witness: `W_contract` defining class labels for the toy task.  
Required check: contract consistency check.  
Expected boundary: toy precision-boundary workload only.  
Claim it makes checkable: trace-derived output boundary maps to declared label.

## CalibrationRequest 3 — define baseline/counterfactual protocol

Target gap: effect claim needs controlled contrast.  
Required witness: baseline and counterfactual execution witnesses.  
Required check: effect check verifying only declared intervention differs.  
Expected boundary: same workload/input/model/runtime/trace method except precision mode.  
Claim it makes checkable: bounded precision intervention shifts or preserves output boundary.

---

# E. Short thesis

Discovery may be broad.  
Claims must be narrow.

Choosing chip-data feeds the relevance bridge.  
Generating chip-data feeds the effect bridge.

Neither becomes a claim until witnessed, mapped, checked, and bounded.
