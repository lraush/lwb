import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { financeApi } from '@/utils/apiClient';
import {
  PieChart, Pie, Cell, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import { CurrencyDollar, TrendUp, TrendDown, Plus, PiggyBank, Wallet } from '@phosphor-icons/react';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  description: string;
  date: string;
}

const MOCK_TRANSACTIONS: Transaction[] = [
  { id:'1', type:'income',  category:'Зарплата',    amount:150000, description:'Октябрь',    date:'2026-06-01' },
  { id:'2', type:'expense', category:'Аренда',      amount:45000,  description:'Квартира',   date:'2026-06-01' },
  { id:'3', type:'expense', category:'Продукты',    amount:18000,  description:'',            date:'2026-06-10' },
  { id:'4', type:'income',  category:'Фриланс',     amount:30000,  description:'Проект',     date:'2026-06-12' },
  { id:'5', type:'expense', category:'Транспорт',   amount:5000,   description:'',            date:'2026-06-14' },
  { id:'6', type:'expense', category:'Развлечения', amount:8000,   description:'Кино+рест.', date:'2026-06-15' },
  { id:'7', type:'expense', category:'Коммуналка',  amount:7000,   description:'ЖКХ',        date:'2026-06-05' },
  { id:'8', type:'expense', category:'Подписки',    amount:3000,   description:'',            date:'2026-06-01' },
];

const MONTHLY = [
  { month: 'Янв', income: 130000, expenses: 90000 },
  { month: 'Фев', income: 145000, expenses: 95000 },
  { month: 'Мар', income: 140000, expenses: 88000 },
  { month: 'Апр', income: 160000, expenses: 102000 },
  { month: 'Май', income: 155000, expenses: 98000 },
  { month: 'Июн', income: 180000, expenses: 86000 },
];

const PIE_COLORS = ['#7c6af7', '#22d3ee', '#10b981', '#f59e0b', '#ec4899', '#f97316'];

const CUSTOM_TOOLTIP = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-3 text-sm" style={{ minWidth: 160 }}>
      <p className="font-semibold mb-2" style={{ color: '#a99ff8' }}>{label}</p>
      {payload.map((p: any) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: {(p.value / 1000).toFixed(0)}к ₽
        </p>
      ))}
    </div>
  );
};

