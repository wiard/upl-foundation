import { adjudicate } from './adjudicate';
import { descriptiveExecClaim } from './fixtures/descriptive-exec-claim';

const decision = adjudicate(descriptiveExecClaim);

console.log(
  JSON.stringify(
    {
      fixture: descriptiveExecClaim.claim.id,
      judgment: descriptiveExecClaim,
      decision,
    },
    null,
    2,
  ),
);

process.exit(decision.admissibility === 'admit' ? 0 : 1);
