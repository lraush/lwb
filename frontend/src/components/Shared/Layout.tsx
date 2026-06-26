import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store/appStore';
import AIPanel from '@/components/AI/AIPanel';
import { useReminders, useProductivityStreak } from '@/hooks/useReminders';
import {
  Briefcase, Books, Heart, Trophy, Airplane,
  FilmSlate, Robot, CurrencyDollar, Gauge, Brain,
} from '@phosphor-icons/react';

const NAV = [
  { path: '/',         icon: Gauge,           label: 'Главная',     color: '#7c6af7' },
  { path: '/work',     icon: Briefcase,  label: 'Работа',      color: '#22d3ee' },
  { path: '/finance',  icon: CurrencyDollar,  label: 'Финансы',     color: '#10b981' },
  { path: '/learning', icon: Books,           label: 'Учёба',       color: '#f59e0b' },
  { path: '/health',   icon: Heart,      label: 'Здоровье',    color: '#ec4899' },
  { path: '/sports',   icon: Trophy,          label: 'Спорт',       color: '#f97316' },
  { path: '/travel',   icon: Airplane,        label: 'Путешествия', color: '#06b6d4' },
  { path: '/media',    icon: FilmSlate,       label: 'Медиа',       color: '#8b5cf6' },
  { path: '/ai',       icon: Brain,           label: 'ИИ-агент',    color: '#a99ff8' },
];

export default function Layout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { aiPanelOpen, toggleAIPanel, logout, user } = useAppStore();

  useReminders();
  const streak = useProductivityStreak();

  return (
    <div className="flex h-full overflow-hidden" style={{
      background: 'radial-gradient(ellipse at 15% 0%, rgba(124,106,247,0.1) 0%, transparent 50%), radial-gradient(ellipse at 85% 100%, rgba(34,211,238,0.06) 0%, transparent 50%), #07070d',
    }}>
      <aside className="flex flex-col items-center py-5 gap-1.5 flex-shrink-0 border-r z-20"
        style={{ width: 76, background: 'rgba(8,8,20,0.95)', borderColor: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(24px)' }}>
        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg mb-3 cursor-pointer select-none"
          style={{ background: 'linear-gradient(135deg,#7c6af7,#a99ff8)', boxShadow: '0 4px 16px rgba(124,106,247,0.5)' }}
          onClick={() => navigate('/')} title="lifeWorkBalances">⚖️</div>

        {NAV.map(({ path, icon: Icon, label, color }) => {
          const active = location.pathname === path;
          return (
            <div key={path} className="nav-item group relative"
              style={active ? { color, background: `${color}15`, boxShadow: `0 0 0 1px ${color}40` } : {}}
              onClick={() => navigate(path)} title={label}>
              {active && <div className="absolute left-0 w-0.5 h-6 rounded-r-full" style={{ background: color }} />}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: `${color}10` }} />
              <Icon size={20} weight={active ? 'fill' : 'regular'} className="relative z-10" style={{ color: active ? color : undefined }} />
              <span className="text-[9px] font-medium relative z-10 leading-none">{label.split(' ')[0]}</span>
            </div>
          );
        })}

        <div className="flex-1" />

        {streak > 1 && (
          <div className="text-center py-1.5 px-2 rounded-xl mb-1"
            style={{ background: 'rgba(249,115,22,0.15)', border: '1px solid rgba(249,115,22,0.3)' }}>
            <div className="text-base">🔥</div>
            <div className="text-[9px] font-bold" style={{ color: '#f97316' }}>{streak}</div>
          </div>
        )}

        <div className="nav-item" onClick={toggleAIPanel} title="ИИ-ассистент"
          style={aiPanelOpen ? { color: '#a99ff8', background: 'rgba(124,106,247,0.2)', boxShadow: '0 0 0 1px rgba(124,106,247,0.4)' } : {}}>
          <Robot size={20} weight={aiPanelOpen ? 'fill' : 'regular'} />
          <span className="text-[9px] font-medium">ИИ</span>
        </div>

        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold cursor-pointer mt-1"
          style={{ background: 'linear-gradient(135deg,#21213f,#2d2d52)', border: '1px solid rgba(255,255,255,0.1)' }}
          onClick={logout} title="Выйти">
          {user?.name?.[0]?.toUpperCase() ?? '?'}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          <motion.div key={location.pathname} initial={{ opacity:0,y:6 }} animate={{ opacity:1,y:0 }} exit={{ opacity:0,y:-4 }}
            transition={{ duration:0.22 }} className="min-h-full">
            {children}
          </motion.div>
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {aiPanelOpen && (
          <motion.div initial={{ width:0, opacity:0 }} animate={{ width:380, opacity:1 }} exit={{ width:0, opacity:0 }}
            transition={{ duration:0.28, ease:'easeInOut' }}
            className="flex-shrink-0 overflow-hidden border-l z-10"
            style={{ borderColor:'rgba(255,255,255,0.06)', background:'rgba(8,8,20,0.97)', backdropFilter:'blur(24px)' }}>
            <div className="w-[380px] h-full"><AIPanel /></div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
