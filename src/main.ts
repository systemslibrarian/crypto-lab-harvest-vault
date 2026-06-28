import './style.css';
import { computeMosca, SECTOR_PRESETS, type MoscaResult } from './mosca';
import { TIMELINE_EVENTS, type TimelineEvent } from './timeline';
import {
  SOURCES,
  THREAT_MODEL,
  PROTOCOL_EXAMPLES,
  MISCONCEPTIONS,
  Z_SCENARIOS,
  SECTOR_RATIONALE,
  CONFIDENCE_LABEL,
  CONFIDENCE_BLURB,
  type Confidence,
} from './content';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function confidenceBadge(kind: Confidence): string {
  return `<span class="conf-badge conf-${kind}" title="${escapeHtml(CONFIDENCE_BLURB[kind])}">${CONFIDENCE_LABEL[kind]}</span>`;
}

function createThreatModel(): string {
  const rows = THREAT_MODEL.map(
    (row) => `<div class="tm-row"><dt>${row.label}</dt><dd>${row.body}</dd></div>`,
  ).join('');
  return `<dl class="threat-model">${rows}</dl>`;
}

function createProtocolExamples(): string {
  return PROTOCOL_EXAMPLES.map(
    (ex) => `
      <article class="protocol-card proto-${ex.verdict}">
        <header><h3>${ex.name}</h3><span class="proto-tag">${ex.verdictLabel}</span></header>
        <p>${ex.body}</p>
      </article>`,
  ).join('');
}

function createMatrixZToggle(): string {
  return [4, 8, 12]
    .map(
      (z) =>
        `<button type="button" class="matrix-z-btn ${z === matrixZ ? 'active' : ''}" aria-pressed="${z === matrixZ}" data-matrix-z="${z}">Z = ${z} yr (${CURRENT_YEAR + z})</button>`,
    )
    .join('');
}

function createMatrixDots(): string {
  return Object.entries(SECTOR_PRESETS)
    .map(([key, preset]) => {
      const x = Math.min(Math.max((preset.migrationYears / 10) * 100, 10), 95);
      const y = Math.min(Math.max((preset.sensitivityYears / 50) * 100, 10), 95);
      const risk = computeMosca(
        { migrationYears: preset.migrationYears, sensitivityYears: preset.sensitivityYears, qDayYears: matrixZ },
        CURRENT_YEAR,
      );
      return `<button class="matrix-dot ${risk.riskLevel}" style="left:${x}%;bottom:${y}%" type="button" data-matrix-sector="${key}" aria-label="${preset.label}: ${risk.atRisk ? 'at risk' : 'not at risk'} at Z=${matrixZ}. Activate to load into the calculator.">${preset.label}</button>`;
    })
    .join('');
}

function checkpoint(question: string, answer: string): string {
  return `<details class="checkpoint"><summary>Check yourself — ${question}</summary><p>${answer}</p></details>`;
}

function createMisconceptions(): string {
  return MISCONCEPTIONS.map(
    (m) => `
      <article class="myth-card">
        <p class="myth">${m.myth}</p>
        <p class="reality"><span class="reality-tag">Reality</span> ${m.reality}</p>
      </article>`,
  ).join('');
}

// The three-scenario verdict strip — recomputed from the current X/Y at each
// plausible Q-Day. Teaches "survive the range", not "guess the date".
function createScenarioStrip(): string {
  return Z_SCENARIOS.map((s) => {
    const qd = Math.max(s.year - CURRENT_YEAR, 1);
    const m = computeMosca({ migrationYears, sensitivityYears, qDayYears: qd }, CURRENT_YEAR);
    return `
      <div class="scenario-chip ${m.atRisk ? 'at-risk' : 'ok'}">
        <span class="sc-label">${s.label} · Q-Day ${s.year}</span>
        <span class="sc-verdict">${m.atRisk ? 'AT RISK' : 'NOT AT RISK'}</span>
        <span class="sc-math">X+Y=${m.XplusY} vs Z=${m.Z}</span>
        <span class="small-note">${s.note}</span>
      </div>`;
  }).join('');
}

function createEvidence(): string {
  return SOURCES.map((s) => {
    const cite = s.url
      ? `<a href="${s.url}" target="_blank" rel="noopener">${escapeHtml(s.source)}</a>`
      : escapeHtml(s.source);
    return `
      <details class="evidence-item">
        <summary><span class="evidence-claim">${s.claim}</span> ${confidenceBadge(s.confidence)}</summary>
        <p>${s.detail}</p>
        <p class="small-note">Source: ${cite}</p>
      </details>`;
  }).join('');
}

type SectorKey = keyof typeof SECTOR_PRESETS | 'custom';

const CURRENT_YEAR = 2026;
const TRAFFIC_TB_PER_SECOND = 23;

const sectorOrder: SectorKey[] = [
  'government',
  'healthcare',
  'finance',
  'legal',
  'library',
  'enterprise',
  'personal',
  'custom',
];

const sectorTitles: Record<SectorKey, string> = {
  government: 'Gov/Classified',
  healthcare: 'Healthcare',
  finance: 'Finance',
  legal: 'Legal',
  library: 'Library',
  enterprise: 'Enterprise',
  personal: 'Personal',
  custom: 'Custom',
};

