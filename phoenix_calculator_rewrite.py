from fractions import Fraction
import math
import random


# ============================================================
# PHOENIX LAYOUT CALCULATOR
# Version 1
#
# Handles:
# - One or two words on a single line
# - Yardstick-friendly 1/8 inch measurements
# - Phoenix-style stems, counters, letter spacing, and word spacing
# - One recommended layout, not a giant math buffet
# ============================================================


HECKLES = [
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
    "The layout wheel walked so this app could run.",
    "Don't tell the old timers about this.",
    "Be honest. You already knew the answer and checked anyway.",
    "The computer says it'll fit. The panel remains skeptical.",
    "Remember: a calculator can't save a bad layout.",
    "Look at you. Using modern technology to recreate a 1930s alphabet.",
]


# Each letter is defined as:
# "LETTER": (number_of_stems, number_of_counters)
#
# These can be adjusted later as the Phoenix rules get refined.
LETTER_RULES = {
    "A": (2, 1),
    "B": (2, 1),
    "C": (2, 1),
    "D": (2, 1),
    "E": (1, 1),
    "F": (1, 1),
    "G": (2, 1),
    "H": (2, 1),
    "I": (1, 0),
    "J": (2, 1),
    "K": (2, 1),
    "L": (1, 1),
    "M": (3, 2),
    "N": (2, 1),
    "O": (2, 1),
    "P": (2, 1),
    "Q": (2, 1),
    "R": (2, 1),
    "S": (2, 1),
    "T": (1, 1),
    "U": (2, 1),
    "V": (2, 1),
    "W": (3, 2),
    "X": (2, 1),
    "Y": (2, 1),
    "Z": (2, 1),
}


DENOMINATOR = 8  # Default to yardstick-friendly eighths.
MIN_COUNTER_RATIO = 0.60
MAX_COUNTER_RATIO = 0.75
IDEAL_COUNTER_RATIOS = [0.70, 0.65, 0.60, 0.75]


def round_down_to_fraction(value, denominator=DENOMINATOR):
    """Round down to nearest fraction step."""
    return math.floor(value * denominator) / denominator


def round_to_fraction(value, denominator=DENOMINATOR):
    """Round to nearest fraction step."""
    return round(value * denominator) / denominator


def format_inches(value):
    """Format decimal inches as a friendly fraction."""
    sign = "-" if value < 0 else ""
    value = abs(value)

    frac = Fraction(value).limit_denominator(16)
    whole = frac.numerator // frac.denominator
    remainder = frac.numerator % frac.denominator

    if remainder == 0:
        return f'{sign}{whole}"'
    if whole == 0:
        return f'{sign}{remainder}/{frac.denominator}"'
    return f'{sign}{whole} {remainder}/{frac.denominator}"'


def validate_copy(text):
    """
    Validate copy and return cleaned uppercase words.

    Leading spaces, trailing spaces, and extra spaces between words
    are ignored by .split().
    """
    words = text.upper().split()

    if len(words) == 0:
        raise ValueError("Enter at least one word, layout wizard.")

    if len(words) > 2:
        raise ValueError(
            "Whoa there, novelist. Version 1 only handles one or two words on a single line."
        )

    return words


def count_copy(text):
    """
    Count stems, counters, letter spaces, and word spaces.

    Letter spaces are only spaces between letters inside a word.
    Word spaces are only spaces between two actual words.
    """
    words = validate_copy(text)

    stems = 0
    counters = 0
    letter_spaces = 0
    word_spaces = max(len(words) - 1, 0)
    letters = []

    for word_index, word in enumerate(words):
        letter_spaces += max(len(word) - 1, 0)

        for char in word:
            if char not in LETTER_RULES:
                raise ValueError(f"Unsupported character: {char}")

            letter_stems, letter_counters = LETTER_RULES[char]
            stems += letter_stems
            counters += letter_counters

            letters.append({
                "char": char,
                "word_index": word_index,
                "stems": letter_stems,
                "counters": letter_counters,
            })

    return {
        "words": words,
        "stems": stems,
        "counters": counters,
        "letter_spaces": letter_spaces,
        "word_spaces": word_spaces,
        "letters": letters,
    }


def calculate_letter_mass(stems, counters, stem_width, counter_width):
    """Calculate width taken by letter stems and counters only."""
    return (stems * stem_width) + (counters * counter_width)


def calculate_word_space(stem_width, counter_width):
    """
    Phoenix word spacing rule:
    word space is roughly the width of a normal letter:
    2 stems + 1 counter.
    """
    return (2 * stem_width) + counter_width


