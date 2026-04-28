import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Languages, Sparkles, Volume2, Info, ArrowRight, Mic } from "lucide-react";
import { speak, createSpeechRecognition } from "../lib/speech";
import { GoogleGenAI } from "@google/genai";
import { cn } from "../lib/utils";

export default function MindTranslator() {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    recognitionRef.current = createSpeechRecognition();
    if (recognitionRef.current) {
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
      // For Malayalam recognition if supported
      recognitionRef.current.lang = 'ml-IN';
    }
  }, []);

  const handleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const [result, setResult] = useState<{
    english: string;
    explanation: string;
    alternatives: string[];
    pronunciation: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const translateMalayalam = async () => {
    if (!input.trim()) return;
    setIsLoading(true);
    
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not defined");
      }
      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
        Translate this Malayalam sentence to natural English for a beginner: "${input}"
        Provide the response in the following JSON format:
        {
          "english": "The main translation",
          "explanation": "Simple explanation in English of why we use this phrasing, related to Malayalam structure if possible",
          "alternatives": ["2 other ways to say this", "casual/formal version"],
          "pronunciation": "Simple phonetic guide for a Malayalam speaker"
        }
      `;

      const res = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      const text = res.text;
      if (!text) throw new Error("No response from AI");
      const cleanJson = text.trim();
      setResult(JSON.parse(cleanJson));
    } catch (error) {
      console.error("Translation error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 md:p-16 max-w-4xl mx-auto space-y-12">
      <header className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-stone-200">
            <Languages className="w-6 h-6" />
          </div>
          <h1 className="text-4xl md:text-6xl font-display font-medium tracking-tighter italic">Mind Translator.</h1>
        </div>
        <p className="text-stone-500 text-lg max-w-xl font-light">
          Type your thoughts in Malayalam. Lingo will convert them to natural English and explain the logic.
        </p>
      </header>

      <div className="relative group">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="മലയാളത്തിൽ ടൈപ്പ് ചെയ്യുക... (e.g. എനിക്ക് ഒരു ചായ വേണം)"
          className="w-full h-40 p-8 pt-10 text-2xl font-medium bg-white border border-stone-200 rounded-[2.5rem] shadow-2xl shadow-stone-200/50 focus:ring-0 focus:border-stone-900 transition-all outline-none resize-none placeholder:text-stone-300"
        />
        <div className="absolute top-4 left-8 text-[10px] font-bold text-stone-400 uppercase tracking-widest pointer-events-none">
          Malayalam Thought
        </div>
        <div className="absolute top-6 right-6 flex gap-2">
          <button
            onClick={handleMic}
            className={cn(
              "p-4 rounded-2xl transition-all shadow-lg",
              isListening ? "bg-red-500 text-white animate-pulse" : "bg-white border border-stone-200 text-stone-400 hover:text-stone-900"
            )}
          >
            <Mic className="w-5 h-5" />
          </button>
          <button
            onClick={translateMalayalam}
            disabled={isLoading || !input.trim()}
            className={cn(
              "p-4 rounded-2xl transition-all flex items-center gap-3",
              isLoading ? "bg-stone-100 text-stone-400" : "bg-stone-900 text-white hover:scale-105 active:scale-95 shadow-xl shadow-stone-400/20"
            )}
          >
          {isLoading ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
              <Sparkles className="w-6 h-6" />
            </motion.div>
          ) : (
            <>
              <span className="text-sm font-bold uppercase tracking-widest hidden md:block">Translate</span>
              <Send className="w-5 h-5" />
            </>
          )}
        </button>
      </div>
    </div>

    <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Main Translation Card */}
            <div className="bg-white border-2 border-stone-900 p-12 rounded-[4rem] shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Sparkles className="w-24 h-24" />
               </div>
               
               <div className="space-y-8 relative">
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.4em]">English Result</span>
                    <h2 className="text-5xl font-display font-medium tracking-tight italic text-stone-900 leading-tight">
                      "{result.english}"
                    </h2>
                    <button 
                      onClick={() => speak(result.english)}
                      className="flex items-center gap-3 text-stone-400 hover:text-stone-900 transition-colors bg-transparent border-none cursor-pointer group/speaker focus:outline-none"
                    >
                       <div className="p-2 rounded-lg group-hover/speaker:bg-stone-100 transition-colors">
                          <Volume2 className="w-5 h-5" />
                       </div>
                       <span className="text-sm font-mono tracking-widest uppercase">{result.pronunciation}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 pt-8 border-t border-stone-100">
                     <div className="space-y-4">
                        <div className="flex items-center gap-2 text-stone-900">
                           <Info className="w-4 h-4" />
                           <span className="text-[10px] font-bold uppercase tracking-widest">Why this way?</span>
                        </div>
                        <p className="text-sm text-stone-500 leading-relaxed font-light">
                          {result.explanation}
                        </p>
                     </div>
                     <div className="space-y-4">
                        <div className="flex items-center gap-2 text-stone-900">
                           <Sparkles className="w-4 h-4" />
                           <span className="text-[10px] font-bold uppercase tracking-widest">Natural Alternatives</span>
                        </div>
                        <ul className="space-y-3">
                           {result.alternatives.map((alt, i) => (
                             <li key={i} className="flex items-center gap-2 text-stone-600 text-sm italic">
                               <ArrowRight className="w-3 h-3 text-stone-300" /> {alt}
                             </li>
                           ))}
                        </ul>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
