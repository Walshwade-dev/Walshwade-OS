import axios from 'axios';

const API_BASE_URL = 'http://localhost:8000/api/v1';

export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface Goal {
    id: string;
    title: string;
    description?: string;
    domain: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface Project {
    id: string;
    goal_id: string;
    title: string;
    description?: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface Task {
    id: string;
    project_id: string;
    title: string;
    description?: string;
    priority: string;
    estimated_duration_minutes?: number;
    deadline?: string;
    status: string;
    created_at: string;
    updated_at: string;
}

export interface WeeklyPlan {
    id: string;
    week_start_date: string;
    notes?: string;
    created_at: string;
    tasks?: Task[];
}

export const fetchGoals = async (): Promise<Goal[]> => {
    const response = await api.get('/goals/');
    return response.data;
};

export const createGoal = async (data: Partial<Goal>): Promise<Goal> => {
    const response = await api.post('/goals/', data);
    return response.data;
};

export const fetchProjects = async (goalId?: string): Promise<Project[]> => {
    const response = await api.get('/projects/', { params: { goal_id: goalId } });
    return response.data;
};

export const createProject = async (data: Partial<Project>): Promise<Project> => {
    const response = await api.post('/projects/', data);
    return response.data;
};

export const fetchTasks = async (projectId?: string): Promise<Task[]> => {
    const response = await api.get('/tasks/', { params: { project_id: projectId } });
    return response.data;
};

export const createTask = async (data: Partial<Task>): Promise<Task> => {
    const response = await api.post('/tasks/', data);
    return response.data;
};

export const fetchWeeklyPlans = async (): Promise<WeeklyPlan[]> => {
    const response = await api.get('/weekly-plans/');
    return response.data;
};

export const createWeeklyPlan = async (data: Partial<WeeklyPlan>): Promise<WeeklyPlan> => {
    const response = await api.post('/weekly-plans/', data);
    return response.data;
};

export const attachTaskToWeeklyPlan = async (weeklyPlanId: string, taskId: string): Promise<void> => {
    await api.post(`/weekly-plans/${weeklyPlanId}/tasks`, { task_id: taskId });
};

export interface TimeBlock {
    id: string;
    task_id: string;
    date: string;
    start_time: string;
    end_time: string;
    planned_duration_minutes: number;
    created_at: string;
    task?: Task;
    work_sessions?: WorkSession[];
}

export type FailureCategory = 'distraction' | 'underestimated' | 'blocked' | 'fatigue' | 'priority_shift' | 'other';

export interface WorkSession {
    id: string;
    task_id: string;
    time_block_id: string;
    status: 'scheduled' | 'ready' | 'started' | 'paused' | 'completed' | 'failed' | 'rescheduled' | 'abandoned';
    planned_duration_minutes: number;
    actual_duration_minutes?: number;
    started_at?: string;
    paused_total_seconds: number;
    last_paused_at?: string;
    completed_at?: string;
    notes?: string;
    created_at: string;
    task?: Task;
}

export type FailureType = 'poor_estimation' | 'lack_of_knowledge' | 'task_too_difficult' | 'task_unclear' | 'distraction' | 'fatigue' | 'unexpected_responsibility' | 'procrastination' | 'technical_problem' | 'emotional_resistance' | 'scheduling_problem' | 'missing_dependency' | 'other';

export interface Failure {
    id: string;
    task_id: string;
    session_id?: string;
    failure_type: FailureType;
    description: string;
    root_cause?: string;
    impact?: string;
    created_at: string;
}

export interface CorrectiveAction {
    id: string;
    failure_id: string;
    description: string;
    new_plan?: string;
    created_at: string;
}

export const createFailure = async (data: Partial<Failure>): Promise<Failure> => {
    const response = await api.post('/failures/', data);
    return response.data;
};

export const addCorrectiveAction = async (failureId: string, data: Partial<CorrectiveAction>): Promise<CorrectiveAction> => {
    const response = await api.post(`/failures/${failureId}/corrective-action`, data);
    return response.data;
};

export interface ScheduleGenerationResult {
    message: string;
    overcommitted: boolean;
    unscheduled_task_ids: string[];
    time_blocks_count: number;
}

export const generateSchedule = async (date: string): Promise<ScheduleGenerationResult> => {
    const response = await api.post('/schedule/generate', { target_date: date });
    return response.data;
};

export const fetchSchedule = async (date: string): Promise<TimeBlock[]> => {
    const response = await api.get('/schedule/', { params: { target_date: date } });
    return response.data;
};

export const fetchTodaySchedule = async (): Promise<TimeBlock[]> => {
    const response = await api.get('/schedule/today');
    return response.data;
};

export const fetchActiveSession = async (): Promise<WorkSession | null> => {
    const response = await api.get('/sessions/active');
    return response.data;
};

export const createSession = async (timeBlockId: string): Promise<WorkSession> => {
    const response = await api.post('/sessions/', { time_block_id: timeBlockId });
    return response.data;
};

export const startSession = async (sessionId: string): Promise<WorkSession> => {
    const response = await api.post(`/sessions/${sessionId}/start`);
    return response.data;
};

export const pauseSession = async (sessionId: string): Promise<WorkSession> => {
    const response = await api.post(`/sessions/${sessionId}/pause`);
    return response.data;
};

export const resumeSession = async (sessionId: string): Promise<WorkSession> => {
    const response = await api.post(`/sessions/${sessionId}/resume`);
    return response.data;
};

export const completeSession = async (sessionId: string, notes?: string): Promise<WorkSession> => {
    const response = await api.post(`/sessions/${sessionId}/complete`, { notes });
    return response.data;
};

export interface DailyReview {
    id?: string;
    review_date: string;
    summary: string;
    created_at?: string;
}

export interface WeeklyReview {
    id?: string;
    weekly_plan_id: string;
    summary: string;
    created_at?: string;
}

export const submitDailyReview = async (review: DailyReview): Promise<DailyReview> => {
    const response = await api.post('/reviews/daily', review);
    return response.data;
};

export const fetchDailyReviews = async (): Promise<DailyReview[]> => {
    const response = await api.get('/reviews/daily');
    return response.data;
};

export const submitWeeklyReview = async (review: WeeklyReview): Promise<WeeklyReview> => {
    const response = await api.post('/reviews/weekly', review);
    return response.data;
};

export const fetchDashboardKPIs = async (startDate: string, endDate: string, weeklyPlanId?: string): Promise<any> => {
    const params: any = { start_date: startDate, end_date: endDate };
    if (weeklyPlanId) params.weekly_plan_id = weeklyPlanId;
    const response = await api.get('/kpis/dashboard', { params });
    return response.data;
};