def calculate_layout(copy_text, target_width):
    """
    Main Phoenix layout logic.

    Philosophy:
    1. Use the largest clean stem that works.
    2. Aim counters around 60-75% of the stem, favoring about 70%.
    3. Calculate word spacing as one normal Phoenix letter.
    4. Let letter spacing be the leftover divided between letters.
    5. Reject layouts where letter spacing is larger than the counter.
    6. Prefer clean yardstick measurements.
    """
    counts = count_copy(copy_text)

    stems = counts["stems"]
    counters = counts["counters"]
    letter_spaces = counts["letter_spaces"]
    word_spaces = counts["word_spaces"]

    # This is only a rough maximum reference, before real spacing rules.
    max_equal_unit = target_width / (stems + counters)
    max_stem = round_down_to_fraction(max_equal_unit, DENOMINATOR)

    step = 1 / DENOMINATOR
    stem = max_stem

    while stem >= step:
        counter_options = [
            round_to_fraction(stem * ratio, DENOMINATOR)
            for ratio in IDEAL_COUNTER_RATIOS
        ]

        # Remove duplicates while preserving order.
        counter_options = list(dict.fromkeys(counter_options))

        for counter in counter_options:
            if counter <= 0:
                continue

            counter_ratio = counter / stem if stem else 0

            if counter_ratio < MIN_COUNTER_RATIO:
                continue

            if counter_ratio > MAX_COUNTER_RATIO:
                continue

            letter_mass = calculate_letter_mass(stems, counters, stem, counter)
            single_word_space = calculate_word_space(stem, counter)
            total_word_space = word_spaces * single_word_space

            used_before_letter_spacing = letter_mass + total_word_space
            remaining = target_width - used_before_letter_spacing

            if remaining < 0:
                continue

            if letter_spaces > 0:
                letter_spacing = round_to_fraction(remaining / letter_spaces, DENOMINATOR)
            else:
                letter_spacing = 0

            final_width = (
                letter_mass
                + total_word_space
                + (letter_spacing * letter_spaces)
            )

            leftover = target_width - final_width

            if leftover < 0:
                continue

            if letter_spaces > 0:
                if letter_spacing <= 0:
                    continue

                # Phoenix sanity check:
                # letter spacing should not be wider than the counter.
                if letter_spacing > counter:
                    continue

            return {
                "copy": " ".join(counts["words"]),
                "target_width": target_width,
                "words": counts["words"],
                "stems": stems,
                "counters": counters,
                "letter_spaces": letter_spaces,
                "word_spaces": word_spaces,
                "letters": counts["letters"],
                "max_equal_unit": max_equal_unit,
                "recommended": {
                    "stem": stem,
                    "counter": counter,
                    "letter_spacing": letter_spacing,
                    "word_spacing": single_word_space if word_spaces else 0,
                    "letter_mass": letter_mass,
                    "total_word_space": total_word_space,
                    "final_width": final_width,
                    "leftover": leftover,
                    "counter_ratio": counter_ratio,
                    "letter_spacing_to_counter_ratio": (
                        letter_spacing / counter if counter else 0
                    ),
                },
            }

        # If nothing works at this stem size, step the stem down.
        stem -= step

    return {
        "copy": " ".join(counts["words"]),
        "target_width": target_width,
        "words": counts["words"],
        "stems": stems,
        "counters": counters,
        "letter_spaces": letter_spaces,
        "word_spaces": word_spaces,
        "letters": counts["letters"],
        "max_equal_unit": max_equal_unit,
        "recommended": None,
    }


def print_letter_breakdown(letters):
    """Print each letter and its Phoenix construction counts."""
    print("Letter Breakdown:")
    for item in letters:
        print(
            f"  {item['char']}: "
            f"{item['stems']} stem(s), "
            f"{item['counters']} counter(s)"
        )


def print_layout(result):
    """Print the final layout report."""
    print("\nPHOENIX LAYOUT CALCULATOR")
    print("=" * 32)
    print(f"Copy: {result['copy']}")
    print(f"Target Width: {format_inches(result['target_width'])}")
    print()

    print(f"Total Stems: {result['stems']}")
    print(f"Total Counters: {result['counters']}")
    print(f"Letter Spaces: {result['letter_spaces']}")
    print(f"Word Spaces: {result['word_spaces']}")
    print(f"Max Equal Unit: {result['max_equal_unit']:.3f}\"")
    print()

    print_letter_breakdown(result["letters"])

    layout = result["recommended"]

    if layout is None:
        print("\nNo clean Phoenix layout found.")
        print("Try increasing the target width or refining the copy.")
        print("The panel has rejected your offering.")
        return

    print("\nRECOMMENDED LAYOUT")
    print("=" * 32)
    print(f"Stem:          {format_inches(layout['stem'])}")
    print(f"Counter:       {format_inches(layout['counter'])}")
    print(f"Letter Space:  {format_inches(layout['letter_spacing'])}")

    if result["word_spaces"] > 0:
        print(f"Word Space:    {format_inches(layout['word_spacing'])}")

    print()
    print(f"Letter Mass:   {format_inches(layout['letter_mass'])}")

    if result["word_spaces"] > 0:
        print(f"Word Gap Total:{format_inches(layout['total_word_space'])}")

    print(f"Final Width:   {format_inches(layout['final_width'])}")
    print(f"Leftover:      {format_inches(layout['leftover'])}")

    print()
    print("Why this layout:")
    print("- Uses the largest clean stem width that passes the Phoenix checks.")
    print(f"- Counter is about {layout['counter_ratio']:.0%} of the stem.")
    print(
        f"- Letter spacing is about "
        f"{layout['letter_spacing_to_counter_ratio']:.0%} of the counter."
    )

    if result["word_spaces"] > 0:
        print("- Word spacing is one normal Phoenix letter: 2 stems + 1 counter.")

    print("- All measurements are yardstick-friendly 1/8 inch marks.")


def get_target_width():
    """Ask for target width and validate it."""
    raw_width = input("Enter target width in inches: ").strip()

    try:
        width = float(raw_width)
    except ValueError:
        raise ValueError("Target width must be a number, boss.")

    if width <= 0:
        raise ValueError("Target width has to be bigger than zero. Nice try.")

    return width


def main():
    try:
        copy_text = input("Enter copy: ").strip()
        target_width = get_target_width()

        print()
        print(random.choice(HECKLES))

        result = calculate_layout(copy_text, target_width)
        print_layout(result)

    except ValueError as error:
        print()
        print(f"ERROR: {error}")


if __name__ == "__main__":
    main()
