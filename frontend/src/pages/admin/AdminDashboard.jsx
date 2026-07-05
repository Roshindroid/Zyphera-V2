import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../../api/axios'
import AdminLayout from './AdminLayout'

const StatCard = ({ label, value, icon, color }) => (
    <div className="col-md-6 col-lg-4">
        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 16 }}>
            <div className="d-flex justify-content-between align-items-start">
                <div>
                    <p className="text-muted small fw-bold text-uppercase mb-1">{label}</p>
                    <h2 className="fw-bold mb-0">{value}</h2>
                </div>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: color.bg, color: color.text, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                    <i className={`bi ${icon}`}></i>
                </div>
            </div>
        </div>
    </div>
)

export default function AdminDashboard() {
    const [data, setData] = useState(null)

    useEffect(() => {
        api.get('/admin/stats/').then(r => setData(r.data)).catch(() => {})
    }, [])

    const approveProvider = async (id) => {
        await api.post(`/admin/approvals/${id}/approve/`)
        api.get('/admin/stats/').then(r => setData(r.data)).catch(() => {})
    }

    const rejectProvider = async (id) => {
        await api.delete(`/admin/approvals/${id}/reject/`)
        api.get('/admin/stats/').then(r => setData(r.data)).catch(() => {})
    }

    if (!data) return <AdminLayout title="Dashboard"><p className="text-muted">Loading...</p></AdminLayout>

    const stats = [
        { label: 'Total Users', value: data.total_users, icon: 'bi-people', color: { bg: '#e0f2fe', text: '#0284c7' } },
        { label: 'Active Providers', value: data.active_sellers, icon: 'bi-person-badge', color: { bg: '#dcfce7', text: '#16a34a' } },
        { label: 'Pending Approvals', value: data.pending_sellers, icon: 'bi-clock-history', color: { bg: '#ffedd5', text: '#ea580c' } },
        { label: 'Total Services', value: data.total_services, icon: 'bi-tools', color: { bg: '#f3e8ff', text: '#9333ea' } },
        { label: 'Total Bookings', value: data.total_bookings, icon: 'bi-calendar-check', color: { bg: '#e0e7ff', text: '#4f46e5' } },
        { label: 'Revenue', value: `₹${data.total_revenue}`, icon: 'bi-currency-rupee', color: { bg: '#fee2e2', text: '#dc2626' } },
    ]

    return (
        <AdminLayout title="Marketplace Overview">
            <div className="row g-4 mb-5">
                {stats.map((s, i) => <StatCard key={i} {...s} />)}
            </div>

            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 16 }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">Pending Provider Approvals</h5>
                    <Link to="/admin/providers" className="btn btn-primary btn-sm rounded-pill">View All</Link>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="border-0">Provider Name</th>
                                <th className="border-0">Email</th>
                                <th className="border-0">Experience</th>
                                <th className="border-0">Registered</th>
                                <th className="border-0 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.latest_pending.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4 text-muted">No pending approvals.</td></tr>
                            ) : data.latest_pending.map(s => (
                                <tr key={s.id}>
                                    <td className="fw-medium">{s.full_name}</td>
                                    <td className="text-muted small">{s.email}</td>
                                    <td>{s.experience} yrs</td>
                                    <td className="text-muted small">{new Date(s.created_at).toLocaleDateString()}</td>
                                    <td className="text-end">
                                        <button className="btn btn-success btn-sm rounded-pill px-3 me-2" onClick={() => approveProvider(s.id)}>
                                            <i className="bi bi-check-lg me-1"></i>Approve
                                        </button>
                                        <button className="btn btn-danger btn-sm rounded-pill px-3" onClick={() => rejectProvider(s.id)}>
                                            <i className="bi bi-x-lg me-1"></i>Reject
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </AdminLayout>
    )
}
