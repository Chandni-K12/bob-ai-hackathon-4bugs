import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Puzzle, Clock, Award, Star, RotateCcw, CheckCircle2 } from 'lucide-react';
import { mockCrosswordPuzzles } from '../../data/mockData';

function buildGrid(crosswordData) {
  const grid = Array(crosswordData.size).fill(null).map(() => Array(crosswordData.size).fill(null));
  const nums = Array(crosswordData.size).fill(null).map(() => Array(crosswordData.size).fill(null));
  crosswordData.words.forEach(w => {
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

export default function CrosswordPage() {
  const topics = [...new Set(mockCrosswordPuzzles.map(puzzle => puzzle.topic))];
  const levels = ['Beginner', 'Intermediate', 'Advanced'];
  const [selectedTopic, setSelectedTopic] = useState(topics[0]);
  const [selectedLevel, setSelectedLevel] = useState(levels[0]);
  const crosswordData = mockCrosswordPuzzles.find(puzzle =>
    puzzle.topic === selectedTopic && puzzle.level === selectedLevel
  ) || mockCrosswordPuzzles[0];
  const [{ grid, nums }, setBoard] = useState(() => buildGrid(crosswordData));
  const [userGrid, setUserGrid] = useState(() =>
    grid.map(row => row.map(cell => (cell ? '' : null)))
  );
  const [timer, setTimer] = useState(0);
  const [started, setStarted] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const GRID_SIZE = crosswordData.size;

  const changePuzzle = (topic, level) => {
    const nextPuzzle = mockCrosswordPuzzles.find(puzzle => puzzle.topic === topic && puzzle.level === level);
    if (!nextPuzzle) return;
    const nextBoard = buildGrid(nextPuzzle);
    setBoard(nextBoard);
    setUserGrid(nextBoard.grid.map(row => row.map(cell => (cell ? '' : null))));
    setTimer(0);
    setStarted(false);
    setCompleted(false);
    setScore(0);
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
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, [started, completed]);

  const formatTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  const handleCellInput = (r, c, val) => {
    if (grid[r][c] === null) return;
    const newGrid = userGrid.map(row => [...row]);
    newGrid[r][c] = val.toUpperCase().slice(-1);
    setUserGrid(newGrid);
    if (!started) setStarted(true);
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
    const pct = Math.round((correct / total) * 100);
    setScore(pct);
    setCompleted(true);
  };

  const revealAll = () => {
    setUserGrid(grid.map(row => row.map(cell => cell ? cell.letter : null)));
    setScore(100);
    setCompleted(true);
  };

  const resetPuzzle = () => {
    setUserGrid(grid.map(row => row.map(cell => cell ? '' : null)));
    setTimer(0);
    setStarted(false);
    setCompleted(false);
    setScore(0);
  };

  const filledCount = userGrid.flat().filter(c => c && c.length > 0).length;
  const totalCount = grid.flat().filter(c => c !== null).length;
  const progress = Math.round((filledCount / totalCount) * 100);

  const acrossClues = crosswordData.words.filter(w => w.direction === 'across');
  const downClues = crosswordData.words.filter(w => w.direction === 'down');

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Puzzle className="w-6 h-6 text-eco-blue" /> Eco Crossword</h1>
          <p className="text-sm text-muted-foreground">Complete the crossword with environmental vocabulary</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" /> {formatTime(timer)}
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-secondary text-sm">
            <Star className="w-4 h-4 text-eco-amber" /> {progress}%
          </div>
        </div>
      </div>

      <div className="glass rounded-xl p-4 grid sm:grid-cols-2 gap-3">
        <label className="text-sm font-medium">
          Topic
          <select value={selectedTopic} onChange={e => handleTopicChange(e.target.value)}
            className="mt-1 w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm outline-none focus:border-primary">
            {topics.map(topic => <option key={topic} value={topic}>{topic}</option>)}
          </select>
        </label>
        <label className="text-sm font-medium">
          Level
          <select value={selectedLevel} onChange={e => handleLevelChange(e.target.value)}
            className="mt-1 w-full rounded-lg bg-secondary border border-border px-3 py-2 text-sm outline-none focus:border-primary">
            {levels.map(level => <option key={level} value={level}>{level}</option>)}
          </select>
        </label>
      </div>

      {completed && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="glass rounded-xl p-6 text-center">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring' }}
            className="w-16 h-16 mx-auto rounded-2xl gradient-primary flex items-center justify-center mb-3 glow-green">
            <CheckCircle2 className="w-8 h-8 text-white" />
          </motion.div>
          <h2 className="text-xl font-bold mb-1">
            {score === 100 ? '🎉 Perfect!' : score >= 70 ? '👏 Great Job!' : '💪 Keep Trying!'}
          </h2>
          <p className="text-muted-foreground text-sm mb-3">Score: {score}% • Time: {formatTime(timer)}</p>
          <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3, type: 'spring' }}
            className="text-2xl font-bold text-eco-green">+{Math.round(score * 0.5 + 50)} Eco Points</motion.p>
          <button onClick={resetPuzzle} className="mt-4 px-4 py-2 rounded-lg bg-secondary hover:bg-secondary/80 text-sm flex items-center gap-2 mx-auto">
            <RotateCcw className="w-4 h-4" /> Play Again
          </button>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Grid */}
        <div className="lg:col-span-2">
          <div className="glass rounded-xl p-4 overflow-x-auto">
            <div className="inline-grid gap-0.5" style={{ gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(32px, 40px))` }}>
              {grid.map((row, r) =>
                row.map((cell, c) => (
                  <div key={`${r}-${c}`} className={`relative aspect-square rounded-none border ${cell ? 'bg-white border-slate-500' : '!bg-green-200 border-slate-600'}`}>
                    {nums[r][c] && (
                      <span className="absolute top-0 left-0.5 text-[8px] text-muted-foreground font-medium">{nums[r][c]}</span>
                    )}
                    {cell && (
                      <input
                        type="text"
                        maxLength={1}
                        value={userGrid[r][c] || ''}
                        onChange={e => handleCellInput(r, c, e.target.value)}
                        className={`w-full h-full text-center uppercase font-bold text-sm bg-transparent outline-none ${
                          completed && userGrid[r][c] === cell.letter ? 'text-eco-green' :
                          completed && userGrid[r][c] && userGrid[r][c] !== cell.letter ? 'text-destructive' : 'text-foreground'
                        }`}
                        disabled={completed}
                      />
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={checkAnswers}
              disabled={completed}
              className="flex-1 py-3 rounded-xl gradient-primary text-white font-semibold disabled:opacity-50">
              Check Answers
            </motion.button>
            <button onClick={revealAll} disabled={completed}
              className="px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-sm font-medium disabled:opacity-50">
              Reveal
            </button>
            <button onClick={resetPuzzle}
              className="px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80">
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Clues */}
        <div className="space-y-4">
          <div className="glass rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-3 text-eco-blue">Across →</h3>
            <div className="space-y-2">
              {acrossClues.map(w => (
                <p key={w.num} className="text-xs text-muted-foreground leading-relaxed">{w.clue}</p>
              ))}
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-3 text-eco-purple">Down ↓</h3>
            <div className="space-y-2">
              {downClues.map(w => (
                <p key={w.num} className="text-xs text-muted-foreground leading-relaxed">{w.clue}</p>
              ))}
            </div>
          </div>
          <div className="glass rounded-xl p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2"><Award className="w-4 h-4 text-eco-amber" /> Bonus Points</h3>
            <p className="text-xs text-muted-foreground">Complete under 5 minutes for +50 bonus Eco Points!</p>
            <div className="mt-2 h-1.5 bg-secondary rounded-full overflow-hidden">
              <motion.div animate={{ width: `${progress}%` }} className="h-full gradient-primary rounded-full" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">{filledCount}/{totalCount} cells filled</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
