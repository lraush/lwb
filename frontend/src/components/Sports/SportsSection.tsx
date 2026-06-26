import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Plus, Fire, Timer, Barbell } from '@phosphor-icons/react';

const WORKOUTS = [
  { id:'1', type:'Бег',       date:'2026-06-19', duration:35, distance:'5.2 км', calories:320, emoji:'🏃' },
  { id:'2', type:'Силовая',   date:'2026-06-17', duration:60, distance:'—',      calories:480, emoji:'💪' },
  { id:'3', type:'Велосипед', date:'2026-06-15', duration:90, distance:'28 км',  calories:650, emoji:'🚴' },
  { id:'4', type:'Плавание',  date:'2026-06-13', duration:45, distance:'1.2 км', calories:400, emoji:'🏊' },
];

const WEEKLY = ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'];
const DONE_DAYS = [0, 2, 4]; // Пн, Ср, Пт

export default function SportsSection() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type:'', duration:'', distance:'', calories:'' });

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Trophy size={24} style={{ color: '#f97316' }} weight="fill" />
            <h1 className="section-title text-2xl">Спорт</h1>
          </div>
          <p className="text-sm" style={{ color: '#5a5a80' }}>Тренировки и активность</p>
        </div>
        <button className="btn-neon" onClick={() => setShowForm(true)}>
          <Plus size={16} weight="bold" /> Тренировка
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label:'Тренировок/нед', value:'3/5',    color:'#f97316', icon:Trophy },
          { label:'Калорий/нед',    value:'1 450',  color:'#ef4444', icon:Fire },
          { label:'Минут/нед',      value:'185',    color:'#f59e0b', icon:Timer },
          { label:'Серия дней',     value:'12 🔥',  color:'#a99ff8', icon:Barbell },
        ].map((s,i) => (
          <motion.div key={s.label} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.06 }}
            className="stat-card">
            <p className="text-xs" style={{ color:'#5a5a80' }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color:s.color }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Weekly calendar */}
      <div className="glass-card p-5 mb-5">
        <h3 className="font-semibold mb-4 text-sm">Неделя</h3>
        <div className="flex gap-2">
          {WEEKLY.map((day, i) => (
            <div key={day} className="flex-1 flex flex-col items-center gap-2">
              <span className="text-xs" style={{ color:'#5a5a80' }}>{day}</span>
              <div
                className="w-full aspect-square rounded-xl flex items-center justify-center text-lg transition-all"
                style={{
                  background: DONE_DAYS.includes(i) ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.03)',
                  border: `1px solid ${DONE_DAYS.includes(i) ? 'rgba(249,115,22,0.4)' : 'rgba(255,255,255,0.06)'}`,
                }}
              >
                {DONE_DAYS.includes(i) ? '✓' : i === 4 ? '📅' : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Workout history */}
      <div className="glass-card p-5">
        <h3 className="font-semibold mb-4 text-sm">История тренировок</h3>
        <div className="flex flex-col gap-3">
          {WORKOUTS.map(w => (
            <div key={w.id} className="flex items-center gap-4 p-3 rounded-xl"
              style={{ background:'rgba(255,255,255,0.02)', border:'1px solid rgba(255,255,255,0.05)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                style={{ background:'rgba(249,115,22,0.12)' }}>{w.emoji}</div>
              <div className="flex-1">
                <p className="text-sm font-semibold">{w.type}</p>
                <p className="text-xs" style={{ color:'#5a5a80' }}>
                  {new Date(w.date).toLocaleDateString('ru',{day:'numeric',month:'short'})} · {w.duration} мин · {w.distance}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold" style={{ color:'#f97316' }}>{w.calories}</p>
                <p className="text-xs" style={{ color:'#5a5a80' }}>ккал</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <motion.div className="modal" onClick={e => e.stopPropagation()}
            initial={{ opacity:0,scale:0.95 }} animate={{ opacity:1,scale:1 }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">Новая тренировка</h3>
              <button className="btn-glass btn-icon" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="flex flex-col gap-4">
              {[
                { label:'Тип', key:'type', placeholder:'Бег, силовая, йога...' },
                { label:'Длительность (мин)', key:'duration', placeholder:'45', type:'number' },
                { label:'Дистанция', key:'distance', placeholder:'5.0 км или —' },
                { label:'Калории', key:'calories', placeholder:'350', type:'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="block text-xs font-medium mb-1.5" style={{ color:'#9090b8' }}>{f.label}</label>
                  <input className="input-glass" type={f.type||'text'} placeholder={f.placeholder}
                    value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]:e.target.value }))} />
                </div>
              ))}
            </div>
            <div className="flex gap-3 justify-end mt-5 pt-4" style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              <button className="btn-glass" onClick={() => setShowForm(false)}>Отмена</button>
              <button className="btn-neon" onClick={() => setShowForm(false)}>Сохранить</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