const sectorContext: Record<Exclude<SectorKey, 'custom'>, { heading: string; body: string[]; bullets: string[] }> = {
  government: {
    heading: 'GOVERNMENT / CLASSIFIED CONTEXT',
    body: [
      'Classified data often keeps sensitivity for decades. Migration is slowed by legacy systems, coalition interoperability, and certification gates.',
      'HNDL is not a future threat - it is a present collection strategy targeting high-value state communications now.',
    ],
    bullets: [
      'Diplomatic cables and source identities can remain sensitive long after Q-Day',
      'Legacy classified infrastructure can extend migration timelines beyond a decade',
      'Delayed transition creates a long retroactive decrypt window',
    ],
  },
  healthcare: {
    heading: 'HEALTHCARE CONTEXT',
    body: [
      'Patient records and genomic data can require confidentiality for 50 to 80+ years. Clinical ecosystems are difficult to migrate quickly.',
      'Captured encrypted traffic from provider portals and hospital APIs may remain sensitive long after Q-Day.',
    ],
    bullets: [
      'EHR, imaging, insurance and lab exchanges are long-lived targets',
      'Compliance and testing cycles increase migration time',
      'Past encrypted records cannot be retroactively re-protected',
    ],
  },
  finance: {
    heading: 'FINANCIAL SERVICES CONTEXT',
    body: [
      'Financial messaging, trading strategy, and deal flow can have multi-year to multi-decade sensitivity windows.',
      'Adversaries harvesting market-sensitive encrypted traffic gain delayed intelligence once quantum capability arrives.',
    ],
    bullets: [
      'SWIFT and interbank channels are persistent strategic targets',
      'M&A plans and risk models can be exposed retroactively',
      'Hybrid TLS and post-quantum migration reduce future exposure',
    ],
  },
  legal: {
    heading: 'LEGAL / LAW FIRM CONTEXT',
    body: [
      'Attorney-client privilege can effectively be indefinite. Encrypted legal communication captured now may be readable later.',
      'Long case timelines mean historical confidentiality failures can still produce current harm.',
    ],
    bullets: [
      'Privileged correspondence is high-value long-sensitivity data',
      'Discovery archives and litigation records raise retention exposure',
      'Transition delay increases permanent privilege risk',
    ],
  },
  library: {
    heading: 'LIBRARY PATRON PRIVACY CONTEXT',
    body: [
      'Federal and state library privacy statutes protect patron reading records indefinitely in most jurisdictions. RSA/TLS-encrypted ILS API traffic and patron portal sessions are potential HNDL targets.',
      'If an adversary is collecting library system traffic today, later decryption can expose patron identities, registration PII, and reading history relationships.',
      'This is not hypothetical. Libraries are soft targets: high-sensitivity data, under-resourced IT, and legacy ILS upgrade cycles.',
    ],
    bullets: [
      'Patron identities linked to reading records may be exposed at Q-Day',
      'Patron registration PII has long sensitivity under library privacy obligations',
      'After migration, pre-migration ciphertext remains exposed to future decryption',
    ],
  },
  enterprise: {
    heading: 'ENTERPRISE CONTEXT',
    body: [
      'Corporate IP, roadmap data, and strategic communications commonly exceed short migration windows.',
      'HNDL allows adversaries to build future intelligence from present encrypted business traffic.',
    ],
    bullets: [
      'R&D and merger conversations remain valuable for years',
      'Legacy services and vendor dependencies slow migration execution',
      'Retention minimization directly reduces future decrypt surface',
    ],
  },
  personal: {
    heading: 'PERSONAL CONTEXT',
    body: [
      'Individuals hold long-lived financial and health records across email, cloud, and account portals.',
      'Personal risk varies, but meaningful exposure remains where data sensitivity outlasts migration and Q-Day timelines.',
    ],
    bullets: [
      'Use services deploying modern TLS and forward secrecy',
      'Reduce archival retention of unnecessary sensitive content',
      'Track provider post-quantum migration commitments',
    ],
  },
};

const mitigationCards = [
  {
    title: '1. MIGRATE TO PQC NOW',
    lines: [
      'ML-KEM (FIPS 203) for key exchange',
      'ML-DSA (FIPS 204) for digital signatures',
      'Protects future communications',
      'Cannot retroactively protect already-harvested data',
      'Timeline: begin immediately. NSA deadline: 2035.',
    ],
  },
  {
    title: '2. DEPLOY PERFECT FORWARD SECRECY',
    lines: [
      'TLS 1.3 with ECDHE for classical PFS',
      'X25519 + ML-KEM hybrid for post-quantum PFS',
      'Session keys are ephemeral per handshake',
      'Best available protection while traffic is actively flowing',
      'Only works when deployed before collection happens',
    ],
  },
  {
    title: '3. USE HYBRID CRYPTOGRAPHY',
    lines: [
      'X25519 + ML-KEM simultaneously in TLS handshake',
      'Attacker must break both classical and post-quantum components',
      'Defense-in-depth during migration years',
      'Deployed by Chrome 124+, Cloudflare, and Signal',
    ],
  },
  {
    title: '4. MINIMIZE DATA RETENTION',
    lines: [
      'Delete sensitive communications after useful life',
      'Data that does not exist cannot be decrypted later',
      'Reduces historical exposure surface',
      'Applies to email archives, logs, and session recordings',
    ],
  },
  {
    title: '5. QUANTUM KEY DISTRIBUTION (HIGH VALUE ONLY)',
    lines: [
      'Physics-based key exchange via photon polarization',
      'Immune to Shor attacks on RSA/ECC key exchange',
      'Point-to-point constraints and infrastructure cost are high',
      'See crypto-lab-bb84 for a live simulation',
    ],
  },
];

