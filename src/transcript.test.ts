import { describe, expect, it } from 'vitest';
import {
  DH_G,
  DH_ORDER,
  DH_P,
  attackCapture,
  dhKeyPair,
  dhShared,
  fingerprintCapture,
  modPow,
  sendSession,
  solveDiscreteLog,
} from './transcript';

describe('toy Diffie-Hellman group', () => {
  it('uses a safe prime with g in the order-q subgroup', () => {
    expect((DH_P - 1) / 2).toBe(DH_ORDER);
    expect(modPow(DH_G, DH_ORDER, DH_P)).toBe(1);
  });

  it('lands both parties on the same shared secret', () => {
    for (let run = 0; run < 10; run += 1) {
      const alice = dhKeyPair();
      const bob = dhKeyPair();
      expect(dhShared(alice.privateKey, bob.publicKey)).toBe(
        dhShared(bob.privateKey, alice.publicKey),
      );
    }
  });
});

describe('discrete-log break', () => {
  it('recovers a known exponent and reports the work it did', () => {
    const secret = 123457;
    const result = solveDiscreteLog(modPow(DH_G, secret, DH_P));
    expect(result.exponent).toBe(secret);
    expect(result.steps).toBe(secret);
    expect(result.elapsedMs).toBeGreaterThanOrEqual(0);
  });

  it('reports failure rather than a wrong answer when the search is cut short', () => {
    const result = solveDiscreteLog(modPow(DH_G, 500000, DH_P), 1000);
    expect(result.exponent).toBeNull();
    expect(result.steps).toBe(1000);
  });

  it('recovers the exponent behind a freshly generated public key', () => {
    const alice = dhKeyPair();
    expect(solveDiscreteLog(alice.publicKey).exponent).toBe(alice.privateKey);
  });
});

describe('captured sessions', () => {
  it('never puts the plaintext or a private key in the capture', async () => {
    const session = await sendSession('patron 4471 borrowed Fahrenheit 451', 'classical', 0);
    const serialized = JSON.stringify(session.capture, (_k, v) =>
      ArrayBuffer.isView(v) ? Array.from(v as Uint8Array) : v,
    );
    expect(serialized).not.toContain('patron');
    expect(serialized).not.toContain('Fahrenheit');
  });

  it('recovers a classical capture byte-for-byte at Q-Day', async () => {
    const message = 'patron 4471 borrowed Fahrenheit 451 on 2026-08-02';
    const session = await sendSession(message, 'classical', 0);
    const result = await attackCapture(session.capture);
    expect(result.recovered).toBe(true);
    expect(result.plaintext).toBe(message);
    expect(result.recoveredExponent).not.toBeNull();
    expect(result.steps).toBeGreaterThan(0);
  });

  it('fails on a hybrid capture, and fails for the stated reason', async () => {
    const session = await sendSession('post-upgrade session', 'hybrid', 1);
    const result = await attackCapture(session.capture);
    // The discrete log is still solved — the classical leg really does fall.
    expect(result.recoveredExponent).not.toBeNull();
    // It just is not enough key material any more.
    expect(result.recovered).toBe(false);
    expect(result.plaintext).toBeNull();
    expect(result.failure).toContain('AES-GCM authentication failed');
  });

  it('carries the lattice public key and ciphertext only in hybrid mode', async () => {
    const classical = await sendSession('a', 'classical', 0);
    const hybrid = await sendSession('b', 'hybrid', 1);
    expect(classical.capture.kemCiphertext).toBeUndefined();
    expect(hybrid.capture.kemCiphertext).toBeDefined();
    expect(hybrid.capture.kemPublicKey).toBeDefined();
  });
});

describe('the retroactivity claim', () => {
  it('leaves an already-captured session exactly as decryptable after the upgrade', async () => {
    const message = 'sent before anyone had heard of ML-KEM';
    const captured = await sendSession(message, 'classical', 0);

    // The learner upgrades. Two later sessions run on the hybrid handshake.
    const afterA = await sendSession('after the upgrade', 'hybrid', 1);
    const afterB = await sendSession('also after the upgrade', 'hybrid', 2);

    // The stored bytes are untouched by anything that happened afterwards.
    expect(await fingerprintCapture(captured.capture)).toBe(captured.fingerprint);

    const results = await Promise.all(
      [captured, afterA, afterB].map((s) => attackCapture(s.capture)),
    );

    expect(results[0].recovered).toBe(true);
    expect(results[0].plaintext).toBe(message);
    expect(results[0].fingerprint).toBe(captured.fingerprint);
    expect(results[1].recovered).toBe(false);
    expect(results[2].recovered).toBe(false);
  });

  it('protects a session only when the upgrade precedes it', async () => {
    // Same message, same attacker, same amount of work — the only difference is
    // which side of the upgrade the session was sent on.
    const message = 'identical payload';
    const before = await attackCapture((await sendSession(message, 'classical', 0)).capture);
    const after = await attackCapture((await sendSession(message, 'hybrid', 1)).capture);
    expect(before.recovered).toBe(true);
    expect(after.recovered).toBe(false);
  });
});
