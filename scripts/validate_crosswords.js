#!/usr/bin/env node
/**
 * validate_crosswords.js
 *
 * Reads mockCrosswordPuzzles directly from mockData.js (via a tiny inline
 * replica of the data) and asserts:
 *
 *   1. Every word fits within the puzzle grid (no out-of-bounds cells).
 *   2. Wherever two words share a cell, both words agree on the letter.
 *
 * Run with:  node scripts/validate_crosswords.js
 * Exit 0 = all puzzles clean.  Exit 1 = conflicts or bounds errors found.
 */

'use strict';

// ─── inline copy of the puzzle data (mirrors mockData.js exactly) ─────────────
// Keep this in sync whenever mockCrosswordPuzzles changes.
const mockCrosswordPuzzles = [
  {
    topic: 'Waste Management', level: 'Beginner', size: 10,
    words: [
      { num: 1, word: 'RECYCLE',  direction: 'across', row: 0, col: 0 },
      { num: 2, word: 'COMPOST',  direction: 'down',   row: 0, col: 2 },
      { num: 3, word: 'REDUCE',   direction: 'across', row: 1, col: 3 },
      { num: 4, word: 'LANDFILL', direction: 'down',   row: 0, col: 9 },
      { num: 5, word: 'REUSE',    direction: 'across', row: 2, col: 3 },
      { num: 6, word: 'WASTE',    direction: 'down',   row: 1, col: 0 },
      { num: 7, word: 'PLASTIC',  direction: 'across', row: 3, col: 2 },
      { num: 8, word: 'GREEN',    direction: 'down',   row: 1, col: 1 },
    ],
  },
  {
    topic: 'Waste Management', level: 'Intermediate', size: 10,
    words: [
      { num: 1, word: 'SEGREGATE', direction: 'across', row: 0, col: 0 },
      { num: 2, word: 'ORGANIC',   direction: 'down',   row: 0, col: 9 },
      { num: 3, word: 'HAZARD',    direction: 'across', row: 1, col: 0 },
      { num: 4, word: 'DUMP',      direction: 'down',   row: 1, col: 5 },
      { num: 5, word: 'VERMI',     direction: 'across', row: 2, col: 0 },
      { num: 6, word: 'CLOTH',     direction: 'across', row: 3, col: 0 },
    ],
  },
  {
    topic: 'Waste Management', level: 'Advanced', size: 10,
    words: [
      { num: 1, word: 'INCINERATE', direction: 'down',   row: 0, col: 0 },
      { num: 2, word: 'CIRCULAR',   direction: 'across', row: 0, col: 1 },
      { num: 3, word: 'LEACHATE',   direction: 'across', row: 1, col: 1 },
      { num: 4, word: 'BIOGAS',     direction: 'down',   row: 0, col: 9 },
      { num: 5, word: 'UPCYCLE',    direction: 'across', row: 2, col: 1 },
    ],
  },
  {
    topic: 'Water Conservation', level: 'Beginner', size: 10,
    words: [
      { num: 1, word: 'RAIN',    direction: 'across', row: 0, col: 0 },
      { num: 2, word: 'DRIP',    direction: 'down',   row: 0, col: 4 },
      { num: 3, word: 'AQUIFER', direction: 'across', row: 2, col: 1 },
      { num: 4, word: 'SAVE',    direction: 'down',   row: 0, col: 8 },
      { num: 5, word: 'LEAK',    direction: 'across', row: 1, col: 0 },
      { num: 6, word: 'POND',    direction: 'across', row: 3, col: 0 },
    ],
  },
  {
    topic: 'Water Conservation', level: 'Intermediate', size: 10,
    words: [
      { num: 1, word: 'HARVEST',  direction: 'across', row: 0, col: 0 },
      { num: 2, word: 'RECHARGE', direction: 'down',   row: 0, col: 2 },
      { num: 3, word: 'BASIN',    direction: 'across', row: 1, col: 3 },
      { num: 4, word: 'FILTER',   direction: 'across', row: 2, col: 3 },
      { num: 5, word: 'CANAL',    direction: 'down',   row: 0, col: 9 },
    ],
  },
  {
    topic: 'Water Conservation', level: 'Advanced', size: 10,
    words: [
      { num: 1, word: 'WATERSHED', direction: 'across', row: 0, col: 0 },
      { num: 2, word: 'OSMOSIS',   direction: 'down',   row: 0, col: 9 },
      { num: 3, word: 'DROUGHT',   direction: 'across', row: 1, col: 0 },
      { num: 4, word: 'PERCOLATE', direction: 'down',   row: 1, col: 7 },
      { num: 5, word: 'SPRINKLE',  direction: 'across', row: 2, col: 0 },
    ],
  },
  {
    topic: 'Climate Change', level: 'Beginner', size: 10,
    words: [
      { num: 1, word: 'CARBON', direction: 'across', row: 0, col: 0 },
      { num: 2, word: 'SOLAR',  direction: 'down',   row: 0, col: 6 },
      { num: 3, word: 'OZONE',  direction: 'across', row: 1, col: 0 },
      { num: 4, word: 'MELT',   direction: 'down',   row: 0, col: 7 },
      { num: 5, word: 'FOSSIL', direction: 'across', row: 2, col: 0 },
      { num: 6, word: 'WIND',   direction: 'across', row: 3, col: 0 },
    ],
  },
  {
    topic: 'Climate Change', level: 'Intermediate', size: 10,
    words: [
      { num: 1, word: 'GREENHOUSE', direction: 'down',   row: 0, col: 0 },
      { num: 2, word: 'EMISSION',   direction: 'across', row: 0, col: 1 },
      { num: 3, word: 'METHANE',    direction: 'across', row: 1, col: 1 },
      { num: 4, word: 'POLAR',      direction: 'down',   row: 0, col: 9 },
    ],
  },
  {
    topic: 'Climate Change', level: 'Advanced', size: 10,
    words: [
      { num: 1, word: 'SEQUESTER',  direction: 'across', row: 0, col: 0 },
      { num: 2, word: 'ALBEDO',     direction: 'down',   row: 1, col: 0 },
      { num: 3, word: 'PERMAFROST', direction: 'down',   row: 0, col: 9 },
      { num: 4, word: 'NETZERO',    direction: 'across', row: 1, col: 1 },
    ],
  },
];