// Small inline SVG glyphs for the three-act hero scenes. All use currentColor so
// they inherit each act's accent and adapt to light/dark themes automatically.
const ICON = {
  doc: '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M6 2h8l4 4v16H6z" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M14 2v4h4" fill="none" stroke="currentColor" stroke-width="1.6"/><path d="M8.5 11h7M8.5 14h7M8.5 17h4" stroke="currentColor" stroke-width="1.4"/></svg>',
  drive: '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><rect x="3" y="4" width="18" height="5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="11" width="18" height="5" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="18" width="18" height="3.4" rx="1.5" fill="none" stroke="currentColor" stroke-width="1.6"/><circle cx="7" cy="6.5" r="1" fill="currentColor"/><circle cx="7" cy="13.5" r="1" fill="currentColor"/></svg>',
  qpu: '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M12 2v3M7 5h10M8 5l-1 4h10l-1-4M7.5 9h9l-1.2 4H8.7zM9 13l-.8 5h7.6L15 13M10.5 18v3M13.5 18v3" fill="none" stroke="currentColor" stroke-width="1.4"/></svg>',
  lock: '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M8 10V7a4 4 0 0 1 8 0v3" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="5.5" y="10" width="13" height="9" rx="2" fill="currentColor"/></svg>',
  unlock: '<svg viewBox="0 0 24 24" class="ico" aria-hidden="true"><path d="M8 10V7a4 4 0 0 1 7.7-1.5" fill="none" stroke="currentColor" stroke-width="1.8"/><rect x="5.5" y="10" width="13" height="9" rx="2" fill="currentColor"/></svg>',
};

function createActStrip(): string {
  const packets = [0, 1, 2, 3].map((i) => `<span class="pkt pkt-${i}">${ICON.lock}</span>`).join('');
  const vaultChips = [0, 1, 2, 3, 4, 5].map((i) => `<span class="vchip vchip-${i}">${ICON.lock}</span>`).join('');
  const years = [2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035]
    .map((y) => `<span>${y}</span>`)
    .join('');

  return `
    <div class="act-strip" role="img" aria-label="Three-act HNDL attack: Act 1, encrypted traffic is copied and stored today. Act 2, it waits in storage for years. Act 3, at Q-Day a quantum computer recovers the keys and every stored message becomes readable.">
      <div class="act-card act-1">
        <h3>ACT 1 · HARVEST <span class="act-when">2026 — happening now</span></h3>
        <div class="scene scene-harvest">
          <div class="node">${ICON.doc}<span>your traffic</span></div>
          <div class="wire" aria-hidden="true">${packets}</div>
          <div class="node">${ICON.drive}<span>adversary store</span></div>
        </div>
        <p class="act-cap">Encrypted packets are copied off the wire and stored. Unreadable today — kept anyway.</p>
      </div>

      <div class="act-card act-2">
        <h3>ACT 2 · WAIT <span class="act-when">years pass</span></h3>
        <div class="scene scene-wait">
          <div class="vault" aria-hidden="true">${vaultChips}</div>
          <div class="year-ticker" aria-hidden="true"><div class="year-reel">${years}</div></div>
        </div>
        <p class="act-cap">The ciphertext sits in storage. The lock holds — but waiting costs the attacker nothing.</p>
      </div>

      <div class="act-card act-3">
        <h3>ACT 3 · DECRYPT <span class="act-when">Q-Day</span></h3>
        <div class="scene scene-decrypt">
          <div class="node node-qpu">${ICON.qpu}<span>quantum computer</span></div>
          <div class="crack" aria-hidden="true">
            <span class="lock-swap"><span class="closed">${ICON.lock}</span><span class="open">${ICON.unlock}</span></span>
            <span class="reveal"><span class="cipher">●●●●●●●●</span><span class="plain">PLAINTEXT</span></span>
          </div>
        </div>
        <p class="act-cap">Shor's algorithm recovers the keys. Every harvested message — yours included — becomes readable at once.</p>
      </div>

      <div class="act-static" aria-hidden="true">
        <span class="step"><strong>1 · HARVEST</strong><span>copied &amp; stored today</span></span>
        <span class="arrow">→</span>
        <span class="step"><strong>2 · WAIT</strong><span>years in storage</span></span>
        <span class="arrow">→</span>
        <span class="step"><strong>3 · DECRYPT</strong><span>readable at Q-Day</span></span>
      </div>
    </div>
  `;
}

// Match the boot script's precedence: the shared header writes 'theme', this lab
// historically wrote 'cv-theme'. Honour 'theme' first so we never override the
// header toggle's most recent choice with a stale 'cv-theme' value.
const persistedTheme = localStorage.getItem('theme') ?? localStorage.getItem('cv-theme');
if (persistedTheme === 'dark' || persistedTheme === 'light') {
  document.documentElement.setAttribute('data-theme', persistedTheme);
}

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (!appRoot) {
  throw new Error('App root not found.');
}
const app: HTMLDivElement = appRoot;

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const timelineSorted = [...TIMELINE_EVENTS].sort((a, b) => a.year - b.year);
const timelineMin = timelineSorted[0]?.year ?? 2013;
const timelineMax = timelineSorted[timelineSorted.length - 1]?.year ?? 2035;

