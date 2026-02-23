const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('achievementsList structure validation', (t) => {
  const htmlPath = path.join(__dirname, '../index.html');
  const content = fs.readFileSync(htmlPath, 'utf8');

  // Extract the achievementsList object
  const match = content.match(/const achievementsList = ({[\s\S]+?});/);

  if (!match) {
    assert.fail('Could not find achievementsList definition in index.html');
  }

  const listStr = match[1];
  let achievementsList;

  try {
    // Wrap in parentheses to evaluate as an expression
    achievementsList = eval(`(${listStr})`);
  } catch (e) {
    assert.fail(`Failed to parse achievementsList: ${e.message}`);
  }

  assert.strictEqual(typeof achievementsList, 'object', 'achievementsList should be an object');

  const entries = Object.entries(achievementsList);
  assert.ok(entries.length > 0, 'achievementsList should not be empty');

  for (const [key, value] of entries) {
    const threshold = Number(key);
    assert.ok(!isNaN(threshold), `Threshold "${key}" should be a number`);

    assert.ok(value, `Achievement for threshold ${key} should be defined`);
    assert.strictEqual(typeof value.title, 'string', `Achievement ${key} should have a title string`);
    assert.ok(value.title.trim().length > 0, `Achievement ${key} title should not be empty`);

    assert.strictEqual(typeof value.text, 'string', `Achievement ${key} should have a text string`);
    assert.ok(value.text.trim().length > 0, `Achievement ${key} text should not be empty`);
  }
});
