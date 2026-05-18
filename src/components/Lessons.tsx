import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  Play, 
  ChevronRight, 
  Lock, 
  X,
  Volume2,
  GraduationCap,
  Pencil,
  Trophy,
  Star,
  BookMarked,
  Sparkles,
} from "lucide-react";
import { speak } from "../lib/speech";
import { cn } from "../lib/utils";
import { api } from "../services/api";

// ─── Fill-in-the-blank types ───────────────────────────────────────────────
type FillQuestion = {
  sentence: string;   // use ___ as the blank
  options: string[];
  answer: string;
  hint?: string;      // optional Malayalam hint
};

type FillExercise = {
  tenseLabel: string;
  questions: FillQuestion[];
};

// ─── Pronunciation guide types ─────────────────────────────────────────────
type PronTerm = {
  word: string;       // display text
  ipa: string;        // IPA / phonetic spelling
  speakText: string;  // what to pass to speak()
  noteMl?: string;    // optional Malayalam tip
};

type PronunciationGuide = {
  formula: string;        // e.g. "Subject + verb+s/es"
  formulaMl: string;      // Malayalam translation of formula
  keyTerms: PronTerm[];
};

// ─── Pronunciation guide component ────────────────────────────────────────
function PronunciationPanel({ guide }: { guide: PronunciationGuide }) {
  const [open, setOpen] = useState(false);
  const [speaking, setSpeaking] = useState<string | null>(null);

  const handleSpeak = (term: PronTerm) => {
    setSpeaking(term.word);
    speak(term.speakText);
    setTimeout(() => setSpeaking(null), 2000);
  };

  return (
    <div className="w-full rounded-[2rem] border border-stone-200 bg-white overflow-hidden shadow-sm">
      {/* Header toggle */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-stone-50 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-violet-100 flex items-center justify-center shrink-0">
            <Volume2 className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Pronunciation Guide</p>
            <p className="text-sm font-semibold text-stone-900 font-mono">{guide.formula}</p>
          </div>
        </div>
        <motion.div animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronRight className="w-4 h-4 text-stone-400 rotate-90" />
        </motion.div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4 border-t border-stone-100">
              {/* Formula row */}
              <div className="pt-4 flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Formula:</span>
                <code className="px-3 py-1 rounded-lg bg-violet-50 text-violet-700 text-sm font-mono font-bold">
                  {guide.formula}
                </code>
                <span className="text-sm text-stone-400 italic">{guide.formulaMl}</span>
              </div>

              {/* Key terms grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {guide.keyTerms.map((term) => (
                  <div
                    key={term.word}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-stone-50 border border-stone-100"
                  >
                    <button
                      onClick={() => handleSpeak(term)}
                      className={cn(
                        "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all",
                        speaking === term.word
                          ? "bg-violet-600 text-white scale-110"
                          : "bg-white border border-stone-200 text-stone-600 hover:bg-violet-50 hover:border-violet-300 hover:text-violet-600"
                      )}
                      title={`Hear "${term.word}"`}
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <div className="min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-bold text-stone-900 text-sm">{term.word}</span>
                        <span className="text-xs text-violet-600 font-mono">{term.ipa}</span>
                      </div>
                      {term.noteMl && (
                        <p className="text-xs text-stone-400 truncate">{term.noteMl}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type LessonItem = {
  id: string;
  title: string;
  description: string;
  duration: string;
  completed: boolean;
  locked?: boolean;
};

const INITIAL_LESSONS: LessonItem[] = [
  // Module 1: Foundation
  { id: '1', title: 'Alphabet & Pronunciation', description: 'Master English sounds and common pronunciation mistakes.', duration: '10 min', completed: false },
  { id: '2', title: 'Basic Greetings', description: 'How to greet people naturally in daily situations.', duration: '8 min', completed: false },
  { id: '3', title: 'Introducing Yourself', description: 'Confidence in sharing your name, job, and background.', duration: '12 min', completed: false },
  { id: '4', title: 'Numbers & Time', description: 'Telling time, dates, and handling numbers.', duration: '10 min', completed: false },
  { id: '5', title: 'Sentence Structure (SVO)', description: 'The golden rule of English sentence building.', duration: '15 min', completed: false },

  // Module 2: Daily Life
  { id: '6', title: 'Home Conversations', description: 'Talking about daily chores and family life.', duration: '12 min', completed: false },
  { id: '7', title: 'School & College English', description: 'Essential classroom and campus phrases.', duration: '15 min', completed: false },
  { id: '8', title: 'Shopping English', description: 'Asking for prices and weights at the market.', duration: '10 min', completed: false },
  { id: '9', title: 'Travel & Survival', description: 'Bus, train, and taxi phrases for Kerala & beyond.', duration: '14 min', completed: false },
  { id: '10', title: 'Restaurant & Dining', description: 'Ordering food and paying the bill gracefully.', duration: '12 min', completed: false },
  { id: '11', title: 'Hospital & Emergency', description: 'Explaining symptoms and seeking help.', duration: '15 min', completed: false },

  // Module 4: Grammar
  { id: '12', title: 'Present Tenses', description: 'Master all 4 present forms with Malayalam support.', duration: '20 min', completed: false },
  { id: '13', title: 'Past Tenses', description: 'Master all 4 past forms with Malayalam support.', duration: '20 min', completed: false },
  { id: '14', title: 'Future Tenses', description: 'Master all 4 future forms with Malayalam support.', duration: '20 min', completed: false },
  { id: '15', title: 'Common Mistakes', description: 'Fix typical errors made by Malayalam speakers.', duration: '15 min', completed: false },
];

const CATEGORIES = ["All", "Foundation", "Daily Life", "Grammar"] as const;

export default function Lessons({ userData }: { userData: any }) {
  const [activeLesson, setActiveLesson] = useState<LessonItem | null>(null);
  const [filter, setFilter] = useState<typeof CATEGORIES[number]>("All");
  const [currentStep, setCurrentStep] = useState(0);

  const filteredLessons = filter === "All" 
    ? INITIAL_LESSONS 
    : INITIAL_LESSONS.filter(l => {
        const id = parseInt(l.id);
        if (filter === "Foundation") return id >= 1 && id <= 5;
        if (filter === "Daily Life") return id >= 6 && id <= 11;
        if (filter === "Grammar") return id >= 12 && id <= 15;
        return true;
      });

  const startLesson = (lesson: LessonItem) => {
    if (lesson.locked) return;
    setActiveLesson(lesson);
    setCurrentStep(0);
  };

  if (activeLesson) {
    return <LessonInterface lesson={activeLesson} onClose={() => setActiveLesson(null)} userData={userData} />;
  }

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-16">
      <header className="space-y-8 flex flex-col md:flex-row md:items-end md:justify-between gap-8">
        <div className="space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest">
              Exclusive Library
           </div>
           <h1 className="text-5xl md:text-7xl font-display font-medium tracking-tighter leading-[0.9]">Explore your<br /><span className="italic text-stone-400">Pathways.</span></h1>
           <p className="text-stone-500 text-lg max-w-md leading-relaxed">Immersive modules designed to bridge the gap between learning and fluency.</p>
        </div>
        
        <div className="flex gap-4">
           {CATEGORIES.map((cat) => (
             <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={cn(
                "px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all",
                filter === cat 
                  ? "bg-stone-900 text-white shadow-lg" 
                  : "bg-white border border-stone-200 text-stone-400 hover:text-stone-900"
              )}
             >
               {cat}
             </button>
           ))}
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLessons.map((lesson, idx) => (
          <button
            key={lesson.id}
            onClick={() => startLesson(lesson)}
            disabled={lesson.locked}
            className={cn(
              "group relative overflow-hidden p-8 rounded-[2.5rem] border transition-all flex flex-col gap-6 text-left",
              lesson.locked 
                ? "bg-stone-50 border-stone-100 opacity-60 cursor-not-allowed" 
                : "bg-white border-stone-200 hover:border-stone-900 shadow-sm hover:shadow-2xl hover:shadow-stone-200 hover:-translate-y-1 cursor-pointer"
            )}
          >
            <div className={cn(
              "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 mb-2",
              lesson.completed ? "bg-green-100 text-green-600" : 
              lesson.locked ? "bg-stone-200 text-stone-400" : "bg-stone-100 text-stone-900 group-hover:bg-stone-900 group-hover:text-white transition-all duration-300 transform group-hover:rotate-12"
            )}>
              {lesson.completed ? <CheckCircle2 className="w-7 h-7" /> : 
               lesson.locked ? <Lock className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                 <span className="text-[10px] font-mono font-bold text-stone-400 uppercase tracking-widest">{lesson.duration}</span>
                 {lesson.locked && <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">Locked</span>}
              </div>
              <h3 className="font-display font-bold text-2xl leading-tight group-hover:text-stone-900 transition-colors">{lesson.title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{lesson.description}</p>
            </div>

            <div className="mt-auto pt-6 border-t border-stone-100 flex items-center justify-between">
               <span className="text-xs font-bold text-stone-400 uppercase tracking-tighter">
                 {lesson.completed ? "Completed" : lesson.locked ? "Restricted" : "Resume Learning"}
               </span>
               <ChevronRight className={cn(
                 "w-5 h-5 transition-transform duration-300",
                 lesson.locked ? "text-stone-200" : "text-stone-300 group-hover:translate-x-2 group-hover:text-stone-900"
               )} />
            </div>

            {/* Subtle background number */}
            <span className="absolute -right-4 -bottom-8 text-[120px] font-display font-bold text-stone-100/50 group-hover:text-stone-900/5 transition-colors pointer-events-none">
              {idx + 1}
            </span>
          </button>
        ))}
      </section>

      <div className="p-12 rounded-[3.5rem] bg-stone-900 text-white overflow-hidden relative group">
         <div className="absolute top-0 right-0 w-96 h-96 bg-stone-800 rounded-full blur-[100px] -mr-48 -mt-48 transition-all group-hover:blur-[120px]" />
         
         <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1 space-y-6">
               <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
                  <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-stone-400">Live Workshop</h3>
               </div>
               <h2 className="text-4xl md:text-5xl font-display leading-[1.1]">Conversational Fluency Mastery.</h2>
               <p className="text-stone-400 text-lg max-w-lg leading-relaxed">Join a live interactive session with Nabu AI and other learners focusing on real-world survival English.</p>
               <div className="flex flex-wrap gap-4 pt-4">
                  <button className="px-8 py-4 bg-white text-stone-900 rounded-2xl font-bold hover:bg-stone-100 transition-all hover:scale-105">Pre-Register Now</button>
                  <button className="px-8 py-4 bg-transparent border border-stone-700 text-white rounded-2xl font-bold hover:bg-stone-800 transition-all">View Curriculum</button>
               </div>
            </div>
            <div className="w-full md:w-64 aspect-square bg-gradient-to-br from-stone-800 to-stone-900 rounded-[3rem] border border-stone-800 flex items-center justify-center p-8 group-hover:shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-all">
               <div className="w-full h-full border-2 border-dashed border-stone-700 rounded-[2rem] flex flex-col items-center justify-center text-stone-500 gap-4">
                  <GraduationCap className="w-12 h-12" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-center">Session<br />Reserved</span>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}

// ─── Fill-in-the-blank data ────────────────────────────────────────────────

const PRESENT_FILL_EXERCISES: FillExercise[] = [
  {
    tenseLabel: "Simple Present",
    questions: [
      { sentence: "She ___ to school every day.", options: ["go", "goes", "going", "went"], answer: "goes", hint: "He/She/It → verb + s" },
      { sentence: "Water ___ at 100°C.", options: ["boil", "boils", "boiled", "boiling"], answer: "boils", hint: "Scientific fact → Simple Present" },
      { sentence: "They ___ English at home.", options: ["speaks", "speak", "spoke", "speaking"], answer: "speak", hint: "They → base verb (no 's')" },
    ],
  },
  {
    tenseLabel: "Present Continuous",
    questions: [
      { sentence: "Look! It ___ raining outside.", options: ["is", "are", "was", "be"], answer: "is", hint: "It → is + verb-ing" },
      { sentence: "We ___ preparing for the exam.", options: ["is", "am", "are", "were"], answer: "are", hint: "We → are + verb-ing" },
      { sentence: "She ___ listening to music right now.", options: ["is", "are", "was", "has"], answer: "is", hint: "She → is + verb-ing" },
    ],
  },
  {
    tenseLabel: "Present Perfect",
    questions: [
      { sentence: "I ___ lost my keys.", options: ["have", "has", "had", "am"], answer: "have", hint: "I → have + past participle" },
      { sentence: "She ___ gone to Dubai.", options: ["have", "has", "had", "is"], answer: "has", hint: "She → has + past participle" },
      { sentence: "___ you seen this movie before?", options: ["Have", "Has", "Had", "Did"], answer: "Have", hint: "You → Have + subject + past participle?" },
    ],
  },
  {
    tenseLabel: "Present Perfect Continuous",
    questions: [
      { sentence: "It ___ been raining all day.", options: ["have", "has", "had", "is"], answer: "has", hint: "It → has been + verb-ing" },
      { sentence: "How long ___ you been waiting?", options: ["have", "has", "had", "are"], answer: "have", hint: "You → have been + verb-ing" },
      { sentence: "They ___ been arguing for hours.", options: ["have", "has", "had", "are"], answer: "have", hint: "They → have been + verb-ing" },
    ],
  },
];