let selectedSector: SectorKey = 'healthcare';
let migrationYears = SECTOR_PRESETS.healthcare.migrationYears;
let sensitivityYears = SECTOR_PRESETS.healthcare.sensitivityYears;
let qDayYears = 8;
let matrixZ = 8;
// Index into timelineSorted (the array every consumer renders from), not the
// unsorted source — otherwise the initial highlight points at the wrong event
// the moment timeline.ts is reordered.
let selectedEventIndex = Math.max(
  timelineSorted.findIndex((event) => event.label.includes('YOU ARE HERE')),
  0,
);
let storageCounterTb = 0;

function getEventPosition(year: number): number {
  return ((year - timelineMin) / (timelineMax - timelineMin)) * 100;
}

function getTheme(): 'dark' | 'light' {
  const active = document.documentElement.getAttribute('data-theme');
  return active === 'light' ? 'light' : 'dark';
}

function setTheme(theme: 'dark' | 'light'): void {
  document.documentElement.setAttribute('data-theme', theme);
  // Write both keys so this lab and the shared header stay in sync.
  localStorage.setItem('theme', theme);
  localStorage.setItem('cv-theme', theme);
}

function categoryClass(event: TimelineEvent): string {
  switch (event.category) {
    case 'harvest':
      return 'harvest';
    case 'quantum-progress':
      return 'quantum';
    case 'standard':
      return 'standard';
    case 'qday-estimate':
      return 'qday';
    case 'migration':
      return 'migration';
    default:
      return 'standard';
  }
}

function timelineRow(event: TimelineEvent): 'above' | 'below' {
  return event.category === 'harvest' || event.category === 'quantum-progress' ? 'above' : 'below';
}

function createSectorTabs(): string {
  return sectorOrder
    .map((sector) => {
      const isActive = selectedSector === sector;
      return `<button class="sector-tab ${isActive ? 'active' : ''}" type="button" aria-pressed="${isActive}" data-sector="${sector}">${sectorTitles[sector]}</button>`;
    })
    .join('');
}

function createTimelineMarkers(): string {
  return timelineSorted
    .map((event, index) => {
      const row = timelineRow(event);
      const cls = categoryClass(event);
      const pos = getEventPosition(event.year);
      const isActive = index === selectedEventIndex;
      // Selection pattern (not disclosure): the detail panel is always visible and
      // only its content swaps, so aria-current is correct, not aria-expanded.
      return `
        <button
          type="button"
          class="timeline-event ${row} ${cls} ${isActive ? 'active' : ''}"
          data-event-index="${index}"
          style="left:${pos}%;"
          ${isActive ? 'aria-current="true"' : ''}
          aria-controls="timeline-details"
        >
          <span class="event-year">${event.year}</span>
          <span class="event-label">${event.label}</span>
        </button>
      `;
    })
    .join('');
}

function createTimelineList(): string {
  return timelineSorted
    .map((event, index) => {
      const cls = categoryClass(event);
      const isActive = index === selectedEventIndex;
      return `<button type="button" class="timeline-list-event ${cls} ${isActive ? 'active' : ''}" data-event-index="${index}" ${isActive ? 'aria-current="true"' : ''} aria-controls="timeline-details"><span>${event.year}</span>${event.label}</button>`;
    })
    .join('');
}

function createMitigationCards(): string {
  return mitigationCards
    .map((card) => {
      const body = card.lines.map((line) => `<li>${line}</li>`).join('');
      return `<details class="mitigation-card"><summary>${card.title}</summary><ul>${body}</ul></details>`;
    })
    .join('');
}

function renderSectorContext(): string {
  if (selectedSector === 'custom') {
    return `
      <h3>CUSTOM CONTEXT</h3>
      <p>Use the sliders to model your own environment and sensitivity horizon. The risk condition remains fixed: X + Y > Z means the data is at risk.</p>
      <ul>
        <li>Model your real migration timeline, not your best case</li>
        <li>Use conservative and optimistic Q-Day estimates</li>
        <li>Treat long-lived encrypted archives as harvest targets</li>
      </ul>
    `;
  }

  const data = sectorContext[selectedSector];
  return `
    <h3>${data.heading}</h3>
    ${data.body.map((line) => `<p>${line}</p>`).join('')}
    <ul>${data.bullets.map((line) => `<li>${line}</li>`).join('')}</ul>
  `;
}

function harvestBarInner(qDayYearAbsolute: number): string {
  // One shared scale from 2013 to a horizon just past Q-Day, so all three
  // segments are proportional and sum to 100% — no fixed-width fudge factor.
  const horizon = Math.max(qDayYearAbsolute + 5, timelineMax);
  const total = Math.max(horizon - timelineMin, 1);
  const pastPct = ((CURRENT_YEAR - timelineMin) / total) * 100;
  const nowPct = ((qDayYearAbsolute - CURRENT_YEAR) / total) * 100;
  const decryptPct = ((horizon - qDayYearAbsolute) / total) * 100;
  return `
    <div class="harvested-past" style="width:${Math.max(pastPct, 0)}%">already harvested</div>
    <div class="harvested-now" style="width:${Math.max(nowPct, 0)}%">being harvested now</div>
    <div class="harvested-qday" style="width:${Math.max(decryptPct, 0)}%">decryptable at Q-Day</div>
  `;
}

// One short line for the polite live region — announcing the full verdict block on
// every slider 'input' would flood a screen reader. This coalesces to the latest.
function moscaStatus(mosca: MoscaResult): string {
  return `${mosca.atRisk ? 'At risk' : 'Not at risk'}, ${mosca.riskLevel}. X plus Y is ${mosca.XplusY} years, Z is ${mosca.Z} years.`;
}

