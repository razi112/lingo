import { motion } from "motion/react";
import { Zap, Trophy, Clock, ChevronRight, Star, GraduationCap, Languages } from "lucide-react";
import { cn } from "../lib/utils";

interface DashboardProps {
  userData: any;
  setView: (view: any) => void;
}

export default function Dashboard({ userData, setView }: DashboardProps) {
  return (
    <div className="p-8 md:p-16 max-w-7xl mx-auto space-y-20">
      {/* Hero Welcome */}
      <header className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <div className="flex items-center gap-4">
             <span className="px-4 py-1.5 bg-stone-900 text-white text-[10px] font-bold uppercase tracking-[0.3em] rounded-full shadow-lg shadow-stone-200">Level {userData.level}</span>
             <div className="h-px w-12 bg-stone-200" />
             <span className="text-stone-400 text-xs font-mono uppercase tracking-tighter">Ranking: Top 5% Globally</span>
          </div>
          <h1 className="text-6xl md:text-8xl font-display font-medium tracking-tighter leading-[0.85]">
            Mindful<br />
            <span className="italic text-stone-400">Progression.</span>
          </h1>
          <p className="text-stone-500 text-xl max-w-md leading-relaxed font-light">
            Welcome back, <span className="font-bold text-stone-900 underline decoration-stone-200 underline-offset-8">{userData.name}</span>. You're just <span className="text-stone-900 font-semibold">12 XP</span> away from your daily threshold.
          </p>
        </div>

        <div className="relative group">
           <div className="absolute inset-0 bg-stone-900/5 rounded-[3rem] -rotate-3 scale-105 group-hover:rotate-0 transition-transform duration-500" />
           <div className="relative bg-white border border-stone-200 p-8 rounded-[3rem] shadow-2xl shadow-stone-200 overflow-hidden">
              <div className="flex items-center justify-between mb-8">
                 <h3 
                  className="font-display font-bold text-2xl italic tracking-tight border-b-2"
                  style={{ borderColor: '#cb6f35' }}
                >
                  Active Streak
                </h3>
                 <Zap className="w-8 h-8 text-amber-500 fill-amber-500" />
              </div>
              <div className="flex items-end gap-1 mb-8">
                {Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="flex-1 space-y-2">
                    <div 
                      className="h-16 bg-stone-50 rounded-lg overflow-hidden relative border"
                      style={i === 0 ? { borderColor: '#ff6300' } : {}}
                    >
                       <motion.div 
                        initial={{ height: 0 }}
                        animate={{ height: `${[40, 70, 90, 60, 80, 100, 20][i]}%` }}
                        className={cn(
                          "absolute bottom-0 w-full rounded-t-sm",
                          i === 5 ? "bg-amber-400" : "bg-stone-900"
                        )}
                       />
                    </div>
                    <div className="text-[10px] font-mono font-bold text-stone-400 text-center uppercase">{['M','T','W','T','F','S','S'][i]}</div>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-stone-50 rounded-2xl flex items-center justify-between">
                 <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">Consistency Score</span>
                 <span className="font-mono text-stone-900 font-bold">94%</span>
              </div>
           </div>
        </div>
      </header>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-8">
        <StatCard 
          icon={Zap} 
          label="Current Momentum" 
          value={userData.streak} 
          suffix="Days" 
          color="text-amber-500" 
          trend="+2.1%"
        />
        <StatCard 
          icon={Star} 
          label="Knowledge Base" 
          value={userData.xp} 
          suffix="XP" 
          color="text-stone-900" 
          trend="Steady"
        />
        <StatCard 
          icon={Clock} 
          label="Focus Duration" 
          value="12.4" 
          suffix="Hrs" 
          color="text-stone-400" 
          trend="+1.2h"
        />
        <div className="bg-white border border-stone-200 p-8 rounded-[3rem] flex flex-col justify-center space-y-4">
           <div className="flex items-center justify-between text-[10px] font-bold text-stone-400 uppercase tracking-widest">
              <span>Overall Mastery</span>
              <span>84%</span>
           </div>
           <div className="h-2 w-full bg-stone-50 rounded-full overflow-hidden border border-stone-100">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '84%' }}
                className="h-full bg-stone-900 rounded-full"
              />
           </div>
        </div>
      </section>

      {/* Main Focus */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="relative group overflow-hidden rounded-[3.5rem] bg-stone-900 text-white p-12 flex flex-col justify-between aspect-square md:aspect-auto md:h-[400px]">
          <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity">
            <GraduationCap className="w-80 h-80 -mr-24 -mt-24 rotate-12" />
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
               <span className="text-xs font-bold uppercase tracking-[0.4em] text-stone-500">Reserved Pathway</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-display font-medium leading-[1] tracking-tighter">Essential <br />Basic Greetings.</h2>
            <p className="text-stone-400 text-lg max-w-sm font-light">Start your journey with the most common ways to introduce yourself in Malayalam & English.</p>
          </div>

          <div className="relative z-10 mt-12">
            <button 
              onClick={() => setView("lessons")}
              className="px-10 py-5 bg-white text-stone-900 rounded-3xl font-bold flex items-center gap-4 hover:gap-6 transition-all group/btn shadow-xl shadow-black/20"
            >
              Start Module 1
              <ChevronRight className="w-6 h-6 transition-transform" />
            </button>
          </div>
        </div>

        <div className="rounded-[3.5rem] bg-stone-100 border border-stone-200 p-12 flex flex-col justify-between md:h-[400px]">
           <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-stone-200 rounded-full">
                <div className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Practice Tool</span>
              </div>
             <h2 className="text-4xl md:text-5xl font-display font-medium leading-[1] tracking-tighter">Mind <br />Translation Engine.</h2>
             <p className="text-stone-500 text-lg max-w-sm font-light">Type your thoughts in Malayalam and get the perfect English equivalent instantly.</p>
           </div>
           
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mt-12">
             <div className="flex items-center gap-4">
               <div className="flex -space-x-4">
                 {[1,2,3,4].map(i => (
                   <div key={i} className="w-12 h-12 rounded-2xl border-4 border-stone-100 bg-stone-300 shadow-sm" />
                 ))}
               </div>
               <div className="flex flex-col">
                 <span className="text-sm font-bold text-stone-900 tracking-tight">12.4k Learners</span>
                 <span className="text-[10px] font-mono text-stone-400 uppercase">Live Everywhere</span>
               </div>
             </div>

             <button 
              onClick={() => setView("translator")}
              className="px-10 py-5 bg-stone-900 text-white rounded-3xl font-bold flex items-center gap-4 hover:bg-stone-800 transition-all shadow-xl shadow-stone-200"
             >
               Try Translator
             </button>
           </div>
        </div>
      </section>

      {/* Vocabulary SRS Preview */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-1">
            <h2 className="text-3xl font-display tracking-tight leading-none">Spaced Repetition</h2>
            <p className="text-stone-400 text-sm font-mono uppercase tracking-widest">Targeting Retention</p>
          </div>
          <button className="text-[11px] font-bold text-stone-400 hover:text-stone-900 transition-colors uppercase tracking-[0.3em] bg-stone-50 border border-stone-200 px-6 py-2.5 rounded-full">Explore Deck</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        <VocabCard word="Breakfast" strength={0.8} phonetic="പ്രഭാതഭക്ഷണം" />
        <VocabCard word="Delicious" strength={0.4} phonetic="രുചികരമായ" />
        <VocabCard word="Exhausted" strength={0.65} phonetic="ക്ഷീണിച്ചു" />
        <VocabCard word="Bargain" strength={0.9} phonetic="വിലപേശൽ" />
        </div>
      </section>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, suffix, color, trend }: any) {
  return (
    <div className="bg-white border border-stone-200 p-10 rounded-[3rem] space-y-6 shadow-sm hover:shadow-xl hover:shadow-stone-200 transition-all group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center bg-stone-50 group-hover:bg-stone-900 group-hover:text-white transition-colors duration-500", color)}>
            <Icon className="w-5 h-5" />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-stone-400">{label}</span>
        </div>
        <span className="text-[10px] font-mono font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-md">{trend}</span>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-5xl font-display font-medium tracking-tighter leading-none">{value}</span>
        <span className="text-stone-300 font-mono text-sm uppercase font-bold">{suffix}</span>
      </div>
    </div>
  );
}