const PAST_FILL_EXERCISES: FillExercise[] = [
  {
    tenseLabel: "Simple Past",
    questions: [
      { sentence: "She ___ Kochi yesterday.", options: ["visit", "visits", "visited", "visiting"], answer: "visited", hint: "Yesterday → Simple Past (verb + ed)" },
      { sentence: "They ___ a movie last night.", options: ["watch", "watches", "watched", "watching"], answer: "watched", hint: "Last night → Simple Past" },
      { sentence: "He ___ the ball perfectly.", options: ["catch", "catches", "caught", "catching"], answer: "caught", hint: "Irregular verb: catch → caught" },
    ],
  },
  {
    tenseLabel: "Past Continuous",
    questions: [
      { sentence: "I ___ eating when he called.", options: ["was", "were", "am", "is"], answer: "was", hint: "I → was + verb-ing" },
      { sentence: "They ___ playing in the rain.", options: ["was", "were", "are", "is"], answer: "were", hint: "They → were + verb-ing" },
      { sentence: "She ___ reading at 5 PM.", options: ["was", "were", "is", "has"], answer: "was", hint: "She → was + verb-ing" },
    ],
  },
  {
    tenseLabel: "Past Perfect",
    questions: [
      { sentence: "I ___ eaten before he arrived.", options: ["have", "has", "had", "was"], answer: "had", hint: "Action before another past action → had + past participle" },
      { sentence: "She ___ left when I reached.", options: ["have", "has", "had", "was"], answer: "had", hint: "She had already left → had + past participle" },
      { sentence: "The train ___ departed at 9.", options: ["have", "has", "had", "was"], answer: "had", hint: "Completed before another past event → had + past participle" },
    ],
  },
  {
    tenseLabel: "Past Perfect Continuous",
    questions: [
      { sentence: "I ___ been studying for an hour.", options: ["have", "has", "had", "was"], answer: "had", hint: "Duration in the past → had been + verb-ing" },
      { sentence: "She ___ been living here since 2010.", options: ["have", "has", "had", "was"], answer: "had", hint: "She had been living → had been + verb-ing" },
      { sentence: "They ___ been working all night.", options: ["have", "has", "had", "were"], answer: "had", hint: "They had been working → had been + verb-ing" },
    ],
  },
];

const FUTURE_FILL_EXERCISES: FillExercise[] = [
  {
    tenseLabel: "Simple Future",
    questions: [
      { sentence: "I ___ call you tonight.", options: ["will", "would", "shall", "am"], answer: "will", hint: "Future decision → will + base verb" },
      { sentence: "It ___ rain in the evening.", options: ["will", "would", "is", "was"], answer: "will", hint: "Future prediction → will + base verb" },
      { sentence: "They ___ win the match.", options: ["will", "would", "are", "were"], answer: "will", hint: "Future prediction → will + base verb" },
    ],
  },
  {
    tenseLabel: "Future Continuous",
    questions: [
      { sentence: "I ___ be eating at 8 PM.", options: ["will", "would", "am", "was"], answer: "will", hint: "Ongoing future action → will be + verb-ing" },
      { sentence: "She will be ___ for the test.", options: ["study", "studies", "studied", "studying"], answer: "studying", hint: "will be + verb-ing" },
      { sentence: "We will be ___ for you.", options: ["wait", "waits", "waited", "waiting"], answer: "waiting", hint: "will be + verb-ing" },
    ],
  },
  {
    tenseLabel: "Future Perfect",
    questions: [
      { sentence: "I will ___ finished the work by 5 PM.", options: ["have", "has", "had", "be"], answer: "have", hint: "Completed in future → will have + past participle" },
      { sentence: "They will have ___ before you.", options: ["arrive", "arrives", "arrived", "arriving"], answer: "arrived", hint: "will have + past participle" },
      { sentence: "She will have ___ next year.", options: ["graduate", "graduates", "graduated", "graduating"], answer: "graduated", hint: "will have + past participle" },
    ],
  },
  {
    tenseLabel: "Future Perfect Continuous",
    questions: [
      { sentence: "I will have been ___ for 3 hours.", options: ["study", "studies", "studied", "studying"], answer: "studying", hint: "Future duration → will have been + verb-ing" },
      { sentence: "She will have been ___ for a decade.", options: ["work", "works", "worked", "working"], answer: "working", hint: "will have been + verb-ing" },
      { sentence: "They will have been ___ till sunset.", options: ["play", "plays", "played", "playing"], answer: "playing", hint: "will have been + verb-ing" },
    ],
  },
];

// ─── Fill-in-the-blank exercise component ─────────────────────────────────

function FillExerciseStep({
  exercise,
  onComplete,
}: {
  exercise: FillExercise;
  onComplete: (correct: number, total: number) => void;
}) {
  const [qIndex, setQIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const q = exercise.questions[qIndex];
  const isCorrect = selected === q.answer;

  const handleConfirm = () => {
    if (!selected) return;
    setConfirmed(true);
    if (selected === q.answer) setScore((s) => s + 1);
  };

  const handleNext = () => {
    if (qIndex < exercise.questions.length - 1) {
      setQIndex((i) => i + 1);
      setSelected(null);
      setConfirmed(false);
    } else {
      setDone(true);
    }
  };

  const finalScore = done ? (isCorrect ? score : score) : score;

  if (done) {
    const total = exercise.questions.length;
    const correct = confirmed && isCorrect ? score : score;
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-8 py-8"
      >
        <div className={cn(
          "w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl",
          correct === total ? "bg-green-500" : correct >= Math.ceil(total / 2) ? "bg-amber-500" : "bg-red-400"
        )}>
          <Trophy className="w-12 h-12" />
        </div>
        <div className="space-y-2 text-center">
          <h3 className="text-4xl font-display font-medium">
            {correct === total ? "Perfect!" : correct >= Math.ceil(total / 2) ? "Good job!" : "Keep practising!"}
          </h3>
          <p className="text-stone-500 text-lg">
            You got <span className="font-bold text-stone-900">{correct}</span> out of <span className="font-bold text-stone-900">{total}</span> correct.
          </p>
        </div>
        <button
          onClick={() => onComplete(correct, total)}
          className="px-10 py-4 bg-stone-900 text-white rounded-[2rem] font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-lg"
        >
          Continue
        </button>
      </motion.div>
    );
  }

  // Build the display sentence with the blank highlighted
  const parts = q.sentence.split("___");

  return (
    <motion.div
      key={qIndex}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full space-y-8"
    >
      {/* Header */}
      <div className="space-y-2 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-stone-900 text-white text-[10px] font-bold uppercase tracking-widest">
          <Pencil className="w-3 h-3" /> Fill in the Blank · {exercise.tenseLabel}
        </div>
        <p className="text-xs text-stone-400 font-mono">
          Question {qIndex + 1} of {exercise.questions.length}
        </p>
      </div>

      {/* Sentence */}
      <div className="p-8 rounded-[2.5rem] bg-white border border-stone-200 shadow-xl shadow-stone-200/30 text-center">
        <p className="text-2xl md:text-3xl font-display leading-relaxed text-stone-900">
          {parts[0]}
          <span className={cn(
            "inline-block min-w-[120px] border-b-4 mx-2 px-3 font-bold transition-colors",
            !confirmed ? "border-stone-400 text-stone-400" :
            isCorrect ? "border-green-500 text-green-600" : "border-red-400 text-red-500"
          )}>
            {selected ?? "___"}
          </span>
          {parts[1]}
        </p>
        {q.hint && (
          <p className="mt-4 text-sm text-stone-400 italic">💡 {q.hint}</p>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-4">
        {q.options.map((opt) => {
          let style = "border-stone-200 text-stone-700 hover:border-stone-900 hover:bg-stone-50";
          if (confirmed) {
            if (opt === q.answer) style = "border-green-500 bg-green-50 text-green-700";
            else if (opt === selected) style = "border-red-400 bg-red-50 text-red-600";
            else style = "border-stone-100 text-stone-300 cursor-not-allowed";
          } else if (opt === selected) {
            style = "border-stone-900 bg-stone-900 text-white";
          }
          return (
            <button
              key={opt}
              disabled={confirmed}
              onClick={() => setSelected(opt)}
              className={cn(
                "px-6 py-4 rounded-2xl border-2 font-bold text-base transition-all",
                style
              )}
            >
              {opt}
            </button>
          );
        })}
      </div>

      {/* Feedback */}
      <AnimatePresence>
        {confirmed && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-4 rounded-2xl text-center font-bold text-base",
              isCorrect ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-600 border border-red-200"
            )}
          >
            {isCorrect ? "✅ Correct! Well done." : `❌ The correct answer is "${q.answer}".`}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Action button */}
      {!confirmed ? (
        <button
          disabled={!selected}
          onClick={handleConfirm}
          className={cn(
            "w-full py-4 rounded-[2rem] font-bold text-base transition-all",
            selected
              ? "bg-stone-900 text-white hover:scale-105 active:scale-95 shadow-lg"
              : "bg-stone-100 text-stone-300 cursor-not-allowed"
          )}
        >
          Check Answer
        </button>
      ) : (
        <button
          onClick={handleNext}
          className="w-full py-4 bg-stone-900 text-white rounded-[2rem] font-bold text-base hover:scale-105 active:scale-95 transition-all shadow-lg"
        >
          {qIndex < exercise.questions.length - 1 ? "Next Question →" : "See Results"}
        </button>
      )}
    </motion.div>
  );
}

// ─── Bonus vocabulary words per grammar lesson ────────────────────────────
const BONUS_VOCAB: Record<string, { word: string; ipa: string; meaning: string; example: string }[]> = {
  "present tenses": [
    { word: "habitually",   ipa: "/həˈbɪtʃuəli/",  meaning: "regularly, as a habit",          example: "She habitually wakes up at 6 AM." },
    { word: "currently",    ipa: "/ˈkʌrəntli/",    meaning: "at the present time",             example: "I am currently studying English." },
    { word: "recently",     ipa: "/ˈriːsəntli/",   meaning: "not long ago",                    example: "I have recently moved to Kochi." },
    { word: "duration",     ipa: "/djʊˈreɪʃən/",   meaning: "the length of time something lasts", example: "The duration of the class is 2 hours." },
  ],
  "past tenses": [
    { word: "previously",   ipa: "/ˈpriːviəsli/",  meaning: "at an earlier time",              example: "I had previously visited Dubai." },
    { word: "interrupted",  ipa: "/ˌɪntəˈrʌptɪd/", meaning: "stopped or broken mid-action",   example: "The call interrupted my meal." },
    { word: "prior",        ipa: "/ˈpraɪər/",      meaning: "before in time or order",         example: "Prior to the meeting, I had eaten." },
    { word: "elapsed",      ipa: "/ɪˈlæpst/",      meaning: "(of time) passed",                example: "Three hours had elapsed." },
  ],
  "future tenses": [
    { word: "eventually",   ipa: "/ɪˈventʃuəli/",  meaning: "at some later time",              example: "She will eventually learn to drive." },
    { word: "anticipate",   ipa: "/ænˈtɪsɪpeɪt/",  meaning: "expect or predict",               example: "I anticipate finishing by Friday." },
    { word: "forthcoming",  ipa: "/ˌfɔːθˈkʌmɪŋ/",  meaning: "about to happen",                 example: "The forthcoming exam will be tough." },
    { word: "imminent",     ipa: "/ˈɪmɪnənt/",     meaning: "about to happen very soon",       example: "Rain is imminent — take an umbrella." },
  ],
};

// ─── Confetti particle component ──────────────────────────────────────────
const CONFETTI_COLORS = [
  "#f59e0b", "#10b981", "#3b82f6", "#8b5cf6",
  "#ef4444", "#f97316", "#06b6d4", "#ec4899",
];

