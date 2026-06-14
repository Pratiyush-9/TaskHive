import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Automatically add token to every request
API.interceptors.request.use((config) => {
  const user = JSON.parse(localStorage.getItem('taskhive_user'));
  if (user && user.token) {
    config.headers.Authorization = `Bearer ${user.token}`;
  }
  return config;
});

// Auth
export const register = (data) => API.post('/auth/register', data);
export const login = (data) => API.post('/auth/login', data);
export const getMe = () => API.get('/auth/me');

// Teams
export const createTeam = (data) => API.post('/teams', data);
export const getTeams = () => API.get('/teams');
export const getTeamById = (id) => API.get(`/teams/${id}`);
export const addMember = (id, data) => API.post(`/teams/${id}/members`, data);
export const updateMemberCapacity = (id, data) => API.put(`/teams/${id}/members/capacity`, data);
export const removeMember = (id, data) => API.put(`/teams/${id}/members/remove`, data);

// Projects
export const createProject = (data) => API.post('/projects', data);
export const getProjectsByTeam = (teamId) => API.get(`/projects/team/${teamId}`);
export const getProjectById = (id) => API.get(`/projects/${id}`);
export const updateProject = (id, data) => API.put(`/projects/${id}`, data);
export const deleteProject = (id) => API.delete(`/projects/${id}`);

// Tasks
export const createTask = (data) => API.post('/tasks', data);
export const getTasksByTeam = (teamId) => API.get(`/tasks/team/${teamId}`);
export const getTasksByProject = (projectId) => API.get(`/tasks/project/${projectId}`);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);
export const autoReassign = (teamId) => API.post(`/tasks/reassign/${teamId}`);

// Activity
export const getActivity = (teamId) => API.get(`/activity/${teamId}`);