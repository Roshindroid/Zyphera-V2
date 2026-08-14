import { useEffect, useRef, useState } from 'react'
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

export default function ServiceDetail() {
    const { id } = useParams()
    const { user } = useAuth()
    const navigate = useNavigate()
    const [service, setService] = useState(null)
    const serviceRef = useRef(null)
    const [loading, setLoading] = useState(true)
    const [showBooking, setShowBooking] = useState(false)
    const mapRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const markerInstanceRef = useRef(null)
    const circleInstanceRef = useRef(null)

    useEffect(() => {
        mapInstanceRef.current = null
        markerInstanceRef.current = null
        circleInstanceRef.current = null
        serviceRef.current = null
    }, [id])

    useEffect(() => {
        AOS.init({ duration: 600, once: true })
        let isMounted = true

        const fetchService = () => {
            api.get(`/services/${id}/`)
                .then(r => {
                    if (isMounted) {
                        setService(r.data)
                        serviceRef.current = r.data
                    }
                })
                .catch(() => {
                    if (isMounted && !serviceRef.current) navigate('/services')
                })
                .finally(() => {
                    if (isMounted) setLoading(false)
                })
        }

        fetchService()
        const interval = setInterval(fetchService, 15000)

        return () => {
            isMounted = false
            clearInterval(interval)
        }
    }, [id])

    // draw or update map with radius circle when service loads or changes
    useEffect(() => {
        if (!service?.location_data || !mapRef.current) return
        const loc = service.location_data
        const key = import.meta.env.VITE_GOOGLE_MAPS_KEY
        if (!key) return

        const center = { lat: loc.latitude, lng: loc.longitude }

        if (mapInstanceRef.current) {
            mapInstanceRef.current.setCenter(center)
            if (markerInstanceRef.current) {
                markerInstanceRef.current.position = center
            }
            if (circleInstanceRef.current) {
                circleInstanceRef.current.setCenter(center)
                circleInstanceRef.current.setRadius(loc.radius_km * 1000)
            }
            return
        }

        let isCancelled = false
        let poll = null

        const init = async () => {
            if (isCancelled || mapInstanceRef.current || !mapRef.current) return
            const { Map, Circle } = await window.google.maps.importLibrary('maps')
            const { AdvancedMarkerElement } = await window.google.maps.importLibrary('marker')
            if (isCancelled || mapInstanceRef.current || !mapRef.current) return

            const map = new Map(mapRef.current, { center, zoom: 12, disableDefaultUI: true, zoomControl: true, mapId: 'DEMO_MAP_ID' })
            mapInstanceRef.current = map
            markerInstanceRef.current = new AdvancedMarkerElement({ position: center, map })
            circleInstanceRef.current = new Circle({
                map, center,
                radius: loc.radius_km * 1000,
                fillColor: '#007bff', fillOpacity: 0.1,
                strokeColor: '#007bff', strokeOpacity: 0.4, strokeWeight: 2,
            })
        }

        if (window.google?.maps?.importLibrary) {
            init()
        } else {
            const existing = document.querySelector('script[data-gmaps]')
            if (!existing) {
                const s = document.createElement('script')
                s.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=marker&loading=async`
                s.async = true; s.defer = true; s.dataset.gmaps = '1'
                s.onload = () => { if (!isCancelled) init() }
                document.head.appendChild(s)
            } else {
                poll = setInterval(() => {
                    if (window.google?.maps?.importLibrary) {
                        clearInterval(poll)
                        poll = null
                        if (!isCancelled) init()
                    }
                }, 100)
            }
        }

        return () => {
            isCancelled = true
            if (poll) clearInterval(poll)
        }
    }, [service])

    if (loading) return (
        <>
            <Navbar />
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '60vh' }}>
                <div className="spinner-border text-primary"></div>
            </div>
        </>
    )

    if (!service) return null

    const loc = service.location_data
    const avgRating = service.avg_rating
    const reviews = service.reviews || []

    return (
        <>
            {showBooking && <BookingModal service={service} onClose={() => setShowBooking(false)} />}
            <Navbar />

            <section className="page-hero">
                <div className="container" data-aos="fade-up">
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb justify-content-center mb-3" style={{ background: 'none' }}>
                            <li className="breadcrumb-item"><Link to="/services" className="text-white-50">Services</Link></li>
                            <li className="breadcrumb-item active text-white">{service.title}</li>
                        </ol>
                    </nav>
                    <h1>{service.title}</h1>
                    <p>{service.category?.name} · by {service.seller?.name}</p>
                </div>
            </section>

            <section className="section-padding" style={{ background: '#f8faff' }}>
                <div className="container">
                    <div className="row g-5">
                        {/* Left — details */}
                        <div className="col-lg-8" data-aos="fade-up">
                            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div style={{ width: 64, height: 64, borderRadius: 16, background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className={`bi ${service.category?.icon_class || 'bi-briefcase-fill'} text-primary fs-2`}></i>
                                    </div>
                                    <div>
                                        <h3 className="fw-bold mb-0">{service.title}</h3>
                                        <span className="service-badge">{service.category?.name || 'General'}</span>
                                    </div>
                                </div>

                                {avgRating && (
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <Stars rating={avgRating} />
                                        <span className="fw-bold">{avgRating}</span>
                                        <span className="text-muted small">({service.review_count} review{service.review_count !== 1 ? 's' : ''})</span>
                                    </div>
                                )}

                                <p className="text-muted">{service.description}</p>
                            </div>

                            {/* Seller card */}
                            <div className="card border-0 shadow-sm rounded-4 p-4 mb-4" data-aos="fade-up">
                                <h5 className="fw-bold mb-3">About the Provider</h5>
                                <div className="d-flex align-items-center gap-3 mb-3">
                                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#e0f2fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <i className="bi bi-person-fill text-primary fs-4"></i>
                                    </div>
                                    <div>
                                        <div className="fw-bold">{service.seller?.name}</div>
                                        <div className="text-muted small">{service.seller?.experience} years experience</div>
                                    </div>
                                    <Link to={`/sellers/${service.seller?.id}`} className="btn btn-outline-primary btn-sm rounded-pill ms-auto">View Profile</Link>
                                </div>
                                {service.seller?.bio && <p className="text-muted small mb-0">{service.seller.bio}</p>}
                                {service.seller?.business_address && (
                                    <div className="text-muted small mt-2"><i className="bi bi-geo-alt me-1"></i>{service.seller.business_address}</div>
                                )}
                            </div>

                            {/* Service area map */}
                            {loc && (
                                <div className="card border-0 shadow-sm rounded-4 overflow-hidden mb-4" data-aos="fade-up">
                                    <div className="p-4 pb-2">
                                        <h5 className="fw-bold mb-1">Service Area</h5>
                                        <p className="text-muted small mb-0">
                                            <i className="bi bi-geo-alt-fill text-primary me-1"></i>{loc.address}
                                            <span className="ms-2 badge bg-primary-subtle text-primary border border-primary-subtle">{loc.radius_km} km radius</span>
                                        </p>
                                    </div>
                                    <div ref={mapRef} style={{ height: 280, width: '100%' }}></div>
                                </div>
                            )}

                            {/* Reviews */}
                            <div className="card border-0 shadow-sm rounded-4 p-4" data-aos="fade-up">
                                <h5 className="fw-bold mb-4">Customer Reviews {reviews.length > 0 && <span className="text-muted fw-normal small">({reviews.length})</span>}</h5>
                                {reviews.length === 0 ? (
                                    <p className="text-muted small">No reviews yet. Be the first to review!</p>
                                ) : reviews.map(r => (
                                    <div key={r.id} className="mb-4 pb-4 border-bottom last-child-no-border">
                                        <div className="d-flex justify-content-between align-items-start mb-1">
                                            <div>
                                                <span className="fw-bold me-2">{r.buyer_name || r.buyer_username}</span>
                                                <Stars rating={r.rating} />
                                            </div>
                                            <span className="text-muted small">{new Date(r.created_at).toLocaleDateString()}</span>
                                        </div>
                                        {r.comment && <p className="text-muted small mb-0">{r.comment}</p>}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Right — booking card */}
                        <div className="col-lg-4" data-aos="fade-up" data-aos-delay="100">
                            <div className="card border-0 shadow-sm rounded-4 p-4 sticky-top" style={{ top: 100 }}>
                                <div className="mb-3">
                                    <span className="text-primary fw-bold fs-3">₹{service.price}</span>
                                    <span className="text-muted">/{service.price_unit}</span>
                                </div>

                                {loc && (
                                    <div className="bg-light rounded-3 p-3 mb-3 small">
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="text-muted">Free travel within</span>
                                            <span>{loc.free_radius_km} km</span>
                                        </div>
                                        <div className="d-flex justify-content-between mb-1">
                                            <span className="text-muted">Travel fee</span>
                                            <span>₹{loc.price_per_km}/km after</span>
                                        </div>
                                        {parseFloat(loc.platform_fee) > 0 && (
                                            <div className="d-flex justify-content-between">
                                                <span className="text-muted">Platform fee</span>
                                                <span>₹{loc.platform_fee}</span>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {user?.role === 'buyer' ? (
                                    <button className="btn btn-primary w-100 rounded-pill py-3 fw-bold" onClick={() => setShowBooking(true)}>
                                        <i className="bi bi-calendar-check me-2"></i>Book Now
                                    </button>
                                ) : user ? (
                                    <button className="btn btn-outline-secondary w-100 rounded-pill py-3" disabled>Service Provider Account</button>
                                ) : (
                                    <Link to="/login" className="btn btn-primary w-100 rounded-pill py-3 fw-bold">Login to Book</Link>
                                )}

                                <div className="mt-3 text-center text-muted small">
                                    <i className="bi bi-shield-check text-success me-1"></i>Verified provider · Secure booking
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    )
}
