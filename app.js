// ============================================================
// PHOENIX LAYOUT CALCULATOR
// Browser Version 1.0.3
// ============================================================

const APP_NAME = "Phoenix Layout Calculator";
const APP_VERSION = "1.0.3";

const HECKLES = [
  "Wow dude, really? Using the app again? Do the math yourself.",
  "I know, I know... math is too hard. Move over, I'll do it.",
  "Back already? What happened to all that confidence?",
  "You survived quills, mahl sticks, and gold leaf... but division was too much?",
  "The yardstick is literally right there.",
  "Good thing lettering is an art. Nobody hired us for the math.",
  "Another layout? At this point I'm basically your apprentice.",
  "It's only a fucking sign... but apparently it's also a word problem.",
  "Somewhere an old sign painter just muttered 'kids these days.'",
  "The good news: I can do the math. The bad news: you're still painting it.",
  "Let's see... carry the one... sacrifice a counter... yep, that'll fit.",
  "One day you'll memorize these proportions. Today is not that day.",
  "I got you. Don't hurt yourself dividing by thirteen.",
  "This is basically a digital yardstick with attitude.",
  "You bring the paint. I'll bring the arithmetic.",
  "Good artists borrow. Great artists outsource their math.",
  "This is what happens when sign painters discover Python.",
  "Just because you CAN fit it doesn't mean you SHOULD fit it.",
  "Measure twice. Divide once. Panic never.",
  "Let's make some bars fat enough to make a Gothic letter jealous.",
  "You came here because decimals are a scam.",
  "Your stem widths have been approved by the council.",
  "I have calculated the bars. The bars are pleased.",
  "The letters yearn for proper spacing.",
  "Another victim of the dreaded 'fit this in 18 inches' disease.",
  "You're not bad at math. You're just efficiently delegating.",
  "Counter widths are temporary. Fat bars are forever.",
  "I did the arithmetic. You do the swearing.",
  "Don't tell the old timers about this.",
  "Be honest. You already knew the answer and checked anyway.",
  "The computer says it'll fit. The panel remains skeptical.",
  "Remember: a calculator can't save a bad layout.",
  "Look at you. Using modern technology to recreate a 1930s alphabet."
];

const LETTER_RULES = {
  A: [2, 1], B: [2, 1], C: [2, 1], D: [2, 1],
  E: [1, 1], F: [1, 1], G: [2, 1], H: [2, 1],
  I: [1, 0], J: [2, 1], K: [2, 1], L: [1, 1],
  M: [3, 2], N: [2, 1], O: [2, 1], P: [2, 1],
  Q: [2, 1], R: [2, 1], S: [2, 1], T: [1, 1],
  U: [2, 1], V: [2, 1], W: [3, 2], X: [2, 1],
  Y: [2, 1], Z: [2, 1]
};

const DENOMINATOR = 8;
const SPACING_DENOMINATOR = 16;
const MIN_COUNTER_RATIO = 0.55;
const MAX_COUNTER_RATIO = 0.85;
const IDEAL_COUNTER_RATIOS = [0.70, 0.65, 0.60, 0.75, 0.55, 0.80, 0.85];

function roundDownToFraction(value, denominator = DENOMINATOR) {
  return Math.floor(value * denominator) / denominator;
}

function roundToFraction(value, denominator = DENOMINATOR) {
  return Math.round(value * denominator) / denominator;
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a || 1;
}

function formatInches(value) {
  const sign = value < 0 ? "-" : "";
  value = Math.abs(value);
  const denominator = 16;
  let numerator = Math.round(value * denominator);
  const whole = Math.floor(numerator / denominator);
  numerator = numerator % denominator;

  if (numerator === 0) return `${sign}${whole}"`;

  const divisor = gcd(numerator, denominator);
  const simpleNumerator = numerator / divisor;
  const simpleDenominator = denominator / divisor;

  if (whole === 0) return `${sign}${simpleNumerator}/${simpleDenominator}"`;

  return `${sign}${whole} ${simpleNumerator}/${simpleDenominator}"`;
}

function validateCopy(text) {
  const words = text.trim().toUpperCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) throw new Error("Enter at least one word, layout wizard.");
  if (words.length > 2) throw new Error("Whoa there, novelist. Version 1 only handles one or two words on a single line.");
  return words;
}

