import { useEffect, useState } from 'react'
import api from '../../api/axios'
import AdminLayout from './AdminLayout'

export default function AdminUsers() {
    const [users, setUsers] = useState([])

    const fetchUsers = () => api.get('/admin/users/').then(r => setUsers(r.data)).catch(() => {})

    useEffect(() => { fetchUsers() }, [])

    const deleteUser = async (id, name) => {
        if (!window.confirm(`Delete user "${name}"? This cannot be undone.`)) return
        await api.delete(`/admin/users/${id}/`)
        fetchUsers()
    }

    const roleBadge = (role) => ({
        buyer: 'bg-secondary bg-opacity-10 text-secondary',
        seller: 'bg-primary bg-opacity-10 text-primary',
        admin: 'bg-warning bg-opacity-10 text-warning',
        super_admin: 'bg-danger bg-opacity-10 text-danger',
    }[role] || 'bg-secondary bg-opacity-10 text-secondary')

    return (
        <AdminLayout title="User Management">
            <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 16 }}>
                <div className="table-responsive">
                    <table className="table table-hover align-middle">
                        <thead className="bg-light">
                            <tr>
                                <th className="border-0">Name</th>
                                <th className="border-0">Email</th>
                                <th className="border-0">Role</th>
                                <th className="border-0">Status</th>
                                <th className="border-0">Joined</th>
                                <th className="border-0 text-end">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-4 text-muted">No users found.</td></tr>
                            ) : users.map(u => (
                                <tr key={u.id}>
                                    <td>
                                        <div className="d-flex align-items-center gap-2">
                                            <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <span className="text-primary fw-bold small">{u.username.slice(0, 2).toUpperCase()}</span>
                                            </div>
                                            <span className="fw-bold">{u.full_name}</span>
                                        </div>
                                    </td>
                                    <td className="text-muted small">{u.email}</td>
                                    <td><span className={`badge rounded-pill px-3 py-2 ${roleBadge(u.role)}`}>{u.role.replace('_', ' ')}</span></td>
                                    <td>
                                        <span className={`badge rounded-pill px-3 py-2 border ${u.is_active ? 'bg-success-subtle text-success border-success-subtle' : 'bg-danger-subtle text-danger border-danger-subtle'}`}>
                                            {u.is_active ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td className="text-muted small">{new Date(u.date_joined).toLocaleDateString()}</td>
                                    <td className="text-end">
                                        <button className="btn btn-outline-danger btn-sm rounded-pill px-3" onClick={() => deleteUser(u.id, u.full_name)}>
                                            <i className="bi bi-trash me-1"></i>Delete
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
