import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { taskApi } from "@/utils/apiClient";
import {
  Plus,
  Fuel,
  Briefcase,
  CheckCircle2,
  Clock3,
  Trash2,
  MoreHorizontal,
  Flag,
  Calendar,
  Tag,
} from "lucide-react";
// import {
//   Plus,
//   Funnel,
//   Briefcase,
//   CheckCircle,
//   Clock,
//   Trash,
//   DotsThree,
//   Flag,
//   CalendarBlank,
//   Tag,
// } from "@phosphor-icons/react";
import TaskCard from "./TaskCard";

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

// Mock data for demo
const MOCK_TASKS: Task[] = [
  {
    id: "1",
    title: "Подготовить отчёт Q2",
    description: "Финансовый отчёт за Q2",
    priority: "high",
    status: "in_progress",
    category: "finance",
    dueDate: "2026-06-20",
    tags: ["отчёт", "финансы"],
    createdAt: "",
  },
  {
    id: "2",
    title: "Обновить дизайн-систему",
    description: "Обновление компонентов",
    priority: "medium",
    status: "todo",
    category: "design",
    dueDate: "2026-06-25",
    tags: ["дизайн"],
    createdAt: "",
  },
  {
    id: "3",
    title: "Встреча с командой",
    priority: "low",
    status: "done",
    category: "meeting",
    tags: [],
    createdAt: "",
  },
  {
    id: "4",
    title: "Написать тесты",
    description: "Unit тесты для API",
    priority: "high",
    status: "todo",
    category: "dev",
    dueDate: "2026-06-22",
    tags: ["тесты", "разработка"],
    createdAt: "",
  },
  {
    id: "5",
    title: "Ревью PR #142",
    priority: "critical",
    status: "in_progress",
    category: "dev",
    tags: ["code"],
    createdAt: "",
  },
  {
    id: "6",
    title: "Обновить документацию",
    priority: "low",
    status: "done",
    category: "docs",
    tags: [],
    createdAt: "",
  },
];

