import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

const navItems = [
    { to: '/admin/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: '/admin/users', icon: 'bi-people', label: 'Users' },
    { to: '/admin/providers', icon: 'bi-person-badge', label: 'Providers' },
    { to: '/admin/services', icon: 'bi-tools', label: 'Services' },
    { to: '/admin/categories', icon: 'bi-grid', label: 'Categories' },
    { to: '/admin/bookings', icon: 'bi-calendar-check', label: 'Bookings' },
    { to: '/admin/requests', icon: 'bi-envelope-paper', label: 'Requests' },
    { to: '/admin/settings', icon: 'bi-gear', label: 'Settings' },
]

export default function AdminLayout({ children, title }) {
    const { pathname } = useLocation()
    const { user, logout } = useAuth()
    const navigate = useNavigate()

    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: '#f1f5f9' }}>
            <aside style={{ width: 240, background: 'linear-gradient(180deg,#0a0f1c 0%,#111827 100%)', flexShrink: 0, display: 'flex', flexDirection: 'column', padding: '2rem 1rem' }}>
                <div className="mb-5 px-2">
                    <div style={{ fontFamily: 'Poppins', fontWeight: 800, fontSize: '1.5rem', background: 'linear-gradient(135deg,#007bff,#00c6ff)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Zyphera</div>
                    <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem', marginBottom: 0 }}>Admin Control Panel</p>
                </div>
                <nav className="d-flex flex-column gap-1" style={{ flex: 1 }}>
                    {navItems.map(item => (
                        <Link key={item.to} to={item.to} style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem',
                            padding: '0.65rem 1rem', borderRadius: 12, textDecoration: 'none',
                            fontWeight: 500, fontSize: '0.9rem', transition: 'all 0.2s',
                            background: pathname === item.to ? 'rgba(0,123,255,0.2)' : 'transparent',
                            color: pathname === item.to ? '#60a5fa' : 'rgba(255,255,255,0.55)',
                            borderLeft: pathname === item.to ? '3px solid #007bff' : '3px solid transparent',
                        }}>
                            <i className={`bi ${item.icon}`}></i> {item.label}
                        </Link>
                    ))}
                </nav>
                <div style={{ paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                    <button onClick={handleLogout} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.65rem 1rem', borderRadius: 12, background: 'transparent',
                        border: 'none', color: '#f87171', fontWeight: 500, fontSize: '0.9rem',
                        width: '100%', cursor: 'pointer',
                    }}>
                        <i className="bi bi-box-arrow-left"></i> Logout
                    </button>
                </div>
            </aside>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                <header style={{ background: '#fff', borderBottom: '1px solid #e2e8f0', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 className="fw-bold mb-0" style={{ color: '#0d1117' }}>{title}</h4>
                    <div className="d-flex align-items-center gap-2">
                        <i className="bi bi-person-circle fs-4 text-primary"></i>
                        <div>
                            <div className="fw-bold small">{user?.full_name || user?.username}</div>
                            <div className="text-muted" style={{ fontSize: '0.72rem' }}>{user?.role?.replace('_', ' ')}</div>
                        </div>
                    </div>
                </header>
                <main style={{ flex: 1, padding: '2rem', overflowY: 'auto' }}>
                    {children}
                </main>
            </div>
        </div>
    )
}
