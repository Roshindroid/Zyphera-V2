import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function SellerProfile() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [form, setForm] = useState({ full_name: '', email: '', phone: '', location: '', experience: 0, bio: '' })
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        api.get('/profile/').then(r => {
            const u = r.data
            setForm({ full_name: u.full_name || '', email: u.email || '', phone: u.phone || '', location: u.location || '', experience: u.experience || 0, bio: u.bio || '' })
        }).catch(() => {})
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        await api.patch('/profile/', form)
        setSaved(true)
        setTimeout(() => setSaved(false), 2500)
    }

    return (
        <div className="bg-light min-vh-100">
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 mb-5">
                <div className="container">
                    <Link className="navbar-brand brand-name" to="/" style={{ fontSize: '1.5rem' }}>Zyphera</Link>
                    <div className="d-flex align-items-center gap-3">
                        <Link to="/seller/dashboard" className="text-decoration-none text-muted small fw-bold">Dashboard</Link>
                        <Link to="/seller/requests" className="text-decoration-none text-muted small fw-bold">Requests</Link>
                        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                            <i className="bi bi-arrow-left me-1"></i>Back
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container pb-5">
                <div className="row justify-content-center">
                    <div className="col-lg-9">
                        <div className="contact-form-card border-0 shadow-sm">
                            <div className="d-flex align-items-center mb-4">
                                <div className="bg-primary bg-opacity-10 p-3 rounded-circle me-3">
                                    <i className="bi bi-person-gear text-primary fs-3"></i>
                                </div>
                                <div>
                                    <h3 className="mb-0">Edit Seller Profile</h3>
                                    <p className="text-muted small mb-0">Update your professional and account information.</p>
                                </div>
                            </div>

                            {saved && <div className="alert alert-success">Profile updated successfully!</div>}

                            <form onSubmit={handleSubmit} className="row g-4">
                                <div className="col-12 mt-4">
                                    <h5 className="fw-bold mb-0">Personal Information</h5>
                                    <hr className="mt-2 mb-0 opacity-50" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Full Name</label>
                                    <input type="text" className="form-control" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Username</label>
                                    <input type="text" className="form-control" value={user?.username || ''} disabled />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Email Address</label>
                                    <input type="email" className="form-control" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Phone Number</label>
                                    <input type="tel" className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                                </div>
                                <div className="col-12 mt-5">
                                    <h5 className="fw-bold mb-0">Professional Details</h5>
                                    <hr className="mt-2 mb-0 opacity-50" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Experience (Years)</label>
                                    <input type="number" className="form-control" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} min="0" />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Location</label>
                                    <input type="text" className="form-control" placeholder="e.g. Kozhikode, Kerala" value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Short Bio / Description</label>
                                    <textarea className="form-control" rows="4" value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })}></textarea>
                                </div>
                                <div className="col-12 mt-5">
                                    <button type="submit" className="btn btn-primary w-100 py-3">Update Seller Profile</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
