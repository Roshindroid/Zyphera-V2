import { Link } from 'react-router-dom'

export default function Footer() {
    return (
        <footer id="contact" className="text-white py-5">
            <div className="container">
                <div className="row g-5 mb-4">
                    <div className="col-lg-4">
                        <div className="brand-name mb-3">Zyphera</div>
                        <p className="text-muted small" style={{ maxWidth: '280px' }}>Your trusted hyperlocal marketplace connecting communities with reliable home service professionals.</p>
                        <div className="d-flex gap-2 mt-4">
                            <a href="#" className="social-icon-btn"><i className="bi bi-facebook"></i></a>
                            <a href="#" className="social-icon-btn"><i className="bi bi-twitter-x"></i></a>
                            <a href="#" className="social-icon-btn"><i className="bi bi-instagram"></i></a>
                            <a href="#" className="social-icon-btn"><i className="bi bi-linkedin"></i></a>
                        </div>
                    </div>
                    <div className="col-6 col-lg-2">
                        <h5>Quick Links</h5>
                        <ul className="list-unstyled">
                            <li><Link to="/">Home</Link></li>
                            <li><Link to="/services">Services</Link></li>
                            <li><Link to="/about">About</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                        </ul>
                    </div>
                    <div className="col-6 col-lg-2">
                        <h5>Account</h5>
                        <ul className="list-unstyled">
                            <li><Link to="/login">Sign In</Link></li>
                            <li><Link to="/register">Register</Link></li>
                            <li><Link to="/services">Post a Service</Link></li>
                            <li><Link to="/buyer/dashboard">My Bookings</Link></li>
                        </ul>
                    </div>
                    <div className="col-lg-4">
                        <h5>Contact Us</h5>
                        <div className="footer-contact-item"><i className="bi bi-geo-alt-fill"></i><span>Calicut, Kerala, India</span></div>
                        <div className="footer-contact-item"><i className="bi bi-envelope-fill"></i><span>hello@zyphera.com</span></div>
                        <div className="footer-contact-item"><i className="bi bi-telephone-fill"></i><span>+91 98765 43210</span></div>
                    </div>
                </div>
                <hr />
                <div className="text-center">
                    <small>&copy; 2026 Zyphera. All rights reserved.</small>
                </div>
            </div>
        </footer>
    )
}
