// Phoenix variable-grid preview: paint is built at the calculated measurements.
// This file does NOT alter the calculator's unit, margin, or spacing mathematics.
(function () {
  "use strict";

  const RULES = {
    A: [2, 1], B: [2, 1], C: [2, 1], D: [2, 1],
    E: [1, 1], F: [1, 1], G: [2, 1], H: [2, 1],
    I: [1, 0], J: [2, 1], K: [2, 1], L: [1, 1],
    M: [3, 2], N: [2, 1], O: [2, 1], P: [2, 1],
    Q: [2, 1], R: [2, 1], S: [2, 1], T: [1, 1],
    U: [2, 1], V: [2, 1], W: [3, 2], X: [2, 1],
    Y: [2, 1], Z: [2, 1]
  };

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
  function paintPath(d, stem) {
    return '<path d="' + d + '" fill="none" stroke="currentColor" stroke-width="' +
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
    const stroke = (a, b, c, d) =>
      add("M " + x(a) + " " + x(b) + " L " + x(c) + " " + x(d));
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
        add("M " + x(L) + " " + x(B) + " L " + x(X) + " " + x(T) + " L " + x(R) + " " + x(B));
        stroke((L + X) / 2, M, (R + X) / 2, M);
        break;
      case "B":
        stroke(L, T, L, B);
        add("M " + x(L) + " " + x(T) +
            " C " + x(R) + " " + x(T) + " " + x(R) + " " + x(M - s * .65) + " " + x(R) + " " + x(M - s * .35) +
            " Q " + x(R) + " " + x(M) + " " + x(L) + " " + x(M));
        add("M " + x(L) + " " + x(M) +
            " Q " + x(R) + " " + x(M) + " " + x(R) + " " + x(M + s * .5) +
            " C " + x(R) + " " + x(B - s * .25) + " " + x(R) + " " + x(B) + " " + x(L) + " " + x(B));
        break;
      case "C":
        roundC();
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
      case "G":
        add("M " + x(R) + " " + x(T) +
            " C " + x(X) + " " + x(T) + " " + x(L) + " " + x(T) + " " + x(L) + " " + x(T + s * 1.45) +
            " V " + x(B - s * 1.45) +
            " C " + x(L) + " " + x(B) + " " + x(X) + " " + x(B) + " " + x(R) + " " + x(B) +
            " V " + x(M + s * .22) + " H " + x(L + s + counter * .52));
        break;
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
        stroke(L, T, L, B);
        add("M " + x(R - s * .42) + " " + x(T) +
            " Q " + x(R) + " " + x(T) + " " + x(R) + " " + x(T + s * .5) +
            " V " + x(B));
        stroke(L, T, R, B);
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
        // One continuous ribbon: no disconnected jump at the middle bowl.
        add("M " + x(R) + " " + x(T) +
            " H " + x(L + s * .86) +
            " Q " + x(L) + " " + x(T) + " " + x(L) + " " + x(T + s * .9) +
            " V " + x(q1) +
            " C " + x(L) + " " + x(M - s * .35) + " " + x(R) + " " + x(M - s * .35) + " " + x(R) + " " + x(M + s * .48) +
            " V " + x(q3) +
            " Q " + x(R) + " " + x(B) + " " + x(R - s * .85) + " " + x(B) +
            " H " + x(L));
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
    const height = stem * 7.6; // illustrative only: the current app has no height input
    const y = stem * 1.15;
    const boxH = height + 2 * y;
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
      const data = buildSvg(result, { guides: toggler && toggler.checked });
      container.innerHTML = data.svg;
      const note = document.getElementById("previewStatus");
      if (note) note.textContent = "Red outline = requested width. Letter height is illustrative; Phoenix currently calculates width only.";
    } catch (err) {
      container.textContent = "Preview unavailable: " + err.message;
    }
  }

  if (typeof document !== "undefined") {
    document.addEventListener("DOMContentLoaded", () => {
      const toggler = document.getElementById("previewGuides");
      if (toggler) toggler.addEventListener("change", () => {
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
