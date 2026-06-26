import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { learningApi } from '@/utils/apiClient';
import { Books, Plus, CheckCircle, Clock, ArrowRight, Brain , SquaresFour } from '@phosphor-icons/react';

interface Step { id: string; num: string; title: string; desc: string; hours: number; status: 'todo'|'in_progress'|'done'; progress: number; }
interface Topic { id: string; name: string; desc: string; category: string; steps: Step[]; }

const MOCK_TOPICS: Topic[] = [
  { id:'1', name:'Python', desc:'Основы Python: синтаксис, ООП, алгоритмы', category:'programming', steps:[
    { id:'1', num:'01', title:'Основы синтаксиса', desc:'Переменные, типы данных, условия, циклы', hours:10, status:'done', progress:100 },
    { id:'2', num:'02', title:'Функции и модули', desc:'Функции, аргументы, импорты', hours:8, status:'in_progress', progress:65 },
    { id:'3', num:'03', title:'ООП в Python', desc:'Классы, наследование, полиморфизм', hours:12, status:'todo', progress:0 },
    { id:'4', num:'04', title:'Работа с данными', desc:'Pandas, NumPy, визуализация', hours:15, status:'todo', progress:0 },
  ]},
  { id:'2', name:'Дизайн', desc:'UI/UX с Figma и основы типографики', category:'design', steps:[
    { id:'1', num:'01', title:'Основы Figma', desc:'Интерфейс, фреймы, компоненты', hours:8, status:'done', progress:100 },
    { id:'2', num:'02', title:'Типографика', desc:'Шрифты, иерархия, сетки', hours:6, status:'todo', progress:0 },
  ]},
];

const FLASHCARDS = [
  { q:'Что такое список (list) в Python?', a:'Изменяемая упорядоченная коллекция элементов любого типа. Создаётся с помощью [] или list().' },
  { q:'Что такое кортеж (tuple)?', a:'Неизменяемая упорядоченная коллекция элементов. Создаётся с помощью () или tuple().' },
  { q:'Разница между == и is?', a:'== сравнивает значения, is сравнивает идентичность объектов (адрес в памяти).' },
];