function ConfettiBlast() {
  const particles = useRef(
    Array.from({ length: 48 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1.8 + Math.random() * 1.2,
      color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
      size: 6 + Math.random() * 8,
      rotate: Math.random() * 360,
      drift: (Math.random() - 0.5) * 120,
    }))
  ).current;

  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50" aria-hidden>
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: -20, x: `${p.x}vw`, opacity: 1, rotate: p.rotate, scale: 1 }}
          animate={{ y: "110vh", x: `calc(${p.x}vw + ${p.drift}px)`, opacity: 0, rotate: p.rotate + 360, scale: 0.4 }}
          transition={{ duration: p.duration, delay: p.delay, ease: "easeIn" }}
          style={{
            position: "fixed",
            top: 0,
            width: p.size,
            height: p.size * 0.5,
            borderRadius: 2,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}

// ─── Reward summary screen ─────────────────────────────────────────────────
type RewardSummaryProps = {
  lesson: LessonItem;
  fillScores: { correct: number; total: number }[];
  fillExercises: FillExercise[];
  userData: any;
  onClose: () => void;
};

function RewardSummary({ lesson, fillScores, fillExercises, userData, onClose }: RewardSummaryProps) {
  const totalCorrect = fillScores.reduce((a, s) => a + s.correct, 0);
  const totalQ       = fillScores.reduce((a, s) => a + s.total, 0);
  const overallPct   = Math.round((totalCorrect / Math.max(1, totalQ)) * 100);
  const xpGained     = totalCorrect * 10 + (overallPct === 100 ? 25 : 0); // bonus 25 XP for perfect

  // Pick a bonus vocab word based on lesson title
  const titleKey = Object.keys(BONUS_VOCAB).find((k) =>
    lesson.title.toLowerCase().includes(k)
  );
  const vocabPool = titleKey ? BONUS_VOCAB[titleKey] : [];
  const bonusWord = vocabPool[Math.floor(Math.random() * vocabPool.length)];

  // Save progress + add bonus word to vocabulary on mount
  useEffect(() => {
    if (userData?.id) {
      api.saveProgress(userData.id, lesson.id, overallPct, xpGained).catch(() => {});
      if (bonusWord) {
        api.reviewVocabulary(userData.id, bonusWord.word, true).catch(() => {});
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const isPerfect = overallPct === 100;

  return (
    <>
      {/* Confetti only on perfect or high score */}
      {overallPct >= 70 && <ConfettiBlast />}

      <motion.div
        key="reward-summary"
        initial={{ opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="w-full space-y-8"
      >
        {/* Trophy + headline */}
        <div className="flex flex-col items-center gap-4">
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
            className={cn(
              "w-28 h-28 rounded-full flex items-center justify-center shadow-2xl",
              isPerfect
                ? "bg-gradient-to-br from-amber-400 to-orange-500"
                : overallPct >= 70
                ? "bg-gradient-to-br from-emerald-400 to-teal-500"
                : "bg-gradient-to-br from-stone-400 to-stone-600"
            )}
          >
            <Trophy className="w-14 h-14 text-white drop-shadow-lg" />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="text-center space-y-1"
          >
            <h2 className="text-5xl font-display font-medium">
              {isPerfect ? "Perfect!" : overallPct >= 70 ? "Well done!" : "Keep going!"}
            </h2>
            <p className="text-stone-500 text-lg">
              {lesson.title} complete
              {isPerfect && " · Bonus +25 XP 🎉"}
            </p>
          </motion.div>
        </div>

        {/* Per-tense score grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="grid grid-cols-2 gap-3 w-full"
        >
          {fillScores.map((s, i) => {
            const pct = Math.round((s.correct / s.total) * 100);
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + i * 0.07 }}
                className={cn(
                  "p-5 rounded-[1.75rem] border text-left space-y-1",
                  pct === 100 ? "bg-green-50 border-green-200" :
                  pct >= 50  ? "bg-amber-50 border-amber-200"  : "bg-red-50 border-red-200"
                )}
              >
                <p className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                  {fillExercises[i]?.tenseLabel ?? `Tense ${i + 1}`}
                </p>
                <p className="text-3xl font-display font-bold text-stone-900">{pct}%</p>
                <p className="text-xs text-stone-500">{s.correct}/{s.total} correct</p>
              </motion.div>
            );
          })}
        </motion.div>

        {/* XP + overall stats */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="grid grid-cols-2 gap-4"
        >
          <div className="p-6 rounded-2xl bg-stone-900 text-white flex flex-col gap-1">
            <div className="flex items-center gap-2 text-stone-400 text-[10px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5" /> XP Gained
            </div>
            <div className="text-3xl font-display font-bold">+{xpGained}</div>
          </div>
          <div className="p-6 rounded-2xl bg-stone-100 border border-stone-200 flex flex-col gap-1">
            <div className="flex items-center gap-2 text-stone-400 text-[10px] font-bold uppercase tracking-widest">
              <Star className="w-3.5 h-3.5" /> Overall
            </div>
            <div className="text-3xl font-display font-bold text-stone-900">{overallPct}%</div>
          </div>
        </motion.div>

        {/* Bonus vocabulary word */}
        {bonusWord && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="w-full p-6 rounded-[2rem] bg-violet-50 border border-violet-200 space-y-3"
          >
            <div className="flex items-center gap-2">
              <BookMarked className="w-4 h-4 text-violet-600" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-violet-500">
                Bonus Word Added to Vault
              </span>
            </div>
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-display font-bold text-stone-900">{bonusWord.word}</span>
                  <span className="text-sm font-mono text-violet-600">{bonusWord.ipa}</span>
                  <button
                    onClick={() => speak(bonusWord.word)}
                    className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center text-violet-600 hover:bg-violet-200 transition-colors"
                    title="Hear pronunciation"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-sm text-stone-500">{bonusWord.meaning}</p>
                <p className="text-sm text-stone-700 italic">"{bonusWord.example}"</p>
              </div>
            </div>
          </motion.div>
        )}

        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          onClick={onClose}
          className="w-full py-5 bg-stone-900 text-white rounded-[2rem] font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-stone-200"
        >
          Finish Pathway ✓
        </motion.button>
      </motion.div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────

function LessonInterface({ lesson, onClose, userData }: { lesson: LessonItem, onClose: () => void, userData: any }) {
  const [step, setStep] = useState(0);
  // For grammar lessons: track which fill exercise we're on and scores
  const [fillIndex, setFillIndex] = useState(0);
  const [fillScores, setFillScores] = useState<{ correct: number; total: number }[]>([]);
  const [showingFill, setShowingFill] = useState(false);
  
  const presentTenses = [
    { 
      name: "Simple Present", 
      nameMl: "സാധാരണ വർത്തമാന കാലം",
      pronunciation: {
        formula: "Subject + V1 (he/she/it → V1+s)",
        formulaMl: "കർത്താവ് + ക്രിയ (he/she/it → ക്രിയ+s)",
        keyTerms: [
          { word: "speak", ipa: "/spiːk/", speakText: "speak", noteMl: "സ്പീക്ക് — 'ea' = ഈ ശബ്ദം" },
          { word: "speaks", ipa: "/spiːks/", speakText: "speaks", noteMl: "He/She/It → speaks" },
          { word: "arrives", ipa: "/əˈraɪvz/", speakText: "arrives", noteMl: "അറൈവ്സ് — 'es' = z ശബ്ദം" },
          { word: "boils", ipa: "/bɔɪlz/", speakText: "boils", noteMl: "ബോയിൽസ് — 'oi' = ഒയ്" },
          { word: "goes", ipa: "/ɡəʊz/", speakText: "goes", noteMl: "ഗോസ് — go → goes (irregular)" },
        ],
      } as PronunciationGuide,
      examples: [
        { en: "They speak English.", ml: "അവർ ഇംഗ്ലീഷ് സംസാരിക്കുന്നു." },
        { en: "The train arrives at 10.", ml: "ട്രെയിൻ 10 മണിക്ക് എത്തുന്നു." },
        { en: "I love reading books.", ml: "എനിക്ക് പുസ്തകങ്ങൾ വായിക്കാൻ ഇഷ്ടമാണ്." },
        { en: "Water boils at 100°C.", ml: "വെള്ളം 100 ഡിഗ്രിയിൽ തിളയ്ക്കുന്നു." },
        { en: "He goes to church on Sundays.", ml: "അവൻ ഞായറാഴ്ചകളിൽ പള്ളിയിൽ പോകുന്നു." }
      ],
      use: "Repeatitive actions", 
      useMl: "ആവർത്തിച്ചു നടക്കുന്ന കാര്യങ്ങൾ",
      color: "bg-green-500" 
    },
    { 
      name: "Present Continuous", 
      nameMl: "തുടരുന്ന വർത്തമാന കാലം",
      pronunciation: {
        formula: "Subject + am/is/are + V-ing",
        formulaMl: "കർത്താവ് + am/is/are + ക്രിയ-ing",
        keyTerms: [
          { word: "is raining", ipa: "/ɪz ˈreɪnɪŋ/", speakText: "is raining", noteMl: "ഇസ് റെയ്നിംഗ് — It → is" },
          { word: "are dancing", ipa: "/ɑː ˈdɑːnsɪŋ/", speakText: "are dancing", noteMl: "ആർ ഡാൻസിംഗ് — They → are" },
          { word: "am preparing", ipa: "/æm prɪˈpeərɪŋ/", speakText: "am preparing", noteMl: "ആം പ്രിപ്പേറിംഗ് — I → am" },
          { word: "listening", ipa: "/ˈlɪsənɪŋ/", speakText: "listening", noteMl: "ലിസ്സനിംഗ് — 't' silent" },
          { word: "moving", ipa: "/ˈmuːvɪŋ/", speakText: "moving", noteMl: "മൂവിംഗ് — drop 'e', add -ing" },
        ],
      } as PronunciationGuide,
      examples: [
        { en: "Look! It is raining.", ml: "നോക്കൂ! മഴ പെയ്യുകയാണ്." },
        { en: "They are dancing.", ml: "അവർ നൃത്തം ചെയ്യുകയാണ്." },
        { en: "I am preparing for a test.", ml: "ഞാൻ ടെസ്റ്റിന് തയ്യാറെടുക്കുകയാണ്." },
        { en: "Is she listening?", ml: "അവൾ ശ്രദ്ധിക്കുന്നുണ്ടോ?" },
        { en: "We are moving to a new house.", ml: "ഞങ്ങൾ പുതിയ വീട്ടിലേക്ക് മാറുകയാണ്." }
      ],
      use: "Temporary actions", 
      useMl: "താല്ക്കാലിക പ്രവർത്തികൾ",
      color: "bg-green-500" 
    },
    { 
      name: "Present Perfect", 
      nameMl: "സമ്പൂർണ്ണ വർത്തമാന കാലം",
      pronunciation: {
        formula: "Subject + have/has + V3 (past participle)",
        formulaMl: "കർത്താവ് + have/has + ക്രിയയുടെ മൂന്നാം രൂപം",
        keyTerms: [
          { word: "have lost", ipa: "/hæv lɒst/", speakText: "have lost", noteMl: "ഹാവ് ലോസ്റ്റ് — lose → lost (irregular)" },
          { word: "has gone", ipa: "/hæz ɡɒn/", speakText: "has gone", noteMl: "ഹാസ് ഗോൺ — go → gone (irregular)" },
          { word: "have bought", ipa: "/hæv bɔːt/", speakText: "have bought", noteMl: "ഹാവ് ബോട്ട് — buy → bought" },
          { word: "has broken", ipa: "/hæz ˈbrəʊkən/", speakText: "has broken", noteMl: "ഹാസ് ബ്രോക്കൺ — break → broken" },
          { word: "Have you seen", ipa: "/hæv juː siːn/", speakText: "Have you seen", noteMl: "ചോദ്യം: Have + subject + V3?" },
        ],
      } as PronunciationGuide,
      examples: [
        { en: "I have lost my keys.", ml: "എനിക്ക് താക്കോൽ നഷ്ടപ്പെട്ടു." },
        { en: "Have you seen this movie?", ml: "നീ ഈ സിനിമ കണ്ടിട്ടുണ്ടോ?" },
        { en: "She has gone to Dubai.", ml: "അവൾ ദുബായിലേക്ക് പോയി." },
        { en: "We have bought a car.", ml: "ഞങ്ങൾ ഒരു കാർ വാങ്ങി." },
        { en: "He has broken his leg.", ml: "അവന്റെ കാൽ ഒടിഞ്ഞു." }
      ],
      use: "Life experiences", 
      useMl: "ജീവിതാനുഭവങ്ങൾ",
      color: "bg-green-500" 
    },
    { 
      name: "Present Perfect Continuous", 
      nameMl: "തുടർച്ചയായ സമ്പൂർണ്ണ വർത്തമാന കാലം",
      pronunciation: {
        formula: "Subject + have/has + been + V-ing",
        formulaMl: "കർത്താവ് + have/has + been + ക്രിയ-ing",
        keyTerms: [
          { word: "has been raining", ipa: "/hæz bɪn ˈreɪnɪŋ/", speakText: "has been raining", noteMl: "ഹാസ് ബിൻ റെയ്നിംഗ്" },
          { word: "have been waiting", ipa: "/hæv bɪn ˈweɪtɪŋ/", speakText: "have been waiting", noteMl: "ഹാവ് ബിൻ വെയ്റ്റിംഗ്" },
          { word: "have been staying", ipa: "/hæv bɪn ˈsteɪɪŋ/", speakText: "have been staying", noteMl: "ഹാവ് ബിൻ സ്റ്റേയിംഗ്" },
          { word: "since", ipa: "/sɪns/", speakText: "since June", noteMl: "സിൻസ് — ഒരു നിശ്ചിത സമയം മുതൽ" },
          { word: "for", ipa: "/fɔː/", speakText: "for hours", noteMl: "ഫോർ — ഒരു കാലയളവ്" },
        ],
      } as PronunciationGuide,
      examples: [
        { en: "It has been raining all day.", ml: "ദിവസം മുഴുവൻ മഴ പെയ്യുകയായിരുന്നു." },
        { en: "How long have you been waiting?", ml: "നീ എത്ര നേരമായി കാത്തിരിക്കുന്നു?" },
        { en: "I have been staying here since June.", ml: "ജൂൺ മുതൽ ഞാൻ ഇവിടെയാണ്." },
        { en: "They have been arguing for hours.", ml: "മണിക്കൂറുകളായി അവർ തർക്കത്തിലാണ്." },
        { en: "He has been sleeping since noon.", ml: "ഉച്ച മുതൽ അവൻ ഉറങ്ങുകയാണ്." }
      ],
      use: "Duration of action", 
      useMl: "സമയ ദൈർഘ്യം സൂചിപ്പിക്കാൻ",
      color: "bg-green-500" 
    }
  ];

  const pastTenses = [
    { 
      name: "Simple Past", 
      nameMl: "ഭൂതകാലം",
      pronunciation: {
        formula: "Subject + V2 (past form)",
        formulaMl: "കർത്താവ് + ക്രിയയുടെ രണ്ടാം രൂപം",
        keyTerms: [
          { word: "ate", ipa: "/eɪt/", speakText: "ate", noteMl: "എയ്റ്റ് — eat → ate (irregular)" },
          { word: "visited", ipa: "/ˈvɪzɪtɪd/", speakText: "visited", noteMl: "വിസിറ്റഡ് — regular: +ed" },
          { word: "watched", ipa: "/wɒtʃt/", speakText: "watched", noteMl: "വോച്ട് — -ed = t ശബ്ദം" },
          { word: "caught", ipa: "/kɔːt/", speakText: "caught", noteMl: "കോട്ട് — catch → caught (irregular)" },
          { word: "finished", ipa: "/ˈfɪnɪʃt/", speakText: "finished", noteMl: "ഫിനിഷ്ട് — -ed = t ശബ്ദം" },
        ],
      } as PronunciationGuide,
      examples: [
        { en: "I ate dinner at 8 PM.", ml: "ഞാൻ രാത്രി 8 മണിക്ക് ഭക്ഷണം കഴിച്ചു." },
        { en: "She visited Kochi yesterday.", ml: "അവൾ ഇന്നലെ കൊച്ചി സന്ദർശിച്ചു." },
        { en: "They watched a movie last night.", ml: "അവർ ഇന്നലെ രാത്രി സിനിമ കണ്ടു." },
        { en: "He caught the ball.", ml: "അവൻ പന്ത് പിടിച്ചു." },
        { en: "We finished the project on time.", ml: "ഞങ്ങൾ കൃത്യസമയത്ത് പ്രോജക്റ്റ് പൂർത്തിയാക്കി." }
      ],
      use: "Completed actions", 
      useMl: "കഴിഞ്ഞുപോയ കാര്യങ്ങൾ",
      color: "bg-blue-500" 
    },
    { 
      name: "Past Continuous", 
      nameMl: "തുടരുന്ന ഭൂതകാലം",
      pronunciation: {
        formula: "Subject + was/were + V-ing",
        formulaMl: "കർത്താവ് + was/were + ക്രിയ-ing",
        keyTerms: [
          { word: "was eating", ipa: "/wɒz ˈiːtɪŋ/", speakText: "was eating", noteMl: "വോസ് ഈറ്റിംഗ് — I/He/She/It → was" },
          { word: "were playing", ipa: "/wɜː ˈpleɪɪŋ/", speakText: "were playing", noteMl: "വേർ പ്ലേയിംഗ് — They/We/You → were" },
          { word: "was reading", ipa: "/wɒz ˈriːdɪŋ/", speakText: "was reading", noteMl: "വോസ് റീഡിംഗ്" },
          { word: "getting", ipa: "/ˈɡetɪŋ/", speakText: "getting", noteMl: "ഗെറ്റിംഗ് — double 't' before -ing" },
          { word: "waiting", ipa: "/ˈweɪtɪŋ/", speakText: "waiting", noteMl: "വെയ്റ്റിംഗ്" },
        ],
      } as PronunciationGuide,
      examples: [
        { en: "I was eating when he called.", ml: "അവൻ വിളിക്കുമ്പോൾ ഞാൻ ഭക്ഷണം കഴിക്കുകയായിരുന്നു." },
        { en: "She was reading at 5 PM.", ml: "അവൾ 5 മണിക്ക് വായിക്കുകയായിരുന്നു." },
        { en: "They were playing in the rain.", ml: "മഴ പെയ്യുമ്പോൾ അവർ കളിക്കുകയായിരുന്നു." },
        { en: "It was getting dark.", ml: "ഇരുട്ടായി വരികയായിരുന്നു." },
        { en: "We were waiting for the bus.", ml: "ഞങ്ങൾ ബസ്സിനായി കാത്തിരിക്കുകയായിരുന്നു." }
      ],
      use: "Ongoing past actions", 
      useMl: "ഭൂതകാലത്ത് നടന്നുകൊണ്ടിരുന്നത്",
      color: "bg-blue-500" 
    },
    { 
      name: "Past Perfect", 
      nameMl: "സമ്പൂർണ്ണ ഭൂതകാലം",
      pronunciation: {
        formula: "Subject + had + V3 (past participle)",
        formulaMl: "കർത്താവ് + had + ക്രിയയുടെ മൂന്നാം രൂപം",
        keyTerms: [
          { word: "had eaten", ipa: "/hæd ˈiːtən/", speakText: "had eaten", noteMl: "ഹാഡ് ഈറ്റൺ — eat → eaten" },
          { word: "had left", ipa: "/hæd left/", speakText: "had left", noteMl: "ഹാഡ് ലെഫ്റ്റ് — leave → left" },
          { word: "had seen", ipa: "/hæd siːn/", speakText: "had seen", noteMl: "ഹാഡ് സീൻ — see → seen" },
          { word: "had departed", ipa: "/hæd dɪˈpɑːtɪd/", speakText: "had departed", noteMl: "ഹാഡ് ഡിപ്പാർട്ടഡ്" },
          { word: "by then", ipa: "/baɪ ðen/", speakText: "by then", noteMl: "ബൈ ദെൻ — ആ സമയത്തിന് മുമ്പ്" },
        ],
      } as PronunciationGuide,
      examples: [
        { en: "I had eaten before he arrived.", ml: "അവൻ എത്തുന്നതിന് മുമ്പ് ഞാൻ ഭക്ഷണം കഴിച്ചിരുന്നു." },
        { en: "She had left when I reached.", ml: "ഞാൻ എത്തുമ്പോൾ അവൾ പോയിരുന്നു." },
        { en: "We had already seen the film.", ml: "ഞങ്ങൾ നേരത്തെ തന്നെ ആ സിനിമ കണ്ടിരുന്നു." },
        { en: "The train had departed at 9.", ml: "9 മണിക്ക് ട്രെയിൻ പുറപ്പെട്ടിരുന്നു." },
        { en: "They had finished the game by then.", ml: "അപ്പോഴേക്കും അവർ കളി തീർത്തിരുന്നു." }
      ],
      use: "Action before another past action", 
      useMl: "മറ്റൊരു കാര്യത്തിന് മുമ്പ് നടന്നത്",
      color: "bg-blue-500" 
    },
    { 
      name: "Past Perfect Continuous", 
      nameMl: "തുടർച്ചയായ സമ്പൂർണ്ണ ഭൂതകാലം",
      pronunciation: {
        formula: "Subject + had + been + V-ing",
        formulaMl: "കർത്താവ് + had + been + ക്രിയ-ing",
        keyTerms: [
          { word: "had been studying", ipa: "/hæd bɪn ˈstʌdɪɪŋ/", speakText: "had been studying", noteMl: "ഹാഡ് ബിൻ സ്റ്റഡിയിംഗ്" },
          { word: "had been living", ipa: "/hæd bɪn ˈlɪvɪŋ/", speakText: "had been living", noteMl: "ഹാഡ് ബിൻ ലിവിംഗ്" },
          { word: "had been working", ipa: "/hæd bɪn ˈwɜːkɪŋ/", speakText: "had been working", noteMl: "ഹാഡ് ബിൻ വർക്കിംഗ്" },
          { word: "since 2010", ipa: "/sɪns tuː ˈθaʊzənd ænd ten/", speakText: "since two thousand and ten", noteMl: "2010 മുതൽ" },
          { word: "all night", ipa: "/ɔːl naɪt/", speakText: "all night", noteMl: "ഓൾ നൈറ്റ് — രാത്രി മുഴുവൻ" },
        ],
      } as PronunciationGuide,
      examples: [
        { en: "I had been studying for an hour.", ml: "ഞാൻ ഒരു മണിക്കൂറായി പഠിച്ചുകൊണ്ടിരിക്കുകയായിരുന്നു." },
        { en: "She had been living here since 2010.", ml: "അവൾ 2010 മുതൽ ഇവിടെ താമസിക്കുകയായിരുന്നു." },
        { en: "They had been working all night.", ml: "അവർ രാത്രി മുഴുവൻ ജോലി ചെയ്യുകയായിരുന്നു." },
        { en: "We had been waiting for the news.", ml: "ഞങ്ങൾ വാർത്തയ്ക്കായി കാത്തിരിക്കുകയായിരുന്നു." },
        { en: "It had been snowing for days.", ml: "ദിവസങ്ങളായി മഞ്ഞുവീഴ്ച ഉണ്ടായിരുന്നു." }
      ],
      use: "Duration in the past", 
      useMl: "ഭൂതകാലത്തെ സമയ ദൈർഘ്യം",
      color: "bg-blue-500" 
    }
  ];

  const futureTenses = [
    { 
      name: "Simple Future", 
      nameMl: "ഭാവികാലം",
      pronunciation: {
        formula: "Subject + will + V1 (base verb)",
        formulaMl: "കർത്താവ് + will + ക്രിയയുടെ ആദ്യ രൂപം",
        keyTerms: [
          { word: "will eat", ipa: "/wɪl iːt/", speakText: "will eat", noteMl: "വിൽ ഈറ്റ് — will + base verb" },
          { word: "will visit", ipa: "/wɪl ˈvɪzɪt/", speakText: "will visit", noteMl: "വിൽ വിസിറ്റ്" },
          { word: "will win", ipa: "/wɪl wɪn/", speakText: "will win", noteMl: "വിൽ വിൻ" },
          { word: "will call", ipa: "/wɪl kɔːl/", speakText: "will call", noteMl: "വിൽ കോൾ — 'll = will (short form)" },
          { word: "will rain", ipa: "/wɪl reɪn/", speakText: "will rain", noteMl: "വിൽ റെയ്ൻ — prediction" },
        ],
      } as PronunciationGuide,
      examples: [
        { en: "I will eat later.", ml: "ഞാൻ പിന്നീട് ഭക്ഷണം കഴിക്കും." },
        { en: "She will visit tomorrow.", ml: "അവൾ നാളെ സന്ദർിക്കും." },
        { en: "They will win the match.", ml: "അവർ കളി ജയിക്കും." },
        { en: "I will call you tonight.", ml: "ഞാൻ ഇന്ന് രാത്രി നിന്നെ വിളിക്കാം." },
        { en: "It will rain in the evening.", ml: "വൈകുന്നേരം മഴ പെയ്യും." }
      ],
      use: "Future predictions/decisions", 
      useMl: "ഭാവിയിലെ തീരുമാനങ്ങൾ",
      color: "bg-red-500" 
    },
    { 
      name: "Future Continuous", 
      nameMl: "തുടരുന്ന ഭാവികാലം",
      pronunciation: {
        formula: "Subject + will be + V-ing",
        formulaMl: "കർത്താവ് + will be + ക്രിയ-ing",
        keyTerms: [
          { word: "will be eating", ipa: "/wɪl biː ˈiːtɪŋ/", speakText: "will be eating", noteMl: "വിൽ ബി ഈറ്റിംഗ്" },
          { word: "will be studying", ipa: "/wɪl biː ˈstʌdɪɪŋ/", speakText: "will be studying", noteMl: "വിൽ ബി സ്റ്റഡിയിംഗ്" },
          { word: "will be traveling", ipa: "/wɪl biː ˈtrævəlɪŋ/", speakText: "will be traveling", noteMl: "വിൽ ബി ട്രാവലിംഗ്" },
          { word: "will be waiting", ipa: "/wɪl biː ˈweɪtɪŋ/", speakText: "will be waiting", noteMl: "വിൽ ബി വെയ്റ്റിംഗ്" },
          { word: "will be working", ipa: "/wɪl biː ˈwɜːkɪŋ/", speakText: "will be working", noteMl: "വിൽ ബി വർക്കിംഗ്" },
        ],
      } as PronunciationGuide,
      examples: [
        { en: "I will be eating at 8 PM.", ml: "ഞാൻ രാത്രി 8 മണിക്ക് ഭക്ഷണം കഴിച്ചുകൊണ്ടിരിക്കും." },
        { en: "She will be studying for the test.", ml: "അവൾ ടെസ്റ്റിനായി പഠിച്ചുകൊണ്ടിരിക്കും." },
        { en: "They will be traveling to London.", ml: "അവർ ലണ്ടനിലേക്ക് യാത്ര ചെയ്യുന്നതായിരിക്കും." },
        { en: "We will be waiting for you.", ml: "ഞങ്ങൾ നിനക്കായി കാത്തിരിക്കും." },
        { en: "He will be working tomorrow.", ml: "അവൻ നാളെ ജോലി ചെയ്യുകയായിരിക്കും." }
      ],
      use: "Ongoing future action", 
      useMl: "ഭാവിയിൽ നടക്കാനിരിക്കുന്നത്",
      color: "bg-red-500" 
    },
    { 
      name: "Future Perfect", 
      nameMl: "സമ്പൂർണ്ണ ഭാവികാലം",
      pronunciation: {
        formula: "Subject + will have + V3 (past participle)",
        formulaMl: "കർത്താവ് + will have + ക്രിയയുടെ മൂന്നാം രൂപം",
        keyTerms: [
          { word: "will have finished", ipa: "/wɪl hæv ˈfɪnɪʃt/", speakText: "will have finished", noteMl: "വിൽ ഹാവ് ഫിനിഷ്ട്" },
          { word: "will have graduated", ipa: "/wɪl hæv ˈɡrædʒueɪtɪd/", speakText: "will have graduated", noteMl: "വിൽ ഹാവ് ഗ്രാജ്വേറ്റഡ്" },
          { word: "will have arrived", ipa: "/wɪl hæv əˈraɪvd/", speakText: "will have arrived", noteMl: "വിൽ ഹാവ് അറൈവ്ഡ്" },
          { word: "by 5 PM", ipa: "/baɪ faɪv piː em/", speakText: "by five PM", noteMl: "ബൈ ഫൈവ് — ഒരു സമയത്തിന് മുമ്പ്" },
          { word: "will have saved", ipa: "/wɪl hæv seɪvd/", speakText: "will have saved", noteMl: "വിൽ ഹാവ് സേവ്ഡ്" },
        ],
      } as PronunciationGuide,
      examples: [
        { en: "I will have finished the work by 5 PM.", ml: "ഞാൻ 5 മണിക്ക് മുമ്പ് ജോലി പൂർത്തിയാക്കിയിരിക്കും." },
        { en: "She will have graduated next year.", ml: "അവൾ അടുത്ത വർഷം ബിരുദം നേടും." },
        { en: "They will have arrived before you.", ml: "നിനക്ക് മുമ്പ് അവർ എത്തിച്ചേരും." },
        { en: "We will have painted the house.", ml: "ഞങ്ങൾ വീട് പെയിന്റ് ചെയ്തിരിക്കും." },
        { en: "He will have saved enough money.", ml: "അവൻ ആവശ്യത്തിന് പണം സമ്പാദിച്ചിരിക്കും." }
      ],
      use: "Completed in future", 
      useMl: "ഭാവിയിലെ ഒരു സമയത്തിന് മുമ്പ് തീരുന്നത്",
      color: "bg-red-500" 
    },
    { 
      name: "Future Perfect Continuous", 
      nameMl: "തുടർച്ചയായ സമ്പൂർണ്ണ ഭാവികാലം",
      pronunciation: {
        formula: "Subject + will have been + V-ing",
        formulaMl: "കർത്താവ് + will have been + ക്രിയ-ing",
        keyTerms: [
          { word: "will have been studying", ipa: "/wɪl hæv bɪn ˈstʌdɪɪŋ/", speakText: "will have been studying", noteMl: "വിൽ ഹാവ് ബിൻ സ്റ്റഡിയിംഗ്" },
          { word: "will have been working", ipa: "/wɪl hæv bɪn ˈwɜːkɪŋ/", speakText: "will have been working", noteMl: "വിൽ ഹാവ് ബിൻ വർക്കിംഗ്" },
          { word: "will have been playing", ipa: "/wɪl hæv bɪn ˈpleɪɪŋ/", speakText: "will have been playing", noteMl: "വിൽ ഹാവ് ബിൻ പ്ലേയിംഗ്" },
          { word: "for a decade", ipa: "/fɔː ə ˈdekeɪd/", speakText: "for a decade", noteMl: "ഫോർ എ ഡെക്കേഡ് — 10 വർഷം" },
          { word: "till sunset", ipa: "/tɪl ˈsʌnset/", speakText: "till sunset", noteMl: "ടിൽ സൺസെറ്റ് — സൂര്യാസ്തമയം വരെ" },
        ],
      } as PronunciationGuide,
      examples: [
        { en: "I will have been studying for 3 hours.", ml: "ഞാൻ 3 മണിക്കൂർ പഠിച്ചുകൊണ്ടിരിക്കും." },
        { en: "She will have been working for a decade.", ml: "അവൾ പത്ത് വർഷമായി ജോലി ചെയ്തുകൊണ്ടിരിക്കും." },
        { en: "They will have been playing till sunset.", ml: "സൂര്യാസ്തമയം വരെ അവർ കളിച്ചുകൊണ്ടിരിക്കും." },
        { en: "We will have been waiting for ages.", ml: "ഞങ്ങൾ ഒരുപാട് കാലമായി കാത്തിരിക്കുകയായിരുന്നു എന്നാകും." },
        { en: "He will have been traveling for a month.", ml: "അവൻ ഒരു മാസമായി യാത്ര ചെയ്യുകയാകും." }
      ],
      use: "Future duration", 
      useMl: "ഭാവിയിലെ സമയ ദൈർഘ്യം",
      color: "bg-red-500" 
    }
  ];

  const greetingsContent = [
    {
      name: "Formal Greetings",
      nameMl: "ഔദ്യോഗിക അഭിവാദ്യങ്ങൾ",
      examples: [
        { en: "Good morning, Sir.", ml: "സുപ്രഭാതം, സാർ." },
        { en: "How do you do?", ml: "സുഖമാണോ? (ആദ്യമായി കാണുമ്പോൾ ചോദിക്കുന്നത്)." },
        { en: "It is an honor to meet you.", ml: "നിങ്ങളെ കണ്ടതിൽ വലിയ സന്തോഷമുണ്ട്." },
        { en: "Good evening, everyone.", ml: "എല്ലാവർക്കും ശുഭസന്ധ്യ." },
        { en: "Have a productive day.", ml: "നല്ലൊരു ദിവസം ആശംസിക്കുന്നു." },
        { en: "How is your day going?", ml: "നിങ്ങളുടെ ദിവസം എങ്ങനെ പോകുന്നു?" },
        { en: "I am pleased to meet you.", ml: "നിങ്ങളെ കണ്ടുമുട്ടിയതിൽ സന്തോഷം." },
        { en: "Good to see you again.", ml: "നിങ്ങളെ വീണ്ടും കണ്ടതിൽ സന്തോഷം." },
        { en: "How are things with you?", ml: "വിശേഷങ്ങൾ എങ്ങനെയുണ്ട്?" },
        { en: "Wishing you a great morning.", ml: "നല്ലൊരു പ്രഭാതം ആശംസിക്കുന്നു." }
      ],
      use: "Professional settings",
      useMl: "ഓഫീസിലും മറ്റും",
      color: "bg-indigo-500"
    },
    {
      name: "Casual Greetings",
      nameMl: "അനൗദ്യോഗിക അഭിവാദ്യങ്ങൾ",
      examples: [
        { en: "Hi, what's up?", ml: "ഹായ്, എന്തുണ്ട് വിശേഷങ്ങൾ?" },
        { en: "Hey there!", ml: "ഹേയ്, ഇവിടെ നോക്കൂ!" },
        { en: "Long time no see.", ml: "കുറേ കാലമായല്ലോ കണ്ടിട്ട്." },
        { en: "How's it going?", ml: "എങ്ങനെ പോകുന്നു കാര്യങ്ങൾ?" },
        { en: "Good to see you.", ml: "നിന്നെ കണ്ടതിൽ സന്തോഷം." },
        { en: "Are you doing okay?", ml: "നിനക്ക് കുഴപ്പമൊന്നുമില്ലല്ലോ?" },
        { en: "Catch you later!", ml: "പിന്നെ കാണാം!" },
        { en: "Morning!", ml: "രാവിലെത്തെ അഭിവാദ്യം (ചുരുക്കത്തിൽ)." },
        { en: "Sup?", ml: "എന്തുണ്ട്? (വളരെ കാഷ്വൽ)." },
        { en: "Take care, bye.", ml: "ശ്രദ്ധിക്കണേ, ബൈ." }
      ],
      use: "Friends and Family",
      useMl: "സുഹൃത്തുക്കളോടും കുടുംബത്തോടും",
      color: "bg-indigo-500"
    }
  ];

  const selfIntroContent = [
    {
      name: "Basic Identity",
      nameMl: "അടിസ്ഥാന വിവരങ്ങൾ",
      examples: [
        { en: "I am Anu.", ml: "ഞാൻ അനുവാണ്." },
        { en: "My name is John Doe.", ml: "എന്റെ പേര് ജോൺ ഡോ എന്നാണ്." },
        { en: "I live in Thrissur.", ml: "ഞാൻ തൃശ്ശൂരിലാണ് താമസിക്കുന്നത്." },
        { en: "I was born in Palakkad.", ml: "ഞാൻ പാലക്കാടാണ് ജനിച്ചത്." },
        { en: "I am 25 years old.", ml: "എനിക്ക് 25 വയസ്സുണ്ട്." },
        { en: "I am a local resident.", ml: "ഞാൻ ഇവിടുത്തെ താമസക്കാരനാണ്." },
        { en: "You can call me Appu.", ml: "നിങ്ങൾക്ക് എന്നെ അപ്പൂ എന്ന് വിളിക്കാം." },
        { en: "I stay at Maradu.", ml: "ഞാൻ മരടിലാണ് നിൽക്കുന്നത്." },
        { en: "I have lived here for 10 years.", ml: "ഞാൻ ഇവിടെ 10 വർഷമായി താമസിക്കുന്നു." },
        { en: "I am from a small village.", ml: "ഞാൻ ഒരു ചെറിയ ഗ്രാമത്തിൽ നിന്നാണ്." }
      ],
      use: "Meeting strangers",
      useMl: "അപരിചിതരെ കാണുമ്പോൾ",
      color: "bg-teal-500"
    },
    {
      name: "Work & Education",
      nameMl: "ജോലിയും പഠനവും",
      examples: [
        { en: "I am a teacher.", ml: "ഞാൻ ഒരു അധ്യാപകനാണ്." },
        { en: "I work at a bank.", ml: "ഞാൻ ഒരു ബാങ്കിൽ ജോലി ചെയ്യുന്നു." },
        { en: "I am studying B.Com.", ml: "ഞാൻ ബി.കോം പഠിക്കുകയാണ്." },
        { en: "I am looking for a job.", ml: "ഞാൻ ഒരു ജോലി തിരയുകയാണ്." },
        { en: "I am a businessman.", ml: "ഞാൻ ഒരു വ്യാപാരിയാണ്." },
        { en: "I work in the IT sector.", ml: "ഞാൻ ഐടി മേഖലയിൽ ജോലി ചെയ്യുന്നു." },
        { en: "I have 5 years of experience.", ml: "എനിക്ക് 5 വർഷത്തെ പ്രവൃത്തിപരിചയമുണ്ട്." },
        { en: "I am a nurse by profession.", ml: "എന്റെ ജോലി നഴ്‌സിംഗ് ആണ്." },
        { en: "I studied at Kerala University.", ml: "ഞാൻ കേരള യൂണിവേഴ്സിറ്റിയിലാണ് പഠിച്ചത്." },
        { en: "I am currently unemployed.", ml: "ഇപ്പോൾ എനിക്ക് ജോലിയില്ല." }
      ],
      use: "Job interviews or seminars",
      useMl: "അഭിമുഖങ്ങളിലും സെമിനാറുകളിലും",
      color: "bg-teal-500"
    }
  ];

  const shoppingContent = [
    {
      name: "General Shopping",
      nameMl: "സാധാരണ ഷോപ്പിംഗ്",
      examples: [
        { en: "How much is this?", ml: "ഇതിന് എത്രയാണ് വില?" },
        { en: "I want one kilo of rice.", ml: "എനിക്ക് ഒരു കിലോ അരി വേണം." },
        { en: "Can I have a discount?", ml: "കുറച്ച് കുറച്ചു തരുമോ?" },
        { en: "Do you have this in blue?", ml: "ഇതിന്റെ നീല നിറം ഉണ്ടോ?" },
        { en: "It is too expensive.", ml: "ഇതിന് വില കൂടുതലാണ്." },
        { en: "Where is the billing counter?", ml: "ബില്ലിംഗ് കൗണ്ടർ എവിടെയാണ്?" },
        { en: "Do you accept cards?", ml: "കാർഡ് സ്വീകരിക്കുമോ?" },
        { en: "I need a carry bag.", ml: "എനിക്ക് ഒരു സഞ്ചി വേണം." },
        { en: "Check the expiry date.", ml: "അവസാന തീയതി പരിശോധിക്കുക." },
        { en: "This is very cheap.", ml: "ഇതിന് വില വളരെ കുറവാണ്." }
      ],
      use: "Market interaction",
      useMl: "മാർക്കറ്റിൽ സാധനങ്ങൾ വാങ്ങുമ്പോൾ",
      color: "bg-amber-500"
    },
    {
      name: "Clothes & Fitting",
      nameMl: "വസ്ത്രങ്ങളും മാറ്റിവെക്കലും",
      examples: [
        { en: "Where is the trial room?", ml: "ട്രയൽ റൂം എവിടെയാണ്?" },
        { en: "This doesn't fit me.", ml: "ഇത് എനിക്ക് പാകമല്ല." },
        { en: "Do you have a larger size?", ml: "ഇതിന്റെ വലിയ സൈസ് ഉണ്ടോ?" },
        { en: "I like this material.", ml: "എനിക്ക് ഈ തുണി ഇഷ്ടപ്പെട്ടു." },
        { en: "Can I return this?", ml: "എനിക്ക് ഇത് തിരിച്ചുകൊടുക്കാൻ പറ്റുമോ?" },
        { en: "I want a cotton shirt.", ml: "എനിക്ക് ഒരു കോട്ടൺ ഷർട്ട് വേണം." },
        { en: "Is there any offer?", ml: "എന്തെങ്കിലും ഓഫർ ഉണ്ടോ?" },
        { en: "Wrap it as a gift, please.", ml: "ഇതൊരു സമ്മാനമായി പൊതിഞ്ഞു തരൂ." },
        { en: "Show me some sarees.", ml: "എനിക്ക് കുറച്ച് സാരികൾ കാണിച്ചു തരൂ." },
        { en: "Keep the change.", ml: "ബാക്കി ചില്ലറ വെച്ചോളൂ." }
      ],
      use: "Buying clothes",
      useMl: "വസ്ത്രക്കടയിൽ",
      color: "bg-amber-500"
    }
  ];

  const alphabetContent = [
    {
      name: "Vowels & Diphthongs",
      nameMl: "സ്വരാക്ഷരങ്ങൾ",
      examples: [
        { en: "Apple /æ/", ml: "ആപ്പിൾ - 'A' ശബ്ദം ശ്രദ്ധിക്കുക." },
        { en: "Egg /e/", ml: "എഗ്ഗ് - 'E' ശബ്ദം." },
        { en: "Ice /aɪ/", ml: "ഐസ് - 'I' ഇവിടെ 'ഐ' ആയി മാറുന്നു." },
        { en: "Orange /ɒ/", ml: "ഓറഞ്ച് - 'O' ശബ്ദം." },
        { en: "Umbrella /ʌ/", ml: "അംബ്രല്ല - 'U' ഇവിടെ 'അ' ശബ്ദം നൽകുന്നു." },
        { en: "Cat /kæt/", ml: "ക്യാറ്റ് - ചെറിയ 'അ' ശബ്ദം." },
        { en: "Car /kɑːr/", ml: "കാർ - നീട്ടിയ 'ആ' ശബ്ദം." },
        { en: "Sheep /ʃiːp/", ml: "ഷീപ് - നീട്ടിയ 'ഈ' ശബ്ദം." },
        { en: "Ship /ʃɪp/", ml: "ഷിപ്പ് - വേഗത്തിലുള്ള 'ഇ' ശബ്ദം." },
        { en: "Boy /bɔɪ/", ml: "ബോയ് - 'ഒയ്' ശബ്ദം." }
      ],
      use: "Vowel mastery",
      useMl: "സ്വരാക്ഷര കൃത്യത",
      color: "bg-purple-500"
    },
    {
      name: "Consonants & Confusion",
      nameMl: "വ്യഞ്ജനാക്ഷരങ്ങളും ആശയക്കുഴപ്പങ്ങളും",
      examples: [
        { en: "Think /θɪŋk/", ml: "തിങ്ക് - 'Th' ശബ്ദം പല്ലിനിടയിൽ നാവ് വെച്ച്." },
        { en: "That /ðæt/", ml: "ദാറ്റ് - മൃദുവായ 'ദ' ശബ്ദം." },
        { en: "Fan /fæn/", ml: "ഫാൻ - തണുത്ത കാറ്റ് പോലെ." },
        { en: "Van /væn/", ml: "വാൻ - വായ കടിച്ചു പിടിച്ചു പറയുക." },
        { en: "Zero /zɪərəʊ/", ml: "സീറോ - വണ്ടി സ്റ്റാർട്ട് ചെയ്യുന്ന ശബ്ദം പോലെ." },
        { en: "Sugar /ˈʃʊɡ.ər/", ml: "ഷുഗർ - 'S' ഇവിടെ 'ഷ' ശബ്ദമാണ്." },
        { en: "Judge /dʒʌdʒ/", ml: "ജഡ്ജ് - 'J' ഉം 'dg' ഉം 'ജ' ശബ്ദം നൽകുന്നു." },
        { en: "King /kɪŋ/", ml: "കിംഗ് - മൂക്കിലൂടെയുള്ള 'ങ' ശബ്ദം." },
        { en: "Phoebe /fiːbi/", ml: "ഫീബി - 'Ph' ഇവിടെ 'ഫ്' ശബ്ദമാണ്." },
        { en: "Walk /wɔːk/", ml: "വാക്ക് - 'L' മിണ്ടാതിരിക്കുന്നു (Silent)." }
      ],
      use: "Clear pronunciation",
      useMl: "വ്യക്തമായ ഉച്ചാരണം",
      color: "bg-purple-500"
    }
  ];

  const numbersTimeContent = [
    {
      name: "Telling the Time",
      nameMl: "സമയം പറയുക",
      examples: [
        { en: "It is exactly noon.", ml: "ഇപ്പോൾ കൃത്യം ഉച്ചയായി." },
        { en: "It is a quarter past three.", ml: "3 മണി കഴിഞ്ഞ് 15 മിനിറ്റായി (മൂന്നേകാൽ)." },
        { en: "It is quarter to five.", ml: "5 മണി ആകാൻ 15 മിനിറ്റുണ്ട് (അഞ്ചേമുക്കാൽ)." },
        { en: "Wait for ten minutes.", ml: "പത്ത് മിനിറ്റ് കാത്തിരിക്കൂ." },
        { en: "The shop opens at 9 AM.", ml: "കട രാവിലെ 9 മണിക്ക് തുറക്കും." },
        { en: "I slept at midnight.", ml: "ഞാൻ അർദ്ധരാത്രിയിൽ ഉറങ്ങി." },
        { en: "It's near 6 o'clock.", ml: "സമയം ഏകദേശം 6 മണിയായി." },
        { en: "The movie starts at 7:30.", ml: "സിനിമ ഏഴരയ്ക്ക് തുടങ്ങും." },
        { en: "I will be there in an hour.", ml: "ഞാൻ ഒരു മണിക്കൂറിനുള്ളിൽ അവിടെ എത്തും." },
        { en: "Time is running out.", ml: "സമയം തീർന്നുകൊണ്ടിരിക്കുന്നു." }
      ],
      use: "Scheduling",
      useMl: "സമയം ക്രമീകരിക്കാൻ",
      color: "bg-blue-400"
    },
    {
      name: "Numbers & Counting",
      nameMl: "അക്കങ്ങളും എണ്ണലും",
      examples: [
        { en: "I have two sisters.", ml: "എനിക്ക് രണ്ട് സഹോദരിമാരുണ്ട്." },
        { en: "Give me fifty rupees.", ml: "എനിക്ക് അമ്പത് രൂപ തരൂ." },
        { en: "There are 30 students.", ml: "അവിടെ 30 വിദ്യാർത്ഥികളുണ്ട്." },
        { en: "This is my first time.", ml: "ഇത് എന്റെ ആദ്യത്തെ തവണയാണ്." },
        { en: "He is the third person.", ml: "അവൻ മൂന്നാമത്തെ ആളാണ്." },
        { en: "I need 100 copies.", ml: "എനിക്ക് 100 കോപ്പികൾ വേണം." },
        { en: "Double the amount.", ml: "തുക ഇരട്ടിയാക്കുക." },
        { en: "Zero is also a number.", ml: "പൂജ്യവും ഒരു അക്കമാണ്." },
        { en: "Counting from one to ten.", ml: "ഒന്ന് മുതൽ പത്ത് വരെ എണ്ണുന്നു." },
        { en: "Thousands of people came.", ml: "ആയിരക്കണക്കിന് ആളുകൾ വന്നു." }
      ],
      use: "Quantity and Order",
      useMl: "അളവുകൾക്കും ക്രമങ്ങൾക്കും",
      color: "bg-blue-400"
    }
  ];

  const svoContent = [
    {
      name: "Basic SVO Structure",
      nameMl: "അടിസ്ഥാന വാചക ഘടന",
      examples: [
        { en: "Cats catch mice.", ml: "പൂച്ചകൾ എലികളെ പിടിക്കുന്നു." },
        { en: "I like milk.", ml: "എനിക്ക് പാൽ ഇഷ്ടമാണ്." },
        { en: "He writes a letter.", ml: "അവൻ ഒരു കത്ത് എഴുതുന്നു." },
        { en: "We watch TV.", ml: "ഞങ്ങൾ ടിവി കാണുന്നു." },
        { en: "Birds fly in the sky.", ml: "പക്ഷികൾ ആകാശത്ത് പറക്കുന്നു." },
        { en: "Trees give oxygen.", ml: "മരങ്ങൾ ഓക്സിജൻ തരുന്നു." },
        { en: "She sings songs.", ml: "അവൾ പാട്ടുകൾ പാടുന്നു." },
        { en: "They build houses.", ml: "അവർ വീടുകൾ പണിയുന്നു." },
        { en: "The dog barks at night.", ml: "നായ രാത്രിയിൽ കുരയ്ക്കുന്നു." },
        { en: "Rain falls down.", ml: "മഴ താഴേക്ക് വീഴുന്നു." }
      ],
      use: "Standard statements",
      useMl: "സാധാരണ വാചകങ്ങൾ",
      color: "bg-rose-500"
    },
    {
      name: "Negative & Questions",
      nameMl: "നിഷേധങ്ങളും ചോദ്യങ്ങളും",
      examples: [
        { en: "I do not know him.", ml: "എനിക്ക് അവനെ അറിയില്ല." },
        { en: "Do you like coffee?", ml: "നിങ്ങൾക്കോ കോഫി ഇഷ്ടമാണോ?" },
        { en: "She does not come today.", ml: "അവൾ ഇന്ന് വരുന്നില്ല." },
        { en: "Why did you go?", ml: "നീ എന്തിനാണ് പോയത്?" },
        { en: "I cannot swim.", ml: "എനിക്ക് നീന്താൻ കഴിയില്ല." },
        { en: "Does he work here?", ml: "അവൻ ഇവിടെ ജോലി ചെയ്യുന്നുണ്ടോ?" },
        { en: "We are not ready.", ml: "ഞങ്ങൾ തയ്യാറല്ല." },
        { en: "Can you help me?", ml: "നിങ്ങൾക്ക് എന്നെ സഹായിക്കാമോ?" },
        { en: "It is not raining.", ml: "മഴ പെയ്യുന്നില്ല." },
        { en: "Who are you?", ml: "നിങ്ങൾ ആരാണ്?" }
      ],
      use: "Conversational variety",
      useMl: "സംഭാഷണത്തിലെ വൈവിധ്യം",
      color: "bg-rose-500"
    }
  ];

  const homeConversationsContent = [
    {
      name: "Daily Routine at Home",
      nameMl: "വീട്ടിലെ നിത്യജീവിതം",
      examples: [
        { en: "I wake up at 6 AM.", ml: "ഞാൻ രാവിലെ 6 മണിക്ക് എഴുന്നേൽക്കുന്നു." },
        { en: "Did you have lunch?", ml: "നീ ഉച്ചഭക്ഷണം കഴിച്ചോ?" },
        { en: "Switch off the fan.", ml: "ഫാൻ ഓഫ് ചെയ്യുക." },
        { en: "Where is my phone?", ml: "എന്റെ ഫോൺ എവിടെയാണ്?" },
        { en: "I am going to take a bath.", ml: "ഞാൻ കുളിക്കാൻ പോവുകയാണ്." },
        { en: "Is the food ready?", ml: "ഭക്ഷണം തയ്യാറായോ?" },
        { en: "Please clean the room.", ml: "ദയവായി മുറി വൃത്തിയാക്കൂ." },
        { en: "I am watching news.", ml: "ഞാൻ വാർത്ത കാണുകയാണ്." },
        { en: "Shut the door.", ml: "വാതിൽ അടയ്ക്കൂ." },
        { en: "Who is at the gate?", ml: "ഗേറ്റിൽ ആരാണ്?" }
      ],
      use: "Basic chores",
      useMl: "വീട്ടുജോലികൾ",
      color: "bg-emerald-500"
    },
    {
      name: "Family Conversations",
      nameMl: "കുടുംബാംഗങ്ങളോട്",
      examples: [
        { en: "Mom, I'm hungry.", ml: "അമ്മേ, എനിക്ക് വിശക്കുന്നു." },
        { en: "Dad is sleeping.", ml: "അച്ഛൻ ഉറങ്ങുകയാണ്." },
        { en: "Call your brother.", ml: "നിന്റെ അനിയനെ വിളിക്കൂ." },
        { en: "We are going out.", ml: "ഞങ്ങൾ പുറത്തേക്ക് പോവുകയാണ്." },
        { en: "Don't make noise.", ml: "ബഹളം വെക്കരുത്." },
        { en: "Pass me the salt.", ml: "എനിക്ക് ഉപ്പ് ഇങ്ങോട്ട് തരൂ." },
        { en: "Did you finish your studies?", ml: "നീ പഠിച്ചു കഴിഞ്ഞോ?" },
        { en: "Help me in the kitchen.", ml: "അടുക്കളയിൽ എന്നെ സഹായിക്കൂ." },
        { en: "I'll be back soon.", ml: "ഞാൻ ഉടനെ വരാം." },
        { en: "Good night everyone.", ml: "എല്ലാവർക്കും ശുഭനിദ്ര." }
      ],
      use: "Family bonding",
      useMl: "കുടുംബാംഗങ്ങൾക്കിടയിൽ",
      color: "bg-emerald-500"
    }
  ];

  const travelContent = [
    {
      name: "Tickets & Transport",
      nameMl: "ടിക്കറ്റും യാത്രയും",
      examples: [
        { en: "Where is the bus stand?", ml: "ബസ് സ്റ്റാൻഡ് എവിടെയാണ്?" },
        { en: "How can I go to Kochi?", ml: "എനിക്ക് എങ്ങനെ കൊച്ചിയിൽ പോകാം?" },
        { en: "One ticket to Munnar, please.", ml: "മൂന്നാറിലേക്ക് ഒരു ടിക്കറ്റ് തരൂ." },
        { en: "What time is the train?", ml: "ട്രെയിൻ സമയം എത്രയ്ക്കാണ്?" },
        { en: "Is this seat vacant?", ml: "ഈ സീറ്റ് ഒഴിവുണ്ടോ?" },
        { en: "Get off at the next stop.", ml: "അടുത്ത സ്റ്റോപ്പിൽ ഇറങ്ങുക." },
        { en: "Wait for the green signal.", ml: "പച്ച സിഗ്നലിനായി കാത്തിരിക്കൂ." },
        { en: "I missed the flight.", ml: "എനിക്ക് ഫ്ലൈറ്റ് മിസ്സായി." },
        { en: "Book a taxi for me.", ml: "എനിക്ക് ഒരു ടാക്സി ബുക്ക് ചെയ്യൂ." },
        { en: "Keep your luggage safe.", ml: "നിങ്ങളുടെ ബാഗുകൾ ശ്രദ്ധിക്കുക." }
      ],
      use: "Commuting",
      useMl: "യാത്ര ചെയ്യുമ്പോൾ",
      color: "bg-cyan-500"
    },
    {
      name: "Directions & Stay",
      nameMl: "ദിശകളും താമസവും",
      examples: [
        { en: "Go straight for 1 km.", ml: "ഒരു കിലോമീറ്റർ നേരെ പോവുക." },
        { en: "Turn left at the statue.", ml: "പ്രതിമയുടെ അടുത്ത് നിന്ന് ഇടത്തോട്ട് തിരിയുക." },
        { en: "I have a hotel booking.", ml: "എനിക്ക് ഹോട്ടൽ ബുക്കിംഗ് ഉണ്ട്." },
        { en: "Check-in time is 12 PM.", ml: "ചെക്ക്-ഇൻ സമയം 12 മണിയാണ്." },
        { en: "Is breakfast included?", ml: "പ്രഭാതഭക്ഷണം ഉണ്ടോ?" },
        { en: "I need a single room.", ml: "എനിക്ക് സിംഗിൾ റൂം വേണം." },
        { en: "Where is the nearest ATM?", ml: "ഏറ്റവും അടുത്തുള്ള എടിഎം എവിടെയാണ്?" },
        { en: "Is it safe to walk at night?", ml: "രാത്രി നടക്കുന്നത് സുരക്ഷിതമാണോ?" },
        { en: "How far is the beach?", ml: "കടൽക്കരയിലേക്ക് എത്ര ദൂരമുണ്ട്?" },
        { en: "Call me a rickshaw.", ml: "എനിക്കൊരു ഓട്ടോ വിളിക്കൂ." }
      ],
      use: "Tourism & Navigation",
      useMl: "പുതിയ സ്ഥലങ്ങളിൽ എത്തുമ്പോൾ",
      color: "bg-cyan-500"
    }
  ];

  const diningContent = [
    {
      name: "Ordering & Service",
      nameMl: "ഭക്ഷണം ഓർഡർ ചെയ്യൽ",
      examples: [
        { en: "Can I see the menu?", ml: "എനിക്ക് മെനു ഒന്ന് കാണാമോ?" },
        { en: "I want a cup of coffee.", ml: "എനിക്ക് ഒരു കപ്പ് കോഫി വേണം." },
        { en: "One plate of Biryani, please.", ml: "ഒരു പ്ലേറ്റ് ബിരിയാണി തരൂ." },
        { en: "Don't make it spicy.", ml: "കൂടുതൽ എരിവ് ചേർക്കരുത്." },
        { en: "Bring some water.", ml: "കുറച്ച് വെള്ളം കൊണ്ടുവരൂ." },
        { en: "How long will it take?", ml: "എത്ര സമയമെടുക്കും?" },
        { en: "Is this vegetarian?", ml: "ഇത് വെജിറ്റേറിയൻ ആണോ?" },
        { en: "I want an extra spoon.", ml: "എനിക്ക് ഒരു സ്പൂൺ കൂടി വേണം." },
        { en: "Where is the washroom?", ml: "വാഷ്റൂം എവിടെയാണ്?" },
        { en: "Thank you for the service.", ml: "നല്ല പെരുമാറ്റത്തിന് നന്ദി." }
      ],
      use: "At a hotel or cafe",
      useMl: "ഭക്ഷണശാലകളിൽ",
      color: "bg-orange-500"
    },
    {
      name: "Payment & Feedback",
      nameMl: "ബില്ലും അഭിപ്രായങ്ങളും",
      examples: [
        { en: "Check, please.", ml: "ബിൽ തരൂ." },
        { en: "The food was delicious.", ml: "ഭക്ഷണം വളരെ രുചികരമായിരുന്നു." },
        { en: "Can I pay by Google Pay?", ml: "ഗൂഗിൾ പേ വഴി പണമടയ്ക്കാമോ?" },
        { en: "The tea is too sweet.", ml: "ചായയ്ക്ക് വലിയ മധുരമാണ്." },
        { en: "It was a wonderful meal.", ml: "നല്ലൊരു ഭക്ഷണമായിരുന്നു." },
        { en: "Keep the tip.", ml: "ടിപ്പ് വെച്ചോളൂ." },
        { en: "I didn't like the service.", ml: "എനിക്ക് സർവീസ് ഇഷ്ടപ്പെട്ടില്ല." },
        { en: "Call the manager.", ml: "മാനേജരെ വിളിക്കൂ." },
        { en: "Do you have any snacks?", ml: "എന്തെങ്കിലും പലഹാരങ്ങൾ ഉണ്ടോ?" },
        { en: "We will come again.", ml: "ഞങ്ങൾ വീണ്ടും വരും." }
      ],
      use: "Finishing the meal",
      useMl: "തിരിച്ചു പോകുമ്പോൾ",
      color: "bg-orange-500"
    }
  ];

  const hospitalContent = [
    {
      name: "Describing Illness",
      nameMl: "അസുഖം വിവരിക്കൽ",
      examples: [
        { en: "I have a headache.", ml: "എനിക്ക് തലവേദനയുണ്ട്." },
        { en: "I have a cold.", ml: "എനിക്ക് ജലദോഷമുണ്ട്." },
        { en: "My stomach hurts.", ml: "എന്റെ വയറ് വേദനിക്കുന്നു." },
        { en: "I have a high fever.", ml: "എനിക്ക് കഠിനമായ പനിയുണ്ട്." },
        { en: "I feel dizzy.", ml: "എനിക്ക് തലകറക്കം തോന്നുന്നു." },
        { en: "Where is the doctor's cabin?", ml: "ഡോക്ടറുടെ മുറി എവിടെയാണ്?" },
        { en: "I have an appointment.", ml: "എനിക്ക് അപ്പോയിന്റ്മെന്റ് ഉണ്ട്." },
        { en: "It's been hurting for two days.", ml: "രണ്ട് ദിവസമായി വേദനിക്കുന്നു." },
        { en: "I need a blood test.", ml: "എനിക്ക് ഒരു രക്തപരിശോധന വേണം." },
        { en: "I'm feeling much better.", ml: "ഇപ്പോൾ എനിക്ക് ഭേദമുണ്ട്." }
      ],
      use: "At the clinic",
      useMl: "ഡോക്ടറെ കാണുമ്പോൾ",
      color: "bg-red-600"
    },
    {
      name: "Pharmacy & Emergency",
      nameMl: "മരുന്നുകടയും അത്യാഹിതവും",
      examples: [
        { en: "Call an ambulance!", ml: "ഒരു ആംബുലൻസ് വിളിക്ക്!" },
        { en: "Is the pharmacy open?", ml: "മരുന്നുകട തുറന്നിട്ടുണ്ടോ?" },
        { en: "How should I take this medicine?", ml: "ഈ മരുന്ന് എങ്ങനെ കഴിക്കണം?" },
        { en: "Any side effects?", ml: "എന്തെങ്കിലും പാർശ്വഫലങ്ങൾ ഉണ്ടോ?" },
        { en: "I am allergic to dust.", ml: "എനിക്ക് പൊടി അലർജിയാണ്." },
        { en: "Apply this cream daily.", ml: "ഈ ക്രീം ദിവസവും പുരട്ടുക." },
        { en: "The patient is stable.", ml: "രോഗിയുടെ നില തൃപ്തികരമാണ്." },
        { en: "Visit again next week.", ml: "അടുത്ത ആഴ്ച വീണ്ടും വരൂ." },
        { en: "I need a medical certificate.", ml: "എനിക്ക് ഒരു മെഡിക്കൽ സർട്ടിഫിക്കറ്റ് വേണം." },
        { en: "Take rest for three days.", ml: "മൂന്ന് ദിവസം വിശ്രമിക്കൂ." }
      ],
      use: "Emergency & Recovery",
      useMl: "അടിയന്തര സാഹചര്യങ്ങളിൽ",
      color: "bg-red-600"
    }
  ];

  const mistakesContent = [
    {
      name: "Common Grammar Errors",
      nameMl: "വ്യാകരണപരമായ തെറ്റുകൾ",
      examples: [
        { en: "Incorrect: 'I am relative of him.'", ml: "Correct: 'I am a relative of HIS.' (ഹിസ് ചേർക്കണം)." },
        { en: "Incorrect: 'Current went.'", ml: "Correct: 'There is a power cut.' (കറന്റ് പോയി എന്ന് പറയാം)." },
        { en: "Incorrect: 'I will tell to you.'", ml: "Correct: 'I will tell you.' ('to' വേണ്ട)." },
        { en: "Incorrect: 'He do not know.'", ml: "Correct: 'He DOES not know.' (He വന്നാൽ Does)." },
        { en: "Incorrect: 'I am 20 years.'", ml: "Correct: 'I am 20 years OLD.' (Old കൂടി ചേർക്കണം)." },
        { en: "Incorrect: 'Yesterday I have gone.'", ml: "Correct: 'Yesterday I WENT.' (ഇന്നലെ എന്ന് പറയുന്നതിനാൽ Simple Past)." },
        { en: "Incorrect: 'She sing well.'", ml: "Correct: 'She SINGS well.' (Sing-ൽ 's' ചേർക്കണം)." },
        { en: "Incorrect: 'Return back.'", ml: "Correct: 'Return.' ('Back' ആവശ്യമില്ല, റിട്ടേൺ എന്നാൽ തന്നെ തിരിച്ചു വരിക എന്നാണ്)." },
        { en: "Incorrect: 'I, you and he.'", ml: "Correct: 'You, he and I.' (മറ്റുള്ളവരെ ആദ്യം പറയണം)." },
        { en: "Incorrect: 'What is your good name?'", ml: "Correct: 'What is your name?' ('Good name' എന്ന പ്രയോഗം ഇംഗ്ലീഷിലില്ല)." }
      ],
      use: "Correction",
      useMl: "തിരുത്തലുകൾ",
      color: "bg-slate-700"
    },
    {
      name: "Vocabulary & Usage",
      nameMl: "വാക്കുകളുടെ ശരിയായ ഉപയോഗം",
      examples: [
        { en: "Incorrect: 'I am very much happy.'", ml: "Correct: 'I am very happy.' ('much' വേണ്ട)." },
        { en: "Incorrect: 'Discuss about.'", ml: "Correct: 'Discuss.' ('about' ആവശ്യമില്ല)." },
        { en: "Incorrect: 'One of my friend.'", ml: "Correct: 'One of my FRIENDS.' ('s' ചേർക്കണം)." },
        { en: "Incorrect: 'Cousin brother.'", ml: "Correct: 'Cousin.' ('Brother/Sister' ചേർക്കേണ്ടതില്ല)." },
        { en: "Incorrect: 'Myself Rahul.'", ml: "Correct: 'I am Rahul.' (സ്വയം പരിചയപ്പെടുത്തുമ്പോൾ I am എന്ന് പറയുക)." },
        { en: "Incorrect: 'Cent percent.'", ml: "Correct: 'One hundred percent.' (നൂറു ശതമാനം)." },
        { en: "Incorrect: 'Ordering for food.'", ml: "Correct: 'Ordering food.' ('for' വേണ്ട)." },
        { en: "Incorrect: 'Married with.'", ml: "Correct: 'Married TO.' ('with' തെറ്റാണ്)." },
        { en: "Incorrect: 'Angry on.'", ml: "Correct: 'Angry WITH.' ('on' തെറ്റാണ്)." },
        { en: "Incorrect: 'Years back.'", ml: "Correct: 'Years AGO.' (വർഷങ്ങൾക്കു മുമ്പ്)." }
      ],
      use: "Natural Phrasing",
      useMl: "സ്വാഭാവികമായ ശൈലികൾ",
      color: "bg-slate-700"
    }
  ];

  const schoolContent = [
    {
      name: "Academic Interaction",
      nameMl: "ക്ലാസ്റൂം സംഭാഷണങ്ങൾ",
      examples: [
        { en: "May I come in, teacher?", ml: "ടീച്ചർ, ഞാൻ അകത്തേക്ക് വന്നോട്ടെ?" },
        { en: "I have a doubt.", ml: "എനിക്ക് ഒരു സംശയമുണ്ട്." },
        { en: "Can you repeat that, please?", ml: "ദയവായി അത് ഒന്നുകൂടി പറയാമോ?" },
        { en: "I forgot my notebook.", ml: "ഞാൻ എന്റെ നോട്ട്ബുക്ക് മറന്നു." },
        { en: "Give me your pen.", ml: "നിന്റെ പേന എനിക്ക് തരൂ." },
        { en: "When is the exam?", ml: "പരീക്ഷ എന്നാണ്?" },
        { en: "I finished my work.", ml: "ഞാൻ എന്റെ ജോലി തീർത്തു." },
        { en: "Keep quiet.", ml: "നിശബ്ദത പാലിക്കുക." },
        { en: "Open your book.", ml: "പുസ്തകം തുറക്കൂ." },
        { en: "I am late for class.", ml: "ഞാൻ ക്ലാസ്സിൽ എത്താൻ വൈകി." }
      ],
      use: "Student-Teacher talk",
      useMl: "പഠനസംബന്ധമായ കാര്യം",
      color: "bg-violet-500"
    },
    {
      name: "Campus & Friends",
      nameMl: "ക്യാമ്പസിലും കൂട്ടുകാർക്കുമിടയിൽ",
      examples: [
        { en: "Let's go to the canteen.", ml: "നമുക്ക് കാന്റീനിൽ പോകാം." },
        { en: "Did you study for today?", ml: "നീ ഇന്നത്തേക്ക് പഠിച്ചോ?" },
        { en: "Where is the library?", ml: "ലൈബ്രറി എവിടെയാണ്?" },
        { en: "I missed the bus.", ml: "എനിക്ക് ബസ് മിസ്സായി." },
        { en: "Can I borrow your notes?", ml: "നിന്റെ നോട്ട്സ് എനിക്ക് തരുമോ?" },
        { en: "Who is the principal?", ml: "ആരാണ് പ്രിൻസിപ്പാൾ?" },
        { en: "The library is closed.", ml: "ലൈബ്രറി അടച്ചിരിക്കുകയാണ്." },
        { en: "See you after class.", ml: "ക്ലാസ് കഴിഞ്ഞു കാണാം." },
        { en: "I have a seminar today.", ml: "എനിക്ക് ഇന്ന് ഒരു സെമിനാറുണ്ട്." },
        { en: "Are you coming for the trip?", ml: "നീ യാത്രയ്ക്ക് വരുന്നുണ്ടോ?" }
      ],
      use: "Social life at school",
      useMl: "കൂട്ടുകാരുമായുള്ള സംഭാഷണം",
      color: "bg-violet-500"
    }
  ];

  const getStepContent = () => {
    const title = lesson.title.toLowerCase();
    if (title.includes("alphabet")) return alphabetContent;
    if (title.includes("greetings")) return greetingsContent;
    if (title.includes("introducing")) return selfIntroContent;
    if (title.includes("numbers")) return numbersTimeContent;
    if (title.includes("sentence structure")) return svoContent;
    if (title.includes("home conversations")) return homeConversationsContent;
    if (title.includes("school")) return schoolContent;
    if (title.includes("shopping")) return shoppingContent;
    if (title.includes("travel")) return travelContent;
    if (title.includes("restaurant")) return diningContent;
    if (title.includes("hospital")) return hospitalContent;
    if (title.includes("present tenses")) return presentTenses;
    if (title.includes("past tenses")) return pastTenses;
    if (title.includes("future tenses")) return futureTenses;
    if (title.includes("common mistakes")) return mistakesContent;
    return [];
  };

  const getFillExercises = (): FillExercise[] | null => {
    const title = lesson.title.toLowerCase();
    if (title.includes("present tenses")) return PRESENT_FILL_EXERCISES;
    if (title.includes("past tenses")) return PAST_FILL_EXERCISES;
    if (title.includes("future tenses")) return FUTURE_FILL_EXERCISES;
    return null;
  };

  const currentContent = getStepContent();
  const fillExercises = getFillExercises();
  const isGrammarLesson = fillExercises !== null;

  // For grammar lessons the flow is:
  //   step 0..N-1 → show tense examples (currentContent)
  //   after each tense step → show fill exercise for that tense
  //   after all tenses → show summary
  // We interleave: content[0] → fill[0] → content[1] → fill[1] → ... → summary
  // We track this via `step` (content index) and `showingFill`

  const totalContentSteps = currentContent.length;
  const totalFillSteps = fillExercises ? fillExercises.length : 0;

  // For non-grammar lessons keep original behaviour
  const totalSteps = isGrammarLesson
    ? totalContentSteps + totalFillSteps + 1  // +1 for final summary
    : currentContent.length > 0 ? currentContent.length : 4;

  // Progress: count completed content + fill steps
  const progressNumerator = isGrammarLesson
    ? step + fillScores.length + (showingFill ? 0 : 0)
    : step;
  const progressDenominator = isGrammarLesson
    ? totalContentSteps + totalFillSteps
    : totalSteps - 1;

  const handleFillComplete = (correct: number, total: number) => {
    const newScores = [...fillScores, { correct, total }];
    setFillScores(newScores);
    setShowingFill(false);
    // Move to next content step (or summary if done)
    setStep((s) => s + 1);
  };

  const handleNextContent = () => {
    if (isGrammarLesson && fillExercises && step < totalContentSteps) {
      // After each content step, show the matching fill exercise
      setShowingFill(true);
    } else if (!isGrammarLesson) {
      if (step < totalSteps - 1) setStep((s) => s + 1);
      else onClose();
    }
  };

  return (
    <div className="h-full flex flex-col bg-stone-50">
      <nav className="p-6 flex items-center justify-between bg-white border-b border-stone-200">
        <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
        <div className="flex-1 max-w-xl mx-8">
           <div className="h-2 w-full bg-stone-100 rounded-full overflow-hidden">
             <motion.div 
               initial={{ width: 0 }}
               animate={{ width: `${Math.min(100, (progressNumerator / Math.max(1, progressDenominator)) * 100)}%` }}
               className="h-full bg-stone-900 rounded-full"
             />
           </div>
        </div>
        <div className="text-xs font-mono font-bold text-stone-400 uppercase px-4 py-1 bg-stone-50 border border-stone-200 rounded-lg">
           {isGrammarLesson
             ? showingFill
               ? `Quiz ${fillScores.length + 1}/${totalFillSteps}`
               : step < totalContentSteps
                 ? `Tense ${step + 1}/${totalContentSteps}`
                 : "Summary"
             : `Step ${step + 1} / ${totalSteps}`}
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto p-8 text-center max-w-3xl mx-auto space-y-12 scrollbar-hide">
        <div className="min-h-full flex flex-col items-center justify-center py-12">
          <AnimatePresence mode="wait">

          {/* ── Grammar lesson: fill exercise ── */}
          {isGrammarLesson && showingFill && fillExercises && (
            <motion.div
              key={`fill-${fillScores.length}`}
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -40 }}
              className="w-full"
            >
              <FillExerciseStep
                exercise={fillExercises[fillScores.length]}
                onComplete={handleFillComplete}
              />
            </motion.div>
          )}

          {/* ── Grammar lesson: reward summary ── */}
          {isGrammarLesson && !showingFill && step >= totalContentSteps && (
            <RewardSummary
              lesson={lesson}
              fillScores={fillScores}
              fillExercises={fillExercises!}
              userData={userData}
              onClose={onClose}
            />
          )}

          {/* ── Grammar lesson: tense content ── */}
          {isGrammarLesson && !showingFill && step < totalContentSteps && currentContent.length > 0 && (
            <motion.div
              key={`content-${step}`}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="space-y-8 w-full"
            >
              <div className="space-y-4">
                <div className={cn("inline-block p-1 px-3 rounded-full text-white text-[10px] font-bold uppercase tracking-widest mb-2", currentContent[step].color)}>
                  {lesson.title.split(' ')[0]} Masterclass
                </div>
                <h2 className="text-5xl font-display font-medium leading-[1.1]">{currentContent[step].name}</h2>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xl text-stone-900 font-medium">{currentContent[step].nameMl}</p>
                  <p className="text-lg text-stone-400 italic">
                    {currentContent[step].use} / {currentContent[step].useMl}
                  </p>
                </div>
              </div>

              {/* Pronunciation guide — only for tense entries that have one */}
              {currentContent[step].pronunciation && (
                <PronunciationPanel guide={currentContent[step].pronunciation as PronunciationGuide} />
              )}

              <div className="w-full space-y-4">
                {currentContent[step].examples.map((ex: any, i: number) => (
                  <div key={i} className="p-8 md:p-10 rounded-[2.5rem] bg-white border border-stone-200 text-left space-y-4 shadow-xl shadow-stone-200/30">
                    <div className="flex items-start gap-4">
                      <button 
                        onClick={() => {
                          const textToSpeak = ex.en.includes('/') ? ex.en.split('/')[0].trim() : ex.en;
                          speak(textToSpeak);
                        }}
                        className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-white shadow-lg shrink-0 mt-1 cursor-pointer hover:scale-110 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-stone-200"
                        title="Speak in English"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Example {i + 1}</p>
                          <p className="text-2xl md:text-3xl font-display italic tracking-tight text-stone-900 leading-tight">
                            {ex.en}
                          </p>
                        </div>
                        <p className="text-lg text-stone-500 font-medium">
                          {ex.ml}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Teaser for upcoming quiz */}
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left">
                <div className="w-8 h-8 rounded-xl bg-stone-900 flex items-center justify-center text-white shrink-0">
                  <Pencil className="w-4 h-4" />
                </div>
                <p className="text-sm text-stone-500">
                  <span className="font-bold text-stone-900">Up next:</span> A quick fill-in-the-blank quiz on {currentContent[step].name}.
                </p>
              </div>

              <button 
                onClick={handleNextContent}
                className="px-12 py-5 bg-stone-900 text-white rounded-[2rem] font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-stone-200"
              >
                Practice This Tense →
              </button>
            </motion.div>
          )}

          {/* ── Non-grammar lessons (original behaviour) ── */}
          {!isGrammarLesson && currentContent.length > 0 && (
            <motion.div
              key={step}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              className="space-y-8 w-full"
            >
              <div className="space-y-4">
                <div className={cn("inline-block p-1 px-3 rounded-full text-white text-[10px] font-bold uppercase tracking-widest mb-2", currentContent[step].color)}>
                  {lesson.title.split(' ')[0]} Masterclass
                </div>
                <h2 className="text-5xl font-display font-medium leading-[1.1]">{currentContent[step].name}</h2>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-xl text-stone-900 font-medium">{currentContent[step].nameMl}</p>
                  <p className="text-lg text-stone-400 italic">
                    {currentContent[step].use} / {currentContent[step].useMl}
                  </p>
                </div>
              </div>

              <div className="w-full space-y-4">
                {currentContent[step].examples.map((ex: any, i: number) => (
                  <div key={i} className="p-8 md:p-10 rounded-[2.5rem] bg-white border border-stone-200 text-left space-y-4 shadow-xl shadow-stone-200/30">
                    <div className="flex items-start gap-4">
                      <button 
                        onClick={() => {
                          const textToSpeak = ex.en.includes('/') ? ex.en.split('/')[0].trim() : ex.en;
                          speak(textToSpeak);
                        }}
                        className="w-10 h-10 rounded-xl bg-stone-900 flex items-center justify-center text-white shadow-lg shrink-0 mt-1 cursor-pointer hover:scale-110 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-stone-200"
                        title="Speak in English"
                      >
                        <Volume2 className="w-5 h-5" />
                      </button>
                      <div className="space-y-3">
                        <div>
                          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Example {i + 1}</p>
                          <p className="text-2xl md:text-3xl font-display italic tracking-tight text-stone-900 leading-tight">
                            {ex.en}
                          </p>
                        </div>
                        <p className="text-lg text-stone-500 font-medium">
                          {ex.ml}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {!isGrammarLesson && currentContent.length === 0 && (
            <>
              {step === 0 && (
                <motion.div
                  key="step0"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-8"
                >
                  <h2 className="text-5xl font-display leading-[1.1]">The Core Concept: <br /><span className="italic text-stone-400 underline decoration-stone-200 underline-offset-8">Going To</span></h2>
                  <p className="text-xl text-stone-600 max-w-xl leading-relaxed">
                    We use "going to" when we have already made a decision or plan for the future.
                  </p>
                  <div className="p-8 rounded-3xl bg-white border border-stone-200 text-left space-y-4 shadow-xl shadow-stone-200/50">
                     <div className="flex items-center gap-3">
                       <button 
                         onClick={() => speak("I am going to start my new job next Monday.")}
                         className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform"
                       >
                          <Volume2 className="w-4 h-4" />
                       </button>
                       <p className="text-lg font-medium">"I am <span className="text-stone-400">going to</span> start my new job next Monday."</p>
                     </div>
                     <p className="text-sm text-stone-400 pl-11">(Decision made before the moment of speaking)</p>
                  </div>
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="w-full space-y-8"
                >
                  <h2 className="text-3xl font-display">Drag into the correct spot.</h2>
                  <div className="flex flex-col gap-6">
                     <p className="text-2xl">"I ________ leave for London tonight."</p>
                     <div className="flex justify-center gap-4">
                        {['was', 'am going to', 'should'].map((opt) => (
                          <button 
                            key={opt}
                            className={cn(
                              "px-6 py-4 rounded-2xl border-2 font-bold transition-all",
                              opt === 'am going to' ? "border-stone-900 bg-stone-900 text-white" : "border-stone-200 text-stone-400 hover:border-stone-400"
                            )}
                          >
                            {opt}
                          </button>
                        ))}
                     </div>
                  </div>
                </motion.div>
              )}

              {step === 2 && (
                 <motion.div key="step2" className="space-y-8">
                    <div className="w-24 h-24 bg-green-500 rounded-full mx-auto flex items-center justify-center text-white">
                       <CheckCircle2 className="w-12 h-12" />
                    </div>
                    <h2 className="text-4xl font-display">Correct!</h2>
                    <p className="text-lg text-stone-600">Great job understanding the intentional future plan.</p>
                 </motion.div>
              )}

              {step === 3 && (
                 <motion.div key="step3" className="space-y-8">
                    <h2 className="text-5xl font-display">Lesson Complete!</h2>
                    <p className="text-xl text-stone-600">You've earned 25 XP and mastered this module.</p>
                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-6 rounded-2xl bg-stone-900 text-white">
                          <div className="text-stone-400 text-[10px] font-bold uppercase mb-1">XP Gained</div>
                          <div className="text-2xl font-display">+25</div>
                       </div>
                       <div className="p-6 rounded-2xl bg-stone-100 border border-stone-200">
                          <div className="text-stone-400 text-[10px] font-bold uppercase mb-1">Accuracy</div>
                          <div className="text-2xl font-display text-stone-900">100%</div>
                       </div>
                    </div>
                 </motion.div>
              )}
            </>
          )}
        </AnimatePresence>

        {/* Next button — only shown for non-grammar lessons or non-fill states */}
        {!isGrammarLesson && (
          <button 
            onClick={() => step < totalSteps - 1 ? setStep(step + 1) : onClose()}
            className="px-12 py-5 bg-stone-900 text-white rounded-[2rem] font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-stone-200"
          >
            {step === totalSteps - 1 ? "Finish Pathway" : "Next Concept"}
          </button>
        )}
        </div>
      </div>
    </div>
  );
}