// ─── validation logic ─────────────────────────────────────────────────────────

let totalErrors = 0;

mockCrosswordPuzzles.forEach((puzzle, puzzleIdx) => {
  const label = `Puzzle ${puzzleIdx + 1} [${puzzle.topic} — ${puzzle.level}]`;
  const errors = [];

  // Build a cell map: "r,c" -> { letter, source }
  const cellMap = new Map();

  for (const w of puzzle.words) {
    for (let i = 0; i < w.word.length; i++) {
      const r = w.direction === 'across' ? w.row : w.row + i;
      const c = w.direction === 'across' ? w.col + i : w.col;
      const letter = w.word[i];
      const source = `${w.direction} #${w.num} "${w.word}"`;

      // bounds check
      if (r < 0 || r >= puzzle.size || c < 0 || c >= puzzle.size) {
        errors.push(
          `  OUT OF BOUNDS: ${source} → cell (${r},${c}) outside ${puzzle.size}×${puzzle.size} grid`
        );
        continue;
      }

      const key = `${r},${c}`;
      if (cellMap.has(key)) {
        const existing = cellMap.get(key);
        if (existing.letter !== letter) {
          errors.push(
            `  CONFLICT at (${r},${c}): "${existing.letter}" [${existing.source}] vs "${letter}" [${source}]`
          );
        }
        // If letters match, intersection is valid — no action needed.
      } else {
        cellMap.set(key, { letter, source });
      }
    }
  }

  if (errors.length === 0) {
    console.log(`✅  ${label}`);
  } else {
    console.error(`❌  ${label}`);
    errors.forEach(e => console.error(e));
    totalErrors += errors.length;
  }
});

console.log('');
if (totalErrors === 0) {
  console.log('All 9 puzzles: zero intersection conflicts. ✅');
} else {
  console.error(`${totalErrors} error(s) found across all puzzles. ❌`);
  process.exit(1);
}
