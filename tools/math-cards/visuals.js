// 수학 그림 틀 — {type, ...} 하나를 SVG 문자열로. 수업 화면·활동지가 같이 쓴다. 정본 스키마 = VISUAL-SPEC.md
const VZ = (() => {
  const C = { red: '#ef6b4f', blue: '#3d8bd9', green: '#1f7a5c', yellow: '#ffb938', purple: '#8a63d2', gray: '#9aa3ab', ink: '#22303c', line: '#cdbb94', paper: '#fffaf0' };
  const PAL = [C.red, C.blue, C.yellow, C.green, C.purple];
  const e = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const svg = (w, h, body) => `<svg class="vz" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" style="max-width:100%;height:auto" font-family="'Apple SD Gothic Neo','Malgun Gothic',sans-serif">${body}</svg>`;
  const txt = (x, y, s, o = {}) => `<text x="${x}" y="${y}" font-size="${o.size || 22}" text-anchor="${o.anchor || 'middle'}" fill="${o.fill || C.ink}" font-weight="${o.w || 700}">${e(s)}</text>`;
  const num = (v, d = 0) => (Number.isFinite(+v) ? +v : d);
  const ICON = {
    apple: (c) => `<circle r="15" fill="${c || C.red}"/><path d="M0-14 q3-8 8-9" stroke="#6b4a2b" stroke-width="3" fill="none"/><ellipse cx="7" cy="-18" rx="6" ry="3" fill="${C.green}"/>`,
    candy: (c) => `<circle r="11" fill="${c || C.purple}"/><path d="M-11 0 l-9 -8 v16z M11 0 l9 -8 v16z" fill="${c || C.purple}"/>`,
    star: (c) => `<path d="M0-16 L5-5 17-5 7 3 11 15 0 8 -11 15 -7 3 -17-5 -5-5z" fill="${c || C.yellow}"/>`,
    flower: (c) => `${[0, 72, 144, 216, 288].map((a) => `<circle cx="${(10 * Math.cos((a * Math.PI) / 180)).toFixed(1)}" cy="${(10 * Math.sin((a * Math.PI) / 180)).toFixed(1)}" r="8" fill="${c || '#f39ac0'}"/>`).join('')}<circle r="6" fill="${C.yellow}"/>`,
    ball: (c) => `<circle r="15" fill="${c || C.blue}"/><path d="M-15 0 q15 8 30 0" stroke="#fff" stroke-width="3" fill="none"/>`,
    cookie: (c) => `<circle r="15" fill="${c || '#d9a066'}"/><circle cx="-5" cy="-4" r="2.5" fill="#6b4a2b"/><circle cx="6" cy="2" r="2.5" fill="#6b4a2b"/><circle cx="-2" cy="7" r="2.5" fill="#6b4a2b"/>`,
    fish: (c) => `<ellipse rx="15" ry="9" fill="${c || C.blue}"/><path d="M13 0 l10 -8 v16z" fill="${c || C.blue}"/><circle cx="-7" cy="-2" r="2" fill="#fff"/>`,
    pencil: (c) => `<rect x="-4" y="-17" width="8" height="28" fill="${c || C.yellow}"/><path d="M-4 11 L0 19 4 11z" fill="#e8c9a0"/>`,
    car: (c) => `<rect x="-17" y="-6" width="34" height="12" rx="4" fill="${c || C.red}"/><rect x="-9" y="-14" width="18" height="9" rx="3" fill="${c || C.red}"/><circle cx="-9" cy="7" r="4" fill="${C.ink}"/><circle cx="9" cy="7" r="4" fill="${C.ink}"/>`,
    person: (c) => `<circle cy="-10" r="7" fill="#f2c9a0"/><rect x="-8" y="-2" width="16" height="18" rx="6" fill="${c || C.blue}"/>`,
    coin: (c) => `<circle r="14" fill="${c || '#e0b23c'}" stroke="#b78a1a" stroke-width="2"/>`,
    leaf: (c) => `<path d="M0-16 C14-8 14 8 0 16 C-14 8 -14-8 0-16z" fill="${c || C.green}"/>`,
  };
  const icon = (k, x, y, c, s = 1) => `<g transform="translate(${x},${y}) scale(${s})">${(ICON[k] || ICON.star)(c)}</g>`;

  function counters(v) { // n · groups:[a,b,…] · kind(아이콘) · hide(가려진 묶음 번호)
    const groups = v.groups?.length ? v.groups.map((g) => num(g)) : [num(v.n, 5)];
    const per = 5, cell = 40, gap = 44; let x = 20, w = 0, h = 0, out = '';
    groups.forEach((g, gi) => {
      const cols = Math.min(per, Math.max(1, g)), rows = Math.ceil(g / per) || 1, bw = cols * cell + 20, bh = rows * cell + 20;
      out += `<rect x="${x - 10}" y="10" width="${bw}" height="${bh}" rx="14" fill="${C.paper}" stroke="${C.line}" stroke-width="2"/>`;
      if (v.hide === gi) out += `<rect x="${x - 10}" y="10" width="${bw}" height="${bh}" rx="14" fill="${C.gray}"/>${txt(x - 10 + bw / 2, 10 + bh / 2 + 10, '?', { size: 34, fill: '#fff' })}`;
      else for (let i = 0; i < g; i++) { const cx = x + (i % per) * cell + cell / 2, cy = 20 + Math.floor(i / per) * cell + cell / 2; out += v.kind ? icon(v.kind, cx, cy, PAL[gi % PAL.length], 0.95) : `<circle cx="${cx}" cy="${cy}" r="15" fill="${PAL[gi % PAL.length]}"/>`; }
      if (v.labels !== false) out += txt(x - 10 + bw / 2, 10 + bh + 30, v.hide === gi ? '?' : g);
      x += bw + gap; w = x; h = Math.max(h, bh + 50);
    });
    return svg(Math.max(w - gap + 20, 100), h + 10, out);
  }
  function tenframe(v) { // filled · total 10|20 · filled2(두 번째 색)
    const total = num(v.total, 10) > 10 ? 20 : 10, f = num(v.filled), f2 = num(v.filled2), cell = 54; let out = '';
    for (let fr = 0; fr < total / 10; fr++) for (let i = 0; i < 10; i++) {
      const k = fr * 10 + i, x = 10 + (i % 5) * cell + fr * (cell * 5 + 30), y = 10 + Math.floor(i / 5) * cell;
      out += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" fill="#fff" stroke="${C.ink}" stroke-width="2"/>`;
      if (k < f) out += `<circle cx="${x + cell / 2}" cy="${y + cell / 2}" r="18" fill="${C.red}"/>`;
      else if (k < f + f2) out += `<circle cx="${x + cell / 2}" cy="${y + cell / 2}" r="18" fill="${C.blue}"/>`;
    }
    return svg(total === 20 ? cell * 10 + 50 : cell * 5 + 20, cell * 2 + 20, out);
  }
  function base10(v) { // thousands · hundreds · tens · ones
    const th = num(v.thousands), hu = num(v.hundreds), te = num(v.tens), on = num(v.ones); let x = 10, out = '';
    for (let i = 0; i < th; i++) { out += `<rect x="${x}" y="10" width="90" height="90" fill="#cfe3f7" stroke="${C.blue}" stroke-width="2"/><rect x="${x + 8}" y="2" width="90" height="90" fill="none" stroke="${C.blue}" stroke-width="1.5"/>`; x += 106; }
    for (let i = 0; i < hu; i++) { out += `<rect x="${x}" y="10" width="90" height="90" fill="#ffe2a8" stroke="#c48a10" stroke-width="2"/>`; for (let k = 1; k < 10; k++) out += `<line x1="${x + k * 9}" y1="10" x2="${x + k * 9}" y2="100" stroke="#c48a10" stroke-width=".6"/><line x1="${x}" y1="${10 + k * 9}" x2="${x + 90}" y2="${10 + k * 9}" stroke="#c48a10" stroke-width=".6"/>`; x += 100; }
    for (let i = 0; i < te; i++) { out += `<rect x="${x}" y="10" width="12" height="90" fill="#bfe6d4" stroke="${C.green}" stroke-width="2"/>`; for (let k = 1; k < 10; k++) out += `<line x1="${x}" y1="${10 + k * 9}" x2="${x + 12}" y2="${10 + k * 9}" stroke="${C.green}" stroke-width=".8"/>`; x += 18; }
    if (te) x += 8;
    for (let i = 0; i < on; i++) out += `<rect x="${x + (i % 5) * 16}" y="${82 - Math.floor(i / 5) * 16}" width="12" height="12" fill="#ffd0c4" stroke="${C.red}" stroke-width="2"/>`;
    if (on) x += Math.min(on, 5) * 16;
    return svg(Math.max(x + 10, 60), 110, out);
  }
  function numberline(v) { // from · to · step · marks:[값] · jumps:[[a,b]] · labels:{값:'글'} · unknown:값
    const a = num(v.from), b = num(v.to, 10), st = num(v.step, 1) || 1, W = 900, L = 40, R = W - 40, X = (t) => L + ((t - a) / (b - a || 1)) * (R - L); let out = `<line x1="${L - 20}" y1="110" x2="${R + 20}" y2="110" stroke="${C.ink}" stroke-width="3" marker-end="url(#ar)"/>`;
    const n = Math.round((b - a) / st); const lab = v.labels || {};
    for (let i = 0; i <= n && i <= 200; i++) { const t = +(a + i * st).toFixed(6), x = X(t), major = n <= 20 || i % 5 === 0; out += `<line x1="${x}" y1="${major ? 98 : 103}" x2="${x}" y2="${major ? 122 : 117}" stroke="${C.ink}" stroke-width="2"/>`; if (major && !(t in lab)) out += txt(x, 148, String(t), { size: 18, w: 500 }); }
    for (const [k, s] of Object.entries(lab)) out += txt(X(+k), 148, s, { size: 20 });
    (v.marks || []).forEach((m, i) => { out += `<circle cx="${X(num(m))}" cy="110" r="9" fill="${PAL[i % PAL.length]}"/>`; });
    (v.jumps || []).forEach(([p, q], i) => { const x1 = X(num(p)), x2 = X(num(q)), mx = (x1 + x2) / 2, hh = Math.min(70, Math.abs(x2 - x1) / 2 + 20); out += `<path d="M${x1} 100 Q${mx} ${100 - hh} ${x2} 100" fill="none" stroke="${PAL[(i + 1) % PAL.length]}" stroke-width="3" marker-end="url(#ar2)"/>`; });
    if (v.unknown != null) out += `<rect x="${X(num(v.unknown)) - 18}" y="128" width="36" height="30" rx="6" fill="${C.yellow}"/>${txt(X(num(v.unknown)), 150, '?', { size: 20 })}`;
    return svg(W, 170, `<defs><marker id="ar" markerWidth="10" markerHeight="10" refX="6" refY="5" orient="auto"><path d="M0 0 L10 5 L0 10z" fill="${C.ink}"/></marker><marker id="ar2" markerWidth="8" markerHeight="8" refX="5" refY="4" orient="auto"><path d="M0 0 L8 4 L0 8z" fill="${C.blue}"/></marker></defs>${out}`);
  }
  function array(v) { // rows · cols · kind · split(세로로 나누는 열)
    const r = Math.min(num(v.rows, 3), 12), c = Math.min(num(v.cols, 4), 12), cell = 42; let out = '';
    for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) { const x = 30 + j * cell + (v.split && j >= v.split ? 20 : 0), y = 20 + i * cell; out += v.kind ? icon(v.kind, x, y, PAL[(v.split && j >= v.split) ? 1 : 0], .8) : `<circle cx="${x}" cy="${y}" r="14" fill="${(v.split && j >= v.split) ? C.blue : C.red}"/>`; }
    return svg(c * cell + 40 + (v.split ? 20 : 0), r * cell + 20, out);
  }
  function fraction(v) { // num · den · shape bar|circle · whole(여러 개면 대분수)
    const n = num(v.num, 1), d = Math.max(1, Math.min(num(v.den, 4), 24)), wholes = Math.max(1, Math.ceil(n / d)); let out = '';
    for (let w = 0; w < wholes; w++) {
      const filledHere = Math.max(0, Math.min(d, n - w * d));
      if (v.shape === 'circle') { const cx = 80 + w * 170, cy = 80, R = 70; for (let i = 0; i < d; i++) { const a0 = (i / d) * 2 * Math.PI - Math.PI / 2, a1 = ((i + 1) / d) * 2 * Math.PI - Math.PI / 2; const p = d === 1 ? `<circle cx="${cx}" cy="${cy}" r="${R}"` : `<path d="M${cx} ${cy} L${(cx + R * Math.cos(a0)).toFixed(1)} ${(cy + R * Math.sin(a0)).toFixed(1)} A${R} ${R} 0 0 1 ${(cx + R * Math.cos(a1)).toFixed(1)} ${(cy + R * Math.sin(a1)).toFixed(1)}z"`; out += `${p} fill="${i < filledHere ? C.yellow : '#fff'}" stroke="${C.ink}" stroke-width="2"/>`; } }
      else { const W = 420, y = 20 + w * 70; for (let i = 0; i < d; i++) out += `<rect x="${20 + (i * W) / d}" y="${y}" width="${W / d}" height="50" fill="${i < filledHere ? C.yellow : '#fff'}" stroke="${C.ink}" stroke-width="2"/>`; }
    }
    return v.shape === 'circle' ? svg(wholes * 170, 165, out) : svg(460, wholes * 70 + 20, out);
  }
  function shapes(v) { // items:[{kind, label, color}] — triangle·square·rect·circle·pentagon·hexagon·rhombus·trapezoid·parallelogram·right_triangle
    const P = { triangle: '60,10 110,100 10,100', right_triangle: '15,10 15,100 110,100', square: '15,15 105,15 105,105 15,105', rect: '5,30 115,30 115,95 5,95', rhombus: '60,5 112,60 60,115 8,60', trapezoid: '35,20 85,20 115,100 5,100', parallelogram: '35,20 115,20 85,100 5,100', pentagon: '60,8 112,46 92,108 28,108 8,46', hexagon: '35,10 85,10 112,60 85,110 35,110 8,60' };
    const items = (v.items || []).slice(0, 8); let out = '';
    items.forEach((it, i) => { const x = 10 + i * 140, c = it.color ? (C[it.color] || it.color) : PAL[i % PAL.length]; out += `<g transform="translate(${x},10)">${it.kind === 'circle' ? `<circle cx="60" cy="60" r="50" fill="${c}" fill-opacity=".85" stroke="${C.ink}" stroke-width="2"/>` : `<polygon points="${P[it.kind] || P.square}" fill="${c}" fill-opacity=".85" stroke="${C.ink}" stroke-width="2"/>`}${it.label ? txt(60, 145, it.label, { size: 20 }) : ''}</g>`; });
    return svg(Math.max(items.length * 140, 140), 160, out);
  }
  function clock(v) { // h · m · s(초바늘 없음) · digital(true면 아래 글)
    const h = num(v.h, 3), m = num(v.m, 0), cx = 110, cy = 110, R = 95; let out = `<circle cx="${cx}" cy="${cy}" r="${R}" fill="#fff" stroke="${C.ink}" stroke-width="4"/>`;
    for (let i = 1; i <= 12; i++) { const a = (i / 12) * 2 * Math.PI - Math.PI / 2; out += txt(cx + 74 * Math.cos(a), cy + 74 * Math.sin(a) + 8, i, { size: 22 }); }
    for (let i = 0; i < 60; i++) { const a = (i / 60) * 2 * Math.PI, r1 = i % 5 ? 88 : 83; out += `<line x1="${cx + r1 * Math.sin(a)}" y1="${cy - r1 * Math.cos(a)}" x2="${cx + R * Math.sin(a)}" y2="${cy - R * Math.cos(a)}" stroke="${C.ink}" stroke-width="${i % 5 ? 1 : 2.5}"/>`; }
    const ha = (((h % 12) + m / 60) / 12) * 2 * Math.PI, ma = (m / 60) * 2 * Math.PI;
    out += `<line x1="${cx}" y1="${cy}" x2="${cx + 48 * Math.sin(ha)}" y2="${cy - 48 * Math.cos(ha)}" stroke="${C.red}" stroke-width="8" stroke-linecap="round"/><line x1="${cx}" y1="${cy}" x2="${cx + 72 * Math.sin(ma)}" y2="${cy - 72 * Math.cos(ma)}" stroke="${C.blue}" stroke-width="5" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="6" fill="${C.ink}"/>`;
    if (v.s != null) { const sa = (num(v.s) / 60) * 2 * Math.PI; out += `<line x1="${cx}" y1="${cy}" x2="${cx + 82 * Math.sin(sa)}" y2="${cy - 82 * Math.cos(sa)}" stroke="${C.green}" stroke-width="2.5"/>`; }
    if (v.digital) out += txt(cx, 240, `${h}시 ${m ? m + '분' : ''}`.trim(), { size: 24 });
    return svg(220, v.digital ? 255 : 220, out);
  }
  function ruler(v) { // length(cm, 기본 15) · mark(재는 물건 길이) · unit cm|m
    const L = Math.min(num(v.length, 15), 30), u = 28, W = L * u + 60; let out = `<rect x="20" y="60" width="${L * u + 20}" height="60" rx="6" fill="#ffe9b0" stroke="#c48a10" stroke-width="2"/>`;
    for (let i = 0; i <= L * 10; i++) { const x = 30 + (i * u) / 10, big = i % 10 === 0, mid = i % 5 === 0; out += `<line x1="${x}" y1="60" x2="${x}" y2="${60 + (big ? 26 : mid ? 18 : 10)}" stroke="${C.ink}" stroke-width="${big ? 2 : 1}"/>`; if (big) out += txt(x, 108, i / 10, { size: 15, w: 500 }); }
    if (v.mark) out += `<rect x="30" y="22" width="${num(v.mark) * u}" height="26" rx="8" fill="${C.blue}" fill-opacity=".8"/>`;
    return svg(W, 130, out);
  }
  function barchart(v) { // labels · values · title · unit · horizontal(false)
    const L = (v.labels || []).slice(0, 8), V = (v.values || []).map((x) => num(x)), mx = Math.max(1, ...V), W = 120 + L.length * 90, H = 300, base = 250; let out = v.title ? txt(W / 2, 26, v.title, { size: 20 }) : '';
    const step = mx <= 10 ? 1 : mx <= 20 ? 2 : Math.ceil(mx / 10 / 5) * 5;
    for (let t = 0; t <= mx; t += step) { const y = base - (t / mx) * 190; out += `<line x1="60" y1="${y}" x2="${W - 20}" y2="${y}" stroke="#e6e0d2"/>` + txt(48, y + 6, t, { size: 14, w: 500, anchor: 'end' }); }
    L.forEach((l, i) => { const h = (V[i] / mx) * 190, x = 80 + i * 90; out += `<rect x="${x}" y="${base - h}" width="56" height="${h}" fill="${PAL[i % PAL.length]}"/>` + txt(x + 28, base + 24, l, { size: 16 }); });
    out += `<line x1="60" y1="${base}" x2="${W - 20}" y2="${base}" stroke="${C.ink}" stroke-width="2"/><line x1="60" y1="${base}" x2="60" y2="50" stroke="${C.ink}" stroke-width="2"/>`;
    if (v.unit) out += txt(60, 44, `(${v.unit})`, { size: 14, w: 500 });
    return svg(W, H, out);
  }
  function linechart(v) { // labels · values · title · unit
    const L = (v.labels || []).slice(0, 10), V = (v.values || []).map((x) => num(x)), mx = Math.max(1, ...V), W = 120 + L.length * 80, base = 250; let out = v.title ? txt(W / 2, 26, v.title, { size: 20 }) : '';
    const pts = L.map((_, i) => [90 + i * 80, base - (V[i] / mx) * 190]);
    for (let t = 0; t <= 4; t++) { const y = base - (t / 4) * 190; out += `<line x1="60" y1="${y}" x2="${W - 20}" y2="${y}" stroke="#e6e0d2"/>` + txt(50, y + 6, +((mx * t) / 4).toFixed(1), { size: 14, w: 500, anchor: 'end' }); }
    out += `<polyline points="${pts.map((p) => p.join(',')).join(' ')}" fill="none" stroke="${C.blue}" stroke-width="4"/>` + pts.map((p, i) => `<circle cx="${p[0]}" cy="${p[1]}" r="7" fill="${C.red}"/>` + txt(p[0], base + 24, L[i], { size: 15 })).join('');
    out += `<line x1="60" y1="${base}" x2="${W - 20}" y2="${base}" stroke="${C.ink}" stroke-width="2"/>`;
    if (v.unit) out += txt(60, 44, `(${v.unit})`, { size: 14, w: 500 });
    return svg(W, 290, out);
  }
  function piechart(v) { // labels · values(합 100이면 %)
    const V = (v.values || []).map((x) => num(x)), S = V.reduce((a, b) => a + b, 0) || 1, cx = 130, cy = 130, R = 110; let a = -Math.PI / 2, out = '', leg = '';
    V.forEach((x, i) => { const b = a + (x / S) * 2 * Math.PI, big = b - a > Math.PI ? 1 : 0; out += `<path d="M${cx} ${cy} L${(cx + R * Math.cos(a)).toFixed(1)} ${(cy + R * Math.sin(a)).toFixed(1)} A${R} ${R} 0 ${big} 1 ${(cx + R * Math.cos(b)).toFixed(1)} ${(cy + R * Math.sin(b)).toFixed(1)}z" fill="${PAL[i % PAL.length]}" stroke="#fff" stroke-width="2"/>`; leg += `<rect x="280" y="${30 + i * 34}" width="20" height="20" fill="${PAL[i % PAL.length]}"/>` + txt(310, 46 + i * 34, `${(v.labels || [])[i] || ''} ${x}${S === 100 ? '%' : ''}`, { size: 18, anchor: 'start' }); a = b; });
    return svg(460, 270, out + leg);
  }
  function table(v) { // head:[..] · rows:[[..]]
    const H = v.head || [], R = (v.rows || []).slice(0, 10), cols = Math.max(H.length, ...R.map((r) => r.length), 1), cw = Math.max(90, Math.min(160, 760 / cols)), rh = 46; let out = '';
    const row = (cells, y, head) => cells.map((c, j) => `<rect x="${10 + j * cw}" y="${y}" width="${cw}" height="${rh}" fill="${head ? '#e3f3ec' : '#fff'}" stroke="${C.ink}" stroke-width="1.5"/>` + txt(10 + j * cw + cw / 2, y + 30, c, { size: 18, w: head ? 700 : 500 })).join('');
    if (H.length) out += row(H, 10, true);
    R.forEach((r, i) => { out += row(r, 10 + (i + (H.length ? 1 : 0)) * rh, false); });
    return svg(cols * cw + 20, (R.length + (H.length ? 1 : 0)) * rh + 20, out);
  }
  function money(v) { // items:{ "10":3, "100":2, "1000":1, "5000":0, "10000":0, "50":0, "500":0 }
    const it = v.items || {}; let x = 20, out = '';
    for (const k of ['10000', '5000', '1000', '500', '100', '50', '10']) { const n = num(it[k]); for (let i = 0; i < n && i < 10; i++) { if (+k >= 1000) { out += `<rect x="${x}" y="20" width="96" height="50" rx="5" fill="${k === '10000' ? '#bfe6d4' : k === '5000' ? '#ffd9b3' : '#cfe3f7'}" stroke="${C.ink}"/>` + txt(x + 48, 52, `${k}원`, { size: 16 }); x += 104; } else { out += `<circle cx="${x + 24}" cy="45" r="24" fill="${+k >= 100 ? '#d8dde2' : '#e0b23c'}" stroke="${C.ink}"/>` + txt(x + 24, 51, k, { size: 15 }); x += 56; } } }
    return svg(Math.max(x + 10, 80), 90, out);
  }
  function pattern(v) { // seq:['circle:red','triangle:blue',…] · blanks:[인덱스] — 되풀이 무늬
    const seq = (v.seq || []).slice(0, 14), blanks = new Set(v.blanks || []); let out = '';
    seq.forEach((s, i) => { const [k, col] = String(s).split(':'), c = C[col] || col || PAL[i % PAL.length], x = 10 + i * 64; out += blanks.has(i) ? `<rect x="${x + 4}" y="14" width="48" height="48" rx="8" fill="#fff" stroke="${C.gray}" stroke-dasharray="6 4" stroke-width="2"/>` + txt(x + 28, 48, '?', { size: 24, fill: C.gray }) : k === 'circle' ? `<circle cx="${x + 28}" cy="38" r="22" fill="${c}"/>` : k === 'triangle' ? `<polygon points="${x + 28},14 ${x + 52},60 ${x + 4},60" fill="${c}"/>` : k === 'square' ? `<rect x="${x + 6}" y="16" width="44" height="44" fill="${c}"/>` : (ICON[k] ? icon(k, x + 28, 38, c, 1.3) : txt(x + 28, 48, k, { size: 26 })); });
    return svg(seq.length * 64 + 20, 76, out);
  }
  function grid(v) { // rows · cols · filled:[[r,c]] 또는 count(앞에서부터 n칸) · color · unit(한 칸 = 1 cm² 등 글)
    const r = Math.min(num(v.rows, 5), 20), c = Math.min(num(v.cols, 5), 20), cell = Math.min(40, 600 / Math.max(r, c)); const F = new Set((v.filled || []).map(([a, b]) => `${a},${b}`)); let out = '', k = 0;
    for (let i = 0; i < r; i++) for (let j = 0; j < c; j++) { const on = F.has(`${i},${j}`) || (v.count != null && k < num(v.count)); k++; out += `<rect x="${10 + j * cell}" y="${10 + i * cell}" width="${cell}" height="${cell}" fill="${on ? (C[v.color] || C.yellow) : '#fff'}" stroke="${C.ink}" stroke-width="1"/>`; }
    if (v.unit) out += txt(10, r * cell + 40, v.unit, { size: 16, anchor: 'start', w: 500 });
    return svg(c * cell + 20, r * cell + (v.unit ? 52 : 20), out);
  }
  function angle(v) { // deg · label
    const d = num(v.deg, 60), a = (d * Math.PI) / 180, cx = 40, cy = 200, L = 220; const x2 = cx + L * Math.cos(-a), y2 = cy + L * Math.sin(-a), r = 50;
    let out = `<line x1="${cx}" y1="${cy}" x2="${cx + L}" y2="${cy}" stroke="${C.ink}" stroke-width="4"/><line x1="${cx}" y1="${cy}" x2="${x2}" y2="${y2}" stroke="${C.ink}" stroke-width="4"/>`;
    out += d === 90 ? `<rect x="${cx}" y="${cy - 26}" width="26" height="26" fill="none" stroke="${C.red}" stroke-width="3"/>` : `<path d="M${cx + r} ${cy} A${r} ${r} 0 ${d > 180 ? 1 : 0} 0 ${cx + r * Math.cos(-a)} ${cy + r * Math.sin(-a)}" fill="none" stroke="${C.red}" stroke-width="3"/>`;
    if (v.label !== false) out += txt(cx + 90, cy - 14, v.label || `${d}°`, { size: 22, fill: C.red });
    return svg(300, 220, out);
  }
  function equation(v) { // text — 큰 식(분수는 화면이 쌓아 그린다 → 여기선 글 그대로)
    return `<div class="vz-eq">${e(v.text)}</div>`;
  }
  function objects(v) { return counters({ ...v, kind: v.kind || 'apple' }); }
  function cubes(v) { // stacks:[높이…] 한 줄로 쌓은 쌓기나무(정면)
    const S = (v.stacks || [1]).slice(0, 10), s = 46; let out = '';
    S.forEach((hgt, i) => { for (let k = 0; k < num(hgt); k++) { const x = 20 + i * s, y = 20 + (Math.max(...S) - 1 - k) * s; out += `<rect x="${x}" y="${y}" width="${s}" height="${s}" fill="#ffd27a" stroke="${C.ink}" stroke-width="2"/><path d="M${x} ${y} l10 -10 h${s} l-10 10z" fill="#ffe3a6" stroke="${C.ink}"/>`; } });
    return svg(S.length * s + 50, Math.max(...S) * s + 40, out);
  }

  function lines(v) { // items:[{kind:'segment'|'ray'|'line'|'parallel'|'perpendicular', label, a:'ㄱ', b:'ㄴ'}] (≤ 4)
    const it = (v.items || []).slice(0, 4); let out = '';
    it.forEach((o, i) => { const y = 50 + i * 90, x1 = 80, x2 = 420, A = o.a || '', B = o.b || ''; const dot = (x, yy, n) => `<circle cx="${x}" cy="${yy}" r="7" fill="${C.ink}"/>${n ? txt(x, yy - 16, n, { size: 20 }) : ''}`;
      if (o.kind === 'parallel') out += `<line x1="40" y1="${y - 18}" x2="460" y2="${y - 18}" stroke="${C.blue}" stroke-width="4"/><line x1="40" y1="${y + 18}" x2="460" y2="${y + 18}" stroke="${C.blue}" stroke-width="4"/><line x1="250" y1="${y - 18}" x2="250" y2="${y + 18}" stroke="${C.red}" stroke-width="2" stroke-dasharray="5 4"/>`;
      else if (o.kind === 'perpendicular') out += `<line x1="40" y1="${y + 25}" x2="460" y2="${y + 25}" stroke="${C.blue}" stroke-width="4"/><line x1="250" y1="${y - 35}" x2="250" y2="${y + 25}" stroke="${C.blue}" stroke-width="4"/><rect x="250" y="${y + 9}" width="16" height="16" fill="none" stroke="${C.red}" stroke-width="2"/>`;
      else { const L = o.kind === 'segment' ? x1 : 20, R = o.kind === 'segment' ? x2 : 480; out += `<line x1="${o.kind === 'line' ? L + 10 : x1}" y1="${y}" x2="${o.kind === 'segment' ? x2 : R - 10}" y2="${y}" stroke="${C.blue}" stroke-width="4"/>` + dot(x1, y, A) + dot(x2, y, B);
        if (o.kind !== 'segment') out += `<path d="M${R} ${y} l-16 -9 v18z" fill="${C.blue}"/>`; if (o.kind === 'line') out += `<path d="M${L} ${y} l16 -9 v18z" fill="${C.blue}"/>`; }
      if (o.label) out += txt(560, y + 8, o.label, { size: 22, anchor: 'start' }); });
    return svg(760, it.length * 90 + 20, out);
  }
  function circles(v) { // radii:[cm…] (≤ 4, 같은 비율로) · labels · center(true면 중심점·반지름 선)
    const R = (v.radii || [2]).slice(0, 4).map((x) => num(x, 1)), mx = Math.max(...R), sc = 90 / mx; let x = 10, out = '';
    R.forEach((r, i) => { const rr = r * sc, cx = x + rr + 10, cy = 110; out += `<circle cx="${cx}" cy="${cy}" r="${rr}" fill="${PAL[i % PAL.length]}" fill-opacity=".25" stroke="${C.ink}" stroke-width="2.5"/>`;
      if (v.center !== false) out += `<circle cx="${cx}" cy="${cy}" r="4" fill="${C.ink}"/><line x1="${cx}" y1="${cy}" x2="${cx + rr}" y2="${cy}" stroke="${C.red}" stroke-width="3"/>` + txt(cx + rr / 2, cy - 8, `${r} ${v.unit || 'cm'}`, { size: 16, fill: C.red });
      if (v.labels?.[i]) out += txt(cx, 230, v.labels[i], { size: 18 }); x = cx + rr + 20; });
    return svg(x + 10, 245, out);
  }
  function beaker(v) { // cap(눈금 끝, mL) · amount(mL) · step(눈금 간격) · unit
    const cap = num(v.cap, 1000), amt = Math.min(num(v.amount), cap), st = num(v.step, cap / 10) || cap / 10, H = 240, top = 30, x = 90, w = 150; const y = (q) => top + H - (q / cap) * H;
    let out = `<rect x="${x}" y="${y(amt)}" width="${w}" height="${top + H - y(amt)}" fill="#9fd0f5"/><path d="M${x} ${top - 10} V${top + H} H${x + w} V${top - 10}" fill="none" stroke="${C.ink}" stroke-width="4"/>`;
    for (let q = 0; q <= cap + 1e-9; q += st) { out += `<line x1="${x}" y1="${y(q)}" x2="${x + 22}" y2="${y(q)}" stroke="${C.ink}" stroke-width="2"/>` + txt(x - 10, y(q) + 6, +q.toFixed(3), { size: 15, anchor: 'end', w: 500 }); }
    out += txt(x + w / 2, top + H + 32, `${v.unit || 'mL'}`, { size: 18 });
    return svg(300, H + 75, out);
  }
  function scale(v) { // max · value · step · unit(g|kg) — 바늘 저울
    const mx = num(v.max, 1000), val = Math.min(num(v.value), mx), st = num(v.step, mx / 10) || mx / 10, cx = 160, cy = 170, R = 130; let out = `<path d="M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}" fill="#fff" stroke="${C.ink}" stroke-width="4"/>`;
    for (let q = 0; q <= mx + 1e-9; q += st) { const a = Math.PI - (q / mx) * Math.PI; out += `<line x1="${cx + (R - 18) * Math.cos(a)}" y1="${cy - (R - 18) * Math.sin(a)}" x2="${cx + R * Math.cos(a)}" y2="${cy - R * Math.sin(a)}" stroke="${C.ink}" stroke-width="2"/>` + txt(cx + (R - 38) * Math.cos(a), cy - (R - 38) * Math.sin(a) + 6, +q.toFixed(3), { size: 14, w: 500 }); }
    const a = Math.PI - (val / mx) * Math.PI; out += `<line x1="${cx}" y1="${cy}" x2="${cx + (R - 24) * Math.cos(a)}" y2="${cy - (R - 24) * Math.sin(a)}" stroke="${C.red}" stroke-width="5" stroke-linecap="round"/><circle cx="${cx}" cy="${cy}" r="8" fill="${C.ink}"/>` + txt(cx, cy + 34, v.unit || 'g', { size: 18 });
    return svg(320, 215, out);
  }
  const R = { lines, circles, beaker, scale, counters, objects, tenframe, base10, numberline, array, fraction, shapes, clock, ruler, barchart, linechart, piechart, table, money, pattern, grid, angle, equation, cubes };
  function render(v) { if (!v || !R[v.type]) return ''; try { const out = R[v.type](v); return `<figure class="vz-fig">${out}${v.caption ? `<figcaption>${e(v.caption)}</figcaption>` : ''}</figure>`; } catch (err) { return ''; } }
  return { render, types: Object.keys(R), icons: Object.keys(ICON) };
})();
if (typeof module !== 'undefined') module.exports = VZ;
