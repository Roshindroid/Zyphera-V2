import { createContext, useContext, useState, useEffect, useRef } from 'react'
import axios from 'axios'
import api from '../api/axios'

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        try {
            const saved = localStorage.getItem('user')
            return saved ? JSON.parse(saved) : null
        } catch {
            return null
        }
    })
    const [loading, setLoading] = useState(true)
    const initializedRef = useRef(false)

    // sync state when the axios interceptor forces a hard logout
    useEffect(() => {
        const handler = () => setUser(null)
        window.addEventListener('auth:logout', handler)
        return () => window.removeEventListener('auth:logout', handler)
    }, [])

    // Startup initialization & silent token refresh
    useEffect(() => {
        if (initializedRef.current) return
        initializedRef.current = true

        const initAuth = async () => {
            const refreshToken = localStorage.getItem('refresh')
            if (refreshToken) {
                try {
                    const res = await axios.post(`${API_URL}/auth/token/refresh/`, { refresh: refreshToken })
                    if (res.data?.access) {
                        localStorage.setItem('access', res.data.access)
                        try {
                            const profileRes = await api.get('/profile/')
                            localStorage.setItem('user', JSON.stringify(profileRes.data))
                            setUser(profileRes.data)
                        } catch (profileErr) {
                            console.warn('Profile fetch failed during auth init:', profileErr)
                        }
                    }
                } catch (refreshErr) {
                    const status = refreshErr.response?.status
                    // Only clear auth if refresh token is genuinely invalid/expired (401 or 400)
                    if (status === 401 || status === 400) {
                        localStorage.removeItem('access')
                        localStorage.removeItem('refresh')
                        localStorage.removeItem('user')
                        setUser(null)
                    } else {
                        console.warn('Token refresh network/server error:', refreshErr)
                    }
                }
            } else {
                setUser(null)
            }
            setLoading(false)
        }

        initAuth()
    }, [])

    const login = async (username, password) => {
        const res = await api.post('/auth/login/', { username, password })
        localStorage.setItem('access', res.data.access)
        localStorage.setItem('refresh', res.data.refresh)
        localStorage.setItem('user', JSON.stringify(res.data.user))
        setUser(res.data.user)
        return res.data.user
    }

    const logout = async () => {
        try { await api.post('/auth/logout/', { refresh: localStorage.getItem('refresh') }) } catch {}
        localStorage.clear()
        setUser(null)
    }

    const updateUser = (updatedUser) => {
        localStorage.setItem('user', JSON.stringify(updatedUser))
        setUser(updatedUser)
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
