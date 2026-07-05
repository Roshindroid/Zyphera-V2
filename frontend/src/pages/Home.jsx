import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AOS from 'aos'
import 'aos/dist/aos.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../api/axios'

export default function Home() {
    const [categories, setCategories] = useState([])
    const [services, setServices] = useState([])

    useEffect(() => {
        AOS.init({ duration: 800, once: true, offset: 0, startEvent: 'DOMContentLoaded' })
        api.get('/categories/').then(res => {
            setCategories(res.data)
        }).catch(err => console.log('categories error:', err))
        api.get('/services/?featured=true').then(res => {
            setServices(res.data)
        }).catch(err => console.log('services error:', err))
    }, [])


    useEffect(() => {
        if (categories.length || services.length) AOS.refreshHard()
    }, [categories, services])

    return (
        <>
            <Navbar />

            {/* Hero Carousel */}
            <div id="heroCarousel" className="carousel carousel-fade slide" data-bs-ride="carousel" data-bs-interval="5000">
                <div className="carousel-indicators">
                    <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="0" className="active"></button>
                    <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="1"></button>
                    <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="2"></button>
                </div>
                <div className="carousel-inner">
                    <div className="carousel-item active hero-section hero-slide-1 d-flex align-items-center">
                        <div className="container text-white text-center">
                            <h1 className="display-4 fw-bold mb-3">Reliable Services at Your Doorstep</h1>
                            <p className="lead mb-4">Connect with verified professionals in your neighborhood for any home service.</p>
                            <Link to="/services" className="btn btn-primary btn-lg px-5">Get Started</Link>
                        </div>
                    </div>
                    <div className="carousel-item hero-section hero-slide-2 d-flex align-items-center">
                        <div className="container text-white text-center">
                            <h1 className="display-4 fw-bold mb-3">Trusted Professionals Near You</h1>
                            <p className="lead mb-4">From electricians to tutors — find the right expert fast.</p>
                            <Link to="/services" className="btn btn-primary btn-lg px-5">Explore Now</Link>
                        </div>
                    </div>
                    <div className="carousel-item hero-section hero-slide-3 d-flex align-items-center">
                        <div className="container text-white text-center">
                            <h1 className="display-4 fw-bold mb-3">Your Community, Your Services</h1>
                            <p className="lead mb-4">Supporting local businesses and making life easier for everyone.</p>
                            <Link to="/services" className="btn btn-primary btn-lg px-5">Explore Now</Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Categories */}
            <section id="categories" className="section-padding">
                <div className="container">
                    <div className="text-center mb-5" data-aos="fade-up">
                        <h2 className="mb-2">Browse Categories</h2>
                        <p className="text-muted" style={{ maxWidth: '520px', margin: '0 auto' }}>Discover local professionals across a wide range of home and personal services.</p>
                    </div>
                    <div className="row g-4 justify-content-center">
                        {categories.map((cat, i) => (
                            <div className="col-6 col-md-4 col-lg-2" key={cat.id} data-aos="fade-up" data-aos-delay={i * 100}>
                                <Link to={`/services?filter=${cat.slug}`} className="text-decoration-none">
                                    <div className="category-card text-center h-100">
                                        <div className="category-icon-box"><i className={`bi ${cat.icon_class || 'bi-grid'}`}></i></div>
                                        <h5>{cat.name}</h5>
                                    </div>
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Services */}
            <section id="services" className="section-padding">
                <div className="container">
                    <div className="text-center mb-5" data-aos="fade-up">
                        <h2 className="mb-2">Featured Services</h2>
                        <p className="text-muted" style={{ maxWidth: '520px', margin: '0 auto' }}>Hand-picked top-rated services from verified professionals in your area.</p>
                    </div>
                    <div className="row g-4">
                        {services.length === 0 ? (
                            <div className="col-12 text-center py-5">
                                <p className="text-muted">No featured services available right now.</p>
                            </div>
                        ) : services.map((service, i) => (
                            <div className="col-md-4" key={service.id} data-aos="fade-up" data-aos-delay={i * 100}>
                                <div className="card h-100 border-0 service-card">
                                    <div className="card-img-top py-5 text-center">
                                        <i className={`bi ${service.category?.icon_class || 'bi-briefcase-fill'}`} style={{ fontSize: '2.75rem', color: '#007bff' }}></i>
                                    </div>
                                    <div className="card-body d-flex flex-column">
                                        <h5 className="card-title">{service.title}</h5>
                                        <p className="card-text">{service.description.split(' ').slice(0, 20).join(' ')}...</p>
                                        <div className="d-flex justify-content-between align-items-center mt-auto pt-3">
                                            <span className="text-primary fw-bold">₹{service.price}/{service.price_unit}</span>
                                            <Link to={`/services`} className="btn btn-primary btn-sm">Book Now</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* About */}
            <section id="about" className="section-padding">
                <div className="container">
                    <div className="row align-items-center g-5">
                        <div className="col-lg-6" data-aos="fade-right">
                            <h2 className="mb-4">About Zyphera</h2>
                            <p className="about-lead">Connecting local communities with trusted service professionals since 2023.</p>
                            <p>Zyphera is a hyperlocal service marketplace built to make everyday life easier. Whether you need an electrician for a quick fix, a tutor for your child, or a reliable cleaner — we connect you with trusted professionals in your neighborhood.</p>
                            <p className="mb-4">Every service provider on our platform is background-verified, rated by real customers, and committed to delivering high-quality work.</p>
                            <Link to="/register" className="btn btn-outline-primary">Join the Community</Link>
                        </div>
                        <div className="col-lg-6" data-aos="fade-left" data-aos-delay="100">
                            <div className="about-visual-card">
                                <div className="about-icon-box"><i className="bi bi-patch-check-fill"></i></div>
                                <h4>Trusted by 10,000+</h4>
                                <p>Homeowners and professionals across Kerala trust Zyphera for their service needs — every single day.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="why-section section-padding">
                <div className="container">
                    <div className="text-center mb-5" data-aos="fade-up">
                        <h2 className="mb-2">Why Choose Zyphera?</h2>
                        <p className="text-muted" style={{ maxWidth: '520px', margin: '0 auto' }}>We take the guesswork out of finding reliable help at home.</p>
                    </div>
                    <div className="row g-4">
                        {[
                            { icon: 'bi-shield-check', title: 'Verified Experts', text: 'Every service provider goes through a rigorous background check and skill verification before joining our platform.' },
                            { icon: 'bi-geo-alt-fill', title: 'Hyperlocal Reach', text: 'We connect you only with professionals in your neighborhood for faster response times and genuine community trust.' },
                            { icon: 'bi-star-fill', title: 'Rated & Reviewed', text: 'Real ratings from real customers help you make informed decisions. Transparency is at the heart of everything we do.' },
                        ].map((item, i) => (
                            <div className="col-md-4" key={i} data-aos="fade-up" data-aos-delay={i * 100}>
                                <div className="feature-item">
                                    <div className="feature-icon-box"><i className={`bi ${item.icon}`}></i></div>
                                    <h4>{item.title}</h4>
                                    <p>{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials */}
            <section id="testimonials" className="section-padding">
                <div className="container">
                    <div className="text-center mb-5" data-aos="fade-up">
                        <h2 className="mb-2">What Our Users Say</h2>
                        <p style={{ color: 'rgba(255,255,255,0.45)', maxWidth: '520px', margin: '0 auto' }}>Thousands of happy homeowners and service providers trust Zyphera every day.</p>
                    </div>
                    <div className="row g-4">
                        <div className="col-md-6" data-aos="fade-right" data-aos-delay="50">
                            <div className="testimonial-card">
                                <span className="testimonial-quote-mark">"</span>
                                <p className="testimonial-text">Finding an electrician was so easy with Zyphera. Within an hour of booking, a certified professional was at my door. The work was clean, fast, and affordable.</p>
                                <hr className="testimonial-divider" />
                                <div className="testimonial-author-name">Sarah Johnson</div>
                                <div className="testimonial-author-role">Homeowner, Kozhikode</div>
                            </div>
                        </div>
                        <div className="col-md-6" data-aos="fade-left" data-aos-delay="150">
                            <div className="testimonial-card">
                                <span className="testimonial-quote-mark">"</span>
                                <p className="testimonial-text">As a professional tutor, this platform has allowed me to grow my client base and earn more — all while working close to home.</p>
                                <hr className="testimonial-divider" />
                                <div className="testimonial-author-name">David Miller</div>
                                <div className="testimonial-author-role">Academic Tutor, Calicut University</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    )
}
