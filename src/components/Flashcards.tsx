import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Zap, RotateCcw, Check, X, Bookmark, Volume2, Info } from "lucide-react";
import { api } from "../services/api";
import { cn } from "../lib/utils";
import { speak } from "../lib/speech";

type Card = {
  word: string;
  definition: string;
  ml: string;
  example: string;
  category: string;
};

const WORD_POOL: Card[] = [
  { word: "Breakfast", definition: "First meal of the day", ml: "പ്രഭാതഭക്ഷണം", example: "I had eggs for breakfast.", category: "Food" },
  { word: "Delicious", definition: "Tasting very good", ml: "രുചികരമായ", example: "This biryani is delicious!", category: "Food" },
  { word: "Transparent", definition: "Allowing light to pass through", ml: "സുതാര്യമായ", example: "The glass is transparent.", category: "General" },
  { word: "Exhausted", definition: "Very tired", ml: "വളരെ ക്ഷീണിച്ചു", example: "I am exhausted after the long trip.", category: "Emotions" },
  { word: "Bargain", definition: "A cheap price for something", ml: "ലാഭകരമായ ഇടപാട് / വിലപേശൽ", example: "This shirt was a real bargain.", category: "Shopping" },
  { word: "Adventure", definition: "An unusual and exciting experience", ml: "സാഹസികത", example: "The hike was a great adventure.", category: "Leisure" },
  { word: "Grateful", definition: "Feeling or showing an appreciation for something", ml: "കൃതജ്ഞതയുള്ള", example: "I am grateful for your help.", category: "Emotions" },
  { word: "Courage", definition: "The ability to do something that frightens one", ml: "ധൈര്യം", example: "She had the courage to speak up.", category: "Virtues" },
  { word: "Harmony", definition: "Consistent, orderly, or pleasing arrangement of parts", ml: "ഐക്യം / യോജിപ്പ്", example: "They live in perfect harmony.", category: "General" },
  { word: "Curiosity", definition: "A strong desire to know or learn something", ml: "അന്വേഷണതൽപരത / കൗതുകം", example: "His curiosity led him to explore the attic.", category: "Traits" },
  { word: "Optimistic", definition: "Hopeful and confident about the future", ml: "ശുഭാപ്തിവിശ്വാസമുള്ള", example: "He is optimistic about the new job.", category: "Emotions" },
  { word: "Punctual", definition: "Happening or doing something at the agreed time", ml: "കൃത്യനിഷ്ഠയുള്ള", example: "Please try to be punctual.", category: "Professional" },
  { word: "Humble", definition: "Having or showing a modest or low estimate of one's importance", ml: "വിനയമുള്ള", example: "He is a very humble person.", category: "Virtues" },
  { word: "Resilient", definition: "Able to withstand or recover quickly from difficult conditions", ml: "തിരിച്ചുവരാൻ ശേഷിയുള്ള", example: "Children are often very resilient.", category: "Traits" },
  { word: "Magnificent", definition: "Extremely beautiful, elaborate, or impressive", ml: "മനോഹരമായ / ഗംഭീരമായ", example: "The view from the palace was magnificent.", category: "Adjectives" }
];

