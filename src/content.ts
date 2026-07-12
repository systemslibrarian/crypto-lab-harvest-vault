// Static teaching content for the HNDL visualizer, kept out of main.ts so the
// render/state logic there stays readable. Every factual claim carries a
// confidence label and, where possible, a primary source.

export type Confidence = 'confirmed' | 'standardized' | 'estimate' | 'illustrative' | 'recommendation';

export const CONFIDENCE_LABEL: Record<Confidence, string> = {
  confirmed: 'Confirmed',
  standardized: 'Standardized',
  estimate: 'Estimate',
  illustrative: 'Illustrative',
  recommendation: 'Recommendation',
};

export const CONFIDENCE_BLURB: Record<Confidence, string> = {
  confirmed: 'Documented, present-day fact.',
  standardized: 'Published standard or official mandate.',
  estimate: 'Forecast or resource estimate — a range, not a date.',
  illustrative: 'Order-of-magnitude figure for scale, not a measurement.',
  recommendation: 'Guidance / good practice, not a claim of fact.',
};

export interface SourceItem {
  claim: string;
  confidence: Confidence;
  detail: string;
  source: string;
  url?: string;
}

export const SOURCES: SourceItem[] = [
  {
    claim: 'Encrypted traffic is being collected at scale, today.',
    confidence: 'confirmed',
    detail:
      'The 2013 Snowden disclosures documented bulk collection and upstream interception of encrypted Internet traffic (PRISM, XKeyscore, upstream programs). Harvesting does not require breaking the crypto first.',
    source: 'EFF — NSA Spying overview',
    url: 'https://www.eff.org/nsa-spying',
  },
  {
    claim: 'Post-quantum algorithms exist and are standardized.',
    confidence: 'standardized',
    detail:
      'NIST finalized ML-KEM (FIPS 203, key establishment), ML-DSA (FIPS 204, signatures), and SLH-DSA (FIPS 205) in 2024. These are deployable today.',
    source: 'NIST Post-Quantum Cryptography project',
    url: 'https://csrc.nist.gov/projects/post-quantum-cryptography',
  },
  {
    claim: "Mosca's theorem (X + Y > Z) frames the urgency.",
    confidence: 'standardized',
    detail:
      'Michele Mosca formalized the risk condition and estimated roughly a 1-in-2 chance of RSA-2048 falling by 2031.',
    source: 'Mosca, "Cybersecurity in an era with quantum computers" (IACR ePrint 2015/1075)',
    url: 'https://eprint.iacr.org/2015/1075',
  },
  {
    claim: 'Governments have set hard PQC migration deadlines.',
    confidence: 'confirmed',
    detail:
      'NSA CNSA 2.0 expects new national-security systems to comply from 2027 and full transition by 2035. June 2026 US executive orders direct federal agencies to migrate critical systems to PQC key establishment by 2030 and signatures by 2031.',
    source: 'NSA CNSA 2.0; White House Presidential Actions (June 22, 2026)',
    url: 'https://www.whitehouse.gov/presidential-actions/2026/06/securing-the-nation-against-advanced-cryptographic-attacks/',
  },
  {
    claim: 'Quantum resource estimates are falling fast.',
    confidence: 'estimate',
    detail:
      'Gidney 2025: RSA-2048 with under 1M qubits (down from ~20M in 2019). Google 2026: a 256-bit elliptic-curve discrete log with ~500K qubits. Oratomic 2026: RSA-2048 in ~97 days with ~100K qubits. These are circuit/resource estimates, not working machines.',
    source: 'arXiv 2505.15917 (Gidney); 2603.28846 (Google); 2603.28627 (Oratomic)',
    url: 'https://arxiv.org/abs/2505.15917',
  },
  {
    claim: 'Q-Day timing is genuinely uncertain.',
    confidence: 'estimate',
    detail:
      'Expert surveys center near 2030 ±3 years with a long tail. Treat Q-Day as a probability distribution (credible range ~2028–2035+), not a fixed date — which is exactly why X + Y > Z is robust to the uncertainty.',
    source: 'Global Risk Institute, Quantum Threat Timeline reports',
    url: 'https://globalriskinstitute.org/publication/quantum-computing-cybersecurity/',
  },
  {
    claim: 'Major providers are already migrating.',
    confidence: 'confirmed',
    detail:
      'Cloudflare deploys hybrid X25519+ML-KEM key exchange and ML-DSA authentication, and (after the 2025–2026 estimate papers) moved its target for full post-quantum security, including authentication, to 2029. Chrome and Signal ship hybrid key exchange.',
    source: 'Cloudflare — post-quantum roadmap',
    url: 'https://blog.cloudflare.com/post-quantum-roadmap/',
  },
  {
    claim: 'The TB/second storage counter is illustrative.',
    confidence: 'illustrative',
    detail:
      'The live counter (~23 TB/s of RSA/ECC traffic) is an order-of-magnitude figure derived from public traffic estimates (~5 EB/day, ~40% HTTPS). It conveys scale; it is not a measurement of any specific actor.',
    source: 'Educational estimate (see footnote on the counter)',
  },
];

