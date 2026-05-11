import type { UPLJudgment } from '../judgment';

export const thresholdBranchRelevanceCandidate: UPLJudgment = {
  gamma: [
    'exploration fixture',
    'candidate selected from signal-discovery-v0.1',
    'no external RPK state assumed',
    'no external PPK state assumed',
    'no semantic correctness claim',
    'no effect or causality claim'
  ],
  claim: {
    id: 'K_relevance_threshold_branch_001',
    domain: 'bridge',
    kind: 'relevance',
    text: 'threshold comparison branch is candidate-relevant to the toy output boundary'
  },
  boundary: {
    id: 'B_relevance_threshold_branch_001',
    domain: 'bridge',
    includes: [
      'threshold comparison branch',
      'toy output boundary',
      'candidate relevance only',
      'exploration fixture'
    ],
    excludes: [
      'semantic correctness',
      'effect claim',
      'causality',
      'AI safety',
      'real RPK artifact',
      'real PPK check',
      'canonical status'
    ]
  },
  witnesses: [
    {
      id: 'W_trace_label_threshold_branch_001',
      domain: 'execution',
      kind: 'trace',
      source: 'label:RPK:trace_threshold_branch_candidate',
      boundary: {
        id: 'B_trace_label_threshold_branch_001',
        domain: 'execution',
        includes: [
          'branch event label',
          'candidate trace reference'
        ],
        excludes: [
          'verified trace artifact',
          'semantic correctness',
          'effect claim'
        ]
      },
      artifactRef: 'label:trace_threshold_branch_candidate'
    },
    {
      id: 'W_map_candidate_threshold_branch_001',
      domain: 'bridge',
      kind: 'mapping',
      source: 'design:threshold-branch-to-output-boundary-map',
      boundary: {
        id: 'B_map_candidate_threshold_branch_001',
        domain: 'bridge',
        includes: [
          'candidate mapping',
          'branch event to threshold comparison',
          'threshold comparison to output boundary'
        ],
        excludes: [
          'checked mapping',
          'semantic correctness',
          'effect claim'
        ]
      },
      artifactRef: 'design:threshold-branch-map-candidate'
    },
    {
      id: 'W_contract_candidate_toy_output_001',
      domain: 'semantic',
      kind: 'contract',
      source: 'design:toy-output-contract-candidate',
      boundary: {
        id: 'B_contract_candidate_toy_output_001',
        domain: 'semantic',
        includes: [
          'candidate toy semantic-output contract'
        ],
        excludes: [
          'natural-language truth',
          'AI safety',
          'real task correctness'
        ]
      },
      artifactRef: 'design:toy-output-contract-candidate'
    }
  ],
  assertedStatus: 'pending_check'
};
