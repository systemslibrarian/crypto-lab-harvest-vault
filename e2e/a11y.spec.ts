import { expect, test, type Page } from '@playwright/test';
import {
  NARROW,
  boot,
  expectBaselineNotStale,
  expectNoNewNonTextFailures,
  expectScrollersReachable,
  scan,
  settle,
} from './gate';

/**
 * WCAG regression gate.
 *
 * Deploys are already gated on the capture exhibit's cryptographic outcomes by
 * capture.spec.ts; this gates them on accessibility the same way. See gate.ts
 * for the three rules this file obeys — nothing injected, content asserted
 * before every scan, and `violations` treated as one oracle among five.
 *
 * The page is scanned in both themes, in states a visitor can actually reach,
 * at a 1280px desktop viewport and at a 380px phone one. Little of the
 * interesting rendering is the first-paint one: until a session is sent the
 * adversary's store is a single line of prose, until Q-Day is run there are no
 * RECOVERED/NOT RECOVERED verdicts and no run summary, until an answer is
 * picked the quiz has no correct/wrong palette, and all eighteen disclosures
 * are closed. Two of the three defects this gate found are invisible at first
 * paint, and the third only fails in the light theme.
 */

const THEMES = ['dark', 'light'] as const;

/** Send one message through the capture exhibit and wait for its row. */
async function send(page: Page, message: string, rows: number): Promise<void> {
  await page.fill('#capture-message', message);
  await page.click('#send-session');
  await expect(page.locator('#capture-status')).toContainText(
    `Session ${rows} captured over the`
  );
  await expect(page.locator('.capture-table tbody tr')).toHaveCount(rows);
}

/** Run the Q-Day attack over every stored session and wait for it to finish. */
async function runQDay(page: Page, rows: number): Promise<void> {
  await page.click('#run-qday');
  // Exhaustive discrete-log search over up to 2^23 exponents per stored
  // session — genuinely slow work, so the wait is generous rather than the
  // scan being narrowed.
  await expect(page.locator('#capture-status')).toContainText('Q-Day complete', {
    timeout: 120_000,
  });
  await expect(page.locator('.capture-table tbody tr')).toHaveCount(rows);
}

/**
 * A state worth scanning: how to reach it from a booted page, and what has to
 * be true once you are there. The assertion is not decoration — it is what
 * stops a scan from passing over a panel that never redrew.
 */
interface State {
  label: string;
  drive: (page: Page) => Promise<void>;
}

