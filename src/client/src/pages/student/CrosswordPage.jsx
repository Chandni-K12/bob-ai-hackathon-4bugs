import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Puzzle, Clock, Award, Star, RotateCcw, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const defaultCrosswordPuzzles = [
  {
    id: 'waste-beginner',
    topic: 'Waste Management',
    level: 'Beginner',
    size: 9,
    words: [
      { word: 'BIN', clue: '1A. A container used for collecting waste', hint: 'Starts with B (3 letters). Common waste container kept in rooms or streets.', direction: 'across', row: 0, col: 0, num: 1 },
      { word: 'REUSE', clue: '2A. Use an item again', hint: 'Starts with R (5 letters). Using an item multiple times instead of throwing it away.', direction: 'across', row: 1, col: 0, num: 2 },
      { word: 'PAPER', clue: '3A. Material commonly made from trees', hint: 'Starts with P (5 letters). Recyclable material made from wood pulp used for writing.', direction: 'across', row: 2, col: 0, num: 3 },
    ],
    bonusPoints: 50,
  },
  {
    id: 'water-beginner',
    topic: 'Water Conservation',
    level: 'Beginner',
    size: 9,
    words: [
      { word: 'RAIN', clue: '1A. Water falling from clouds', hint: 'Starts with R (4 letters). Natural freshwater precipitation from clouds.', direction: 'across', row: 0, col: 0, num: 1 },
      { word: 'SAVE', clue: '2A. Keep from wasting', hint: 'Starts with S (4 letters). Action to conserve or protect natural resources.', direction: 'across', row: 1, col: 0, num: 2 },
      { word: 'FLOW', clue: '3A. Movement of water', hint: 'Starts with F (4 letters). Smooth continuous motion of liquids like water in streams.', direction: 'across', row: 2, col: 0, num: 3 },
    ],
    bonusPoints: 50,
  },
];

function buildGrid(crosswordData) {
  const grid = Array(crosswordData.size).fill(null).map(() => Array(crosswordData.size).fill(null));
  const nums = Array(crosswordData.size).fill(null).map(() => Array(crosswordData.size).fill(null));
  crosswordData.words.forEach((w) => {
    for (let i = 0; i < w.word.length; i++) {
      const r = w.direction === 'across' ? w.row : w.row + i;
      const c = w.direction === 'across' ? w.col + i : w.col;
      if (r < crosswordData.size && c < crosswordData.size) {
        grid[r][c] = { letter: w.word[i], filled: false };
        if (i === 0) nums[r][c] = w.num;
      }
    }
  });
  return { grid, nums };
}

// Build a map of (r,c) -> next cell to focus after typing, based on the word that starts at or passes through that cell
function buildNextCellMap(crosswordData) {
  // For each cell, we store the next cell in the primary word direction
  // Priority: across word first, then down
  const map = {};
  crosswordData.words.forEach(w => {
    for (let i = 0; i < w.word.length - 1; i++) {
      const r = w.direction === 'across' ? w.row : w.row + i;
      const c = w.direction === 'across' ? w.col + i : w.col;
      const nr = w.direction === 'across' ? w.row : w.row + i + 1;
      const nc = w.direction === 'across' ? w.col + i + 1 : w.col;
      const key = `${r}-${c}`;
      // Across takes priority over down for next-cell
      if (!map[key] || w.direction === 'across') {
        map[key] = { r: nr, c: nc };
      }
    }
  });
  return map;
}

