import { useEffect, useState } from 'react'
import api from '../../api/axios'
import AdminLayout from './AdminLayout'

export default function AdminRequests() {
    const [requests, setRequests] = useState([])

    useEffect(() => {
        api.get('/admin/requests/').then(r => setRequests(r.data)).catch(() => {})
    }, [])

    return (
        <AdminLayout title="Service Requests">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 16 }}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="border-0">#</th>
                                <th className="border-0">Title</th>
                                <th className="border-0">Sender</th>
                                <th className="border-0">Recipient</th>
                                <th className="border-0">Location</th>
                                <th className="border-0">Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">No service requests found.</td></tr>
                            ) : requests.map(r => (
                                <tr key={r.id}>
                                    <td className="text-muted small">#{r.id}</td>
                                    <td>
                                        <div className="fw-bold">{r.title}</div>
                                        <div className="text-muted small" style={{ maxWidth: 260 }}>{r.details.slice(0, 80)}{r.details.length > 80 ? '…' : ''}</div>
                                    </td>
                                    <td className="small fw-medium">{r.sender}</td>
                                    <td>
                                        <span className={`badge rounded-pill px-3 py-2 ${r.recipient === 'Admin' ? 'bg-warning-subtle text-warning border border-warning-subtle' : 'bg-primary-subtle text-primary border border-primary-subtle'}`}>
                                            {r.recipient}
                                        </span>
                                    </td>
                                    <td className="text-muted small">{r.location}</td>
                                    <td className="text-muted small">{new Date(r.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    )
}
