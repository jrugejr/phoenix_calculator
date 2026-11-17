// Run from the repository root with: node --test tests/preview.test.cjs
const { test } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const vm = require("node:vm");

function loadSource(path, context) {
  vm.runInContext(fs.readFileSync(path, "utf8"), context, { filename: path });
}

const documentStub = { addEventListener() {} };
const context = vm.createContext({ window: {}, document: documentStub });
loadSource("app.js", context);
loadSource("phoenix-preview.js", context);
const calc = vm.runInContext("calculateLayout", context);
const preview = context.window.PhoenixPreview;

test("all 26 uppercase glyphs have a measured construction", () => {
  for (const ch of "ABCDEFGHIJKLMNOPQRSTUVWXYZ") {
    const width = preview.glyphWidth(ch, 1.125, 0.875);
    assert.ok(width > 0, "Width of " + ch);
    const svg = preview.makeGlyph(ch, 1.125, 0.875, 8.55);
    assert.ok(svg.includes('stroke-width="1.125"'), "Uniform stroke for " + ch);
    assert.ok(svg.includes("<path "), "SVG path exists for " + ch);
    assert.ok(!/NaN|undefined/.test(svg), "Finite glyph geometry for " + ch);
  }
});

test("rendered widths exactly match original Phoenix calculations", () => {
  const words = ["SIGNS", "PHOENIX", "SHOE REPAIR", "OSGN", "MOW", "I", "G"];
  for (const word of words) {
    for (const style of ["smaller", "equal"]) {
      const result = calc(word, 18, style);
      assert.ok(result.recommended, "Calculator recommendation for " + word);
      const plain = preview.buildSvg(result, { guides: false });
      const guides = preview.buildSvg(result, { guides: true });
      assert.ok(Math.abs(plain.width - result.recommended.finalWidth) < 0.000001);
      assert.equal(plain.width, guides.width, "Guides don't affect geometry");
      assert.equal((plain.svg.match(/transform="translate\(/g) || []).length,
        result.letters.length, "One glyph per letter");
      assert.ok(!/NaN|undefined/.test(plain.svg), "Finite SVG values");
      assert.ok(plain.svg.includes('stroke="#f57477"'), "Target box present");
    }
  }
});

test("counter width changes glyph advance, not stroke thickness", () => {
  const a = preview.makeGlyph("O", 1, 0.8, 7.6);
  const b = preview.makeGlyph("O", 1, 0.95, 7.6);
  assert.equal(preview.glyphWidth("O", 1, .8), 2.8);
  assert.equal(preview.glyphWidth("O", 1, .95), 2.95);
  assert.ok(a.includes('stroke-width="1"'));
  assert.ok(b.includes('stroke-width="1"'));
});

test("bad or missing inputs fail clearly", () => {
  assert.throws(() => preview.glyphWidth("?", 1, 1), /No preview glyph/);
  assert.throws(() => preview.buildSvg(null, {}), /calculated Phoenix layout/);
});
