import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { mockAIRecommendation } from '../../data/mockData';
import {
  Bot, TrendingUp, TrendingDown, Minus, BookOpen, Target, Sparkles,
  ChevronRight, BrainCircuit, Send, Trash2, MessageSquare, Lightbulb, X, MessageCircle
} from 'lucide-react';
import { aiAPI } from '../../services/api';

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

function TopicStrength({ topic, score, status }) {
  const config = {
    'Needs Improvement': { color: '#ef4444', icon: TrendingDown, bg: 'bg-red-500/10', textColor: 'text-red-400' },
    'Good': { color: '#f59e0b', icon: Minus, bg: 'bg-amber-500/10', textColor: 'text-amber-400' },
    'Strong': { color: '#22c55e', icon: TrendingUp, bg: 'bg-green-500/10', textColor: 'text-green-400' },
  };
  const c = config[status];

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50">
      <div className={`w-10 h-10 rounded-lg ${c.bg} flex items-center justify-center`}>
        <c.icon className={`w-5 h-5 ${c.textColor}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{topic}</p>
        <p className={`text-xs ${c.textColor}`}>{status}</p>
      </div>
      <div className="text-right">
        <p className="text-lg font-bold" style={{ color: c.color }}>{score}%</p>
      </div>
    </div>
  );
}

// Formats Markdown bold (**text**) and italics (*text*) into rich React nodes
function FormattedMessage({ text, isUser }) {
  if (isUser) {
    return <div className="whitespace-pre-line">{text}</div>;
  }

  const lines = text.split('\n');
  return (
    <div className="space-y-1.5">
      {lines.map((line, lineIdx) => {
        if (!line.trim()) return <div key={lineIdx} className="h-1" />;

        const parts = line.split(/(\*\*.*?\*\*|\*.*?\*)/g);
        const parsed = parts.map((part, pIdx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return <strong key={pIdx} className="font-bold text-foreground">{part.slice(2, -2)}</strong>;
          }
          if (part.startsWith('*') && part.endsWith('*')) {
            return <em key={pIdx} className="italic text-muted-foreground">{part.slice(1, -1)}</em>;
          }
          return part;
        });

        return <p key={lineIdx}>{parsed}</p>;
      })}
    </div>
  );
}

// Preset environmental prompt chips
const QUICK_PROMPTS = [
  { icon: '🌍', text: 'How does global warming affect our weather?' },
  { icon: '♻️', text: 'Give me 3 zero-waste tips for school' },
  { icon: '🌱', text: 'Give me 5 zero-waste tips' },
  { icon: '⚡', text: 'How can we conserve electricity at home?' },
  { icon: '💧', text: 'Why is rainwater harvesting important?' },
];

// Knowledge Repositories
const ZERO_WASTE_TIPS = [
  { title: "Carry Reusables", desc: "Use a stainless steel water bottle and cloth shopping bag everywhere you go." },
  { title: "Say No to Single-Use Plastics", desc: "Avoid plastic straws, disposable cutlery, and bottled drinks." },
  { title: "Segregate Waste at Source", desc: "Keep paper & plastic recyclables separate from wet organic kitchen waste." },
  { title: "Compost Organic Scraps", desc: "Turn fruit peels, vegetable ends, and tea leaves into nutrient-rich garden soil." },
  { title: "Repurpose & Upcycle", desc: "Reuse glass jars for food storage and turn old t-shirts into cleaning rags." },
  { title: "Go Digital & Decline Paper Receipts", desc: "Opt for digital receipts and use digital notebooks for school." },
  { title: "Buy Package-Free Goods in Bulk", desc: "Shop at bulk stations using your own containers to minimize plastic packaging." },
  { title: "Repair Items Before Replacing", desc: "Mend worn clothes, fix broken toys, and repair tools to extend their lifecycle." },
  { title: "Choose Natural Materials", desc: "Prefer bamboo toothbrushes and wooden combs over plastic alternatives." },
  { title: "Donate & Share Unused Items", desc: "Pass along old textbooks, toys, and clothes to schoolmates or local shelters." },
];

const WATER_CONSERVATION_TIPS = [
  { title: "Turn Off Running Taps", desc: "Close the faucet while brushing teeth to save over 6 liters per minute." },
  { title: "Fix Leaks Immediately", desc: "A single dripping tap can waste over 15 liters of fresh water daily." },
  { title: "Install Rainwater Harvesting", desc: "Set up collection barrels or pits at school and home to capture rain." },
  { title: "Reuse RO Wastewater", desc: "Collect reject water from purifiers to mop floors or water garden plants." },
  { title: "Take Shorter Showers", desc: "Keep showers under 5 minutes or use a bucket and mug to control water use." },
];

const ENERGY_SAVING_TIPS = [
  { title: "Switch to LED Bulbs", desc: "LED lights consume up to 80% less electricity than incandescent bulbs." },
  { title: "Unplug Phantom Electronics", desc: "Disconnect chargers and appliances when not in use to stop standby power draw." },
  { title: "Maximize Natural Daylight", desc: "Open curtains during the daytime instead of switching on room lights." },
  { title: "Set AC to 24°C-26°C", desc: "Optimal air conditioner temperatures reduce compressor energy load." },
  { title: "Switch Off Unused Appliances", desc: "Turn off lights, fans, and computers whenever leaving a room." },
];

const extractCountFromQuery = (query, defaultVal = 3) => {
  const digitMatch = query.match(/\b([1-9]|10)\b/);
  if (digitMatch) return Math.min(parseInt(digitMatch[1], 10), 10);

  const wordMap = {
    one: 1, two: 2, three: 3, four: 4, five: 5,
    six: 6, seven: 7, eight: 8, nine: 9, ten: 10
  };
  for (const [word, num] of Object.entries(wordMap)) {
    if (new RegExp(`\\b${word}\\b`, 'i').test(query)) return num;
  }
  return defaultVal;
};

export default function AIMentorPage() {
  const rec = mockAIRecommendation;
  const [chatOpen, setChatOpen] = useState(false); // Floating Chatbot closed by default

  // Chat State
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: "Hello! I am your AI Eco Mentor 🤖🌿. Ask me anything about environmental science, climate action, recycling, or daily green habits!",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (chatOpen) {
      scrollToBottom();
    }
  }, [messages, isTyping, chatOpen]);

  // Generate fallback responses matching exact count requested by user
  const getSmartEcoReply = (query) => {
    const q = query.toLowerCase();
    const count = extractCountFromQuery(q, 3);

    if (q.includes('waste') || q.includes('plastic') || q.includes('zero') || q.includes('recycle') || q.includes('tip')) {
      const selected = ZERO_WASTE_TIPS.slice(0, count);
      return `Here are **${count} practical zero-waste tips** for daily life:\n\n` +
        selected.map((t, idx) => `${idx + 1}. **${t.title}**: ${t.desc}`).join('\n') +
        `\n\n♻️ *Every item saved from landfills protects our oceans and wildlife!*`;
    }

    if (q.includes('water') || q.includes('rain') || q.includes('conserve')) {
      const selected = WATER_CONSERVATION_TIPS.slice(0, count);
      return `Here are **${count} key water conservation tips**:\n\n` +
        selected.map((t, idx) => `${idx + 1}. **${t.title}**: ${t.desc}`).join('\n') +
        `\n\n💧 *Protect every drop!*`;
    }

    if (q.includes('electricity') || q.includes('energy') || q.includes('solar')) {
      const selected = ENERGY_SAVING_TIPS.slice(0, count);
      return `Here are **${count} energy-saving tips** for home and school:\n\n` +
        selected.map((t, idx) => `${idx + 1}. **${t.title}**: ${t.desc}`).join('\n') +
        `\n\n⚡ *Save power, protect the planet!*`;
    }

    if (q.includes('climate') || q.includes('warming') || q.includes('weather')) {
      return "Global warming happens when heat gets trapped by greenhouse gases like Carbon Dioxide (CO2) and Methane. This causes extreme heatwaves, melting glaciers, and unseasonal rainfall.\n\n💡 **Action Step**: Walk or cycle for short distances to reduce carbon emissions!";
    }

    if (q.includes('tree') || q.includes('plant') || q.includes('co2') || q.includes('biodiversity')) {
      return "Trees act as natural carbon sinks! A single mature tree absorbs about **22 kg of CO2 per year** while producing clean oxygen for 2 people.\n\n🌳 **Eco-Challenge**: Plant a native tree sapling and log your mission in GenGreen!";
    }

    if (q.includes('hi') || q.includes('hello') || q.includes('hey')) {
      return "Hey there, Eco Warrior! 🌟 How can I help you with your environmental learning or green missions today?";
    }

    return "That's a fantastic environmental question! Environmental sustainability is all about making daily conscious choices to preserve natural resources for future generations.\n\nExplore our **Learn Page** modules or try a **Green Mission** to earn Eco Points!";
  };

  const handleSend = async (textToSend) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    try {
      // Try backend endpoint
      const res = await aiAPI.chat({ message: query });
      if (res.data && res.data.reply) {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ai',
            text: res.data.reply,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
      } else {
        throw new Error('No reply from server');
      }
    } catch {
      // Fallback response with artificial delay for realistic feel
      setTimeout(() => {
        const replyText = getSmartEcoReply(query);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            sender: 'ai',
            text: replyText,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        setIsTyping(false);
      }, 700);
      return;
    }

    setIsTyping(false);
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: "Chat cleared! How can I assist you with your green learning journey?",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto relative pb-20">
      {/* Page Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-eco-purple" /> AI Eco Mentor
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Personalized learning recommendations & AI Eco Analytics</p>
      </motion.div>

      {/* AI Notice */}
      <motion.div variants={item} className="p-4 rounded-xl bg-eco-purple/5 border border-eco-purple/20 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-eco-purple shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-eco-purple">AI-Powered Recommendations</p>
          <p className="text-xs text-muted-foreground mt-1">These recommendations are generated by analyzing your quiz performance, topic accuracy, lesson completion, and mission activity.</p>
        </div>
      </motion.div>

      {/* Personalized Learning Path & Topic Performance */}
      <motion.div variants={item} className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Bot className="w-5 h-5 text-eco-teal" /> Your Topic Performance Breakdown
        </h2>

        {rec.weakTopics.length > 0 && (
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wider text-destructive font-medium mb-2">Needs Improvement</p>
            <div className="space-y-2">
              {rec.weakTopics.map(t => <TopicStrength key={t.topic} {...t} />)}
            </div>
          </div>
        )}

        {rec.goodTopics.length > 0 && (
          <div className="mb-4">
            <p className="text-xs uppercase tracking-wider text-eco-amber font-medium mb-2">Good</p>
            <div className="space-y-2">
              {rec.goodTopics.map(t => <TopicStrength key={t.topic} {...t} />)}
            </div>
          </div>
        )}

        {rec.strongTopics.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wider text-eco-green font-medium mb-2">Strong</p>
            <div className="space-y-2">
              {rec.strongTopics.map(t => <TopicStrength key={t.topic} {...t} />)}
            </div>
          </div>
        )}
      </motion.div>

      {/* Recommended Lesson */}
      <motion.div variants={item} className="glass rounded-xl p-6 border-l-4 border-eco-blue">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-eco-blue/10 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6 text-eco-blue" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-eco-blue font-medium mb-1">Recommended Next Lesson</p>
            <h3 className="text-lg font-semibold">{rec.recommendedLesson.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">"{rec.recommendedLesson.reason}"</p>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="mt-3 px-5 py-2.5 rounded-xl gradient-primary text-white text-sm font-semibold flex items-center gap-2">
              Start Recommended Lesson <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Recommended Mission */}
      <motion.div variants={item} className="glass rounded-xl p-6 border-l-4 border-eco-green">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-xl bg-eco-green/10 flex items-center justify-center shrink-0">
            <Target className="w-6 h-6 text-eco-green" />
          </div>
          <div className="flex-1">
            <p className="text-xs text-eco-green font-medium mb-1">AI Recommendation</p>
            <h3 className="text-lg font-semibold">{rec.recommendedMission.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">"{rec.recommendedMission.reason}"</p>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="mt-3 px-5 py-2.5 rounded-xl bg-eco-green/10 text-eco-green text-sm font-semibold flex items-center gap-2 hover:bg-eco-green/20">
              Start Mission <ChevronRight className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      </motion.div>

      {/* Learning Style Insight */}
      <motion.div variants={item} className="glass rounded-xl p-5">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-eco-amber" /> Learning Style Analysis
        </h3>
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-secondary/50 text-center">
            <p className="text-2xl mb-1">📊</p>
            <p className="text-xs font-medium">Scenario-Based</p>
            <p className="text-xs text-eco-green mt-1">Best Performance</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 text-center">
            <p className="text-2xl mb-1">🎯</p>
            <p className="text-xs font-medium">Mission-Based</p>
            <p className="text-xs text-eco-amber mt-1">High Engagement</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary/50 text-center">
            <p className="text-2xl mb-1">📖</p>
            <p className="text-xs font-medium">Reading</p>
            <p className="text-xs text-muted-foreground mt-1">Moderate</p>
          </div>
        </div>
      </motion.div>

      {/* ========================================================================= */}
      {/* FLOATING CHATBOT WIDGET (BOTTOM RIGHT CORNER) */}
      {/* ========================================================================= */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
        {/* Floating Chat Modal Window */}
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="mb-4 w-[calc(100vw-2rem)] sm:w-[410px] h-[520px] glass border border-border rounded-2xl shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl bg-card/95"
            >
              {/* Chat Window Header */}
              <div className="p-3.5 border-b border-border bg-card/80 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-lg shadow-sm glow-green">
                      🤖
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-eco-green border-2 border-card rounded-full" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm leading-tight flex items-center gap-1.5">
                      AI Eco Mentor
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-eco-purple/15 text-eco-purple font-semibold">24/7</span>
                    </h3>
                    <p className="text-[11px] text-muted-foreground">Ask anything about environment & tips</p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={handleClearChat}
                    title="Clear Chat"
                    className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setChatOpen(false)}
                    title="Minimize Chatbot"
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg transition"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chat Feed */}
              <div className="flex-1 p-3.5 overflow-y-auto space-y-3.5 scrollbar-thin">
                {messages.map((msg) => {
                  const isUser = msg.sender === 'user';
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                    >
                      {!isUser && (
                        <div className="w-7 h-7 rounded-lg bg-eco-purple/20 flex items-center justify-center text-sm shrink-0 mt-0.5">
                          🤖
                        </div>
                      )}
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                          isUser
                            ? 'gradient-primary text-white rounded-tr-none shadow-md'
                            : 'glass border border-border text-foreground rounded-tl-none'
                        }`}
                      >
                        <FormattedMessage text={msg.text} isUser={isUser} />
                        <div
                          className={`text-[9px] mt-1 text-right ${
                            isUser ? 'text-white/70' : 'text-muted-foreground'
                          }`}
                        >
                          {msg.time}
                        </div>
                      </div>
                      {isUser && (
                        <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0 mt-0.5">
                          🌿
                        </div>
                      )}
                    </motion.div>
                  );
                })}

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-eco-purple/20 flex items-center justify-center text-sm shrink-0">
                      🤖
                    </div>
                    <div className="glass border border-border px-3 py-2 rounded-xl rounded-tl-none flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-eco-purple animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-eco-purple animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 rounded-full bg-eco-purple animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </motion.div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Prompt Suggestions */}
              <div className="px-3 py-1.5 bg-secondary/40 border-t border-border/50 flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
                <Lightbulb className="w-3 h-3 text-eco-amber shrink-0" />
                {QUICK_PROMPTS.map((p, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(p.text)}
                    className="px-2.5 py-0.5 rounded-full bg-secondary hover:bg-primary/10 border border-border hover:border-primary/30 text-[11px] font-medium whitespace-nowrap transition-all flex items-center gap-1"
                  >
                    <span>{p.icon}</span>
                    <span>{p.text}</span>
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="p-2.5 border-t border-border bg-card/80 flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Ask AI Eco Mentor..."
                  className="flex-1 bg-secondary border border-border rounded-xl px-3 py-2 text-xs outline-none focus:border-primary transition"
                />
                <button
                  onClick={() => handleSend()}
                  disabled={!input.trim()}
                  className={`p-2 rounded-xl gradient-primary text-white transition shadow-md flex items-center justify-center ${
                    !input.trim() ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 active:scale-95'
                  }`}
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Trigger Button matching design */}
        <motion.button
          whileHover={{ scale: 1.04, y: -2 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => setChatOpen(!chatOpen)}
          className="bg-[#22c55e] hover:bg-[#16a34a] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-3 border-b-4 border-[#15803d] active:border-b-0 active:translate-y-1 transition-all z-50 group font-bold tracking-wide"
        >
          <span className="text-2xl icon-3d">🤖</span>
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-white">
            {chatOpen ? 'CLOSE CHAT' : 'AI ECO MENTOR'}
          </span>
          <span className="w-3.5 h-3.5 bg-white rounded-full shadow-sm shrink-0 ml-1" />
        </motion.button>
      </div>
    </motion.div>
  );
}
