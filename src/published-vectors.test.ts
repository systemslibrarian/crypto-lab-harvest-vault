import { describe, expect, it } from 'vitest';
import { hkdfSha256, toHex } from './transcript';

function fromHex(value: string): Uint8Array {
  if (value.length % 2 !== 0) throw new Error('hex input must contain whole octets');
  return Uint8Array.from(value.match(/../g) ?? [], octet => Number.parseInt(octet, 16));
}

/* RFC 5869 Appendix A's three HKDF-SHA-256 test cases, copied from the
 * publication rather than regenerated with WebCrypto or another library:
 * https://www.rfc-editor.org/rfc/rfc5869.html#appendix-A
 *
 * Each expected string below has the exact octet count stated by the RFC. The
 * SHA-1 cases A.4-A.7 are intentionally absent because this lab does not use
 * HKDF-SHA-1. */
const RFC5869_SHA256 = [
  {
    name: 'Appendix A.1 basic SHA-256 case',
    ikm: '0b'.repeat(22),
    salt: '000102030405060708090a0b0c',
    info: 'f0f1f2f3f4f5f6f7f8f9',
    length: 42,
    okm:
      '3cb25f25faacd57a90434f64d0362f2a2d2d0a90cf1a5a4c5db02d56ecc4c5bf' +
      '34007208d5b887185865',
  },
  {
    name: 'Appendix A.2 long-input SHA-256 case',
    ikm:
      '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f' +
      '202122232425262728292a2b2c2d2e2f303132333435363738393a3b3c3d3e3f' +
      '404142434445464748494a4b4c4d4e4f',
    salt:
      '606162636465666768696a6b6c6d6e6f707172737475767778797a7b7c7d7e7f' +
      '808182838485868788898a8b8c8d8e8f909192939495969798999a9b9c9d9e9f' +
      'a0a1a2a3a4a5a6a7a8a9aaabacadaeaf',
    info:
      'b0b1b2b3b4b5b6b7b8b9babbbcbdbebfc0c1c2c3c4c5c6c7c8c9cacbcccdcecf' +
      'd0d1d2d3d4d5d6d7d8d9dadbdcdddedfe0e1e2e3e4e5e6e7e8e9eaebecedeeef' +
      'f0f1f2f3f4f5f6f7f8f9fafbfcfdfeff',
    length: 82,
    okm:
      'b11e398dc80327a1c8e7f78c596a49344f012eda2d4efad8a050cc4c19afa97c' +
      '59045a99cac7827271cb41c65e590e09da3275600c2f09b8367793a9aca3db71' +
      'cc30c58179ec3e87c14c01d5c1f3434f1d87',
  },
  {
    name: 'Appendix A.3 zero-length salt and info case',
    ikm: '0b'.repeat(22),
    salt: '',
    info: '',
    length: 42,
    okm:
      '8da4e775a563c18f715f802a063c5a31b8a11f5c5ee1879ec3454e5f3c738d2d' +
      '9d201395faa4b61a96c8',
  },
] as const;

describe('published HKDF-SHA-256 ground truth', () => {
  for (const vector of RFC5869_SHA256) {
    it(`matches RFC 5869 ${vector.name}`, async () => {
      expect(vector.okm).toHaveLength(vector.length * 2);
      const actual = await hkdfSha256(
        fromHex(vector.ikm),
        fromHex(vector.salt),
        fromHex(vector.info),
        vector.length,
      );
      expect(toHex(actual)).toBe(vector.okm);
    });
  }
});
