import { describe, expect, it } from 'vitest';
import { computeMosca, SECTOR_PRESETS, type MoscaInput } from './mosca';

const CURRENT_YEAR = 2026;

function compute(partial: Partial<MoscaInput>) {
  const input: MoscaInput = {
    migrationYears: 5,
    sensitivityYears: 20,
    qDayYears: 10,
    ...partial,
  };
  return computeMosca(input, CURRENT_YEAR);
}

describe('Mosca variable convention (X = shelf life, Y = migration time)', () => {
  // This is the regression guard for the mislabeling bug: the code used to assign
  // X = migrationYears and Y = sensitivityYears, the reverse of Mosca's convention
  // (and the sibling harvest-timeline lab). The X+Y sum is symmetric so the verdict
  // hid the swap — but migrationDeadline and the per-variable labels did not.
  it('maps sensitivityYears to X and migrationYears to Y', () => {
    const r = compute({ migrationYears: 3, sensitivityYears: 30, qDayYears: 10 });
    expect(r.X).toBe(30); // security shelf life
    expect(r.Y).toBe(3); // migration time
    expect(r.Z).toBe(10);
  });

  it('does NOT map migrationYears to X (the original bug)', () => {
    const r = compute({ migrationYears: 3, sensitivityYears: 30 });
    expect(r.X).not.toBe(3);
    expect(r.Y).not.toBe(30);
  });
});

describe('X + Y > Z risk condition', () => {
  it('sums X and Y correctly', () => {
    const r = compute({ migrationYears: 5, sensitivityYears: 20 });
    expect(r.XplusY).toBe(25);
  });

  it('flags at-risk when X + Y > Z', () => {
    const r = compute({ migrationYears: 5, sensitivityYears: 20, qDayYears: 10 });
    expect(r.atRisk).toBe(true);
    expect(r.riskMargin).toBe(15);
  });

  it('is NOT at risk when X + Y < Z', () => {
    const r = compute({ migrationYears: 2, sensitivityYears: 3, qDayYears: 10 });
    expect(r.atRisk).toBe(false);
    expect(r.riskMargin).toBe(-5);
  });

  it('boundary X + Y == Z is not at risk (strict inequality)', () => {
    const r = compute({ migrationYears: 4, sensitivityYears: 6, qDayYears: 10 });
    expect(r.XplusY).toBe(10);
    expect(r.riskMargin).toBe(0);
    expect(r.atRisk).toBe(false); // riskMargin > 0 is false at 0
  });

  it('verdict is symmetric under swapping migration and sensitivity', () => {
    const a = compute({ migrationYears: 4, sensitivityYears: 20, qDayYears: 10 });
    const b = compute({ migrationYears: 20, sensitivityYears: 4, qDayYears: 10 });
    expect(a.XplusY).toBe(b.XplusY);
    expect(a.atRisk).toBe(b.atRisk);
    expect(a.riskLevel).toBe(b.riskLevel);
    // ...but the per-variable labels are NOT symmetric:
    expect(a.X).toBe(20);
    expect(b.X).toBe(4);
  });
});

describe('risk-level thresholds', () => {
  const level = (riskMargin: number) => {
    // Drive riskMargin directly via qDayYears: margin = (X + Y) - Z.
    // Hold X + Y = 30, vary Z so margin = 30 - Z.
    const r = compute({ sensitivityYears: 20, migrationYears: 10, qDayYears: 30 - riskMargin });
    expect(r.riskMargin).toBe(riskMargin);
    return r.riskLevel;
  };

  it('critical when margin > 20', () => {
    expect(level(21)).toBe('critical');
    expect(level(25)).toBe('critical');
  });
  it('high when 10 < margin <= 20', () => {
    expect(level(20)).toBe('high');
    expect(level(11)).toBe('high');
  });
  it('moderate when 0 < margin <= 10', () => {
    expect(level(10)).toBe('moderate');
    expect(level(1)).toBe('moderate');
  });
  it('low when -5 < margin <= 0', () => {
    expect(level(0)).toBe('low');
    expect(level(-4)).toBe('low');
  });
  it('safe when margin <= -5', () => {
    expect(level(-5)).toBe('safe');
    expect(level(-20)).toBe('safe');
  });
});

describe('dataExposureYear and migrationDeadline arithmetic', () => {
  it('dataExposureYear = currentYear + Z', () => {
    const r = compute({ qDayYears: 8 });
    expect(r.dataExposureYear).toBe(2034);
  });

  it('migrationDeadline is the latest year migration can START and finish before Q-Day', () => {
    // Q-Day at 2026 + 10 = 2036; migration takes Y = 4 years => must start by 2032.
    const r = compute({ migrationYears: 4, qDayYears: 10 });
    expect(r.dataExposureYear).toBe(2036);
    expect(r.migrationDeadline).toBe(2032); // 2026 + (10 - 4)
  });

  it('migrationDeadline uses migration time (Y), not shelf life (X)', () => {
    // If the deadline mistakenly subtracted X (shelf life), a large X would push
    // the deadline into the distant past. It must depend only on migration time.
    const shortMigration = compute({ migrationYears: 2, sensitivityYears: 60, qDayYears: 10 });
    const longMigration = compute({ migrationYears: 9, sensitivityYears: 60, qDayYears: 10 });
    expect(shortMigration.migrationDeadline).toBe(2026 + (10 - 2)); // 2034
    expect(longMigration.migrationDeadline).toBe(2026 + (10 - 9)); // 2027
    // Shelf life differs across neither call, so only migration moved the deadline.
    expect(shortMigration.migrationDeadline).toBeGreaterThan(longMigration.migrationDeadline);
  });
});

describe('explanation text stays consistent with the verdict', () => {
  it('says "At risk" and reports the positive margin when at risk', () => {
    const r = compute({ migrationYears: 5, sensitivityYears: 20, qDayYears: 10 });
    expect(r.explanation).toContain('At risk');
    expect(r.explanation).toContain(`X + Y = ${r.XplusY}`);
    expect(r.explanation).toContain(`${r.riskMargin} year`);
  });

  it('does not say "At risk" when safe', () => {
    const r = compute({ migrationYears: 2, sensitivityYears: 3, qDayYears: 15 });
    expect(r.atRisk).toBe(false);
    expect(r.explanation).not.toMatch(/^At risk/);
  });
});

describe('sector presets model realistic HNDL exposure', () => {
  it('every preset with long shelf life is at risk at a mid-range Q-Day (Z=8)', () => {
    for (const [key, preset] of Object.entries(SECTOR_PRESETS)) {
      const r = computeMosca(
        {
          migrationYears: preset.migrationYears,
          sensitivityYears: preset.sensitivityYears,
          qDayYears: 8,
        },
        CURRENT_YEAR,
      );
      // Presets exist to demonstrate the threat; at Z=8 all should cross the line.
      expect(r.atRisk, `${key} should be at risk at Z=8`).toBe(true);
    }
  });

  it('healthcare preset yields the expected X/Y (catches a preset->X/Y wiring swap)', () => {
    const p = SECTOR_PRESETS.healthcare;
    const r = computeMosca(
      { migrationYears: p.migrationYears, sensitivityYears: p.sensitivityYears, qDayYears: 8 },
      CURRENT_YEAR,
    );
    expect(r.X).toBe(p.sensitivityYears); // 50
    expect(r.Y).toBe(p.migrationYears); // 7
  });
});
