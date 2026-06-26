import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  taskApi, financeApi, learningApi,
  healthApi, eventsApi, calendarApi, aiApi,
} from '@/utils/apiClient';

// ── Tasks ─────────────────────────────────────
export const useTasks = (params?: Record<string, string>) =>
  useQuery({
    queryKey: ['tasks', params],
    queryFn: () => taskApi.get('/', { params }).then(r => r.data),
  });

export const useTaskStats = () =>
  useQuery({
    queryKey: ['task-stats'],
    queryFn: () => taskApi.get('/stats').then(r => r.data),
  });

export const useCreateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => taskApi.post('/', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
};

export const useUpdateTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => taskApi.patch(`/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
};

export const useDeleteTask = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskApi.delete(`/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks'] }),
  });
};

// ── Finance ───────────────────────────────────
export const useFinanceSummary = () =>
  useQuery({
    queryKey: ['finance-summary'],
    queryFn: () => financeApi.get('/summary').then(r => r.data),
  });

export const useTransactions = (params?: Record<string, string>) =>
  useQuery({
    queryKey: ['transactions', params],
    queryFn: () => financeApi.get('/transactions', { params }).then(r => r.data),
  });

export const useMonthlyFinance = () =>
  useQuery({
    queryKey: ['monthly-finance'],
    queryFn: () => financeApi.get('/monthly').then(r => r.data),
  });

export const useCreateTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => financeApi.post('/transactions', data).then(r => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] });
      qc.invalidateQueries({ queryKey: ['finance-summary'] });
    },
  });
};

// ── Learning ──────────────────────────────────
export const useTopics = () =>
  useQuery({
    queryKey: ['topics'],
    queryFn: () => learningApi.get('/topics').then(r => r.data),
  });

export const useCreateTopic = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => learningApi.post('/topics', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['topics'] }),
  });
};

export const useCreateStep = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ topicId, ...data }: any) =>
      learningApi.post(`/topics/${topicId}/steps`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['topics'] }),
  });
};

export const useUpdateStep = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ topicId, stepId, ...data }: any) =>
      learningApi.patch(`/topics/${topicId}/steps/${stepId}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['topics'] }),
  });
};

export const useAddSession = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ topicId, stepId, ...data }: any) =>
      learningApi.post(`/topics/${topicId}/steps/${stepId}/sessions`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['topics'] }),
  });
};

// ── Health ────────────────────────────────────
export const useHabits = () =>
  useQuery({
    queryKey: ['habits'],
    queryFn: () => healthApi.get('/habits').then(r => r.data),
  });

export const useCreateHabit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => healthApi.post('/habits', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  });
};

export const useLogHabit = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => healthApi.post(`/habits/${id}/log`, {}).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['habits'] }),
  });
};

export const useMedications = () =>
  useQuery({
    queryKey: ['medications'],
    queryFn: () => healthApi.get('/medications').then(r => r.data),
  });

export const useWaterToday = () =>
  useQuery({
    queryKey: ['water-today'],
    queryFn: () => healthApi.get('/water/today').then(r => r.data),
    refetchInterval: 60_000,
  });

export const useAddWater = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (ml: number) => healthApi.post('/water', { ml }).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['water-today'] }),
  });
};

// ── Events / Sports / Travel / Media ──────────
export const useWorkouts = () =>
  useQuery({
    queryKey: ['workouts'],
    queryFn: () => eventsApi.get('/workouts').then(r => r.data),
  });

export const useCreateWorkout = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => eventsApi.post('/workouts', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['workouts'] }),
  });
};

export const useTrips = () =>
  useQuery({
    queryKey: ['trips'],
    queryFn: () => eventsApi.get('/trips').then(r => r.data),
  });

export const useCreateTrip = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => eventsApi.post('/trips', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['trips'] }),
  });
};

export const useMedia = (params?: Record<string, string>) =>
  useQuery({
    queryKey: ['media', params],
    queryFn: () => eventsApi.get('/media', { params }).then(r => r.data),
  });

export const useCreateMedia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => eventsApi.post('/media', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  });
};

export const useUpdateMedia = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }: any) => eventsApi.patch(`/media/${id}`, data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['media'] }),
  });
};

// ── Calendar ──────────────────────────────────
export const useUpcomingEvents = () =>
  useQuery({
    queryKey: ['upcoming-events'],
    queryFn: () => calendarApi.get('/upcoming').then(r => r.data),
    refetchInterval: 5 * 60_000,
  });

export const useCreateEvent = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => calendarApi.post('/events', data).then(r => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['upcoming-events'] }),
  });
};
