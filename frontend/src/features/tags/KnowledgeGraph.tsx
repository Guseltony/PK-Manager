"use client";

import { motion } from "framer-motion";
import { Tag } from "../../types/tag";
import { FiTag, FiFileText, FiCheckSquare, FiTarget, FiBook, FiActivity } from "react-icons/fi";
import { useMemo } from "react";

interface Node {
  id: string;
  type: "tag" | "note" | "task" | "dream" | "journal";
  label: string;
  x: number;
  y: number;
}

interface Link {
  source: string;
  target: string;
}

type GraphEntity = { id: string; type: string; title?: string; name?: string; date?: string };

interface KnowledgeGraphProps {
  tag: Tag;
}

export default function KnowledgeGraph({ tag }: KnowledgeGraphProps) {
  const { nodes, links } = useMemo(() => {
    if (!tag) return { nodes: [], links: [] };

    const centerX = 400;
    const centerY = 300;
    const newNodes: Node[] = [];
    const newLinks: Link[] = [];

    // Central Node (The Tag)
    newNodes.push({ id: tag.id, type: "tag", label: tag.name, x: centerX, y: centerY });

    // Entities
    const entities: GraphEntity[] = [
      ...(tag.notes || []).map(n => ({ ...n, type: "note" })),
      ...(tag.tasks || []).map(t => ({ ...t, type: "task" })),
      ...(tag.dreams || []).map(d => ({ ...d, type: "dream" })),
      ...(tag.journals || []).map(j => ({ ...j, type: "journal", title: `Entry ${j.date}` })),
    ];

    entities.forEach((entity, index) => {
      const angle = (index / entities.length) * 2 * Math.PI;
      // Stable layout using entity ID as seed
      const seed = entity.id.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      const radius = 200 + (seed % 50);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);

      newNodes.push({ 
        id: entity.id, 
        type: entity.type as Node["type"], 
        label: entity.title || entity.name || "Untitled",
        x, 
        y 
      });

      newLinks.push({ source: tag.id, target: entity.id });
    });

    return { nodes: newNodes, links: newLinks };
  }, [tag]);

  const getIcon = (type: string) => {
    switch(type) {
      case "tag": return <FiTag />;
      case "note": return <FiFileText />;
      case "task": return <FiCheckSquare />;
      case "dream": return <FiTarget />;
      case "journal": return <FiBook />;
      default: return null;
    }
  };

  const getColor = (type: string) => {
    switch(type) {
      case "tag": return "text-brand-primary bg-brand-primary/20 border-brand-primary/40 shadow-[0_0_20px_rgba(var(--brand-primary-rgb),0.3)]";
      case "note": return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "task": return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "dream": return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "journal": return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      default: return "";
    }
  };

  return (
    <div className="relative w-full h-[600px] bg-surface-soft/20 rounded-3xl border border-white/5 overflow-hidden backdrop-blur-sm group">
      <div className="absolute top-6 left-6 z-10">
        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-text-muted flex items-center gap-2">
           <FiActivity size={14} className="text-brand-primary" /> Neural Knowledge Map
        </h3>
        <p className="text-[10px] text-text-muted/60 mt-1 uppercase tracking-wider">Visualizing connections for #{tag.name}</p>
      </div>

      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <defs>
          <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
             <stop offset="0%" stopColor="rgba(var(--brand-primary-rgb), 0.2)" />
             <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
          </linearGradient>
        </defs>
        {links.map((link, i) => {
          const source = nodes.find(n => n.id === link.source);
          const target = nodes.find(n => n.id === link.target);
          if (!source || !target) return null;
          return (
            <motion.line
              key={i}
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 1.5, delay: i * 0.05 }}
              x1={source.x} y1={source.y}
              x2={target.x} y2={target.y}
              stroke="url(#lineGrad)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
            />
          );
        })}
      </svg>

      <div className="absolute inset-0 overflow-auto cursor-grab active:cursor-grabbing no-scrollbar">
        {nodes.map((node, i) => (
          <motion.div
            key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: i * 0.02 }}
            style={{ left: node.x, top: node.y }}
            className={`absolute -translate-x-1/2 -translate-y-1/2 p-3 rounded-2xl border flex items-center gap-3 whitespace-nowrap backdrop-blur-md transition-all z-10 ${getColor(node.type)} ${node.type === 'tag' ? 'scale-125 z-20' : 'hover:scale-110'}`}
          >
             <div className="text-lg">{getIcon(node.type)}</div>
             <div className="flex flex-col">
                <span className={`font-black uppercase tracking-tighter ${node.type === 'tag' ? 'text-sm' : 'text-[10px]'}`}>
                   {node.label}
                </span>
                <span className="text-[8px] opacity-60 font-bold uppercase tracking-widest">{node.type}</span>
             </div>
          </motion.div>
        ))}
      </div>

      <div className="absolute bottom-6 right-6 text-[10px] font-bold text-text-muted/40 uppercase tracking-widest">
        Interactive Neural Visualizer v1.0
      </div>
    </div>
  );
}
