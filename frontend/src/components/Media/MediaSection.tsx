import { useState } from 'react';
import { motion } from 'framer-motion';
import { FilmSlate, Plus, Book, Star } from '@phosphor-icons/react';

type MediaType = 'all' | 'book' | 'movie' | 'series';
type MediaStatus = 'wishlist' | 'in_progress' | 'done';

interface MediaItem {
  id: string; type: 'book'|'movie'|'series';
  title: string; author?: string; year?: number;
  status: MediaStatus; rating?: number; emoji: string;
}

const ITEMS: MediaItem[] = [
  { id:'1', type:'book',   title:'Мастер и Маргарита', author:'Булгаков',       status:'done',        rating:5, emoji:'📗' },
  { id:'2', type:'book',   title:'Атомные привычки',   author:'Джеймс Клир',   status:'in_progress', emoji:'📘' },
  { id:'3', type:'book',   title:'Думай медленно',     author:'Канеман',        status:'wishlist',    emoji:'📙' },
  { id:'4', type:'movie',  title:'Dune: Part Two',     year:2024,               status:'done',        rating:5, emoji:'🎬' },
  { id:'5', type:'movie',  title:'Oppenheimer',        year:2023,               status:'done',        rating:4, emoji:'🎬' },
  { id:'6', type:'series', title:'Severance S2',       year:2025,               status:'in_progress', emoji:'📺' },
  { id:'7', type:'series', title:'Shōgun',             year:2024,               status:'wishlist',    emoji:'📺' },
];

const STATUS_CFG: Record<MediaStatus, { label:string; color:string; bg:string }> = {
  wishlist:    { label:'Хочу',       color:'#a99ff8', bg:'rgba(124,106,247,0.12)' },
  in_progress: { label:'Смотрю/Читаю', color:'#f59e0b', bg:'rgba(245,158,11,0.12)' },
  done:        { label:'Просмотрено', color:'#10b981', bg:'rgba(16,185,129,0.12)' },
};

export default function MediaSection() {
  const [filter, setFilter] = useState<MediaType>('all');
  const [statusFilter, setStatusFilter] = useState<MediaStatus|'all'>('all');
  const [showForm, setShowForm] = useState(false);

  const filtered = ITEMS
    .filter(i => filter === 'all' || i.type === filter)
    .filter(i => statusFilter === 'all' || i.status === statusFilter);

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <FilmSlate size={24} style={{ color:'#8b5cf6' }} weight="fill" />
            <h1 className="section-title text-2xl">Медиатека</h1>
          </div>
          <p className="text-sm" style={{ color:'#5a5a80' }}>Книги, фильмы и сериалы</p>
        </div>
        <button className="btn-neon" onClick={() => setShowForm(true)}>
          <Plus size={16} weight="bold" /> Добавить
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label:'Всего', value:ITEMS.length, color:'#8b5cf6' },
          { label:'Прочитано/Просмотрено', value:ITEMS.filter(i=>i.status==='done').length, color:'#10b981' },
          { label:'В процессе', value:ITEMS.filter(i=>i.status==='in_progress').length, color:'#f59e0b' },
          { label:'Хочу', value:ITEMS.filter(i=>i.status==='wishlist').length, color:'#a99ff8' },
        ].map((s,i) => (
          <motion.div key={s.label} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.06 }}
            className="stat-card">
            <p className="text-xs" style={{ color:'#5a5a80' }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color:s.color }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-5">
        <div className="flex gap-1.5">
          {(['all','book','movie','series'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="text-xs px-3 py-1.5 rounded-lg transition-all font-medium"
              style={filter===f ? {
                background:'rgba(139,92,246,0.2)', color:'#a78bfa', border:'1px solid rgba(139,92,246,0.4)',
              } : { background:'rgba(255,255,255,0.04)', color:'#5a5a80', border:'1px solid rgba(255,255,255,0.07)' }}>
              {f==='all'?'Все':f==='book'?'📚 Книги':f==='movie'?'🎬 Фильмы':'📺 Сериалы'}
            </button>
          ))}
        </div>
        <div className="flex gap-1.5 ml-auto">
          {(['all','wishlist','in_progress','done'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className="text-xs px-3 py-1.5 rounded-lg transition-all"
              style={statusFilter===s ? {
                background:'rgba(255,255,255,0.08)', color:'#f0f0ff', border:'1px solid rgba(255,255,255,0.15)',
              } : { background:'rgba(255,255,255,0.03)', color:'#5a5a80', border:'1px solid rgba(255,255,255,0.06)' }}>
              {s==='all'?'Все статусы':STATUS_CFG[s as MediaStatus]?.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((item, i) => {
          const sc = STATUS_CFG[item.status];
          return (
            <motion.div key={item.id} initial={{ opacity:0,scale:0.95 }} animate={{ opacity:1,scale:1 }}
              transition={{ delay:i*0.04 }} className="glass-card-hover p-4">
              <div className="text-3xl mb-3 text-center">{item.emoji}</div>
              <h3 className="font-semibold text-sm mb-1 leading-snug">{item.title}</h3>
              {item.author && <p className="text-xs mb-1" style={{ color:'#9090b8' }}>{item.author}</p>}
              {item.year   && <p className="text-xs mb-2" style={{ color:'#5a5a80' }}>{item.year}</p>}
              <div className="flex items-center justify-between mt-2">
                <span className="badge text-xs" style={{ background:sc.bg, color:sc.color, border:`1px solid ${sc.color}30` }}>
                  {sc.label}
                </span>
                {item.rating && (
                  <div className="flex items-center gap-0.5">
                    {Array.from({length:5}).map((_,j) => (
                      <Star key={j} size={11} weight={j<item.rating!?'fill':'regular'}
                        style={{ color:j<item.rating!?'#f59e0b':'#3a3a5c' }} />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <motion.div className="modal" onClick={e => e.stopPropagation()}
            initial={{ opacity:0,scale:0.95 }} animate={{ opacity:1,scale:1 }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">Добавить в медиатеку</h3>
              <button className="btn-glass btn-icon" onClick={() => setShowForm(false)}>✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color:'#9090b8' }}>Тип</label>
                <select className="input-glass">
                  <option value="book">📚 Книга</option>
                  <option value="movie">🎬 Фильм</option>
                  <option value="series">📺 Сериал</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color:'#9090b8' }}>Название</label>
                <input className="input-glass" placeholder="Название..." />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color:'#9090b8' }}>Автор / Год</label>
                <input className="input-glass" placeholder="Автор или год выпуска" />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color:'#9090b8' }}>Статус</label>
                <select className="input-glass">
                  <option value="wishlist">Хочу</option>
                  <option value="in_progress">Читаю / Смотрю</option>
                  <option value="done">Завершено</option>
                </select>
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
