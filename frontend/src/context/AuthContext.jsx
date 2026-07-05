import { createContext, useContext, useState } from 'react'
import api from '../api/axios'

const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user')))

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
        <AuthContext.Provider value={{ user, login, logout, updateUser }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuth = () => useContext(AuthContext)