export default function Flashcards({ userData }: { userData: any }) {
  const [cards, setCards] = useState<Card[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    // Select 5 words based on the date
    const today = new Date();
    const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
    
    // Seeded random-ish selection
    let hash = 0;
    for (let i = 0; i < dateString.length; i++) {
      hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
      hash |= 0;
    }
    
    const startIndex = Math.abs(hash) % WORD_POOL.length;
    const selectedCards = [];
    for (let i = 0; i < 5; i++) {
       selectedCards.push(WORD_POOL[(startIndex + i) % WORD_POOL.length]);
    }
    setCards(selectedCards);
  }, []);

  if (cards.length === 0) return null;

  const currentCard = cards[currentIndex];

  const handleReview = async (success: boolean) => {
    setDirection(success ? 1 : -1);
    setIsFlipped(false);
    
    // Simulate API call and SRS logic
    setTimeout(() => {
      setCurrentIndex((prev) => (prev + 1) % cards.length);
      setDirection(0);
    }, 400);
  };

  return (
    <div className="h-full flex flex-col p-8 md:p-16 max-w-5xl mx-auto space-y-12">
      <header className="flex items-center justify-between">
        <div className="space-y-2">
           <div className="flex items-center gap-3">
              <Zap className="w-8 h-8 text-amber-500 fill-amber-500" />
              <h1 className="text-4xl md:text-5xl font-display font-medium tracking-tight italic">Memory Vault.</h1>
           </div>
           <p className="text-stone-400 text-sm font-mono uppercase tracking-[0.2em]">Spaced Repetition Review</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="text-right hidden md:block">
              <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Session Progress</div>
              <div className="text-lg font-mono font-bold">{currentIndex + 1} / {cards.length}</div>
           </div>
           <button className="p-4 bg-white border border-stone-200 rounded-2xl hover:bg-stone-50 transition-colors">
              <RotateCcw className="w-5 h-5 text-stone-500" />
           </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center perspective-[1000px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: direction * 100, scale: 0.9, rotateY: 0 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -direction * 100, scale: 0.9 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="w-full max-w-sm aspect-[3/4] relative cursor-pointer group"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            {/* Card Content */}
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring" }}
              className="w-full h-full relative preserve-3d"
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden bg-white border-[1px] border-stone-200 rounded-[3.5rem] shadow-2xl shadow-stone-200 p-12 flex flex-col items-center justify-center text-center space-y-8">
                  <div className="w-12 h-12 bg-stone-50 rounded-full flex items-center justify-center text-stone-300">
                     <Bookmark className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{currentCard.category}</span>
                    <h2 className="text-5xl font-display font-bold tracking-tighter text-stone-900">{currentCard.word}</h2>
                  </div>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      speak(currentCard.word);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-stone-100 rounded-xl text-stone-400 hover:bg-stone-200 hover:text-stone-900 transition-colors z-10"
                  >
                     <Volume2 className="w-4 h-4" />
                     <span className="text-xs font-mono font-bold uppercase tracking-widest">Listen</span>
                  </button>
                  <p className="text-stone-300 text-[10px] font-bold uppercase tracking-[0.3em] absolute bottom-12">Click to reveal meaning</p>
              </div>

              {/* Back */}
              <div className="absolute inset-0 backface-hidden bg-stone-900 border-stone-800 rounded-[3.5rem] shadow-2xl p-12 flex flex-col items-center justify-center text-center space-y-8 rotate-y-180">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.4em]">Malayalam</span>
                    <p className="text-3xl font-display text-white italic">{currentCard.ml}</p>
                    <p className="text-stone-400 text-sm leading-tight text-center max-w-[80%] mx-auto">{currentCard.definition}</p>
                  </div>
                  <div className="space-y-4 pt-8 border-t border-stone-800">
                    <span className="text-[10px] font-bold text-stone-500 uppercase tracking-[0.4em]">Example</span>
                    <p className="text-sm text-stone-300 leading-relaxed font-light">{currentCard.example}</p>
                  </div>
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div className="mt-12 flex items-center gap-8">
           <button 
             onClick={(e) => { e.stopPropagation(); handleReview(false); }}
             className="w-20 h-20 bg-stone-50 border border-stone-200 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all shadow-lg hover:scale-110 active:scale-95"
           >
             <X className="w-8 h-8" />
           </button>
           <button 
             onClick={(e) => { e.stopPropagation(); handleReview(true); }}
             className="w-24 h-24 bg-white border border-stone-200 rounded-full flex items-center justify-center text-stone-400 hover:bg-stone-900 hover:text-white hover:border-stone-900 transition-all shadow-xl hover:scale-110 active:scale-95"
           >
             <Check className="w-10 h-10" />
           </button>
        </div>
      </div>

      <footer className="bg-stone-100 p-6 rounded-3xl flex items-center gap-4">
         <Info className="w-5 h-5 text-stone-400 shrink-0" />
         <p className="text-xs text-stone-500 font-medium leading-relaxed">
           Lingo uses <span className="font-bold text-stone-900">Spaced Repetition (SRS)</span>. Correct answers will push this word further into the future, while incorrect ones will bring it back sooner.
         </p>
      </footer>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}
