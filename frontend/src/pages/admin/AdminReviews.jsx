import { useEffect, useState } from 'react'
import api from '../../api/axios'
import AdminLayout from './AdminLayout'

const Stars = ({ rating }) => (
    <span>
        {[1, 2, 3, 4, 5].map(s => (
            <i key={s} className={`bi ${s <= rating ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`} style={{ fontSize: '0.8rem' }}></i>
        ))}
    </span>
)

export default function AdminReviews() {
    const [reviews, setReviews] = useState([])
    const [search, setSearch] = useState('')

    const fetchReviews = () => {
        api.get('/admin/reviews/').then(r => setReviews(r.data)).catch(() => {})
    }

    useEffect(() => { fetchReviews() }, [])

    const deleteReview = async (id) => {
        if (!window.confirm('Delete this review?')) return
        await api.delete(`/admin/reviews/${id}/`)
        fetchReviews()
    }

    const filtered = reviews.filter(r =>
        r.service_title.toLowerCase().includes(search.toLowerCase()) ||
        r.buyer_name.toLowerCase().includes(search.toLowerCase())
    )

    const avgRating = reviews.length
        ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
        : '—'

    return (
        <AdminLayout title="Reviews Management">
            <div className="row g-4 mb-4">
                {[
                    { label: 'Total Reviews', value: reviews.length, icon: 'bi-star', bg: '#fef9c3', color: '#ca8a04' },
                    { label: 'Average Rating', value: avgRating ? `${avgRating} ★` : '—', icon: 'bi-star-fill', bg: '#dcfce7', color: '#16a34a' },
                    { label: '5-Star Reviews', value: reviews.filter(r => r.rating === 5).length, icon: 'bi-trophy', bg: '#e0f2fe', color: '#0284c7' },
                ].map((s, i) => (
                    <div key={i} className="col-md-4">
                        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 16 }}>
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <p className="text-muted small fw-bold text-uppercase mb-1">{s.label}</p>
                                    <h2 className="fw-bold mb-0">{s.value}</h2>
                                </div>
                                <div style={{ width: 48, height: 48, borderRadius: 12, background: s.bg, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>
                                    <i className={`bi ${s.icon}`}></i>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="card border-0 shadow-sm p-3 mb-4" style={{ borderRadius: 16 }}>
                <div className="input-group" style={{ maxWidth: 360 }}>
                    <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                    <input type="text" className="form-control bg-light border-start-0" placeholder="Search by service or buyer..."
                        value={search} onChange={e => setSearch(e.target.value)} />
                </div>
            </div>

            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 16 }}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="border-0">#</th>
                                <th className="border-0">Service</th>
                                <th className="border-0">Buyer</th>
                                <th className="border-0">Rating</th>
                                <th className="border-0">Comment</th>
                                <th className="border-0">Date</th>
                                <th className="border-0 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 ? (
                                <tr><td colSpan="7" className="text-center py-5 text-muted">No reviews found.</td></tr>
                            ) : filtered.map(r => (
                                <tr key={r.id}>
                                    <td className="text-muted small">#{r.id}</td>
                                    <td>
                                        <div className="fw-medium">{r.service_title}</div>
                                        <div className="text-muted small">{r.category_name}</div>
                                    </td>
                                    <td className="fw-medium">{r.buyer_name}</td>
                                    <td><Stars rating={r.rating} /></td>
                                    <td className="text-muted small" style={{ maxWidth: 220 }}>
                                        {r.comment || <span className="fst-italic">No comment</span>}
                                    </td>
                                    <td className="text-muted small">{new Date(r.created_at).toLocaleDateString()}</td>
                                    <td className="text-end">
                                        <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={() => deleteReview(r.id)}>
                                            <i className="bi bi-trash"></i>
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
