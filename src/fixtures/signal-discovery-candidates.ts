// UPL Foundation — Signal Discovery Candidates v0.1
// Status: exploration | Canonical: no | Ledger: not active
//
// This file is a design fixture for discovery planning.
// It does not assert semantic relevance or causal effect.
// It proposes candidate signals and controlled contrasts that may later
// become witnesses or feed UPL judgments after trace capture, mapping,
// semantic contract definition, and checks.

export type DiscoveryMode = 'choosing' | 'generating';

export type DiscoveryStrategy =
  | 'A_architecture_driven_selection'
  | 'B_differential_narrowing'
  | 'C_domain_convention_instrumentation'
  | 'D_controlled_perturbation'
  | 'E_edge_case_fabrication'
  | 'F_synthetic_toy_workload';

export type DiscoveryStatus =
  | 'design_candidate'
  | 'candidate_relevance'
  | 'incomplete'
  | 'pending_check'
  | 'possible_orthogonal';

export type DiscoveryCandidate = {
  id: string;
  mode: DiscoveryMode;
  strategy: DiscoveryStrategy;
  candidateSignal: string;
  howToObserveOrGenerate: string;
  intendedModelLink: string;
  intendedSemanticTarget: string;
  intendedClaim: string;
  requiredWitnesses: string[];
  currentStatus: DiscoveryStatus;
  forbiddenOverclaim: string;
};

export const relevanceCandidates: DiscoveryCandidate[] = [
  {
    id: 'C01',
    mode: 'choosing',
    strategy: 'A_architecture_driven_selection',
    candidateSignal: 'register holding logit',
    howToObserveOrGenerate: 'register trace / replay',
    intendedModelLink: 'logit',
    intendedSemanticTarget: 'output boundary logit > 0',
    intendedClaim: 'trace feature may be claim-bearing for the bounded semantic-output claim',
    requiredWitnesses: ['W_trace', 'W_map', 'W_contract', 'W_check'],
    currentStatus: 'candidate_relevance',
    forbiddenOverclaim: 'register value proves classification correctness'
  },
  {
    id: 'C02',
    mode: 'choosing',
    strategy: 'A_architecture_driven_selection',
    candidateSignal: 'threshold comparison branch',
    howToObserveOrGenerate: 'instruction + branch trace',
    intendedModelLink: 'comparison logit > 0',
    intendedSemanticTarget: 'class decision boundary',
    intendedClaim: 'branch may map to output-boundary decision',
    requiredWitnesses: ['W_trace', 'W_map', 'W_contract', 'W_check'],
    currentStatus: 'candidate_relevance',
    forbiddenOverclaim: 'branch causes meaning'
  },
  {
    id: 'C03',
    mode: 'choosing',
    strategy: 'A_architecture_driven_selection',
    candidateSignal: 'register or memory slot holding class',
    howToObserveOrGenerate: 'register/memory trace',
    intendedModelLink: 'output class variable',
    intendedSemanticTarget: 'declared label under task contract',
    intendedClaim: 'class storage may support trace-derived output claim after mapping/check',
    requiredWitnesses: ['W_trace', 'W_map', 'W_contract', 'W_check'],
    currentStatus: 'candidate_relevance',
    forbiddenOverclaim: 'class value proves semantic truth'
  },
  {
    id: 'C04',
    mode: 'choosing',
    strategy: 'A_architecture_driven_selection',
    candidateSignal: 'registers holding intermediate activations h0 and h1',
    howToObserveOrGenerate: 'register trace / replay',
    intendedModelLink: 'hidden model states',
    intendedSemanticTarget: 'output-boundary reconstruction',
    intendedClaim: 'intermediate states may support trace-to-model reconstruction',
    requiredWitnesses: ['W_trace', 'W_map', 'W_contract', 'W_check'],
    currentStatus: 'candidate_relevance',
    forbiddenOverclaim: 'hidden activation explains behavior'
  },
  {
    id: 'C05',
    mode: 'choosing',
    strategy: 'C_domain_convention_instrumentation',
    candidateSignal: 'FP exception flags',
    howToObserveOrGenerate: 'FPU status flags / perf counters',
    intendedModelLink: 'numeric validity state',
    intendedSemanticTarget: 'boundary trustworthiness',
    intendedClaim: 'numeric exception flags may qualify a semantic-output claim',
    requiredWitnesses: ['W_trace', 'W_map', 'W_contract', 'W_check'],
    currentStatus: 'candidate_relevance',
    forbiddenOverclaim: 'exception flag proves semantic failure'
  },
  {
    id: 'C06',
    mode: 'choosing',
    strategy: 'C_domain_convention_instrumentation',
    candidateSignal: 'cache miss or memory stall counters near model operation',
    howToObserveOrGenerate: 'perf counters',
    intendedModelLink: 'runtime condition around computation',
    intendedSemanticTarget: 'possible perturbation target',
    intendedClaim: 'cache/memory signal may be relevant only if mapped and checked',
    requiredWitnesses: ['W_trace', 'W_map', 'W_check'],
    currentStatus: 'possible_orthogonal',
    forbiddenOverclaim: 'cache behavior changes semantics'
  }
];

export const effectCandidates: DiscoveryCandidate[] = [
  {
    id: 'E01',
    mode: 'generating',
    strategy: 'D_controlled_perturbation',
    candidateSignal: 'precision mode fp32 -> fp16',
    howToObserveOrGenerate: 'run same toy precision-boundary workload in fp32 and fp16',
    intendedModelLink: 'numeric logit computation',
    intendedSemanticTarget: 'class/output boundary',
    intendedClaim: 'controlled precision intervention may shift trace-derived output boundary',
    requiredWitnesses: ['W_baseline', 'W_counterfactual', 'W_map', 'W_contract', 'W_effect_check'],
    currentStatus: 'design_candidate',
    forbiddenOverclaim: 'fp16 causes semantic error'
  },
  {
    id: 'E02',
    mode: 'generating',
    strategy: 'E_edge_case_fabrication',
    candidateSignal: 'near-boundary input below/above threshold',
    howToObserveOrGenerate: 'fabricate inputs around decision threshold',
    intendedModelLink: 'logit and class boundary',
    intendedSemanticTarget: 'declared class label',
    intendedClaim: 'near-boundary inputs make output-boundary sensitivity checkable',
    requiredWitnesses: ['W_baseline', 'W_counterfactual', 'W_map', 'W_contract', 'W_effect_check'],
    currentStatus: 'design_candidate',
    forbiddenOverclaim: 'near-boundary input proves general instability'
  },
  {
    id: 'E03',
    mode: 'generating',
    strategy: 'D_controlled_perturbation',
    candidateSignal: 'rounding mode change',
    howToObserveOrGenerate: 'compare declared rounding modes where available',
    intendedModelLink: 'numeric/logit boundary',
    intendedSemanticTarget: 'class/output boundary',
    intendedClaim: 'controlled rounding variation may change or preserve output boundary',
    requiredWitnesses: ['W_baseline', 'W_counterfactual', 'W_map', 'W_contract', 'W_effect_check'],
    currentStatus: 'design_candidate',
    forbiddenOverclaim: 'rounding changes AI meaning'
  }
];

export const discoveryThesis = [
  'Discovery may be broad.',
  'Claims must be narrow.',
  'Choosing chip-data feeds the relevance bridge.',
  'Generating chip-data feeds the effect bridge.',
  'Neither becomes a claim until witnessed, mapped, checked, and bounded.'
] as const;
