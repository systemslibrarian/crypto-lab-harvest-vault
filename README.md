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

**[systemslibrarian.github.io/crypto-lab-harvest-vault](https://systemslibrarian.github.io/crypto-lab-harvest-vault/)**

Work the Mosca calculator (X + Y > Z) with sector presets and three Q-Day scenarios, click the sector risk matrix to load a sector and watch it cross risk states as Z changes, and generate a copyable risk brief of your inputs, verdict, and top actions. Threat-model, evidence-and-confidence, and self-check panels keep the claim precise; selected sector and slider values are encoded in the URL so a configured view can be shared directly.

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

- **The HNDL threat is confirmed** - NSA mass collection of encrypted traffic
  was documented in the 2013 Snowden disclosures, and state-level adversaries
  with fiber access, BGP influence, or compromised infrastructure have been
  collecting encrypted communications for years.
- **NIST cites HNDL as the primary driver** for urgent PQC migration: "starting
  the transition to post-quantum cryptography now is critical to preventing
  these future breaches." FBI, CISA, and NIST framed 2026 as a year of quantum security.
- **Operators are pulling deadlines forward** - Cloudflare moved up its internal
  Q-Day readiness target (full post-quantum security by 2029) following 2025-2026
  resource-estimate papers.
- **The migration window is open** - and the long gap between the harvest phase and the decrypt phase is exactly why acting early matters.

## How to Run Locally

```bash
git clone https://github.com/systemslibrarian/crypto-lab-harvest-vault
cd crypto-lab-harvest-vault
npm install
npm run dev
```

## Related Demos

- [crypto-lab-harvest-timeline](https://systemslibrarian.github.io/crypto-lab-harvest-timeline/) — the companion HNDL timeline and PQC-migration planner.
- [crypto-lab-shor](https://systemslibrarian.github.io/crypto-lab-shor/) — Shor's algorithm, the quantum attack that makes Q-Day real.
- [crypto-lab-grover](https://systemslibrarian.github.io/crypto-lab-grover/) — the symmetric-key side of the quantum story (why AES-256 survives).
- [crypto-lab-pq-rotation](https://systemslibrarian.github.io/crypto-lab-pq-rotation/) — planning and rotating to post-quantum key material.
- [crypto-lab-pq-families](https://systemslibrarian.github.io/crypto-lab-pq-families/) — the PQC algorithm families you migrate to.

## Learning Path & Features

The demo is structured as a guided learning instrument, not just an
explainer. A sticky progress nav follows six steps — what is harvested,
what breaks at Q-Day, why time matters, is my sector at risk, what
mitigations help, and a self-check.

- **Mosca calculator** with a three-scenario Q-Day comparison (aggressive
  2028 / center 2030 / conservative 2035) so the lesson is surviving the
  range, not guessing a date.
- **Interactive sector matrix**: click a dot to load that sector into the
  calculator; toggle Z = 4 / 8 / 12 to watch sectors cross between risk states.
- **Copyable risk brief** (and Print / Save-as-PDF) summarizing your inputs,
  verdict, schedule, and top three tailored actions.
- **Threat-model, protocol-example, and misconception** panels that keep the
  claim precise (the RSA/ECC handshake is the target; AES-256 is not broken).
- **Evidence & Confidence** section: every major claim is labelled
  (confirmed / standardized / estimate / illustrative / recommendation) and
  linked to a primary source.
- **Five-question self-check**, a "What To Do Monday" action plan, and a glossary.
- **Shareable URLs**: the selected sector and X/Y/Z slider values are encoded
  in the URL, so a configured view can be linked directly.

All of it is static and client-side — no backends, no data leaves the browser.

## GitHub Pages Deployment

This project is configured for GitHub Pages via GitHub Actions.

1. Push changes to the `main` branch.
2. In GitHub repo settings, set Pages source to `GitHub Actions`.
3. The workflow in `.github/workflows/deploy.yml` builds with Vite and deploys `dist/`.

The Vite `base` path is already set in `vite.config.ts` for this repository:

`/crypto-lab-harvest-vault/`

---

*One of 60+ browser demos in the [Crypto Lab](https://crypto-lab.systemslibrarian.dev/) suite.*

*"So whether you eat or drink or whatever you do, do it all for the glory of God." — 1 Corinthians 10:31*
