/**
 * The mechanism exhibit: run a real key exchange, keep a real wiretap copy of it,
 * then let a real (toy-scale) break run against that copy.
 *
 * Everything here is computed. Nothing is narrated. The three moving parts:
 *
 *  1. A classical handshake whose hardness is a discrete log — at 24 bits, so the
 *     page's own attacker can actually solve it in the browser. This stands in for
 *     ECDH/RSA, whose discrete log / factoring falls to Shor at real sizes.
 *  2. A hybrid handshake that mixes that same discrete-log secret with a Ring-LWE
 *     KEM secret (see lattice.ts). The attacker still solves the discrete log — it
 *     just no longer has all the key material.
 *  3. An attacker that runs after the fact, over stored bytes only.
 *
 * The retroactivity claim then becomes a measurement rather than a sentence: the
 * captured bytes are fingerprinted at capture time, the learner upgrades, and the
 * attack at "Q-Day" reports the fingerprint unchanged and the plaintext recovered
 * byte-for-byte.
 */

import {
  kemDecapsulate,
  kemEncapsulate,
  kemKeyGen,
  type KemCiphertext,
  type KemPublicKey,
  type Poly,
} from './lattice';

/**
 * Toy Diffie-Hellman group. p is a 24-bit safe prime (p = 2q + 1) and g = 4
 * generates the order-q subgroup, so private exponents live in [1, q).
 *
 * SCALE, STATED PLAINLY: real DH uses 2048-bit or larger p (or a 256-bit elliptic
 * curve). 24 bits is roughly 10^610 times smaller than RSA-2048's key space, and
 * is chosen precisely so the exhaustive search below finishes while you watch.
 * The point is not that small groups are weak — everyone knows that. The point is
 * that once the search finishes, the *stored* ciphertext opens, however long ago
 * it was recorded.
 */
export const DH_P = 16776899;
export const DH_G = 4;
export const DH_ORDER = 8388449;

export type Mode = 'classical' | 'hybrid';

export function modPow(base: number, exponent: number, modulus: number): number {
  let result = 1;
  let b = base % modulus;
  let e = exponent;
  while (e > 0) {
    if (e & 1) result = (result * b) % modulus;
    b = (b * b) % modulus;
    e = Math.floor(e / 2);
  }
  return result;
}

export interface DhKeyPair {
  privateKey: number;
  publicKey: number;
}

export function dhKeyPair(
  rand: (n: number) => Uint8Array = (n) => crypto.getRandomValues(new Uint8Array(n)),
): DhKeyPair {
  const bytes = rand(4);
  const raw = ((bytes[0] << 24) | (bytes[1] << 16) | (bytes[2] << 8) | bytes[3]) >>> 0;
  const privateKey = (raw % (DH_ORDER - 2)) + 2;
  return { privateKey, publicKey: modPow(DH_G, privateKey, DH_P) };
}

export function dhShared(privateKey: number, peerPublicKey: number): number {
  return modPow(peerPublicKey, privateKey, DH_P);
}

function u32be(value: number): Uint8Array {
  const out = new Uint8Array(4);
  new DataView(out.buffer).setUint32(0, value >>> 0, false);
  return out;
}

function concatBytes(...parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((n, p) => n + p.length, 0);
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

export function toHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export async function sha256Hex(bytes: Uint8Array): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', bytes as BufferSource);
  return toHex(new Uint8Array(digest));
}

/**
 * HKDF-SHA-256 over the concatenated key material, then AES-256-GCM. The `info`
 * string binds the derivation to the handshake mode, exactly as a real protocol
 * binds a transcript hash — so a key derived for one mode is never valid for the
 * other.
 */
