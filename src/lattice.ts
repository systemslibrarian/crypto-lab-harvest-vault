/**
 * A real — but deliberately tiny — Ring-LWE key encapsulation mechanism.
 *
 * WHY THIS EXISTS
 * The page's whole argument is "a PQC upgrade cannot reach backwards". Arguing
 * that in prose is cheap. To *show* it, the page has to actually run two
 * handshakes: one whose hard problem the demo's attacker can solve, and one
 * whose hard problem it cannot. This module is the second one.
 *
 * SCALE, STATED PLAINLY
 * n = 256, q = 3329 in Z_q[x]/(x^n + 1) with centered-binomial noise (eta = 2).
 * Those are Kyber-shaped numbers, and the mechanism below is the mechanism
 * ML-KEM (FIPS 203) is built from — but this is NOT ML-KEM. It is IND-CPA only
 * (no Fujisaki-Okamoto transform, so no CCA security), it is schoolbook rather
 * than NTT, it is not constant time, and it has had no review. It is a teaching
 * artifact. Do not use it for anything.
 *
 * What it *is* honest about: the secret really is hidden by Ring-LWE, so the
 * discrete-log break the page performs on the classical leg genuinely does not
 * recover it. The failed decryption the page reports is a real failure.
 */

export const RLWE_N = 256;
export const RLWE_Q = 3329;
export const RLWE_ETA = 2;

/** Number of distinct secret-key polynomials: (2*eta + 1)^n. Reported as log10. */
export const RLWE_KEYSPACE_LOG10 = Math.log10(2 * RLWE_ETA + 1) * RLWE_N;

export type RandBytes = (n: number) => Uint8Array;

export const defaultRandBytes: RandBytes = (n) => crypto.getRandomValues(new Uint8Array(n));

export type Poly = Int16Array;

export interface KemPublicKey {
  /** Public ring element, shared by both parties. */
  a: Poly;
  /** b = a*s + e — the secret hidden under noise. */
  b: Poly;
}

export interface KemCiphertext {
  u: Poly;
  v: Poly;
}

export interface KemKeyPair {
  publicKey: KemPublicKey;
  /** Never appears in a transcript. Recovering it from (a, b) is Ring-LWE. */
  secretKey: Poly;
}

/** A tiny buffered reader so samplers can pull bytes without re-entering the RNG. */
function byteStream(rand: RandBytes): () => number {
  let buf = rand(256);
  let i = 0;
  return () => {
    if (i >= buf.length) {
      buf = rand(256);
      i = 0;
    }
    return buf[i++];
  };
}

/** Uniform poly over Z_q by 12-bit rejection sampling — the standard approach. */
export function samplePolyUniform(rand: RandBytes = defaultRandBytes): Poly {
  const next = byteStream(rand);
  const out = new Int16Array(RLWE_N);
  for (let i = 0; i < RLWE_N; i += 1) {
    let candidate = RLWE_Q;
    while (candidate >= RLWE_Q) {
      candidate = (next() | (next() << 8)) & 0x0fff;
    }
    out[i] = candidate;
  }
  return out;
}

const POPCOUNT4 = [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4];

/**
 * Centered binomial with eta = 2: popcount(2 bits) - popcount(2 bits), giving
 * values in [-2, 2]. One byte yields two coefficients.
 */
export function samplePolyNoise(rand: RandBytes = defaultRandBytes): Poly {
  const next = byteStream(rand);
  const out = new Int16Array(RLWE_N);
  for (let i = 0; i < RLWE_N; i += 2) {
    const byte = next();
    out[i] = POPCOUNT4[byte & 0x3] - POPCOUNT4[(byte >> 2) & 0x3];
    out[i + 1] = POPCOUNT4[(byte >> 4) & 0x3] - POPCOUNT4[(byte >> 6) & 0x3];
  }
  return out;
}

function reduce(value: number): number {
  const r = value % RLWE_Q;
  return r < 0 ? r + RLWE_Q : r;
}

export function polyAdd(x: Poly, y: Poly): Poly {
  const out = new Int16Array(RLWE_N);
  for (let i = 0; i < RLWE_N; i += 1) out[i] = reduce(x[i] + y[i]);
  return out;
}

export function polySub(x: Poly, y: Poly): Poly {
  const out = new Int16Array(RLWE_N);
  for (let i = 0; i < RLWE_N; i += 1) out[i] = reduce(x[i] - y[i]);
  return out;
}

/**
 * Schoolbook multiplication in Z_q[x]/(x^n + 1): wrapping past degree n negates,
 * which is what makes the ring negacyclic. Accumulated in float64 (max partial
 * sum ~2.8e9, well inside 2^53) and reduced once at the end.
 */
export function polyMul(x: Poly, y: Poly): Poly {
  const acc = new Float64Array(RLWE_N);
  for (let i = 0; i < RLWE_N; i += 1) {
    const xi = x[i];
    if (xi === 0) continue;
    for (let j = 0; j < RLWE_N; j += 1) {
      const k = i + j;
      if (k < RLWE_N) acc[k] += xi * y[j];
      else acc[k - RLWE_N] -= xi * y[j];
    }
  }
  const out = new Int16Array(RLWE_N);
  for (let i = 0; i < RLWE_N; i += 1) out[i] = reduce(acc[i]);
  return out;
}

/** 32 bytes -> 256 coefficients, each 0 or floor(q/2). */
export function encodeMessage(bytes: Uint8Array): Poly {
  const out = new Int16Array(RLWE_N);
  const half = Math.floor(RLWE_Q / 2);
  for (let i = 0; i < RLWE_N; i += 1) {
    const bit = (bytes[i >> 3] >> (i & 7)) & 1;
    out[i] = bit * half;
  }
  return out;
}

/** Inverse of encodeMessage: a coefficient nearer q/2 than 0 decodes to a 1 bit. */
export function decodeMessage(poly: Poly): Uint8Array {
  const out = new Uint8Array(RLWE_N / 8);
  const lo = RLWE_Q / 4;
  const hi = (3 * RLWE_Q) / 4;
  for (let i = 0; i < RLWE_N; i += 1) {
    const c = poly[i];
    if (c > lo && c < hi) out[i >> 3] |= 1 << (i & 7);
  }
  return out;
}

export function kemKeyGen(rand: RandBytes = defaultRandBytes): KemKeyPair {
  const a = samplePolyUniform(rand);
  const s = samplePolyNoise(rand);
  const e = samplePolyNoise(rand);
  const b = polyAdd(polyMul(a, s), e);
  return { publicKey: { a, b }, secretKey: s };
}

export interface KemEncapsulation {
  ciphertext: KemCiphertext;
  /** 32 bytes of shared secret. Fed into the session KDF, never sent. */
  sharedSecret: Uint8Array;
}

export function kemEncapsulate(
  publicKey: KemPublicKey,
  rand: RandBytes = defaultRandBytes,
): KemEncapsulation {
  const m = rand(RLWE_N / 8);
  const r = samplePolyNoise(rand);
  const e1 = samplePolyNoise(rand);
  const e2 = samplePolyNoise(rand);
  const u = polyAdd(polyMul(publicKey.a, r), e1);
  const v = polyAdd(polyAdd(polyMul(publicKey.b, r), e2), encodeMessage(m));
  return { ciphertext: { u, v }, sharedSecret: m };
}

export function kemDecapsulate(secretKey: Poly, ciphertext: KemCiphertext): Uint8Array {
  return decodeMessage(polySub(ciphertext.v, polyMul(secretKey, ciphertext.u)));
}