const STATES: State[] = [
  {
    // The default mount. Static three-act strip (reduced motion), empty
    // adversary store, healthcare preset verdict, no quiz answers, every
    // disclosure closed.
    label: 'first paint / static strip + empty store',
    drive: async (page) => {
      await expect(page.locator('.act-static .step')).toHaveCount(3);
      await expect(page.locator('.capture-empty')).toContainText('store is empty');
      await expect(page.locator('#timeline-details h3')).toContainText('YOU ARE HERE');
      await expect(page.locator('.quiz-score')).toContainText('Answer to check');
      await expect(page.locator('#matrix-info')).toContainText('Hover or focus a sector dot');
    },
  },
  {
    // Every <details> on the page opened for real: five checkpoints, five
    // mitigation cards, eight evidence items. Their bodies — and the
    // mitigation/evidence open-state fills — do not exist in the layout until
    // opened, so a closed-page scan checks none of them. The old gate opened
    // them by assigning `details.open` from JS, which skips the summaries'
    // own activation behaviour; a click is what a visitor does.
    label: 'every disclosure open',
    drive: async (page) => {
      const summaries = page.locator('details > summary');
      await expect(summaries).toHaveCount(18);
      for (let i = 0; i < 18; i++) {
        await summaries.nth(i).click();
      }
      await expect(page.locator('details[open]')).toHaveCount(18);
      await expect(page.locator('.mitigation-card[open]')).toHaveCount(5);
      await expect(page.locator('.evidence-item[open]')).toHaveCount(8);
      await expect(page.locator('.checkpoint[open] p').first()).toBeVisible();
      await expect(page.locator('.evidence-item[open] .small-note').first()).toContainText(
        'Source:'
      );
    },
  },
  {
    // Selecting a timeline event rebuilds the page with a different active
    // marker (text-shadow glow, aria-current) and swaps the detail panel's
    // content, including a source line the default event does not have.
    // The 2031 event, deliberately: it has a source line the default event
    // lacks, and its marker is one of the few whose centre no later sibling's
    // 120px-wide box covers. (The 2025/2026 cluster genuinely overlaps — the
    // "YOU ARE HERE" button intercepts pointer clicks aimed at the Gidney
    // marker — which is a finding of its own, outside this gate's oracles.)
    label: 'timeline event selected',
    drive: async (page) => {
      const label = 'US federal PQC migration deadline';
      await page.locator('.timeline-event', { hasText: label }).click();
      await expect(page.locator('#timeline-details h3')).toContainText(label);
      await expect(page.locator('#timeline-details .small-note')).toContainText('IACR ePrint');
      await expect(page.locator('.timeline-event.active')).toHaveCount(1);
      await expect(page.locator('.timeline-list-event.active')).toContainText(label);
    },
  },
  {
    // The full capture-then-upgrade arc: a classical session, the PQC deploy,
    // a hybrid session, then Q-Day. This is the state with the RECOVERED and
    // NOT RECOVERED verdict palettes side by side, the recovered-plaintext
    // quote, and the at-risk run summary — none of which exists at first
    // paint.
    label: 'capture arc / mixed Q-Day verdict',
    drive: async (page) => {
      await send(page, 'Patron 4471 renewed "Fahrenheit 451"', 1);
      await page.click('#deploy-pqc');
      await expect(page.locator('#deploy-pqc')).toBeDisabled();
      await expect(page.locator('#send-session')).toHaveText('Send over the hybrid handshake');
      await send(page, 'sent after the upgrade landed', 2);
      await runQDay(page, 2);
      await expect(page.locator('.cap-recovered')).toHaveText('RECOVERED');
      await expect(page.locator('.cap-plain')).toContainText('Fahrenheit 451');
      await expect(page.locator('.cap-survived')).toHaveText('NOT RECOVERED');
      const verdict = page.locator('.capture-verdict');
      await expect(verdict).toHaveClass(/at-risk/);
      await expect(verdict).toContainText('The upgrade did not un-capture anything');
    },
  },
  {
    // The other run summary palette: deploy first, send one hybrid session,
    // and the verdict panel renders in its `ok` colours with the AES-GCM
    // failure reason in the table.
    label: 'capture protected / ok verdict',
    drive: async (page) => {
      await page.click('#deploy-pqc');
      await expect(page.locator('#deploy-pqc')).toBeDisabled();
      await send(page, 'nothing here for the harvester', 1);
      await runQDay(page, 1);
      await expect(page.locator('.cap-survived')).toHaveText('NOT RECOVERED');
      await expect(page.locator('.capture-table')).toContainText('AES-GCM authentication failed');
      const verdict = page.locator('.capture-verdict');
      await expect(verdict).toHaveClass(/ok/);
      await expect(verdict).toContainText('Every post-upgrade session survived');
    },
  },
  {
    // The calculator driven to its green end by real keyboard input: X and Y
    // to their minimum, Z to its maximum. The verdict flips to the `safe`
    // palette, all three scenario chips flip to `ok`, the custom tab
    // activates, and the brief regenerates — the entire not-at-risk rendering,
    // which the at-risk defaults never paint.
    label: 'calculator safe / green verdict',
    drive: async (page) => {
      await page.locator('#x-slider').press('Home');
      await page.locator('#y-slider').press('Home');
      await page.locator('#z-slider').press('End');
      await expect(page.locator('.verdict.safe .verdict-line')).toContainText(
        'NOT AT RISK - SAFE'
      );
      await expect(page.locator('.scenario-chip.ok')).toHaveCount(3);
      await expect(page.locator('.scenario-chip.at-risk')).toHaveCount(0);
      await expect(page.locator('.sector-tab[data-sector="custom"]')).toHaveClass(/active/);
      await expect(page.locator('#brief-pre')).toContainText('NOT AT RISK (SAFE)');
    },
  },
  {
    // The matrix at a different Q-Day assumption, with a dot's profile loaded
    // into the live region and that sector loaded into the calculator — the
    // government preset renders the aria-live info panel populated and the
    // sector context swapped, neither of which the default state shows.
    label: 'matrix explored / sector loaded',
    drive: async (page) => {
      await page.locator('.matrix-z-btn', { hasText: 'Z = 12' }).click();
      await expect(page.locator('.matrix-z-btn', { hasText: 'Z = 12' })).toHaveClass(/active/);
      await page.locator('.matrix-dot', { hasText: 'Government' }).click();
      await expect(page.locator('.sector-tab[data-sector="government"]')).toHaveClass(/active/);
      await expect(page.locator('.sector-context h3')).toHaveText(
        'GOVERNMENT / CLASSIFIED CONTEXT'
      );
      // Focusing the dot repopulates the aria-live profile the rebuild reset.
      await page.locator('.matrix-dot', { hasText: 'Government' }).focus();
      await expect(page.locator('#matrix-info')).toContainText('Government / Classified');
      await expect(page.locator('#matrix-info')).toContainText('CRITICAL');
    },
  },
  {
    // One right answer and one wrong one: the correct/wrong option fills, the
    // good/bad explanation borders and the live score line all appear only
    // after an answer is picked.
    label: 'quiz answered / correct and wrong',
    drive: async (page) => {
      await page.locator('button[data-q="0"][data-opt="0"]').click();
      await expect(page.locator('.quiz-opt.correct')).toHaveCount(1);
      await expect(page.locator('.quiz-explain.good')).toContainText('Correct.');
      await page.locator('button[data-q="1"][data-opt="3"]').click();
      await expect(page.locator('.quiz-opt.wrong')).toHaveCount(1);
      await expect(page.locator('.quiz-explain.bad')).toContainText('Not quite.');
      // Answering marks the correct option too, so two now carry the fill.
      await expect(page.locator('.quiz-opt.correct')).toHaveCount(2);
      await expect(page.locator('#quiz-score')).toContainText('Score: 1 / 5');
    },
  },
  {
    // Both copy chips repaint to "Copied!" for 1.8s after a successful copy —
    // a real, reachable rendering that reverts on a timer, so it is only ever
    // scannable by driving it.
    label: 'copy confirmations',
    drive: async (page) => {
      await page.context().grantPermissions(['clipboard-read', 'clipboard-write']);
      await page.click('#copy-verdict');
      await expect(page.locator('#copy-verdict')).toHaveText('Copied!');
      await page.click('#copy-brief');
      await expect(page.locator('#copy-brief')).toHaveText('Copied!');
    },
  },
  {
    // The shared header's skip link is parked at `top: -3rem` until focused.
    // The contrast walk deliberately skips text that paints no pixels, so the
    // only way its colours are ever measured is to focus it for real.
    label: 'header skip link focused',
    drive: async (page) => {
      await page.locator('.cl-skip-link').focus();
      await expect(page.locator('.cl-skip-link')).toBeFocused();
      // It slides in on a `transition: top .15s ease` with no reduced-motion
      // override, so let the transition drain before reading geometry.
      await settle(page);
      const onScreen = await page
        .locator('.cl-skip-link')
        .evaluate((el) => el.getBoundingClientRect().top >= 0);
      expect(onScreen, 'the header skip link must slide into view on focus').toBe(true);
    },
  },
  {
    // The lab's own skip link parks at `left: -999px` and jumps to `left:
    // 1rem` on focus — same idiom, separate element, separate palette (it is
    // the only text on the page painted directly on `--bg`).
    label: 'lab skip link focused',
    drive: async (page) => {
      await page.locator('.skip-link').focus();
      await expect(page.locator('.skip-link')).toBeFocused();
      const onScreen = await page
        .locator('.skip-link')
        .evaluate((el) => el.getBoundingClientRect().left >= 0);
      expect(onScreen, 'the lab skip link must move into view on focus').toBe(true);
    },
  },
];

