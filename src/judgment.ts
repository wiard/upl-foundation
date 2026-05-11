export type Status =
  | 'unsupported'
  | 'observed'
  | 'witnessed'
  | 'pending_check'
  | 'checked'
  | 'failed'
  | 'disputed'
  | 'incomplete'
  | 'out_of_boundary';

export type RelevanceStatus =
  | 'candidate_relevance'
  | 'directly_claim_bearing'
  | 'incomplete_relevance'
  | 'orthogonal'
  | 'out_of_boundary';

export type Domain =
  | 'execution'
  | 'proof'
  | 'semantic'
  | 'bridge';

export type WitnessKind =
  | 'trace'
  | 'mapping'
  | 'contract'
  | 'check'
  | 'baseline'
  | 'counterfactual'
  | 'effect_check';

export type ClaimKind =
  | 'descriptive'
  | 'relevance'
  | 'semantic_output'
  | 'effect';

export type Boundary = {
  id: string;
  domain: Domain;
  includes: string[];
  excludes: string[];
};

export type Claim = {
  id: string;
  domain: Domain;
  kind: ClaimKind;
  text: string;
};

export type Witness = {
  id: string;
  domain: Domain;
  kind: WitnessKind;
  source: string;
  boundary: Boundary;
  artifactRef?: string;
  hash?: string;
};

export type Check = {
  id: string;
  method:
    | 'replay'
    | 'kernel_check'
    | 'mapping_check'
    | 'comparison'
    | 'effect_check';
  artifactRef: string;
  result?: 'pass' | 'fail' | 'pending';
};

// Candidate judgment.
// This is submitted to UPL for adjudication.
// It is not itself the decision.
export type UPLJudgment = {
  gamma: string[];
  claim: Claim;
  boundary: Boundary;
  witnesses: Witness[];
  check?: Check;

  // Submitter metadata only.
  // The adjudicator must not trust this as evidence.
  assertedStatus?: Status;
};

// Adjudicator output.
// This is what UPL produces.
export type UPLDecision = {
  admissibility: 'admit' | 'reject' | 'pending';
  status: Status;
  relevance?: RelevanceStatus;
  reasons: string[];
  limits: string[];
  derivedBoundary?: Boundary;
};
