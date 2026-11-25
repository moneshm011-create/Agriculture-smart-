import test from 'node:test';
import assert from 'node:assert/strict';
import { buildCsvContent, escapeCsvCell, sanitizeFilenameSegment } from './csvExport';

test('escapeCsvCell handles commas, quotes, numbers, and formula prefixes', () => {
  assert.equal(escapeCsvCell('Koyambedu Market, Chennai'), '"Koyambedu Market, Chennai"');
  assert.equal(escapeCsvCell('Grade "A" Tomato'), '"Grade ""A"" Tomato"');
  assert.equal(escapeCsvCell(3150), '3150');
  assert.equal(escapeCsvCell(null), '');
  assert.equal(escapeCsvCell('=SUM(A1:A2)'), "'=SUM(A1:A2)");
});

test('buildCsvContent generates Excel-compatible UTF-8 BOM CSV with CRLF rows', () => {
  const rows = [
    { market: 'Oddanchatram Market', price: 3798, netProfit: 90425 },
    { market: 'Koyambedu Market, Chennai', price: 3916, netProfit: 89745 },
  ];
  const csv = buildCsvContent(rows, [
    { header: 'Market Name', accessor: (r) => r.market },
    { header: 'Price (INR/Quintal)', accessor: (r) => r.price },
    { header: 'Net Profit (INR)', accessor: (r) => r.netProfit },
  ]);

  assert.ok(csv.startsWith('\uFEFF'));
  const lines = csv.slice(1).split('\r\n');
  assert.equal(lines.length, 3);
  assert.equal(lines[0], 'Market Name,Price (INR/Quintal),Net Profit (INR)');
  assert.equal(lines[1], 'Oddanchatram Market,3798,90425');
  assert.equal(lines[2], '"Koyambedu Market, Chennai",3916,89745');
});

test('sanitizeFilenameSegment produces clean slug filenames', () => {
  assert.equal(sanitizeFilenameSegment('Koyambedu Market, Chennai'), 'koyambedu-market-chennai');
  assert.equal(sanitizeFilenameSegment('Tomato'), 'tomato');
});
