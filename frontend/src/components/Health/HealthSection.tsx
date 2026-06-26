import { useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, Plus, Pill, CheckSquare, Drop } from '@phosphor-icons/react';

const HABITS = [
  { emoji:'💧', name:'Вода 2л',         done:7, goal:7, color:'#22d3ee' },
  { emoji:'📖', name:'Чтение 30 мин',   done:5, goal:7, color:'#a99ff8' },
  { emoji:'🧘', name:'Медитация',       done:6, goal:7, color:'#10b981' },
  { emoji:'💊', name:'Витамины',        done:7, goal:7, color:'#f59e0b' },
  { emoji:'🏃', name:'10 000 шагов',    done:4, goal:7, color:'#f97316' },
];

const MEDICATIONS = [
  { name:'Витамин D3', dose:'2000 МЕ', time:'Утром', taken:true },
  { name:'Омега-3',    dose:'1г',      time:'Вечером', taken:false },
  { name:'Магний B6',  dose:'400мг',   time:'Перед сном', taken:false },
];

export default function HealthSection() {
  const [habits, setHabits] = useState(HABITS);
  const [meds, setMeds] = useState(MEDICATIONS);

  const toggleHabit = (i: number) => {
    setHabits(prev => prev.map((h, idx) => idx === i
      ? { ...h, done: h.done < h.goal ? h.done + 1 : 0 }
      : h
    ));
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-2.5 mb-6">
        <Heart size={24} style={{ color: '#ec4899' }} weight="fill" />
        <h1 className="section-title text-2xl">Здоровье</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Habits */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <CheckSquare size={16} style={{ color: '#10b981' }} weight="fill" />
              Привычки (неделя)
            </h3>
            <button className="btn-glass btn-sm"><Plus size={12} /> Привычка</button>
          </div>
          <div className="flex flex-col gap-4">
            {habits.map((h, i) => {
              const pct = Math.round((h.done / h.goal) * 100);
              return (
                <div key={h.name} className="flex items-center gap-3 cursor-pointer" onClick={() => toggleHabit(i)}>
                  <span className="text-xl w-7 text-center">{h.emoji}</span>
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span>{h.name}</span>
                      <span className="text-xs font-medium" style={{ color: h.color }}>{h.done}/{h.goal}</span>
                    </div>
                    <div className="progress-track">
                      <motion.div
                        className="progress-fill"
                        style={{ background: `linear-gradient(90deg, ${h.color}cc, ${h.color})` }}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: i * 0.05 }}
                      />
                    </div>
                  </div>
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold"
                    style={{ background: `${h.color}18`, color: h.color }}>
                    {pct}%
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Medications */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold flex items-center gap-2">
              <Pill size={16} style={{ color: '#ec4899' }} weight="fill" />
              Медикаменты сегодня
            </h3>
            <button className="btn-glass btn-sm"><Plus size={12} /> Добавить</button>
          </div>
          <div className="flex flex-col gap-3">
            {meds.map((m, i) => (
              <div key={m.name}
                className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all"
                style={{ background: m.taken ? 'rgba(16,185,129,0.08)' : 'rgba(255,255,255,0.03)', border: `1px solid ${m.taken ? 'rgba(16,185,129,0.2)' : 'rgba(255,255,255,0.06)'}` }}
                onClick={() => setMeds(prev => prev.map((md, j) => j === i ? { ...md, taken: !md.taken } : md))}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                    style={{ background: m.taken ? 'rgba(16,185,129,0.15)' : 'rgba(236,72,153,0.12)' }}>
                    💊
                  </div>
                  <div>
                    <p className="text-sm font-medium">{m.name}</p>
                    <p className="text-xs" style={{ color: '#5a5a80' }}>{m.dose} · {m.time}</p>
                  </div>
                </div>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${m.taken ? 'bg-green-500/20 text-green-400' : 'border border-white/10'}`}>
                  {m.taken ? '✓' : '○'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Water tracker */}
        <div className="glass-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Drop size={16} style={{ color: '#22d3ee' }} weight="fill" />
            <h3 className="font-semibold">Вода</h3>
          </div>
          <div className="flex items-center gap-3 mb-4">
            <div className="text-4xl font-bold" style={{ color: '#22d3ee' }}>1.4</div>
            <div>
              <p className="text-sm" style={{ color: '#9090b8' }}>из 2.0 литров</p>
              <p className="text-xs" style={{ color: '#5a5a80' }}>70% нормы</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap mb-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="w-8 h-12 rounded-lg flex items-end overflow-hidden"
                style={{ background: 'rgba(34,211,238,0.08)', border: '1px solid rgba(34,211,238,0.15)' }}>
                <div className="w-full transition-all duration-500"
                  style={{ height: i < 5 ? '75%' : i < 6 ? '30%' : '0%', background: 'linear-gradient(180deg,#67e8f9,#22d3ee)' }} />
              </div>
            ))}
          </div>
          <button className="btn-glass w-full text-sm" style={{ color: '#22d3ee', borderColor: 'rgba(34,211,238,0.25)' }}>
            + 250 мл
          </button>
        </div>

        {/* Weekly summary */}
        <div className="glass-card p-5">
          <h3 className="font-semibold mb-4">Итог недели</h3>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label:'Активных дней', value:'5/7', color:'#10b981' },
              { label:'Тренировок',    value:'3',   color:'#f97316' },
              { label:'Сон (avg)',     value:'7.2ч', color:'#a99ff8' },
              { label:'Шаги (avg)',    value:'8.4к', color:'#22d3ee' },
            ].map(s => (
              <div key={s.label} className="p-3 rounded-xl" style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                <p className="text-xs mb-1" style={{ color:'#5a5a80' }}>{s.label}</p>
                <p className="text-lg font-bold" style={{ color:s.color }}>{s.value}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
