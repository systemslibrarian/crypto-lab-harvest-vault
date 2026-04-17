export interface TimelineEvent {
  year: number;
  label: string;
  description: string;
  category: 'harvest' | 'quantum-progress' | 'standard' | 'qday-estimate' | 'migration';
  source?: string;
}

export const TIMELINE_EVENTS: TimelineEvent[] = [
  {
    year: 2013,
    label: 'Snowden revelations',
    category: 'harvest',
    description:
      'NSA mass collection of encrypted internet traffic confirmed. PRISM, XKeyscore, upstream collection. HNDL strategy confirmed by disclosed documents.',
  },
  {
    year: 2015,
    label: "Mosca's Theorem published",
    category: 'standard',
    description:
      'Michele Mosca formalizes X+Y>Z risk condition. Provides first mathematical framework for HNDL urgency.',
  },
  {
    year: 2016,
    label: 'NIST PQC process begins',
    category: 'standard',
    description:
      'NIST initiates post-quantum cryptography standardization. 82 initial submissions from global researchers.',
  },
  {
    year: 2022,
    label: 'NSA CNSA 2.0 mandated',
    category: 'migration',
    description:
      'NSA mandates transition to post-quantum algorithms for all national security systems. New systems: PQC required immediately.',
  },
  {
    year: 2024,
    label: 'NIST FIPS 203/204/205 finalized',
    category: 'standard',
    description:
      'ML-KEM, ML-DSA, SLH-DSA standardized. First PQC standards available for deployment.',
  },
  {
    year: 2025,
    label: 'Gidney: RSA-2048 under 1M qubits',
    category: 'quantum-progress',
    description:
      'Google researcher Craig Gidney reduces RSA-2048 breaking estimate from 20M to <1M physical qubits. Timeline compressed.',
  },
  {
    year: 2026,
    label: 'Google: ECC P-256 under 500K qubits',
    category: 'quantum-progress',
    description:
      'Google whitepaper estimates ECC P-256 (secp256k1) vulnerable with <500K physical qubits. Blockchain and TLS implications severe.',
  },
  {
    year: 2026,
    label: 'Oratomic: RSA-2048 under 100K qubits',
    category: 'quantum-progress',
    description:
      'Neutral atom architecture estimates RSA-2048 breaking possible with ~100K qubits. Actual circuits not published. Most aggressive estimate to date.',
  },
  {
    year: 2026,
    label: 'YOU ARE HERE — data encrypted today',
    category: 'harvest',
    description:
      'Every RSA/ECC-encrypted communication sent today is potentially stored by state-level adversaries. The harvest is ongoing.',
  },
  {
    year: 2027,
    label: 'NSA CNSA 2.0 deadline: new systems',
    category: 'migration',
    description:
      'All new NSA/DoD systems must use PQC. Legacy systems migration underway.',
  },
  {
    year: 2029,
    label: 'Cloudflare full PQC target',
    category: 'migration',
    description:
      'Cloudflare targets full post-quantum security including authentication for all products.',
  },
  {
    year: 2030,
    label: 'Q-Day consensus estimate (center)',
    category: 'qday-estimate',
    description:
      'Most estimates center on 2030±3 years for cryptographically relevant quantum computers. Not a hard date — a probability distribution.',
  },
  {
    year: 2033,
    label: 'Q-Day conservative estimate',
    category: 'qday-estimate',
    description:
      'Academic consensus: 2030–2035 for RSA-2048 breaking. ETSI and government planning timelines use mid-2030s as backstop.',
  },
  {
    year: 2035,
    label: 'NSA CNSA 2.0 full transition deadline',
    category: 'migration',
    description:
      'All NSA national security systems must be fully PQC-migrated. Data encrypted before 2035 under classical crypto may be retroactively compromised.',
  },
];
