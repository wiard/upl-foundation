import type { Status } from '../judgment';

export type DisruptionMagnitude =
  | 'marginal'
  | 'medium'
  | 'large'
  | 'catastrophic';

export type DisruptionFrequency =
  | 'rare'
  | 'occasional'
  | 'frequent'
  | 'systemic';

export type SpectrumEvidenceStatus =
  | 'hypothesis'
  | 'pending_check'
  | 'incomplete'
  | 'checked'
  | 'unsupported'
  | 'out_of_boundary';

export type DiscoveryMode =
  | 'choosing'
  | 'generating';

export type IntendedBridge =
  | 'relevance'
  | 'effect'
  | 'disruption';

export type CausalPath =
  | 'chip_to_ai'
  | 'input_to_chip_to_ai';

export type DisruptionCandidate = {
  id: string;
  signal: string;
  discoveryMode: DiscoveryMode;
  intendedBridge: IntendedBridge;
  causalPath: CausalPath;

  hypothesizedMagnitude: DisruptionMagnitude;
  hypothesizedFrequency: DisruptionFrequency;

  intendedOutputBoundary: string;

  requiredWitnesses: string[];
  currentStatus: SpectrumEvidenceStatus;
  relatedUPLStatus: Status;

  boundaryNotes: string[];
  forbiddenOverclaim: string;
};

