(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e={government:{label:`Government / Classified`,migrationYears:10,sensitivityYears:30,description:`Classified communications, diplomatic cables, intelligence`,examples:[`NSA intercepts`,`State Dept cables`,`Military comms`]},healthcare:{label:`Healthcare`,migrationYears:7,sensitivityYears:50,description:`Patient records, genetic data, clinical research`,examples:[`EHR records`,`Genomic sequences`,`Insurance data`]},finance:{label:`Financial Services`,migrationYears:5,sensitivityYears:20,description:`Trading strategies, M&A plans, regulatory filings`,examples:[`SWIFT messages`,`Algorithmic trading`,`M&A negotiations`]},legal:{label:`Legal / Law Firms`,migrationYears:5,sensitivityYears:40,description:`Attorney-client privilege, litigation strategy`,examples:[`Privileged emails`,`Case strategy`,`Client communications`]},library:{label:`Public Library`,migrationYears:4,sensitivityYears:30,description:`Patron privacy, reading records, registration data`,examples:[`Patron records`,`ILS API traffic`,`Registration PII`]},enterprise:{label:`Enterprise / Corporate`,migrationYears:5,sensitivityYears:10,description:`IP, trade secrets, product roadmaps`,examples:[`R&D communications`,`Product plans`,`HR records`]},personal:{label:`Personal`,migrationYears:1,sensitivityYears:10,description:`Personal emails, financial accounts, health records`,examples:[`Gmail`,`Online banking`,`Health portals`]}};function t(e){return e>20?`critical`:e>10?`high`:e>0?`moderate`:e>-5?`low`:`safe`}function n(e,t,n,r){if(e)return`At risk: X + Y = ${n} is greater than Z = ${r}. Data encrypted today is likely still sensitive ${t} year(s) after Q-Day.`;let i=Math.abs(t);return i<=5?`Low buffer: X + Y = ${n} is only ${i} year(s) below Z = ${r}. Any delay could move this into at-risk territory.`:`Currently safer: X + Y = ${n} is ${i} year(s) below Z = ${r}, giving more migration buffer.`}function r(e,r){let i=e.migrationYears,a=e.sensitivityYears,o=e.qDayYears,s=i+a,c=s-o,l=c>0;return{X:i,Y:a,Z:o,XplusY:s,atRisk:l,riskMargin:c,riskLevel:t(c),explanation:n(l,c,s,o),dataExposureYear:r+o,migrationDeadline:r+(o-a)}}var i=[{year:2013,label:`Snowden revelations`,category:`harvest`,description:`NSA mass collection of encrypted internet traffic confirmed. PRISM, XKeyscore, upstream collection. HNDL strategy confirmed by disclosed documents.`},{year:2015,label:`Mosca's Theorem published`,category:`standard`,description:`Michele Mosca formalizes X+Y>Z risk condition. Provides first mathematical framework for HNDL urgency.`},{year:2016,label:`NIST PQC process begins`,category:`standard`,description:`NIST initiates post-quantum cryptography standardization. 82 initial submissions from global researchers.`},{year:2022,label:`NSA CNSA 2.0 mandated`,category:`migration`,description:`NSA mandates transition to post-quantum algorithms for all national security systems. New systems: PQC required immediately.`},{year:2024,label:`NIST FIPS 203/204/205 finalized`,category:`standard`,description:`ML-KEM, ML-DSA, SLH-DSA standardized. First PQC standards available for deployment.`},{year:2025,label:`Gidney: RSA-2048 under 1M qubits`,category:`quantum-progress`,description:`Google researcher Craig Gidney reduces RSA-2048 breaking estimate from 20M to <1M physical qubits. Timeline compressed.`},{year:2026,label:`Google: ECC P-256 under 500K qubits`,category:`quantum-progress`,description:`Google whitepaper estimates ECC P-256 (secp256k1) vulnerable with <500K physical qubits. Blockchain and TLS implications severe.`},{year:2026,label:`Oratomic: RSA-2048 under 100K qubits`,category:`quantum-progress`,description:`Neutral atom architecture estimates RSA-2048 breaking possible with ~100K qubits. Actual circuits not published. Most aggressive estimate to date.`},{year:2026,label:`YOU ARE HERE — data encrypted today`,category:`harvest`,description:`Every RSA/ECC-encrypted communication sent today is potentially stored by state-level adversaries. The harvest is ongoing.`},{year:2027,label:`NSA CNSA 2.0 deadline: new systems`,category:`migration`,description:`All new NSA/DoD systems must use PQC. Legacy systems migration underway.`},{year:2029,label:`Cloudflare full PQC target`,category:`migration`,description:`Cloudflare targets full post-quantum security including authentication for all products.`},{year:2030,label:`Q-Day consensus estimate (center)`,category:`qday-estimate`,description:`Most estimates center on 2030±3 years for cryptographically relevant quantum computers. Not a hard date — a probability distribution.`},{year:2033,label:`Q-Day conservative estimate`,category:`qday-estimate`,description:`Academic consensus: 2030–2035 for RSA-2048 breaking. ETSI and government planning timelines use mid-2030s as backstop.`},{year:2035,label:`NSA CNSA 2.0 full transition deadline`,category:`migration`,description:`All NSA national security systems must be fully PQC-migrated. Data encrypted before 2035 under classical crypto may be retroactively compromised.`}],a=2026,o=23,s=[`government`,`healthcare`,`finance`,`legal`,`library`,`enterprise`,`personal`,`custom`],c={government:`Gov/Classified`,healthcare:`Healthcare`,finance:`Finance`,legal:`Legal`,library:`Library`,enterprise:`Enterprise`,personal:`Personal`,custom:`Custom`},l={government:{heading:`GOVERNMENT / CLASSIFIED CONTEXT`,body:[`Classified data often keeps sensitivity for decades. Migration is slowed by legacy systems, coalition interoperability, and certification gates.`,`HNDL is not a future threat - it is a present collection strategy targeting high-value state communications now.`],bullets:[`Diplomatic cables and source identities can remain sensitive long after Q-Day`,`Legacy classified infrastructure can extend migration timelines beyond a decade`,`Delayed transition creates a long retroactive decrypt window`]},healthcare:{heading:`HEALTHCARE CONTEXT`,body:[`Patient records and genomic data can require confidentiality for 50 to 80+ years. Clinical ecosystems are difficult to migrate quickly.`,`Captured encrypted traffic from provider portals and hospital APIs may remain sensitive long after Q-Day.`],bullets:[`EHR, imaging, insurance and lab exchanges are long-lived targets`,`Compliance and testing cycles increase migration time`,`Past encrypted records cannot be retroactively re-protected`]},finance:{heading:`FINANCIAL SERVICES CONTEXT`,body:[`Financial messaging, trading strategy, and deal flow can have multi-year to multi-decade sensitivity windows.`,`Adversaries harvesting market-sensitive encrypted traffic gain delayed intelligence once quantum capability arrives.`],bullets:[`SWIFT and interbank channels are persistent strategic targets`,`M&A plans and risk models can be exposed retroactively`,`Hybrid TLS and post-quantum migration reduce future exposure`]},legal:{heading:`LEGAL / LAW FIRM CONTEXT`,body:[`Attorney-client privilege can effectively be indefinite. Encrypted legal communication captured now may be readable later.`,`Long case timelines mean historical confidentiality failures can still produce current harm.`],bullets:[`Privileged correspondence is high-value long-sensitivity data`,`Discovery archives and litigation records raise retention exposure`,`Transition delay increases permanent privilege risk`]},library:{heading:`LIBRARY PATRON PRIVACY CONTEXT`,body:[`Federal and state library privacy statutes protect patron reading records indefinitely in most jurisdictions. RSA/TLS-encrypted ILS API traffic and patron portal sessions are potential HNDL targets.`,`If an adversary is collecting library system traffic today, later decryption can expose patron identities, registration PII, and reading history relationships.`,`This is not hypothetical. Libraries are soft targets: high-sensitivity data, under-resourced IT, and legacy ILS upgrade cycles.`],bullets:[`Patron identities linked to reading records may be exposed at Q-Day`,`Patron registration PII has long sensitivity under library privacy obligations`,`After migration, pre-migration ciphertext remains exposed to future decryption`]},enterprise:{heading:`ENTERPRISE CONTEXT`,body:[`Corporate IP, roadmap data, and strategic communications commonly exceed short migration windows.`,`HNDL allows adversaries to build future intelligence from present encrypted business traffic.`],bullets:[`R&D and merger conversations remain valuable for years`,`Legacy services and vendor dependencies slow migration execution`,`Retention minimization directly reduces future decrypt surface`]},personal:{heading:`PERSONAL CONTEXT`,body:[`Individuals hold long-lived financial and health records across email, cloud, and account portals.`,`Personal risk varies, but meaningful exposure remains where data sensitivity outlasts migration and Q-Day timelines.`],bullets:[`Use services deploying modern TLS and forward secrecy`,`Reduce archival retention of unnecessary sensitive content`,`Track provider post-quantum migration commitments`]}},u=[{title:`1. MIGRATE TO PQC NOW`,lines:[`ML-KEM (FIPS 203) for key exchange`,`ML-DSA (FIPS 204) for digital signatures`,`Protects future communications`,`Cannot retroactively protect already-harvested data`,`Timeline: begin immediately. NSA deadline: 2035.`]},{title:`2. DEPLOY PERFECT FORWARD SECRECY`,lines:[`TLS 1.3 with ECDHE for classical PFS`,`X25519 + ML-KEM hybrid for post-quantum PFS`,`Session keys are ephemeral per handshake`,`Best available protection while traffic is actively flowing`,`Only works when deployed before collection happens`]},{title:`3. USE HYBRID CRYPTOGRAPHY`,lines:[`X25519 + ML-KEM simultaneously in TLS handshake`,`Attacker must break both classical and post-quantum components`,`Defense-in-depth during migration years`,`Deployed by Chrome 124+, Cloudflare, and Signal`]},{title:`4. MINIMIZE DATA RETENTION`,lines:[`Delete sensitive communications after useful life`,`Data that does not exist cannot be decrypted later`,`Reduces historical exposure surface`,`Applies to email archives, logs, and session recordings`]},{title:`5. QUANTUM KEY DISTRIBUTION (HIGH VALUE ONLY)`,lines:[`Physics-based key exchange via photon polarization`,`Immune to Shor attacks on RSA/ECC key exchange`,`Point-to-point constraints and infrastructure cost are high`,`See crypto-lab-bb84 for a live simulation`]}],d=document.querySelector(`#app`);if(!d)throw Error(`App root not found.`);var f=d,p=`healthcare`,m=e.healthcare.migrationYears,h=e.healthcare.sensitivityYears,g=8,_=i.findIndex(e=>e.label.includes(`YOU ARE HERE`)),v=0,y=[...i].sort((e,t)=>e.year-t.year),b=y[0]?.year??2013,x=y[y.length-1]?.year??2035;function S(e){return(e-b)/(x-b)*100}function C(){return document.documentElement.getAttribute(`data-theme`)===`light`?`light`:`dark`}function w(e){document.documentElement.setAttribute(`data-theme`,e),localStorage.setItem(`cv-theme`,e)}function T(e){switch(e.category){case`harvest`:return`harvest`;case`quantum-progress`:return`quantum`;case`standard`:return`standard`;case`qday-estimate`:return`qday`;case`migration`:return`migration`;default:return`standard`}}function E(e){return e.category===`harvest`||e.category===`quantum-progress`?`above`:`below`}function D(){return s.map(e=>`<button class="sector-tab ${p===e?`active`:``}" type="button" data-sector="${e}">${c[e]}</button>`).join(``)}function O(){return y.map((e,t)=>{let n=E(e),r=T(e),i=S(e.year),a=t===_?`active`:``;return`
        <button
          type="button"
          class="timeline-event ${n} ${r} ${a}"
          data-event-index="${t}"
          style="left:${i}%;"
          aria-expanded="${a?`true`:`false`}"
          aria-controls="timeline-details"
        >
          <span class="event-year">${e.year}</span>
          <span class="event-label">${e.label}</span>
        </button>
      `}).join(``)}function k(){return y.map((e,t)=>`<button type="button" class="timeline-list-event ${T(e)} ${t===_?`active`:``}" data-event-index="${t}"><span>${e.year}</span>${e.label}</button>`).join(``)}function A(){return u.map(e=>{let t=e.lines.map(e=>`<li>${e}</li>`).join(``);return`<details class="mitigation-card"><summary>${e.title}</summary><ul>${t}</ul></details>`}).join(``)}function j(){if(p===`custom`)return`
      <h4>CUSTOM CONTEXT</h4>
      <p>Use the sliders to model your own environment and sensitivity horizon. The risk condition remains fixed: X + Y > Z means the data is at risk.</p>
      <ul>
        <li>Model your real migration timeline, not your best case</li>
        <li>Use conservative and optimistic Q-Day estimates</li>
        <li>Treat long-lived encrypted archives as harvest targets</li>
      </ul>
    `;let e=l[p];return`
    <h4>${e.heading}</h4>
    ${e.body.map(e=>`<p>${e}</p>`).join(``)}
    <ul>${e.bullets.map(e=>`<li>${e}</li>`).join(``)}</ul>
  `}function M(){let t=a+g,n=S(t),i=S(a),o=S(2028),s=S(2035),c=Math.max(t-b,1),l=(a-b)/c*100,u=(t-a)/c*100,d=r({migrationYears:m,sensitivityYears:h,qDayYears:g},a),x=d.dataExposureYear-d.X,T=a-x,E=d.XplusY>d.Z?`>`:d.XplusY===d.Z?`=`:`<`;f.innerHTML=`
    <button id="theme-toggle" class="theme-toggle" type="button" aria-label="Toggle theme">${C()===`dark`?`☀`:`🌙`}</button>

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
          <p class="counter-value"><span id="traffic-counter">${v.toLocaleString(`en-US`,{maximumFractionDigits:0})}</span> TB</p>
          <p>Estimated storage cost for a nation-state actor: $0.002</p>
          <p class="small-note">Source: Global internet traffic ~5 Exabytes/day. RSA/ECC: ~40% of HTTPS. Illustrative - for scale.</p>
        </div>
      </section>

      <section class="panel timeline-panel" id="timeline">
        <h2>THE HNDL TIMELINE</h2>
        <div class="timeline-ribbon-wrap">
          <div class="timeline-ribbon" style="min-width:1200px;">
            <div class="qday-band" style="left:${o}%;width:${Math.max(s-o,1)}%;">
              Q-Day probability window (2028-2035, consensus center: ~2030)
            </div>
            <div class="timeline-line"></div>
            <div class="you-are-here" style="left:${i}%">
              <span>YOU ARE HERE</span>
            </div>
            <div class="qday-estimate-marker" style="left:${n}%">Q-Day estimate (${t})</div>
            ${O()}
          </div>
        </div>
        <div class="timeline-list" aria-label="Timeline mobile list">${k()}</div>
        <article id="timeline-details" class="timeline-details" tabindex="-1">
          <h3>${y[_]?.label??`Timeline event`}</h3>
          <p>${y[_]?.description??``}</p>
          <p class="small-note">${y[_]?.source?`Source: ${y[_].source}`:`Source: educational synthesis of public reporting and standards documents.`}</p>
        </article>

        <div class="harvest-bar-wrap">
          <h3>Harvested Data Accumulation</h3>
          <div class="harvest-bar" role="img" aria-label="Data accumulation from 2013 through Q-Day">
            <div class="harvested-past" style="width:${Math.max(l,0)}%">already harvested</div>
            <div class="harvested-now" style="width:${Math.max(u,0)}%">being harvested now</div>
            <div class="harvested-qday">decryptable</div>
          </div>
        </div>
      </section>

      <section class="panel calculator-panel" id="mosca">
        <h2>MOSCA'S THEOREM: X + Y &gt; Z</h2>
        <div class="sector-tabs" role="tablist" aria-label="Sector selector">${D()}</div>

        <div class="sliders">
          <label for="x-slider">X - Migration time (years to complete PQC transition): <span id="x-value">${m}</span> years</label>
          <input id="x-slider" type="range" min="1" max="15" value="${m}" aria-valuemin="1" aria-valuemax="15" aria-valuenow="${m}" aria-valuetext="${m} years" />
          <p class="small-note">How long will it take your organization to fully deploy post-quantum cryptography?</p>

          <label for="y-slider">Y - Data sensitivity lifetime (years data must remain secret): <span id="y-value">${h}</span> years</label>
          <input id="y-slider" type="range" min="1" max="80" value="${h}" aria-valuemin="1" aria-valuemax="80" aria-valuenow="${h}" aria-valuetext="${h} years" />
          <p class="small-note">How long must this data stay confidential? Genetic data can exceed 80 years.</p>

          <label for="z-slider">Z - Q-Day estimate (years until cryptographically relevant quantum computer): <span id="z-value">${g}</span> years (${t})</label>
          <input id="z-slider" type="range" min="1" max="20" value="${g}" aria-valuemin="1" aria-valuemax="20" aria-valuenow="${g}" aria-valuetext="${g} years" />
          <p class="small-note">Consensus range: 2028-2035, centered near 2030 +- 3 years. Use ranges, not certainties.</p>
        </div>

        <article class="verdict ${d.riskLevel}" aria-live="polite">
          <p class="math">X + Y = ${d.X} + ${d.Y} = ${d.XplusY} years</p>
          <p class="math">Z = ${d.Z} years</p>
          <p class="math">${d.XplusY} ${E} ${d.Z}</p>
          <p class="verdict-line">${d.atRisk?`AT RISK - ${d.riskLevel.toUpperCase()}`:`NOT AT RISK - ${d.riskLevel.toUpperCase()}`}</p>
          <p>${d.atRisk?`Data encrypted today will still be sensitive ${d.riskMargin} years after Q-Day arrives. An adversary collecting now can read it later.`:`Current buffer: data sensitivity and migration complete ${Math.abs(d.riskMargin)} years before this Q-Day estimate.`}</p>
          <p>Q-Day estimate year: ${d.dataExposureYear}. To finish by then, migration needed to start by ${x}.</p>
          <p>${T>0?`You are already ${T} year(s) behind this schedule.`:`You are still inside the migration window if execution starts now.`}</p>
        </article>

        <article class="sector-context">${j()}</article>
      </section>

      <section class="panel matrix-panel" id="mitigations">
        <h2>SECTOR RISK MATRIX + MITIGATIONS</h2>
        <div class="matrix-wrap">
          <div class="matrix-grid" aria-label="Sector risk matrix">
            <div class="matrix-axis-x">Migration Difficulty: Easy -> Hard</div>
            <div class="matrix-axis-y">Data Sensitivity: Low -> High</div>
            ${Object.entries(e).map(([e,t])=>{let n=Math.min(Math.max(t.migrationYears/10*100,10),95),i=Math.min(Math.max(t.sensitivityYears/50*100,10),95);return`<button class="matrix-dot ${r({migrationYears:t.migrationYears,sensitivityYears:t.sensitivityYears,qDayYears:8},a).riskLevel}" style="left:${n}%;bottom:${i}%" type="button" data-matrix-sector="${e}">${t.label}</button>`}).join(``)}
          </div>
          <article class="matrix-info" id="matrix-info">
            Hover or click a sector dot to view its default Mosca profile at Z = 8 years.
          </article>
        </div>

        <div class="mitigation-list">
          ${A()}
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
  `,document.querySelector(`#theme-toggle`)?.addEventListener(`click`,()=>{w(C()===`dark`?`light`:`dark`),M()}),document.querySelectorAll(`.timeline-event, .timeline-list-event`).forEach(e=>{e.addEventListener(`click`,()=>{let t=Number(e.dataset.eventIndex);Number.isNaN(t)||(_=t,M())}),e.addEventListener(`keydown`,t=>{(t.key===`Enter`||t.key===` `)&&(t.preventDefault(),e.click())})}),document.querySelectorAll(`.sector-tab`).forEach(t=>{t.addEventListener(`click`,()=>{let n=t.dataset.sector;p=n,n!==`custom`&&(m=e[n].migrationYears,h=e[n].sensitivityYears),M()})});let N=document.querySelector(`#x-slider`),P=document.querySelector(`#y-slider`),F=document.querySelector(`#z-slider`),I=(e,t)=>{e.setAttribute(`aria-valuenow`,String(t)),e.setAttribute(`aria-valuetext`,`${t} years`)};N?.addEventListener(`input`,()=>{m=Number(N.value),p=`custom`,I(N,m),M()}),P?.addEventListener(`input`,()=>{h=Number(P.value),p=`custom`,I(P,h),M()}),F?.addEventListener(`input`,()=>{g=Number(F.value),I(F,g),M()}),document.querySelectorAll(`.matrix-dot`).forEach(t=>{let n=()=>{let n=e[t.dataset.matrixSector],i=r({migrationYears:n.migrationYears,sensitivityYears:n.sensitivityYears,qDayYears:8},a),o=document.querySelector(`#matrix-info`);o&&(o.textContent=`${n.label}: X=${i.X}, Y=${i.Y}, Z=8 => X+Y=${i.XplusY}. Risk: ${i.riskLevel.toUpperCase()} (${i.atRisk?`at risk`:`not at risk`}).`)};t.addEventListener(`mouseenter`,n),t.addEventListener(`focus`,n),t.addEventListener(`click`,n)})}M(),setInterval(()=>{v+=o;let e=document.querySelector(`#traffic-counter`);e&&(e.textContent=v.toLocaleString(`en-US`,{maximumFractionDigits:0}))},1e3);