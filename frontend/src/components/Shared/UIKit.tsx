import { motion, AnimatePresence } from 'framer-motion';

// ── Modal ─────────────────────────────────────
interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: number;
}
export function Modal({ open, onClose, title, children, maxWidth = 480 }: ModalProps) {
  if (!open) return null;
  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div
          className="modal"
          style={{ maxWidth }}
          onClick={e => e.stopPropagation()}
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.25 }}
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold">{title}</h3>
            <button className="btn-glass btn-icon text-base" onClick={onClose}>✕</button>
          </div>
          {children}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// ── Modal actions row ─────────────────────────
export function ModalActions({ onCancel, onConfirm, confirmLabel = 'Сохранить', loading = false }: {
  onCancel: () => void;
  onConfirm: () => void;
  confirmLabel?: string;
  loading?: boolean;
}) {
  return (
    <div className="flex gap-3 justify-end mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
      <button className="btn-glass" onClick={onCancel}>Отмена</button>
      <button className="btn-neon" onClick={onConfirm} disabled={loading}>
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Сохранение...
          </span>
        ) : confirmLabel}
      </button>
    </div>
  );
}

// ── Field wrapper ─────────────────────────────
export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="modal-field mb-4">
      <label className="block text-xs font-medium mb-1.5" style={{ color: '#9090b8' }}>{label}</label>
      {children}
    </div>
  );
}

// ── Stat card ─────────────────────────────────
export function StatCard({ label, value, color, icon: Icon, sub }: {
  label: string; value: string | number; color: string;
  icon?: React.ComponentType<any>; sub?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="stat-card"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs" style={{ color: '#5a5a80' }}>{label}</p>
        {Icon && (
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${color}18` }}>
            <Icon size={14} style={{ color }} weight="fill" />
          </div>
        )}
      </div>
      <p className="text-2xl font-bold mt-1" style={{ color }}>{value}</p>
      {sub && <p className="text-xs mt-0.5" style={{ color: '#5a5a80' }}>{sub}</p>}
    </motion.div>
  );
}

// ── Progress bar ──────────────────────────────
export function ProgressBar({ value, color, height = 5 }: {
  value: number; color?: string; height?: number;
}) {
  return (
    <div className="progress-track" style={{ height }}>
      <motion.div
        className="progress-fill"
        style={{ background: color || 'linear-gradient(90deg,#7c6af7,#a99ff8)' }}
        initial={{ width: 0 }}
        animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      />
    </div>
  );
}

// ── Empty state ───────────────────────────────
export function EmptyState({ icon, title, description, action }: {
  icon: string; title: string; description?: string; action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
      <div className="text-4xl">{icon}</div>
      <div>
        <p className="font-semibold" style={{ color: '#9090b8' }}>{title}</p>
        {description && <p className="text-sm mt-1" style={{ color: '#5a5a80' }}>{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}

// ── Skeleton ──────────────────────────────────
export function Skeleton({ className = '', style = {} }: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      className={`skeleton ${className}`}
      style={{ background: 'linear-gradient(90deg,#1a1a35 25%,#21213f 50%,#1a1a35 75%)', backgroundSize: '200% 100%', ...style }}
    />
  );
}

// ── Badge ─────────────────────────────────────
export function Badge({ children, variant = 'purple' }: {
  children: React.ReactNode;
  variant?: 'purple' | 'green' | 'amber' | 'red' | 'cyan' | 'gray';
}) {
  return <span className={`badge badge-${variant}`}>{children}</span>;
}

// ── Section header ────────────────────────────
export function SectionHeader({ icon, title, subtitle, action }: {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          {icon}
          <h1 className="section-title text-2xl">{title}</h1>
        </div>
        {subtitle && <p className="text-sm" style={{ color: '#5a5a80' }}>{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

// ── Card ──────────────────────────────────────
export function Card({ children, className = '', onClick }: {
  children: React.ReactNode; className?: string; onClick?: () => void;
}) {
  return (
    <div
      className={`glass-card ${onClick ? 'glass-card-hover cursor-pointer' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

// ── Toggle tabs ───────────────────────────────
export function TabBar({ tabs, active, onChange, color = '#7c6af7' }: {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  active: string;
  onChange: (id: string) => void;
  color?: string;
}) {
  return (
    <div className="flex gap-1.5 flex-wrap mb-5">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
          style={active === tab.id ? {
            background: `${color}20`,
            border: `1px solid ${color}60`,
            color,
          } : {
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            color: '#5a5a80',
          }}
        >
          {tab.icon}
          {tab.label}
        </button>
      ))}
    </div>
  );
}
