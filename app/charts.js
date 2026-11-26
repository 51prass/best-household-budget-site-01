// Hearth — hand-drawn canvas bar charts. One job: draw charts with no library.
// Every chart also ships a text fallback (a table or list) so the figures
// are readable even where canvas does not paint.

const GREEN = '#1E4D3B';
const AMBER = '#D97706';
const LIGHT_GREEN = '#7FA88F';
const GRID = '#E5DDCF';
const INK = '#1C1917';
const MUTED = '#78716C';

function setupCanvas(canvas) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || 600;
  const height = canvas.clientHeight || 260;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, width, height };
}

function moneyTick(value) {
  return '$' + Math.round(value).toLocaleString('en-US');
}

// Single-series vertical bars: [{label, value}]
export function drawBarChart(canvas, rows, { highlightIndex = -1 } = {}) {
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas);
  const padL = 52;
  const padB = 34;
  const padT = 12;
  const plotW = width - padL - 16;
  const plotH = height - padT - padB;
  const max = Math.max(...rows.map((r) => r.value), 1) * 1.15;
  const step = plotH / 4;

  ctx.clearRect(0, 0, width, height);
  ctx.font = '12px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= 4; i++) {
    const y = padT + plotH - i * step;
    ctx.strokeStyle = GRID;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(width - 16, y);
    ctx.stroke();
    ctx.fillStyle = MUTED;
    ctx.textAlign = 'right';
    ctx.fillText(moneyTick((max * i) / 4), padL - 8, y);
  }

  const slot = plotW / rows.length;
  const barW = Math.min(46, slot * 0.62);
  rows.forEach((row, i) => {
    const barH = (row.value / max) * plotH;
    const x = padL + i * slot + (slot - barW) / 2;
    const y = padT + plotH - barH;
    ctx.fillStyle = i === highlightIndex ? AMBER : GREEN;
    ctx.beginPath();
    ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.fillText(moneyTick(row.value), x + barW / 2, y - 10);
    ctx.fillStyle = MUTED;
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillText(row.label, x + barW / 2, padT + plotH + 16);
    ctx.font = '12px system-ui, sans-serif';
  });
}

// Grouped bars (two series per group): groups [{label, a, b}], labels {a, b}
export function drawGroupedChart(canvas, groups, labels) {
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas);
  const padL = 52;
  const padB = 34;
  const padT = 12;
  const plotW = width - padL - 16;
  const plotH = height - padT - padB;
  const max = Math.max(...groups.flatMap((g) => [g.a, g.b]), 1) * 1.15;
  const step = plotH / 4;

  ctx.clearRect(0, 0, width, height);
  ctx.font = '12px system-ui, sans-serif';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= 4; i++) {
    const y = padT + plotH - i * step;
    ctx.strokeStyle = GRID;
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(width - 16, y);
    ctx.stroke();
    ctx.fillStyle = MUTED;
    ctx.textAlign = 'right';
    ctx.fillText(moneyTick((max * i) / 4), padL - 8, y);
  }

  const slot = plotW / groups.length;
  const barW = Math.min(30, slot * 0.28);
  groups.forEach((g, i) => {
    const cx = padL + i * slot + slot / 2;
    const pairs = [
      { value: g.a, color: GREEN },
      { value: g.b, color: AMBER },
    ];
    pairs.forEach((p, j) => {
      const barH = (p.value / max) * plotH;
      const x = cx + (j === 0 ? -barW - 3 : 3);
      const y = padT + plotH - barH;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.roundRect(x, y, barW, barH, [4, 4, 0, 0]);
      ctx.fill();
    });
    ctx.fillStyle = INK;
    ctx.textAlign = 'center';
    ctx.fillText(moneyTick(g.a), cx - barW / 2 - 3, padT + plotH - (g.a / max) * plotH - 10);
    ctx.fillText(moneyTick(g.b), cx + barW / 2 + 3, padT + plotH - (g.b / max) * plotH - 10);
    ctx.fillStyle = MUTED;
    ctx.fillText(g.label, cx, padT + plotH + 16);
  });

  // Legend
  ctx.textAlign = 'left';
  ctx.fillStyle = GREEN;
  ctx.fillRect(padL, 2, 12, 12);
  ctx.fillStyle = INK;
  ctx.fillText(labels.a, padL + 18, 8);
  const bX = padL + 18 + ctx.measureText(labels.a).width + 24;
  ctx.fillStyle = AMBER;
  ctx.fillRect(bX, 2, 12, 12);
  ctx.fillStyle = INK;
  ctx.fillText(labels.b, bX + 18, 8);
}