export interface ThreatRow {
  label: string;
  body: string;
}

export const THREAT_MODEL: ThreatRow[] = [
  {
    label: 'Attacker capability (now)',
    body: 'Records and stores encrypted traffic today — fiber taps, BGP influence, compromised infrastructure. No code-breaking required to harvest.',
  },
  {
    label: 'Target',
    body: 'The public-key handshake / key establishment — RSA, finite-field and elliptic-curve Diffie–Hellman (DH/ECDH), and signatures (ECDSA). Not the bulk cipher.',
  },
  {
    label: 'Future capability (Q-Day)',
    body: 'A cryptographically relevant quantum computer running Shor’s algorithm against the captured handshake transcript.',
  },
  {
    label: 'Result',
    body: 'Recovered session keys decrypt the stored ciphertext retroactively; recovered signing keys allow forgery going forward — depending on protocol and context.',
  },
  {
    label: 'Non-goal (what this does NOT claim)',
    body: 'It does not claim AES-256, SHA-2/3, or every encrypted database is broken. Symmetric crypto is only weakened (Grover), not collapsed.',
  },
];

// Why each sector sits where it does on the risk matrix.
export const SECTOR_RATIONALE: Record<string, string> = {
  government:
    'High sensitivity (decades) plus slow migration (legacy systems, certification, coalition interop) puts it deep in the danger zone.',
  healthcare:
    'Genomic and EHR data stay sensitive 50–80+ years while clinical ecosystems migrate slowly — the worst combination of long Y and large X.',
  finance:
    'Shorter sensitivity than health, but deal flow and strategy data plus fast-but-not-instant migration still cross the line.',
  legal:
    'Attorney–client privilege is effectively indefinite, so even moderate migration time keeps it firmly at risk.',
  library:
    'Patron-privacy obligations are long-lived and IT is under-resourced — a soft target with statutory duties.',
  enterprise:
    'Lower sensitivity (~10 years) and faster migration make it the closest to safe, but roadmaps still outlast an optimistic Z.',
  personal:
    'You can switch providers quickly (small Y), but financial and health records keep multi-year sensitivity (large X).',
};

export interface ZScenario {
  label: string;
  year: number;
  note: string;
}

// Teaching uncertainty: the lesson is surviving the range, not guessing the date.
export const Z_SCENARIOS: ZScenario[] = [
  { label: 'Aggressive', year: 2028, note: 'optimistic researcher estimates' },
  { label: 'Center', year: 2030, note: 'consensus center, ~±3 years' },
  { label: 'Conservative', year: 2035, note: 'government planning backstop' },
];

export interface Misconception {
  myth: string;
  reality: string;
}

