import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { aiApi } from '@/utils/apiClient';
import {
  PaperPlaneTilt, Microphone, MicrophoneSlash, Desktop,
  Robot, Trash, Sparkle, X,
} from '@phosphor-icons/react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  ts: Date;
}

const QUICK_PROMPTS = [
  'Составь план дня',
  'Анализ задач',
  'Советы по продуктивности',
  'Финансовый обзор',
  'Учебный план',
];

export default function AIPanel() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Привет! Я ваш персональный ИИ-ассистент. Могу помочь с планированием, анализом задач, финансами и учёбой. Что хотите обсудить?',
      ts: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addMsg = (role: 'user' | 'assistant', content: string) => {
    setMessages(prev => [...prev, { id: Date.now().toString(), role, content, ts: new Date() }]);
  };

  const sendMessage = async (text = input) => {
    if (!text.trim() || loading) return;
    setInput('');
    addMsg('user', text);
    setLoading(true);
    try {
      const history = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const { data } = await aiApi.post('/chat', {
        message: text,
        history,
        context: { section: 'general', timestamp: new Date().toISOString() },
      });
      addMsg('assistant', data.response || data.content || 'Нет ответа');
    } catch {
      addMsg('assistant', 'Ошибка соединения. Проверьте настройки API-ключа.');
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
          const { data } = await aiApi.post('/transcribe', fd);
          if (data.text) { setInput(data.text); toast.success('Голос распознан'); }
        } catch { toast.error('Ошибка распознавания голоса'); }
        stream.getTracks().forEach(t => t.stop());
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch { toast.error('Нет доступа к микрофону'); }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const captureScreen = async () => {
    setCapturing(true);
    try {
      const stream = await (navigator.mediaDevices as any).getDisplayMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')!.drawImage(video, 0, 0);
      stream.getTracks().forEach((t: MediaStreamTrack) => t.stop());
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      const { data } = await aiApi.post('/analyze-screen', { image: dataUrl });
      addMsg('assistant', `📸 Анализ экрана:\n\n${data.analysis || 'Не удалось проанализировать'}`);
    } catch (e: any) {
      if (e.name !== 'NotAllowedError') toast.error('Ошибка захвата экрана');
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg,#7c6af7,#a99ff8)' }}>
            <Robot size={14} weight="fill" className="text-white" />
          </div>
          <div>
            <p className="text-sm font-semibold">ИИ-ассистент</p>
            <div className="flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400" style={{ boxShadow: '0 0 4px #10b981' }} />
              <p className="text-xs" style={{ color: '#5a5a80' }}>Онлайн</p>
            </div>
          </div>
        </div>
        <button className="btn-glass btn-icon" onClick={() => setMessages([messages[0]])} title="Очистить">
          <Trash size={14} />
        </button>
      </div>

      {/* Quick prompts */}
      <div className="px-3 py-2 border-b flex gap-1.5 overflow-x-auto" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
        {QUICK_PROMPTS.map(q => (
          <button
            key={q}
            onClick={() => sendMessage(q)}
            className="text-xs px-2.5 py-1.5 rounded-lg whitespace-nowrap flex-shrink-0 transition-colors"
            style={{ background: 'rgba(124,106,247,0.1)', color: '#a99ff8', border: '1px solid rgba(124,106,247,0.2)' }}
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-4 flex flex-col gap-3">
        <AnimatePresence initial={false}>
          {messages.map(msg => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex flex-col gap-1 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div
                className="px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed max-w-[88%] whitespace-pre-wrap"
                style={msg.role === 'user' ? {
                  background: 'linear-gradient(135deg,rgba(124,106,247,0.3),rgba(124,106,247,0.15))',
                  border: '1px solid rgba(124,106,247,0.35)',
                  color: '#f0f0ff',
                  borderBottomRightRadius: 6,
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                  color: '#e0e0f5',
                  borderBottomLeftRadius: 6,
                }}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkle size={12} weight="fill" style={{ color: '#a99ff8' }} />
                    <span className="text-xs font-medium" style={{ color: '#7c6af7' }}>ИИ</span>
                  </div>
                )}
                {msg.content}
              </div>
              <span className="text-xs px-1" style={{ color: '#3a3a5c' }}>
                {msg.ts.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-start">
            <div className="px-4 py-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-1.5">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="p-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        {/* Action buttons */}
        <div className="flex gap-2 mb-2">
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-all flex-1 justify-center font-medium ${
              recording ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse' : 'btn-glass'
            }`}
          >
            {recording ? <MicrophoneSlash size={13} /> : <Microphone size={13} />}
            {recording ? 'Стоп' : 'Голос'}
          </button>
          <button
            onClick={captureScreen}
            disabled={capturing}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg btn-glass flex-1 justify-center font-medium"
          >
            <Desktop size={13} />
            {capturing ? 'Захват...' : 'Экран'}
          </button>
        </div>

        {/* Text input */}
        <div className="flex gap-2">
          <input
            className="input-glass flex-1 text-xs py-2.5"
            placeholder="Написать сообщение..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
          />
          <button
            className="btn-neon px-3 py-2"
            onClick={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            <PaperPlaneTilt size={15} weight="fill" />
          </button>
        </div>
      </div>
    </div>
  );
}
