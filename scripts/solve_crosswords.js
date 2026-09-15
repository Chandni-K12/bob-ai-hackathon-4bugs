#!/usr/bin/env node
/**
 * Crossword placement solver for GenGreen mock puzzles.
 *
 * Strategy: for each puzzle, fix one anchor word then try all valid
 * (row, col) placements for remaining words, requiring that wherever
 * two words share a grid cell they carry the same letter.
 *
 * Outputs JSON-ready word arrays to paste back into mockData.js.
 */

'use strict';

// ─── helpers ────────────────────────────────────────────────────────────────

/** Return cells occupied by a placed word: [{r,c,letter}] */
function cells(word, dir, row, col) {
  const out = [];
  for (let i = 0; i < word.length; i++) {
    out.push({
      r: dir === 'across' ? row : row + i,
      c: dir === 'across' ? col + i : col,
      letter: word[i],
    });
  }
  return out;
}

/** Check whether adding `candidate` to `placed` causes any letter conflict. */
function conflicts(candidate, placed, size) {
  const cCells = cells(candidate.word, candidate.direction, candidate.row, candidate.col);
  // bounds check
  for (const { r, c } of cCells) {
    if (r < 0 || r >= size || c < 0 || c >= size) return true;
  }
  // build map of current occupied cells
  const map = new Map();
  for (const p of placed) {
    for (const { r, c, letter } of cells(p.word, p.direction, p.row, p.col)) {
      map.set(`${r},${c}`, letter);
    }
  }
  // check new word against map
  for (const { r, c, letter } of cCells) {
    const key = `${r},${c}`;
    if (map.has(key) && map.get(key) !== letter) return true;
  }
  return false;
}

/**
 * Validate a complete placement: for every cell touched by >1 word,
 * all words agree on the letter.
 */
function validate(words, size) {
  const map = new Map();
  for (const w of words) {
    for (const { r, c, letter } of cells(w.word, w.direction, w.row, w.col)) {
      if (r < 0 || r >= size || c < 0 || c >= size) return false;
      const key = `${r},${c}`;
      if (map.has(key) && map.get(key) !== letter) return false;
      map.set(key, letter);
    }
  }
  return true;
}

/**
 * Back-tracking placer.
 * `template` = array of {num,word,clue,direction} (no row/col yet).
 * Returns array of {num,word,clue,direction,row,col} or null.
 */
function solve(template, size) {
  const placed = [];

  function bt(idx) {
    if (idx === template.length) return true;
    const t = template[idx];
    const rowMax = t.direction === 'across' ? size : size - t.word.length;
    const colMax = t.direction === 'across' ? size - t.word.length : size;
    for (let r = 0; r <= rowMax; r++) {
      for (let c = 0; c <= colMax; c++) {
        const candidate = { ...t, row: r, col: c };
        if (!conflicts(candidate, placed, size)) {
          placed.push(candidate);
          if (bt(idx + 1)) return true;
          placed.pop();
        }
      }
    }
    return false;
  }

  if (bt(0)) return placed;
  return null;
}

// ─── puzzle definitions (words only — no row/col) ────────────────────────────