async function deriveSessionKey(mode: Mode, ikm: Uint8Array): Promise<CryptoKey> {
  const base = await crypto.subtle.importKey('raw', ikm as BufferSource, 'HKDF', false, [
    'deriveKey',
  ]);
  return crypto.subtle.deriveKey(
    {
      name: 'HKDF',
      hash: 'SHA-256',
      salt: new Uint8Array(0),
      info: new TextEncoder().encode(`crypto-lab-harvest-vault/v1/${mode}`),
    },
    base,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

/** Everything, and only everything, a passive wiretap sees on the wire. */
export interface CapturedRecord {
  index: number;
  mode: Mode;
  capturedAt: number;
  alicePublic: number;
  bobPublic: number;
  kemPublicKey?: KemPublicKey;
  kemCiphertext?: KemCiphertext;
  iv: Uint8Array;
  ciphertext: Uint8Array;
}

export interface SentSession {
  /** The stored copy. This is what the attack later runs against. */
  capture: CapturedRecord;
  /** Sender-side ground truth. Never transmitted; used only to check recovery. */
  plaintext: string;
  /** SHA-256 over the captured bytes, taken the moment they were stored. */
  fingerprint: string;
}

/** Canonical byte serialization of a capture, so it can be fingerprinted. */
export function serializeCapture(capture: CapturedRecord): Uint8Array {
  const polyBytes = (p: Poly): Uint8Array => new Uint8Array(p.buffer.slice(0));
  const parts: Uint8Array[] = [
    new TextEncoder().encode(capture.mode),
    u32be(capture.alicePublic),
    u32be(capture.bobPublic),
  ];
  if (capture.kemPublicKey) {
    parts.push(polyBytes(capture.kemPublicKey.a), polyBytes(capture.kemPublicKey.b));
  }
  if (capture.kemCiphertext) {
    parts.push(polyBytes(capture.kemCiphertext.u), polyBytes(capture.kemCiphertext.v));
  }
  parts.push(capture.iv, capture.ciphertext);
  return concatBytes(...parts);
}

export async function fingerprintCapture(capture: CapturedRecord): Promise<string> {
  return sha256Hex(serializeCapture(capture));
}

/**
 * Perform one handshake and one encrypted message, and return both the wiretap's
 * copy and the sender's ground truth.
 */
export async function sendSession(
  plaintext: string,
  mode: Mode,
  index: number,
  now: number = Date.now(),
): Promise<SentSession> {
  const alice = dhKeyPair();
  const bob = dhKeyPair();
  const dhSecret = u32be(dhShared(alice.privateKey, bob.publicKey));

  let ikm = dhSecret;
  let kemPublicKey: KemPublicKey | undefined;
  let kemCiphertext: KemCiphertext | undefined;

  if (mode === 'hybrid') {
    const kem = kemKeyGen();
    const encapsulated = kemEncapsulate(kem.publicKey);
    // Bob decapsulates with his lattice secret; both sides land on the same
    // 32 bytes. Checked here rather than assumed — a decode failure would
    // silently produce a "the attack failed" result for the wrong reason.
    const bobView = kemDecapsulate(kem.secretKey, encapsulated.ciphertext);
    if (toHex(bobView) !== toHex(encapsulated.sharedSecret)) {
      throw new Error('Lattice KEM decapsulation mismatch — handshake aborted.');
    }
    ikm = concatBytes(dhSecret, encapsulated.sharedSecret);
    kemPublicKey = kem.publicKey;
    kemCiphertext = encapsulated.ciphertext;
  }

  const key = await deriveSessionKey(mode, ikm);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv: iv as BufferSource },
      key,
      new TextEncoder().encode(plaintext) as BufferSource,
    ),
  );

  const capture: CapturedRecord = {
    index,
    mode,
    capturedAt: now,
    alicePublic: alice.publicKey,
    bobPublic: bob.publicKey,
    kemPublicKey,
    kemCiphertext,
    iv,
    ciphertext,
  };

  return { capture, plaintext, fingerprint: await fingerprintCapture(capture) };
}

export interface DiscreteLogResult {
  exponent: number | null;
  steps: number;
  elapsedMs: number;
}

/**
 * Exhaustive search for the discrete log of `target` base g. Real cryptanalysis,
 * just at a size where it terminates: the loop walks g^1, g^2, ... incrementally,
 * one modular multiply per candidate.
 *
 * This is NOT what Shor's algorithm does. Shor does not search; it uses period
 * finding to solve the same problem in polynomial time, which is why 2048-bit
 * groups do not save you. Search is used here only because it is the version that
 * fits in a browser tab.
 */
export function solveDiscreteLog(target: number, limit: number = DH_ORDER): DiscreteLogResult {
  const started = performance.now();
  let acc = 1;
  for (let k = 1; k <= limit; k += 1) {
    acc = (acc * DH_G) % DH_P;
    if (acc === target) {
      return { exponent: k, steps: k, elapsedMs: performance.now() - started };
    }
  }
  return { exponent: null, steps: limit, elapsedMs: performance.now() - started };
}

export interface AttackResult {
  index: number;
  mode: Mode;
  /** SHA-256 of the stored bytes as they are at attack time. */
  fingerprint: string;
  steps: number;
  elapsedMs: number;
  recoveredExponent: number | null;
  recovered: boolean;
  plaintext: string | null;
  failure: string | null;
}

/**
 * Q-Day, run against stored bytes only. The attacker gets the capture and nothing
 * else: no private keys, no lattice secret, no live connection.
 */
export async function attackCapture(capture: CapturedRecord): Promise<AttackResult> {
  const dl = solveDiscreteLog(capture.alicePublic);
  const fingerprint = await fingerprintCapture(capture);

  const base: Omit<AttackResult, 'recovered' | 'plaintext' | 'failure'> = {
    index: capture.index,
    mode: capture.mode,
    fingerprint,
    steps: dl.steps,
    elapsedMs: dl.elapsedMs,
    recoveredExponent: dl.exponent,
  };

  if (dl.exponent === null) {
    return {
      ...base,
      recovered: false,
      plaintext: null,
      failure: 'Discrete log not found within the search limit.',
    };
  }

  const dhSecret = u32be(dhShared(dl.exponent, capture.bobPublic));
  // For a hybrid capture the attacker holds the KEM ciphertext but not the
  // lattice secret, and no amount of discrete-log work produces it. It proceeds
  // with the only key material it actually has, substituting zeros for the part
  // it does not — and the AES-GCM tag check below is what rejects that.
  const ikm =
    capture.mode === 'hybrid' ? concatBytes(dhSecret, new Uint8Array(32)) : dhSecret;
  const key = await deriveSessionKey(capture.mode, ikm);

  try {
    const plain = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv: capture.iv as BufferSource },
      key,
      capture.ciphertext as BufferSource,
    );
    return {
      ...base,
      recovered: true,
      plaintext: new TextDecoder().decode(plain),
      failure: null,
    };
  } catch {
    return {
      ...base,
      recovered: false,
      plaintext: null,
      failure:
        'AES-GCM authentication failed: the discrete-log break yields only the classical half of the hybrid secret.',
    };
  }
}