for (const theme of THEMES) {
  for (const state of STATES) {
    test(`${theme} — ${state.label}`, async ({ page }) => {
      test.setTimeout(300_000);
      await boot(page, theme);
      await state.drive(page);
      await scan(page, `${theme} / ${state.label} / 1280px`);

      // Same state, phone width. Reflow (1.4.10) has no axe rule, and axe's
      // `scrollable-region-focusable` never fires on a container whose
      // content still fits — the capture table fits the desktop column and
      // only overflows here. The timeline also swaps to its mobile list
      // rendering, which the desktop scan never sees.
      await page.setViewportSize(NARROW);
      await settle(page);
      await scan(page, `${theme} / ${state.label} / ${NARROW.width}px`);
    });
  }
}

/**
 * The non-text baseline's third rule, which had never run.
 *
 * `nontext-baseline.ts` claims three: a finding not listed fails, a listed
 * finding that got WORSE fails, and a listed finding that has been FIXED fails
 * until its entry is deleted. The first two live in
 * `expectNoNewNonTextFailures` and fire from every `scan` above. The third is
 * `expectBaselineNotStale`, which was exported and never imported — so the
 * baseline could only ever grow.
 *
 * It gets its own test, driving the states itself, rather than a call tacked
 * onto the last state test. `nonTextSeen` is module state, and how much of it
 * a given test sees depends on how Playwright happens to distribute tests
 * across workers: at `--workers=1` every test above shares one module instance
 * and the last one would see the union, while at the config's default
 * parallelism each gets its own and would see almost nothing. An oracle whose
 * verdict changes with the worker count is not an oracle, so this drives its
 * own full pass and depends on nothing outside itself.
 *
 * Dark alone, and that is measured rather than assumed: captured through the
 * gate's own path, the eleven states at both viewports yield exactly the
 * thirteen findings the baseline lists — no entry missing, nothing extra. The
 * `.timeline-list-event` variants only exist in the 380px list rendering and
 * the `.active` ones need a selected event, so the pass has to cover every
 * state at both widths to be sound.
 *
 * It calls `expectNoNewNonTextFailures` rather than the whole of `scan`: that
 * is the function that populates `nonTextSeen`, and re-running axe, the
 * contrast walk and the reflow checks over states the tests above already
 * scanned would triple this file's cost to assert nothing new.
 */
