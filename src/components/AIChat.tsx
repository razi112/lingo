import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Send, Bot, User, Sparkles, Mic, Volume2 } from "lucide-react";
import { chatWithNabu } from "../services/api";
import { speak, createSpeechRecognition } from "../lib/speech";
import { cn } from "../lib/utils";

interface Message {
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp: Date;
}

export default function AIChat({ userData }: { userData: any }) {
  const [scenario, setScenario] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const [playingId, setPlayingId] = useState<number | null>(null);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    if (!recognitionRef.current) {
      recognitionRef.current = createSpeechRecognition();
    }
    
    if (recognitionRef.current) {
      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };
      recognitionRef.current.onerror = () => setIsListening(false);
      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const SCENARIOS = [
    { id: 'coffee', icon: '☕', color: 'bg-orange-50', label: 'Ordering Coffee', prompt: "I am a barista at a busy London cafe. Let's practice ordering your coffee and maybe a pastry!" },
    { id: 'travel', icon: '✈️', color: 'bg-blue-50', label: 'Asking for Directions', prompt: "You are in NYC and need to find Central Park. Ask me for directions and practice polite inquiries." },
    { id: 'job', icon: '💼', color: 'bg-rose-50', label: 'Job Interview', prompt: "I am the hiring manager for a tech company. Let's practice common interview questions and your self-introduction." },
    { id: 'free', icon: '🦉', color: 'bg-amber-50', label: 'Free Conversation', prompt: "Let's talk about anything! Tell me about your day or a book you're reading." }
  ];

  const startScenario = (s: typeof SCENARIOS[0]) => {
     try {
       setScenario(s.label);
       setMessages([
         {
           role: 'model',
           parts: [{ text: `Great choice! ${s.prompt} How would you like to start?` }],
           timestamp: new Date()
         }
       ]);
     } catch (err) {
       console.error("Failed to start scenario:", err);
     }
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  }, [messages, isTyping]);

  if (!scenario) {
    return (
      <div className="p-8 md:p-16 max-w-5xl mx-auto space-y-16">
        <header className="space-y-6">
           <h1 className="text-5xl md:text-7xl font-display font-medium tracking-tighter italic">Speaking Lab.</h1>
           <p className="text-stone-500 text-xl max-w-xl font-light">
             Choose a scenario to practice real-world interactions with Nabu, our AI language partner.
           </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-32">
           {SCENARIOS.map((s) => (
             <button 
              key={s.id}
              onClick={() => startScenario(s)}
              className="group text-left p-10 bg-white border border-stone-200 rounded-[3.5rem] space-y-8 cursor-pointer transition-all hover:border-stone-900 hover:shadow-2xl hover:shadow-stone-200 hover:-translate-y-1 focus:outline-none focus:ring-2 focus:ring-stone-900"
             >
                <div className={cn("w-20 h-20 rounded-[2rem] flex items-center justify-center text-4xl shadow-sm group-hover:scale-110 transition-transform duration-500", s.color)}>
                   {s.icon}
                </div>
                <div className="space-y-3">
                   <h3 className="text-4xl font-display font-bold italic tracking-tight text-stone-900">{s.label}</h3>
                   <p className="text-stone-500 text-lg leading-relaxed font-light">{s.prompt}</p>
                </div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest pt-4 opacity-40 group-hover:opacity-100 transition-all">
                   Start Session <Sparkles className="w-4 h-4" />
                </div>
             </button>
           ))}
        </div>
      </div>
    );
  }

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage: Message = {
      role: 'user',
      parts: [{ text: input }],
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const history = [...messages, userMessage].map(m => ({
        role: m.role,
        parts: m.parts
      }));
      const responseText = await chatWithNabu(history);
      
      const nabuMessage: Message = {
        role: 'model',
        parts: [{ text: responseText || "I'm sorry, I couldn't process that. Can you try again?" }],
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, nabuMessage]);
    } catch (err) {
      console.error("Chat error:", err);
    } finally {
      setIsTyping(false);
    }
  };

  const handleMic = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleListen = (id: number, text: string) => {
    setPlayingId(id);
    speak(text);
    // Rough estimate of speech duration to stop animation
    const duration = text.length * 80; 
    setTimeout(() => setPlayingId(null), Math.max(2000, duration));
  };

  return (
    <div className="h-full flex flex-col bg-stone-50">
      {/* Header */}
      <header className="p-6 border-b border-stone-200 bg-white/80 backdrop-blur-md sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
           onClick={() => setScenario(null)}
           className="p-2 hover:bg-stone-100 rounded-full transition-colors flex items-center gap-2"
          >
             <User className="w-5 h-5" />
             <span className="text-xs font-bold hidden md:block">Exit</span>
          </button>
          <div>
            <h2 className="font-display font-medium text-xl leading-tight italic">{scenario}</h2>
            <p className="text-[10px] uppercase tracking-widest text-stone-400 font-bold">Immersive Session Active</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
           <button className="px-4 py-2 bg-stone-900 text-white rounded-xl text-xs font-bold hover:bg-stone-800 transition-colors uppercase tracking-widest">
              Session Stats
           </button>
        </div>
      </header>

      {/* Chat Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6"
      >
        <AnimatePresence>
          {messages.map((msg, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={cn(
                "flex gap-4 max-w-[85%]",
                msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                msg.role === 'user' ? "bg-stone-200" : "bg-stone-900"
              )}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-stone-600" /> : <Bot className="w-4 h-4 text-white" />}
              </div>
              <div className={cn(
                "space-y-2 p-5 rounded-3xl",
                msg.role === 'user' 
                  ? "bg-white border border-stone-200 text-stone-800 rounded-tr-none shadow-sm" 
                  : "bg-stone-900 text-stone-100 rounded-tl-none shadow-xl"
              )}>
                <p className="leading-relaxed whitespace-pre-wrap">{msg.parts[0].text}</p>
                <div className="flex items-center justify-between gap-4 mt-2">
                   <span className="text-[10px] opacity-40 font-mono">
                     {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                   </span>
                   {msg.role === 'model' && (
                     <button 
                       onClick={() => handleListen(idx, msg.parts[0].text)}
                       className={cn(
                         "flex items-center gap-2 transition-all p-1 px-2 rounded-lg",
                         playingId === idx ? "bg-white text-stone-900 shadow-sm" : "opacity-60 hover:opacity-100"
                       )}
                     >
                        {playingId === idx ? (
                          <div className="flex gap-0.5 items-center justify-center h-3">
                            {[1, 2, 3, 4].map((i) => (
                              <motion.div
                                key={i}
                                animate={{ height: [4, 12, 6, 12, 4] }}
                                transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                                className="w-0.5 bg-stone-900 rounded-full"
                              />
                            ))}
                          </div>
                        ) : (
                          <Volume2 className="w-3 h-3" />
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-tighter">
                          {playingId === idx ? "Listening..." : "Listen"}
                        </span>
                     </button>
                   )}
                </div>
              </div>
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex gap-4 mr-auto"
            >
              <div className="w-8 h-8 rounded-full bg-stone-900 flex items-center justify-center text-white shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-stone-100 p-4 rounded-3xl rounded-tl-none flex gap-1">
                {[0.2, 0.4, 0.6].map(delay => (
                  <motion.div
                    key={delay}
                    animate={{ y: [0, -4, 0] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay }}
                    className="w-1.5 h-1.5 bg-stone-400 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <footer className="p-6 bg-white border-t border-stone-200">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button 
            onClick={handleMic}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
              isListening ? "bg-red-500 text-white animate-pulse" : "bg-stone-100 text-stone-500 hover:text-stone-900 hover:bg-stone-200"
            )}
          >
            <Mic className="w-6 h-6" />
          </button>
          <div className="flex-1 relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Message Nabu AI..."
              className="w-full bg-stone-100 border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-stone-200 outline-none transition-all placeholder:text-stone-400 font-medium"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={cn(
                "absolute right-2 top-2 w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                input.trim() ? "bg-stone-900 text-white shadow-lg" : "bg-stone-200 text-stone-400"
              )}
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
        <p className="text-center text-[10px] text-stone-400 uppercase tracking-widest mt-4 font-bold">Powered by Gemini & Nabu Intelligence</p>
      </footer>
    </div>
  );
}
