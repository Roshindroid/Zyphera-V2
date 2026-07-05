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

    useEffect(() => {
        api.get('/admin/bookings/').then(r => setBookings(r.data)).catch(() => {})
    }, [])

    return (
        <AdminLayout title="Booking Management">
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
                                <th className="border-0 text-end">Price</th>
                            </tr>
                        </thead>
                        <tbody>
                            {bookings.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">No bookings found.</td></tr>
                            ) : bookings.map(b => (
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
