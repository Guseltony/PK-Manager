"use client";

import { useState, useRef } from "react";
import { useJournal, useJournalTimeline } from "../../hooks/useJournal";
import dayjs from "dayjs";
import { FiCheck, FiSave, FiList, FiX, FiCalendar, FiTag } from "react-icons/fi";
import { RiEmotionHappyLine, RiEmotionNormalLine, RiEmotionUnhappyLine } from "react-icons/ri";
import { FaRegSmileBeam } from "react-icons/fa";

export default function JournalLayout() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { entry, isLoading, updateEntry, isSaving } = useJournal(currentDate);
  const { timeline, isLoading: loadingTimeline } = useJournalTimeline(30, 0);
  
  const [showTimeline, setShowTimeline] = useState(false);

  const [localContent, setLocalContent] = useState<string | null>(null);
  const [localMood, setLocalMood] = useState<"great" | "good" | "neutral" | "bad" | null>(null);
  
  const content = localContent !== null ? localContent : (entry?.content || "");
  const mood = localMood !== null ? localMood : entry?.mood;
  
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleContentChange = (val: string) => {
    setLocalContent(val);
    
    // Auto-save logic (debounce 1000ms)
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (entry) updateEntry({ id: entry.id, payload: { content: val } });
    }, 1000);
  };

  const handleMoodSelect = (selectedMood: "great" | "good" | "neutral" | "bad") => {
    setLocalMood(selectedMood);
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
      <div className="w-full max-w-3xl mx-auto px-4 sm:px-8 py-6 sm:py-10 pb-0 shrink-0">
        <header className="flex flex-col sm:flex-row justify-between items-start sm:items-end border-b border-white/5 pb-4 gap-4">
          <div>
            <span className="text-brand-primary uppercase tracking-[0.2em] font-bold text-[10px]">Today</span>
            <h1 className="text-3xl font-display font-medium text-text-main mt-1">
              {dayjs(currentDate).format("dddd, MMMM D")}
            </h1>
          </div>

          <div className="flex flex-row sm:flex-col items-center sm:items-end gap-3 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-1 sm:gap-2 bg-white/5 p-1 rounded-full border border-white/5">
              <button onClick={() => handleMoodSelect("great")} className={`p-2 rounded-full transition-all ${mood === 'great' ? 'bg-amber-500/20 text-amber-500' : 'text-text-muted hover:bg-white/5'}`} title="Great"><FaRegSmileBeam size={18} /></button>
              <button onClick={() => handleMoodSelect("good")} className={`p-2 rounded-full transition-all ${mood === 'good' ? 'bg-emerald-500/20 text-emerald-500' : 'text-text-muted hover:bg-white/5'}`} title="Good"><RiEmotionHappyLine size={18} /></button>
              <button onClick={() => handleMoodSelect("neutral")} className={`p-2 rounded-full transition-all ${mood === 'neutral' ? 'bg-blue-500/20 text-blue-500' : 'text-text-muted hover:bg-white/5'}`} title="Neutral"><RiEmotionNormalLine size={18} /></button>
              <button onClick={() => handleMoodSelect("bad")} className={`p-2 rounded-full transition-all ${mood === 'bad' ? 'bg-red-500/20 text-red-500' : 'text-text-muted hover:bg-white/5'}`} title="Bad"><RiEmotionUnhappyLine size={18} /></button>
            </div>
            <button 
              onClick={() => setShowTimeline(!showTimeline)} 
              className={`p-2 transition-all rounded-xl border border-white/5 text-xs font-bold uppercase tracking-widest flex items-center gap-2 ${showTimeline ? 'bg-brand-primary text-white' : 'bg-white/5 text-text-muted hover:text-text-main'}`}
            >
              <FiList /> History
            </button>
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
        
        <div className="flex flex-wrap gap-2 mt-4">
          {entry?.tags?.map((tagObj: any) => (
            <span key={tagObj.tag.id} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] font-bold text-text-muted hover:text-text-main transition-all">
               <FiTag size={10} className="text-brand-primary/60" /> {tagObj.tag.name}
            </span>
          ))}
        </div>
      </div>

      {/* WRITING AREA */}
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-8 pb-10 flex flex-col pt-4 overflow-hidden relative">
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
             <p className="text-text-muted text-sm font-medium">What didn&apos;t go as planned?</p>
             <p className="text-text-muted text-sm font-medium">What did you learn?</p>
          </div>
        )}
      </div>

      {/* TIMELINE SLIDEOVER */}
      {showTimeline && (
        <div className="fixed sm:absolute top-0 right-0 w-full sm:w-80 h-full glass border-l border-white/5 z-40 flex flex-col shadow-2xl">
          <div className="p-6 border-b border-white/5 flex items-center justify-between">
            <h2 className="font-display font-bold text-text-main flex items-center gap-2"><FiCalendar /> PAST JOURNALS</h2>
            <button onClick={() => setShowTimeline(false)} className="text-text-muted hover:text-text-main"><FiX size={20} /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar flex flex-col gap-2">
            {loadingTimeline ? (
              <p className="text-sm text-text-muted text-center pt-10">Loading history...</p>
            ) : timeline.length === 0 ? (
              <p className="text-sm text-text-muted text-center pt-10">No past entries yet.</p>
            ) : (
              timeline.map((pastEntry) => (
                <div 
                  key={pastEntry.id} 
                  onClick={() => {
                    setCurrentDate(new Date(pastEntry.date));
                    setShowTimeline(false);
                    setLocalContent(null);
                    setLocalMood(null);
                  }}
                  className={`p-4 rounded-xl cursor-pointer transition-all border ${
                    dayjs(currentDate).format("YYYY-MM-DD") === dayjs(pastEntry.date).format("YYYY-MM-DD") 
                      ? 'bg-brand-primary/10 border-brand-primary/30 text-brand-primary' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10 text-text-main'
                  }`}
                >
                  <p className="font-bold text-sm mb-1">{dayjs(pastEntry.date).format("MMM D, YYYY")}</p>
                  <p className="text-xs text-text-muted line-clamp-2 leading-relaxed">
                    {pastEntry.content || "Empty entry..."}
                  </p>
                  {pastEntry.mood && (
                    <div className="mt-2 flex items-center gap-1 opacity-70">
                       {pastEntry.mood === 'great' && <span className="text-amber-500 text-[10px] uppercase font-bold tracking-widest leading-none">Great</span>}
                       {pastEntry.mood === 'good' && <span className="text-emerald-500 text-[10px] uppercase font-bold tracking-widest leading-none">Good</span>}
                       {pastEntry.mood === 'neutral' && <span className="text-blue-500 text-[10px] uppercase font-bold tracking-widest leading-none">Neutral</span>}
                       {pastEntry.mood === 'bad' && <span className="text-red-500 text-[10px] uppercase font-bold tracking-widest leading-none">Bad</span>}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