export const disruptionSpectrumCandidates: DisruptionCandidate[] = [
  {
    id: 'D01_precision_fp32_to_fp16',
    signal: 'precision mode transition fp32 to fp16',
    discoveryMode: 'generating',
    intendedBridge: 'disruption',
    causalPath: 'chip_to_ai',
    hypothesizedMagnitude: 'marginal',
    hypothesizedFrequency: 'occasional',
    intendedOutputBoundary: 'toy classification boundary near threshold',
    requiredWitnesses: [
      'W_baseline_fp32',
      'W_counterfactual_fp16',
      'W_map',
      'W_contract',
      'W_effect_check',
      'W_frequency'
    ],
    currentStatus: 'hypothesis',
    relatedUPLStatus: 'incomplete',
    boundaryNotes: [
      'requires fixed workload',
      'requires controlled precision intervention only',
      'requires declared input boundary',
      'frequency claim requires workload distribution',
      'magnitude claim requires controlled output-boundary comparison'
    ],
    forbiddenOverclaim: 'fp16 causes semantic error'
  },

  {
    id: 'D02_threshold_branch_near_boundary',
    signal: 'threshold comparison branch near output boundary',
    discoveryMode: 'choosing',
    intendedBridge: 'relevance',
    causalPath: 'chip_to_ai',
    hypothesizedMagnitude: 'large',
    hypothesizedFrequency: 'rare',
    intendedOutputBoundary: 'class boundary determined by threshold comparison',
    requiredWitnesses: [
      'W_trace',
      'W_map',
      'W_contract',
      'W_check'
    ],
    currentStatus: 'hypothesis',
    relatedUPLStatus: 'pending_check',
    boundaryNotes: [
      'candidate relevance only',
      'no effect claim without controlled contrast',
      'no semantic correctness claim',
      'branch must be mapped to the output boundary before relevance can be checked'
    ],
    forbiddenOverclaim: 'threshold branch affects AI output'
  },

  {
    id: 'D03_fpu_rounding_edge_case',
    signal: 'FPU rounding or subnormal edge behavior',
    discoveryMode: 'generating',
    intendedBridge: 'disruption',
    causalPath: 'chip_to_ai',
    hypothesizedMagnitude: 'medium',
    hypothesizedFrequency: 'rare',
    intendedOutputBoundary: 'numeric boundary feeding class or logit decision',
    requiredWitnesses: [
      'W_baseline',
      'W_counterfactual',
      'W_map',
      'W_contract',
      'W_effect_check',
      'W_frequency'
    ],
    currentStatus: 'hypothesis',
    relatedUPLStatus: 'incomplete',
    boundaryNotes: [
      'edge-case fabrication required',
      'frequency cannot be claimed without workload distribution',
      'magnitude cannot be claimed without comparison',
      'subnormal or rounding behavior may be within specification and should not be called a fault unless a fault witness exists'
    ],
    forbiddenOverclaim: 'rounding behavior causes semantic failure'
  },

  {
    id: 'D04_cache_stress_condition',
    signal: 'cache stress or memory-access perturbation around model weights',
    discoveryMode: 'generating',
    intendedBridge: 'effect',
    causalPath: 'chip_to_ai',
    hypothesizedMagnitude: 'marginal',
    hypothesizedFrequency: 'frequent',
    intendedOutputBoundary: 'runtime stability or output-boundary stability under memory pressure',
    requiredWitnesses: [
      'W_baseline',
      'W_counterfactual',
      'W_map',
      'W_contract',
      'W_effect_check',
      'W_frequency'
    ],
    currentStatus: 'hypothesis',
    relatedUPLStatus: 'incomplete',
    boundaryNotes: [
      'must isolate cache condition',
      'must rule out unrelated runtime differences inside B',
      'not a semantic correctness claim',
      'cache behavior is not itself model meaning'
    ],
    forbiddenOverclaim: 'cache behavior explains model semantics'
  },

  {
    id: 'D05_memory_access_around_weights',
    signal: 'memory-access pattern around model weights or constants',
    discoveryMode: 'choosing',
    intendedBridge: 'relevance',
    causalPath: 'chip_to_ai',
    hypothesizedMagnitude: 'marginal',
    hypothesizedFrequency: 'frequent',
    intendedOutputBoundary: 'model computation traceability and output-boundary mapping',
    requiredWitnesses: [
      'W_trace',
      'W_map',
      'W_contract',
      'W_check'
    ],
    currentStatus: 'hypothesis',
    relatedUPLStatus: 'pending_check',
    boundaryNotes: [
      'candidate relevance only',
      'frequency depends on workload and model architecture',
      'does not imply semantic correctness',
      'memory access must be mapped to a model variable or computation state'
    ],
    forbiddenOverclaim: 'memory access pattern proves semantic correctness'
  },

  {
    id: 'D06_input_induced_precision_boundary',
    signal: 'input pattern designed to induce precision-boundary execution condition',
    discoveryMode: 'generating',
    intendedBridge: 'disruption',
    causalPath: 'input_to_chip_to_ai',
    hypothesizedMagnitude: 'large',
    hypothesizedFrequency: 'rare',
    intendedOutputBoundary: 'classification boundary near numerical precision edge',
    requiredWitnesses: [
      'W_input_class',
      'W_neutral_input_baseline',
      'W_induced_execution_trace',
      'W_map',
      'W_contract',
      'W_effect_check',
      'W_ruleout',
      'W_frequency'
    ],
    currentStatus: 'hypothesis',
    relatedUPLStatus: 'incomplete',
    boundaryNotes: [
      'input pattern is a design candidate only',
      'requires neutral-input baseline',
      'requires induced execution trace',
      'requires rule-out that output divergence is not explained by input difference alone',
      'do not call the chip condition a fault unless a fault witness exists',
      'frequency claim requires declared workload distribution'
    ],
    forbiddenOverclaim: 'adversarial input causes chip fault and AI misclassification'
  }
];

export const disruptionSpectrumPrinciples = [
  'Relevance is not effect.',
  'Effect is not frequency.',
  'Frequency is not generality.',
  'No semantic claim without relevance bridge.',
  'No effect claim without controlled contrast.',
  'No disruption-magnitude claim without controlled output-boundary comparison.',
  'No disruption-frequency claim without explicit workload boundary.',
  'UPL does not measure magnitude or frequency; it adjudicates claims about them when witnesses and checks exist.'
] as const;

export const disruptionSpectrumLimits = [
  'This file is a discovery catalog, not a UPLJudgment.',
  'This file does not prove relevance.',
  'This file does not prove effect.',
  'This file does not measure frequency.',
  'This file does not establish semantic correctness.',
  'This file does not claim AI safety.',
  'This file does not create canonical status.'
] as const;
