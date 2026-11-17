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
    // Filled Phoenix construction pieces preserve the exact squared or curved
    // terminal silhouette without half-stroke cap gaps at the red boundary.
    // Unioning the pieces is non-additive, so overlapping joins never thicken.
    const namedFill = (component, d) => {
      const recipe = RECIPES[char];
      if (!recipe.fixed.includes(component) && !recipe.stretch.includes(component)) {
        throw new Error("Unknown " + char + " component: " + component);
      }
      paths.push('<path data-phoenix-component="' + component +
        '" d="' + d + '" fill="currentColor"/>');
    };
    const rectShape = (left, top, width, tall) =>
      "M " + x(left) + " " + x(top) + " h " + x(width) +
      " v " + x(tall) + " h " + x(-width) + " Z";
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
      case "W": {
        // Five true columns: stem / counter / stem / counter / stem.
        // Counter cells contribute the bottom closures only.
        const C1 = s + counter, C2 = 2 * s + counter;
        const R0 = 2 * s + 2 * counter;
        const cr = Math.min(s * .52, height * .055);
        // Outer left and right bottom returns are quarter-circle terminals.
        namedFill("leftStem", "M 0 0 H " + x(s) + " V " + x(height) +
          " H " + x(cr) + " Q 0 " + x(height) + " 0 " + x(height - cr) + " Z");
        // A central double-shouldered lower point, built as one fixed stem.
        // Its left and right corners curl *inward* at the baseline.
        namedFill("middleStemSystem", "M " + x(C1) + " 0 H " + x(C2) +
          " V " + x(height) + " Q " + x(C1 + s / 2) + " " + x(height) +
          " " + x(C1 + s / 2) + " " + x(height - cr) +
          " Q " + x(C1 + s / 2) + " " + x(height) +
          " " + x(C1) + " " + x(height) + " Z");
        namedFill("rightStem", "M " + x(R0) + " 0 H " + x(width) +
          " V " + x(height - cr) + " Q " + x(width) + " " + x(height) +
          " " + x(width - cr) + " " + x(height) + " H " + x(R0) + " Z");
        namedFill("leftLowerCounter", rectShape(s, height - s, counter, s));
        namedFill("rightLowerCounter", rectShape(C2, height - s, counter, s));
        break;
      }
      case "X": {
        // Four upright lobes, pinched at the outer edges at the middle,
        // joined by one horizontal, constant-thickness center strike.
        const mid = height / 2;
        const half = s / 2, cr = Math.min(s * .5, height * .055);
        namedFill("upperLeft", "M 0 0 H " + x(s) + " V " + x(mid + half) +
          " H " + x(cr) + " Q 0 " + x(mid + half) + " 0 " + x(mid + half - cr) + " Z");
        namedFill("lowerLeft", "M 0 " + x(mid - half + cr) +
          " Q 0 " + x(mid - half) + " " + x(cr) + " " + x(mid - half) +
          " H " + x(s) + " V " + x(height) + " H 0 Z");
        namedFill("upperRight", "M " + x(s + counter) + " 0 H " + x(width) +
          " V " + x(mid + half - cr) + " Q " + x(width) +
          " " + x(mid + half) + " " + x(width - cr) + " " + x(mid + half) +
          " H " + x(s + counter) + " Z");
        namedFill("lowerRight", "M " + x(s + counter) + " " + x(mid - half) +
          " H " + x(width - cr) + " Q " + x(width) + " " + x(mid - half) +
          " " + x(width) + " " + x(mid - half + cr) + " V " + x(height) +
          " H " + x(s + counter) + " Z");
        namedFill("centerJoin", rectShape(s, mid - half, counter, s));
        break;
      }
      case "Y": {
        // User's construction is NOT the conventional fork-shaped Y.
        // Left column has separated upper/lower terminals, right column
        // continues full height, and two counter-column connectors join them.
        const upperY = height * .55, lowerY = height - s;
        const cr = Math.min(s * .5, height * .05);
        namedFill("leftUpperStem", "M 0 0 H " + x(s) +
          " V " + x(upperY - cr) +
          " Q " + x(s) + " " + x(upperY) +
          " " + x(s - cr) + " " + x(upperY) +
          " H 0 Z");
        namedFill("leftLowerStem", "M 0 " + x(lowerY) +
          " H " + x(s - cr) + " Q " + x(s) + " " + x(lowerY) +
          " " + x(s) + " " + x(lowerY + cr) +
          " V " + x(height) + " H 0 Z");
        namedFill("upperJoin", rectShape(s, upperY - s, counter, s));
        namedFill("lowerJoin", rectShape(s, height - s, counter, s));
        // Inward lower return: round the right stem's bottom-left corner.
        namedFill("rightStem", "M " + x(s + counter) + " 0 H " + x(width) +
          " V " + x(height) + " H " + x(s + counter + cr) +
          " Q " + x(s + counter) + " " + x(height) +
          " " + x(s + counter) + " " + x(height - cr) + " Z");
        break;
      }
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