test('the non-text baseline has no stale entries', async ({ page }) => {
  test.setTimeout(300_000);
  // One page walks every state, so the desktop width has to be restored by
  // hand — the scans above get a fresh page per test and never need to.
  const WIDE = page.viewportSize() ?? { width: 1280, height: 720 };
  for (const state of STATES) {
    // Each state drives from a fresh mount, exactly as the scans above do.
    await boot(page, 'dark');
    await state.drive(page);
    await expectNoNewNonTextFailures(page, `stale sweep / ${state.label} / ${WIDE.width}px`);
    await page.setViewportSize(NARROW);
    await settle(page);
    await expectNoNewNonTextFailures(page, `stale sweep / ${state.label} / ${NARROW.width}px`);
    await page.setViewportSize(WIDE);
  }
  expectBaselineNotStale();
});

/**
 * WCAG 2.1.1 (Keyboard), asserted end to end rather than per-scan.
 *
 * `scan` already refuses any scrolling container with no keyboard route, but a
 * `tabindex` on an element the sequential walk never arrives at is no better
 * than none — so walk the page with Tab and prove each kind of scrolling
 * container that relies on its own tabindex is genuinely reached.
 *
 * Two kinds qualify: the capture table wrap (44rem of table, overflows at
 * phone width, no focusable content of its own) and the risk brief <pre>. The
 * progress nav and the mobile timeline list also scroll, but their contents
 * are links and buttons, so the walk reaches them through their children.
 */
test('every scrolling container is reachable by Tab', async ({ page }) => {
  test.setTimeout(300_000);
  await boot(page, 'dark');
  await send(page, 'a stored session so the capture table exists', 1);

  await page.setViewportSize(NARROW);
  await settle(page);
  await expectScrollersReachable(page, 'tab walk / 380px');

  const KINDS = ['.capture-table-wrap', '.brief-pre'];
  const reached = new Set<string>();
  for (let i = 0; i < 600 && reached.size < KINDS.length; i++) {
    await page.keyboard.press('Tab');
    const hit = await page.evaluate((kinds) => {
      const active = document.activeElement;
      return active ? (kinds.find((k) => active.matches(k)) ?? null) : null;
    }, KINDS);
    if (hit) reached.add(hit);
  }
  expect(Array.from(reached).sort(), 'each kind of scrolling container must be tabbable').toEqual(
    [...KINDS].sort()
  );
});
