# Phoenix Layout Calculator

A lettering layout tool for sign painters.

Built to help calculate Phoenix / Condensed Gothic / gas-pipe-style lettering layouts without reaching for a calculator, scratch paper, or a headache.

## Live App

https://phx.jjrugesignco.com

## Features

- Unit-based Phoenix / Condensed Gothic layout engine
- Stem width calculation
- Counter width calculation
- Letter spacing calculation
- Word spacing calculation
- Side margin calculation
- Traditional unit-based layout style
- Practical equal-unit layout style
- Mobile-friendly interface
- Installable PWA
- Offline support after first visit
- PHX icon pack
- Goblin-powered encouragement
- Variable-grid SVG lettering preview (uppercase A-Z)
- Red target-width boundary and construction-guide toggle
- Editable preview-only letter height (automatic default: half of target width)

## Layout Styles

### Traditional

Uses a unit-based condensed lettering approach inspired by gas-pipe / condensed gothic layout methods.

The app first finds a useful layout unit, then derives the layout from that unit:

- Stems are slightly heavier than the base unit
- Counters stay close to the unit
- Letter spacing stays close to the counter
- Leftover width becomes side margins
- Word spacing is treated as one normal Phoenix letter: **2 stems + 1 counter**

This mode is meant for classic Phoenix / Condensed Gothic lettering where counters and spaces should feel visually related.

### Practical

Uses an equal-unit approach.

- Stem, counter, and letter spacing use the same unit
- Useful for small copy and showcard work
- Often produces more practical layouts at smaller sizes
- Great for short words that would otherwise fail traditional proportion checks

## Current Version

Version 2.1.0

## Changelog

### v2.1.0 (preview branch)

- Added an SVG layout workbench using the calculator's actual stem, counter, spacing, and margin measurements
- Archived the sign painter's A–Z construction vocabulary in phoenix-recipes.js; glyph widths now come directly from these recipes
- Converted A, B, C, G, N, and S to individually named modular structural components (the remaining glyphs retain provisional contours)
- Implemented W, X, and Y with **solid filled, individually named structural pieces** based on reference sketches
- Phoenix Y uses separated left upper/lower stems, upper/lower counter connectors, a continuous right stem, and curved inward terminals (rather than the generic fork-shape)
- Added WXY and Y component diagrams for the next visual review; remaining letterforms still require reference-based calibration
- The red boundary's top and bottom are exactly the requested letter-height edges; no internal vertical padding
- Built uppercase A-Z as individually constructed strokes and curves, without loading or tracing a font
- Preserved a fixed calculated stroke thickness across rows, columns, and curves
- Added optional counter/stroke construction guides and the red target-width box
- Updated PWA cache and included width-consistency regression tests
- Preview letter height defaults to half the target width (e.g. 16-inch line -> 8-inch tall letters), with a separate optional input for custom height; does not change any calculator measurements
- Updated A and B to use horizontal Phoenix connectors and N to use a rounded uppercase-height lowercase-n construction, rather than a conventional diagonal N
- Very short display heights can be geometrically impossible with the calculated stroke; the preview explains the issue without altering the layout math
- Prototype glyph contours still require visual review before merging into production


### v2.0.0

- Rebuilt the layout engine around a unit-based condensed lettering model
- Traditional mode now finds a common unit first, then adjusts stems, counters, and spacing
- Letter spacing is treated as a primary visual spacing element, not just leftover width
- Counters and letter spacing are kept visually related
- Updated explanation text in results
- Bumped PWA cache for release

### v1.0.6

- Added visible result heading showing the calculated copy
- Improved Clarity session review by displaying the layout word in the results area
- Added spacing-priority logic in Traditional mode

### v1.0.5

- Traditional mode began prioritizing letter spacing close to counter width
- Better candidate scoring instead of always choosing fattest stem first
- README updated
- Venmo fixed to @RevJhonSoda
- Cache bumped to help phones update

### v1.0.4

- Added Traditional and Practical layout styles
- Replaced dropdown selector with quick-toggle buttons
- Added PHX app icon pack
- Added Apple Touch Icon support
- Added favicon support
- Improved mobile PWA experience
- Improved installation experience on Android and iPhone

### v1.0.3

- Added side margin calculations
- Improved small-copy layout handling
- Improved spacing logic
- Better support for short words and tight layouts

### v1.0.2

- Added side margin output
- Added 1/16" spacing support
- Improved layout fitting logic

### v1.0.1

- Improved mobile layout
- Refined color palette
- Added Buy Me A Coffee button
- Improved calculator layout
- Refined goblin message styling

## Planned Features

- Letter-height input and height-aware preview
- More precise optical corrections and corner radii
- Margin calculator
- Additional lettering styles
- Saved preferences
- Layout explorer
- Showcard tools
- Multiple alphabet systems

## Why?

Because sometimes you just want to paint the sign instead of doing fraction math.

Phoenix Layout Calculator was built by a sign painter for sign painters. The goal is simple:

- Spend less time dividing fractions.
- Spend more time painting signs.
- Keep traditional lettering knowledge accessible.
- Make layout decisions faster in the shop, at a meet, or on a job site.

## Install

### Desktop

Visit:

https://phx.jjrugesignco.com

### Android

1. Open the site in Chrome.
2. Tap **Install App** or **Add to Home Screen**.
3. Launch Phoenix Layout Calculator like any other app.

### iPhone / iPad

1. Open the site in Safari.
2. Tap **Share**.
3. Select **Add to Home Screen**.
4. Launch Phoenix Layout Calculator like any other app.

Once installed, the app can continue working offline after the first visit.

## Support the Project

If this tool saves you time, prevents a layout headache, or helps you paint more signs, consider buying the goblin a coffee.

Venmo: **@RevJhonSoda**

## License

MIT License