function VocabCard({ word, strength, phonetic }: { word: string, strength: number, phonetic: string }) {
  return (
    <div className="bg-white border border-stone-200 p-8 rounded-[2.5rem] space-y-6 group cursor-pointer hover:border-stone-900 hover:shadow-2xl hover:shadow-stone-200 transition-all relative overflow-hidden">
      <div className="space-y-1 relative z-10">
        <h3 className="font-display font-bold text-2xl tracking-tight leading-none">{word}</h3>
        <p className="text-[10px] font-mono text-stone-400 uppercase tracking-tighter">{phonetic}</p>
      </div>
      
      <div className="space-y-2 relative z-10">
        <div className="flex justify-between text-[9px] font-bold text-stone-400 uppercase tracking-widest">
           <span>Memory Intensity</span>
           <span className="text-stone-900">{Math.round(strength * 100)}%</span>
        </div>
        <div className="h-1.5 w-full bg-stone-100 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${strength * 100}%` }}
            className={cn(
              "h-full rounded-full transition-colors duration-500",
              strength < 0.5 ? "bg-amber-400" : "bg-stone-900"
            )}
          />
        </div>
      </div>

      <div className="absolute top-2 right-4 text-stone-50 group-hover:text-stone-100 transition-colors">
         <Star className="w-12 h-12 rotate-12 opacity-20" />
      </div>
    </div>
  );
}
