import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import '../Login.css'
import { toast } from '../utils/toast'
import { validateEmail, validatePassword } from '../utils/validators'

export default function Register() {
    const navigate = useNavigate()
    const [form, setForm] = useState({
        username: '', full_name: '', email: '', password: '', confirm_password: '',
        role: '', location: '', phone: '', experience: '', bio: '',
    })
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const isSeller = form.role === 'seller'

    const [touched, setTouched] = useState({
        email: false,
        password: false,
        confirm_password: false,
        username: false,
        full_name: false,
        role: false,
        // seller fields
        phone: false,
        location: false,
        experience: false,
        bio: false,
    })

    const isEmailValid = validateEmail(form.email)
    const isPasswordValid = validatePassword(form.password)
    const isConfirmValid = form.confirm_password.length > 0 && form.confirm_password === form.password

    const isRequiredUsernameValid = form.username.trim().length > 0
    const isRequiredFullNameValid = form.full_name.trim().length > 0
    const isRoleValid = form.role === 'buyer' || form.role === 'seller'

    const isSellerFieldsValid = (!isSeller) || (
        form.phone?.trim().length > 0 &&
        form.location?.trim().length > 0 &&
        (form.experience !== '' && !Number.isNaN(parseInt(form.experience)) && parseInt(form.experience) >= 0) &&
        form.bio?.trim().length > 0
    )

    const getInputClass = (field, valid) => {
        if (!touched[field]) return ''
        return valid ? 'is-valid' : 'is-invalid'
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Final guard (same regex rules as v1)
        if (!isEmailValid) {
            toast('error', 'Invalid email', 'Please enter a valid email address.')
            return
        }

        if (!isPasswordValid) {
            toast(
                'error',
                'Weak password',
                'Password must be at least 8 characters, include 1 uppercase letter, and 1 special character (!@#$%^&*(),.?":{}|<>).'
            )
            return
        }

        if (!isConfirmValid) {
            toast('error', 'Passwords do not match', 'Please make sure both passwords are the same.')
            return
        }

        if (!isRequiredUsernameValid || !isRequiredFullNameValid || !isRoleValid || !isSellerFieldsValid) {
            toast('error', 'Missing details', 'Please complete all required fields correctly.')
            return
        }

        try {
            const payload = {
                username: form.username,
                full_name: form.full_name,
                email: form.email,
                password: form.password,
                role: form.role,
            }
            if (isSeller) {
                payload.location = form.location
                payload.phone = form.phone
                payload.experience = parseInt(form.experience) || 0
                payload.bio = form.bio
            }
            await api.post('/auth/register/', payload)
            if (isSeller) {
                await toast('success', 'Registration Successful', 'Please wait 2–3 days for admin approval via email.')
            } else {
                await toast('success', 'Registration Successful', 'Your account has been created. Please sign in.')
                navigate('/login')
            }
        } catch (err) {
            toast('error', 'Registration Failed', Object.values(err.response?.data || {})[0]?.[0] || 'Registration failed')
        }
    }

    const update = (field) => (e) => {
        const next = e.target.value
        setForm({ ...form, [field]: next })
    }


    const inputGroup = (icon, type, placeholder, field, extra = {}) => {
        const fieldValidMap = {
            email: isEmailValid,
            password: isPasswordValid,
            confirm_password: isConfirmValid,
            username: isRequiredUsernameValid,
            full_name: isRequiredFullNameValid,
        }
        const fieldValid = fieldValidMap[field]

        return (
            <div className="input-group">
                <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '12px 0 0 12px', border: '1.5px solid #e2e8f0', borderRight: 'none' }}>
                    <i className={`bi ${icon} text-muted`}></i>
                </span>
                <input
                    type={type}
                    className={`form-control border-start-0 ${getInputClass(field, fieldValid ?? true)}`}
                    placeholder={placeholder}
                    style={{ borderRadius: '0 12px 12px 0', borderLeft: 'none' }}
                    value={form[field]}
                    onChange={(e) => {
                        setTouched({ ...touched, [field]: true })
                        update(field)(e)
                    }}
                    onBlur={() => setTouched({ ...touched, [field]: true })}
                    {...extra}
                />
            </div>
        )
    }


    return (
        <div className="split-container">
            <div className="split-side register"></div>
            <div className="split-side form-side" data-lenis-prevent>
                <div className="login-form-wrapper py-4">
                    <Link to="/" style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.75rem', background: 'linear-gradient(135deg,#007bff,#00c6ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', textDecoration: 'none', display: 'inline-block', marginBottom: '1.5rem' }}>Zyphera</Link>
                    <h2>Create Account</h2>
                    <p className="mb-4">Join the community and get access to trusted local services.</p>

                    <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Username</label>
                                {inputGroup('bi-at', 'text', 'yourhandle', 'username', { required: true })}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Full Name</label>
                                {inputGroup('bi-person', 'text', 'John Doe', 'full_name', { required: true })}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Email Address</label>
                                {inputGroup('bi-envelope', 'email', 'email@example.com', 'email', { required: true })}
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Password</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '12px 0 0 12px', border: '1.5px solid #e2e8f0', borderRight: 'none' }}>
                                        <i className="bi bi-lock text-muted"></i>
                                    </span>
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        className={`form-control border-start-0 ${getInputClass('password', isPasswordValid)}`}
                                        placeholder="••••••••"
                                        style={{ borderRadius: 0, borderLeft: 'none' }}
                                        value={form.password}
                                        onChange={(e) => {
                                            setTouched({ ...touched, password: true })
                                            update('password')(e)
                                        }}
                                        onBlur={() => setTouched({ ...touched, password: true })}
                                        required
                                    />

                                    <button className="input-group-text bg-white border-start-0" type="button"
                                        style={{ borderRadius: '0 12px 12px 0', border: '1.5px solid #e2e8f0', borderLeft: 'none', cursor: 'pointer' }}
                                        onClick={() => setShowPassword(!showPassword)}>
                                        <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                                    </button>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Confirm Password</label>
                                <div className="input-group">
                                    <span className="input-group-text bg-white border-end-0" style={{ borderRadius: '12px 0 0 12px', border: '1.5px solid #e2e8f0', borderRight: 'none' }}>
                                        <i className="bi bi-lock-fill text-muted"></i>
                                    </span>
                                    <input
                                        type={showConfirm ? 'text' : 'password'}
                                        className={`form-control border-start-0 ${getInputClass('confirm_password', isConfirmValid)}`}
                                        placeholder="••••••••"
                                        style={{ borderRadius: 0, borderLeft: 'none' }}
                                        value={form.confirm_password}
                                        onChange={(e) => {
                                            setTouched({ ...touched, confirm_password: true })
                                            update('confirm_password')(e)
                                        }}
                                        onBlur={() => setTouched({ ...touched, confirm_password: true })}
                                        required
                                    />

                                    <button className="input-group-text bg-white border-start-0" type="button"
                                        style={{ borderRadius: '0 12px 12px 0', border: '1.5px solid #e2e8f0', borderLeft: 'none', cursor: 'pointer' }}
                                        onClick={() => setShowConfirm(!showConfirm)}>
                                        <i className={`bi ${showConfirm ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
                                    </button>
                                </div>
                            </div>

                            <div className="mb-4">
                                <label className="form-label">I am a</label>
                                <select
                                    className={`form-select ${getInputClass('role', isRoleValid)}`}
                                    value={form.role}
                                    onChange={(e) => {
                                        setTouched({ ...touched, role: true })
                                        update('role')(e)
                                    }}
                                    required
                                >
                                    <option value="" disabled>Select your role</option>
                                    <option value="buyer">Buyer – I need services</option>
                                    <option value="seller">Seller – I provide services</option>
                                </select>
                            </div>

                            {isSeller && (
                                <>
                                    <hr className="my-3 opacity-25" />
                                    <p className="small fw-bold text-muted mb-3">Professional Details</p>

                                    <div className="mb-3">
                                        <label className="form-label">Phone Number</label>
                                        {inputGroup('bi-telephone', 'tel', '+91 00000 00000', 'phone')}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Location</label>
                                        {inputGroup('bi-geo-alt', 'text', 'e.g. Kozhikode, Kerala', 'location')}
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label">Years of Experience</label>
                                        {inputGroup('bi-briefcase', 'number', '0', 'experience', { min: '0' })}
                                    </div>

                                    <div className="mb-4">
                                        <label className="form-label">Short Bio / Description</label>
                                    <textarea
                                        className={`form-control ${getInputClass('bio', (form.bio?.trim().length > 0))}`}
                                        rows="3"
                                        placeholder="Describe your skills and services..."
                                        value={form.bio}
                                        onChange={(e) => {
                                            setTouched({ ...touched, bio: true })
                                            update('bio')(e)
                                        }}
                                        onBlur={() => setTouched({ ...touched, bio: true })}
                                    ></textarea>
                                    </div>
                                </>
                            )}

                            <button type="submit" className="btn btn-primary w-100 mb-3">Create Account</button>

                            <p className="text-center mb-0" style={{ fontSize: '0.9rem', color: '#64748b' }}>
                                Already have an account? <Link to="/login" className="text-decoration-none fw-semibold">Sign In</Link>
                            </p>
                        </form>
                </div>
            </div>
        </div>
    )
}
