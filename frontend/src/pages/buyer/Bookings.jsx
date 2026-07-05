import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import { useAuth } from '../../context/AuthContext'

export default function BuyerBookings() {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)

    const fetchBookings = async () => {
        try {
            setLoading(true)
            const r = await api.get('/buyer/bookings/')
            setBookings(r.data)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchBookings()
    }, [])

    const statusBadge = (s) => ({
        pending: 'bg-warning-subtle text-warning border-warning-subtle',
        accepted: 'bg-info-subtle text-info border-info-subtle',
        completed: 'bg-success-subtle text-success border-success-subtle',
        cancelled: 'bg-danger-subtle text-danger border-danger-subtle',
    }[s] || '')

    const pastBookings = bookings
        .filter(b => ['completed', 'cancelled'].includes(b.status))
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))

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
                        <h2 className="fw-bold">Past Bookings</h2>
                        <p className="text-muted">Your completed and cancelled bookings.</p>
                    </div>
                </div>

                <div className="contact-form-card border-0 shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div>
                            <div className="fw-bold">{user?.full_name || user?.username}</div>
                            <div className="text-muted small">Total past bookings: {pastBookings.length}</div>
                        </div>
                        <Link to="/buyer/dashboard" className="btn btn-link btn-sm text-decoration-none fw-bold">Go to Dashboard</Link>
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
                                {loading ? (
                                    <tr><td colSpan="5" className="text-center py-4 text-muted small">Loading...</td></tr>
                                ) : pastBookings.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-4 text-muted small">No past bookings yet.</td></tr>
                                ) : pastBookings.map(b => (
                                    <tr key={b.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <i className={`bi ${b.service_icon || 'bi-briefcase'} text-primary me-2`}></i>
                                                <span className="fw-medium">{b.service_title}</span>
                                            </div>
                                        </td>
                                        <td className="small text-muted">{new Date(b.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <span className={`badge px-3 rounded-pill ${statusBadge(b.status)}`}>
                                                {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                                            </span>
                                        </td>
                                        <td className="text-end fw-bold">₹{b.total_price}</td>
                                        <td className="text-end text-muted small">—</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    )
}

