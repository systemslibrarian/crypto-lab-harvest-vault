import { describe, expect, it } from 'vitest';
import {
  RLWE_KEYSPACE_LOG10,
  RLWE_N,
  RLWE_Q,
  decodeMessage,
  encodeMessage,
  kemDecapsulate,
  kemEncapsulate,
  kemKeyGen,
  polyMul,
  samplePolyNoise,
  samplePolyUniform,
} from './lattice';

function poly(values: Record<number, number>): Int16Array {
  const out = new Int16Array(RLWE_N);
  for (const [index, value] of Object.entries(values)) out[Number(index)] = value;
  return out;
}

describe('ring arithmetic', () => {
  it('is negacyclic: x^(n-1) * x = -1', () => {
    // (x^255)(x) wraps past degree 256, so the constant term must be q - 1.
    const product = polyMul(poly({ 255: 1 }), poly({ 1: 1 }));
    expect(product[0]).toBe(RLWE_Q - 1);
    for (let i = 1; i < RLWE_N; i += 1) expect(product[i]).toBe(0);
  });

  it('multiplies by 1 as identity', () => {
    const a = samplePolyUniform();
    const product = polyMul(a, poly({ 0: 1 }));
    expect(Array.from(product)).toEqual(Array.from(a));
  });

  it('keeps every coefficient inside Z_q', () => {
    const product = polyMul(samplePolyUniform(), samplePolyUniform());
    for (const c of product) {
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThan(RLWE_Q);
    }
  });
});

describe('samplers', () => {
  it('draws noise inside the centered binomial range for eta = 2', () => {
    const noise = samplePolyNoise();
    expect(noise).toHaveLength(RLWE_N);
    for (const c of noise) {
      expect(c).toBeGreaterThanOrEqual(-2);
      expect(c).toBeLessThanOrEqual(2);
    }
  });

  it('draws uniform coefficients that are not all identical', () => {
    const uniform = samplePolyUniform();
    expect(new Set(Array.from(uniform)).size).toBeGreaterThan(50);
  });
});

describe('message encoding', () => {
  it('round-trips 32 bytes through coefficient encoding', () => {
    const bytes = crypto.getRandomValues(new Uint8Array(RLWE_N / 8));
    expect(Array.from(decodeMessage(encodeMessage(bytes)))).toEqual(Array.from(bytes));
  });
});

describe('Ring-LWE KEM', () => {
  it('agrees on the same 32-byte secret across many independent runs', () => {
    for (let run = 0; run < 25; run += 1) {
      const kem = kemKeyGen();
      const encapsulated = kemEncapsulate(kem.publicKey);
      const decapsulated = kemDecapsulate(kem.secretKey, encapsulated.ciphertext);
      expect(Array.from(decapsulated)).toEqual(Array.from(encapsulated.sharedSecret));
    }
  });

  it('produces a different secret every encapsulation', () => {
    const kem = kemKeyGen();
    const first = kemEncapsulate(kem.publicKey).sharedSecret;
    const second = kemEncapsulate(kem.publicKey).sharedSecret;
    expect(Array.from(first)).not.toEqual(Array.from(second));
  });

  it('yields nothing usable to a holder of the wrong secret key', () => {
    const kem = kemKeyGen();
    const stranger = kemKeyGen();
    const encapsulated = kemEncapsulate(kem.publicKey);
    const wrong = kemDecapsulate(stranger.secretKey, encapsulated.ciphertext);
    expect(Array.from(wrong)).not.toEqual(Array.from(encapsulated.sharedSecret));
  });

  it('hides the secret key: b alone is not a*s', () => {
    // If the noise were dropped, b would equal a*s exactly and the secret would
    // fall out by division. The noise term is the entire security argument.
    const kem = kemKeyGen();
    const noiseless = polyMul(kem.publicKey.a, kem.secretKey);
    expect(Array.from(kem.publicKey.b)).not.toEqual(Array.from(noiseless));
  });

  it('reports a key space the page can quote honestly', () => {
    // (2*eta + 1)^n = 5^256, i.e. ~10^179 candidate secret polynomials.
    expect(Math.round(RLWE_KEYSPACE_LOG10)).toBe(179);
  });
});
