export interface MoscaInput {
  /** Years the organization needs to fully deploy PQC. Maps to Mosca's Y. */
  migrationYears: number;
  /** Years the data must remain secret (security shelf life). Maps to Mosca's X. */
  sensitivityYears: number;
  /** Years until a cryptographically relevant quantum computer. Mosca's Z. */
  qDayYears: number;
}

export interface MoscaResult {
  /** X = security shelf life (years data must stay secret). */
  X: number;
  /** Y = migration time (years to deploy PQC). */
  Y: number;
  /** Z = collapse time (years until Q-Day). */
  Z: number;
  XplusY: number;
  atRisk: boolean;
  riskMargin: number;
  riskLevel: 'critical' | 'high' | 'moderate' | 'low' | 'safe';
  explanation: string;
  dataExposureYear: number;
  /** Latest start for completing migration by the assumed arrival year. */
  migrationDeadline: number;
  /** Latest start allowing the last classically protected record to finish its shelf life by arrival. */
  shelfLifeStartYear: number;
  recordYearsRemaining: number;
}

export const SECTOR_PRESETS: Record<
  string,
  {
    label: string;
    migrationYears: number;
    sensitivityYears: number;
    description: string;
    examples: string[];
  }
> = {
  government: {
    label: 'Government / Classified',
    migrationYears: 10,
    sensitivityYears: 30,
    description: 'Classified communications, diplomatic cables, intelligence',
    examples: ['NSA intercepts', 'State Dept cables', 'Military comms'],
  },
  healthcare: {
    label: 'Healthcare',
    migrationYears: 7,
    sensitivityYears: 50,
    description: 'Patient records, genetic data, clinical research',
    examples: ['EHR records', 'Genomic sequences', 'Insurance data'],
  },
  finance: {
    label: 'Financial Services',
    migrationYears: 5,
    sensitivityYears: 20,
    description: 'Trading strategies, M&A plans, regulatory filings',
    examples: ['SWIFT messages', 'Algorithmic trading', 'M&A negotiations'],
  },
  legal: {
    label: 'Legal / Law Firms',
    migrationYears: 5,
    sensitivityYears: 40,
    description: 'Attorney-client privilege, litigation strategy',
    examples: ['Privileged emails', 'Case strategy', 'Client communications'],
  },
  library: {
    label: 'Public Library',
    migrationYears: 4,
    sensitivityYears: 30,
    description: 'Patron privacy, reading records, registration data',
    examples: ['Patron records', 'ILS API traffic', 'Registration PII'],
  },
  enterprise: {
    label: 'Enterprise / Corporate',
    migrationYears: 5,
    sensitivityYears: 10,
    description: 'IP, trade secrets, product roadmaps',
    examples: ['R&D communications', 'Product plans', 'HR records'],
  },
  personal: {
    label: 'Personal',
    migrationYears: 1,
    sensitivityYears: 10,
    description: 'Personal emails, financial accounts, health records',
    examples: ['Gmail', 'Online banking', 'Health portals'],
  },
};

function toRiskLevel(riskMargin: number): MoscaResult['riskLevel'] {
  if (riskMargin > 20) {
    return 'critical';
  }
  if (riskMargin > 10) {
    return 'high';
  }
  if (riskMargin > 0) {
    return 'moderate';
  }
  if (riskMargin > -5) {
    return 'low';
  }
  return 'safe';
}

function buildExplanation(riskMargin: number, XplusY: number, Z: number): string {
  if (riskMargin > 0) {
    return `At risk in this model. X + Y = ${XplusY} exceeds Z = ${Z}. Starting now is ${riskMargin} year(s) late for the full shelf-life window.`;
  }
  if (riskMargin === 0) {
    return `X + Y = Z = ${Z}. Starting now meets the shelf-life boundary with no spare time.`;
  }
  return `X + Y = ${XplusY} is below Z = ${Z}. Starting now leaves ${-riskMargin} year(s) of planning buffer.`;
}

export function computeMosca(input: MoscaInput, currentYear: number): MoscaResult {
  // Canonical Mosca convention (matches the sibling harvest-timeline lab):
  //   X = security shelf life (years the data must stay secret)
  //   Y = migration time (years to deploy PQC)
  //   Z = collapse time  (years until a cryptographically relevant quantum computer)
  const X = input.sensitivityYears;
  const Y = input.migrationYears;
  const Z = input.qDayYears;

  const XplusY = X + Y;
  const riskMargin = XplusY - Z;
  const atRisk = riskMargin > 0;

  return {
    X,
    Y,
    Z,
    XplusY,
    atRisk,
    riskMargin,
    riskLevel: toRiskLevel(riskMargin),
    explanation: buildExplanation(riskMargin, XplusY, Z),
    dataExposureYear: currentYear + Z,
    // Latest year migration can START and still finish (it takes Y years) before Q-Day.
    migrationDeadline: currentYear + Z - Y,
    shelfLifeStartYear: currentYear + Z - XplusY,
    recordYearsRemaining: Math.max(0, X - Z),
  };
}
