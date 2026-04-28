import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Book, ChevronRight, Hash, Star, Clock, ArrowRight } from "lucide-react";
import { cn } from "../lib/utils";

type Story = {
  id: string;
  title: string;
  level: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  readTime: string;
  excerpt: string;
  content: string;
};

const STORIES: Story[] = [
  {
    id: "1",
    title: "The Mystery of the Old Clock",
    level: "Beginner",
    category: "Fiction",
    readTime: "5 min",
    excerpt: "Tom found a strange watch in his grandfather's attic. It didn't tell time...",
    content: "Tom found a strange watch in his grandfather's attic. It was silver and very old. When he touched the button, the room started to glow. He saw his grandfather from fifty years ago! His grandfather was a young man. He was wearing a hat and a long coat. Tom wanted to speak, but the light disappeared. The clock stopped ticking. Tom looked at the watch again. Was it a time machine? He decided to keep it safe. Tomorrow, he would try the button again."
  },
  {
    id: "2",
    title: "The Future of Artificial Intelligence",
    level: "Intermediate",
    category: "Technology",
    readTime: "8 min",
    excerpt: "AI is changing how we live and work. Is it a tool or a threat?",
    content: "Artificial Intelligence (AI) is no longer a concept limited to science fiction. It is integrated into our daily lives, from smartphones to medical diagnostics. While some argue that AI will automate mundane tasks and boost productivity, others express concern about job displacement and ethical implications. The challenge lies in developing regulations that foster innovation while protecting human interests. As we move forward, the collaboration between humans and machines will define the trajectory of our society."
  },
  {
    id: "3",
    title: "The Subtle Art of Negotiation",
    level: "Advanced",
    category: "Business",
    readTime: "12 min",
    excerpt: "Mastering the nuances of corporate dialogue and conflict resolution.",
    content: "Negotiation is far more than a simple transaction; it is a complex psychological interplay. To excel in a high-stakes corporate environment, one must possess not only linguistic precision but also acute emotional intelligence. Active listening serves as the foundation—understanding the underlying interests beneath an opponent's stated position is paramount. Furthermore, the deployment of strategic silence can often be more persuasive than a volley of counter-arguments. Ultimately, the most successful negotiators strive for sustainable, mutually beneficial outcomes rather than short-term victories."
  }
];

export default function ReadingRoom({ userData }: { userData: any }) {
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  return (
    <div className="p-8 md:p-16 max-w-7xl mx-auto space-y-16">
      <header className="space-y-6">
        <div className="flex items-center gap-3">
          <Book className="w-8 h-8 text-stone-900" />
          <h1 className="text-5xl md:text-7xl font-display font-medium tracking-tighter italic">Reading Room.</h1>
        </div>
        <p className="text-stone-500 text-xl max-w-xl font-light leading-relaxed">
          Enhance your comprehension through curated stories and articles tailored to your current level.
        </p>
      </header>

      <AnimatePresence mode="wait">
        {!selectedStory ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            {STORIES.map((story) => (
              <StoryCard key={story.id} story={story} onSelect={() => setSelectedStory(story)} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="reader"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="max-w-3xl mx-auto space-y-12 bg-white p-12 md:p-20 rounded-[4rem] shadow-2xl shadow-stone-200 border border-stone-100"
          >
            <div className="space-y-6 text-center">
               <button 
                onClick={() => setSelectedStory(null)}
                className="text-stone-400 hover:text-stone-900 text-xs font-bold uppercase tracking-widest flex items-center gap-2 mx-auto"
               >
                 <ChevronRight className="w-4 h-4 rotate-180" /> Back to library
               </button>
               <div className="space-y-2">
                 <span className="text-[10px] font-mono font-bold text-stone-400 uppercase bg-stone-50 px-3 py-1 rounded-full border border-stone-200">
                    {selectedStory.level} Level
                 </span>
                 <h2 className="text-4xl md:text-5xl font-display font-bold leading-tight tracking-tight italic">{selectedStory.title}</h2>
               </div>
            </div>

            <div className="prose prose-stone max-w-none">
               <p className="text-xl md:text-2xl text-stone-700 leading-relaxed font-light first-letter:text-6xl first-letter:font-display first-letter:mr-3 first-letter:float-left first-letter:font-bold italic">
                 {selectedStory.content}
               </p>
            </div>

            <div className="pt-12 border-t border-stone-100 flex flex-col md:flex-row items-center justify-between gap-8">
               <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-stone-900 rounded-2xl flex items-center justify-center text-white">
                     <Star className="w-6 h-6" />
                  </div>
                  <div className="text-left">
                     <div className="text-sm font-bold">Comprehension Check</div>
                     <p className="text-xs text-stone-400">Answer 3 questions to earn bonus XP</p>
                  </div>
               </div>
               <button className="px-8 py-4 bg-stone-900 text-white rounded-2xl font-bold hover:scale-105 transition-transform flex items-center gap-3">
                 Start Quiz <ArrowRight className="w-5 h-5" />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface StoryCardProps {
  key?: string | number;
  story: Story;
  onSelect: () => void;
}

function StoryCard({ story, onSelect }: StoryCardProps) {
  return (
    <button 
      onClick={onSelect}
      className="group relative text-left bg-white border border-stone-200 p-10 rounded-[3rem] space-y-8 cursor-pointer transition-all hover:bg-stone-900 hover:text-white hover:shadow-2xl hover:shadow-stone-300 hover:-translate-y-2 focus:outline-none focus:ring-2 focus:ring-stone-900"
    >
      <div className="flex items-center justify-between">
         <div className={cn(
           "px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest",
           story.level === "Beginner" ? "bg-green-100 text-green-700" :
           story.level === "Intermediate" ? "bg-blue-100 text-blue-700" :
           "bg-purple-100 text-purple-700"
         )}>
           {story.level}
         </div>
         <div className="flex items-center gap-1 text-stone-400 group-hover:text-stone-500">
            <Clock className="w-3 h-3" />
            <span className="text-[10px] font-mono font-bold uppercase">{story.readTime}</span>
         </div>
      </div>

      <div className="space-y-3">
         <h3 className="text-3xl font-display font-medium tracking-tight leading-tight italic">{story.title}</h3>
         <p className="text-stone-500 group-hover:text-stone-300 text-sm leading-relaxed">{story.excerpt}</p>
      </div>

      <div className="flex items-center gap-2 pt-4 opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 duration-300">
         <span className="text-xs font-bold uppercase tracking-widest">Read Article</span>
         <ChevronRight className="w-4 h-4" />
      </div>

      <div className="absolute bottom-6 right-8 text-stone-100 group-hover:text-white/5 pointer-events-none transition-colors">
         <Hash className="w-20 h-20 rotate-12" />
      </div>
    </button>
  );
}