export const MISCONCEPTIONS: Misconception[] = [
  {
    myth: '“We use AES-256, so we’re safe.”',
    reality:
      'Mostly wrong for HNDL. AES-256 is fine — but the AES session key is delivered by an RSA/ECC handshake that Shor breaks. Recover the handshake, recover the key, read the session.',
  },
  {
    myth: '“We can wait until quantum computers actually arrive.”',
    reality:
      'Wrong. The ciphertext is being collected now. Waiting means an adversary already holds years of your traffic before you even begin migrating.',
  },
  {
    myth: '“Migrating to PQC fixes our old traffic too.”',
    reality:
      'Wrong. PQC protects sessions from deployment onward. Anything captured before you migrated stays exposed — only forward secrecy deployed before collection, or never sending it, helps.',
  },
  {
    myth: '“This only matters if Q-Day is exactly 2030.”',
    reality:
      'Wrong. Mosca’s theorem works across the whole plausible range. If X + Y exceeds even the optimistic Z, you are exposed regardless of the exact date.',
  },
  {
    myth: '“This is only a government problem.”',
    reality:
      'Wrong. Healthcare, legal, finance, libraries, and research hold data that must stay secret for decades — far longer than the migration-plus-Q-Day window.',
  },
];

export interface GlossaryTerm {
  term: string;
  def: string;
}

export const GLOSSARY: GlossaryTerm[] = [
  { term: 'HNDL', def: 'Harvest Now, Decrypt Later — collecting encrypted data today to decrypt once quantum computers arrive.' },
  { term: 'Q-Day', def: 'The (uncertain) day a cryptographically relevant quantum computer can break RSA/ECC. A probability range, not a fixed date.' },
  { term: 'Mosca’s theorem', def: 'You have a problem when X (data sensitivity lifetime) + Y (migration time) exceeds Z (years until Q-Day).' },
  { term: 'PQC', def: 'Post-Quantum Cryptography — algorithms designed to resist quantum attacks (e.g. ML-KEM, ML-DSA).' },
  { term: 'PFS', def: 'Perfect Forward Secrecy — ephemeral per-session keys, so compromising a long-term key doesn’t expose past sessions.' },
  { term: 'ML-KEM (FIPS 203)', def: 'NIST-standardized post-quantum key-encapsulation mechanism (formerly Kyber).' },
  { term: 'ML-DSA (FIPS 204)', def: 'NIST-standardized post-quantum digital signature algorithm (formerly Dilithium).' },
  { term: 'Shor’s algorithm', def: 'Quantum algorithm that efficiently breaks RSA and elliptic-curve crypto — the engine behind HNDL.' },
  { term: 'Grover’s algorithm', def: 'Quantum search with only a quadratic speedup; it halves symmetric security, so AES-256 → ~128-bit (still safe).' },
  { term: 'RSA / ECC', def: 'Public-key systems used for key exchange and signatures; both broken by Shor.' },
  { term: 'ECDHE', def: 'Elliptic-Curve Diffie–Hellman Ephemeral — classical forward secrecy, but still quantum-vulnerable if the handshake is captured.' },
  { term: 'Hybrid key exchange', def: 'Running a classical (X25519) and post-quantum (ML-KEM) exchange together, so an attacker must defeat both.' },
];

export interface ActionPhase {
  timeframe: string;
  items: string[];
}

export const ACTION_PLAN: ActionPhase[] = [
  {
    timeframe: 'First 30 days',
    items: [
      'Inventory public-key cryptography: TLS, VPN, SSH, S/MIME, code signing, certificates, APIs, backups, vendor links.',
      'Identify your long-sensitivity data flows — the high-Y systems.',
      'Turn on TLS 1.3 and forward secrecy wherever it is missing.',
      'Ask your key vendors for their PQC roadmaps in writing.',
    ],
  },
  {
    timeframe: 'Next 90 days',
    items: [
      'Pilot hybrid key exchange (X25519 + ML-KEM) where your stack supports it.',
      'Update procurement requirements to demand PQC-readiness.',
      'Reduce retention of sensitive logs and archived communications.',
      'Name a migration owner and draft a timeline.',
    ],
  },
  {
    timeframe: 'Next 12 months',
    items: [
      'Prioritize high-sensitivity, high-retention systems first.',
      'Move new systems onto PQC-ready libraries and protocols.',
      'Track standards and browser/server support as it ships.',
      'Re-run the Mosca estimate quarterly and adjust.',
    ],
  },
];

export interface QuizQuestion {
  q: string;
  options: string[];
  correct: number;
  explain: string;
}

