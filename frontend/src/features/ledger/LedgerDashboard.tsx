"use client";

import { useLedger } from "../../hooks/useLedger";
import { useState } from "react";
import { FiActivity, FiClock, FiDownload, FiFilter, FiList } from "react-icons/fi";
import dayjs from "dayjs";

export default function LedgerDashboard() {
  const { logs, summaries, isLoading } = useLedger();
  const [view, setView] = useState<"table" | "heatmap" | "replay">("table");

  if (isLoading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center bg-surface-base">
        <div className="flex flex-col items-center gap-4">
          <FiActivity className="text-brand-primary animate-spin" size={32} />
          <p className="text-text-muted text-sm font-medium animate-pulse uppercase tracking-widest">
            Synchronizing Records...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-surface-base">
      <div className="p-8 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5">
        <div>
          <h1 className="text-4xl font-display font-black text-text-main mb-2 tracking-tight">
            TASK <span className="text-brand-primary">LEDGER</span>
          </h1>
          <p className="text-text-muted text-sm max-w-lg leading-relaxed">
            Immutable execution engine. Analyze your productivity habits and historical performance.
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
            <button 
              onClick={() => setView("table")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-xl flex items-center gap-2 ${view === 'table' ? 'bg-brand-primary text-white shadow-lg' : 'text-text-muted hover:text-text-main hover:bg-white/5'}`}
            >
              <FiList /> Table
            </button>
            <button 
              onClick={() => setView("heatmap")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-xl flex items-center gap-2 ${view === 'heatmap' ? 'bg-amber-500 text-amber-950 shadow-lg' : 'text-text-muted hover:text-text-main hover:bg-white/5'}`}
            >
              <FiActivity /> Heatmap
            </button>
            <button 
              onClick={() => setView("replay")}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all rounded-xl flex items-center gap-2 ${view === 'replay' ? 'bg-emerald-500 text-emerald-950 shadow-lg' : 'text-text-muted hover:text-text-main hover:bg-white/5'}`}
            >
              <FiClock /> Replay
            </button>
          </div>
          <button className="flex items-center justify-center p-3 rounded-2xl bg-white/5 hover:bg-white/10 text-text-muted hover:text-text-main transition-colors border border-white/5">
            <FiDownload size={18} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        {view === "table" && (
          <div className="glass rounded-[2rem] border border-white/5 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-white/5 text-[10px] uppercase font-black tracking-widest text-text-muted">
                  <tr>
                    <th className="p-4 pl-6">Completed Time</th>
                    <th className="p-4">Task Title</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4">Goal (Dream)</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Tags</th>
                    <th className="p-4">Note Link</th>
                    <th className="p-4">Duration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="p-4 pl-6 text-sm text-text-muted whitespace-nowrap">
                        {dayjs(log.completedAt).format("MMM D, HH:mm")}
                      </td>
                      <td className="p-4 font-bold text-text-main">
                        {log.title}
                      </td>
                      <td className="p-4 text-center">
                        {log.status === "done" ? (
                          <span className="text-emerald-500" title="Completed">✅</span>
                        ) : (
                          <span className="text-red-500" title={`Logged as ${log.status}`}>❌</span>
                        )}
                      </td>
                      <td className="p-4 text-sm text-text-muted">
                         {log.dream ? (
                           <span className="flex flex-col">
                             <span className="text-text-main font-medium">{log.dream.title}</span>
                             {log.dream.category && <span className="text-[10px] uppercase opacity-70">{log.dream.category}</span>}
                           </span>
                         ) : '-'}
                      </td>
                      <td className="p-4">
                        <span className={`text-[10px] px-2 py-1 rounded-full border uppercase tracking-widest font-black ${
                          log.priority === 'urgent' ? 'border-red-500/30 text-red-500 bg-red-500/5' :
                          log.priority === 'high' ? 'border-amber-500/30 text-amber-500 bg-amber-500/5' :
                          log.priority === 'medium' ? 'border-emerald-500/30 text-emerald-500 bg-emerald-500/5' :
                          'border-blue-500/30 text-blue-400 bg-blue-500/5'
                        }`}>
                          {log.priority}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-1 flex-wrap">
                          {log.tags.map(tag => (
                            <span key={tag} className="text-[10px] uppercase tracking-wider px-2 py-1 bg-white/5 text-text-muted rounded-md font-medium">
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="p-4 text-sm text-text-muted">
                        {log.note ? <span className="hover:text-brand-primary cursor-pointer line-clamp-1">{log.note.title}</span> : '-'}
                      </td>
                      <td className="p-4 font-mono text-sm text-brand-accent">
                        {log.duration ? `${log.duration}m` : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {view === "heatmap" && (
          <div className="glass p-8 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center min-h-[400px]">
            <h2 className="text-xl font-bold font-display text-text-main mb-6">Activity Heatmap (V3 Concept)</h2>
            <div className="flex flex-wrap gap-2 max-w-4xl justify-center">
              {summaries.map(sum => (
                <div 
                  key={sum.id} 
                  title={`${sum.completedTasks} tasks / Score: ${sum.productivityScore}`}
                  className={`w-10 h-10 rounded-lg cursor-help transition-all hover:scale-110 ${
                    sum.productivityScore && sum.productivityScore > 80 ? 'bg-amber-500 shadow-lg shadow-amber-500/20' :
                    sum.productivityScore && sum.productivityScore > 50 ? 'bg-emerald-500/60' :
                    sum.productivityScore && sum.productivityScore > 20 ? 'bg-emerald-500/30' :
                    'bg-white/5'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {view === "replay" && (
          <div className="glass p-8 rounded-[2rem] border border-white/5 flex flex-col items-center justify-center min-h-[400px]">
             <h2 className="text-xl font-bold font-display text-text-main mb-2">Time Machine Offline</h2>
             <p className="text-text-muted max-w-sm text-center">
               The replay engine is currently calibrating. Chronological sequence reconstruction will be available in the next major patch.
             </p>
          </div>
        )}
      </div>
    </div>
  );
}