export default function FinanceSection() {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'expense', category: '', amount: '', description: '', date: '' });

  const { data: txns = MOCK_TRANSACTIONS } = useQuery<Transaction[]>({
    queryKey: ['transactions'],
    queryFn: () => financeApi.get('/transactions').then(r => r.data),
    placeholderData: MOCK_TRANSACTIONS,
  });

  const createTxn = useMutation({
    mutationFn: (data: any) => financeApi.post('/transactions', data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['transactions'] }); setShowForm(false); toast.success('Транзакция добавлена'); },
  });

  const income   = txns.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const expenses = txns.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance  = income - expenses;
  const rate     = income > 0 ? Math.round((balance / income) * 100) : 0;

  // Pie data by category
  const catMap: Record<string, number> = {};
  txns.filter(t => t.type === 'expense').forEach(t => {
    catMap[t.category] = (catMap[t.category] || 0) + t.amount;
  });
  const pieData = Object.entries(catMap).map(([name, value]) => ({ name, value }));

  const fmt = (n: number) => n.toLocaleString('ru') + ' ₽';

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <CurrencyDollar size={24} style={{ color: '#10b981' }} weight="fill" />
            <h1 className="section-title text-2xl">Финансы</h1>
          </div>
          <p className="text-sm" style={{ color: '#5a5a80' }}>Доходы, расходы и накопления</p>
        </div>
        <button className="btn-neon" onClick={() => setShowForm(true)}>
          <Plus size={16} weight="bold" />
          Транзакция
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Баланс',      value: fmt(balance), icon: Wallet,       color: balance >= 0 ? '#10b981' : '#ef4444' },
          { label: 'Доходы',      value: fmt(income),  icon: TrendUp,      color: '#10b981' },
          { label: 'Расходы',     value: fmt(expenses),icon: TrendDown,    color: '#ef4444' },
          { label: 'Сбережения',  value: `${rate}%`,   icon: PiggyBank,    color: '#a99ff8' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
            className="stat-card">
            <div className="flex items-center justify-between">
              <p className="text-xs" style={{ color: '#5a5a80' }}>{s.label}</p>
              <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${s.color}18` }}>
                <s.icon size={14} style={{ color: s.color }} weight="fill" />
              </div>
            </div>
            <p className="text-xl font-bold mt-1" style={{ color: s.color }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="lg:col-span-2 glass-card p-5">
          <h3 className="font-semibold mb-4 text-sm">Доходы vs Расходы по месяцам</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={MONTHLY}>
              <defs>
                <linearGradient id="incG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fill: '#5a5a80', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#5a5a80', fontSize: 11 }} axisLine={false} tickLine={false}
                tickFormatter={(v: number) => `${v/1000}к`} />
              <Tooltip content={<CUSTOM_TOOLTIP />} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 12, color: '#9090b8' }} />
              <Area type="monotone" dataKey="income" name="Доходы" stroke="#10b981" fill="url(#incG)" strokeWidth={2} />
              <Area type="monotone" dataKey="expenses" name="Расходы" stroke="#ef4444" fill="url(#expG)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4 text-sm">Расходы по категориям</h3>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={45} outerRadius={72}
                paddingAngle={3} dataKey="value">
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => fmt(v)} contentStyle={{ background: '#1a1a35', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-col gap-1.5 mt-2">
            {pieData.slice(0, 5).map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span style={{ color: '#9090b8' }}>{d.name}</span>
                </div>
                <span style={{ color: '#5a5a80' }}>{fmt(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transactions list */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4 text-sm">Последние транзакции</h3>
        <div className="flex flex-col gap-2">
          {txns.map(t => (
            <div key={t.id} className="flex items-center justify-between py-2.5 px-3 rounded-xl transition-colors"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                  style={{ background: t.type === 'income' ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.12)' }}>
                  {t.type === 'income' ? '↑' : '↓'}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.category}</p>
                  {t.description && <p className="text-xs" style={{ color: '#5a5a80' }}>{t.description}</p>}
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold" style={{ color: t.type === 'income' ? '#10b981' : '#ef4444' }}>
                  {t.type === 'income' ? '+' : '−'}{fmt(t.amount)}
                </p>
                <p className="text-xs" style={{ color: '#5a5a80' }}>
                  {new Date(t.date).toLocaleDateString('ru', { day: 'numeric', month: 'short' })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <motion.div className="modal" onClick={e => e.stopPropagation()}
            initial={{ opacity:0,scale:0.95 }} animate={{ opacity:1,scale:1 }} exit={{ opacity:0 }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">Добавить транзакцию</h3>
              <button className="btn-glass btn-icon" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#9090b8' }}>Тип</label>
                <div className="flex gap-2">
                  {(['income','expense'] as const).map(t => (
                    <button key={t} className="flex-1 py-2 rounded-xl text-sm font-medium transition-all"
                      style={form.type === t ? {
                        background: t === 'income' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)',
                        color: t === 'income' ? '#10b981' : '#ef4444',
                        border: `1px solid ${t === 'income' ? '#10b981' : '#ef4444'}50`,
                      } : { background: 'rgba(255,255,255,0.05)', color: '#5a5a80', border: '1px solid rgba(255,255,255,0.1)' }}
                      onClick={() => setForm(f => ({ ...f, type: t }))}>
                      {t === 'income' ? '↑ Доход' : '↓ Расход'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#9090b8' }}>Категория</label>
                <input className="input-glass" placeholder="Зарплата, аренда, продукты..."
                  value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: '#9090b8' }}>Сумма (₽)</label>
                <input className="input-glass" type="number" placeholder="0"
                  value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#9090b8' }}>Описание</label>
                  <input className="input-glass" placeholder="Заметка..."
                    value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: '#9090b8' }}>Дата</label>
                  <input className="input-glass" type="date" value={form.date}
                    onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                </div>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-5 pt-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
              <button className="btn-glass" onClick={() => setShowForm(false)}>Отмена</button>
              <button className="btn-neon"
                onClick={() => form.category && form.amount && createTxn.mutate({ ...form, amount: +form.amount })}>
                Добавить
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
