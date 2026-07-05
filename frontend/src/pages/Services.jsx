import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import AOS from 'aos'
import 'aos/dist/aos.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'


export default function Services() {
    const { user } = useAuth()
    const { refreshCartCount } = useCart()

    const [searchParams] = useSearchParams()
    const [services, setServices] = useState([])
    const [categories, setCategories] = useState([])
    const [sellers, setSellers] = useState([])
    const [activeFilter, setActiveFilter] = useState('all')
    const [modal, setModal] = useState({ title: '', details: '', location: '', recipient: 'admin' })
    const [submitted, setSubmitted] = useState(false)

    useEffect(() => {
        AOS.init({ duration: 650, once: true, offset: 70 })
        api.get('/categories/').then(r => setCategories(r.data)).catch(() => {})
        api.get('/services/').then(r => setServices(r.data)).catch(() => {})
        api.get('/sellers/').then(r => setSellers(r.data)).catch(() => {})
    }, [])

    useEffect(() => {
        const filter = searchParams.get('filter')
        if (filter) setActiveFilter(filter)
    }, [searchParams])

    useEffect(() => {
        if (services.length) AOS.refreshHard()
    }, [services, activeFilter])

    const filtered = activeFilter === 'all'
        ? services
        : services.filter(s => s.category?.slug === activeFilter || s.category?.name?.toLowerCase() === activeFilter)

    const handleAddToCart = async (serviceId) => {
        try {
            await api.post('/cart/', { service_id: serviceId })
            alert('Added to cart!')
            await refreshCartCount()
        } catch {
            alert('Please login as a buyer to add to cart.')
        }
    }


    const handleRequestSubmit = async (e) => {
        e.preventDefault()
        try {
            await api.post('/requests/', modal)
            setSubmitted(true)
            setTimeout(() => {
                setSubmitted(false)
                setModal({ title: '', details: '', location: '', recipient: 'admin' })
                document.getElementById('requestModalClose')?.click()
            }, 2000)
        } catch {
            alert('Failed to submit request.')
        }
    }

    return (
        <>
            <Navbar />

            <section className="page-hero">
                <div className="container" data-aos="fade-up">
                    <h1>Our Services</h1>
                    <p>Discover verified professionals across {categories.length} categories — all within your neighborhood.</p>
                </div>
            </section>

            <section className="section-padding" style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #f8faff 100%)' }}>
                <div className="container">
                    <div className="d-flex filter-tabs mb-5" data-aos="fade-up">
                        <button className={`nav-link ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All Services</button>
                        {categories.map(cat => (
                            <button key={cat.id} className={`nav-link ${activeFilter === cat.slug ? 'active' : ''}`} onClick={() => setActiveFilter(cat.slug)}>
                                <i className={`bi ${cat.icon_class} me-1`}></i>{cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="row g-4">
                        {filtered.length === 0 ? (
                            <div className="col-12 text-center py-5">
                                <p className="text-muted">No services found in this category.</p>
                            </div>
                        ) : filtered.map((service, i) => (
                            <div key={service.id} className="col-md-6 col-lg-4 service-item" data-aos="fade-up" data-aos-delay={i * 50}>
                                <div className="card h-100 border-0 service-card">
                                    <div className="card-img-top py-5 text-center">
                                        <i className={`bi ${service.category?.icon_class || 'bi-briefcase-fill'}`} style={{ fontSize: '2.75rem', color: '#007bff' }}></i>
                                    </div>
                                    <div className="card-body d-flex flex-column">
                                        <span className="service-badge">{service.category?.name || 'General'}</span>
                                        <h5 className="card-title">{service.title}</h5>
                                        <p className="card-text">{service.description.split(' ').slice(0, 25).join(' ')}...</p>
                                        <div className="d-flex justify-content-between align-items-center mt-auto pt-3">
                                            <span className="text-primary fw-bold">₹{service.price}/{service.price_unit}</span>
                                            {user && user.role !== 'buyer' ? (
                                                <button className="btn btn-outline-secondary btn-sm" disabled>Service Provider</button>
                                            ) : (
                                                <button className="btn btn-primary btn-sm" onClick={() => handleAddToCart(service.id)}>Book Now</button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section id="serviceMap" className="section-padding bg-white">
                <div className="container">
                    <div className="text-center mb-5" data-aos="fade-up">
                        <h2 className="mb-2">Services Near You</h2>
                        <p className="text-muted" style={{ maxWidth: '520px', margin: '0 auto' }}>Use our interactive map to find the closest verified professionals in your area.</p>
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-lg-10" data-aos="zoom-in">
                            <div className="map-wrapper shadow-lg border rounded-4 overflow-hidden bg-white">
                                <div className="map-controls d-flex flex-column flex-md-row gap-2 p-3 border-bottom">
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-end-0"><i className="bi bi-geo-alt text-primary"></i></span>
                                        <input type="text" className="form-control bg-light border-start-0" placeholder="Enter your area or street..." />
                                        <button className="btn btn-primary px-4">Find Pros</button>
                                    </div>
                                    <button className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 text-nowrap">
                                        <i className="bi bi-crosshair"></i> Detect My Location
                                    </button>
                                </div>
                                <div className="map-container" style={{ height: '450px' }}>
                                    <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d125218.43572836267!2d75.7145455!3d11.2587531!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba65938563a4747%3A0x321557147a375a2!2sKozhikode%2C%20Kerala!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
                                        width="100%" height="100%" style={{ border: 0 }} allowFullScreen loading="lazy"></iframe>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section-padding" style={{ background: '#f8faff' }}>
                <div className="container" data-aos="fade-up">
                    <div className="cta-banner">
                        <h3>Can't find what you're looking for?</h3>
                        <p>Post your requirement and let verified professionals reach out to you.</p>
                        <button type="button" className="btn-white border-0" data-bs-toggle="modal" data-bs-target="#requestModal">Post a Request</button>
                    </div>
                </div>
            </section>

            {/* Request Modal */}
            <div className="modal fade" id="requestModal" tabIndex="-1" aria-hidden="true">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 shadow-lg rounded-4">
                        <div className="modal-header border-0 pb-0 pt-4 px-4">
                            <h5 className="modal-title fw-bold">What do you need help with?</h5>
                            <button id="requestModalClose" type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <form onSubmit={handleRequestSubmit}>
                            <div className="modal-body p-4">
                                {submitted && <div className="alert alert-success">Request posted successfully!</div>}
                                <p className="text-muted small mb-4">Describe your requirement. We'll share it with verified professionals in your area.</p>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Send To</label>
                                    <select className="form-select bg-light border-0 py-2" value={modal.recipient} onChange={e => setModal({ ...modal, recipient: e.target.value })}>
                                        <option value="admin">Zyphera Support (Admin)</option>
                                        {sellers.map(s => <option key={s.id} value={s.id}>Available Pro: {s.full_name || s.username}</option>)}
                                    </select>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Service Title</label>
                                    <input type="text" className="form-control bg-light border-0 py-2" placeholder="e.g. Emergency plumbing repair" value={modal.title} onChange={e => setModal({ ...modal, title: e.target.value })} required />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label small fw-bold">Requirement Details</label>
                                    <textarea className="form-control bg-light border-0 py-2" rows="4" placeholder="Tell us about the task, preferred timing, etc." value={modal.details} onChange={e => setModal({ ...modal, details: e.target.value })} required></textarea>
                                </div>
                                <div className="mb-0">
                                    <label className="form-label small fw-bold">Your Location</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-light border-0"><i className="bi bi-geo-alt"></i></span>
                                        <input type="text" className="form-control bg-light border-0 py-2" placeholder="e.g. Kozhikode Central" value={modal.location} onChange={e => setModal({ ...modal, location: e.target.value })} required />
                                    </div>
                                </div>
                            </div>
                            <div className="modal-footer border-0 p-4 pt-0">
                                <button type="button" className="btn btn-light rounded-pill px-4" data-bs-dismiss="modal">Cancel</button>
                                <button type="submit" className="btn btn-primary rounded-pill px-4">Submit Request</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    )
}
