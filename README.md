# crypto-lab-harvest-vault

## What It Is

Browser-based interactive visualizer for the Harvest Now, Decrypt Later
(HNDL) quantum threat: an adversary could retain encrypted sessions today and decrypt some later if sufficiently capable quantum computers become available.

Most of the page is a strategic threat model rather than an algorithm — but
the central claim, that a PQC upgrade cannot reach backwards, is demonstrated
rather than asserted. The **Prove it** panel runs a real key exchange in the
browser, keeps a real wiretap copy of it, and then runs a real break against
that stored copy: exhaustive discrete-log search over a 24-bit
Diffie-Hellman group, HKDF-SHA-256, AES-256-GCM, and a Ring-LWE KEM
(n = 256, q = 3329) for the hybrid upgrade. Deploy the upgrade *after* a
capture and the recorded session still comes back byte-identical; deploy it
*before* and the same attacker solves the same discrete log and still fails,
because the lattice half of the key was never on the wire.

The calculator models a possible capture. It cannot establish that anyone intercepted an organization’s traffic. A record encrypted today has max(0, X − Z) sensitive years remaining at the assumed arrival. The planning shortfall is max(0, X + Y − Z), allowing for classical sessions issued until migration finishes.

Features Mosca's Theorem (X + Y > Z) as an interactive risk calculator
with sector-specific presets, an interactive HNDL timeline from 2013
through the illustrative Q-Day scenarios, and a sector risk matrix across
healthcare, government, finance, legal, library, and enterprise.

The calculator uses Mosca's canonical variable convention (matching the
companion `crypto-lab-harvest-timeline`): **X** = data security shelf life
(years the data must stay secret), **Y** = migration time (years to deploy
PQC), and **Z** = the years until a cryptographically relevant quantum
computer. Because the risk condition is the symmetric sum `X + Y > Z`, the
verdict never depends on which lever is which — but the labels do, so they
match the literature.

## When to Use It

- Explaining to leadership why PQC migration is urgent NOW, not when
  quantum computers arrive
- Calculating your organization's specific Mosca risk exposure
- Distinguishing classical forward secrecy against later long-term-key compromise
  from quantum-resistant key protection already present when traffic is collected
- Teaching the difference between the harvest phase (now) and the
  decrypt phase (future) - two separate events with a long gap between
- Do NOT use as a substitute for a professional cryptographic risk
  assessment - the Q-Day estimates are ranges, not hard dates

## Live Demo

