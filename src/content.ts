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
