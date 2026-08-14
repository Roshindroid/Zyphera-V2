import { useEffect, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import AOS from 'aos'
import 'aos/dist/aos.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import { useLocation } from '../context/LocationContext'
import LocationPicker from '../components/LocationPicker'
import BookingModal from '../components/BookingModal'
import { useNearbyServices } from '../hooks/useNearbyServices'
import { onGoogleMapsReady } from '../hooks/useGoogleMaps'


export default function Services() {
    const { user } = useAuth()
    const { buyerLocation, setLocation, detectCurrentLocation } = useLocation()
    const [showPicker, setShowPicker] = useState(false)
    const [detecting, setDetecting] = useState(false)

    const mainMapRef = useRef(null)
    const mainMapInstanceRef = useRef(null)
    const mainMarkerRef = useRef(null)
    const serviceMarkersRef = useRef([])
    const mapSearchRef = useRef(null)

    const [mapReady, setMapReady] = useState(false)

    const [searchParams] = useSearchParams()
    const [services, setServices] = useState([])
    const [categories, setCategories] = useState([])
    const [sellers, setSellers] = useState([])
    const [activeFilter, setActiveFilter] = useState('all')

    const { services: nearbyServices, loading: nearbyLoading } = useNearbyServices(
        buyerLocation?.lat, buyerLocation?.lng, activeFilter
    )
    const [modal, setModal] = useState({ title: '', details: '', location: '', recipient: 'admin' })
    const [submitted, setSubmitted] = useState(false)
    const [bookingService, setBookingService] = useState(null)

    useEffect(() => {
        AOS.init({ duration: 650, once: true, offset: 70 })
        api.get('/categories/').then(r => setCategories(r.data)).catch(() => {})
        api.get('/sellers/').then(r => setSellers(r.data)).catch(() => {})

        let isMounted = true
        const fetchServices = () => {
            api.get('/services/').then(r => {
                if (isMounted) setServices(r.data)
            }).catch(() => {})
        }

        fetchServices()
        const interval = setInterval(fetchServices, 15000)

        return () => {
            isMounted = false
            clearInterval(interval)
        }
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

    const handleBookNow = (service) => {
        if (!user || user.role !== 'buyer') {
            alert('Please login as a buyer to book a service.')
            return
        }
        setBookingService(service)
    }


    // initialise or re-center the main map whenever buyerLocation changes
    useEffect(() => {
        const lat = buyerLocation?.lat ?? 20.5937
        const lng = buyerLocation?.lng ?? 78.9629

        const init = async () => {
            if (!mainMapRef.current) return
            const g = window.google.maps
            const { Map } = await g.importLibrary('maps')
            const { AdvancedMarkerElement } = await g.importLibrary('marker')
            if (!mainMapInstanceRef.current) {
                mainMapInstanceRef.current = new Map(mainMapRef.current, {
                    center: { lat, lng },
                    zoom: 14,
                    disableDefaultUI: true,
                    zoomControl: true,
                    mapId: 'DEMO_MAP_ID',
                })
                mainMarkerRef.current = new AdvancedMarkerElement({
                    position: { lat, lng },
                    map: mainMapInstanceRef.current,
                })
            } else {
                mainMapInstanceRef.current.setCenter({ lat, lng })
                mainMarkerRef.current.position = { lat, lng }
            }

            // wire PlaceAutocompleteElement to the map section search bar
            if (mapSearchRef.current && !mapSearchRef.current._acBound) {
                mapSearchRef.current._acBound = true
                const { PlaceAutocompleteElement } = await g.importLibrary('places')
                const pac = new PlaceAutocompleteElement()
                pac.style.cssText = 'flex:1;min-width:0;display:block;width:100%'
                mapSearchRef.current.replaceWith(pac)
                mapSearchRef.current = pac
                pac.addEventListener('gmp-placeselect', async ({ place }) => {
                    await place.fetchFields({ fields: ['location', 'formattedAddress'] })
                    const plat = place.location.lat()
                    const plng = place.location.lng()
                    setLocation({ lat: plat, lng: plng, address: place.formattedAddress, place_id: null })
                })
            }

            setMapReady(true)
        }

// Use the shared bootstrap loader so importLibrary is guaranteed to be
        // available before we call it (avoids the premature onload init bug).
        onGoogleMapsReady(() => {
            init()
        })
    }, [buyerLocation])

    // plot / refresh service markers whenever the map is ready and results change
    const displayMapServices = buyerLocation ? nearbyServices : filtered

    useEffect(() => {
        if (!mapReady || !window.google?.maps) return
        // clear old service markers
        serviceMarkersRef.current.forEach(m => { m.map = null })
        serviceMarkersRef.current = []
        if (!displayMapServices || !displayMapServices.length) return

        window.google.maps.importLibrary('marker').then(({ AdvancedMarkerElement }) => {
            displayMapServices.forEach(service => {
                const loc = service.location_data
                if (!loc?.latitude || !loc?.longitude) return
                const lat = parseFloat(loc.latitude)
                const lng = parseFloat(loc.longitude)
                if (isNaN(lat) || isNaN(lng)) return

                const iconClass = service.category?.icon_class || 'bi-briefcase-fill'
                const price = service.display_price ?? service.price

                const pin = document.createElement('div')
                pin.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:pointer;filter:drop-shadow(0 2px 6px rgba(0,0,0,.28))'
                pin.innerHTML = `
                    <div style="width:40px;height:40px;background:#007bff;border-radius:50%;display:flex;align-items:center;justify-content:center;border:2.5px solid #fff">
                        <i class="bi ${iconClass}" style="color:#fff;font-size:17px"></i>
                    </div>
                    <div style="background:#007bff;color:#fff;padding:2px 7px;border-radius:10px;font-size:10px;font-weight:700;margin-top:3px;white-space:nowrap">
                        ₹${price}
                    </div>
                    <div style="width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-top:6px solid #007bff;margin-top:-1px"></div>
                `

                const marker = new AdvancedMarkerElement({
                    position: { lat, lng },
                    map: mainMapInstanceRef.current,
                    content: pin,
                    title: service.title,
                })
                serviceMarkersRef.current.push(marker)
            })
        })
    }, [displayMapServices, mapReady])

    const handleDetectLocation = async () => {
        setDetecting(true)
        try {
            const loc = await detectCurrentLocation()
            await setLocation(loc)
        } catch {
            alert('Could not detect location. Please allow location access.')
        } finally {
            setDetecting(false)
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
            {showPicker && <LocationPicker onClose={() => setShowPicker(false)} />}
            {bookingService && <BookingModal service={bookingService} onClose={() => setBookingService(null)} />}
            <Navbar />

            <section className="page-hero">
                <div className="container" data-aos="fade-up">
                    <h1>Our Services</h1>
                    <p>Discover verified professionals across {categories.length} categories — all within your neighborhood.</p>
                </div>
            </section>

            <section className="section-padding" style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #f8faff 100%)' }}>
                <div className="container">
                    {!buyerLocation && (
                        <div className="alert alert-info d-flex align-items-center gap-3 mb-4" data-aos="fade-up">
                            <i className="bi bi-geo-alt-fill fs-5"></i>
                            <div className="flex-grow-1">
                                <strong>Set your location</strong> to see services available near you with distance and travel fees.
                            </div>
                            <button className="btn btn-primary btn-sm rounded-pill px-3" onClick={() => setShowPicker(true)}>Set Location</button>
                        </div>
                    )}
                    {buyerLocation && (
                        <div className="d-flex align-items-center gap-2 mb-4 text-muted small" data-aos="fade-up">
                            <i className="bi bi-geo-alt-fill text-primary"></i>
                            Showing services near <strong className="text-dark ms-1">{buyerLocation.address.split(',').slice(0, 2).join(',').trim()}</strong>
                            <button className="btn btn-link btn-sm p-0 ms-1" onClick={() => setShowPicker(true)}>Change</button>
                        </div>
                    )}
                    <div className="d-flex filter-tabs mb-5" data-aos="fade-up">
                        <button className={`nav-link ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>All Services</button>
                        {categories.map(cat => (
                            <button key={cat.id} className={`nav-link ${activeFilter === cat.slug ? 'active' : ''}`} onClick={() => setActiveFilter(cat.slug)}>
                                <i className={`bi ${cat.icon_class} me-1`}></i>{cat.name}
                            </button>
                        ))}
                    </div>

                    <div className="row g-4">
                        {nearbyLoading ? (
                            <div className="col-12 text-center py-5">
                                <div className="spinner-border text-primary"></div>
                                <p className="text-muted mt-3">Finding services near you...</p>
                            </div>
                        ) : buyerLocation && nearbyServices.length === 0 ? (
                            <div className="col-12 text-center py-5">
                                <i className="bi bi-geo-alt fs-1 text-muted"></i>
                                <p className="mt-3 text-muted">No services found within range of your location.</p>
                                <button className="btn btn-outline-primary btn-sm rounded-pill px-4 mt-2" onClick={() => setShowPicker(true)}>Change Location</button>
                            </div>
                        ) : (buyerLocation ? nearbyServices : filtered).length === 0 ? (
                            <div className="col-12 text-center py-5">
                                <p className="text-muted">No services found in this category.</p>
                            </div>
                        ) : (buyerLocation ? nearbyServices : filtered).map((service, i) => (
                            <div key={service.id} className="col-md-6 col-lg-4 service-item" data-aos="fade-up" data-aos-delay={i * 50}>
                                <div className="card h-100 border-0 service-card">
                                    <div className="card-img-top py-5 text-center">
                                        <i className={`bi ${service.category?.icon_class || 'bi-briefcase-fill'}`} style={{ fontSize: '2.75rem', color: '#007bff' }}></i>
                                    </div>
                                    <div className="card-body d-flex flex-column">
                                        <span className="service-badge">{service.category?.name || 'General'}</span>
                                        <h5 className="card-title">
                                            <Link to={`/services/${service.id}`} className="text-decoration-none text-dark">{service.title}</Link>
                                        </h5>
                                        {service.avg_rating && (
                                            <div className="d-flex align-items-center gap-1 mb-1">
                                                {[1,2,3,4,5].map(s => (
                                                    <i key={s} className={`bi ${s <= Math.round(service.avg_rating) ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`} style={{ fontSize: '0.75rem' }}></i>
                                                ))}
                                                <span className="text-muted small ms-1">{service.avg_rating} ({service.review_count})</span>
                                            </div>
                                        )}
                                        <p className="card-text">{service.description.split(' ').slice(0, 25).join(' ')}...</p>
                                        {service.distance_km != null && (
                                            <div className="d-flex align-items-center gap-2 mb-2">
                                                <span className="badge bg-light text-dark border">
                                                    <i className="bi bi-geo-alt-fill text-primary me-1"></i>
                                                    {service.distance_km} km away
                                                </span>
                                                {service.is_free_travel
                                                    ? <span className="badge bg-success-subtle text-success border border-success-subtle">Free Travel</span>
                                                    : <span className="badge bg-warning-subtle text-warning border border-warning-subtle">Travel ₹{service.travel_fee}</span>
                                                }
                                            </div>
                                        )}
                                        <div className="d-flex justify-content-between align-items-center mt-auto pt-3">
                                            <div>
                                                <span className="text-primary fw-bold">
                                                    ₹{service.display_price ?? service.price}/{service.price_unit}
                                                </span>
                                                {service.display_price && service.travel_fee !== '0.00' && (
                                                    <div className="text-muted" style={{ fontSize: '0.75rem' }}>Base ₹{service.price} + Travel ₹{service.travel_fee}</div>
                                                )}
                                            </div>
                                            {user && user.role !== 'buyer' ? (
                                                <button className="btn btn-outline-secondary btn-sm" disabled>Service Provider</button>
                                            ) : (
                                                <button className="btn btn-primary btn-sm" onClick={() => handleBookNow(service)}>Book Now</button>
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
                                    <div className="input-group flex-grow-1">
                                        <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-primary"></i></span>
                                        <input
                                            ref={mapSearchRef}
                                            type="text"
                                            className="form-control bg-light border-start-0"
                                            placeholder="Search area, city or pincode..."
                                        />
                                    </div>
                                    <button
                                        className="btn btn-outline-secondary d-flex align-items-center justify-content-center gap-2 text-nowrap"
                                        onClick={handleDetectLocation}
                                        disabled={detecting}
                                    >
                                        {detecting
                                            ? <span className="spinner-border spinner-border-sm"></span>
                                            : <i className="bi bi-crosshair"></i>}
                                        {detecting ? 'Detecting...' : 'Detect My Location'}
                                    </button>
                                </div>
                                <div className="map-container" style={{ height: '450px' }}>
                                    <div ref={mainMapRef} style={{ height: '100%', width: '100%' }}></div>
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
