import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from '../utils/toast'
import { validateLoginIdentifier, validatePassword } from '../utils/validators'

export default function Login() {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ username: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!validateLoginIdentifier(form.username)) {
            toast('error', 'Invalid login', 'Please enter a valid email or a username with at least 3 characters.')
            return
        }

        if (!validatePassword(form.password)) {
            toast(
                'error',
                'Invalid password',
                'Password must be at least 8 characters, include 1 uppercase letter, and 1 special character (!@#$%^&*(),.?":{}|<>).'
            )
            return
        }

        try {
            const u = await login(form.username, form.password)
            await toast('success', 'Login Successful', 'Welcome back!')
            if (u.role === 'seller') navigate('/seller/dashboard')
            else if (u.role === 'buyer') navigate('/')
            else navigate('/')
        } catch (err) {
            toast('error', 'Login Failed', err.response?.data?.error || 'Invalid username or password')
        }
    }

    return (
        <div className="split-container">
            <div className="split-side login"></div>
            <div className="split-side form-side">
                <div className="login-form-wrapper">
                    <Link to="/" style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.75rem', background: 'linear-gradient(135deg,#007bff,#00c6ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem' }}>Zyphera</Link>
                    <h2>Welcome Back</h2>
                    <p className="mb-4">Please enter your account details to continue.</p>

                    <form onSubmit={handleSubmit}>
                        <div className="mb-3">
                            <label className="form-label">Email Address or Username</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '12px 0 0 12px', border: '1.5px solid #e2e8f0', borderRight: 'none' }}>
                                    <i className="bi bi-person text-muted"></i>
                                </span>
                                <input
                                    type="text"
                                    className="form-control border-start-0"
                                    placeholder="Email or Username"
                                    style={{ borderRadius: '0 12px 12px 0', borderLeft: 'none' }}
                                    value={form.username}
                                    onChange={e => setForm({ ...form, username: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="mb-3">
                            <label className="form-label">Password</label>
                            <div className="input-group">
                                <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '12px 0 0 12px', border: '1.5px solid #e2e8f0', borderRight: 'none' }}>
                                    <i className="bi bi-lock text-muted"></i>
                                </span>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-control border-start-0"
                                    placeholder="••••••••"
                                    style={{ borderRadius: 0, borderLeft: 'none' }}
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                    required
                                />
                                <button className="input-group-text bg-white border-start-0" type="button"
                                    style={{ borderRadius: '0 12px 12px 0', border: '1.5px solid #e2e8f0', borderLeft: 'none', cursor: 'pointer' }}
                                    onClick={() => setShowPassword(!showPassword)}>
                                    <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                                </button>
                            </div>
                        </div>

                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div className="form-check">
                                <input className="form-check-input" type="checkbox" id="rememberMe" />
                                <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                            </div>
                            <a href="#" className="text-decoration-none" style={{ fontSize: '0.88rem' }}>Forgot password?</a>
                        </div>

                        <button type="submit" className="btn btn-primary w-100 mb-3">Sign In</button>

                        <p className="text-center mb-0" style={{ fontSize: '0.9rem', color: '#64748b' }}>
                            Don't have an account? <Link to="/register" className="text-decoration-none fw-semibold">Register</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}
