<script lang="ts">
  import reports from '#lib/data/reports-4471.json';
  import notes from '#lib/data/desk-notes.json';
  import type { Report } from '#lib/kb/causes';
  import { tenantOf } from '#lib/kb/locales';
  import { ISSUES, splitTicket, type Problem } from '#lib/kb/problems';

  let { ticket }: { ticket: number } = $props();

  const LABEL: Record<Problem, string> = {
    parser: 'parser reads month first; tenant writes day first',
    hint: 'booking-v3 form hints MM/DD, reads day first',
    unplaced: 'no tenant on file: not placed',
  };

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf));
</script>

<p class="sum">
  <strong>{split.merged}</strong> reports merged into #{ticket}
  ({split.rows} rows in the export; overlapping pages, counted once) ·
  <strong>{split.groups.length}</strong> {split.groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>intake tagged</th><th>tenants</th><th>seen</th><th>ticket</th></tr></thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code> {LABEL[g.problem]}</td>
        <td>{g.reports.length}</td>
        <td class="muted">{Object.entries(g.taggedAs).sort((x, y) => y[1] - x[1]).map(([t, n]) => `${t} ×${n}`).join(' · ')}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if g.problem !== 'unplaced'}<a href={ISSUES[g.problem]}>{ISSUES[g.problem].replace(/^.*\/issues\//, 'issue ')}</a>{:else}none{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

{#each split.groups as g (g.problem)}
  {@const moved = g.reports.filter((r) => notes.oneDayMove.includes(r.id)).length}
  {#if moved}
    <p class="muted">{moved} of the <code>{g.problem}</code> reports were read by the desk as a one-day move. Same tenants, same way in, so they count here: a reading is not a cause.</p>
  {/if}
{/each}

<style>
  .sum { font-size: 1.1rem; }
  .muted { color: var(--muted); font-size: 0.85em; }
</style>