function countCopy(text) {
  const words = validateCopy(text);
  let stems = 0;
  let counters = 0;
  let letterSpaces = 0;
  const wordSpaces = Math.max(words.length - 1, 0);
  const letters = [];

  words.forEach((word, wordIndex) => {
    letterSpaces += Math.max(word.length - 1, 0);

    for (const char of word) {
      if (!LETTER_RULES[char]) throw new Error(`Unsupported character: ${char}`);

      const [letterStems, letterCounters] = LETTER_RULES[char];
      stems += letterStems;
      counters += letterCounters;

      letters.push({ char, wordIndex, stems: letterStems, counters: letterCounters });
    }
  });

  return { words, stems, counters, letterSpaces, wordSpaces, letters };
}

function calculateLetterMass(stems, counters, stemWidth, counterWidth) {
  return (stems * stemWidth) + (counters * counterWidth);
}

function calculateWordSpace(stemWidth, counterWidth) {
  return (2 * stemWidth) + counterWidth;
}

function calculateBestLetterSpacing(remaining, letterSpaces, counter) {
  if (letterSpaces <= 0) return 0;

  const exactSpace = remaining / letterSpaces;
  const maxAllowed = Math.min(exactSpace, counter);

  let spacing = roundDownToFraction(maxAllowed, DENOMINATOR);
  const sixteenthSpacing = roundDownToFraction(maxAllowed, SPACING_DENOMINATOR);

  if (sixteenthSpacing > spacing) spacing = sixteenthSpacing;

  return spacing;
}

function getCounterOptions(stem, counterStyle) {
  if (counterStyle === "equal") return [stem];

  const options = IDEAL_COUNTER_RATIOS.map((ratio) =>
    roundToFraction(stem * ratio, DENOMINATOR)
  );

  return [...new Set(options)];
}

function calculateLayout(copyText, targetWidth, counterStyle = "smaller") {
  const counts = countCopy(copyText);
  const stems = counts.stems;
  const counters = counts.counters;
  const letterSpaces = counts.letterSpaces;
  const wordSpaces = counts.wordSpaces;

  const maxEqualUnit = targetWidth / (stems + counters);
  const maxStem = roundDownToFraction(maxEqualUnit, DENOMINATOR);
  const step = 1 / DENOMINATOR;

  let stem = maxStem;

  while (stem >= step) {
    const counterOptions = getCounterOptions(stem, counterStyle);

    for (const counter of counterOptions) {
      if (counter <= 0) continue;

      const counterRatio = counter / stem;

      if (counterStyle === "smaller") {
        if (counterRatio < MIN_COUNTER_RATIO || counterRatio > MAX_COUNTER_RATIO) continue;
      }

      const letterMass = calculateLetterMass(stems, counters, stem, counter);
      const singleWordSpace = calculateWordSpace(stem, counter);
      const totalWordSpace = wordSpaces * singleWordSpace;
      const remaining = targetWidth - letterMass - totalWordSpace;

      if (remaining < 0) continue;

      const letterSpacing = calculateBestLetterSpacing(remaining, letterSpaces, counter);

      if (letterSpaces > 0) {
        if (letterSpacing <= 0) continue;
        if (letterSpacing > counter) continue;
      }

      const finalWidth = letterMass + totalWordSpace + (letterSpacing * letterSpaces);
      const leftover = targetWidth - finalWidth;

      if (leftover < 0) continue;

      return {
        copy: counts.words.join(" "),
        targetWidth,
        words: counts.words,
        stems,
        counters,
        letterSpaces,
        wordSpaces,
        letters: counts.letters,
        maxEqualUnit,
        counterStyle,
        recommended: {
          stem,
          counter,
          letterSpacing,
          wordSpacing: wordSpaces ? singleWordSpace : 0,
          letterMass,
          totalWordSpace,
          finalWidth,
          leftover,
          sideMargin: leftover / 2,
          counterRatio,
          letterSpacingToCounterRatio: counter ? letterSpacing / counter : 0
        }
      };
    }

    stem -= step;
  }

  return {
    copy: counts.words.join(" "),
    targetWidth,
    words: counts.words,
    stems,
    counters,
    letterSpaces,
    wordSpaces,
    letters: counts.letters,
    maxEqualUnit,
    counterStyle,
    recommended: null
  };
}

