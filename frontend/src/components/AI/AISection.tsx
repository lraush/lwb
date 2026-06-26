import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { aiApi } from '@/utils/apiClient';
import {
  Robot, PaperPlaneTilt, Microphone, MicrophoneSlash,
  Desktop, Trash, Sparkle, Lightning, Brain,
  FileText, Globe, BookOpen,
} from '@phosphor-icons/react';

interface Message {
  id: string; role: 'user'|'assistant'; content: string; ts: Date;
}

const QUICK_PROMPTS = [
  { label:'📋 План дня',        text:'Составь мне план на сегодня. Учти, что у меня есть рабочие задачи, учёба и личные дела.' },
  { label:'💰 Финансовый совет', text:'Дай советы по улучшению финансового положения и накоплениям.' },
  { label:'📚 Учебный план',    text:'Помоги создать эффективный план изучения Python с нуля до продвинутого уровня.' },
  { label:'🏃 Спортивный план', text:'Составь план тренировок на неделю для улучшения выносливости.' },
  { label:'🧠 Мозговой штурм', text:'Хочу провести мозговой штурм. Я открыт к новым идеям для личных проектов.' },
  { label:'🌐 Найди ресурсы',  text:'Найди лучшие бесплатные ресурсы для изучения веб-разработки в 2026 году.' },
];

const CAPABILITIES = [
  { icon:Brain,    label:'Умный чат',       desc:'Задавайте любые вопросы' },
  { icon:Microphone, label:'Голосовой ввод', desc:'Говорите вместо печати' },
  { icon:Desktop,  label:'Анализ экрана',   desc:'ИИ видит ваш экран' },
  { icon:Globe,    label:'Поиск в сети',    desc:'Актуальная информация' },
  { icon:FileText, label:'Генерация PDF',   desc:'Конспекты и отчёты' },
  { icon:BookOpen, label:'База знаний',     desc:'Ваши данные в контексте' },
];

