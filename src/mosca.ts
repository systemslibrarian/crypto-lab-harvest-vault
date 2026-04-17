export interface MoscaInput {
  migrationYears: number;
  sensitivityYears: number;
  qDayYears: number;
}

export interface MoscaResult {
  X: number;
  Y: number;
  Z: number;
  XplusY: number;
  atRisk: boolean;
  riskMargin: number;
  riskLevel: 'critical' | 'high' | 'moderate' | 'low' | 'safe';
  explanation: string;
  dataExposureYear: number;
  migrationDeadline: number;
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

function buildExplanation(
  atRisk: boolean,
  riskMargin: number,
  XplusY: number,
  Z: number,
): string {
  if (atRisk) {
    return `At risk: X + Y = ${XplusY} is greater than Z = ${Z}. Data encrypted today is likely still sensitive ${riskMargin} year(s) after Q-Day.`;
  }

  const yearsBuffer = Math.abs(riskMargin);
  if (yearsBuffer <= 5) {
    return `Low buffer: X + Y = ${XplusY} is only ${yearsBuffer} year(s) below Z = ${Z}. Any delay could move this into at-risk territory.`;
  }

  return `Currently safer: X + Y = ${XplusY} is ${yearsBuffer} year(s) below Z = ${Z}, giving more migration buffer.`;
}

export function computeMosca(input: MoscaInput, currentYear: number): MoscaResult {
  const X = input.migrationYears;
  const Y = input.sensitivityYears;
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
    explanation: buildExplanation(atRisk, riskMargin, XplusY, Z),
    dataExposureYear: currentYear + Z,
    migrationDeadline: currentYear + (Z - Y),
  };
}
