import { describe, expect, it } from 'vitest';
import { SKILL_GROUPS, SKILL_IDS, isSkillId, skillLabel } from '@/lib/readme/skill-catalog';

describe('skill catalog', () => {
  it('has six non-empty groups', () => {
    expect(SKILL_GROUPS.map((group) => group.key)).toEqual(['languages', 'frontend', 'backend', 'data', 'cloud', 'tools']);
    for (const group of SKILL_GROUPS) expect(group.skills.length, group.key).toBeGreaterThan(0);
  });

  it('lists each icon id once, as a plain lowercase token', () => {
    expect(new Set(SKILL_IDS).size).toBe(SKILL_IDS.length);
    for (const id of SKILL_IDS) expect(id).toMatch(/^[a-z0-9]+$/);
  });

  it("uses skill-icons' real ids: Python is `py`, and `python` does not exist", () => {
    expect(isSkillId('py')).toBe(true);
    expect(isSkillId('python')).toBe(false);
    expect(isSkillId('js')).toBe(true);
  });

  it('gives every skill a label, and falls back to the id for an unknown one', () => {
    expect(skillLabel('js')).toBe('JavaScript');
    expect(skillLabel('cs')).toBe('C#');
    expect(skillLabel('nope')).toBe('nope');
  });

  it('rejects ids that could smuggle a query separator', () => {
    for (const bad of ['js,ts', 'js&x=1', 'JS', '', ' js']) expect(isSkillId(bad)).toBe(false);
  });
});
