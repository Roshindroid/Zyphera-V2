import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function SellerDashboard() {
    const navigate = useNavigate()
    const [data, setData] = useState({ stats: {}, recent_bookings: [] })

    const fetchData = () => api.get('/seller/dashboard/').then(r => setData(r.data)).catch(() => {})

    useEffect(() => { fetchData() }, [])

    const toggleAvailability = async (available) => {
        await api.post('/seller/availability/', { available })
        fetchData()
    }

    const { stats, recent_bookings } = data

    return (
        <div className="bg-light min-vh-100">
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 mb-5">
                <div className="container">
                    <Link className="navbar-brand brand-name" to="/" style={{ fontSize: '1.5rem' }}>Zyphera</Link>
                    <div className="d-flex align-items-center gap-2">
                        <div className="dropdown me-2 d-none d-md-block">
                            <button className="btn btn-light btn-sm rounded-pill border px-3 py-2 d-flex align-items-center gap-2" type="button" data-bs-toggle="dropdown">
                                <span className={`status-indicator ${stats.is_available ? 'bg-success' : 'bg-secondary'}`} style={{ width: 10, height: 10, borderRadius: '50%', display: 'inline-block' }}></span>
                                <span className={`small fw-bold ${stats.is_available ? 'text-success' : 'text-secondary'}`}>{stats.is_available ? 'Available' : 'Offline'}</span>
                                <i className="bi bi-chevron-down small text-muted"></i>
                            </button>
                            <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 rounded-4 mt-2">
                                <li><button className="dropdown-item d-flex align-items-center gap-2 py-2 fw-medium" onClick={() => toggleAvailability(true)}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#198754', display: 'inline-block' }}></span> Available</button></li>
                                <li><button className="dropdown-item d-flex align-items-center gap-2 py-2 fw-medium" onClick={() => toggleAvailability(false)}><span style={{ width: 10, height: 10, borderRadius: '50%', background: '#6c757d', display: 'inline-block' }}></span> Offline</button></li>
                            </ul>
                        </div>
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
                        <h2 className="fw-bold">Seller Dashboard</h2>
                        <p className="text-muted">Manage your services and track your business performance.</p>
                    </div>
                </div>

                <div className="row g-4 mb-5">
                    {[
                        { label: 'Total Earnings', value: `₹${stats.total_earnings || 0}`, color: 'text-success' },
                        { label: 'Active Services', value: stats.active_services_count || 0, color: 'text-primary' },
                        { label: 'Pending Requests', value: stats.pending_requests_count || 0, color: 'text-warning' },
                        { label: 'Avg. Rating', value: `${stats.avg_rating || 0}★`, color: 'text-info' },
                    ].map((s, i) => (
                        <div key={i} className="col-md-3">
                            <div className="stat-card border-0 shadow-sm text-center">
                                <div className={`stat-number ${s.color}`}>{s.value}</div>
                                <div className="stat-label text-uppercase small fw-bold">{s.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="row g-4">
                    <div className="col-lg-4">
                        <div className="contact-form-card border-0 shadow-sm h-100">
                            <h5 className="fw-bold mb-4">Quick Actions</h5>
                            <div className="d-grid gap-3">
                                <Link to="/seller/add-service" className="btn btn-primary py-3"><i className="bi bi-plus-circle me-2"></i>Add New Service</Link>
                                <Link to="/seller/services" className="btn btn-outline-primary py-3"><i className="bi bi-grid-3x3-gap me-2"></i>Manage My Services</Link>
                                <Link to="/seller/requests" className="btn btn-outline-primary py-3"><i className="bi bi-chat-left-dots me-2"></i>View Requests</Link>
                                <Link to="/seller/profile" className="btn btn-outline-primary py-3"><i className="bi bi-person-gear me-2"></i>Edit Profile</Link>
                            </div>
                        </div>
                    </div>

                    <div className="col-lg-8">
                        <div className="contact-form-card border-0 shadow-sm">
                            <h5 className="fw-bold mb-4">Recent Activity</h5>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <tbody>
                                        {recent_bookings.length === 0 ? (
                                            <tr><td className="text-center py-4 text-muted small">No recent activity found.</td></tr>
                                        ) : recent_bookings.map(b => (
                                            <tr key={b.id}>
                                                <td><div className="bg-primary bg-opacity-10 p-2 rounded-circle d-inline-block"><i className="bi bi-person text-primary"></i></div></td>
                                                <td><strong>{b.buyer_name}</strong> {b.status === 'pending' ? 'requested' : 'booked'} <strong>{b.service_title}</strong></td>
                                                <td className="text-muted small text-end">{new Date(b.created_at).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