function verdictInner(mosca: MoscaResult): string {
  const neededStart = mosca.dataExposureYear - mosca.X;
  const yearsBehind = CURRENT_YEAR - neededStart;
  const sign = mosca.XplusY > mosca.Z ? '>' : mosca.XplusY === mosca.Z ? '=' : '<';
  // Data encrypted *today* has sensitivity Y, so it outlives Q-Day by Y - Z.
  // The full X + Y - Z margin applies to data encrypted at the END of migration.
  const todayMargin = mosca.Y - mosca.Z;
  const atRiskBody = mosca.atRisk
    ? `Data encrypted during your ${mosca.X}-year migration stays sensitive up to ${mosca.riskMargin} year(s) past Q-Day${
        todayMargin > 0 ? `; data encrypted today alone outlives Q-Day by ${todayMargin} year(s)` : ''
      }. An adversary collecting now can read it later.`
    : `Current buffer: migration and data sensitivity both complete ${Math.abs(mosca.riskMargin)} year(s) before this Q-Day estimate.`;
  return `
    <p class="math">X + Y = ${mosca.X} + ${mosca.Y} = ${mosca.XplusY} years</p>
    <p class="math">Z = ${mosca.Z} years</p>
    <p class="math">${mosca.XplusY} ${sign} ${mosca.Z}</p>
    <p class="verdict-line">${
      mosca.atRisk
        ? `AT RISK - ${mosca.riskLevel.toUpperCase()}`
        : `NOT AT RISK - ${mosca.riskLevel.toUpperCase()}`
    }</p>
    <p>${atRiskBody}</p>
    <p>Q-Day estimate year: ${mosca.dataExposureYear}. To finish by then, migration needed to start by ${neededStart}.</p>
    <p>${
      yearsBehind > 0
        ? `You are already ${yearsBehind} year(s) behind this schedule.`
        : 'You are still inside the migration window if execution starts now.'
    }</p>
  `;
}

