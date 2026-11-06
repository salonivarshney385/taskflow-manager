import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://taskflow-backend-rwkj.onrender.com/api',
  headers: { 'Content-Type': 'application/json' },
})

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('taskflow_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('taskflow_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// ── Auth ────────────────────────────────────────────────────────────────────
export const login = (data) =>
  api.post('/auth/login', data, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
export const register = (data) => api.post('/auth/register', data)
export const getMe = () => api.get('/auth/me')

// ── Projects ─────────────────────────────────────────────────────────────────
export const getProjects = (params) => api.get('/projects/', { params })
export const getProject = (id) => api.get(`/projects/${id}`)
export const createProject = (data) => api.post('/projects/', data)
export const updateProject = (id, data) => api.put(`/projects/${id}`, data)
export const deleteProject = (id) => api.delete(`/projects/${id}`)
export const getProjectMembers = (id) => api.get(`/projects/${id}/members`)
export const addProjectMember = (id, userId) =>
  api.post(`/projects/${id}/members`, { user_id: userId })

// ── Tasks ────────────────────────────────────────────────────────────────────
export const getTasks = (params) => api.get('/tasks/', { params })
export const createTask = (data) => api.post('/tasks/', data)
export const updateTask = (id, data) => api.put(`/tasks/${id}`, data)
export const deleteTask = (id) => api.delete(`/tasks/${id}`)

// ── Users ─────────────────────────────────────────────────────────────────────
export const getUsers = () => api.get('/users/')

// ── Analytics ────────────────────────────────────────────────────────────────
export const getDashboardStats = () => api.get('/analytics/dashboard')
export const getChartData = () => api.get('/analytics/charts')

export default api
