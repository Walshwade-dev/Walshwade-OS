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
