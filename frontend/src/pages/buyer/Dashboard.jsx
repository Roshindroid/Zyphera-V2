import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function BuyerDashboard() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [bookings, setBookings] = useState([])

    const fetchBookings = async () => {
        api.get('/buyer/bookings/').then(r => setBookings(r.data)).catch(() => {})
    }

    useEffect(() => {
        fetchBookings()
    }, [])

    const handleCancelBooking = async (booking) => {
        const bookingId = booking?.id ?? booking?._id
        if (!bookingId) return

        const ok = window.confirm('Are you sure you want to cancel this booking?')
        if (!ok) return

        try {
            await api.patch(`/bookings/${bookingId}/cancel/`)
            setBookings(prev => prev.filter(b => (b.id ?? b._id) !== bookingId))
        } catch (e) {
            console.error(e)
            alert('Unable to cancel booking right now.')
        }
    }

    const totalSpent = bookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + parseFloat(b.total_price || 0), 0)


    const statusBadge = (s) => ({
        pending: 'bg-warning-subtle text-warning border-warning-subtle',
        accepted: 'bg-info-subtle text-info border-info-subtle',
        completed: 'bg-success-subtle text-success border-success-subtle',
        cancelled: 'bg-danger-subtle text-danger border-danger-subtle',
    }[s] || '')

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 mb-4">
                <div className="container">
                    <Link className="navbar-brand brand-name" to="/" style={{ fontSize: '1.5rem', color: '#007bff' }}>Zyphera</Link>
                    <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                        <i className="bi bi-arrow-left me-1"></i>Back
                    </button>
                </div>
            </nav>

            <div className="container pb-5">
                <div className="row mb-4">
                    <div className="col-12">
                        <h2 className="fw-bold">My Insights</h2>
                        <p className="text-muted">A summary of your activity on Zyphera.</p>
                    </div>
                </div>

                <div className="row g-4">
                    <div className="col-lg-4">
                        <div className="contact-form-card border-0 shadow-sm h-100">
                            <div className="text-center mb-4">
                                <div className="bg-primary bg-opacity-10 d-inline-flex rounded-circle mb-3" style={{ width: 100, height: 100, alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="bi bi-person-circle text-primary" style={{ fontSize: '3.5rem' }}></i>
                                </div>
                                <h4 className="fw-bold mb-0">{user?.full_name || user?.username}</h4>
                                <p className="text-muted small">Buyer Account</p>
                            </div>
                            <hr className="my-4 opacity-50" />
                            <div>
                                {[
                                    { label: 'Username', value: `@${user?.username}` },
                                    { label: 'Email', value: user?.email },
                                    { label: 'Location', value: user?.location || 'Not Set' },
                                ].map((item, i) => (
                                    <div key={i} className="d-flex justify-content-between mb-3">
                                        <span className="text-muted small fw-medium">{item.label}</span>
                                        <span className="fw-semibold small">{item.value}</span>
                                    </div>
                                ))}
                            </div>
                            <Link to="/buyer/profile/edit" className="btn btn-outline-primary w-100 mt-4 rounded-pill">
                                <i className="bi bi-pencil-square me-2"></i>Edit Profile
                            </Link>
                        </div>
                    </div>

                    <div className="col-lg-8">
                        <div className="row g-3 mb-4">
                            {[
                                { label: 'Total Bookings', value: bookings.length, color: 'text-primary' },
                                { label: 'Total Spent', value: `₹${totalSpent.toFixed(0)}`, color: 'text-success' },
                                { label: 'Reviews Given', value: 0, color: 'text-info' },
                            ].map((s, i) => (
                                <div key={i} className="col-md-4">
                                    <div className="stat-card border-0 shadow-sm">
                                        <div className={`stat-number ${s.color}`}>{s.value}</div>
                                        <div className="stat-label text-uppercase small fw-bold">{s.label}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="contact-form-card border-0 shadow-sm">
                            <div className="d-flex justify-content-between align-items-center mb-4">
                                <h5 className="fw-bold mb-0">Recent Service Bookings</h5>
                                <div className="d-flex gap-2 align-items-center">
                                    <Link to="/services" className="btn btn-link btn-sm text-decoration-none fw-bold">New Booking</Link>
                                    <Link to="/buyer/bookings" className="btn btn-sm btn-outline-primary rounded-pill">View All Bookings</Link>
                                </div>
                            </div>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="border-0 small text-muted">Service</th>
                                            <th className="border-0 small text-muted">Date</th>
                                            <th className="border-0 small text-muted">Status</th>
                                            <th className="border-0 small text-muted text-end">Price</th>
                                            <th className="border-0 small text-muted text-end">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {bookings.length === 0 ? (
                                            <tr><td colSpan="5" className="text-center py-4 text-muted small">No bookings yet.</td></tr>
                                        ) : bookings.slice(0, 5).map(b => (
                                            <tr key={b.id}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        <i className={`bi ${b.service_icon || 'bi-briefcase'} text-primary me-2`}></i>
                                                        <span className="fw-medium">{b.service_title}</span>
                                                    </div>
                                                </td>
                                                <td className="small text-muted">{new Date(b.created_at).toLocaleDateString()}</td>
                                                <td><span className={`badge px-3 rounded-pill ${statusBadge(b.status)}`}>{b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span></td>
                                                <td className="text-end fw-bold">₹{b.total_price}</td>
                                                {['pending', 'accepted'].includes(b.status) ? (
                                                    <td
                                                        className="text-end"
                                                        onClick={() => handleCancelBooking(b)}
                                                        style={{ cursor: 'pointer' }}
                                                    >
                                                        <span className="btn btn-sm btn-outline-danger rounded-pill">Cancel</span>
                                                    </td>
                                                ) : (
                                                    <td className="text-end">
                                                        <span className="text-muted small">—</span>
                                                    </td>
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

