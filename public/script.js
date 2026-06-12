const DEMO_DATA = {
  title: 'バトグラ最強決定戦2026',
  updatedAt: '2026-06-12T12:00:00+09:00',
  games: ['game1', 'game2', 'game3', 'game4', 'game5', 'game6', 'game7', 'game8'],
  gameLabels: {
    game1: '第1戦',
    game2: '第2戦',
    game3: '第3戦',
    game4: '第4戦',
    game5: '第5戦',
    game6: '第6戦',
    game7: '第7戦',
    game8: '第8戦'
  },
  rows: [
    { name: 'Player 1', totalPt: 0, ptRank: '1位', placementRank: '1位', isWinner: true, game1: '', game2: '', game3: '', game4: '', game5: '', game6: '', game7: '', game8: '', place1: '', place2: '', place3: '', place4: '', place5: '', place6: '', place7: '', place8: '' },
    { name: 'Player 2', totalPt: 0, ptRank: '2位', placementRank: '2位', isWinner: false, game1: '', game2: '', game3: '', game4: '', game5: '', game6: '', game7: '', game8: '', place1: '', place2: '', place3: '', place4: '', place5: '', place6: '', place7: '', place8: '' },
    { name: 'Player 3', totalPt: 0, ptRank: '3位', placementRank: '3位', isWinner: false, game1: '', game2: '', game3: '', game4: '', game5: '', game6: '', game7: '', game8: '', place1: '', place2: '', place3: '', place4: '', place5: '', place6: '', place7: '', place8: '' },
    { name: 'Player 4', totalPt: 0, ptRank: '4位', placementRank: '4位', isWinner: false, game1: '', game2: '', game3: '', game4: '', game5: '', game6: '', game7: '', game8: '', place1: '', place2: '', place3: '', place4: '', place5: '', place6: '', place7: '', place8: '' },
    { name: 'Player 5', totalPt: 0, ptRank: '5位', placementRank: '5位', isWinner: false, game1: '', game2: '', game3: '', game4: '', game5: '', game6: '', game7: '', game8: '', place1: '', place2: '', place3: '', place4: '', place5: '', place6: '', place7: '', place8: '' },
    { name: 'Player 6', totalPt: 0, ptRank: '6位', placementRank: '6位', isWinner: false, game1: '', game2: '', game3: '', game4: '', game5: '', game6: '', game7: '', game8: '', place1: '', place2: '', place3: '', place4: '', place5: '', place6: '', place7: '', place8: '' },
    { name: 'Player 7', totalPt: 0, ptRank: '7位', placementRank: '7位', isWinner: false, game1: '', game2: '', game3: '', game4: '', game5: '', game6: '', game7: '', game8: '', place1: '', place2: '', place3: '', place4: '', place5: '', place6: '', place7: '', place8: '' },
    { name: 'Player 8', totalPt: 0, ptRank: '8位', placementRank: '8位', isWinner: false, game1: '', game2: '', game3: '', game4: '', game5: '', game6: '', game7: '', game8: '', place1: '', place2: '', place3: '', place4: '', place5: '', place6: '', place7: '', place8: '' }
  ]
};

async function loadData() {
  try {
    const response = await fetch('/api/results', { cache: 'no-store' });
    if (!response.ok) throw new Error(`API returned ${response.status}`);
    const data = await response.json();
    return { data, source: 'Cloudflare Pages Function: /api/results' };
  } catch (apiError) {
    try {
      const response = await fetch('./sample-data.json', { cache: 'no-store' });
      if (!response.ok) throw new Error(`sample-data returned ${response.status}`);
      const data = await response.json();
      return { data, source: 'sample-data.json' };
    } catch (sampleError) {
      return { data: DEMO_DATA, source: 'embedded demo data' };
    }
  }
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat('ja-JP', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(date);
}

function getGames(data) {
  if (Array.isArray(data.games) && data.games.length > 0) return data.games;
  const first = data.rows?.[0] ?? {};
  return Object.keys(first).filter((key) => /^game\d+$/.test(key));
}

function gameLabel(data, game) {
  return data.gameLabels?.[game] ?? game;
}

function buildHeader(table, firstColumns, games, data) {
  table.querySelector('thead').innerHTML = `
    <tr>
      ${firstColumns.map((label) => `<th>${escapeHtml(label)}</th>`).join('')}
      ${games.map((game) => `<th>${escapeHtml(gameLabel(data, game))}</th>`).join('')}
    </tr>
  `;
}

function pointClass(value) {
  const n = Number(value);
  if (Number.isFinite(n) && n >= 9) return 'top-cell';
  return '';
}

function placementClass(value) {
  const normalized = String(value).trim().toLowerCase();
  return normalized === '1st' || normalized === '1位' ? 'top-cell' : '';
}

function placementKey(game) {
  return game.replace('game', 'place');
}

function renderPoints(data) {
  const table = document.querySelector('#points-table');
  const games = getGames(data);
  const rows = [...(data.rows ?? [])].sort((a, b) => Number(b.totalPt ?? 0) - Number(a.totalPt ?? 0));

  buildHeader(table, ['Name', 'Total Pt', 'Pt順位'], games, data);
  table.querySelector('tbody').innerHTML = rows.map((row) => `
    <tr class="${row.isWinner === true ? 'winner-row' : ''}">
      <td>${escapeHtml(row.name)}</td>
      <td>${escapeHtml(row.totalPt)}</td>
      <td>${escapeHtml(row.ptRank)}</td>
      ${games.map((game) => `<td class="${pointClass(row[game])}">${escapeHtml(row[game])}</td>`).join('')}
    </tr>
  `).join('');
}

function renderPlacements(data) {
  const table = document.querySelector('#placements-table');
  const games = getGames(data);
  const rows = [...(data.rows ?? [])].sort((a, b) => Number(b.totalPt ?? 0) - Number(a.totalPt ?? 0));

  buildHeader(table, ['Name', 'Total Pt', '順位'], games, data);
  table.querySelector('tbody').innerHTML = rows.map((row) => `
    <tr class="${row.isWinner === true ? 'winner-row' : ''}">
      <td>${escapeHtml(row.name)}</td>
      <td>${escapeHtml(row.totalPt)}</td>
      <td>${escapeHtml(row.placementRank ?? row.ptRank)}</td>
      ${games.map((game) => {
        const key = placementKey(game);
        return `<td class="${placementClass(row[key])}">${escapeHtml(row[key])}</td>`;
      }).join('')}
    </tr>
  `).join('');
}

async function main() {
  const { data, source } = await loadData();

  document.querySelector('#event-title').textContent = data.title ?? 'バトグラ最強決定戦2026';
  document.querySelector('#data-status').textContent = `Data: ${source}`;
  document.querySelector('#updated-at').textContent = data.updatedAt ? `Updated: ${formatDate(data.updatedAt)}` : '';

  renderPoints(data);
  renderPlacements(data);
}

main();
