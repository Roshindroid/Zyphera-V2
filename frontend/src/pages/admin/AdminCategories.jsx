import { useEffect, useState } from 'react'
import api from '../../api/axios'
import AdminLayout from './AdminLayout'

export default function AdminCategories() {
    const [categories, setCategories] = useState([])
    const [form, setForm] = useState({ name: '', slug: '', icon_class: 'bi-briefcase-fill' })
    const [error, setError] = useState('')

    const fetchCategories = () => api.get('/admin/categories/').then(r => setCategories(r.data)).catch(() => {})

    useEffect(() => { fetchCategories() }, [])

    const handleAdd = async (e) => {
        e.preventDefault()
        setError('')
        try {
            await api.post('/admin/categories/', form)
            setForm({ name: '', slug: '', icon_class: 'bi-briefcase-fill' })
            fetchCategories()
        } catch (err) {
            setError(Object.values(err.response?.data || {})[0]?.[0] || 'Failed to add category')
        }
    }

    const deleteCategory = async (id, name) => {
        if (!window.confirm(`Delete category "${name}"?`)) return
        await api.delete(`/admin/categories/${id}/`)
        fetchCategories()
    }

    return (
        <AdminLayout title="Category Management">
            <div className="row g-4">
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 16 }}>
                        <h5 className="fw-bold mb-4">Add New Category</h5>
                        {error && <div className="alert alert-danger py-2 small">{error}</div>}
                        <form onSubmit={handleAdd} className="d-flex flex-column gap-3">
                            <div>
                                <label className="form-label">Category Name</label>
                                <input type="text" className="form-control" placeholder="e.g. Plumbing" value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })} required />
                            </div>
                            <div>
                                <label className="form-label">Slug</label>
                                <input type="text" className="form-control" placeholder="e.g. plumbing" value={form.slug}
                                    onChange={e => setForm({ ...form, slug: e.target.value })} />
                            </div>
                            <div>
                                <label className="form-label">Bootstrap Icon Class</label>
                                <div className="input-group">
                                    <span className="input-group-text"><i className={`bi ${form.icon_class}`}></i></span>
                                    <input type="text" className="form-control" placeholder="bi-briefcase-fill" value={form.icon_class}
                                        onChange={e => setForm({ ...form, icon_class: e.target.value })} />
                                </div>
                            </div>
                            <button type="submit" className="btn btn-primary rounded-pill">Add Category</button>
                        </form>
                    </div>
                </div>

                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 16 }}>
                        <h5 className="fw-bold mb-4">All Categories</h5>
                        <div className="table-responsive">
                            <table className="table table-hover align-middle">
                                <thead className="bg-light">
                                    <tr>
                                        <th className="border-0">Icon</th>
                                        <th className="border-0">Name</th>
                                        <th className="border-0">Slug</th>
                                        <th className="border-0 text-end">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {categories.length === 0 ? (
                                        <tr><td colSpan="4" className="text-center py-4 text-muted">No categories yet.</td></tr>
                                    ) : categories.map(c => (
                                        <tr key={c.id}>
                                            <td>
                                                <div style={{ width: 40, height: 40, borderRadius: 10, background: '#e0f2fe', color: '#0284c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>
                                                    <i className={`bi ${c.icon_class}`}></i>
                                                </div>
                                            </td>
                                            <td className="fw-bold">{c.name}</td>
                                            <td className="text-muted small">{c.slug || '—'}</td>
                                            <td className="text-end">
                                                <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={() => deleteCategory(c.id, c.name)}>
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