export default function CrosswordPage() {
  const { addPoints } = useAuth();
  const topics = [...new Set(defaultCrosswordPuzzles.map((puzzle) => puzzle.topic))];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);
  const [selectedLevel, setSelectedLevel] = useState(levels[0]);
  const crosswordData = defaultCrosswordPuzzles.find((puzzle) => puzzle.topic === selectedTopic && puzzle.level === selectedLevel) || defaultCrosswordPuzzles[0];
  const [{ grid, nums }, setBoard] = useState(() => buildGrid(crosswordData));
  const [userGrid, setUserGrid] = useState(() => grid.map((row) => row.map((cell) => (cell ? '' : null))));
  const [timer, setTimer] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [wordFeedback, setWordFeedback] = useState([]);
  const [activeCell, setActiveCell] = useState(null); // 'r-c' string
  const GRID_SIZE = crosswordData.size;
  const nextCellMap = buildNextCellMap(crosswordData);

  const changePuzzle = (topic, level) => {
    const nextPuzzle = defaultCrosswordPuzzles.find((puzzle) => puzzle.topic === topic && puzzle.level === level) || defaultCrosswordPuzzles[0];
    const nextBoard = buildGrid(nextPuzzle);
    setBoard(nextBoard);
    setUserGrid(nextBoard.grid.map((row) => row.map((cell) => (cell ? '' : null))));
    setTimer(0);
    setStarted(false);
    setCompleted(false);
    setScore(0);
    setEarnedPoints(0);
    setIsRevealed(false);
    setWordFeedback([]);
  };

  const handleTopicChange = (topic) => {
    setSelectedTopic(topic);
    changePuzzle(topic, selectedLevel);
  };

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    changePuzzle(selectedTopic, level);
  };

  useEffect(() => {
    if (!started || completed) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [started, completed]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleCellInput = (r, c, val) => {
    if (grid[r][c] === null) return;
    const letter = val.toUpperCase().slice(-1);
    const newGrid = userGrid.map(row => [...row]);
    newGrid[r][c] = letter;
    setUserGrid(newGrid);
    if (!started) setStarted(true);
    // Auto-advance to next cell after typing a letter
    if (letter) {
      const next = nextCellMap[`${r}-${c}`];
      if (next) {
        const nextInput = document.getElementById(`cell-${next.r}-${next.c}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  const checkAnswers = () => {
    let correct = 0;
    let total = 0;
    for (let r = 0; r < GRID_SIZE; r++) {
      for (let c = 0; c < GRID_SIZE; c++) {
        if (grid[r][c]) {
          total++;
          if (userGrid[r][c] === grid[r][c].letter) correct++;
        }
      }
    }
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;
    const basePoints = pct > 0 ? Math.round(pct * 0.5) : 0;
    const speedBonus = (pct === 100 && timer <= 300) ? 50 : 0;
    const totalPoints = basePoints + speedBonus;

    // Build per-word feedback
    // Strip the "1A. " / "2D. " number prefix to get the plain clue text
    const stripPrefix = (clue) => clue.replace(/^\d+[AD]\.\s*/, '');

    const feedback = crosswordData.words.map(w => {
      let typed = '';
      for (let i = 0; i < w.word.length; i++) {
        const r = w.direction === 'across' ? w.row : w.row + i;
        const c = w.direction === 'across' ? w.col + i : w.col;
        typed += (userGrid[r]?.[c] || '_');
      }
      const isBlank = typed.split('').every(ch => ch === '_');
      const isCorrect = typed === w.word;
      const description = stripPrefix(w.clue);
      const hint = w.hint || `Starts with '${w.word[0]}' and has ${w.word.length} letters (${description}).`;
      return { num: w.num, direction: w.direction, word: w.word, description, hint, typed, isCorrect, isBlank };
    });

    setWordFeedback(feedback);
    setScore(pct);
    setEarnedPoints(totalPoints);
    setIsRevealed(false);
    setCompleted(true);
    if (totalPoints > 0 && addPoints) {
      addPoints(totalPoints, 'crossword');
    }
  };

  const revealAll = () => {
    setUserGrid(grid.map((row) => row.map((cell) => (cell ? cell.letter : null))));
    setScore(100);
    setEarnedPoints(0);
    setIsRevealed(true);
    setWordFeedback([]);
    setCompleted(true);
  };

  const resetPuzzle = () => {
    setUserGrid(grid.map((row) => row.map((cell) => (cell ? '' : null))));
    setTimer(0);
    setStarted(false);
    setCompleted(false);
    setScore(0);
    setEarnedPoints(0);
    setIsRevealed(false);
    setWordFeedback([]);
  };

  const filledCount = userGrid.flat().filter((c) => c && c.length > 0).length;
  const totalCount = grid.flat().filter((c) => c !== null).length;
  const progress = Math.round((filledCount / totalCount) * 100);

  const acrossClues = crosswordData.words.filter((w) => w.direction === 'across');
  const downClues = crosswordData.words.filter((w) => w.direction === 'down');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8 max-w-6xl mx-auto pb-8">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Puzzle className="w-8 h-8 text-eco-blue" /> Eco Crossword
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Complete the crossword with environmental vocabulary</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-sm font-medium">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="tabular-nums">{formatTime(timer)}</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-sm font-medium">
            <Star className="w-4 h-4 text-eco-amber" />
            <span>{progress}% filled</span>
          </div>
        </div>
      </div>

      {/* ── Topic & Level selectors ── */}
      <div className="glass rounded-2xl p-6 grid sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-sm font-semibold mb-2">Topic</label>
          <select value={selectedTopic} onChange={e => handleTopicChange(e.target.value)}
            className="w-full rounded-xl bg-secondary border border-border px-4 py-2.5 text-sm outline-none focus:border-primary transition-colors">
            {topics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-semibold mb-2">Difficulty</label>
          <div className="flex gap-2">
            {levels.map(level => (
              <button key={level} onClick={() => handleLevelChange(level)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  selectedLevel === level
                    ? 'gradient-primary text-white border-transparent shadow-sm'
                    : 'bg-secondary border-border hover:border-primary/40'
                }`}>
                {level}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Result card ── */}
      {completed && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-2xl p-8 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
            className="w-20 h-20 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-4 glow-green">
            <CheckCircle2 className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl font-bold mb-2">
            {isRevealed ? '👀 Answers Revealed' : score === 100 ? '🎉 Perfect!' : score >= 70 ? '👏 Great Job!' : '💪 Keep Trying!'}
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            {isRevealed ? 'Solution shown • Try solving on your own next time!' : `Score: ${score}% • Time: ${formatTime(timer)}`}
          </p>
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
            className={`text-3xl font-bold mb-1 ${earnedPoints > 0 ? 'text-eco-green' : 'text-muted-foreground'}`}>
            +{earnedPoints} Eco Points
          </motion.p>
          {earnedPoints > 50 && (
            <p className="text-xs text-eco-amber mt-1 font-medium">⚡ Includes +50 speed bonus for finishing under 5 minutes!</p>
          )}
          {earnedPoints === 0 && !isRevealed && (
            <p className="text-xs text-muted-foreground mt-1">Get letters right to earn Eco Points.</p>
          )}
          <div className="flex items-center justify-center gap-3 mt-6">
            {!isRevealed && score < 100 && (
              <button onClick={() => setCompleted(false)}
                className="px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                Keep Trying
              </button>
            )}
            <button onClick={resetPuzzle}
              className="px-6 py-2.5 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium flex items-center gap-2 transition-colors">
              <RotateCcw className="w-4 h-4" /> {score === 100 || isRevealed ? 'Play Again' : 'Reset'}
            </button>
          </div>

          {/* ── Answer Breakdown ── */}
          {!isRevealed && wordFeedback.length > 0 && (
            <div className="mt-8 text-left space-y-3">
              <h3 className="text-sm font-bold text-foreground uppercase tracking-wider mb-3">Answer Breakdown</h3>
              {wordFeedback.filter(fb => !fb.isBlank).map(fb => (
                <div key={`${fb.num}-${fb.direction}`}
                  className={`rounded-xl px-5 py-4 border ${fb.isCorrect ? 'bg-eco-green/10 border-eco-green/30' : 'bg-destructive/10 border-destructive/30'}`}>
                  <div className="flex items-center gap-2 font-semibold text-sm mb-1">
                    <span>{fb.isCorrect ? '✅' : '❌'}</span>
                    <span className="uppercase tracking-wide">
                      {fb.num}{fb.direction === 'across' ? 'A' : 'D'}. {fb.isCorrect ? fb.word : fb.typed}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {fb.isCorrect
                      ? fb.description
                      : <>
                          <span className="font-mono font-bold text-destructive">{fb.typed}</span>
                          {' '}is not the right answer here.{' '}
                          <span className="font-semibold text-foreground">Hint:</span>{' '}{fb.hint}
                        </>
                    }
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* ── Main play area ── */}
      <div className="grid lg:grid-cols-5 gap-8">

        {/* Grid + action buttons — takes 3 of 5 columns */}
        <div className="lg:col-span-3 space-y-5">
          <div className="glass rounded-3xl p-4 sm:p-6 overflow-x-auto flex justify-center items-center shadow-lg border-2 border-emerald-200 dark:border-emerald-800/60">
            <div
              className="inline-grid mx-auto"
              style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(32px, 40px))`, gap: '4px' }}
            >
              {grid.map((row, r) =>
                row.map((cell, c) => {
                  const isActive = activeCell === `${r}-${c}`;
                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`relative w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center transition-all duration-150 ${
                        cell
                          ? `border rounded-xs shadow-2xs ${isActive ? 'border-2 border-eco-blue bg-blue-50 dark:bg-blue-950/40 z-10' : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900'}`
                          : 'rounded-xs bg-[#a7f3d0] dark:bg-emerald-800/80 border border-emerald-300/80 dark:border-emerald-700/60 shadow-2xs'
                      }`}
                    >
                      {nums[r][c] && (
                        <span className="absolute top-0.5 left-1 text-[9px] sm:text-[10px] font-black text-slate-800 dark:text-slate-200 leading-none select-none pointer-events-none z-10">
                          {nums[r][c]}
                        </span>
                      )}
                      {cell && (
                        <input
                          id={`cell-${r}-${c}`}
                          type="text"
                          maxLength={1}
                          value={userGrid[r][c] || ''}
                          onChange={e => handleCellInput(r, c, e.target.value)}
                          onFocus={() => setActiveCell(`${r}-${c}`)}
                          onBlur={() => setActiveCell(null)}
                          className={`w-full h-full text-center uppercase font-black text-sm sm:text-base bg-transparent outline-none cursor-text select-none ${
                            completed && userGrid[r][c] === cell.letter ? 'text-eco-green font-black' :
                            completed && userGrid[r][c] && userGrid[r][c] !== cell.letter ? 'text-destructive font-black' :
                            'text-slate-900 dark:text-slate-100'
                          }`}
                          disabled={completed}
                        />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={checkAnswers}
              disabled={completed}
              className="flex-1 py-3.5 rounded-xl gradient-primary text-white font-semibold text-sm disabled:opacity-50 transition-opacity">
              Check Answers
            </motion.button>
            <button onClick={revealAll} disabled={completed}
              className="px-5 py-3.5 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium disabled:opacity-50 transition-colors border border-border">
              Reveal All
            </button>
            <button onClick={resetPuzzle} title="Reset puzzle"
              className="px-4 py-3.5 rounded-xl bg-secondary hover:bg-secondary/80 border border-border transition-colors">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clues sidebar — takes 2 of 5 columns */}
        <div className="lg:col-span-2 space-y-5">

          {/* Across clues */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-bold text-sm mb-4 text-eco-blue flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-eco-blue/10 flex items-center justify-center text-xs">→</span>
              Across
            </h3>
            <div className="space-y-3">
              {acrossClues.map(w => (
                <p key={w.num} className="text-xs text-muted-foreground leading-relaxed border-l-2 border-eco-blue/20 pl-3">
                  {w.clue}
                </p>
              ))}
            </div>
          </div>

          {/* Down clues */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-bold text-sm mb-4 text-eco-purple flex items-center gap-2">
              <span className="w-5 h-5 rounded-md bg-eco-purple/10 flex items-center justify-center text-xs">↓</span>
              Down
            </h3>
            <div className="space-y-3">
              {downClues.map(w => (
                <p key={w.num} className="text-xs text-muted-foreground leading-relaxed border-l-2 border-eco-purple/20 pl-3">
                  {w.clue}
                </p>
              ))}
            </div>
          </div>

          {/* Progress & bonus */}
          <div className="glass rounded-2xl p-5">
            <h3 className="font-bold text-sm mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-eco-amber" /> Bonus Points
            </h3>
            <p className="text-xs text-muted-foreground mb-3">Finish under 5 minutes for +50 bonus Eco Points!</p>
            <div className="h-2 bg-secondary rounded-full overflow-hidden mb-2">
              <motion.div animate={{ width: `${progress}%` }} className="h-full gradient-primary rounded-full transition-all" />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{filledCount} / {totalCount} cells filled</span>
              <span className="font-medium">{progress}%</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
