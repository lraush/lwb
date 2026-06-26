import axios from 'axios';
import { useAppStore } from '@/store/appStore';

const BASE = import.meta.env.VITE_API_BASE || '/api';

const createClient = (service: string) => {
  const client = axios.create({ baseURL: `${BASE}/${service}` });

  client.interceptors.request.use((config) => {
    const token = useAppStore.getState().token;
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (r) => r,
    (err) => {
      if (err.response?.status === 401) useAppStore.getState().logout();
      return Promise.reject(err);
    }
  );
  return client;
};

export const authApi     = createClient('auth');
export const taskApi     = createClient('tasks');
export const calendarApi = createClient('calendar');
export const financeApi  = createClient('finance');
export const learningApi = createClient('learning');
export const healthApi   = createClient('health');
export const eventsApi   = createClient('events');
export const fileApi     = createClient('files');
export const aiApi       = createClient('ai');
