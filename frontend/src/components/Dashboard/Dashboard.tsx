import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/store/appStore';
import {
  Briefcase, Books, Heart, Trophy, CurrencyDollar,
  Robot, CheckCircle, Clock, TrendDown, TrendUp, Lightning,
} from '@phosphor-icons/react';
import { taskApi, financeApi } from '@/utils/apiClient';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

const QUICK_LINKS = [
  { path: '/work',     label: 'Работа',    icon: Briefcase, color: '#22d3ee', bg: 'rgba(34,211,238,0.1)' },
  { path: '/finance',  label: 'Финансы',   icon: CurrencyDollar, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
  { path: '/learning', label: 'Учёба',     icon: Books,          color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
  { path: '/health',   label: 'Здоровье',  icon: Heart,     color: '#ec4899', bg: 'rgba(236,72,153,0.1)' },
  { path: '/sports',   label: 'Спорт',     icon: Trophy,         color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  { path: '/ai',       label: 'ИИ-агент',  icon: Robot,          color: '#a99ff8', bg: 'rgba(124,106,247,0.12)' },
];

export default function Dashboard() {
  const { user } = useAppStore();
  const navigate = useNavigate();

  const { data: taskStats } = useQuery({
    queryKey: ['task-stats'],
    queryFn: () => taskApi.get('/stats').then(r => r.data),
    placeholderData: { total: 12, done: 7, inProgress: 3, overdue: 2 },
  });

  const { data: finStats } = useQuery({
    queryKey: ['finance-summary'],
    queryFn: () => financeApi.get('/summary').then(r => r.data),
    placeholderData: { balance: 55000, income: 150000, expenses: 95000, savingsRate: 37 },
  });

  const now = new Date();
  const greeting = now.getHours() < 12 ? 'Доброе утро' : now.getHours() < 17 ? 'Добрый день' : 'Добрый вечер';

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm mb-1" style={{ color: '#5a5a80' }}>
              {format(now, 'EEEE, d MMMM yyyy', { locale: ru })}
            </p>
            <h1 className="text-3xl font-bold">
              {greeting},{' '}
              <span style={{
                background: 'linear-gradient(135deg,#a99ff8,#22d3ee)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                {user?.name?.split(' ')[0] ?? 'Пользователь'}
              </span>
              &nbsp;👋
            </h1>
            <p className="mt-1 text-sm" style={{ color: '#9090b8' }}>Вот что происходит сегодня</p>
          </div>
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm"
            style={{ background: 'rgba(124,106,247,0.1)', border: '1px solid rgba(124,106,247,0.25)', color: '#a99ff8' }}
          >
            <Lightning size={14} weight="fill" />
            Продуктивность: высокая
          </div>
        </div>
      </motion.div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Задач всего', value: taskStats?.total ?? '—',
            icon: CheckCircle, color: '#22d3ee', sub: `Выполнено: ${taskStats?.done ?? 0}`,
          },
          {
            label: 'В процессе', value: taskStats?.inProgress ?? '—',
            icon: Clock, color: '#f59e0b', sub: `Просрочено: ${taskStats?.overdue ?? 0}`,
          },
          {
            label: 'Баланс', value: finStats ? `${(finStats.balance / 1000).toFixed(0)}к ₽` : '—',
            icon: TrendUp, color: '#10b981', sub: `Доход: ${finStats ? (finStats.income / 1000).toFixed(0) : 0}к`,
          },
          {
            label: 'Сбережения', value: finStats ? `${finStats.savingsRate}%` : '—',
            icon: TrendDown, color: '#a99ff8', sub: 'от дохода',
          },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            className="stat-card"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium" style={{ color: '#5a5a80' }}>{stat.label}</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${stat.color}18` }}>
                <stat.icon size={14} style={{ color: stat.color }} weight="fill" />
              </div>
            </div>
            <div className="stat-value text-2xl">{stat.value}</div>
            <p className="text-xs" style={{ color: '#5a5a80' }}>{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick links grid */}
      <div className="mb-8">
        <h2 className="text-sm font-semibold mb-4" style={{ color: '#5a5a80' }}>Разделы</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {QUICK_LINKS.map(({ path, label, icon: Icon, color, bg }, i) => (
            <motion.button
              key={path}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              onClick={() => navigate(path)}
              className="glass-card-hover flex flex-col items-center gap-3 py-5 px-3 cursor-pointer"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: bg }}>
                <Icon size={20} style={{ color }} weight="fill" />
              </div>
              <span className="text-xs font-medium" style={{ color: '#9090b8' }}>{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Bottom grid: recent tasks + AI tip */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 glass-card p-5">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Briefcase size={16} style={{ color: '#22d3ee' }} weight="fill" />
            Активные задачи
          </h3>
          {[
            { name: 'Подготовить отчёт Q2', priority: 'high', due: 'Сегодня' },
            { name: 'Ревью кода PR #142',    priority: 'medium', due: 'Завтра' },
            { name: 'Обновить дизайн-систему', priority: 'low', due: '25 июн' },
          ].map((t, i) => (
            <div
              key={i}
              className="flex items-center justify-between py-2.5 border-b last:border-none"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <div className="flex items-center gap-3">
                <div className="w-1.5 h-8 rounded-full" style={{
                  background: t.priority === 'high' ? '#ef4444' : t.priority === 'medium' ? '#f59e0b' : '#10b981'
                }} />
                <span className="text-sm">{t.name}</span>
              </div>
              <span className="text-xs" style={{ color: '#5a5a80' }}>{t.due}</span>
            </div>
          ))}
          <button className="btn-glass mt-4 w-full text-xs" onClick={() => navigate('/work')}>
            Все задачи →
          </button>
        </div>

        <div className="lg:col-span-2 glass-card card-purple p-5">
          <div className="flex items-center gap-2 mb-3">
            <Robot size={16} style={{ color: '#a99ff8' }} weight="fill" />
            <span className="text-sm font-semibold" style={{ color: '#a99ff8' }}>ИИ-совет дня</span>
          </div>
          <p className="text-sm leading-relaxed" style={{ color: '#9090b8' }}>
            У вас 2 просроченные задачи. Рекомендую начать день с их выполнения —
            это снизит стресс и увеличит концентрацию на остальных задачах.
          </p>
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(124,106,247,0.2)' }}>
            <p className="text-xs mb-2" style={{ color: '#5a5a80' }}>Быстрые действия</p>
            <div className="flex flex-wrap gap-2">
              {['Составить план дня', 'Анализ задач', 'Финансы'].map(q => (
                <button
                  key={q}
                  className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                  style={{ background: 'rgba(124,106,247,0.12)', color: '#a99ff8', border: '1px solid rgba(124,106,247,0.25)' }}
                  onClick={() => navigate('/ai')}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
