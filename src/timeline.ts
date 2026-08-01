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
      'NSA announces the CNSA 2.0 suite and a phased transition timeline for national security systems — not an immediate cutover: software/firmware signing starts first, with new NSS acquisitions expected to be CNSA 2.0-compliant from January 1, 2027.',
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
      'Google researcher Craig Gidney reduces the RSA-2048 breaking estimate from ~20M (2019) to under 1M physical qubits in under a week. A 20x drop in six years — the timeline is compressing, not holding.',
    source: 'Gidney, "How to factor 2048 bit RSA integers with less than a million noisy qubits," 2025 (arXiv 2505.15917).',
  },
  {
    year: 2026,
    label: 'Google: ECC-256 under 500K qubits',
    category: 'quantum-progress',
    description:
      'Google Quantum AI (Babbush et al., March 2026) estimates a 256-bit elliptic curve discrete log breakable with ~500K physical qubits — down from ~9M (Litinski 2023). Demonstrated on secp256k1 (Bitcoin); NIST P-256 is comparable. Blockchain and TLS implications severe.',
    source: 'Google Quantum AI resource-estimate whitepaper, 2026 (arXiv 2603.28846).',
  },
  {
    year: 2026,
    label: 'Oratomic: RSA-2048 under 100K qubits',
    category: 'quantum-progress',
    description:
      'Neutral-atom architecture (Oratomic, co-founded by Caltech\'s Manuel Endres) estimates RSA-2048 in ~97 days with ~100K qubits, or as few as 10K qubits given years of runtime. Today\'s largest neutral-atom array is ~6,100 qubits — the gap is engineering, not physics.',
    source: 'Oratomic resource-estimate paper, 2026 (arXiv 2603.28627).',
  },
  {
    year: 2026,
    label: 'YOU ARE HERE — data encrypted today',
    category: 'harvest',
    description:
      'Every RSA/ECC-encrypted communication sent today is potentially stored by state-level adversaries. The harvest is ongoing.',
  },
  {
    year: 2026,
    label: 'US quantum-security executive orders',
    category: 'migration',
    description:
      'June 2026: two executive orders ("Securing the Nation Against Advanced Cryptographic Attacks" and a quantum-innovation order) direct federal agencies to inventory cryptography and migrate critical systems to PQC, and direct the FAR Council to require contractor compliance with NIST standards.',
    source: 'The White House, Presidential Actions, June 22, 2026 (whitehouse.gov).',
  },
  {
    year: 2027,
    label: 'NSA CNSA 2.0 deadline: new systems',
    category: 'migration',
    description:
      'From January 1, 2027 the NSA expects new national-security-system deployments to comply with CNSA 2.0 (ML-KEM-1024, ML-DSA-87, AES-256, SHA-384/512).',
    source: 'NSA, Post-Quantum Cybersecurity Resources / CNSA 2.0 (nsa.gov).',
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
    year: 2031,
    label: 'US federal PQC migration deadline',
    category: 'migration',
    description:
      'The June 2026 executive order directs agencies to migrate their most critical systems to quantum-resistant key establishment by Dec 31, 2030 and digital signatures by Dec 31, 2031. Mosca\'s 2015 paper independently put a ~1/2 chance of RSA-2048 falling by 2031.',
    source: 'White House EO (June 2026); Mosca, IACR ePrint 2015/1075.',
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
