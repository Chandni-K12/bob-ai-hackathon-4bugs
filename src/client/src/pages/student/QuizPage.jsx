import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockQuizzes } from '../../data/mockData';
import { HelpCircle, CheckCircle2, XCircle, Zap, ChevronRight, RotateCcw, Trophy } from 'lucide-react';

export default function QuizPage() {
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [finished, setFinished] = useState(false);
  const [answers, setAnswers] = useState([]);

  const handleSelect = (idx) => {
    if (answered) return;
    setSelected(idx);
  };

  const handleSubmit = () => {
    if (selected === null) return;
    const q = selectedQuiz.questions[currentQ];
    const correct = selected === q.correct;
    setAnswered(true);
    setAnswers([...answers, { questionId: q.id, selected, correct }]);
    if (correct) {
      setScore(s => s + 1);
      setTotalPoints(t => t + q.points);
    }
  };

  const handleNext = () => {
    if (currentQ < selectedQuiz.questions.length - 1) {
      setCurrentQ(c => c + 1);
      setSelected(null);
      setAnswered(false);
    } else {
      setFinished(true);
    }
  };

  const resetQuiz = () => {
    setSelectedQuiz(null);
    setCurrentQ(0);
    setSelected(null);
    setAnswered(false);
    setScore(0);
    setTotalPoints(0);
    setFinished(false);
    setAnswers([]);
  };

  if (!selectedQuiz) {
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><HelpCircle className="w-6 h-6 text-primary" /> Scenario-Based Quizzes</h1>
          <p className="text-sm text-muted-foreground mt-1">Test your environmental knowledge with real-world scenarios</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockQuizzes.map((quiz, i) => (
            <motion.div key={quiz.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.02 }}
              onClick={() => setSelectedQuiz(quiz)}
              className="glass rounded-xl p-5 cursor-pointer hover:border-primary/20 transition-all">
              <div className="text-3xl mb-3">{quiz.topic === 'Waste Management' ? '♻️' : quiz.topic === 'Water Conservation' ? '💧' : '🌡️'}</div>
              <h3 className="font-semibold mb-1">{quiz.title}</h3>
              <p className="text-xs text-muted-foreground mb-3">{quiz.topic}</p>
              <div className="flex items-center justify-between text-xs">
                <span className="px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{quiz.difficulty}</span>
                <span className="text-eco-green font-medium">{quiz.questions.length} questions • +{quiz.totalPoints} pts</span>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    );
  }

  if (finished) {
    const pct = Math.round((score / selectedQuiz.questions.length) * 100);
    return (
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="max-w-lg mx-auto text-center space-y-6 py-12">
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
          className="w-24 h-24 mx-auto rounded-3xl gradient-primary flex items-center justify-center glow-green">
          <Trophy className="w-12 h-12 text-white" />
        </motion.div>
        <h2 className="text-2xl font-bold">Quiz Complete!</h2>
        <p className="text-muted-foreground">{selectedQuiz.title}</p>
        <div className="grid grid-cols-3 gap-4">
          <div className="glass rounded-xl p-4">
            <p className="text-2xl font-bold text-primary">{score}/{selectedQuiz.questions.length}</p>
            <p className="text-xs text-muted-foreground">Correct</p>
          </div>
          <div className="glass rounded-xl p-4">
            <p className="text-2xl font-bold text-eco-amber">{pct}%</p>
            <p className="text-xs text-muted-foreground">Accuracy</p>
          </div>
          <div className="glass rounded-xl p-4">
            <motion.p initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.5, type: 'spring' }}
              className="text-2xl font-bold text-eco-green">+{totalPoints}</motion.p>
            <p className="text-xs text-muted-foreground">Eco Points</p>
          </div>
        </div>
        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={resetQuiz}
          className="px-6 py-3 rounded-xl gradient-primary text-white font-semibold flex items-center gap-2 mx-auto">
          <RotateCcw className="w-4 h-4" /> Try Another Quiz
        </motion.button>
      </motion.div>
    );
  }

  const q = selectedQuiz.questions[currentQ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={resetQuiz} className="text-sm text-muted-foreground hover:text-foreground">← Back</button>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Q{currentQ + 1}/{selectedQuiz.questions.length}</span>
          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-eco-green/10 text-eco-green text-sm font-medium">
            <Zap className="w-3.5 h-3.5" /> {totalPoints} pts
          </div>
        </div>
      </div>

      {/* Progress */}
      <div className="h-2 bg-secondary rounded-full overflow-hidden">
        <motion.div animate={{ width: `${((currentQ + 1) / selectedQuiz.questions.length) * 100}%` }}
          className="h-full gradient-primary rounded-full" />
      </div>

      {/* Scenario */}
      <AnimatePresence mode="wait">
        <motion.div key={currentQ} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
          <div className="glass rounded-xl p-6 mb-4">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-eco-amber/10 flex items-center justify-center shrink-0">
                <span className="text-sm">📖</span>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-eco-amber font-medium mb-2">Scenario</p>
                <p className="text-sm leading-relaxed text-muted-foreground italic">"{q.scenario}"</p>
              </div>
            </div>
            <h3 className="text-lg font-semibold">{q.question}</h3>
          </div>

          {/* Options */}
          <div className="space-y-3">
            {q.options.map((opt, idx) => {
              let cls = 'glass rounded-xl p-4 cursor-pointer transition-all border-2 border-transparent';
              if (answered) {
                if (idx === q.correct) cls += ' border-eco-green bg-eco-green/5';
                else if (idx === selected && idx !== q.correct) cls += ' border-destructive bg-destructive/5';
                else cls += ' opacity-50';
              } else if (idx === selected) {
                cls += ' border-primary bg-primary/5';
              } else {
                cls += ' hover:border-border hover:bg-secondary/50';
              }
              return (
                <motion.div key={idx} whileHover={!answered ? { scale: 1.01 } : {}} whileTap={!answered ? { scale: 0.99 } : {}}
                  onClick={() => handleSelect(idx)} className={cls}>
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 ${
                      answered && idx === q.correct ? 'bg-eco-green text-white' :
                      answered && idx === selected ? 'bg-destructive text-white' :
                      idx === selected ? 'gradient-primary text-white' : 'bg-secondary text-muted-foreground'
                    }`}>
                      {answered && idx === q.correct ? <CheckCircle2 className="w-4 h-4" /> :
                       answered && idx === selected && idx !== q.correct ? <XCircle className="w-4 h-4" /> :
                       String.fromCharCode(65 + idx)}
                    </div>
                    <p className="text-sm">{opt}</p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Explanation */}
          <AnimatePresence>
            {answered && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mt-4">
                <div className={`p-4 rounded-xl ${selected === q.correct ? 'bg-eco-green/5 border border-eco-green/20' : 'bg-eco-amber/5 border border-eco-amber/20'}`}>
                  <p className={`text-sm font-medium mb-1 ${selected === q.correct ? 'text-eco-green' : 'text-eco-amber'}`}>
                    {selected === q.correct ? '✅ Correct!' : '❌ Not quite right'}
                    {selected === q.correct && <span className="ml-2">+{q.points} Eco Points</span>}
                  </p>
                  <p className="text-sm text-muted-foreground">{q.explanation}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            {!answered ? (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleSubmit}
                disabled={selected === null}
                className="px-6 py-3 rounded-xl gradient-primary text-white font-semibold disabled:opacity-50 flex items-center gap-2">
                Submit Answer
              </motion.button>
            ) : (
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleNext}
                className="px-6 py-3 rounded-xl gradient-primary text-white font-semibold flex items-center gap-2">
                {currentQ < selectedQuiz.questions.length - 1 ? 'Next Scenario' : 'See Results'} <ChevronRight className="w-4 h-4" />
              </motion.button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
