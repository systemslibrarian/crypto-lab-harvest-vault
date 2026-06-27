# crypto-lab-harvest-vault

## What It Is

Browser-based interactive visualizer for the Harvest Now, Decrypt Later
(HNDL) quantum threat - the only demo in the crypto-lab suite that does
not implement a cryptographic algorithm. Instead it implements a strategic
threat model: adversaries are collecting encrypted data today, storing it,
and will decrypt it retroactively once quantum computers arrive.

The breach is invisible and retroactive. Organizations that wait to migrate
to post-quantum cryptography are not safe - they have already been
compromised. They will learn this at Q-Day.

Features Mosca's Theorem (X + Y > Z) as an interactive risk calculator
with sector-specific presets, an interactive HNDL timeline from 2013
through the Q-Day probability window, and a sector risk matrix across
healthcare, government, finance, legal, library, and enterprise.

## When to Use It

- Explaining to leadership why PQC migration is urgent NOW, not when
  quantum computers arrive
- Calculating your organization's specific Mosca risk exposure
- Understanding why perfect forward secrecy is the best available
  protection for communications that are already being transmitted
- Teaching the difference between the harvest phase (now) and the
  decrypt phase (future) - two separate events with a long gap between
- Do NOT use as a substitute for a professional cryptographic risk
  assessment - the Q-Day estimates are ranges, not hard dates

## Live Demo

https://systemslibrarian.github.io/crypto-lab-harvest-vault/

## GitHub Pages Deployment

This project is configured for GitHub Pages via GitHub Actions.

1. Push changes to the `main` branch.
2. In GitHub repo settings, set Pages source to `GitHub Actions`.
3. The workflow in `.github/workflows/deploy.yml` builds with Vite and deploys `dist/`.

The Vite `base` path is already set in `vite.config.ts` for this repository:

`/crypto-lab-harvest-vault/`

## What Can Go Wrong

- **PQC migration does not protect already-harvested data.** Deploying
  ML-KEM tomorrow does not decrypt-protect communications from last year.
  Perfect forward secrecy is the only protection for communications that
  have already occurred - and only if it was deployed before collection.
- **Q-Day uncertainty is real.** The 2030+-3 estimate is a consensus center
  of a wide distribution. Some credible researchers say 2028. Some say 2040.
  Mosca's Theorem is robust to this uncertainty: use the optimistic estimate
  (Z=6) and see if X+Y>6. If it is, you cannot afford to be wrong.
- **Symmetric crypto is NOT the threat.** AES-256 and SHA-512 are safe
  against Grover's quadratic speedup. The HNDL threat targets RSA and ECC
  key exchange - the handshake that establishes the session, not the
  session itself. See crypto-lab-grover for the symmetric story.
- **The storage counter is illustrative.** ~23 TB/second of RSA/ECC
  traffic is an order-of-magnitude estimate. Nation-state storage costs
  are real but the exact collection rate is unknown.

## Real-World Usage

The HNDL threat is confirmed - NSA mass collection of encrypted traffic
was documented in the 2013 Snowden disclosures. State-level adversaries
with fiber access, BGP influence, or compromised infrastructure have been
collecting encrypted communications for years.

NIST explicitly cites HNDL as the primary driver for urgent PQC migration:
"starting the transition to post-quantum cryptography now is critical to
preventing these future breaches." FBI, CISA, and NIST have designated 2026
the Year of Quantum Security.

Cloudflare's internal Q-Day readiness deadline has been moved forward
following 2025-2026 resource estimate papers. They are targeting full
post-quantum security by 2029.

The migration window is open. It will not stay open forever.
