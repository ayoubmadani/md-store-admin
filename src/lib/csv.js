// قراءة CSV (ملفات السجل المالي) لعرضها كجدول Excel: BOM، خانات بين علامات تنصيص، فواصل وأسطر داخلها، CRLF.
// علامة ' في بداية خانة (حماية Excel من الصيغ عند التصدير) تُزال للعرض.
export function parseCsv(text) {
  const s = String(text ?? '').replace(/^﻿/, '');
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  let wasQuoted = false;
  const endCell = () => {
    row.push(wasQuoted && cell.startsWith("'") && /^'[=+\-@]/.test(cell) ? cell.slice(1) : cell);
    cell = ''; wasQuoted = false;
  };
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (quoted) {
      if (c === '"' && s[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') { quoted = true; wasQuoted = true; }
    else if (c === ',') endCell();
    else if (c === '\r') { /* CRLF */ }
    else if (c === '\n') { endCell(); rows.push(row); row = []; }
    else cell += c;
  }
  if (cell !== '' || row.length) { endCell(); rows.push(row); }
  return rows;
}

/** حرف العمود كما في Excel: 0 ← A، 26 ← AA */
export function colName(i) {
  let n = i + 1; let out = '';
  while (n > 0) { const r = (n - 1) % 26; out = String.fromCharCode(65 + r) + out; n = Math.floor((n - 1) / 26); }
  return out;
}
