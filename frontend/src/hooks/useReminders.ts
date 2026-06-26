import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { calendarApi, healthApi } from '@/utils/apiClient';
import { useAppStore } from '@/store/appStore';

// ── Browser notifications permission ──────────
export const requestNotifPermission = async () => {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;
  const perm = await Notification.requestPermission();
  return perm === 'granted';
};

const showBrowserNotif = (title: string, body: string, icon = '⚖️') => {
  if (Notification.permission === 'granted') {
    new Notification(title, { body, icon: '/favicon.ico' });
  }
};

// ── Reminder manager hook ──────────────────────
export function useReminders() {
  const token = useAppStore(s => s.token);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (!token) return;

    requestNotifPermission();

    const check = async () => {
      try {
        // Check upcoming events (next 30 min)
        const { data: events } = await calendarApi.get('/upcoming');
        const now = Date.now();
        events?.forEach((ev: any) => {
          const start = new Date(ev.startAt).getTime();
          const diff = start - now;
          if (diff > 0 && diff < 30 * 60 * 1000) {
            const mins = Math.round(diff / 60000);
            const msg = `Через ${mins} мин: ${ev.title}`;
            toast(msg, { icon: '⏰', duration: 8000 });
            showBrowserNotif('Напоминание', msg);
          }
        });

        // Check medication reminders
        const { data: meds } = await healthApi.get('/medications');
        const hour = new Date().getHours();
        meds?.forEach((med: any) => {
          if (!med.takenToday) {
            const isTime =
              (med.time === 'Утром' && hour >= 8 && hour <= 10) ||
              (med.time === 'Вечером' && hour >= 19 && hour <= 21) ||
              (med.time === 'Перед сном' && hour >= 22);
            if (isTime) {
              toast(`💊 Не забудь принять ${med.name} (${med.dose})`, { duration: 10000 });
            }
          }
        });
      } catch {
        // Silently fail - not critical
      }
    };

    // Check immediately then every 15 minutes
    check();
    intervalRef.current = setInterval(check, 15 * 60 * 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [token]);
}

// ── Productivity streak tracker ────────────────
export function useProductivityStreak() {
  useEffect(() => {
    const lastVisit = localStorage.getItem('lwb_last_visit');
    const today = new Date().toDateString();

    if (lastVisit !== today) {
      const streakStr = localStorage.getItem('lwb_streak') || '0';
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      let newStreak = lastVisit === yesterday.toDateString()
        ? parseInt(streakStr) + 1
        : 1;

      localStorage.setItem('lwb_streak', String(newStreak));
      localStorage.setItem('lwb_last_visit', today);

      if (newStreak > 1) {
        setTimeout(() => {
          toast(`🔥 Серия: ${newStreak} дней подряд! Отличная работа!`, { duration: 5000 });
        }, 2000);
      }
    }
  }, []);

  return parseInt(localStorage.getItem('lwb_streak') || '1');
}
