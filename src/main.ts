import './style.css';
import { computeMosca, SECTOR_PRESETS } from './mosca';
import { TIMELINE_EVENTS, type TimelineEvent } from './timeline';

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

const appRoot = document.querySelector<HTMLDivElement>('#app');
if (!appRoot) {
  throw new Error('App root not found.');
}
const app: HTMLDivElement = appRoot;

let selectedSector: SectorKey = 'healthcare';
let migrationYears = SECTOR_PRESETS.healthcare.migrationYears;
let sensitivityYears = SECTOR_PRESETS.healthcare.sensitivityYears;
let qDayYears = 8;
let selectedEventIndex = TIMELINE_EVENTS.findIndex((event) => event.label.includes('YOU ARE HERE'));
let storageCounterTb = 0;

const timelineSorted = [...TIMELINE_EVENTS].sort((a, b) => a.year - b.year);
const timelineMin = timelineSorted[0]?.year ?? 2013;
const timelineMax = timelineSorted[timelineSorted.length - 1]?.year ?? 2035;

function getEventPosition(year: number): number {
  return ((year - timelineMin) / (timelineMax - timelineMin)) * 100;
}

function getTheme(): 'dark' | 'light' {
  const active = document.documentElement.getAttribute('data-theme');
  return active === 'light' ? 'light' : 'dark';
}

function setTheme(theme: 'dark' | 'light'): void {
  document.documentElement.setAttribute('data-theme', theme);
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
      const active = selectedSector === sector ? 'active' : '';
      return `<button class="sector-tab ${active}" type="button" data-sector="${sector}">${sectorTitles[sector]}</button>`;
    })
    .join('');
}

