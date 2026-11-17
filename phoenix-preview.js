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

  // Each path is a centerline. A single, calculated stroke width applies
  // to verticals, horizontals and curved portions alike; no glyph is
  // independently horizontally stretched to fit its advance.
  function paintPath(d, stem, component) {
    return '<path' + (component ? ' data-phoenix-component="' + component + '"' : '') +
      ' d="' + d + '" fill="none" stroke="currentColor" stroke-width="' +
      n(stem) + '" stroke-linecap="butt" stroke-linejoin="round"/>';
  }

  function makeGlyph(char, stem, counter, height) {
    const width = glyphWidth(char, stem, counter);
    const L = stem / 2, R = width - stem / 2, T = stem / 2, B = height - stem / 2;
    const M = height / 2, X = width / 2;
    const q1 = height * 0.29, q3 = height * 0.71;
    const x = n, s = stem;
    const paths = [];
    const add = (d) => paths.push(paintPath(d, stem));
    const named = (component, d) => {
      const recipe = RECIPES[char];
      if (!recipe.fixed.includes(component) && !recipe.stretch.includes(component)) {
        throw new Error("Unknown " + char + " component: " + component);
      }
      paths.push(paintPath(d, stem, component));
    };
    const segment = (a, b, c, d) =>
      "M " + x(a) + " " + x(b) + " L " + x(c) + " " + x(d);
    const stroke = (a, b, c, d) => add(segment(a, b, c, d));
    const roundO = () => {
      add("M " + x(X) + " " + x(T) +
          " C " + x(R) + " " + x(T) + " " + x(R) + " " + x(T + s * .5) + " " + x(R) + " " + x(T + s * 1.45) +
          " V " + x(B - s * 1.45) +
          " C " + x(R) + " " + x(B - s * .5) + " " + x(R) + " " + x(B) + " " + x(X) + " " + x(B) +
          " C " + x(L) + " " + x(B) + " " + x(L) + " " + x(B - s * .5) + " " + x(L) + " " + x(B - s * 1.45) +
          " V " + x(T + s * 1.45) +
          " C " + x(L) + " " + x(T + s * .5) + " " + x(L) + " " + x(T) + " " + x(X) + " " + x(T) + " Z");
    };
    const roundC = () => {
      add("M " + x(R) + " " + x(T) +
          " C " + x(X) + " " + x(T) + " " + x(L) + " " + x(T) + " " + x(L) + " " + x(T + 1.45 * s) +
          " V " + x(B - 1.45 * s) +
          " C " + x(L) + " " + x(B) + " " + x(X) + " " + x(B) + " " + x(R) + " " + x(B));
    };

    switch (char) {
      case "A":
        // Three user-defined assemblies: left stroke, center connector system,
        // right stroke. Each side has its own rounded shoulder at the top.
        named("leftStemCap", "M " + x(L) + " " + x(B) +
          " V " + x(T + s * .65) +
          " Q " + x(L) + " " + x(T) + " " + x(L + s * .65) + " " + x(T));
        named("centerBridge", segment(L + s * .65, T, R - s * .65, T));
        // centerCounter is negative space: its width is the calculated counter.
        named("crossbar", segment(L, M, R, M));
        named("rightStemCap", "M " + x(R) + " " + x(B) +
          " V " + x(T + s * .65) +
          " Q " + x(R) + " " + x(T) + " " + x(R - s * .65) + " " + x(T));
        break;
      case "B":
        named("leftStem", segment(L, T, L, B));
        named("rightBowlShell", "M " + x(R - s * .65) + " " + x(T) +
          " Q " + x(R) + " " + x(T) + " " + x(R) + " " + x(T + s * .65) +
          " V " + x(B - s * .65) +
          " Q " + x(R) + " " + x(B) + " " + x(R - s * .65) + " " + x(B));
        named("topBridge", segment(L, T, R - s * .65, T));
        named("middleStrike", segment(L, T + (B - T) * RECIPES.B.rules.middleStrikeY,
                                      R, T + (B - T) * RECIPES.B.rules.middleStrikeY));
        named("bottomBridge", segment(L, B, R - s * .65, B));
        break;
      case "C":
        named("leftShell", "M " + x(L + s * .65) + " " + x(T) +
          " Q " + x(L) + " " + x(T) + " " + x(L) + " " + x(T + s * .65) +
          " V " + x(B - s * .65) +
          " Q " + x(L) + " " + x(B) + " " + x(L + s * .65) + " " + x(B));
        named("topBridge", segment(L + s * .65, T, R - s * .65, T));
        named("rightTopTerminal", "M " + x(R - s * .65) + " " + x(T) +
          " Q " + x(R) + " " + x(T) + " " + x(R) + " " + x(T + s * .45));
        named("bottomBridge", segment(L + s * .65, B, R - s * .65, B));
        named("rightBottomTerminal", "M " + x(R - s * .65) + " " + x(B) +
          " Q " + x(R) + " " + x(B) + " " + x(R) + " " + x(B - s * .45));
        break;
      case "D":
        stroke(L, T, L, B);
        add("M " + x(L) + " " + x(T) +
            " C " + x(R) + " " + x(T) + " " + x(R) + " " + x(T + s) + " " + x(R) + " " + x(M) +
            " C " + x(R) + " " + x(B - s) + " " + x(R) + " " + x(B) + " " + x(L) + " " + x(B));
        break;
      case "E":
        stroke(L, T, L, B);
        stroke(L, T, R, T);
        stroke(L, M, R - s * .14, M);
        stroke(L, B, R, B);
        break;
      case "F":
        stroke(L, T, L, B);
        stroke(L, T, R, T);
        stroke(L, M, R - s * .14, M);
        break;
      case "G": {
        // Inherits the C open shell. Lower right return carries a middle spur.
        named("leftShell", "M " + x(L + s * .65) + " " + x(T) +
          " Q " + x(L) + " " + x(T) + " " + x(L) + " " + x(T + s * .65) +
          " V " + x(B - s * .65) +
          " Q " + x(L) + " " + x(B) + " " + x(L + s * .65) + " " + x(B));
        named("topBridge", segment(L + s * .65, T, R - s * .65, T));
        named("rightTopTerminal", "M " + x(R - s * .65) + " " + x(T) +
          " Q " + x(R) + " " + x(T) + " " + x(R) + " " + x(T + s * .45));
        named("bottomBridge", segment(L + s * .65, B, R - s * .65, B));
        named("rightBottomTerminal", "M " + x(R - s * .65) + " " + x(B) +
          " Q " + x(R) + " " + x(B) + " " + x(R) + " " + x(B - s * .65) +
          " V " + x(M));
        named("middleSpur", segment(R, M, L + s + counter * .53, M));
        break;
      }
      case "H":
        stroke(L, T, L, B);
        stroke(R, T, R, B);
        stroke(L, M, R, M);
        break;
      case "I":
        stroke(X, T, X, B);
        break;
      case "J":
        add("M " + x(R) + " " + x(T) +
            " V " + x(B - s * 1.25) +
            " C " + x(R) + " " + x(B) + " " + x(L) + " " + x(B) + " " + x(L) + " " + x(B - s * 1.25));
        break;
      case "K":
        stroke(L, T, L, B);
        add("M " + x(R) + " " + x(T) + " L " + x(L) + " " + x(M) + " L " + x(R) + " " + x(B));
        break;
      case "L":
        stroke(L, T, L, B);
        stroke(L, B, R, B);
        break;
      case "M":
        stroke(L, T, L, B);
        stroke(X, T + s * 2.05, X, B);
        stroke(R, T, R, B);
        add("M " + x(L) + " " + x(T) + " L " + x(X) + " " + x(T + s * 2.05) + " L " + x(R) + " " + x(T));
        break;
      case "N":
        // Tall lowercase-n construction. No diagonal, independent upright bars.
        named("leftStem", segment(L, T, L, B));
        named("topBridge", "M " + x(L) + " " + x(T) +
          " H " + x(R - s * .65) +
          " Q " + x(R) + " " + x(T) + " " + x(R) + " " + x(T + s * .65));
        named("rightStem", segment(R, T + s * .65, R, B));
        break;
      case "O":
        roundO();
        break;
      case "P":
        stroke(L, T, L, B);
        add("M " + x(L) + " " + x(T) +
            " C " + x(R) + " " + x(T) + " " + x(R) + " " + x(M - s * .75) + " " + x(R) + " " + x(M - s * .35) +
            " Q " + x(R) + " " + x(M) + " " + x(L) + " " + x(M));
        break;
      case "Q":
        roundO();
        stroke(X, B - s * .7, R, B);
        break;
      case "R":
        stroke(L, T, L, B);
        add("M " + x(L) + " " + x(T) +
            " C " + x(R) + " " + x(T) + " " + x(R) + " " + x(M - s * .75) + " " + x(R) + " " + x(M - s * .35) +
            " Q " + x(R) + " " + x(M) + " " + x(L) + " " + x(M));
        stroke(L + s * .2, M, R, B);
        break;
      case "S":
        // The S is two opposing structural shells tied by a middle strike.
        // This is deliberately NOT a generic continuously interpolated spline.
        named("upperLeftShell", "M " + x(L + s * .65) + " " + x(T) +
          " Q " + x(L) + " " + x(T) + " " + x(L) + " " + x(T + s * .65) +
          " V " + x(M));
        named("topBridge", segment(L + s * .65, T, R - s * .65, T));
        named("upperRightTerminal", "M " + x(R - s * .65) + " " + x(T) +
          " Q " + x(R) + " " + x(T) + " " + x(R) + " " + x(T + s * .45));
        named("middleStrike", segment(L, M, R, M));
        named("lowerRightShell", "M " + x(R) + " " + x(M) +
          " V " + x(B - s * .65) +
          " Q " + x(R) + " " + x(B) + " " + x(R - s * .65) + " " + x(B));
        named("bottomBridge", segment(L + s * .65, B, R - s * .65, B));
        named("lowerLeftTerminal", "M " + x(L + s * .65) + " " + x(B) +
          " Q " + x(L) + " " + x(B) + " " + x(L) + " " + x(B - s * .45));
        break;
      case "T":
        stroke(L, T, R, T);
        stroke(X, T, X, B);
        break;
      case "U":
        add("M " + x(L) + " " + x(T) +
            " V " + x(B - s * 1.4) +
            " C " + x(L) + " " + x(B) + " " + x(X) + " " + x(B) + " " + x(X) + " " + x(B) +
            " C " + x(R) + " " + x(B) + " " + x(R) + " " + x(B - s * 1.4) +
            " V " + x(T));
        break;
      case "V":
        add("M " + x(L) + " " + x(T) + " L " + x(X) + " " + x(B) + " L " + x(R) + " " + x(T));
        break;
      case "W":
        add("M " + x(L) + " " + x(T) +
            " L " + x(L + (X - L) * .42) + " " + x(B) +
            " L " + x(X) + " " + x(T + s * 2) +
            " L " + x(X + (R - X) * .58) + " " + x(B) +
            " L " + x(R) + " " + x(T));
        break;
      case "X":
        stroke(L, T, R, B);
        stroke(R, T, L, B);
        break;
      case "Y":
        stroke(L, T, X, M);
        stroke(R, T, X, M);
        stroke(X, M, X, B);
        break;
      case "Z":
        stroke(L, T, R, T);
        stroke(R, T, L, B);
        stroke(L, B, R, B);
        break;
      default:
        throw new Error("Unsupported preview letter " + char);
    }
    return paths.join("");
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
        makeGlyph(letter.char, stem, counter, height);
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
        ". Red outline shows the requested " + n(result.targetWidth) +
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
