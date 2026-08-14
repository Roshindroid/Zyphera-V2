import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import AOS from 'aos'
import 'aos/dist/aos.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import BookingModal from '../components/BookingModal'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

const Stars = ({ rating }) => (
    <span>
        {[1, 2, 3, 4, 5].map(s => (
            <i key={s} className={`bi ${s <= Math.round(rating) ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`} style={{ fontSize: '0.85rem' }}></i>
        ))}
    </span>
)

export default function SellerPublicProfile() {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [seller, setSeller] = useState(null)
    const [loading, setLoading] = useState(true)
    const [bookingService, setBookingService] = useState(null)

    useEffect(() => {
        AOS.init({ duration: 600, once: true })
        api.get(`/sellers/${id}/`)
            .then(r => setSeller(r.data))
            .catch(() => navigate('/services'))
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return (
        <>
            <Navbar />
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-primary"></div>
            </div>
        </>
    )

    if (!seller) return null

    return (
        <>
            {bookingService && <BookingModal service={bookingService} onClose={() => setBookingService(null)} />}
            <Navbar />

            <section className="page-hero">
                <div className="container text-center" data-aos="fade-up">
                    <div className="d-inline-flex align-items-center justify-content-center rounded-circle bg-white bg-opacity-10 mb-3" style={{ width: 80, height: 80 }}>
                        <i className="bi bi-person-fill text-white fs-1"></i>
                    </div>
                    <h1>{seller.name}</h1>
                    <p>{seller.experience} years experience
                        {seller.avg_rating && <span className="ms-3"><Stars rating={seller.avg_rating} /> {seller.avg_rating} ({seller.review_count} reviews)</span>}
                    </p>
                </div>
            </section>

            <section className="section-padding" style={{ background: '#f8faff' }}>
                <div className="container">
                    <div className="row g-5">
                        {/* Left — seller info */}
                        <div className="col-lg-4" data-aos="fade-up">
                            <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: 100 }}>
                                <h5 className="fw-bold mb-3">About</h5>
                                {seller.bio
                                    ? <p className="text-muted small">{seller.bio}</p>
                                    : <p className="text-muted small fst-italic">No bio provided.</p>}

                                <hr />
                                <div className="d-flex flex-column gap-2 small">
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">Experience</span>
                                        <span className="fw-bold">{seller.experience} yrs</span>
                                    </div>
                                    <div className="d-flex justify-content-between">
                                        <span className="text-muted">Services</span>
                                        <span className="fw-bold">{seller.services?.length}</span>
                                    </div>
                                    {seller.avg_rating && (
                                        <div className="d-flex justify-content-between">
                                            <span className="text-muted">Avg Rating</span>
                                            <span className="fw-bold">{seller.avg_rating} ★</span>
                                        </div>
                                    )}
                                    {seller.business_address && (
                                        <div className="d-flex gap-2 mt-1">
                                            <i className="bi bi-geo-alt text-primary mt-1"></i>
                                            <span className="text-muted">{seller.business_address}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right — services */}
                        <div className="col-lg-8">
                            <h4 className="fw-bold mb-4" data-aos="fade-up">Services by {seller.name}</h4>
                            {seller.services?.length === 0 ? (
                                <p className="text-muted">No active services listed.</p>
                            ) : (
                                <div className="row g-4">
                                    {seller.services.map((service, i) => (
                                        <div key={service.id} className="col-md-6" data-aos="fade-up" data-aos-delay={i * 60}>
                                            <div className="card h-100 border-0 service-card shadow-sm">
                                                <div className="card-img-top py-4 text-center bg-primary bg-opacity-10" style={{ height: 110, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <i className={`bi ${service.category?.icon_class || 'bi-briefcase-fill'} text-primary fs-1`}></i>
                                                </div>
                                                <div className="card-body d-flex flex-column">
                                                    <span className="service-badge">{service.category?.name || 'General'}</span>
                                                    <h5 className="card-title">{service.title}</h5>
                                                    {service.avg_rating && (
                                                        <div className="d-flex align-items-center gap-1 mb-1">
                                                            <Stars rating={service.avg_rating} />
                                                            <span className="text-muted small">{service.avg_rating} ({service.review_count})</span>
                                                        </div>
                                                    )}
                                                    <p className="card-text small text-muted">{service.description.split(' ').slice(0, 18).join(' ')}...</p>
                                                    <div className="d-flex justify-content-between align-items-center mt-auto pt-2">
                                                        <span className="text-primary fw-bold">₹{service.price}/{service.price_unit}</span>
                                                        <div className="d-flex gap-2">
                                                            <Link to={`/services/${service.id}`} className="btn btn-outline-primary btn-sm rounded-pill">Details</Link>
                                                            {user?.role === 'buyer' && (
                                                                <button className="btn btn-primary btn-sm rounded-pill" onClick={() => setBookingService(service)}>Book</button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    )
}
