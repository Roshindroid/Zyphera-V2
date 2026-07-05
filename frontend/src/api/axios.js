import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

const api = axios.create({
    baseURL: API_URL,
})

api.interceptors.request.use((config) => {
    const token = localStorage.getItem('access')

    if (token) {
        config.headers = { ...config.headers, Authorization: `Bearer ${token}` }
    }

    return config
})



api.interceptors.response.use(
    (res) => res,
    async (error) => {
        const original = error.config

        if (error.response?.status === 401 && original && !original._retry) {
            original._retry = true

            const refresh = localStorage.getItem('refresh')
            if (refresh) {
                try {
                    const { data } = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh })
                    localStorage.setItem('access', data.access)

                    // Ensure header exists for the retried request
                    original.headers = original.headers || {}
                    original.headers.Authorization = `Bearer ${data.access}`

                    return api(original)
                } catch {
                    // refresh failed — clear and redirect
                }
            }

            localStorage.removeItem('access')
            localStorage.removeItem('refresh')
        }

        return Promise.reject(error)
    }
)


export default api
