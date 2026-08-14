import { useEffect, useState } from 'react'
import api from '../../api/axios'
import AdminLayout from './AdminLayout'

const statusBadge = (s) => ({
    pending: 'bg-warning-subtle text-warning border-warning-subtle',
    accepted: 'bg-info-subtle text-info border-info-subtle',
    completed: 'bg-success-subtle text-success border-success-subtle',
    cancelled: 'bg-danger-subtle text-danger border-danger-subtle',
}[s] || '')

export default function AdminBookings() {
    const [bookings, setBookings] = useState([])
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        api.get('/admin/bookings/').then(r => setBookings(r.data)).catch(() => {})
    }, [])

    const filtered = statusFilter === 'all' ? bookings : bookings.filter(b => b.status === statusFilter)

    const totalRevenue = bookings
        .filter(b => b.status === 'completed')
        .reduce((s, b) => s + parseFloat(b.total_price || 0), 0)

    return (
        <AdminLayout title="Booking Management">
            <div className="row g-4 mb-4">
                {[
                    { label: 'Total Bookings', value: bookings.length, icon: 'bi-calendar-check', bg: '#e0e7ff', color: '#4f46e5' },
                    { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, icon: 'bi-check-circle', bg: '#dcfce7', color: '#16a34a' },
                    { label: 'Pending', value: bookings.filter(b => b.status === 'pending').length, icon: 'bi-clock', bg: '#ffedd5', color: '#ea580c' },
                    { label: 'Total Revenue', value: `₹${totalRevenue.toFixed(0)}`, icon: 'bi-currency-rupee', bg: '#fee2e2', color: '#dc2626' },
                ].map((s, i) => (
                    <div key={i} className="col-md-3">
                        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 16 }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted small fw-bold text-uppercase mb-1">{s.label}</p>
                                    <h3 className="fw-bold mb-0">{s.value}</h3>
                                </div>
                                <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>
                                    <i className={`bi ${s.icon}`}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="d-flex gap-2 mb-4">
                {['all', 'pending', 'accepted', 'completed', 'cancelled'].map(s => (
                    <button key={s} className={`btn btn-sm rounded-pill px-3 ${statusFilter === s ? 'btn-primary' : 'btn-outline-secondary'}`}
                        onClick={() => setStatusFilter(s)}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 16 }}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="border-0">#</th>
                                <th className="border-0">Service</th>
                                <th className="border-0">Buyer</th>
                                <th className="border-0">Date</th>
                                <th className="border-0">Status</th>
                                <th className="border-0 text-end">Base</th>
                                <th className="border-0 text-end">Travel</th>
                                <th className="border-0 text-end">Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan="8" className="text-center py-5 text-muted">No bookings found.</td></tr>
                            ) : filtered.map(b => (
                                <tr key={b.id}>
                                    <td className="text-muted small">#{b.id}</td>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <i className={`bi ${b.service_icon || 'bi-briefcase'} text-primary`}></i>
                                            <span className="fw-medium">{b.service_title}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="fw-medium">{b.buyer_name}</div>
                                        <div className="text-muted small">{b.buyer_phone || '—'}</div>
                                    </td>
                                    <td className="text-muted small">{new Date(b.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`badge rounded-pill px-3 py-2 border ${statusBadge(b.status)}`}>
                                            {b.status.charAt(0).toUpperCase() + b.status.slice(1)}
                                        </span>
                                    </td>
                                    <td className="text-end small">₹{b.base_price ?? b.total_price}</td>
                                    <td className="text-end small">
                                        {parseFloat(b.travel_fee ?? 0) > 0
                                            ? `₹${b.travel_fee}`
                                            : <span className="text-success">Free</span>}
                                    </td>
                                    <td className="text-end fw-bold">₹{b.total_price}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    )
}