export default function WorkSection() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [filter, setFilter] = useState<Priority | "all">("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    priority: "medium" as Priority,
    category: "",
    dueDate: "",
    tags: "",
  });

  const { data: tasks = MOCK_TASKS } = useQuery<Task[]>({
    queryKey: ["tasks"],
    queryFn: () => taskApi.get("/").then((r) => r.data),
    placeholderData: MOCK_TASKS,
  });

  const createTask = useMutation({
    mutationFn: (data: typeof form) =>
      taskApi.post("/", {
        ...data,
        tags: data.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      setShowForm(false);
      toast.success("Задача создана");
    },
    onError: () => toast.error("Ошибка создания задачи"),
  });

  const updateStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: Status }) =>
      taskApi.patch(`/${id}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["tasks"] }),
  });

  const deleteTask = useMutation({
    mutationFn: (id: string) => taskApi.delete(`/${id}`),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      toast.success("Задача удалена");
    },
  });

  const filtered =
    filter === "all" ? tasks : tasks.filter((t) => t.priority === filter);
  const stats = {
    total: tasks.length,
    done: tasks.filter((t) => t.status === "done").length,
    inProgress: tasks.filter((t) => t.status === "in_progress").length,
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Briefcase size={24} style={{ color: "#22d3ee" }} />
            <h1 className="section-title text-2xl">Рабочее пространство</h1>
          </div>
          <p className="text-sm" style={{ color: "#5a5a80" }}>
            Управляй задачами и проектами
          </p>
        </div>
        <button className="btn-neon" onClick={() => setShowForm(true)}>
          <Plus size={16} />
          Новая задача
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          {
            label: "Всего задач",
            value: stats.total,
            color: "#22d3ee",
            icon: Briefcase,
          },
          {
            label: "В работе",
            value: stats.inProgress,
            color: "#f59e0b",
            icon: Clock3,
          },
          {
            label: "Завершено",
            value: stats.done,
            color: "#10b981",
            icon: CheckCircle2,
          },
        ].map((s) => (
          <div key={s.label} className="glass-card p-4 flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${s.color}15` }}
            >
              <s.icon size={18} style={{ color: s.color }} />
            </div>
            <div>
              <p className="text-xl font-bold">{s.value}</p>
              <p className="text-xs" style={{ color: "#5a5a80" }}>
                {s.label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Priority filter */}
      <div className="flex items-center gap-2 mb-5">
        <Fuel size={14} style={{ color: "#5a5a80" }} />
        <div className="flex gap-1.5 flex-wrap">
          {(["all", "critical", "high", "medium", "low"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={
                filter === f
                  ? {
                      background:
                        f === "all"
                          ? "rgba(124,106,247,0.2)"
                          : PRIORITY_CONFIG[f as Priority]?.bg,
                      color:
                        f === "all"
                          ? "#a99ff8"
                          : PRIORITY_CONFIG[f as Priority]?.color,
                      border: `1px solid ${
                        f === "all"
                          ? "rgba(124,106,247,0.4)"
                          : PRIORITY_CONFIG[f as Priority]?.color + "50"
                      }`,
                    }
                  : {
                      background: "rgba(255,255,255,0.04)",
                      color: "#5a5a80",
                      border: "1px solid rgba(255,255,255,0.07)",
                    }
              }
            >
              {f === "all" ? "Все" : PRIORITY_CONFIG[f as Priority].label}
            </button>
          ))}
        </div>
      </div>

      {/* Kanban */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const colTasks = filtered.filter((t) => t.status === col.id);
          return (
            <div
              key={col.id}
              className="glass-card p-4 flex flex-col"
              style={{ minHeight: 400 }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full"
                    style={{ background: col.color }}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: col.color }}
                  >
                    {col.label}
                  </span>
                </div>
                <span
                  className="text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: `${col.color}18`, color: col.color }}
                >
                  {colTasks.length}
                </span>
              </div>

              <div className="flex-1">
                <AnimatePresence>
                  {colTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onMove={(id, status) =>
                        updateStatus.mutate({ id, status })
                      }
                      onDelete={(id) => deleteTask.mutate(id)}
                    />
                  ))}
                </AnimatePresence>
                {colTasks.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 text-center">
                    <p className="text-2xl mb-2">📋</p>
                    <p className="text-xs" style={{ color: "#3a3a5c" }}>
                      Нет задач
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Create task modal */}
      <AnimatePresence>
        {showForm && (
          <div className="modal-overlay" onClick={() => setShowForm(false)}>
            <motion.div
              className="modal"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold">Новая задача</h3>
                <button
                  className="btn-glass btn-icon"
                  onClick={() => setShowForm(false)}
                >
                  ✕
                </button>
              </div>
              <div className="flex flex-col gap-4">
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "#9090b8" }}
                  >
                    Название *
                  </label>
                  <input
                    className="input-glass"
                    placeholder="Описание задачи..."
                    value={form.title}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, title: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label
                    className="block text-xs font-medium mb-1.5"
                    style={{ color: "#9090b8" }}
                  >
                    Описание
                  </label>
                  <textarea
                    className="input-glass"
                    rows={3}
                    placeholder="Подробности..."
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: "#9090b8" }}
                    >
                      Приоритет
                    </label>
                    <select
                      className="input-glass"
                      value={form.priority}
                      onChange={(e) =>
                        setForm((f) => ({
                          ...f,
                          priority: e.target.value as Priority,
                        }))
                      }
                    >
                      <option value="low">Низкий</option>
                      <option value="medium">Средний</option>
                      <option value="high">Высокий</option>
                      <option value="critical">Критичный</option>
                    </select>
                  </div>
                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: "#9090b8" }}
                    >
                      Категория
                    </label>
                    <input
                      className="input-glass"
                      placeholder="dev, design, meeting..."
                      value={form.category}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, category: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: "#9090b8" }}
                    >
                      Срок
                    </label>
                    <input
                      className="input-glass"
                      type="date"
                      value={form.dueDate}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, dueDate: e.target.value }))
                      }
                    />
                  </div>
                  <div>
                    <label
                      className="block text-xs font-medium mb-1.5"
                      style={{ color: "#9090b8" }}
                    >
                      Теги (через запятую)
                    </label>
                    <input
                      className="input-glass"
                      placeholder="api, backend, urgent"
                      value={form.tags}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, tags: e.target.value }))
                      }
                    />
                  </div>
                </div>
              </div>
              <div
                className="flex gap-3 justify-end mt-5 pt-4"
                style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
              >
                <button
                  className="btn-glass"
                  onClick={() => setShowForm(false)}
                >
                  Отмена
                </button>
                <button
                  className="btn-neon"
                  onClick={() => form.title && createTask.mutate(form)}
                  disabled={!form.title || createTask.isPending}
                >
                  {createTask.isPending ? "Создание..." : "Создать задачу"}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
