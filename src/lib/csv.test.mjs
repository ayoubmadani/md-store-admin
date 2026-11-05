// node --test src/lib/csv.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, colName } from './csv.js';

test('parses the ledger CSV: BOM, header, quoted cells with commas/quotes/newlines, CRLF', () => {
  const text = '﻿التاريخ,السبب\r\n2026-11-05,"طلب, رقم ""1042"""\r\n2026-11-06,"سطر\nثاني"\r\n';
  assert.deepEqual(parseCsv(text), [['التاريخ', 'السبب'], ['2026-11-05', 'طلب, رقم "1042"'], ['2026-11-06', 'سطر\nثاني']]);
});

test('formula guard quote is removed for display', () => {
  assert.deepEqual(parseCsv(`a\r\n"'=SUM(A1)"\r\n`), [['a'], ['=SUM(A1)']]);
});

test('empty cells and no trailing newline', () => {
  assert.deepEqual(parseCsv('a,b,c\n1,,3'), [['a', 'b', 'c'], ['1', '', '3']]);
});

test('Excel column letters', () => {
  assert.equal(colName(0), 'A');
  assert.equal(colName(25), 'Z');
  assert.equal(colName(26), 'AA');
});
