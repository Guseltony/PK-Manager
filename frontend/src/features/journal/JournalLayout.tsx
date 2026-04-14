"use client";

import { useState, useEffect, useRef } from "react";
import { useJournal } from "../../hooks/useJournal";
import dayjs from "dayjs";
import { FiCheck, FiSave } from "react-icons/fi";
import { RiEmotionHappyLine, RiEmotionNormalLine, RiEmotionUnhappyLine } from "react-icons/ri";
import { FaRegSmileBeam } from "react-icons/fa";

export default function JournalLayout() {
  const [currentDate] = useState(new Date());
  const { entry, isLoading, updateEntry, isSaving } = useJournal(currentDate);

  const [content, setContent] = useState("");
  const [mood, setMood] = useState<"great" | "good" | "neutral" | "bad" | undefined>(undefined);
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync state with fetching
  useEffect(() => {
    if (entry) {
      setContent(entry.content);
      setMood(entry.mood);
    }
  }, [entry]);

  const handleContentChange = (val: string) => {
    setContent(val);
    
    // Auto-save logic (debounce 1000ms)
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (entry) updateEntry({ id: entry.id, payload: { content: val } });
    }, 1000);
  };

  const handleMoodSelect = (selectedMood: "great" | "good" | "neutral" | "bad") => {
    setMood(selectedMood);
    if (entry) updateEntry({ id: entry.id, payload: { mood: selectedMood } });
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex justify-center items-center bg-[#FAFAFA] dark:bg-[#0D0D12]">
        <div className="animate-pulse text-text-muted">Opening your journal...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFAFA] dark:bg-[#0D0D12]">
      
      {/* HEADER (Date and Mood) */}
      <div className="w-full max-w-3xl mx-auto px-8 py-10 pb-0">
        <header className="flex justify-between items-end border-b border-white/5 pb-4">
          <div>
            <span className="text-brand-primary uppercase tracking-[0.2em] font-bold text-[10px]">Today</span>
            <h1 className="text-3xl font-display font-medium text-text-main mt-1">
              {dayjs(currentDate).format("dddd, MMMM D")}
            </h1>
          </div>

          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-full border border-white/5">
              <button onClick={() => handleMoodSelect("great")} className={`p-2 rounded-full transition-all ${mood === 'great' ? 'bg-amber-500/20 text-amber-500' : 'text-text-muted hover:bg-white/5'}`} title="Great"><FaRegSmileBeam size={18} /></button>
              <button onClick={() => handleMoodSelect("good")} className={`p-2 rounded-full transition-all ${mood === 'good' ? 'bg-emerald-500/20 text-emerald-500' : 'text-text-muted hover:bg-white/5'}`} title="Good"><RiEmotionHappyLine size={18} /></button>
              <button onClick={() => handleMoodSelect("neutral")} className={`p-2 rounded-full transition-all ${mood === 'neutral' ? 'bg-blue-500/20 text-blue-500' : 'text-text-muted hover:bg-white/5'}`} title="Neutral"><RiEmotionNormalLine size={18} /></button>
              <button onClick={() => handleMoodSelect("bad")} className={`p-2 rounded-full transition-all ${mood === 'bad' ? 'bg-red-500/20 text-red-500' : 'text-text-muted hover:bg-white/5'}`} title="Bad"><RiEmotionUnhappyLine size={18} /></button>
            </div>
          </div>
        </header>

        {/* SAVE INDICATOR */}
        <div className="flex justify-end pt-2 h-6">
          {isSaving ? (
            <span className="text-[10px] text-text-muted flex items-center gap-1 uppercase tracking-widest"><FiSave className="animate-spin" /> Saving...</span>
          ) : (
            <span className="text-[10px] text-emerald-500 flex items-center gap-1 uppercase tracking-widest opacity-50"><FiCheck /> Saved</span>
          )}
        </div>
      </div>

      {/* WRITING AREA */}
      <div className="flex-1 w-full max-w-3xl mx-auto px-8 pb-10 flex flex-col pt-4 overflow-hidden relative">
        <textarea
          autoFocus
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
          placeholder="How was your day?"
          className="flex-1 w-full bg-transparent resize-none outline-none border-none text-lg text-text-main placeholder:text-text-muted/30 font-sans leading-relaxed custom-scrollbar"
        />

        {/* SOFT PROMPTS (Hidden if user starts typing) */}
        {!content && (
          <div className="absolute top-1/3 left-8 right-8 text-center pointer-events-none opacity-50 select-none flex flex-col gap-3">
             <p className="text-text-muted text-sm font-medium">What went well today?</p>
             <p className="text-text-muted text-sm font-medium">What didn't go as planned?</p>
             <p className="text-text-muted text-sm font-medium">What did you learn?</p>
          </div>
        )}
      </div>
    </div>
  );
}