function createTimelineMarkers(): string {
  return timelineSorted
    .map((event, index) => {
      const row = timelineRow(event);
      const cls = categoryClass(event);
      const pos = getEventPosition(event.year);
      const active = index === selectedEventIndex ? 'active' : '';
      return `
        <button
          type="button"
          class="timeline-event ${row} ${cls} ${active}"
          data-event-index="${index}"
          style="left:${pos}%;"
          aria-expanded="${active ? 'true' : 'false'}"
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
      const active = index === selectedEventIndex ? 'active' : '';
      return `<button type="button" class="timeline-list-event ${cls} ${active}" data-event-index="${index}"><span>${event.year}</span>${event.label}</button>`;
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
      <h4>CUSTOM CONTEXT</h4>
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
    <h4>${data.heading}</h4>
    ${data.body.map((line) => `<p>${line}</p>`).join('')}
    <ul>${data.bullets.map((line) => `<li>${line}</li>`).join('')}</ul>
  `;
}

function renderApp(): void {
  const qDayYearAbsolute = CURRENT_YEAR + qDayYears;
  const qDayPos = getEventPosition(qDayYearAbsolute);
  const nowPos = getEventPosition(CURRENT_YEAR);
  const bandStart = getEventPosition(2028);
  const bandEnd = getEventPosition(2035);
  const totalWindow = Math.max(qDayYearAbsolute - timelineMin, 1);
  const harvestedPast = ((CURRENT_YEAR - timelineMin) / totalWindow) * 100;
  const harvestedNow = ((qDayYearAbsolute - CURRENT_YEAR) / totalWindow) * 100;

  const mosca = computeMosca(
    {
      migrationYears,
      sensitivityYears,
      qDayYears,
    },
    CURRENT_YEAR,
  );

  const neededStart = mosca.dataExposureYear - mosca.X;
  const yearsBehind = CURRENT_YEAR - neededStart;
  const sign = mosca.XplusY > mosca.Z ? '>' : mosca.XplusY === mosca.Z ? '=' : '<';

  app.innerHTML = `
    <button id="theme-toggle" class="theme-toggle" type="button" aria-label="Toggle theme">${
      getTheme() === 'dark' ? '☀' : '🌙'
    }</button>

    <main>
      <section class="panel hero-panel" id="threat">
        <h1>The breach has already happened.<br/>You just don't know it yet.</h1>
        <p class="lead">Adversaries are collecting your encrypted communications today. RSA and ECC cannot be broken now - but they will be. When quantum computers arrive, every stored ciphertext becomes readable.</p>
        <p class="lead">This is Harvest Now, Decrypt Later. It is not a future threat. It is a present collection strategy.</p>

        <div class="act-strip" aria-label="Three-act HNDL model">
          <div class="act-card act-1">
            <h3>ACT 1: HARVEST (2026)</h3>
            <p>Your data -> [padlock] -> adversary collector</p>
          </div>
          <div class="act-card act-2">
            <h3>ACT 2: WAIT</h3>
            <p>[vault rack] years ticking: 2026...2027...2028...</p>
          </div>
          <div class="act-card act-3">
            <h3>ACT 3: DECRYPT (Q-DAY)</h3>
            <p>[quantum computer] -> keys recovered -> plaintext exposed</p>
          </div>
          <div class="act-static" aria-hidden="true">
            <p><strong>HARVEST</strong> -> <strong>WAIT</strong> -> <strong>DECRYPT</strong></p>
          </div>
        </div>

        <div class="counter-box">
          <p>Data encrypted with RSA/ECC since this page loaded:</p>
          <p class="counter-value"><span id="traffic-counter">${storageCounterTb.toLocaleString('en-US', {
            maximumFractionDigits: 0,
          })}</span> TB</p>
          <p>Estimated storage cost for a nation-state actor: $0.002</p>
          <p class="small-note">Source: Global internet traffic ~5 Exabytes/day. RSA/ECC: ~40% of HTTPS. Illustrative - for scale.</p>
        </div>
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
            <div class="qday-estimate-marker" style="left:${qDayPos}%">Q-Day estimate (${qDayYearAbsolute})</div>
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
          <div class="harvest-bar" role="img" aria-label="Data accumulation from 2013 through Q-Day">
            <div class="harvested-past" style="width:${Math.max(harvestedPast, 0)}%">already harvested</div>
            <div class="harvested-now" style="width:${Math.max(harvestedNow, 0)}%">being harvested now</div>
            <div class="harvested-qday">decryptable</div>
          </div>
        </div>
      </section>

      <section class="panel calculator-panel" id="mosca">
        <h2>MOSCA'S THEOREM: X + Y &gt; Z</h2>
        <div class="sector-tabs" role="tablist" aria-label="Sector selector">${createSectorTabs()}</div>

        <div class="sliders">
          <label for="x-slider">X - Migration time (years to complete PQC transition): <span id="x-value">${migrationYears}</span> years</label>
          <input id="x-slider" type="range" min="1" max="15" value="${migrationYears}" aria-valuemin="1" aria-valuemax="15" aria-valuenow="${migrationYears}" aria-valuetext="${migrationYears} years" />
          <p class="small-note">How long will it take your organization to fully deploy post-quantum cryptography?</p>

          <label for="y-slider">Y - Data sensitivity lifetime (years data must remain secret): <span id="y-value">${sensitivityYears}</span> years</label>
          <input id="y-slider" type="range" min="1" max="80" value="${sensitivityYears}" aria-valuemin="1" aria-valuemax="80" aria-valuenow="${sensitivityYears}" aria-valuetext="${sensitivityYears} years" />
          <p class="small-note">How long must this data stay confidential? Genetic data can exceed 80 years.</p>

          <label for="z-slider">Z - Q-Day estimate (years until cryptographically relevant quantum computer): <span id="z-value">${qDayYears}</span> years (${qDayYearAbsolute})</label>
          <input id="z-slider" type="range" min="1" max="20" value="${qDayYears}" aria-valuemin="1" aria-valuemax="20" aria-valuenow="${qDayYears}" aria-valuetext="${qDayYears} years" />
          <p class="small-note">Consensus range: 2028-2035, centered near 2030 +- 3 years. Use ranges, not certainties.</p>
        </div>

        <article class="verdict ${mosca.riskLevel}" aria-live="polite">
          <p class="math">X + Y = ${mosca.X} + ${mosca.Y} = ${mosca.XplusY} years</p>
          <p class="math">Z = ${mosca.Z} years</p>
          <p class="math">${mosca.XplusY} ${sign} ${mosca.Z}</p>
          <p class="verdict-line">${
            mosca.atRisk
              ? `AT RISK - ${mosca.riskLevel.toUpperCase()}`
              : `NOT AT RISK - ${mosca.riskLevel.toUpperCase()}`
          }</p>
          <p>${
            mosca.atRisk
              ? `Data encrypted today will still be sensitive ${mosca.riskMargin} years after Q-Day arrives. An adversary collecting now can read it later.`
              : `Current buffer: data sensitivity and migration complete ${Math.abs(mosca.riskMargin)} years before this Q-Day estimate.`
          }</p>
          <p>Q-Day estimate year: ${mosca.dataExposureYear}. To finish by then, migration needed to start by ${neededStart}.</p>
          <p>${yearsBehind > 0 ? `You are already ${yearsBehind} year(s) behind this schedule.` : 'You are still inside the migration window if execution starts now.'}</p>
        </article>

        <article class="sector-context">${renderSectorContext()}</article>
      </section>

      <section class="panel matrix-panel" id="mitigations">
        <h2>SECTOR RISK MATRIX + MITIGATIONS</h2>
        <div class="matrix-wrap">
          <div class="matrix-grid" aria-label="Sector risk matrix">
            <div class="matrix-axis-x">Migration Difficulty: Easy -> Hard</div>
            <div class="matrix-axis-y">Data Sensitivity: Low -> High</div>
            ${Object.entries(SECTOR_PRESETS)
              .map(([key, preset]) => {
                const x = Math.min(Math.max((preset.migrationYears / 10) * 100, 10), 95);
                const y = Math.min(Math.max((preset.sensitivityYears / 50) * 100, 10), 95);
                const risk = computeMosca(
                  {
                    migrationYears: preset.migrationYears,
                    sensitivityYears: preset.sensitivityYears,
                    qDayYears: 8,
                  },
                  CURRENT_YEAR,
                );
                return `<button class="matrix-dot ${risk.riskLevel}" style="left:${x}%;bottom:${y}%" type="button" data-matrix-sector="${key}">${preset.label}</button>`;
              })
              .join('')}
          </div>
          <article class="matrix-info" id="matrix-info">
            Hover or click a sector dot to view its default Mosca profile at Z = 8 years.
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

  document.querySelectorAll<HTMLButtonElement>('.timeline-event, .timeline-list-event').forEach((button) => {
    button.addEventListener('click', () => {
      const index = Number(button.dataset.eventIndex);
      if (!Number.isNaN(index)) {
        selectedEventIndex = index;
        renderApp();
      }
    });

    button.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        button.click();
      }
    });
  });

  const tabButtons = document.querySelectorAll<HTMLButtonElement>('.sector-tab');
  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      const key = button.dataset.sector as SectorKey;
      selectedSector = key;
      if (key !== 'custom') {
        migrationYears = SECTOR_PRESETS[key].migrationYears;
        sensitivityYears = SECTOR_PRESETS[key].sensitivityYears;
      }
      renderApp();
    });
  });

  const xSlider = document.querySelector<HTMLInputElement>('#x-slider');
  const ySlider = document.querySelector<HTMLInputElement>('#y-slider');
  const zSlider = document.querySelector<HTMLInputElement>('#z-slider');

  const updateSlider = (slider: HTMLInputElement, value: number): void => {
    slider.setAttribute('aria-valuenow', String(value));
    slider.setAttribute('aria-valuetext', `${value} years`);
  };

  xSlider?.addEventListener('input', () => {
    migrationYears = Number(xSlider.value);
    selectedSector = 'custom';
    updateSlider(xSlider, migrationYears);
    renderApp();
  });

  ySlider?.addEventListener('input', () => {
    sensitivityYears = Number(ySlider.value);
    selectedSector = 'custom';
    updateSlider(ySlider, sensitivityYears);
    renderApp();
  });

  zSlider?.addEventListener('input', () => {
    qDayYears = Number(zSlider.value);
    updateSlider(zSlider, qDayYears);
    renderApp();
  });

  document.querySelectorAll<HTMLButtonElement>('.matrix-dot').forEach((dot) => {
    const show = (): void => {
      const key = dot.dataset.matrixSector as keyof typeof SECTOR_PRESETS;
      const preset = SECTOR_PRESETS[key];
      const result = computeMosca(
        {
          migrationYears: preset.migrationYears,
          sensitivityYears: preset.sensitivityYears,
          qDayYears: 8,
        },
        CURRENT_YEAR,
      );
      const info = document.querySelector<HTMLElement>('#matrix-info');
      if (info) {
        info.textContent = `${preset.label}: X=${result.X}, Y=${result.Y}, Z=8 => X+Y=${result.XplusY}. Risk: ${result.riskLevel.toUpperCase()} (${result.atRisk ? 'at risk' : 'not at risk'}).`;
      }
    };

    dot.addEventListener('mouseenter', show);
    dot.addEventListener('focus', show);
    dot.addEventListener('click', show);
  });
}

renderApp();

setInterval(() => {
  storageCounterTb += TRAFFIC_TB_PER_SECOND;
  const counter = document.querySelector<HTMLElement>('#traffic-counter');
  if (counter) {
    counter.textContent = storageCounterTb.toLocaleString('en-US', {
      maximumFractionDigits: 0,
    });
  }
}, 1000);
