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
    'one-day': 'booking moves by one day (time zone)',
    unplaced: 'no tenant on file: not placed',
  };

  const split = $derived(splitTicket(reports as Report[], ticket, tenantOf, notes.oneDayMove));
</script>

<p class="sum">
  <strong>{split.merged}</strong> reports merged into #{ticket}
  ({split.rows} rows in the export; overlapping pages, counted once) ·
  <strong>{split.groups.length}</strong> {split.groups.length === 1 ? 'problem' : 'problems'}
</p>

<table>
  <thead><tr><th>problem</th><th>reports</th><th>tenants</th><th>seen</th><th>ticket</th></tr></thead>
  <tbody>
    {#each split.groups as g (g.problem)}
      <tr>
        <td><code>{g.problem}</code> {LABEL[g.problem]}</td>
        <td>{g.reports.length}</td>
        <td>{g.tenants}</td>
        <td>{g.firstSeen} → {g.lastSeen}</td>
        <td>{#if g.problem !== 'unplaced'}<a href={ISSUES[g.problem]}>{ISSUES[g.problem].replace(/^.*\/issues\//, 'issue ')}</a>{:else}none{/if}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  .sum { font-size: 1.1rem; }
</style>
