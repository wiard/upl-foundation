import type { UPLJudgment } from '../judgment';

export const descriptiveExecClaim: UPLJudgment = {
  gamma: [
    'exploration version only',
    'single operational fixture only',
    'no canonical or ledger claim',
  ],
  claim: {
    id: 'claim.descriptive.execution.capture',
    domain: 'execution',
    kind: 'descriptive',
    text: 'A bounded execution trace artifact was captured for a single toy-workload execution run.',
  },
  boundary: {
    id: 'B_fixture_descriptive_execution_capture',
    domain: 'execution',
    includes: [
      'single toy-workload execution run only',
      'synthetic trace source only',
      'operational fixture only',
    ],
    excludes: [
      'no semantic-output claim',
      'no real chip claim',
      'no canonical claim',
    ],
  },
  witnesses: [
    {
      id: 'W_trace_fixture_execution_capture',
      domain: 'execution',
      kind: 'trace',
      source: 'operational fixture',
      boundary: {
        id: 'B_fixture_descriptive_execution_capture',
        domain: 'execution',
        includes: [
          'single toy-workload execution run only',
          'synthetic trace source only',
          'operational fixture only',
        ],
        excludes: [
          'no semantic-output claim',
          'no real chip claim',
          'no canonical claim',
        ],
      },
      artifactRef: 'src/fixtures/descriptive-exec-claim.ts',
      hash: 'fixture-hash-descriptive-exec-claim-v0.1',
    },
  ],
  assertedStatus: 'checked',
};