export default function AISection() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<MediaRecorder|null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  const addMsg = (role: 'user'|'assistant', content: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role, content, ts: new Date() }]);
  };

  const send = async (text = input) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput('');
    setShowWelcome(false);
    addMsg('user', trimmed);
    setLoading(true);
    try {
      const history = messages.slice(-12).map(m => ({ role: m.role, content: m.content }));
      const { data } = await aiApi.post('/chat', { message: trimmed, history });
      addMsg('assistant', data.response ?? data.content ?? 'Нет ответа от ИИ.');
    } catch (err: any) {
      const msg = err.response?.status === 429
        ? 'Слишком много запросов. Подождите немного.'
        : 'Ошибка соединения с ИИ. Проверьте API-ключ.';
      addMsg('assistant', msg);
    } finally {
      setLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = e => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const fd = new FormData();
        fd.append('audio', blob, 'voice.webm');
        try {
          const { data } = await aiApi.post('/transcribe', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
          if (data.text) { setInput(data.text); inputRef.current?.focus(); toast.success('Голос распознан'); }
        } catch { toast.error('Ошибка распознавания'); }
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
      toast('Запись... нажмите снова для остановки', { icon: '🎙️' });
    } catch { toast.error('Нет доступа к микрофону'); }
  };

  const stopRecording = () => { mediaRef.current?.stop(); setRecording(false); };

  const captureScreen = async () => {
    setCapturing(true);
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true, audio: false });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();
      const canvas = document.createElement('canvas');
      canvas.width = Math.min(video.videoWidth, 1280);
      canvas.height = Math.round(canvas.width * video.videoHeight / video.videoWidth);
      canvas.getContext('2d')!.drawImage(video, 0, 0, canvas.width, canvas.height);
      stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      const imageData = canvas.toDataURL('image/jpeg', 0.75);
      setShowWelcome(false);
      addMsg('user', '[📸 Скриншот экрана отправлен на анализ]');
      setLoading(true);
      const { data } = await aiApi.post('/analyze-screen', { image: imageData });
      addMsg('assistant', data.analysis ?? 'Не удалось проанализировать экран.');
    } catch (e: any) {
      if (e.name !== 'NotAllowedError') toast.error('Ошибка захвата экрана');
    } finally {
      setCapturing(false);
      setLoading(false);
    }
  };

  const generatePDF = async () => {
    if (messages.length < 2) { toast.error('Нет содержимого для генерации'); return; }
    try {
      const { data } = await aiApi.post('/generate-pdf', {
        title: 'Сессия с ИИ-ассистентом',
        messages: messages.map(m => ({ role: m.role, content: m.content })),
      }, { responseType: 'blob' });
      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url; a.download = 'ai-session.pdf'; a.click();
      URL.revokeObjectURL(url);
      toast.success('PDF скачан');
    } catch { toast.error('Ошибка генерации PDF'); }
  };

  return (
    <div className="flex flex-col h-full max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0"
        style={{ borderColor:'rgba(255,255,255,0.06)', background:'rgba(10,10,24,0.5)', backdropFilter:'blur(20px)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background:'linear-gradient(135deg,#7c6af7,#a99ff8)', boxShadow:'0 4px 16px rgba(124,106,247,0.4)' }}>
            <Robot size={18} weight="fill" className="text-white" />
          </div>
          <div>
            <h1 className="font-bold">ИИ-Ассистент</h1>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background:'#10b981', boxShadow:'0 0 4px #10b981' }} />
              <p className="text-xs" style={{ color:'#5a5a80' }}>Готов к работе</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={generatePDF} className="btn-glass btn-sm flex items-center gap-1.5"
            title="Скачать PDF">
            <FileText size={13} /> PDF
          </button>
          <button onClick={() => { setMessages([]); setShowWelcome(true); }} className="btn-glass btn-sm flex items-center gap-1.5">
            <Trash size={13} /> Очистить
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-6">
        {/* Welcome screen */}
        {showWelcome && (
          <motion.div initial={{ opacity:0,y:16 }} animate={{ opacity:1,y:0 }} className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
                style={{ background:'linear-gradient(135deg,#7c6af7,#a99ff8)', boxShadow:'0 8px 32px rgba(124,106,247,0.5)', animation:'glowPulse 2s infinite' }}>
                <Sparkle size={28} weight="fill" className="text-white" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Чем могу помочь?</h2>
              <p className="text-sm" style={{ color:'#5a5a80' }}>
                Задайте вопрос, используйте голосовой ввод или захватите экран для анализа
              </p>
            </div>

            {/* Capabilities */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-8">
              {CAPABILITIES.map(({ icon:Icon, label, desc }) => (
                <div key={label} className="glass-card p-4 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background:'rgba(124,106,247,0.15)' }}>
                    <Icon size={16} style={{ color:'#a99ff8' }} weight="fill" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{label}</p>
                    <p className="text-xs mt-0.5" style={{ color:'#5a5a80' }}>{desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Quick prompts */}
            <h3 className="text-xs font-semibold mb-3" style={{ color:'#5a5a80' }}>БЫСТРЫЕ КОМАНДЫ</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {QUICK_PROMPTS.map(q => (
                <button key={q.label} onClick={() => send(q.text)}
                  className="text-left p-3 rounded-xl text-sm font-medium transition-all"
                  style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)', color:'#9090b8' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(124,106,247,0.1)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(124,106,247,0.3)';
                    (e.currentTarget as HTMLElement).style.color = '#a99ff8';
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.03)';
                    (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.07)';
                    (e.currentTarget as HTMLElement).style.color = '#9090b8';
                  }}>
                  {q.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Chat messages */}
        <div className="max-w-3xl mx-auto flex flex-col gap-4">
          <AnimatePresence initial={false}>
            {messages.map(msg => (
              <motion.div key={msg.id} initial={{ opacity:0,y:8 }} animate={{ opacity:1,y:0 }}
                className={`flex flex-col gap-1 ${msg.role==='user'?'items-end':'items-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-0.5 px-1">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center"
                      style={{ background:'linear-gradient(135deg,#7c6af7,#a99ff8)' }}>
                      <Sparkle size={11} weight="fill" className="text-white" />
                    </div>
                    <span className="text-xs font-medium" style={{ color:'#7c6af7' }}>ИИ-Ассистент</span>
                  </div>
                )}
                <div
                  className="px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap max-w-[85%]"
                  style={msg.role==='user' ? {
                    background:'linear-gradient(135deg,rgba(124,106,247,0.3),rgba(124,106,247,0.15))',
                    border:'1px solid rgba(124,106,247,0.35)', color:'#f0f0ff', borderBottomRightRadius:6,
                  } : {
                    background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)',
                    color:'#e0e0f5', borderBottomLeftRadius:6,
                  }}
                >
                  {msg.content}
                </div>
                <span className="text-xs px-1" style={{ color:'#3a3a5c' }}>
                  {msg.ts.toLocaleTimeString('ru',{hour:'2-digit',minute:'2-digit'})}
                </span>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="flex flex-col gap-1 items-start">
              <div className="flex items-center gap-1.5 mb-0.5 px-1">
                <div className="w-5 h-5 rounded-md flex items-center justify-center"
                  style={{ background:'linear-gradient(135deg,#7c6af7,#a99ff8)' }}>
                  <Sparkle size={11} weight="fill" className="text-white" />
                </div>
                <span className="text-xs font-medium" style={{ color:'#7c6af7' }}>Думаю...</span>
              </div>
              <div className="px-4 py-3 rounded-2xl" style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)' }}>
                <div className="flex items-center gap-1.5">
                  <div className="typing-dot" /><div className="typing-dot" /><div className="typing-dot" />
                </div>
              </div>
            </motion.div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Input */}
      <div className="px-6 pb-6 pt-3 flex-shrink-0 border-t" style={{ borderColor:'rgba(255,255,255,0.06)' }}>
        <div className="max-w-3xl mx-auto">
          {/* Action bar */}
          <div className="flex gap-2 mb-2">
            <button
              onClick={recording ? stopRecording : startRecording}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                recording ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' : 'btn-glass'
              }`}
            >
              {recording ? <MicrophoneSlash size={13} /> : <Microphone size={13} />}
              {recording ? 'Остановить запись' : 'Голос'}
            </button>
            <button onClick={captureScreen} disabled={capturing}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg btn-glass font-medium">
              <Desktop size={13} />
              {capturing ? 'Захват...' : 'Экран'}
            </button>
            <button className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg btn-glass font-medium ml-auto"
              onClick={() => send('Найди в интернете актуальные новости в сфере технологий за сегодня')}>
              <Globe size={13} />
              Поиск в сети
            </button>
          </div>

          {/* Text area */}
          <div className="flex gap-3 items-end">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                className="input-glass w-full resize-none pr-4 py-3 text-sm"
                style={{ minHeight:48, maxHeight:160 }}
                placeholder="Задайте вопрос или напишите команду... (Enter — отправить, Shift+Enter — новая строка)"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key==='Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                }}
                rows={1}
              />
            </div>
            <button
              onClick={() => send()}
              disabled={!input.trim() || loading}
              className="btn-neon px-4 py-3 flex-shrink-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <PaperPlaneTilt size={18} weight="fill" />
            </button>
          </div>
          <p className="text-xs mt-2 text-center" style={{ color:'#3a3a5c' }}>
            ИИ может ошибаться. Проверяйте важную информацию.
          </p>
        </div>
      </div>
    </div>
  );
}