export default function LearningSection() {
  const [activeTopic, setActiveTopic] = useState(0);
  const [view, setView] = useState<'roadmap' | 'flashcards' | 'resources'>('roadmap');
  const [cardIdx, setCardIdx] = useState(0);
  const [cardFlipped, setCardFlipped] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [form, setForm] = useState({ name:'', desc:'', category:'' });
  const qc = useQueryClient();

  const { data: topics = MOCK_TOPICS } = useQuery<Topic[]>({
    queryKey: ['topics'],
    queryFn: () => learningApi.get('/topics').then(r => r.data),
    placeholderData: MOCK_TOPICS,
  });

  const createTopic = useMutation({
    mutationFn: (d: typeof form) => learningApi.post('/topics', d),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['topics'] }); setShowAddTopic(false); toast.success('Тема создана'); },
  });

  const updateStep = useMutation({
    mutationFn: ({ topicId, stepId, status }: { topicId: string; stepId: string; status: string }) =>
      learningApi.patch(`/topics/${topicId}/steps/${stepId}`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['topics'] }),
  });

  const topic = topics[activeTopic] ?? topics[0];
  const progress = topic ? Math.round(topic.steps.reduce((s, st) => s + st.progress, 0) / (topic.steps.length || 1)) : 0;

  const STATUS_MAP = {
    todo:        { label:'Ожидает',    color:'#5a5a80', bg:'rgba(90,90,128,0.12)' },
    in_progress: { label:'В процессе', color:'#f59e0b', bg:'rgba(245,158,11,0.12)' },
    done:        { label:'Завершено',  color:'#10b981', bg:'rgba(16,185,129,0.12)' },
  };

  return (
    <div className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <Books size={24} style={{ color: '#f59e0b' }} weight="fill" />
            <h1 className="section-title text-2xl">Обучение</h1>
          </div>
          <p className="text-sm" style={{ color: '#5a5a80' }}>Роадмапы, карточки и прогресс</p>
        </div>
        <button className="btn-neon" onClick={() => setShowAddTopic(true)}>
          <Plus size={16} weight="bold" />
          Новая тема
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label:'Тем',         value: topics.length,                                                              color:'#f59e0b' },
          { label:'Шагов',       value: topics.flatMap(t=>t.steps).length,                                          color:'#a99ff8' },
          { label:'Завершено',   value: topics.flatMap(t=>t.steps).filter(s=>s.status==='done').length,             color:'#10b981' },
          { label:'В процессе',  value: topics.flatMap(t=>t.steps).filter(s=>s.status==='in_progress').length,     color:'#22d3ee' },
        ].map((s,i) => (
          <motion.div key={s.label} initial={{ opacity:0,y:10 }} animate={{ opacity:1,y:0 }} transition={{ delay:i*0.06 }}
            className="stat-card">
            <p className="text-xs" style={{ color:'#5a5a80' }}>{s.label}</p>
            <p className="text-2xl font-bold" style={{ color:s.color }}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Topic tabs */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {topics.map((t, i) => {
          const tp = Math.round(t.steps.reduce((s, st) => s + st.progress, 0) / (t.steps.length || 1));
          return (
            <button
              key={t.id}
              onClick={() => setActiveTopic(i)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all"
              style={activeTopic === i ? {
                background: 'rgba(245,158,11,0.15)',
                border: '1px solid rgba(245,158,11,0.4)',
                color: '#f59e0b',
              } : {
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: '#9090b8',
              }}
            >
              {t.name}
              <span className="text-xs opacity-70">{tp}%</span>
            </button>
          );
        })}
      </div>

      {topic && (
        <div>
          {/* Topic header */}
          <div className="glass-card p-5 mb-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h2 className="text-lg font-bold">{topic.name}</h2>
                <p className="text-sm mt-0.5" style={{ color:'#9090b8' }}>{topic.desc}</p>
              </div>
              <span className="badge badge-amber">{topic.category}</span>
            </div>
            <div className="flex items-center justify-between text-xs mb-1.5" style={{ color:'#9090b8' }}>
              <span>Прогресс</span><span className="font-semibold">{progress}%</span>
            </div>
            <div className="progress-track h-2">
              <div className="progress-fill" style={{ width:`${progress}%`, background:'linear-gradient(90deg,#f59e0b,#fbbf24)' }} />
            </div>
          </div>

          {/* View tabs */}
          <div className="flex gap-2 mb-5">
            {([
              { id:'roadmap',    label:'Роадмап',  icon:ArrowRight },
              { id:'flashcards', label:'Карточки', icon:SquaresFour },
              { id:'resources',  label:'Ресурсы',  icon:Brain },
            ] as const).map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setView(id)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                style={view === id ? {
                  background:'rgba(245,158,11,0.15)', border:'1px solid rgba(245,158,11,0.35)', color:'#f59e0b',
                } : { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)', color:'#5a5a80' }}>
                <Icon size={14} />
                {label}
              </button>
            ))}
          </div>

          {/* Roadmap */}
          {view === 'roadmap' && (
            <div className="flex flex-col gap-3">
              {topic.steps.map((step, idx) => {
                const s = STATUS_MAP[step.status];
                return (
                  <motion.div key={step.id} initial={{ opacity:0,x:-8 }} animate={{ opacity:1,x:0 }} transition={{ delay:idx*0.05 }}
                    className="glass-card p-5 flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold flex-shrink-0"
                      style={{ background: step.status==='done' ? 'rgba(16,185,129,0.15)' : 'rgba(124,106,247,0.12)',
                               color: step.status==='done' ? '#10b981' : '#a99ff8' }}>
                      {step.status==='done' ? '✓' : step.num}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-1">
                        <h3 className="font-semibold">{step.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-xs" style={{ color:'#5a5a80' }}>⏱ {step.hours}ч</span>
                          <span className="badge text-xs" style={{ background:s.bg, color:s.color, border:`1px solid ${s.color}30` }}>
                            {s.label}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs mb-3" style={{ color:'#9090b8' }}>{step.desc}</p>
                      {step.status !== 'todo' && (
                        <div>
                          <div className="flex justify-between text-xs mb-1" style={{ color:'#5a5a80' }}>
                            <span>Прогресс</span><span>{step.progress}%</span>
                          </div>
                          <div className="progress-track">
                            <div className="progress-fill" style={{ width:`${step.progress}%`,
                              background:step.status==='done'?'linear-gradient(90deg,#059669,#10b981)':'linear-gradient(90deg,#d97706,#f59e0b)' }} />
                          </div>
                        </div>
                      )}
                      {step.status !== 'done' && (
                        <button
                          className="mt-3 text-xs px-3 py-1.5 rounded-lg transition-colors"
                          style={{ background:'rgba(16,185,129,0.1)', color:'#10b981', border:'1px solid rgba(16,185,129,0.25)' }}
                          onClick={() => updateStep.mutate({ topicId:topic.id, stepId:step.id, status:step.status==='todo'?'in_progress':'done' })}
                        >
                          {step.status==='todo' ? '▶ Начать' : '✓ Завершить'}
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Flashcards */}
          {view === 'flashcards' && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-xs" style={{ color:'#5a5a80' }}>{cardIdx + 1} / {FLASHCARDS.length}</p>
              <motion.div
                className="glass-card w-full max-w-lg p-8 cursor-pointer text-center"
                style={{ minHeight:200, border:'1px solid rgba(245,158,11,0.2)' }}
                onClick={() => setCardFlipped(f => !f)}
                whileHover={{ scale:1.01 }}
                whileTap={{ scale:0.99 }}
              >
                <AnimatePresence mode="wait">
                  <motion.div key={cardFlipped ? 'a' : 'q'}
                    initial={{ opacity:0, rotateY:90 }} animate={{ opacity:1, rotateY:0 }} exit={{ opacity:0, rotateY:-90 }}
                    transition={{ duration:0.25 }}>
                    {!cardFlipped ? (
                      <div>
                        <p className="text-xs mb-4" style={{ color:'#5a5a80' }}>Вопрос — нажмите для ответа</p>
                        <p className="text-lg font-semibold">{FLASHCARDS[cardIdx].q}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs mb-4" style={{ color:'#10b981' }}>Ответ</p>
                        <p className="text-base leading-relaxed" style={{ color:'#c0c0d8' }}>{FLASHCARDS[cardIdx].a}</p>
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </motion.div>
              <div className="flex gap-3">
                <button className="btn-glass"
                  onClick={() => { setCardIdx(i => (i - 1 + FLASHCARDS.length) % FLASHCARDS.length); setCardFlipped(false); }}>
                  ← Назад
                </button>
                <button className="btn-neon"
                  onClick={() => { setCardIdx(i => (i + 1) % FLASHCARDS.length); setCardFlipped(false); }}>
                  Далее →
                </button>
              </div>
            </div>
          )}

          {/* Resources */}
          {view === 'resources' && (
            <div className="glass-card p-5">
              <p className="text-sm" style={{ color:'#9090b8' }}>
                Подключите ресурсы к теме: книги, видео-лекции, статьи и курсы. ИИ-агент сможет искать и рекомендовать материалы автоматически.
              </p>
              <button className="btn-neon mt-4">
                <Plus size={14} />
                Добавить ресурс
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add topic modal */}
      {showAddTopic && (
        <div className="modal-overlay" onClick={() => setShowAddTopic(false)}>
          <motion.div className="modal" onClick={e => e.stopPropagation()}
            initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold">Новая тема</h3>
              <button className="btn-glass btn-icon" onClick={() => setShowAddTopic(false)}>✕</button>
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color:'#9090b8' }}>Название</label>
                <input className="input-glass" placeholder="React, English, Piano..."
                  value={form.name} onChange={e => setForm(f => ({ ...f, name:e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color:'#9090b8' }}>Описание</label>
                <textarea className="input-glass" rows={2} placeholder="О чём эта тема..."
                  value={form.desc} onChange={e => setForm(f => ({ ...f, desc:e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color:'#9090b8' }}>Категория</label>
                <select className="input-glass" value={form.category} onChange={e => setForm(f => ({ ...f, category:e.target.value }))}>
                  <option value="">Выберите...</option>
                  <option value="programming">Программирование</option>
                  <option value="design">Дизайн</option>
                  <option value="language">Языки</option>
                  <option value="business">Бизнес</option>
                  <option value="science">Наука</option>
                  <option value="other">Другое</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-5 pt-4" style={{ borderTop:'1px solid rgba(255,255,255,0.07)' }}>
              <button className="btn-glass" onClick={() => setShowAddTopic(false)}>Отмена</button>
              <button className="btn-neon" onClick={() => form.name && createTopic.mutate(form)}>Создать</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
