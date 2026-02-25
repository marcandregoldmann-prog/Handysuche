const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

test('validateAchievements logic', async (t) => {
    const htmlPath = path.join(__dirname, '../index.html');
    const content = fs.readFileSync(htmlPath, 'utf8');

    // Extract the validateAchievements function
    // Look for the function start and match until the next closing brace at the same indentation
    const match = content.match(/(function validateAchievements\(list\) \{[\s\S]+?\n\s+return errors;\n\s+\})/);
    if (!match) {
        // Try an alternative regex if the first one fails
        const altMatch = content.match(/function validateAchievements\(list\) \{([\s\S]+?)\n\s+\}/);
        if (!altMatch) {
            assert.fail('Could not find validateAchievements function in index.html');
        }
        // If we use the alt match, we might need to wrap it differently
        // but let's try to make the first one work.
    }

    const validateAchievements = eval(`(${match[1]})`);

    await t.test('should return no errors for valid achievements', () => {
        const valid = {
            1: { title: "Test", text: "Test text" },
            10: { title: "Ten", text: "Ten text" }
        };
        const errors = validateAchievements(valid);
        assert.strictEqual(errors.length, 0);
    });

    await t.test('should catch invalid thresholds', () => {
        const invalid = {
            "not-a-number": { title: "Test", text: "Test text" }
        };
        const errors = validateAchievements(invalid);
        assert.ok(errors.some(e => e.includes('not a number')), 'Should catch non-numeric threshold');
    });

    await t.test('should catch missing titles', () => {
        const invalid = {
            1: { text: "Test text" }
        };
        const errors = validateAchievements(invalid);
        assert.ok(errors.some(e => e.includes('missing a valid title')), 'Should catch missing title');
    });

    await t.test('should catch invalid title types', () => {
        const invalid = {
            1: { title: 123, text: "Test text" }
        };
        const errors = validateAchievements(invalid);
        assert.ok(errors.some(e => e.includes('missing a valid title')), 'Should catch non-string title');
    });

    await t.test('should catch missing text', () => {
        const invalid = {
            1: { title: "Test" }
        };
        const errors = validateAchievements(invalid);
        assert.ok(errors.some(e => e.includes('missing a valid text')), 'Should catch missing text');
    });

    await t.test('should catch invalid text types', () => {
        const invalid = {
            1: { title: "Test", text: true }
        };
        const errors = validateAchievements(invalid);
        assert.ok(errors.some(e => e.includes('missing a valid text')), 'Should catch non-string text');
    });
});
