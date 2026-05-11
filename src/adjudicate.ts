import type { UPLDecision, UPLJudgment, Witness } from './judgment';

function hasSameDomainWitness(witnesses: Witness[], domain: string): boolean {
  return witnesses.some((witness) => witness.domain === domain);
}

function hasWitnessKind(witnesses: Witness[], kind: string): boolean {
  return witnesses.some((witness) => witness.kind === kind);
}

export function adjudicate(j: UPLJudgment): UPLDecision {
  const limits: string[] = [];

  if (j.assertedStatus !== undefined) {
    limits.push('assertedStatus was not trusted as evidence');
  }

  limits.push('does not verify check artifact authenticity');

  // rule 1: no witnesses -> reject unsupported
  if (j.witnesses.length === 0) {
    return {
      admissibility: 'reject',
      status: 'unsupported',
      reasons: ['no witnesses were provided'],
      limits,
    };
  }

  // rule 2: boundary domain mismatch -> reject out_of_boundary
  if (j.claim.kind !== 'effect' && j.boundary.domain !== j.claim.domain) {
    return {
      admissibility: 'reject',
      status: 'out_of_boundary',
      reasons: ['boundary domain does not match claim domain'],
      limits,
      derivedBoundary: j.boundary,
    };
  }

  // rule 3: descriptive + no same-domain witness -> reject out_of_boundary
  if (j.claim.kind === 'descriptive' && !hasSameDomainWitness(j.witnesses, j.claim.domain)) {
    return {
      admissibility: 'reject',
      status: 'out_of_boundary',
      reasons: ['descriptive claim has no same-domain witness'],
      limits,
      derivedBoundary: j.boundary,
    };
  }

  // rule 4: effect + missing baseline or counterfactual -> reject incomplete
  if (
    j.claim.kind === 'effect' &&
    (!hasWitnessKind(j.witnesses, 'baseline') || !hasWitnessKind(j.witnesses, 'counterfactual'))
  ) {
    return {
      admissibility: 'reject',
      status: 'incomplete',
      reasons: ['effect claim requires both baseline and counterfactual witnesses'],
      limits,
      derivedBoundary: j.boundary,
    };
  }

  // rule 5: strong claim + no check -> pending pending_check
  if (
    (j.claim.kind === 'relevance' ||
      j.claim.kind === 'semantic_output' ||
      j.claim.kind === 'effect') &&
    !j.check
  ) {
    return {
      admissibility: 'pending',
      status: 'pending_check',
      reasons: ['strong claim requires a check artifact'],
      limits,
      derivedBoundary: j.boundary,
    };
  }

  // rule 6: check result pending -> pending pending_check
  if (j.check && (j.check.result === 'pending' || j.check.result === undefined)) {
    return {
      admissibility: 'pending',
      status: 'pending_check',
      reasons: ['check result is pending'],
      limits,
      derivedBoundary: j.boundary,
    };
  }

  // rule 7: check result fail -> reject failed
  if (j.check && j.check.result === 'fail') {
    return {
      admissibility: 'reject',
      status: 'failed',
      reasons: ['check failed to support the claim'],
      limits,
      derivedBoundary: j.boundary,
    };
  }

  // rule 8: otherwise -> admit, checked if pass else witnessed
  return {
    admissibility: 'admit',
    status: j.check?.result === 'pass' ? 'checked' : 'witnessed',
    reasons: ['candidate claim is admissible within the stated boundary'],
    limits,
    derivedBoundary: j.boundary,
  };
}
