import { useEffect, useState } from 'react'
import api from '../../api/axios'
import AdminLayout from './AdminLayout'

export default function AdminServices() {
    const [services, setServices] = useState([])
    const [categories, setCategories] = useState([])
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')

    const fetchServices = () => {
        const params = new URLSearchParams()
        if (search) params.append('q', search)
        if (categoryFilter) params.append('category', categoryFilter)
        api.get(`/admin/services/?${params}`).then(r => setServices(r.data)).catch(() => {})
    }

    useEffect(() => {
        api.get('/categories/').then(r => setCategories(r.data)).catch(() => {})
    }, [])

    useEffect(() => { fetchServices() }, [search, categoryFilter])

    const deleteService = async (id, title) => {
        if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return
        await api.delete(`/admin/services/${id}/`)
        fetchServices()
    }

    const toggleStatus = async (id, current) => {
        await api.post(`/seller/services/${id}/toggle/`, { active: !current })
        fetchServices()
    }

    return (
        <AdminLayout title="Service Management">
            <div className="card border-0 shadow-sm p-3 mb-4" style={{ borderRadius: 16 }}>
                <div className="row g-3 align-items-center">
                    <div className="col-md-5">
                        <div className="input-group">
                            <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
                            <input type="text" className="form-control bg-light border-start-0" placeholder="Search services or providers..."
                                value={search} onChange={e => setSearch(e.target.value)} />
                        </div>
                    </div>
                    <div className="col-md-3">
                        <select className="form-select bg-light" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                            <option value="">All Categories</option>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 16 }}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="border-0">Service</th>
                                <th className="border-0">Provider</th>
                                <th className="border-0">Category</th>
                                <th className="border-0">Price</th>
                                <th className="border-0">Status</th>
                                <th className="border-0 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {services.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-5 text-muted">No services found.</td></tr>
                            ) : services.map(s => (
                                <tr key={s.id}>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div style={{ width: 40, height: 40, borderRadius: 10, background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <i className={`bi ${s.category?.icon_class || 'bi-tools'}`}></i>
                                            </div>
                                            <div>
                                                <div className="fw-bold">{s.title}</div>
                                                <div className="text-muted small">ID: SER-{s.id}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="small fw-medium">{s.seller_name}</td>
                                    <td><span className="badge bg-light text-dark border rounded-pill px-3 py-2">{s.category?.name || 'General'}</span></td>
                                    <td className="fw-bold">₹{s.price}/{s.price_unit}</td>
                                    <td>
                                        <span className={`badge rounded-pill px-3 py-2 border ${s.is_active ? 'bg-success-subtle text-success border-success-subtle' : 'bg-warning-subtle text-warning border-warning-subtle'}`}>
                                            {s.is_active ? 'Active' : 'Paused'}
                                        </span>
                                    </td>
                                    <td className="text-end">
                                        <button className="btn btn-light btn-sm rounded-pill me-1" title="Toggle status" onClick={() => toggleStatus(s.id, s.is_active)}>
                                            <i className="bi bi-power"></i>
                                        </button>
                                        <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={() => deleteService(s.id, s.title)}>
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
