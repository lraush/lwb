import { useState } from 'react';
import { motion } from 'framer-motion';
import { Airplane, Plus, MapPin, CalendarBlank, CurrencyDollar } from '@phosphor-icons/react';

const TRIPS = [
  { id:'1', dest:'Токио, Япония',     emoji:'🇯🇵', date:'Авг 2026',  budget:150000, status:'planned', img:'🏯' },
  { id:'2', dest:'Барселона, Испания',emoji:'🇪🇸', date:'Сен 2026',  budget:90000,  status:'planned', img:'🏖️' },
  { id:'3', dest:'Тбилиси, Грузия',  emoji:'🇬🇪', date:'Май 2026',  budget:60000,  status:'done',    img:'🏔️' },
];

const STATUS_CFG: Record<string,{label:string;color:string;bg:string}> = {
  planned: { label:'Запланировано', color:'#22d3ee', bg:'rgba(34,211,238,0.12)' },
  active:  { label:'В пути',        color:'#10b981', bg:'rgba(16,185,129,0.12)' },
  done:    { label:'Посещено',      color:'#5a5a80', bg:'rgba(90,90,128,0.12)' },
};

export default function TravelSection() {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ dest:'', date:'', budget:'' });

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Airplane size={24} style={{ color:'#06b6d4' }} weight="fill" />
            <h1 className="section-title text-2xl">Путешествия</h1>
          </div>
          <p className="text-sm" style={{ color:'#5a5a80' }}>Планируй приключения</p>
        </div>
        <button className="btn-neon" onClick={() => setShowForm(true)}>
          <Plus size={16} weight="bold" /> Новая поездка
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label:'Всего поездок', value: TRIPS.length,                          color:'#06b6d4' },
          { label:'Запланировано', value: TRIPS.filter(t=>t.status==='planned').length, color:'#22d3ee' },
          { label:'Посещено',      value: TRIPS.filter(t=>t.status==='done').length,    color:'#10b981' },
        ].map((s,i) => (
          <motion.div key={s.label} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.06 }}
            className="stat-card">
            <p className="text-xs" style={{ color:'#5a5a80' }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color:s.color }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Trip cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {TRIPS.map((trip, i) => {
          const sc = STATUS_CFG[trip.status];
          return (
            <motion.div key={trip.id} initial={{ opacity:0,y:12 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.07 }}
              className="glass-card-hover p-5 cursor-pointer">
              <div className="text-4xl mb-3">{trip.img}</div>
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="font-semibold">{trip.dest}</p>
                  <p className="text-xs mt-0.5" style={{ color:'#5a5a80' }}>{trip.emoji} {trip.date}</p>
                </div>
                <span className="badge text-xs" style={{ background:sc.bg, color:sc.color, border:`1px solid ${sc.color}30` }}>
                  {sc.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs" style={{ color:'#5a5a80' }}>
                <CurrencyDollar size={12} />
                Бюджет: {trip.budget.toLocaleString('ru')} ₽
              </div>
            </motion.div>
          );
        })}

        {/* Add card */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.3 }}
          className="glass-card p-5 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all min-h-36"
          style={{ border:'1px dashed rgba(255,255,255,0.1)' }}
          onClick={() => setShowForm(true)}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{ background:'rgba(6,182,212,0.12)' }}>
            <Plus size={20} style={{ color:'#06b6d4' }} />
          </div>
          <p className="text-sm" style={{ color:'#5a5a80' }}>Добавить поездку</p>
        </motion.div>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <motion.div className="modal" onClick={e => e.stopPropagation()}
            initial={{ opacity:0,scale:0.95 }} animate={{ opacity:1,scale:1 }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">Новая поездка</h3>
              <button className="btn-glass btn-icon" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color:'#9090b8' }}>Направление</label>
                <input className="input-glass" placeholder="Токио, Япония"
                  value={form.dest} onChange={e => setForm(f => ({ ...f, dest:e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color:'#9090b8' }}>Дата</label>
                <input className="input-glass" type="date"
                  value={form.date} onChange={e => setForm(f => ({ ...f, date:e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color:'#9090b8' }}>Бюджет (₽)</label>
                <input className="input-glass" type="number" placeholder="100000"
                  value={form.budget} onChange={e => setForm(f => ({ ...f, budget:e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-5 pt-4" style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              <button className="btn-glass" onClick={() => setShowForm(false)}>Отмена</button>
              <button className="btn-neon" onClick={() => setShowForm(false)}>Добавить</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
