import type { UPLJudgment } from '../judgment';

export const descriptiveExecClaim: UPLJudgment = {
  gamma: [
    'exploration version only',
    'single operational fixture only',
    'no canonical or ledger claim',
  ],
  claim: {
    id: 'claim.descriptive.execution.register_value',
    domain: 'execution',
    kind: 'descriptive',
    text: 'register r12 had value 0x7F at trace event 043',
  },
  boundary: {
    id: 'B_fixture_trace_event_043',
    domain: 'execution',
    includes: [
      'trace event 043 only',
      'register r12 only',
      'single execution capture only',
    ],
    excludes: [
      'no semantic claim',
      'no effect claim',
      'no canonical claim',
    ],
  },
  witnesses: [
    {
      id: 'W_trace_event_043',
      domain: 'execution',
      kind: 'trace',
      source: 'RPK:trace_043',
      boundary: {
        id: 'B_fixture_trace_event_043',
        domain: 'execution',
        includes: [
          'trace event 043 only',
          'register r12 only',
          'single execution capture only',
        ],
        excludes: [
          'no semantic claim',
          'no effect claim',
          'no canonical claim',
        ],
      },
      artifactRef: 'src/fixtures/descriptive-exec-claim.ts',
      hash: 'fixture-hash-trace-event-043-v0.1',
    },
  ],
  check: {
    id: 'C_replay_trace_event_043',
    method: 'replay',
    artifactRef: 'RPK:replay_log_043',
    result: 'pass',
  },
  assertedStatus: 'checked',
};
