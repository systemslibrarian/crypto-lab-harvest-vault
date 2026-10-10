import { describe, expect, it } from 'vitest';
import { GLOSSARY, MISCONCEPTIONS, PROTOCOL_EXAMPLES, QUIZ } from './content';

describe('protection of already-recorded quantum-threat traffic', () => {
  it('credits protection already quantum-resistant at capture, not classical PFS', () => {
    const question = QUIZ.find(q => q.q.includes('ALREADY-harvested'))!;
    expect(question).toBeDefined();
    expect(question.options[question.correct]).toMatch(/quantum-resistant.*collection/i);
    const classical = question.options.findIndex(o => /classical.*forward secrecy/i.test(o));
    expect(classical).toBeGreaterThanOrEqual(0);
    expect(classical).not.toBe(question.correct);
    expect(question.explain).toMatch(/long-term.*compromise/i);
    expect(question.explain).toMatch(/recorded.*ephemeral/i);
  });

  it('does not make the future-only question ambiguous with ordinary PFS', () => {
    const question = QUIZ.find(q => q.q.includes('protects future traffic'))!;
    expect(question.options[question.correct]).toMatch(/today/);
    expect(question.options.filter(o => /forward secrecy/i.test(o))).toEqual([]);
    expect(question.explain).toMatch(/classical.*forward secrecy/i);
  });

  it('keeps the myth, glossary and ECDHE profile consistent about the threat', () => {
    const myth = MISCONCEPTIONS.find(m => m.myth.includes('old traffic'))!;
    expect(myth.reality).toMatch(/quantum-resistant.*collection/i);
    expect(myth.reality).toMatch(/ordinary.*forward secrecy.*does not/i);
    expect(GLOSSARY.find(g => g.term === 'PFS')!.def).toMatch(/recorded.*ephemeral/i);
    expect(PROTOCOL_EXAMPLES.find(p => p.name.includes('ECDHE'))!.body)
      .toContain('PFS alone does not survive HNDL');
  });
});
