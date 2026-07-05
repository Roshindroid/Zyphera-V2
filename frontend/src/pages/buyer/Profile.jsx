import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function BuyerProfile() {
    const { user } = useAuth()
    const navigate = useNavigate()

    return (
        <>
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 mb-4">
                <div className="container">
                    <Link className="navbar-brand brand-name" to="/" style={{ fontSize: '1.5rem', color: '#007bff' }}>Zyphera</Link>
                    <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                        <i className="bi bi-arrow-left me-1"></i>Back
                    </button>
                </div>
            </nav>

            <div className="container pb-5">
                <div className="row justify-content-center">
                    <div className="col-lg-6">
                        <div className="contact-form-card border-0 shadow-sm p-5">
                            <div className="text-center mb-5">
                                <div className="bg-primary bg-opacity-10 d-inline-flex rounded-circle mb-3" style={{ width: 120, height: 120, alignItems: 'center', justifyContent: 'center' }}>
                                    <i className="bi bi-person-circle text-primary" style={{ fontSize: '4rem' }}></i>
                                </div>
                                <h3 className="fw-bold mb-1">{user?.full_name || user?.username}</h3>
                                <p className="text-muted small mb-0">Buyer Account</p>
                            </div>

                            <h6 className="text-uppercase text-muted small fw-bold mb-4">Account Information</h6>
                            <div className="row g-4">
                                {[
                                    { label: 'Full Name', value: user?.full_name || '—' },
                                    { label: 'Username', value: `@${user?.username}` },
                                    { label: 'Email Address', value: user?.email },
                                    { label: 'Phone Number', value: user?.phone || 'Not Set' },
                                    { label: 'Location', value: user?.location || 'Not Set' },
                                ].map((item, i) => (
                                    <div key={i} className="col-12">
                                        <label className="text-muted small d-block mb-1">{item.label}</label>
                                        <p className="fw-semibold mb-0 border-bottom pb-2">{item.value}</p>
                                    </div>
                                ))}
                                <div className="col-12">
                                    <label className="text-muted small d-block mb-1">Account Status</label>
                                    <p className="mb-0"><span className="badge bg-success-subtle text-success border border-success-subtle rounded-pill px-3">Active</span></p>
                                </div>
                            </div>

                            <div className="mt-5">
                                <Link to="/buyer/profile/edit" className="btn btn-primary w-100 py-3 rounded-pill">
                                    <i className="bi bi-pencil-square me-2"></i>Edit Profile Details
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
