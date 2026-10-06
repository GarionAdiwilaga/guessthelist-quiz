import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';

const dbPath = path.resolve(process.cwd(), 'anime-family-database-ranked-top10.json');
const raw = fs.readFileSync(dbPath, 'utf8');
const data = JSON.parse(raw);

assert.strictEqual(typeof data, 'object', 'Database root must be an object');
assert.ok(Array.isArray(data.categories), 'Database must contain categories array');
assert.strictEqual(data.categories.length, 4, 'Must have exactly 4 categories');

for (const cat of data.categories) {
  assert.ok(cat.id, 'Category must have an id');
  assert.ok(cat.category, 'Category must have a category name');
  assert.ok(Array.isArray(cat.items), 'Category must contain items array');
  assert.strictEqual(cat.items.length, 10, `Category ${cat.category} must have exactly 10 items`);

  for (const item of cat.items) {
    assert.ok(typeof item.id === 'number', 'Item must have a numeric id');
    assert.ok(typeof item.answer === 'string' && item.answer.trim().length > 0, 'Item must have non-empty answer');
    assert.ok(typeof item.rank === 'number' && item.rank >= 1 && item.rank <= 10, 'Item rank must be between 1 and 10');
  }
}

console.log('Database integrity check passed successfully! 4 categories, 10 items each.');
