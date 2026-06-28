import { Calendar, MoreHorizontal } from "lucide-react";
import { motion } from "framer-motion";
import { Tag } from "lucide-react";
import { useState } from "react";

const PRIORITY_CONFIG: Record<
  Priority,
  { label: string; color: string; bg: string }
> = {
  low: { label: "Низкий", color: "#10b981", bg: "rgba(16,185,129,0.12)" },
  medium: { label: "Средний", color: "#f59e0b", bg: "rgba(245,158,11,0.12)" },
  high: { label: "Высокий", color: "#f97316", bg: "rgba(249,115,22,0.12)" },
  critical: {
    label: "Критичный",
    color: "#ef4444",
    bg: "rgba(239,68,68,0.12)",
  },
};

const COLUMNS: { id: Status; label: string; color: string }[] = [
  { id: "todo", label: "К выполнению", color: "#5a5a80" },
  { id: "in_progress", label: "В работе", color: "#f59e0b" },
  { id: "done", label: "Выполнено", color: "#10b981" },
];

type Priority = "low" | "medium" | "high" | "critical";
type Status = "todo" | "in_progress" | "done";

interface Task {
  id: string;
  title: string;
  description?: string;
  priority: Priority;
  status: Status;
  category: string;
  dueDate?: string;
  tags: string[];
  createdAt: string;
}

export default function TaskCard({
  task,
  onMove,
  onDelete,
}: {
  task: Task;
  onMove: (id: string, status: Status) => void;
  onDelete: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const p = PRIORITY_CONFIG[task.priority];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="task-card mb-3 relative"
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex gap-1.5 flex-wrap">
          <span
            className="badge"
            style={{
              background: p.bg,
              color: p.color,
              border: `1px solid ${p.color}30`,
            }}
          >
            <Calendar size={10} />
            {p.label}
          </span>
          {task.category && (
            <span className="badge badge-purple text-purple-2">
              <Tag size={10} />
              {task.category}
            </span>
          )}
        </div>
        <div className="relative">
          <button
            className="btn-icon btn-glass opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() => setMenuOpen((v) => !v)}
            style={{ padding: "4px" }}
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <div
              className="absolute right-0 top-7 z-20 rounded-xl py-1 min-w-36"
              style={{
                background: "#1a1a35",
                border: "1px solid rgba(255,255,255,0.1)",
                boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
              }}
            >
              {COLUMNS.filter((c) => c.id !== task.status).map((c) => (
                <button
                  key={c.id}
                  className="w-full text-left px-4 py-2 text-xs hover:bg-white/5 transition-colors"
                  style={{ color: c.color }}
                  onClick={() => {
                    onMove(task.id, c.id);
                    setMenuOpen(false);
                  }}
                >
                  → {c.label}
                </button>
              ))}
              <div
                className="mx-2 my-1"
                style={{ height: 1, background: "rgba(255,255,255,0.07)" }}
              />
              <button
                className="w-full text-left px-4 py-2 text-xs hover:bg-red-500/10 transition-colors"
                style={{ color: "#ef4444" }}
                onClick={() => {
                  onDelete(task.id);
                  setMenuOpen(false);
                }}
              >
                🗑 Удалить
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-sm font-semibold mb-1 leading-snug group">
        {task.title}
      </p>
      {task.description && (
        <p
          className="text-xs mb-2.5 leading-relaxed"
          style={{ color: "#9090b8" }}
        >
          {task.description}
        </p>
      )}

      {task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2.5">
          {task.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 rounded-md"
              style={{ background: "rgba(255,255,255,0.06)", color: "#5a5a80" }}
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {task.dueDate && (
        <div
          className="flex items-center gap-1.5 text-xs"
          style={{ color: "#5a5a80" }}
        >
          <Calendar size={11} />
          {new Date(task.dueDate).toLocaleDateString("ru", {
            day: "numeric",
            month: "short",
          })}
        </div>
      )}
    </motion.div>
  );
}
