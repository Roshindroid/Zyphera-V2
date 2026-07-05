import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'
import { toast, toastAuto, confirm } from '../../utils/toast'

export default function EditProfile() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ full_name: '', email: '', phone: '', location: '' })
    const [pwForm, setPwForm] = useState({ current_password: '', new_password: '', confirm_password: '' })
    const [deletePassword, setDeletePassword] = useState('')
    const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false })

    useEffect(() => {
        api.get('/profile/').then(r => {
            const u = r.data
            setForm({ full_name: u.full_name || '', email: u.email || '', phone: u.phone || '', location: u.location || '' })
        }).catch(() => {})
    }, [])

    const handleProfileSubmit = async (e) => {
        e.preventDefault()
        try {
            await api.patch('/profile/', form)
            await toastAuto('success', 'Profile Updated', 'Your changes have been saved.')
            navigate('/buyer/profile')
        } catch {
            toast('error', 'Update Failed', 'Could not save your profile.')
        }
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        if (pwForm.new_password !== pwForm.confirm_password) {
            toast('error', 'Passwords do not match', 'New password and confirmation must be the same.')
            return
        }
        try {
            await api.post('/profile/change-password/', {
                current_password: pwForm.current_password,
                new_password: pwForm.new_password,
            })
            await toastAuto('success', 'Password Changed', 'Your password has been updated.')
            setPwForm({ current_password: '', new_password: '', confirm_password: '' })
        } catch (err) {
            toast('error', 'Failed', err.response?.data?.error || 'Could not change password.')
        }
    }

    const handleDeleteAccount = async () => {
        const result = await confirm(
            'Delete Account',
            'This will permanently delete your account and all your data. This cannot be undone.',
            'Yes, delete my account'
        )
        if (!result.isConfirmed) return
        try {
            await api.delete('/profile/delete/', { data: { password: deletePassword } })
            logout()
            navigate('/')
        } catch (err) {
            toast('error', 'Failed', err.response?.data?.error || 'Could not delete account.')
        }
    }

    const eyeBtn = (key) => (
        <button type="button" className="input-group-text bg-white border-start-0"
            style={{ borderRadius: '0 12px 12px 0', border: '1.5px solid #e2e8f0', borderLeft: 'none' }}
            onClick={() => setShowPw(p => ({ ...p, [key]: !p[key] }))}>
            <i className={`bi ${showPw[key] ? 'bi-eye-slash' : 'bi-eye'} text-muted`}></i>
        </button>
    )

    const pwInput = (key, placeholder) => (
        <div className="input-group">
            <span className="input-group-text bg-white border-end-0"
                style={{ borderRadius: '12px 0 0 12px', border: '1.5px solid #e2e8f0', borderRight: 'none' }}>
                <i className="bi bi-lock text-muted"></i>
            </span>
            <input type={showPw[key] ? 'text' : 'password'} className="form-control border-start-0"
                placeholder={placeholder} style={{ borderRadius: 0, borderLeft: 'none' }}
                value={pwForm[key]} onChange={e => setPwForm(p => ({ ...p, [key]: e.target.value }))} required />
            {eyeBtn(key)}
        </div>
    )

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 mb-4">
                <div className="container">
                    <Link className="navbar-brand brand-name" to="/" style={{ fontSize: '1.5rem', color: '#007bff' }}>Zyphera</Link>
                    <div className="d-flex align-items-center">
                        <Link to="/buyer/profile" className="btn btn-link text-decoration-none text-muted me-3">Cancel</Link>
                        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                            <i className="bi bi-arrow-left me-1"></i>Back
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container pb-5">
                <div className="row justify-content-center g-4">
                    <div className="col-lg-8">

                        {/* -- Profile Info -- */}
                        <div className="contact-form-card border-0 shadow-sm mb-4">
                            <h5 className="fw-semibold mb-1">Edit Profile</h5>
                            <p className="text-muted small mb-4">Update your personal information.</p>
                            <form onSubmit={handleProfileSubmit} className="row g-4">
                                <div className="col-md-6">
                                    <label className="form-label">Full Name</label>
                                    <input type="text" className="form-control" value={form.full_name}
                                        onChange={e => setForm({ ...form, full_name: e.target.value })} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Username</label>
                                    <input type="text" className="form-control" value={user?.username || ''} disabled />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Email Address</label>
                                    <input type="email" className="form-control" value={form.email}
                                        onChange={e => setForm({ ...form, email: e.target.value })} required />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Phone Number</label>
                                    <input type="tel" className="form-control" placeholder="+91 00000 00000"
                                        value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Location</label>
                                    <input type="text" className="form-control" placeholder="e.g. Kozhikode, Kerala"
                                        value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                                </div>
                                <div className="col-12">
                                    <button type="submit" className="btn btn-primary w-100 py-3">Update Profile</button>
                                </div>
                            </form>
                        </div>

                        {/* -- Reset Password -- */}
                        <div className="contact-form-card border-0 shadow-sm mb-4">
                            <h5 className="fw-semibold mb-1">Reset Password</h5>
                            <p className="text-muted small mb-4">Change your account password.</p>
                            <form onSubmit={handlePasswordSubmit} className="row g-3">
                                <div className="col-12">
                                    <label className="form-label">Current Password</label>
                                    {pwInput('current', '••••••••')}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">New Password</label>
                                    {pwInput('new', '••••••••')}
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Confirm New Password</label>
                                    {pwInput('confirm', '••••••••')}
                                </div>
                                <div className="col-12">
                                    <button type="submit" className="btn btn-primary px-4">Change Password</button>
                                </div>
                            </form>
                        </div>

                        {/* -- Danger Zone -- */}
                        <div className="contact-form-card border-0 shadow-sm">
                            <h5 className="fw-semibold mb-1" style={{ color: '#ef4444' }}>Danger Zone</h5>
                            <p className="text-muted small mb-4">Permanently delete your account and all associated data.</p>
                            <div className="d-flex align-items-center gap-3">
                                <input type="password" className="form-control" placeholder="Enter password to confirm"
                                    value={deletePassword} onChange={e => setDeletePassword(e.target.value)}
                                    style={{ maxWidth: '280px' }} />
                                <button className="btn btn-danger px-4" onClick={handleDeleteAccount} disabled={!deletePassword}>
                                    Delete Account
                                </button>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}
