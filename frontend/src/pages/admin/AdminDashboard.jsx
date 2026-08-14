import { useEffect, useRef, useState } from 'react'
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
    const chartRef = useRef(null)
    const chartInstanceRef = useRef(null)

    const fetchData = () => api.get('/admin/stats/').then(r => setData(r.data)).catch(() => {})

    useEffect(() => { fetchData() }, [])

    // draw/update chart whenever data changes
    useEffect(() => {
        if (!data?.revenue_by_month?.length || !chartRef.current) return

        const months = data.revenue_by_month.map(r => r.month)
        const revenues = data.revenue_by_month.map(r => parseFloat(r.revenue))

        const draw = (Chart) => {
            if (chartInstanceRef.current) chartInstanceRef.current.destroy()
            chartInstanceRef.current = new Chart(chartRef.current, {
                type: 'bar',
                data: {
                    labels: months,
                    datasets: [{
                        label: 'Revenue (₹)',
                        data: revenues,
                        backgroundColor: 'rgba(0,123,255,0.15)',
                        borderColor: '#007bff',
                        borderWidth: 2,
                        borderRadius: 8,
                    }],
                },
                options: {
                    responsive: true,
                    plugins: { legend: { display: false } },
                    scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } },
                },
            })
        }

        if (window.Chart) {
            draw(window.Chart)
        } else {
            const s = document.createElement('script')
            s.src = 'https://cdn.jsdelivr.net/npm/chart.js'
            s.onload = () => draw(window.Chart)
            document.head.appendChild(s)
        }

        return () => { chartInstanceRef.current?.destroy() }
    }, [data])

    const approveProvider = async (id) => {
        await api.post(`/admin/approvals/${id}/approve/`)
        fetchData()
    }

    const rejectProvider = async (id) => {
        await api.delete(`/admin/approvals/${id}/reject/`)
        fetchData()
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

            {/* Revenue Chart */}
            {data.revenue_by_month?.length > 0 && (
                <div className="card border-0 shadow-sm p-4 mb-5" style={{ borderRadius: 16 }}>
                    <h5 className="fw-bold mb-4">Monthly Revenue</h5>
                    <canvas ref={chartRef} height={90}></canvas>
                </div>
            )}

            <div className="row g-4 mb-5">
                {/* Top Services */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: 16 }}>
                        <h5 className="fw-bold mb-4">Top Services by Bookings</h5>
                        {data.top_services?.length === 0 ? (
                            <p className="text-muted small">No data yet.</p>
                        ) : data.top_services?.map((s, i) => (
                            <div key={i} className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="badge bg-primary-subtle text-primary rounded-pill" style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                                    <span className="fw-medium small">{s.title}</span>
                                </div>
                                <span className="badge bg-light text-dark border rounded-pill px-3">{s.bookings} bookings</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Sellers */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm p-4 h-100" style={{ borderRadius: 16 }}>
                        <h5 className="fw-bold mb-4">Top Sellers by Earnings</h5>
                        {data.top_sellers?.length === 0 ? (
                            <p className="text-muted small">No data yet.</p>
                        ) : data.top_sellers?.map((s, i) => (
                            <div key={i} className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    <span className="badge bg-success-subtle text-success rounded-pill" style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                                    <span className="fw-medium small">{s.name}</span>
                                </div>
                                <span className="badge bg-light text-dark border rounded-pill px-3">₹{s.earnings}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Pending Approvals */}
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