const puzzles = [
  // 0 — Waste Management Beginner
  {
    topic: 'Waste Management', level: 'Beginner', size: 10,
    words: [
      { num: 1, word: 'RECYCLE',  clue: '1 Across — Process of converting waste into reusable material', direction: 'across' },
      { num: 2, word: 'COMPOST',  clue: '2 Down — Decomposed organic matter used as fertiliser',         direction: 'down'   },
      { num: 3, word: 'REDUCE',   clue: '3 Across — First of the 3Rs: use less',                          direction: 'across' },
      { num: 4, word: 'LANDFILL', clue: '4 Down — Site for waste disposal by burial',                     direction: 'down'   },
      { num: 5, word: 'REUSE',    clue: '5 Across — Second of the 3Rs: use again',                        direction: 'across' },
      { num: 6, word: 'WASTE',    clue: '6 Down — Unwanted material that is discarded',                   direction: 'down'   },
      { num: 7, word: 'PLASTIC',  clue: '7 Across — Non-biodegradable material clogging our oceans',      direction: 'across' },
      { num: 8, word: 'GREEN',    clue: '8 Down — Colour associated with eco-friendliness',               direction: 'down'   },
    ],
  },
  // 1 — Waste Management Intermediate
  {
    topic: 'Waste Management', level: 'Intermediate', size: 10,
    words: [
      { num: 1, word: 'SEGREGATE', clue: '1 Across — Separate waste into categories at source',      direction: 'across' },
      { num: 2, word: 'ORGANIC',   clue: '2 Down — Wet waste from kitchen scraps',                   direction: 'down'   },
      { num: 3, word: 'HAZARD',    clue: '3 Across — Type of waste that is dangerous to handle',     direction: 'across' },
      { num: 4, word: 'DUMP',      clue: '4 Down — Informal site where waste is left',               direction: 'down'   },
      { num: 5, word: 'VERMI',     clue: '5 Across — Prefix for composting using earthworms',        direction: 'across' },
      { num: 6, word: 'CLOTH',     clue: '6 Across — Reusable bag material replacing plastic',       direction: 'across' },
    ],
  },
  // 2 — Waste Management Advanced
  {
    topic: 'Waste Management', level: 'Advanced', size: 10,
    words: [
      { num: 1, word: 'INCINERATE', clue: '1 Down — Burn waste at high temperatures',                       direction: 'down'   },
      { num: 2, word: 'CIRCULAR',   clue: '2 Across — Type of economy that eliminates waste',               direction: 'across' },
      { num: 3, word: 'LEACHATE',   clue: '3 Across — Toxic liquid draining from a landfill',              direction: 'across' },
      { num: 4, word: 'BIOGAS',     clue: '4 Down — Fuel produced from organic waste decomposition',        direction: 'down'   },
      { num: 5, word: 'UPCYCLE',    clue: '5 Across — Transform waste into something of higher value',      direction: 'across' },
    ],
  },
  // 3 — Water Conservation Beginner
  {
    topic: 'Water Conservation', level: 'Beginner', size: 10,
    words: [
      { num: 1, word: 'RAIN',    clue: '1 Across — Precipitation collected for harvesting',        direction: 'across' },
      { num: 2, word: 'DRIP',    clue: '2 Down — Water-efficient irrigation method',               direction: 'down'   },
      { num: 3, word: 'AQUIFER', clue: '3 Across — Underground layer holding groundwater',         direction: 'across' },
      { num: 4, word: 'SAVE',    clue: '4 Down — What we should do with water',                   direction: 'down'   },
      { num: 5, word: 'LEAK',    clue: '5 Across — A dripping tap is an example of this',         direction: 'across' },
      { num: 6, word: 'POND',    clue: '6 Across — Small body of still water',                    direction: 'across' },
    ],
  },
  // 4 — Water Conservation Intermediate
  {
    topic: 'Water Conservation', level: 'Intermediate', size: 10,
    words: [
      { num: 1, word: 'HARVEST',  clue: '1 Across — Collecting rainwater for later use',           direction: 'across' },
      { num: 2, word: 'RECHARGE', clue: '2 Down — Replenishing underground water tables',          direction: 'down'   },
      { num: 3, word: 'BASIN',    clue: '3 Across — River catchment area',                         direction: 'across' },
      { num: 4, word: 'FILTER',   clue: '4 Across — Device that purifies water',                   direction: 'across' },
      { num: 5, word: 'CANAL',    clue: '5 Down — Man-made waterway for irrigation',               direction: 'down'   },
    ],
  },
  // 5 — Water Conservation Advanced
  {
    topic: 'Water Conservation', level: 'Advanced', size: 10,
    words: [
      { num: 1, word: 'WATERSHED', clue: '1 Across — Area draining into a common water body',      direction: 'across' },
      { num: 2, word: 'OSMOSIS',   clue: '2 Down — Reverse __ is used in RO purifiers',            direction: 'down'   },
      { num: 3, word: 'DROUGHT',   clue: '3 Across — Prolonged period of abnormally low rainfall', direction: 'across' },
      { num: 4, word: 'PERCOLATE', clue: '4 Down — Water seeping through soil layers',             direction: 'down'   },
      { num: 5, word: 'SPRINKLE',  clue: '5 Across — Type of irrigation mimicking rainfall',       direction: 'across' },
    ],
  },
  // 6 — Climate Change Beginner
  {
    topic: 'Climate Change', level: 'Beginner', size: 10,
    words: [
      { num: 1, word: 'CARBON', clue: '1 Across — Element whose dioxide warms the planet',      direction: 'across' },
      { num: 2, word: 'SOLAR',  clue: '2 Down — Energy from the sun',                           direction: 'down'   },
      { num: 3, word: 'OZONE',  clue: '3 Across — Atmospheric layer shielding UV rays',         direction: 'across' },
      { num: 4, word: 'MELT',   clue: '4 Down — What glaciers do when the planet warms',        direction: 'down'   },
      { num: 5, word: 'FOSSIL', clue: '5 Across — Type of fuel that emits CO₂ when burnt',      direction: 'across' },
      { num: 6, word: 'WIND',   clue: '6 Across — Renewable energy from moving air',            direction: 'across' },
    ],
  },
  // 7 — Climate Change Intermediate
  {
    topic: 'Climate Change', level: 'Intermediate', size: 10,
    words: [
      { num: 1, word: 'GREENHOUSE', clue: '1 Down — Effect that traps heat in the atmosphere',                 direction: 'down'   },
      { num: 2, word: 'EMISSION',   clue: '2 Across — Release of gases into the atmosphere',                   direction: 'across' },
      { num: 3, word: 'METHANE',    clue: '3 Across — Potent GHG from livestock and rice paddies',             direction: 'across' },
      { num: 4, word: 'POLAR',      clue: '4 Down — Ice caps at the __ regions',                               direction: 'down'   },
    ],
  },
  // 8 — Climate Change Advanced
  {
    topic: 'Climate Change', level: 'Advanced', size: 10,
    words: [
      { num: 1, word: 'SEQUESTER',  clue: '1 Across — Capture and store CO₂ from the atmosphere',             direction: 'across' },
      { num: 2, word: 'ALBEDO',     clue: '2 Down — Surface reflectivity affecting global temperature',        direction: 'down'   },
      { num: 3, word: 'PERMAFROST', clue: '3 Down — Frozen ground layer thawing due to warming',              direction: 'down'   },
      { num: 4, word: 'NETZERO',    clue: '4 Across — Emission target where output equals removal',            direction: 'across' },
    ],
  },
];

// ─── run solver ──────────────────────────────────────────────────────────────

let allOk = true;

puzzles.forEach((puzzle, idx) => {
  const result = solve(puzzle.words, puzzle.size);
  if (!result) {
    console.error(`FAILED to find valid placement for puzzle ${idx} (${puzzle.topic} ${puzzle.level})`);
    allOk = false;
    return;
  }
  // double-check
  const ok = validate(result, puzzle.size);
  console.log(`Puzzle ${idx} [${puzzle.topic} — ${puzzle.level}]: ${ok ? 'OK' : 'INVALID'}`);
  console.log(JSON.stringify(result.map(w => ({
    num: w.num, word: w.word, clue: w.clue, direction: w.direction,
    row: w.row, col: w.col,
  })), null, 2));
  console.log('---');
  if (!ok) allOk = false;
});

if (allOk) {
  console.log('\n✅  All puzzles placed with zero intersection conflicts.');
} else {
  console.error('\n❌  One or more puzzles still have conflicts.');
  process.exit(1);
}
