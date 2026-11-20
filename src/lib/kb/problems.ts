// Splits a merged ticket into the problems its reports describe. Builds on causes.ts.
//
// causes.ts gives each report a cause from its tenant and channel (`parser` or `hint`). The desk
// also read some reports as a one-day move (desk-notes.json): their dates did not swap, they
// moved by a day. That is a third problem with a different fix, so it is counted on its own here
// instead of being footnoted under `parser`.
import { causeOf, uniqueById, type Report, type Tenant } from '#lib/kb/causes';

export type Problem = 'parser' | 'hint' | 'one-day' | 'unplaced';

// One GitHub issue per problem, in the repo that holds this kb.
export const ISSUES: Record<Exclude<Problem, 'unplaced'>, string> = {
  parser: 'https://github.com/FHubert/mega-s01e03-what-it-shows/issues/1',
  hint: 'https://github.com/FHubert/mega-s01e03-what-it-shows/issues/2',
  'one-day': 'https://github.com/FHubert/mega-s01e03-what-it-shows/issues/3',
};

export function problemOf(r: Report, t: Tenant | undefined, oneDayMove: readonly string[]): Problem {
  if (oneDayMove.includes(r.id)) return 'one-day';
  return causeOf(r, t) ?? 'unplaced';
}

export type ProblemGroup = { problem: Problem; reports: Report[]; tenants: number; firstSeen: string; lastSeen: string };

export function splitTicket(
  all: Report[],
  ticket: number,
  tenantOf: (r: Report) => Tenant | undefined,
  oneDayMove: readonly string[],
): { rows: number; merged: number; groups: ProblemGroup[] } {
  const merged = uniqueById(all).filter((r) => r.mergedInto === ticket);
  const by = new Map<Problem, Report[]>();
  for (const r of merged) {
    const p = problemOf(r, tenantOf(r), oneDayMove);
    by.set(p, [...(by.get(p) ?? []), r]);
  }
  const groups = [...by.entries()]
    .map(([problem, reports]) => {
      const days = reports.map((r) => r.receivedAt.slice(0, 10)).sort();
      return { problem, reports, tenants: new Set(reports.map((r) => r.tenant)).size, firstSeen: days[0], lastSeen: days[days.length - 1] };
    })
    .sort((a, b) => b.reports.length - a.reports.length);
  return { rows: all.filter((r) => r.mergedInto === ticket).length, merged: merged.length, groups };
}