function randomHeckle() {
  return HECKLES[Math.floor(Math.random() * HECKLES.length)];
}

function showError(message) {
  document.getElementById("error").textContent = message;
  document.getElementById("results").classList.remove("active");
}

function clearError() {
  document.getElementById("error").textContent = "";
}

function renderBreakdown(letters) {
  return letters.map((item) => {
    return `<div>${item.char}: ${item.stems} stem(s), ${item.counters} counter(s)</div>`;
  }).join("");
}

function setTextIfExists(id, text) {
  const element = document.getElementById(id);
  if (element) element.textContent = text;
}

function renderLayout(result) {
  const layout = result.recommended;

  if (!layout) {
    showError("No clean Phoenix layout found. Try increasing the width or simplifying the copy. The panel has rejected your offering.");
    return;
  }

  clearError();

  setTextIfExists("stemOutput", formatInches(layout.stem));
  setTextIfExists("counterOutput", formatInches(layout.counter));
  setTextIfExists("letterSpaceOutput", formatInches(layout.letterSpacing));
  setTextIfExists("letterMassOutput", formatInches(layout.letterMass));
  setTextIfExists("finalWidthOutput", formatInches(layout.finalWidth));
  setTextIfExists("leftoverOutput", formatInches(layout.leftover));
  setTextIfExists("sideMarginOutput", `${formatInches(layout.sideMargin)} each`);

  const wordSpaceRow = document.getElementById("wordSpaceRow");
  if (wordSpaceRow) {
    if (result.wordSpaces > 0) {
      wordSpaceRow.style.display = "flex";
      setTextIfExists("wordSpaceOutput", formatInches(layout.wordSpacing));
    } else {
      wordSpaceRow.style.display = "none";
    }
  }

  const counterDescription =
    result.counterStyle === "equal"
      ? "Counters are set equal to the stems for a practical small-copy layout."
      : `Counter is about <strong>${Math.round(layout.counterRatio * 100)}%</strong> of the stem.`;

  let why = `
    <p>Uses the largest clean stem width that passes the Phoenix checks.</p>
    <p>${counterDescription}</p>
    <p>Letter spacing is about <strong>${Math.round(layout.letterSpacingToCounterRatio * 100)}%</strong> of the counter.</p>
  `;

  if (result.wordSpaces > 0) {
    why += `<p>Word spacing is one normal Phoenix letter: <strong>2 stems + 1 counter.</strong></p>`;
  }

  why += `<p>Any leftover width is split into side margins.</p>`;
  why += `<p>Stems and counters prioritize 1/8&quot; marks. Letter spacing may use 1/16&quot; when it creates a cleaner fit.</p>`;

  const whyOutput = document.getElementById("whyOutput");
  if (whyOutput) whyOutput.innerHTML = why;

  const breakdownOutput = document.getElementById("breakdownOutput");
  if (breakdownOutput) breakdownOutput.innerHTML = renderBreakdown(result.letters);

  document.getElementById("results").classList.add("active");
}

function handleCalculate() {
  const copyText = document.getElementById("copyInput").value;
  const widthText = document.getElementById("widthInput").value;
  const targetWidth = Number(widthText);
  const counterStyleElement = document.getElementById("counterStyle");
  const counterStyle = counterStyleElement ? counterStyleElement.value : "smaller";

  document.getElementById("heckle").textContent = randomHeckle();

  try {
    if (!Number.isFinite(targetWidth) || targetWidth <= 0) {
      throw new Error("Target width must be a number bigger than zero, boss.");
    }

    const result = calculateLayout(copyText, targetWidth, counterStyle);
    renderLayout(result);
  } catch (error) {
    showError(error.message);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("calculateButton").addEventListener("click", handleCalculate);

  document.getElementById("copyInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") handleCalculate();
  });

  document.getElementById("widthInput").addEventListener("keydown", (event) => {
    if (event.key === "Enter") handleCalculate();
  });
});
