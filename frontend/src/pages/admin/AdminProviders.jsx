import { useEffect, useState } from 'react'
import api from '../../api/axios'
import AdminLayout from './AdminLayout'

export default function AdminProviders() {
    const [pending, setPending] = useState([])
    const [selected, setSelected] = useState(null)

    const fetchPending = () => api.get('/admin/approvals/').then(r => setPending(r.data)).catch(() => {})

    useEffect(() => { fetchPending() }, [])

    const approve = async (id) => {
        await api.post(`/admin/approvals/${id}/approve/`)
        setSelected(null)
        fetchPending()
    }

    return (
        <AdminLayout title="Provider Management">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 16 }}>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <h5 className="fw-bold mb-0">
                        Pending Approvals
                        <span className="badge bg-primary ms-2">{pending.length}</span>
                    </h5>
                </div>
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="border-0">Applicant</th>
                                <th className="border-0">Experience</th>
                                <th className="border-0">Location</th>
                                <th className="border-0">Registered</th>
                                <th className="border-0 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {pending.length === 0 ? (
                                <tr><td colSpan="5" className="text-center py-4 text-muted">No pending approvals.</td></tr>
                            ) : pending.map(s => (
                                <tr key={s.id}>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span className="text-primary fw-bold">{s.username.slice(0, 2).toUpperCase()}</span>
                                            </div>
                                            <div>
                                                <div className="fw-bold">{s.full_name}</div>
                                                <div className="text-muted small">{s.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td>{s.experience} yrs</td>
                                    <td className="text-muted small">{s.location || '—'}</td>
                                    <td className="text-muted small">{new Date(s.created_at).toLocaleDateString()}</td>
                                    <td className="text-end">
                                        <button className="btn btn-outline-primary btn-sm rounded-pill px-3 me-2" onClick={() => setSelected(s)}>Details</button>
                                        <button className="btn btn-success btn-sm rounded-pill px-3" onClick={() => approve(s.id)}>Approve</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Detail Modal */}
            {selected && (
                <div className="modal show d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setSelected(null)}>
                    <div className="modal-dialog modal-dialog-centered modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg rounded-4">
                            <div className="modal-header border-0 pb-0 pt-4 px-4">
                                <h5 className="modal-title fw-bold">Provider Application Details</h5>
                                <button type="button" className="btn-close" onClick={() => setSelected(null)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="row g-4">
                                    {[
                                        { label: 'Full Name', value: selected.full_name },
                                        { label: 'Email', value: selected.email },
                                        { label: 'Phone', value: selected.phone || '—' },
                                        { label: 'Experience', value: `${selected.experience} years` },
                                        { label: 'Location', value: selected.location || '—' },
                                    ].map((item, i) => (
                                        <div key={i} className="col-md-6">
                                            <label className="text-muted small fw-bold text-uppercase mb-1">{item.label}</label>
                                            <p className="fw-semibold mb-0">{item.value}</p>
                                        </div>
                                    ))}
                                    <div className="col-12">
                                        <label className="text-muted small fw-bold text-uppercase mb-1">Bio</label>
                                        <div className="p-3 bg-light rounded-3 border">
                                            <p className="mb-0">{selected.description || '—'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 px-4 pb-4">
                                <button className="btn btn-light rounded-pill px-4" onClick={() => setSelected(null)}>Close</button>
                                <button className="btn btn-success rounded-pill px-4" onClick={() => approve(selected.id)}>Approve Applicant</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    )
}
