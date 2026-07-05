import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AOS from 'aos'
import 'aos/dist/aos.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../api/axios'

export default function About() {
    const [stats, setStats] = useState({ users_formatted: '...', pros_count: 0, category_count: 0, avg_rating: 4.8 })

    useEffect(() => {
        AOS.init({ duration: 650, once: true, offset: 70 })
        api.get('/about/stats/').then(r => setStats(r.data)).catch(() => {})
    }, [])

    return (
        <>
            <Navbar />

            <section className="page-hero">
                <div className="container" data-aos="fade-up">
                    <h1>About Zyphera</h1>
                    <p>Building trust between local communities and the professionals who serve them.</p>
                </div>
            </section>

            <section className="section-padding" style={{ background: 'linear-gradient(160deg, #f8faff 0%, #eef5ff 100%)' }}>
                <div className="container">
                    <div className="row align-items-center g-5">
                        <div className="col-lg-6 story-text" data-aos="fade-right">
                            <h2 className="mb-4">Our Story</h2>
                            <p className="about-lead">Connecting local communities with trusted service professionals since 2023.</p>
                            <p>Zyphera was born out of a simple goal: making reliable home services accessible while empowering local professionals. We bridge the gap between talent and need.</p>
                            <Link to="/register" className="btn btn-outline-primary">Join Our Community</Link>
                        </div>
                        <div className="col-lg-6" data-aos="fade-left" data-aos-delay="100">
                            <div className="about-visual-card">
                                <div className="about-icon-box"><i className="bi bi-patch-check-fill"></i></div>
                                <h4>Trusted by {stats.users_formatted}</h4>
                                <p>Homeowners and professionals trust Zyphera for their daily service needs.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section-padding why-section">
                <div className="container">
                    <div className="text-center mb-5" data-aos="fade-up">
                        <h2 className="mb-2">Zyphera in Numbers</h2>
                        <p className="text-muted" style={{ maxWidth: '520px', margin: '0 auto' }}>Our community keeps growing because trust works.</p>
                    </div>
                    <div className="row g-4">
                        {[
                            { number: stats.users_formatted, label: 'Happy Users' },
                            { number: stats.pros_count, label: 'Verified Professionals' },
                            { number: stats.category_count, label: 'Service Categories' },
                            { number: `${stats.avg_rating}★`, label: 'Average Rating' },
                        ].map((s, i) => (
                            <div key={i} className="col-6 col-lg-3" data-aos="fade-up" data-aos-delay={i * 50}>
                                <div className="stat-card">
                                    <div className="stat-number">{s.number}</div>
                                    <div className="stat-label">{s.label}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section-padding" style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #f8faff 100%)' }}>
                <div className="container">
                    <div className="text-center mb-5" data-aos="fade-up">
                        <h2 className="mb-2">Our Values</h2>
                        <p className="text-muted" style={{ maxWidth: '520px', margin: '0 auto' }}>Everything we build is guided by three core principles.</p>
                    </div>
                    <div className="row g-4">
                        {[
                            { icon: 'bi-shield-check', title: 'Trust & Safety', text: 'Every professional is background-verified, skill-tested and rated by real users before they can list on Zyphera. Your safety is non-negotiable.' },
                            { icon: 'bi-people-fill', title: 'Community First', text: 'We are hyperlocal by design. We connect you to professionals in your own neighborhood to build real, lasting community bonds.' },
                            { icon: 'bi-star-fill', title: 'Quality Always', text: 'We hold our professionals to the highest standards. If a service falls short, we make it right — guaranteed, every time.' },
                        ].map((v, i) => (
                            <div key={i} className="col-md-4" data-aos="fade-up" data-aos-delay={i * 100}>
                                <div className="value-card">
                                    <div className="value-icon"><i className={`bi ${v.icon}`}></i></div>
                                    <h4>{v.title}</h4>
                                    <p>{v.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section-padding why-section">
                <div className="container">
                    <div className="text-center mb-5" data-aos="fade-up">
                        <h2 className="mb-2">Meet the Team</h2>
                        <p className="text-muted" style={{ maxWidth: '520px', margin: '0 auto' }}>The people behind Zyphera are passionate about community, technology and trust.</p>
                    </div>
                    <div className="row g-4 justify-content-center">
                        {[
                            { name: 'Arjun Menon', role: 'Co-Founder & CEO', bio: 'Serial entrepreneur from Kozhikode with a passion for local economies and grassroots technology.', socials: ['bi-linkedin', 'bi-twitter-x'] },
                            { name: 'Priya Nair', role: 'Co-Founder & CTO', bio: 'Full-stack engineer and design thinker who built Zyphera\'s platform from the ground up with a focus on simplicity.', socials: ['bi-linkedin', 'bi-github'] },
                            { name: 'Rafi Ibrahim', role: 'Head of Operations', bio: 'Operations expert who manages professional onboarding, quality control and customer satisfaction across Kerala.', socials: ['bi-linkedin', 'bi-twitter-x'] },
                        ].map((t, i) => (
                            <div key={i} className="col-md-6 col-lg-4" data-aos="fade-up" data-aos-delay={i * 100}>
                                <div className="team-card">
                                    <div className="team-avatar"><i className="bi bi-person-fill"></i></div>
                                    <h5>{t.name}</h5>
                                    <div className="role">{t.role}</div>
                                    <p>{t.bio}</p>
                                    <div className="team-social">
                                        {t.socials.map((s, j) => <a key={j} href="#"><i className={`bi ${s}`}></i></a>)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section-padding" style={{ background: '#f8faff' }}>
                <div className="container" data-aos="fade-up">
                    <div className="cta-banner">
                        <h3>Ready to join the community?</h3>
                        <p>Whether you need a service or want to offer one — Zyphera is where it begins.</p>
                        <Link to="/register" className="btn-white">Get Started Free</Link>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    )
}
