import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function SellerRequests() {
    const navigate = useNavigate()
    const [bookings, setBookings] = useState([])
    const [statusFilter, setStatusFilter] = useState('all')

    const fetchBookings = () => {
        const params = statusFilter !== 'all' ? `?status=${statusFilter}` : ''
        api.get(`/seller/bookings/${params}`).then(r => setBookings(r.data)).catch(() => {})
    }

    useEffect(() => { fetchBookings() }, [statusFilter])

    const updateStatus = async (id, newStatus) => {
        await api.post(`/seller/bookings/${id}/status/`, { status: newStatus })
        fetchBookings()
    }

    const statusBadge = (s) => ({
        pending: 'bg-warning-subtle text-warning border-warning-subtle',
        accepted: 'bg-info-subtle text-info border-info-subtle',
        completed: 'bg-success-subtle text-success border-success-subtle',
        cancelled: 'bg-danger-subtle text-danger border-danger-subtle',
    }[s] || '')

    return (
        <div className="bg-light min-vh-100">
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 mb-5">
                <div className="container">
                    <Link className="navbar-brand brand-name" to="/" style={{ fontSize: '1.5rem' }}>Zyphera</Link>
                    <div className="d-flex align-items-center gap-2">
                        <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-2 rounded-pill small fw-bold">Seller Mode</span>
                        <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                            <i className="bi bi-arrow-left me-1"></i>Back
                        </button>
                    </div>
                </div>
            </nav>

            <div className="container pb-5">
                <div className="row mb-4">
                    <div className="col-12">
                        <h2 className="fw-bold">Service Requests</h2>
                        <p className="text-muted">Manage incoming bookings and track their progress.</p>
                    </div>
                </div>

                <div className="row mb-4">
                    <div className="col-12">
                        <div className="d-flex gap-2 pb-2">
                            {['all', 'pending', 'accepted', 'completed'].map(s => (
                                <button key={s} className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-outline-primary'} rounded-pill px-4`} onClick={() => setStatusFilter(s)}>
                                    {s.charAt(0).toUpperCase() + s.slice(1)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="contact-form-card border-0 shadow-sm">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle">
                            <thead className="bg-light">
                                <tr>
                                    <th className="border-0 small text-muted">Customer</th>
                                    <th className="border-0 small text-muted">Service</th>
                                    <th className="border-0 small text-muted">Date</th>
                                    <th className="border-0 small text-muted">Status</th>
                                    <th className="border-0 small text-muted text-end">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.length === 0 ? (
                                    <tr><td colSpan="5" className="text-center py-5 text-muted">No service requests found.</td></tr>
                                ) : bookings.map(b => (
                                    <tr key={b.id}>
                                        <td>
                                            <div className="d-flex align-items-center">
                                                <div className="bg-primary bg-opacity-10 p-2 rounded-circle me-3"><i className="bi bi-person text-primary"></i></div>
                                                <div>
                                                    <div className="fw-bold">{b.buyer_name}</div>
                                                    <div className="text-muted small">{b.buyer_phone || 'No phone'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="fw-medium">{b.service_title}</span>
                                            <div className="text-muted small">{b.category_name || 'General'}</div>
                                        </td>
                                        <td className="small">{new Date(b.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                                        <td>
                                            <span className={`badge px-3 rounded-pill ${statusBadge(b.status)}`}>{b.status.charAt(0).toUpperCase() + b.status.slice(1)}</span>
                                        </td>
                                        <td className="text-end">
                                            {b.status === 'pending' ? (
                                                <div className="d-flex justify-content-end gap-2">
                                                    <button
                                                        className="btn btn-success btn-sm rounded-pill fw-bold"
                                                        onClick={() => updateStatus(b.id, 'accepted')}
                                                    >
                                                        Accept
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm rounded-pill"
                                                        onClick={() => updateStatus(b.id, 'cancelled')}
                                                    >
                                                        Reject
                                                    </button>
                                                </div>
                                            ) : b.status === 'accepted' ? (
                                                <button
                                                    className="btn btn-primary btn-sm rounded-pill"
                                                    onClick={() => updateStatus(b.id, 'completed')}
                                                >
                                                    Mark Completed
                                                </button>
                                            ) : null}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}
