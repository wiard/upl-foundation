import type {
  Boundary,
  Check,
  Claim,
  Domain,
  RelevanceStatus,
  UPLDecision,
  UPLJudgment,
  Witness,
  WitnessKind,
} from './judgment';

const ABSOLUTE_PREFIXES = ['/Users/', 'file:///', '/'];

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isRelativeArtifactRef(value: string | undefined): boolean {
  if (value === undefined) {
    return true;
  }
  return !ABSOLUTE_PREFIXES.some((prefix) => value.startsWith(prefix));
}

function hasBoundaryShape(boundary: Boundary | undefined): boundary is Boundary {
  return Boolean(
    boundary &&
      isNonEmptyString(boundary.id) &&
      isNonEmptyString(boundary.domain) &&
      Array.isArray(boundary.includes) &&
      Array.isArray(boundary.excludes),
  );
}

function hasClaimShape(claim: Claim | undefined): claim is Claim {
  return Boolean(
    claim &&
      isNonEmptyString(claim.id) &&
      isNonEmptyString(claim.domain) &&
      isNonEmptyString(claim.kind) &&
      isNonEmptyString(claim.text),
  );
}

function boundaryContains(claimBoundary: Boundary, witnessBoundary: Boundary): boolean {
  if (claimBoundary.domain !== witnessBoundary.domain) {
    return false;
  }

  const witnessIncludes = new Set(witnessBoundary.includes);
  const witnessExcludes = new Set(witnessBoundary.excludes);

  const missingIncludes = claimBoundary.includes.some((item) => !witnessIncludes.has(item));
  if (missingIncludes) {
    return false;
  }

  const conflictingExcludes = claimBoundary.excludes.some((item) => witnessIncludes.has(item));
  if (conflictingExcludes) {
    return false;
  }

  const witnessBlocksClaim = claimBoundary.includes.some((item) => witnessExcludes.has(item));
  return !witnessBlocksClaim;
}

function witnessKinds(witnesses: Witness[]): Set<WitnessKind> {
  return new Set(witnesses.map((witness) => witness.kind));
}

function witnessDomains(witnesses: Witness[]): Set<Domain> {
  return new Set(witnesses.map((witness) => witness.domain));
}

function domainCompatible(claim: Claim, witnesses: Witness[]): boolean {
  const domains = witnessDomains(witnesses);

  if (claim.domain === 'execution') {
    return domains.has('execution');
  }

  if (claim.domain === 'proof') {
    return domains.has('proof') || domains.has('execution');
  }

  if (claim.domain === 'bridge') {
    return domains.has('bridge') || (domains.has('execution') && domains.has('semantic'));
  }

  if (claim.domain === 'semantic') {
    return domains.has('semantic') || domains.has('bridge');
  }

  return false;
}

function relevanceForKinds(claim: Claim, kinds: Set<WitnessKind>, check?: Check): RelevanceStatus | undefined {
  if (claim.kind === 'relevance') {
    if (kinds.has('trace') && kinds.has('mapping') && check?.result === 'pass') {
      return 'directly_claim_bearing';
    }
    if (kinds.has('trace') && kinds.has('mapping')) {
      return 'candidate_relevance';
    }
    if (kinds.has('trace')) {
      return 'incomplete_relevance';
    }
    return 'orthogonal';
  }

  if (claim.kind === 'semantic_output') {
    if (kinds.has('trace') && kinds.has('mapping') && kinds.has('contract') && check?.result === 'pass') {
      return 'directly_claim_bearing';
    }
    if (kinds.has('trace') && (kinds.has('mapping') || kinds.has('contract'))) {
      return 'incomplete_relevance';
    }
    return 'orthogonal';
  }

  if (claim.kind === 'effect') {
    if (kinds.has('baseline') && (kinds.has('counterfactual') || kinds.has('effect_check')) && check?.result === 'pass') {
      return 'directly_claim_bearing';
    }
    if (kinds.has('baseline')) {
      return 'candidate_relevance';
    }
    return 'orthogonal';
  }

  return undefined;
}

function supportsClaimKind(claim: Claim, kinds: Set<WitnessKind>): boolean {
  if (claim.kind === 'descriptive') {
    return kinds.has('trace') || kinds.has('baseline') || kinds.has('check');
  }

  if (claim.kind === 'relevance') {
    return kinds.has('trace') && kinds.has('mapping');
  }

  if (claim.kind === 'semantic_output') {
    return kinds.has('trace') && kinds.has('mapping') && kinds.has('contract');
  }

  if (claim.kind === 'effect') {
    return kinds.has('baseline') && (kinds.has('counterfactual') || kinds.has('effect_check'));
  }

  return false;
}