**[systemslibrarian.github.io/crypto-lab-harvest-vault](https://systemslibrarian.github.io/crypto-lab-harvest-vault/)**

Capture a real handshake in the **Prove it** panel, deploy the PQC upgrade after the fact, and run Q-Day to watch the recorded session come back byte-identical while the post-upgrade one does not. Then work the Mosca calculator (X + Y > Z) with sector presets and three Q-Day scenarios, click the sector risk matrix to load a sector and watch it cross risk states as Z changes, and generate a copyable risk brief of your inputs, verdict, and top actions. Threat-model, evidence-and-confidence, and self-check panels keep the claim precise; selected sector and slider values are encoded in the URL so a configured view can be shared directly.

## What Can Go Wrong

- **PQC migration does not protect already-harvested data.** Deploying
  ML-KEM tomorrow does not decrypt-protect communications from last year.
  Old captures need appropriate quantum-resistant key protection already present
  at collection: PQ/hybrid key establishment, or a sufficiently high-entropy
  pre-shared secret mixed into key derivation by an appropriate protocol.
  Ordinary classical PFS protects against later long-term-key compromise; it does
  not prevent solving a recorded ephemeral DH/ECDH public exchange with Shor.
  A later upgrade or re-encryption cannot rewrite an adversary's stored copy.
  [RFC 8784 §§1–2](https://www.rfc-editor.org/rfc/rfc8784.html#section-1)
  explains the recorded-exchange threat and the distinct role of a high-entropy
  key-derivation secret; an authentication-only PSK is not equivalent.
- **The arrival year is uncertain.** Compare 2028, 2030 and 2035 as classroom scenarios. Starting by the assumed arrival year minus Y permits migration to finish by arrival. Subtract both Y and X to allow the last classically protected record its full shelf life.
- **Symmetric crypto is NOT the threat.** AES-256 and SHA-512 are safe
  against Grover's quadratic speedup. The HNDL threat targets RSA and ECC
  key exchange - the handshake that establishes the session, not the
  session itself. See crypto-lab-grover for the symmetric story.
- **The Prove it panel is toy-scale, and says so on the page.** 24-bit DH is
  brute-forceable in a browser; 2048-bit DH is not, which is the whole reason
  Shor's algorithm matters (it does not search — it finds the period). The
  Ring-LWE KEM is the mechanism ML-KEM is built from, at teaching size,
  IND-CPA only, not constant time, unreviewed. Neither is production
  cryptography. What is exact at any size is the retroactivity: stored bytes
  do not get re-encrypted by a later upgrade.
- **The storage counter is illustrative.** ~23 TB/second of RSA/ECC
  traffic is an order-of-magnitude estimate. Nation-state storage costs
  are real but the exact collection rate is unknown.

## Real-World Usage

- **Recorded sessions are a planning concern.** Large-scale communications collection has been documented. Whether a given session was captured, retained and could later be decrypted depends on the adversary and the protocol.
- **NIST cites HNDL as one of the main reasons** the PQC migration is urgent: "starting
  the transition to post-quantum cryptography now is critical to preventing
  these future breaches" ([NIST IR 8547, *Transition to Post-Quantum Cryptography Standards*, final, October 2026, §1 Introduction](https://nvlpubs.nist.gov/nistpubs/ir/2026/NIST.IR.8547.pdf)).
  The same section says organizations "should treat the migration to PQC as a
  current operational priority."
- **Operators are pulling deadlines forward** - Cloudflare moved up its internal
  Q-Day readiness target (full post-quantum security by 2029) following 2025-2026
  resource-estimate papers.
- **The migration window is open** - and the long gap between the harvest phase and the decrypt phase is exactly why acting early matters.

**Standards reviewed 15 November 2026:** the NIST quotations above are from the final NIST IR 8547
(October 2026), §1. An earlier line here said FBI, CISA, and NIST had framed 2026 as a "Year of
Quantum Security"; that designation is not an agency one. It was made by the trade publication The
Quantum Insider — "The Quantum Insider is designating 2026 as the Year of Quantum Security" — whose
Washington launch event on 12 January 2026 had speakers from those three agencies
([The Quantum Insider](https://thequantuminsider.com/2026/01/06/after-a-year-of-quantum-awareness-2026-becomes-the-year-of-quantum-security/)).
No FBI, CISA, or NIST publication was found making the designation, so the sentence was replaced by
what NIST itself publishes. The joint federal guidance that does exist is the CISA/NSA/NIST
"Quantum-Readiness: Migration to Post-Quantum Cryptography" factsheet of 21 August 2023
([CISA](https://www.cisa.gov/resources-tools/resources/quantum-readiness-migration-post-quantum-cryptography)),
which names no year.

## How to Run Locally

```bash
git clone https://github.com/systemslibrarian/crypto-lab-harvest-vault
cd crypto-lab-harvest-vault
npm install
npm run dev
```

## Related Demos

- [crypto-lab-harvest-timeline](https://systemslibrarian.github.io/crypto-lab-harvest-timeline/) — the companion HNDL timeline and PQC-migration planner. **These two labs share a theorem on purpose.** This one is the *threat* lab: it models possible capture, proves the retroactivity mechanism by capturing and breaking a live handshake, and compares the dates implied by your assumptions. That one is the *planning* lab: it takes a fleet of systems with different shelf lives and migration costs, projects which cross Q-Day unprotected, and prices each year of delay.
- [crypto-lab-shor](https://systemslibrarian.github.io/crypto-lab-shor/) — Shor's algorithm, the quantum attack that makes Q-Day real.
- [crypto-lab-grover](https://systemslibrarian.github.io/crypto-lab-grover/) — the symmetric-key side of the quantum story (why AES-256 survives).
- [crypto-lab-pq-rotation](https://systemslibrarian.github.io/crypto-lab-pq-rotation/) — planning and rotating to post-quantum key material.
- [crypto-lab-pq-families](https://systemslibrarian.github.io/crypto-lab-pq-families/) — the PQC algorithm families you migrate to.

## Learning Path & Features

The demo is structured as a guided learning instrument, not just an
explainer. A sticky progress nav follows seven steps — what is harvested,
what breaks at Q-Day, why time matters, prove it, is my sector at risk, what
mitigations help, and a self-check.

- **Capture-then-upgrade exhibit** (`src/transcript.ts`, `src/lattice.ts`):
  send a message over a real toy handshake, watch the ciphertext, nonce and
  public keys land in "the adversary's store", deploy the PQC upgrade, send
  again, then run Q-Day. Every verdict on that panel — recovered / not
  recovered, byte-identical or not, fingerprint unchanged or not, exponents
  tried, milliseconds spent — is measured from that run.
- **Mosca calculator** with a three-scenario Q-Day comparison (illustrative
  2028 / 2030 / 2035) so the lesson is surviving the
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

*Part of the [Crypto Lab](https://crypto-lab.systemslibrarian.dev/) suite.*

*"So whether you eat or drink or whatever you do, do it all for the glory of God." — 1 Corinthians 10:31*
