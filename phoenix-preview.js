// Phoenix variable-grid preview: paint is built at the calculated measurements.
// This file does NOT alter the calculator's unit, margin, or spacing mathematics.
(function () {
  "use strict";

  // The construction recipe data is shared by the renderer and test harness.
  const RECIPES = window.PHOENIX_RECIPES;
  if (!RECIPES) throw new Error("Phoenix recipes must load before the renderer.");
  const RULES = Object.fromEntries(Object.entries(RECIPES).map(([letter, recipe]) => [
    letter, [recipe.width.filter(v => v === "stem").length,
             recipe.width.filter(v => v === "counter").length]
  ]));

  function n(x) {
    return String(Math.round(x * 100000) / 100000);
  }

  function glyphWidth(char, stem, counter) {
    const rule = RULES[char];
    if (!rule) throw new Error("No preview glyph for " + char);
    return rule[0] * stem + rule[1] * counter;
  }

  // The letterform is now assembled from the actual filled FontStruct
  // contours, never a hand-drawn approximation or a scaled finished font.
  function makeGlyph(char, stem, counter, height, options) {
    if (!window.PhoenixQuads) throw new Error("Phoenix quad geometry is missing.");
    return window.PhoenixQuads.renderGlyph(char, stem, counter, height, options);
  }

  function guideColumns(char, stem, counter, height) {
    const rule = RULES[char];
    const parts = [];
    let pos = 0;
    for (let i = 0; i < rule[0] + rule[1]; i++) {
      const isCounter = i % 2 === 1;
      const width = isCounter ? counter : stem;
      parts.push('<rect x="' + n(pos) + '" y="0" width="' + n(width) +
        '" height="' + n(height) + '" fill="' +
        (isCounter ? '#f3b457' : '#ff777a') + '" fill-opacity="' +
        (isCounter ? '.18' : '.09') + '" stroke="' +
        (isCounter ? '#dba053' : '#cc6565') +
        '" stroke-opacity=".65" stroke-width="' + n(stem / 35) + '"/>');
      pos += width;
    }
    return parts.join("");
  }

  function buildSvg(result, options) {
    const calc = result && result.recommended;
    if (!calc) throw new Error("Preview needs a calculated Phoenix layout.");
    const stem = calc.stem, counter = calc.counter;
    const spacing = calc.letterSpacing, wordSpace = calc.wordSpacing;
    const target = result.targetWidth;
    if (![stem, counter, spacing, wordSpace, target].every(Number.isFinite) ||
        stem <= 0 || counter <= 0 || target <= 0) {
      throw new Error("Invalid dimensions supplied to Phoenix preview.");
    }
    // Height controls only the vertical construction. Calculated widths never change.
    const height = options && options.height !== undefined
      ? Number(options.height) : target / 2;
    if (!Number.isFinite(height) || height <= 0) {
      throw new Error("Preview letter height must be a positive number.");
    }
    if (height < stem * 3.2) {
      throw new Error("That preview height is too short for the calculated " +
        "stroke (" + n(stem) + " in). Increase the preview height; Phoenix's width math stays unchanged.");
    }
    // The red frame is the glyph-height box: ink reaches both its edges.
    // The half-stroke centerline offset (T/B above) keeps all ink within 0..height.
    const y = 0;
    const boxH = height;
    const guides = Boolean(options && options.guides);
    let xpos = calc.sideMargin, previousWord = null;
    let body = "";

    result.letters.forEach((letter) => {
      if (!RULES[letter.char]) throw new Error("Unsupported preview glyph " + letter.char);
      if (previousWord !== null) {
        xpos += previousWord === letter.wordIndex ? spacing : wordSpace;
      }
      const w = glyphWidth(letter.char, stem, counter);
      const inner = (guides ? guideColumns(letter.char, stem, counter, height) : "") +
        makeGlyph(letter.char, stem, counter, height, { guides });
      body += '<g transform="translate(' + n(xpos) + ' ' + n(y) + ')">' + inner + '</g>';
      xpos += w;
      previousWord = letter.wordIndex;
    });
    const drawnWidth = xpos - calc.sideMargin;
    if (Math.abs(drawnWidth - calc.finalWidth) > 0.0001) {
      throw new Error("Preview and calculator widths disagree (" +
        n(drawnWidth) + " vs " + n(calc.finalWidth) + ").");
    }

    const outerPad = Math.max(stem * .7, target * .08);
    const viewX = -outerPad, viewY = -outerPad;
    const viewW = target + 2 * outerPad, viewH = boxH + 2 * outerPad;
    const gridUnit = Math.max(stem * .5, target / 52);
    const gridStrong = gridUnit * 5;
    const guideline = guides
      ? '<line x1="' + n(calc.sideMargin) + '" y1="0" x2="' + n(calc.sideMargin) +
          '" y2="' + n(boxH) + '" stroke="#f8be66" stroke-dasharray="' + n(stem * .13) +
          '" stroke-width="' + n(stem / 20) + '"/>' +
        '<line x1="' + n(target - calc.sideMargin) + '" y1="0" x2="' +
          n(target - calc.sideMargin) + '" y2="' + n(boxH) +
          '" stroke="#f8be66" stroke-dasharray="' + n(stem * .13) +
          '" stroke-width="' + n(stem / 20) + '"/>'
      : "";
    const grid = '<defs>' +
      '<pattern id="phx-fine-grid" width="' + n(gridUnit) + '" height="' + n(gridUnit) +
      '" patternUnits="userSpaceOnUse"><path d="M ' + n(gridUnit) + ' 0 H 0 V ' + n(gridUnit) +
      '" fill="none" stroke="#47738c" stroke-opacity=".3" stroke-width="' + n(stem / 55) +
      '"/></pattern>' +
      '<pattern id="phx-major-grid" width="' + n(gridStrong) + '" height="' + n(gridStrong) +
      '" patternUnits="userSpaceOnUse"><path d="M ' + n(gridStrong) + ' 0 H 0 V ' + n(gridStrong) +
      '" fill="none" stroke="#5c8092" stroke-opacity=".28" stroke-width="' + n(stem / 35) +
      '"/></pattern></defs>';
    const svg = '<svg xmlns="http://www.w3.org/2000/svg" role="img"' +
      ' aria-label="Phoenix construction preview for ' + result.copy.replace(/[^A-Z ]/g, "") + '"' +
      ' viewBox="' + [viewX, viewY, viewW, viewH].map(n).join(" ") + '"' +
      ' preserveAspectRatio="xMidYMid meet">' +
      grid +
      '<rect x="' + n(viewX) + '" y="' + n(viewY) + '" width="' + n(viewW) +
      '" height="' + n(viewH) + '" fill="#0a1721"/>' +
      '<rect x="' + n(viewX) + '" y="' + n(viewY) + '" width="' + n(viewW) +
      '" height="' + n(viewH) + '" fill="url(#phx-fine-grid)"/>' +
      '<rect x="' + n(viewX) + '" y="' + n(viewY) + '" width="' + n(viewW) +
      '" height="' + n(viewH) + '" fill="url(#phx-major-grid)"/>' +
      '<rect x="0" y="0" width="' + n(target) + '" height="' + n(boxH) +
      '" fill="#152a36" fill-opacity=".42" stroke="#f57477" stroke-width="' +
      n(stem / 18) + '"/>' +
      guideline +
      '<g color="#8bdcff">' + body + '</g>' +
      '</svg>';
    return { svg: svg, aspect: viewW / viewH, width: drawnWidth, height: height };
  }

  let currentResult = null;

  function render(result) {
    currentResult = result;
    const container = document.getElementById("previewCanvas");
    if (!container) return;
    const toggler = document.getElementById("previewGuides");
    try {
      const heightInput = document.getElementById("previewHeightInput");
      const rawHeight = heightInput ? heightInput.value.trim() : "";
      const manualHeight = rawHeight !== "";
      const height = manualHeight ? Number(rawHeight) : result.targetWidth / 2;
      const data = buildSvg(result, { guides: toggler && toggler.checked, height });
      container.innerHTML = data.svg;
      const note = document.getElementById("previewStatus");
      if (note) note.textContent = "Letter height: " + n(data.height) +
        " in" + (manualHeight ? " (custom)" : " (automatic: half target width)") +
        ". " + (toggler && toggler.checked ? "Construction view: counter bridges highlighted. " : "Finished view. ") + "Red outline shows the requested " + n(result.targetWidth) +
        " in width. Preview height is visual only; Phoenix calculations are unchanged.";
    } catch (err) {
      container.textContent = "Preview unavailable: " + err.message;
      const note = document.getElementById("previewStatus");
      if (note) note.textContent = "The Phoenix calculation above is still valid; only the illustrative preview needs a different height.";
    }
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
      const toggler = document.getElementById("previewGuides");
      if (toggler) toggler.addEventListener("change", () => {
        if (currentResult) render(currentResult);
      });
      const heightInput = document.getElementById("previewHeightInput");
      if (heightInput) heightInput.addEventListener("input", () => {
        if (currentResult) render(currentResult);
      });
    });
  }

  window.PhoenixPreview = {
    render: render,
    buildSvg: buildSvg,
    glyphWidth: glyphWidth,
    makeGlyph: makeGlyph
  };
})();
