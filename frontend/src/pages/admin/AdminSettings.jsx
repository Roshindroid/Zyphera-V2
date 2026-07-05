import { useEffect, useState } from 'react'
import api from '../../api/axios'
import AdminLayout from './AdminLayout'
import { useAuth } from '../../context/AuthContext'

export default function AdminSettings() {
    const { user, updateUser } = useAuth()
    const [admins, setAdmins] = useState([])
    const [profile, setProfile] = useState({ full_name: '', email: '' })
    const [newAdmin, setNewAdmin] = useState({ username: '', full_name: '', email: '', password: '', role: 'admin' })
    const [profileSaved, setProfileSaved] = useState(false)
    const [adminAdded, setAdminAdded] = useState(false)
    const [error, setError] = useState('')
    const [activeTab, setActiveTab] = useState('profile')

    useEffect(() => {
        api.get('/admin/users/').then(r => {
            setAdmins(r.data.filter(u => u.role === 'admin' || u.role === 'super_admin'))
        }).catch(() => {})
        if (user) setProfile({ full_name: user.full_name || '', email: user.email || '' })
    }, [])

    const handleProfileSave = async (e) => {
        e.preventDefault()
        const res = await api.patch('/profile/', profile)
        updateUser(res.data)
        setProfileSaved(true)
        setTimeout(() => setProfileSaved(false), 2500)
    }

    const handleAddAdmin = async (e) => {
        e.preventDefault()
        setError('')
        try {
            await api.post('/auth/register/', { ...newAdmin })
            setAdminAdded(true)
            setNewAdmin({ username: '', full_name: '', email: '', password: '', role: 'admin' })
            setTimeout(() => setAdminAdded(false), 2500)
            api.get('/admin/users/').then(r => setAdmins(r.data.filter(u => u.role === 'admin' || u.role === 'super_admin'))).catch(() => {})
        } catch (err) {
            setError(Object.values(err.response?.data || {})[0]?.[0] || 'Failed to create admin')
        }
    }

    const tabStyle = (tab) => ({
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        padding: '0.75rem 1.25rem', border: 'none', background: 'none',
        width: '100%', textAlign: 'left', fontWeight: 500, fontSize: '0.93rem',
        color: activeTab === tab ? '#007bff' : '#374151',
        borderLeft: activeTab === tab ? '3px solid #007bff' : '3px solid transparent',
        background: activeTab === tab ? 'rgba(0,123,255,0.06)' : 'transparent',
        cursor: 'pointer', transition: 'all 0.2s',
    })

    return (
        <AdminLayout title="Settings">
            <div className="row g-4">
                <div className="col-lg-3">
                    <div className="card border-0 shadow-sm overflow-hidden" style={{ borderRadius: 16 }}>
                        <button style={tabStyle('profile')} onClick={() => setActiveTab('profile')}>
                            <i className="bi bi-person-gear"></i> Profile Settings
                        </button>
                        <button style={tabStyle('admins')} onClick={() => setActiveTab('admins')}>
                            <i className="bi bi-people"></i> Admins
                        </button>
                        {user?.role === 'super_admin' && (
                            <button style={tabStyle('add')} onClick={() => setActiveTab('add')}>
                                <i className="bi bi-shield-lock"></i> Add New Admin
                            </button>
                        )}
                    </div>
                </div>

                <div className="col-lg-9">
                    {activeTab === 'profile' && (
                        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 16 }}>
                            <h5 className="fw-bold mb-4">Admin Profile Settings</h5>
                            {profileSaved && <div className="alert alert-success py-2">Profile updated successfully!</div>}
                            <form onSubmit={handleProfileSave}>
                                <div className="row g-3 mb-4">
                                    <div className="col-md-6">
                                        <label className="form-label">Full Name</label>
                                        <input type="text" className="form-control" value={profile.full_name}
                                            onChange={e => setProfile({ ...profile, full_name: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Email Address</label>
                                        <input type="email" className="form-control" value={profile.email}
                                            onChange={e => setProfile({ ...profile, email: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Username</label>
                                        <input type="text" className="form-control" value={user?.username || ''} disabled />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Role</label>
                                        <input type="text" className="form-control" value={user?.role?.replace('_', ' ') || ''} disabled />
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary rounded-pill px-4">Save Changes</button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'admins' && (
                        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 16 }}>
                            <h5 className="fw-bold mb-4">System Administrators</h5>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle">
                                    <thead className="bg-light">
                                        <tr>
                                            <th className="border-0">Name</th>
                                            <th className="border-0">Email</th>
                                            <th className="border-0">Role</th>
                                            <th className="border-0">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {admins.length === 0 ? (
                                            <tr><td colSpan="4" className="text-center py-4 text-muted">No admins found.</td></tr>
                                        ) : admins.map(a => (
                                            <tr key={a.id} className={a.id === user?.id ? 'table-primary bg-opacity-10' : ''}>
                                                <td className="fw-bold">{a.full_name}{a.id === user?.id ? ' (You)' : ''}</td>
                                                <td className="text-muted">{a.email}</td>
                                                <td><span className="badge bg-primary-subtle text-primary border border-primary-subtle px-3 py-1">{a.role.replace('_', ' ')}</span></td>
                                                <td>
                                                    <span className={`badge rounded-pill px-3 py-1 border ${a.is_active ? 'bg-success-subtle text-success border-success-subtle' : 'bg-secondary-subtle text-secondary border-secondary-subtle'}`}>
                                                        {a.is_active ? 'Active' : 'Inactive'}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'add' && (
                        <div className="card border-0 shadow-sm p-4" style={{ borderRadius: 16 }}>
                            <h5 className="fw-bold mb-4">Add New Admin</h5>
                            <div className="alert alert-primary py-2 small mb-4">
                                <i className="bi bi-info-circle me-2"></i>Only <strong>Super Admins</strong> can create new admin accounts.
                            </div>
                            {error && <div className="alert alert-danger py-2 small">{error}</div>}
                            {adminAdded && <div className="alert alert-success py-2 small">Admin account created successfully!</div>}
                            <form onSubmit={handleAddAdmin}>
                                <div className="row g-3">
                                    <div className="col-md-6">
                                        <label className="form-label">Username</label>
                                        <input type="text" className="form-control" placeholder="adminhandle" value={newAdmin.username}
                                            onChange={e => setNewAdmin({ ...newAdmin, username: e.target.value })} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Full Name</label>
                                        <input type="text" className="form-control" placeholder="John Doe" value={newAdmin.full_name}
                                            onChange={e => setNewAdmin({ ...newAdmin, full_name: e.target.value })} />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Email</label>
                                        <input type="email" className="form-control" placeholder="admin@zyphera.com" value={newAdmin.email}
                                            onChange={e => setNewAdmin({ ...newAdmin, email: e.target.value })} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Password</label>
                                        <input type="password" className="form-control" placeholder="Set initial password" value={newAdmin.password}
                                            onChange={e => setNewAdmin({ ...newAdmin, password: e.target.value })} required />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Role</label>
                                        <select className="form-select" value={newAdmin.role} onChange={e => setNewAdmin({ ...newAdmin, role: e.target.value })}>
                                            <option value="admin">Admin</option>
                                            <option value="super_admin">Super Admin</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="btn btn-primary rounded-pill px-4 mt-4">Create Admin Account</button>
                            </form>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    )
}
