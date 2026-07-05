import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

export default function Navbar() {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [scrolled, setScrolled] = useState(false)
    const { cartCount } = useCart()



    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])





    const handleLogout = async () => {
        await logout()
        navigate('/')
    }

    return (
        <nav className={`navbar navbar-expand-lg fixed-top py-0 ${scrolled ? 'navbar-scrolled navbar-light' : 'navbar-dark'}`}>
            <div className="container">
                <Link className="navbar-brand brand-name" to="/">Zyphera</Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNav">
                    <ul className="navbar-nav mx-auto align-items-center text-center">
                        <li className="nav-item"><Link className="nav-link" to="/">Home</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/services">Services</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/about">About</Link></li>
                        <li className="nav-item"><Link className="nav-link" to="/contact">Contact</Link></li>
                    </ul>
                    <div className="d-flex justify-content-center my-3 my-lg-0 align-items-center">
                        {user?.role === 'buyer' && (
                            <div className="me-3">
                                <Link to="/cart" className={`text-decoration-none position-relative ${scrolled ? 'text-dark' : 'text-white'}`}>
                                    <i className="bi bi-cart3 fs-4"></i>
                                    {cartCount > 0 && (
                                        <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '0.65rem' }}>{cartCount}</span>
                                    )}
                                </Link>
                            </div>
                        )}
                        {user ? (
                            <div className="dropdown">
                                <button className={`btn dropdown-toggle d-flex align-items-center gap-2 ${scrolled ? 'btn-outline-dark' : 'btn-outline-light'}`} type="button" data-bs-toggle="dropdown">
                                    <i className="bi bi-person-circle fs-5"></i>
                                    <span className="d-none d-sm-inline">{user.username}</span>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-end shadow border-0 mt-2">
                                    {user.role === 'seller' && <>
                                        <li><Link className="dropdown-item py-2" to="/seller/dashboard"><i className="bi bi-speedometer2 me-2"></i>Dashboard</Link></li>
                                        <li><Link className="dropdown-item py-2" to="/seller/requests"><i className="bi bi-chat-dots me-2"></i>Service Requests</Link></li>
                                        <li><Link className="dropdown-item py-2" to="/seller/profile"><i className="bi bi-person me-2"></i>Profile</Link></li>
                                    </>}
                                    {user.role === 'buyer' && <>
                                        <li><Link className="dropdown-item py-2" to="/buyer/dashboard"><i className="bi bi-speedometer2 me-2"></i>Dashboard</Link></li>
                                        <li><Link className="dropdown-item py-2" to="/buyer/profile"><i className="bi bi-person me-2"></i>Profile</Link></li>
                                    </>}
                                    {(user.role === 'admin' || user.role === 'super_admin') && <>
                                        <li><Link className="dropdown-item py-2" to="/admin/dashboard"><i className="bi bi-speedometer2 me-2"></i>Dashboard</Link></li>
                                    </>}
                                    <li><hr className="dropdown-divider" /></li>
                                    <li><button className="dropdown-item py-2 text-danger" onClick={handleLogout}><i className="bi bi-box-arrow-right me-2"></i>Logout</button></li>
                                </ul>
                            </div>
                        ) : (
                            <Link className="btn btn-primary px-4" to="/login">Login</Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    )
}