function validateInput(judgment: UPLJudgment): string[] {
  const failures: string[] = [];

  if (!Array.isArray(judgment.gamma)) {
    failures.push('gamma must be an array');
  }

  if (!hasClaimShape(judgment.claim)) {
    failures.push('claim is missing required fields');
  }

  if (!hasBoundaryShape(judgment.boundary)) {
    failures.push('boundary is missing required fields');
  }

  if (!Array.isArray(judgment.witnesses) || judgment.witnesses.length === 0) {
    failures.push('at least one witness is required');
  }

  for (const witness of judgment.witnesses ?? []) {
    if (!isNonEmptyString(witness.id)) {
      failures.push('witness.id is required');
    }
    if (!isNonEmptyString(witness.source)) {
      failures.push(`witness ${witness.id || '<unknown>'} is missing source`);
    }
    if (!hasBoundaryShape(witness.boundary)) {
      failures.push(`witness ${witness.id || '<unknown>'} is missing boundary`);
    }
    if (!isRelativeArtifactRef(witness.artifactRef)) {
      failures.push(`witness ${witness.id || '<unknown>'} has non-relative artifactRef`);
    }
  }

  if (judgment.check) {
    if (!isNonEmptyString(judgment.check.id)) {
      failures.push('check.id is required when check is present');
    }
    if (!isRelativeArtifactRef(judgment.check.artifactRef)) {
      failures.push('check.artifactRef must be relative');
    }
  }

  return failures;
}

function mergeBoundary(claimBoundary: Boundary): Boundary {
  return {
    id: claimBoundary.id,
    domain: claimBoundary.domain,
    includes: [...claimBoundary.includes],
    excludes: [...claimBoundary.excludes],
  };
}

export function adjudicate(j: UPLJudgment): UPLDecision {
  const reasons: string[] = [];
  const limits: string[] = [];

  if (j.assertedStatus !== undefined) {
    limits.push('assertedStatus was not trusted as evidence');
  }

  const failures = validateInput(j);
  if (failures.length > 0) {
    return {
      admissibility: 'reject',
      status: 'incomplete',
      reasons: failures,
      limits,
    };
  }

  const claim = j.claim;
  const boundary = j.boundary;
  const witnesses = j.witnesses;
  const check = j.check;
  const kinds = witnessKinds(witnesses);
  const relevance = relevanceForKinds(claim, kinds, check);

  if (!domainCompatible(claim, witnesses)) {
    reasons.push('witness domains do not bear the claim domain');
    return {
      admissibility: 'reject',
      status: 'unsupported',
      relevance: relevance ?? 'orthogonal',
      reasons,
      limits,
      derivedBoundary: mergeBoundary(boundary),
    };
  }

  const inBoundary = witnesses.every((witness) => boundaryContains(boundary, witness.boundary));
  if (!inBoundary) {
    reasons.push('at least one witness boundary does not contain the claim boundary');
    return {
      admissibility: 'reject',
      status: 'out_of_boundary',
      relevance: relevance ?? 'out_of_boundary',
      reasons,
      limits,
      derivedBoundary: mergeBoundary(boundary),
    };
  }

  if (!supportsClaimKind(claim, kinds)) {
    reasons.push('the available witness kinds do not support this claim kind');
    return {
      admissibility: 'reject',
      status: claim.kind === 'descriptive' ? 'unsupported' : 'incomplete',
      relevance: relevance ?? 'orthogonal',
      reasons,
      limits,
      derivedBoundary: mergeBoundary(boundary),
    };
  }

  if (!check) {
    if (claim.kind === 'descriptive') {
      reasons.push('descriptive claim is supported by bounded witness presence');
      limits.push('no check artifact was provided');
      return {
        admissibility: 'admit',
        status: 'witnessed',
        reasons,
        limits,
        derivedBoundary: mergeBoundary(boundary),
      };
    }

    reasons.push('a check artifact is still required for this claim kind');
    return {
      admissibility: 'pending',
      status: 'pending_check',
      relevance: relevance ?? 'candidate_relevance',
      reasons,
      limits,
      derivedBoundary: mergeBoundary(boundary),
    };
  }

  if (check.result === 'pending' || check.result === undefined) {
    reasons.push('check artifact exists but has not completed');
    return {
      admissibility: 'pending',
      status: 'pending_check',
      relevance: relevance ?? 'candidate_relevance',
      reasons,
      limits,
      derivedBoundary: mergeBoundary(boundary),
    };
  }

  if (check.result === 'fail') {
    reasons.push('the provided check failed to support the claim inside the boundary');
    limits.push('failed(K) does not imply checked(not K)');
    return {
      admissibility: 'reject',
      status: 'failed',
      relevance,
      reasons,
      limits,
      derivedBoundary: mergeBoundary(boundary),
    };
  }

  reasons.push('the provided witness and check support the bounded candidate claim');
  if (claim.kind !== 'descriptive') {
    limits.push('support is bounded to the stated claim boundary');
  }

  return {
    admissibility: 'admit',
    status: 'checked',
    relevance,
    reasons,
    limits,
    derivedBoundary: mergeBoundary(boundary),
  };
}
