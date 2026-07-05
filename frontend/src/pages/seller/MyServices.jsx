import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'

export default function MyServices() {
    const navigate = useNavigate()
    const [services, setServices] = useState([])

    const fetchServices = () => api.get('/seller/services/').then(r => setServices(r.data)).catch(() => {})

    useEffect(() => { fetchServices() }, [])

    const toggleStatus = async (id, current) => {
        await api.post(`/seller/services/${id}/toggle/`, { active: !current })
        fetchServices()
    }

    return (
        <div className="bg-light min-vh-100">
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 mb-5">
                <div className="container">
                    <Link className="navbar-brand brand-name" to="/" style={{ fontSize: '1.5rem' }}>Zyphera</Link>
                    <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                        <i className="bi bi-arrow-left me-1"></i>Back
                    </button>
                </div>
            </nav>

            <div className="container pb-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-0">My Services</h2>
                        <p className="text-muted">Manage your active listings.</p>
                    </div>
                    <Link to="/seller/add-service" className="btn btn-primary rounded-pill px-4">
                        <i className="bi bi-plus-lg me-2"></i>New Service
                    </Link>
                </div>

                <div className="row g-4">
                    {services.length === 0 ? (
                        <div className="col-12 text-center py-5">
                            <i className="bi bi-info-circle fs-1 text-muted"></i>
                            <p className="mt-3 text-muted">You haven't added any services yet.</p>
                            <Link to="/seller/add-service" className="btn btn-primary btn-sm rounded-pill px-4 mt-2">Add Your First Service</Link>
                        </div>
                    ) : services.map(service => (
                        <div key={service.id} className="col-md-6 col-lg-4">
                            <div className={`card h-100 border-0 service-card shadow-sm position-relative ${!service.is_active ? 'opacity-50' : ''}`}>
                                <div className="card-img-top py-4 text-center bg-primary bg-opacity-10" style={{ height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <i className={`bi ${service.category?.icon_class || 'bi-briefcase-fill'} text-primary fs-1`}></i>
                                </div>
                                <div className="card-body">
                                    <div className="d-flex justify-content-between align-items-start mb-2">
                                        <span className="service-badge">{service.category?.name || 'General'}</span>
                                        <div className="form-check form-switch mb-0">
                                            <input className="form-check-input" type="checkbox" role="switch"
                                                checked={service.is_active}
                                                onChange={() => toggleStatus(service.id, service.is_active)} />
                                        </div>
                                    </div>
                                    <h5 className="card-title">{service.title}</h5>
                                    <p className="card-text small text-muted">{service.description.split(' ').slice(0, 15).join(' ')}...</p>
                                    <div className="d-flex justify-content-between align-items-center mt-3">
                                        <span className="fw-bold">₹{service.price}/{service.price_unit}</span>
                                        <span className={`badge ${service.is_active ? 'bg-success' : 'bg-secondary'}`}>{service.is_active ? 'Active' : 'Paused'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
