import { useEffect, useState } from 'react'
import AOS from 'aos'
import 'aos/dist/aos.css'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import api from '../api/axios'
import { toast } from '../utils/toast'

import { validateEmail } from '../utils/validators'

export default function Contact() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
    const [sent, setSent] = useState(false)

    useEffect(() => {
        AOS.init({ duration: 650, once: true, offset: 70 })
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()

        const nameOk = form.name.trim().length > 0
        const emailOk = validateEmail(form.email)
        const subjectOk = !!form.subject
        const messageOk = form.message.trim().length > 10

        if (!nameOk) return toast('error', 'Invalid name', 'Please enter your full name.')
        if (!emailOk) return toast('error', 'Invalid email', 'Please enter a valid email address.')
        if (!subjectOk) return toast('error', 'Invalid subject', 'Please choose a subject.')
        if (!messageOk) return toast('error', 'Message too short', 'Please write at least 11 characters.')

        setSent(true)
        setForm({ name: '', email: '', subject: '', message: '' })
        setTimeout(() => setSent(false), 3000)


    }

    return (
        <>
            <Navbar />

            <section className="page-hero">
                <div className="container" data-aos="fade-up">
                    <h1>Get in Touch</h1>
                    <p>We'd love to hear from you. Our team is always ready to help.</p>
                </div>
            </section>

            <section className="section-padding" style={{ background: 'linear-gradient(135deg, #f0f7ff 0%, #f8faff 100%)' }}>
                <div className="container">
                    <div className="row g-4">
                        {[
                            { icon: 'bi-geo-alt-fill', title: 'Our Office', lines: ['Zyphera HQ', 'Medical College Road, Calicut', 'Kerala, India – 673 008'] },
                            { icon: 'bi-telephone-fill', title: 'Call Us', lines: ['+91 98765 43210', '+91 80123 45678', 'Mon–Sat, 9 AM – 7 PM'] },
                            { icon: 'bi-envelope-fill', title: 'Email Us', lines: ['hello@zyphera.com', 'support@zyphera.com', 'We reply within 24 hours'] },
                        ].map((c, i) => (
                            <div key={i} className="col-md-4" data-aos="fade-up" data-aos-delay={i * 100}>
                                <div className="info-card">
                                    <div className="info-icon"><i className={`bi ${c.icon}`}></i></div>
                                    <h5>{c.title}</h5>
                                    <p>{c.lines.map((l, j) => <span key={j}>{l}{j < c.lines.length - 1 && <br />}</span>)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="section-padding" style={{ background: '#fff' }}>
                <div className="container">
                    <div className="row g-5 align-items-start">
                        <div className="col-lg-7" data-aos="fade-right">
                            <div className="contact-form-card">
                                <h3>Send Us a Message</h3>
                                <p className="subtitle">Fill in the form and we'll get back to you as soon as possible.</p>
                                {sent && <div className="alert alert-success">Message sent! We'll get back to you within 24 hours.</div>}
                                <form onSubmit={handleSubmit}>
                                    <div className="row g-3 mb-3">
                                        <div className="col-sm-6">
                                            <label className="form-label">Full Name</label>
                                            <input type="text" className="form-control" placeholder="John Doe" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
                                        </div>
                                        <div className="col-sm-6">
                                            <label className="form-label">Email Address</label>
                                            <input type="email" className="form-control" placeholder="email@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
                                        </div>
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Subject</label>
                                        <select className="form-select" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required>
                                            <option value="" disabled>Choose a subject</option>
                                            <option value="general">General Inquiry</option>
                                            <option value="booking">Booking Help</option>
                                            <option value="professional">Become a Professional</option>
                                            <option value="complaint">Complaint / Feedback</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>
                                    <div className="mb-4">
                                        <label className="form-label">Message</label>
                                        <textarea className="form-control" rows="5" placeholder="Write your message here..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required></textarea>
                                    </div>
                                    <button type="submit" className="btn btn-primary w-100">Send Message</button>
                                </form>
                            </div>
                        </div>

                        <div className="col-lg-5" data-aos="fade-left" data-aos-delay={100}>
                            <div className="contact-info-side ps-lg-3">
                                <h4>How can we help?</h4>
                                {[
                                    { icon: 'bi-headset', title: 'Customer Support', text: 'For issues with bookings, payments or finding professionals in your area.' },
                                    { icon: 'bi-person-badge', title: 'Join as a Professional', text: 'Interested in listing your services on Zyphera? We\'d love to have you.' },
                                    { icon: 'bi-briefcase', title: 'Business & Partnerships', text: 'Looking to collaborate, partner or invest in Zyphera? Reach out to our team.' },
                                    { icon: 'bi-megaphone', title: 'Press & Media', text: 'Media queries, press kits and interview requests — contact hello@zyphera.com.' },
                                ].map((d, i) => (
                                    <div key={i} className="contact-detail">
                                        <div className="contact-detail-icon"><i className={`bi ${d.icon}`}></i></div>
                                        <div className="contact-detail-text">
                                            <strong>{d.title}</strong>
                                            <span>{d.text}</span>
                                        </div>
                                    </div>
                                ))}

                                <div className="mt-4 d-flex gap-2">
                                    {['bi-facebook', 'bi-twitter-x', 'bi-instagram', 'bi-linkedin'].map((icon, i) => (
                                        <a key={i} href="#" className="social-icon-btn"><i className={`bi ${icon}`}></i></a>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="section-padding faq-section">
                <div className="container">
                    <div className="text-center mb-5" data-aos="fade-up">
                        <h2 className="mb-2">Frequently Asked Questions</h2>
                        <p className="text-muted" style={{ maxWidth: '520px', margin: '0 auto' }}>Quick answers to the questions we hear most often.</p>
                    </div>
                    <div className="row justify-content-center">
                        <div className="col-lg-8" data-aos="fade-up" data-aos-delay={50}>
                            <div className="accordion" id="faqAccordion">
                                {[
                                    { id: 'faq1', q: 'How do I book a service on Zyphera?', a: 'Simply create a free account, browse the services in your category, and click "Book Now" on the service you need. You\'ll be connected with a verified professional in your area within hours.', open: true },
                                    { id: 'faq2', q: 'Are all professionals on Zyphera background-verified?', a: 'Yes. Every professional goes through a multi-step verification process including identity check, skill test and reference verification before they can list services on our platform.' },
                                    { id: 'faq3', q: 'How do I sign up as a service professional?', a: 'Register on Zyphera and select "Seller – I provide services" as your role. Our team will then reach out to complete the verification process and help you set up your profile.' },
                                    { id: 'faq4', q: 'What areas does Zyphera currently serve?', a: 'We currently serve Kozhikode (Calicut) and surrounding areas in Kerala. We are expanding to Thrissur, Kochi and Thiruvananthapuram in 2025.' },
                                    { id: 'faq5', q: 'What if I\'m not satisfied with a service?', a: 'Your satisfaction is guaranteed. If you\'re not happy with a service, contact our support team within 48 hours and we will arrange a re-service or a full refund — no questions asked.' },
                                ].map(faq => (
                                    <div key={faq.id} className="accordion-item">
                                        <h2 className="accordion-header">
                                            <button className={`accordion-button ${faq.open ? '' : 'collapsed'}`} type="button" data-bs-toggle="collapse" data-bs-target={`#${faq.id}`}>
                                                {faq.q}
                                            </button>
                                        </h2>
                                        <div id={faq.id} className={`accordion-collapse collapse ${faq.open ? 'show' : ''}`} data-bs-parent="#faqAccordion">
                                            <div className="accordion-body">{faq.a}</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <Footer />
        </>
    )
}