// Retrieval practice, not an exam — five questions covering the core lesson.
export const QUIZ: QuizQuestion[] = [
  {
    q: 'Data must stay secret for 20 years (X=20), migration takes 6 (Y=6), Q-Day is ~10 years out (Z=10). What does Mosca’s theorem say?',
    options: [
      'At risk — X + Y (26) is greater than Z (10)',
      'Safe — large quantum computers don’t exist yet',
      'Safe — they can just use AES-256',
      'At risk only if Q-Day turns out to be exactly 2030',
    ],
    correct: 0,
    explain: 'X + Y = 26 > Z = 10, so data encrypted during migration is still sensitive long after Q-Day. The theorem doesn’t depend on quantum computers existing today or on an exact date.',
  },
  {
    q: 'Which action protects future traffic but does NOTHING for data an adversary already captured?',
    options: [
      'Deploying PQC / hybrid key exchange today',
      'Having had forward secrecy in place before the data was collected',
      'Never transmitting the data in the first place',
      'All of these help already-captured data equally',
    ],
    correct: 0,
    explain: 'PQC deployed today protects new sessions only. Already-harvested ciphertext is beyond its reach — which is exactly why waiting is dangerous.',
  },
  {
    q: 'An adversary may already hold years of your ciphertext. Which could limit the damage of that ALREADY-harvested data?',
    options: [
      'Forward secrecy that existed before the data was collected',
      'Migrating to PQC next quarter',
      'Rotating the bulk cipher to AES-256 today',
      'Adding a new firewall rule',
    ],
    correct: 0,
    explain: 'Only protection present at collection time limits old exposure. Everything deployed now helps future traffic only — the core HNDL problem.',
  },
  {
    q: 'What is the MAIN target of the Harvest Now, Decrypt Later threat?',
    options: [
      'Public-key key exchange and signatures (RSA, ECC/ECDH, ECDSA)',
      'AES-256 symmetric encryption',
      'SHA-256 hashing',
      'Password length',
    ],
    correct: 0,
    explain: 'Shor breaks the public-key handshake. AES-256 and SHA-2 are only weakened by Grover and remain safe at doubled key sizes.',
  },
  {
    q: 'Two organizations both hold data with X=30, and Q-Day is ~10 years out. Org A finishes migration in 3 years; Org B takes 9. Who is better positioned?',
    options: [
      'Org A — smaller Y means it crosses the line by less and closes the window sooner',
      'Org B — taking longer to migrate is safer',
      'Identical — only Y matters',
      'Neither — AES-256 protects both',
    ],
    correct: 0,
    explain: 'Both are at risk (X + Y > Z), but Org A’s exposure past Q-Day is smaller (33 vs 39) and its window closes years earlier. Cutting migration time (Y) is a real lever.',
  },
];

export interface ProtocolExample {
  name: string;
  verdict: 'vulnerable' | 'partial' | 'strong' | 'different';
  verdictLabel: string;
  body: string;
}

export const PROTOCOL_EXAMPLES: ProtocolExample[] = [
  {
    name: 'TLS with classical RSA key exchange',
    verdict: 'vulnerable',
    verdictLabel: 'Most exposed',
    body: 'The session key is encrypted to the server’s RSA key inside the captured transcript. Recover that RSA key at Q-Day and every stored session decrypts. No forward secrecy.',
  },
  {
    name: 'TLS 1.3 with ECDHE (classical forward secrecy)',
    verdict: 'partial',
    verdictLabel: 'Still harvestable',
    body: 'ECDHE gives forward secrecy against future server key compromise, but the ephemeral key agreement is itself in the captured transcript. A quantum computer solving the elliptic-curve discrete log reconstructs the session key. PFS alone does not survive HNDL.',
  },
  {
    name: 'TLS 1.3 with hybrid X25519 + ML-KEM',
    verdict: 'strong',
    verdictLabel: 'Migration path',
    body: 'The attacker must defeat BOTH the classical (X25519) and post-quantum (ML-KEM) components of the same handshake. This is the practical defense for traffic sent from the day it is deployed onward.',
  },
  {
    name: 'Stored files encrypted with AES-256',
    verdict: 'different',
    verdictLabel: 'Different threat',
    body: 'This is not the HNDL handshake problem. AES-256 faces only Grover’s quadratic speedup (~128-bit effective security) and remains safe. The risk returns only if the AES key was itself wrapped by a quantum-vulnerable public-key scheme.',
  },
];
