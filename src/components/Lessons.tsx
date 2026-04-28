import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  CheckCircle2, 
  Circle, 
  Play, 
  ChevronRight, 
  Lock, 
  MoreHorizontal,
  ArrowLeft,
  X,
  Volume2,
  GraduationCap
} from "lucide-react";
import { speak } from "../lib/speech";
import { cn } from "../lib/utils";
import { api } from "../services/api";

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
    return <LessonInterface lesson={activeLesson} onClose={() => setActiveLesson(null)} />;
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

function LessonInterface({ lesson, onClose }: { lesson: LessonItem, onClose: () => void }) {
  const [step, setStep] = useState(0);
  
  const presentTenses = [
    { 
      name: "Simple Present", 
      nameMl: "സാധാരണ വർത്തമാന കാലം",
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

  const currentContent = getStepContent();
  const totalSteps = currentContent.length > 0 ? currentContent.length : 4;

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
               animate={{ width: `${(step / (totalSteps - 1)) * 100}%` }}
               className="h-full bg-stone-900 rounded-full"
             />
           </div>
        </div>
        <div className="text-xs font-mono font-bold text-stone-400 uppercase px-4 py-1 bg-stone-50 border border-stone-200 rounded-lg">
           Step {step + 1} / {totalSteps}
        </div>
      </nav>

      <div className="flex-1 overflow-y-auto p-8 text-center max-w-3xl mx-auto space-y-12 scrollbar-hide">
        <div className="min-h-full flex flex-col items-center justify-center py-12">
          <AnimatePresence mode="wait">
          {currentContent.length > 0 ? (
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
          ) : (
            // Original hardcoded steps for other lessons
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

        <button 
          onClick={() => step < totalSteps - 1 ? setStep(step + 1) : onClose()}
          className="px-12 py-5 bg-stone-900 text-white rounded-[2rem] font-bold text-lg hover:scale-105 active:scale-95 transition-all shadow-xl shadow-stone-200"
        >
          {step === totalSteps - 1 ? "Finish Pathway" : "Next Concept"}
        </button>
        </div>
      </div>
    </div>
  );
}
