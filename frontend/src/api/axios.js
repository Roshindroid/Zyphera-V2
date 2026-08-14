import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_URL,
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access')
    if (token) config.headers.Authorization = `Bearer ${token}`
    return config
})

let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error)
        } else {
            prom.resolve(token)
        }
    })
    failedQueue = []
}

api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const originalRequest = error.config

        if (!error.response || error.response.status !== 401 || !originalRequest || originalRequest._retry) {
            return Promise.reject(error)
        }

        // Do not attempt token refresh for auth endpoints (e.g. login, refresh)
        if (originalRequest.url?.includes('/auth/token/refresh/') || originalRequest.url?.includes('/auth/login/') || originalRequest.url?.includes('/token/refresh/') || originalRequest.url?.includes('/login/')) {
            return Promise.reject(error)
        }

        originalRequest._retry = true

        if (isRefreshing) {
            return new Promise((resolve, reject) => {
                failedQueue.push({ resolve, reject })
            }).then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`
                return api(originalRequest)
            }).catch((err) => {
                return Promise.reject(err)
            })
        }

        isRefreshing = true

        const refreshToken = localStorage.getItem('refresh')

        if (!refreshToken) {
            isRefreshing = false
            return Promise.reject(error)
        }

        try {
            const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh: refreshToken })
            const newAccessToken = data.access

            localStorage.setItem('access', newAccessToken)
            api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`

            processQueue(null, newAccessToken)
            isRefreshing = false

            return api(originalRequest)
        } catch (refreshError) {
            processQueue(refreshError, null)
            isRefreshing = false

            // Refresh token has definitively failed / is invalid -> Hard logout
            const status = refreshError.response?.status
            if (status === 401 || status === 400) {
                localStorage.removeItem('access')
                localStorage.removeItem('refresh')
                localStorage.removeItem('user')
                window.dispatchEvent(new Event('auth:logout'))
            }
            return Promise.reject(refreshError)
        }
    }
)


export default api