// Update only the parts of the DOM that depend on the X/Y/Z sliders, WITHOUT
// rebuilding the whole app — rebuilding would destroy the <input> the user is
// dragging (breaking continuous drag, badly so on touch/mobile).
function refreshDynamic(): void {
  const qDayYearAbsolute = CURRENT_YEAR + qDayYears;
  const mosca = computeMosca({ migrationYears, sensitivityYears, qDayYears }, CURRENT_YEAR);

  const setText = (sel: string, value: string): void => {
    const el = document.querySelector<HTMLElement>(sel);
    if (el) el.textContent = value;
  };
  setText('#x-value', String(migrationYears));
  setText('#y-value', String(sensitivityYears));
  setText('#z-value', String(qDayYears));
  setText('#z-year', String(qDayYearAbsolute));

  const verdict = document.querySelector<HTMLElement>('.verdict');
  if (verdict) {
    verdict.className = `verdict ${mosca.riskLevel}`;
    verdict.innerHTML = verdictInner(mosca);
  }
  setText('#mosca-status', moscaStatus(mosca));

  const scenarioStrip = document.querySelector<HTMLElement>('#scenario-strip');
  if (scenarioStrip) scenarioStrip.innerHTML = createScenarioStrip();

  const sectorContext = document.querySelector<HTMLElement>('.sector-context');
  if (sectorContext) sectorContext.innerHTML = renderSectorContext();

  document.querySelectorAll<HTMLButtonElement>('.sector-tab').forEach((button) => {
    const active = button.dataset.sector === selectedSector;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  const marker = document.querySelector<HTMLElement>('#qday-marker');
  if (marker) {
    marker.style.left = `${getEventPosition(qDayYearAbsolute)}%`;
    marker.textContent = `Q-Day estimate (${qDayYearAbsolute})`;
  }

  const bar = document.querySelector<HTMLElement>('#harvest-bar');
  if (bar) bar.innerHTML = harvestBarInner(qDayYearAbsolute);
}

function renderApp(): void {
  const qDayYearAbsolute = CURRENT_YEAR + qDayYears;
  const qDayPos = getEventPosition(qDayYearAbsolute);
  const nowPos = getEventPosition(CURRENT_YEAR);
  const bandStart = getEventPosition(2028);
  const bandEnd = getEventPosition(2035);

  const mosca = computeMosca({ migrationYears, sensitivityYears, qDayYears }, CURRENT_YEAR);

  app.innerHTML = `
    <button id="theme-toggle" class="theme-toggle" type="button" aria-label="Toggle theme">${
      getTheme() === 'dark' ? '☀' : '🌙'
    }</button>

    <main>
      <section class="panel hero-panel" id="threat">
        <h1>The breach has already happened.<br/>You just don't know it yet.</h1>
        <p class="lead">Adversaries are collecting your encrypted communications today. RSA and ECC cannot be broken now - but they will be. When quantum computers arrive, every stored ciphertext becomes readable.</p>
        <p class="lead">This is Harvest Now, Decrypt Later. It is not a future threat. It is a present collection strategy.</p>

        ${createActStrip()}

        <div class="counter-box">
          ${
            prefersReducedMotion
              ? `<p>RSA/ECC-encrypted traffic harvestable worldwide, every second:</p>
          <p class="counter-value">~${TRAFFIC_TB_PER_SECOND} TB / second</p>`
              : `<p>Data encrypted with RSA/ECC since this page loaded:</p>
          <p class="counter-value"><span id="traffic-counter">${storageCounterTb.toLocaleString('en-US', {
            maximumFractionDigits: 0,
          })}</span> TB</p>`
          }
          <p>Estimated storage cost for a nation-state actor: $0.002</p>
          <p class="small-note">Source: Global internet traffic ~5 Exabytes/day. RSA/ECC: ~40% of HTTPS. Illustrative - for scale.</p>
        </div>
      </section>

      <section class="panel threatmodel-panel" id="threatmodel">
        <h2>THE THREAT MODEL, STATED PLAINLY</h2>
        <p class="lead">Before the math, be precise about who does what. Overclaiming ("quantum breaks all encryption") is as unhelpful as dismissing it. Here is the actual model.</p>
        ${createThreatModel()}
      </section>

      <section class="panel breaks-panel" id="whatbreaks">
        <h2>WHAT QUANTUM BREAKS — AND WHAT IT DOESN'T</h2>
        <p class="lead">The harvest does not attack the cipher protecting your session. It attacks the <strong>handshake</strong> that established the session key. Break the handshake, recover the key, read everything underneath. That is why "we use AES-256" is not an answer.</p>
        <div class="breaks-grid">
          <article class="breaks-col broken">
            <h3>BROKEN — by Shor's algorithm</h3>
            <p class="breaks-sub">Public-key crypto. Exponential speedup collapses it to effectively zero security.</p>
            <ul>
              <li>RSA-2048 <span>key transport &amp; signatures</span></li>
              <li>ECC P-256 / secp256k1 <span>ECDH, ECDSA</span></li>
              <li>Diffie–Hellman, ECDHE <span>the TLS handshake</span></li>
            </ul>
            <p class="breaks-foot">This is the HNDL target. The handshake is recorded today and cracked at Q-Day.</p>
          </article>
          <article class="breaks-col safe">
            <h3>SURVIVES — only dented by Grover</h3>
            <p class="breaks-sub">Symmetric crypto &amp; hashes. Quadratic speedup only — answered by doubling the key.</p>
            <ul>
              <li>AES-256 <span>→ 128-bit security. Safe.</span></li>
              <li>SHA-256 / SHA-512 <span>→ still collision-resistant</span></li>
              <li>ChaCha20-Poly1305 <span>→ symmetric, safe</span></li>
            </ul>
            <p class="breaks-foot">Grover halves the bits of security, not the data. AES-256 lands at 128-bit — still out of reach.</p>
          </article>
        </div>
        <p class="breaks-note small-note">So why doesn't symmetric safety save you? Because that AES session key was delivered by the public-key handshake. Quantum breaks the handshake, recovers the AES key, and decrypts the session — even though AES itself was never broken. See <strong>crypto-lab-grover</strong> for the symmetric story and <strong>crypto-lab-shor</strong> for the attack itself.</p>
        ${checkpoint(
          'does AES-256 fail under Shor’s algorithm?',
          'No. Shor breaks public-key crypto (RSA/ECC key exchange and signatures). AES-256 faces only Grover, which halves its security to a still-safe ~128-bit level. The handshake is the HNDL target, not the bulk cipher.',
        )}
      </section>

      <section class="panel protocols-panel" id="protocols">
        <h2>SAME THREAT, FOUR REAL PROTOCOLS</h2>
        <p class="lead">The difference between "exposed" and "protected" is concrete. Here is how the same harvested-traffic threat plays out across protocols you actually run.</p>
        <div class="protocol-grid">${createProtocolExamples()}</div>
        ${checkpoint(
          'does TLS 1.3 forward secrecy (ECDHE) survive harvesting?',
          'Not against HNDL. ECDHE protects against a future server-key compromise, but the ephemeral handshake is in the captured transcript and falls to Shor. Hybrid X25519+ML-KEM is what survives.',
        )}
      </section>

      <section class="panel myths-panel" id="myths">
        <h2>FIVE THINGS PEOPLE GET WRONG</h2>
        <p class="lead">Corrected misconceptions stick better than isolated facts. If you remember nothing else, remember why each of these is wrong.</p>
        <div class="myth-grid">${createMisconceptions()}</div>
      </section>

      <section class="panel timeline-panel" id="timeline">
        <h2>THE HNDL TIMELINE</h2>
        <div class="timeline-ribbon-wrap">
          <div class="timeline-ribbon" style="min-width:1200px;">
            <div class="qday-band" style="left:${bandStart}%;width:${Math.max(bandEnd - bandStart, 1)}%;">
              Q-Day probability window (2028-2035, consensus center: ~2030)
            </div>
            <div class="timeline-line"></div>
            <div class="you-are-here" style="left:${nowPos}%">
              <span>YOU ARE HERE</span>
            </div>
            <div class="qday-estimate-marker" id="qday-marker" style="left:${qDayPos}%">Q-Day estimate (${qDayYearAbsolute})</div>
            ${createTimelineMarkers()}
          </div>
        </div>
        <div class="timeline-list" aria-label="Timeline mobile list">${createTimelineList()}</div>
        <article id="timeline-details" class="timeline-details" tabindex="-1">
          <h3>${timelineSorted[selectedEventIndex]?.label ?? 'Timeline event'}</h3>
          <p>${timelineSorted[selectedEventIndex]?.description ?? ''}</p>
          <p class="small-note">${timelineSorted[selectedEventIndex]?.source ? `Source: ${timelineSorted[selectedEventIndex].source}` : 'Source: educational synthesis of public reporting and standards documents.'}</p>
        </article>

        <div class="harvest-bar-wrap">
          <h3>Harvested Data Accumulation</h3>
          <div class="harvest-bar" id="harvest-bar" role="img" aria-label="Encrypted data accumulating from 2013, through the harvest happening now, into the window where it becomes decryptable at Q-Day">${harvestBarInner(qDayYearAbsolute)}</div>
        </div>
        ${checkpoint(
          'can deploying PQC today protect traffic captured last year?',
          'No. PQC protects new sessions from deployment onward. Last year’s captured ciphertext is already in the adversary’s store; only protection in place before collection — or never sending it — helps.',
        )}
      </section>

      <section class="panel calculator-panel" id="mosca">
        <h2>MOSCA'S THEOREM: X + Y &gt; Z</h2>
        <div class="sector-tabs" role="group" aria-label="Sector selector">${createSectorTabs()}</div>

        <div class="sliders">
          <label for="x-slider">X - Migration time (years to complete PQC transition): <span id="x-value">${migrationYears}</span> years</label>
          <input id="x-slider" type="range" min="1" max="15" value="${migrationYears}" aria-valuemin="1" aria-valuemax="15" aria-valuenow="${migrationYears}" aria-valuetext="${migrationYears} years" />
          <p class="small-note">How long will it take your organization to fully deploy post-quantum cryptography?</p>

          <label for="y-slider">Y - Data sensitivity lifetime (years data must remain secret): <span id="y-value">${sensitivityYears}</span> years</label>
          <input id="y-slider" type="range" min="1" max="80" value="${sensitivityYears}" aria-valuemin="1" aria-valuemax="80" aria-valuenow="${sensitivityYears}" aria-valuetext="${sensitivityYears} years" />
          <p class="small-note">How long must this data stay confidential? Genetic data can exceed 80 years.</p>

          <label for="z-slider">Z - Q-Day estimate (years until cryptographically relevant quantum computer): <span id="z-value">${qDayYears}</span> years (<span id="z-year">${qDayYearAbsolute}</span>)</label>
          <input id="z-slider" type="range" min="1" max="20" value="${qDayYears}" aria-valuemin="1" aria-valuemax="20" aria-valuenow="${qDayYears}" aria-valuetext="${qDayYears} years" />
          <p class="small-note">Consensus range: 2028-2035, centered near 2030 +- 3 years. Use ranges, not certainties.</p>
        </div>

        <p class="sr-only" id="mosca-status" role="status" aria-live="polite">${moscaStatus(mosca)}</p>
        <article class="verdict ${mosca.riskLevel}">${verdictInner(mosca)}</article>

        <div class="scenario-block">
          <h3>Across the plausible Q-Day range</h3>
          <p class="small-note">Same X and Y, three Q-Day estimates. The lesson isn't the exact date — it's whether you survive the whole range.</p>
          <div class="scenario-strip" id="scenario-strip">${createScenarioStrip()}</div>
        </div>
        ${checkpoint(
          'data must stay secret 30 years, migration takes 5, Q-Day is ~10 years out — at risk?',
          'Yes. 5 + 30 = 35, which is greater than 10. X + Y exceeds Z, so data encrypted during migration is still sensitive long after Q-Day.',
        )}

        <article class="sector-context">${renderSectorContext()}</article>
      </section>

      <section class="panel matrix-panel" id="mitigations">
        <h2>SECTOR RISK MATRIX + MITIGATIONS</h2>
        <div class="matrix-wrap">
          <div class="matrix-controls">
            <span class="small-note">Q-Day assumption:</span>
            <div class="matrix-z" role="group" aria-label="Q-Day assumption for the matrix">${createMatrixZToggle()}</div>
          </div>
          <div class="matrix-grid" id="matrix-grid" role="group" aria-label="Sector risk matrix: horizontal axis migration difficulty, vertical axis data sensitivity">
            <div class="matrix-axis-x">Migration Difficulty: Easy → Hard</div>
            <div class="matrix-axis-y">Data Sensitivity: Low → High</div>
            ${createMatrixDots()}
          </div>
          <div class="matrix-legend small-note">
            <span><span class="legend-dot at"></span> at risk (X + Y &gt; Z)</span>
            <span><span class="legend-dot ok"></span> not at risk</span>
            <span>Move the Q-Day slider above to watch dots cross between states.</span>
          </div>
          <article class="matrix-info" id="matrix-info" aria-live="polite">
            Hover or focus a sector dot to see its profile at the selected Q-Day; activate it to load that sector into the calculator above.
          </article>
        </div>

        <div class="mitigation-list">
          ${createMitigationCards()}
        </div>

        <article class="urgent-reality">
          <h3>THE BREACH WINDOW IS OPEN NOW</h3>
          <p>Data encrypted today with RSA-2048 or ECC can become retroactively readable when cryptographically relevant quantum computers arrive, whether closer to 2030 or 2035.</p>
          <p>Organizations protecting 10+ year sensitivity data cannot wait for Q-Day to begin migration. By the time capability exists, adversaries may already hold years of collected ciphertext.</p>
          <p>The NSA stated in 2022 that the threat is significant enough to begin migrating immediately, even though large-scale quantum computers capable of breaking encryption do not yet exist.</p>
          <p>2026 has been designated the Year of Quantum Security by FBI, NIST, and CISA.</p>
          <p>If you are not migrating, you are being harvested.</p>
        </article>
      </section>

      <section class="panel evidence-panel" id="evidence">
        <h2>EVIDENCE &amp; CONFIDENCE</h2>
        <p class="lead">This topic is easy to dismiss as speculation, so every major claim is labelled by how well-established it is — and linked to a primary source. Expand any claim to see the basis.</p>
        <div class="conf-legend" role="list">
          ${(Object.keys(CONFIDENCE_LABEL) as Confidence[])
            .map((k) => `<span role="listitem">${confidenceBadge(k)} <span class="small-note">${CONFIDENCE_BLURB[k]}</span></span>`)
            .join('')}
        </div>
        <div class="evidence-list">${createEvidence()}</div>
      </section>
    </main>

    <footer>
      <p>"Whether therefore ye eat, or drink, or whatsoever ye do,
      do all to the glory of God." — 1 Corinthians 10:31</p>
    </footer>
  `;

  const toggle = document.querySelector<HTMLButtonElement>('#theme-toggle');
  toggle?.addEventListener('click', () => {
    const nextTheme = getTheme() === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    renderApp();
  });

  // Native <button> elements already activate on Enter/Space, so no keydown shim
  // is needed (it would double-fire). renderApp() rebuilds the DOM and drops focus
  // to <body>; we restore it so keyboard/SR users keep their place (WCAG 2.4.3).
  document.querySelectorAll<HTMLButtonElement>('.timeline-event, .timeline-list-event').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.eventIndex);
      if (!Number.isNaN(index)) {
        selectedEventIndex = index;
        renderApp();
        // Move focus to the detail panel so its refreshed content is announced.
        document.querySelector<HTMLElement>('#timeline-details')?.focus();
      }
    });
  });

  document.querySelectorAll<HTMLButtonElement>('.sector-tab').forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.sector as SectorKey;
      selectedSector = key;
      if (key !== 'custom') {
        migrationYears = SECTOR_PRESETS[key].migrationYears;
        sensitivityYears = SECTOR_PRESETS[key].sensitivityYears;
      }
      renderApp();
      // Re-focus the same tab after the rebuild.
      document.querySelector<HTMLElement>(`.sector-tab[data-sector="${key}"]`)?.focus();
    });
  });

  const xSlider = document.querySelector<HTMLInputElement>('#x-slider');
  const ySlider = document.querySelector<HTMLInputElement>('#y-slider');
  const zSlider = document.querySelector<HTMLInputElement>('#z-slider');

  const updateSlider = (slider: HTMLInputElement, value: number): void => {
    slider.setAttribute('aria-valuenow', String(value));
    slider.setAttribute('aria-valuetext', `${value} years`);
  };

  // Slider input updates the DOM in place (refreshDynamic) rather than re-rendering
  // the whole app — re-rendering would replace the <input> mid-drag and break the gesture.
  xSlider?.addEventListener('input', () => {
    migrationYears = Number(xSlider.value);
    selectedSector = 'custom';
    updateSlider(xSlider, migrationYears);
    refreshDynamic();
  });

  ySlider?.addEventListener('input', () => {
    sensitivityYears = Number(ySlider.value);
    selectedSector = 'custom';
    updateSlider(ySlider, sensitivityYears);
    refreshDynamic();
  });

  zSlider?.addEventListener('input', () => {
    qDayYears = Number(zSlider.value);
    updateSlider(zSlider, qDayYears);
    refreshDynamic();
  });

  document.querySelectorAll<HTMLButtonElement>('.matrix-dot').forEach((dot) => {
    const show = (): void => {
      const key = dot.dataset.matrixSector as keyof typeof SECTOR_PRESETS;
      const preset = SECTOR_PRESETS[key];
      const result = computeMosca(
        { migrationYears: preset.migrationYears, sensitivityYears: preset.sensitivityYears, qDayYears: matrixZ },
        CURRENT_YEAR,
      );
      const info = document.querySelector<HTMLElement>('#matrix-info');
      if (info) {
        info.innerHTML = `<strong>${preset.label}</strong> — X=${result.X}, Y=${result.Y}, Z=${matrixZ} ⇒ X+Y=${result.XplusY}. <strong>${result.riskLevel.toUpperCase()}</strong> (${result.atRisk ? 'at risk' : 'not at risk'}).<br><span class="small-note">${SECTOR_RATIONALE[key] ?? ''} Activate to load this sector into the calculator.</span>`;
      }
    };

    dot.addEventListener('mouseenter', show);
    dot.addEventListener('focus', show);
    dot.addEventListener('click', () => {
      const key = dot.dataset.matrixSector as keyof typeof SECTOR_PRESETS;
      selectedSector = key;
      migrationYears = SECTOR_PRESETS[key].migrationYears;
      sensitivityYears = SECTOR_PRESETS[key].sensitivityYears;
      renderApp();
      document
        .querySelector<HTMLElement>('#mosca')
        ?.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
      document.querySelector<HTMLElement>(`.sector-tab[data-sector="${key}"]`)?.focus();
    });
  });

  document.querySelectorAll<HTMLButtonElement>('.matrix-z-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      matrixZ = Number(btn.dataset.matrixZ);
      renderApp();
      document.querySelector<HTMLElement>(`.matrix-z-btn[data-matrix-z="${matrixZ}"]`)?.focus();
    });
  });
}

renderApp();

// The live counter is auto-updating content (WCAG 2.2.2). Honour reduced-motion by
// not running it at all — the markup shows a static rate instead (see counter-box).
if (!prefersReducedMotion) {
  setInterval(() => {
    storageCounterTb += TRAFFIC_TB_PER_SECOND;
    const counter = document.querySelector<HTMLElement>('#traffic-counter');
    if (counter) {
      counter.textContent = storageCounterTb.toLocaleString('en-US', {
        maximumFractionDigits: 0,
      });
    }
  }, 1000);
}
