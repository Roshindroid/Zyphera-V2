import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { useCart } from '../context/CartContext'
import BookingModal from '../components/BookingModal'

export default function Cart() {
    const navigate = useNavigate()
    const { refreshCartCount } = useCart()
    const [items, setItems] = useState([])
    const [total, setTotal] = useState(0)
    const [bookingService, setBookingService] = useState(null)

    const fetchCart = () => {
        api.get('/cart/').then(r => {
            setItems(r.data.items)
            setTotal(r.data.total_price)
        }).catch(() => {})
    }

    useEffect(() => { fetchCart() }, [])

    const removeItem = async (pk) => {
        await api.delete(`/cart/remove/${pk}/`)
        fetchCart()
        await refreshCartCount()
    }

    const handleBooked = async (service) => {
        // remove the booked item from cart
        const cartItem = items.find(i => i.service.id === service.id)
        if (cartItem) await removeItem(cartItem.id)
    }

    return (
        <>
            {bookingService && (
                <BookingModal
                    service={bookingService}
                    onClose={() => setBookingService(null)}
                    onBooked={() => handleBooked(bookingService)}
                />
            )}

            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 mb-4">
                <div className="container">
                    <Link className="navbar-brand brand-name" to="/" style={{ fontSize: '1.5rem', color: '#007bff' }}>Zyphera</Link>
                    <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                        <i className="bi bi-arrow-left me-1"></i>Back
                    </button>
                </div>
            </nav>

            <div className="container py-5">
                <nav aria-label="breadcrumb">
                    <ol className="breadcrumb">
                        <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                        <li className="breadcrumb-item active">Cart</li>
                    </ol>
                </nav>

                <h2 className="fw-bold mb-4">Your Cart</h2>

                {items.length > 0 ? (
                    <div className="row">
                        <div className="col-lg-8">
                            {items.map(item => (
                                <div key={item.id} className="card mb-3 border-0 shadow-sm overflow-hidden">
                                    <div className="row g-0">
                                        <div className="col-md-3 bg-light d-flex align-items-center justify-content-center" style={{ minHeight: '120px' }}>
                                            {item.service.image_url
                                                ? <img src={item.service.image_url} className="img-fluid h-100 object-fit-cover" alt={item.service.title} />
                                                : <i className="bi bi-briefcase-fill text-primary fs-1"></i>}
                                        </div>
                                        <div className="col-md-9">
                                            <div className="card-body">
                                                <div className="d-flex justify-content-between align-items-start">
                                                    <div>
                                                        <h5 className="card-title fw-bold mb-1">{item.service.title}</h5>
                                                        <p className="text-muted small mb-2">
                                                            <i className="bi bi-person"></i> {item.service.seller_name}
                                                            <span className="ms-2"><i className="bi bi-tag"></i> {item.service.category?.name}</span>
                                                        </p>
                                                        <h6 className="text-primary fw-bold">₹{item.service.price} <small className="text-muted">/ {item.service.price_unit}</small></h6>
                                                    </div>
                                                    <button className="btn btn-sm btn-outline-danger border-0" onClick={() => removeItem(item.id)}>
                                                        <i className="bi bi-trash"></i>
                                                    </button>
                                                </div>
                                                <button
                                                    className="btn btn-primary btn-sm rounded-pill px-3 mt-2"
                                                    onClick={() => setBookingService(item.service)}
                                                >
                                                    Book Now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="col-lg-4">
                            <div className="card border-0 shadow-sm sticky-top" style={{ top: '120px' }}>
                                <div className="card-body p-4">
                                    <h5 className="fw-bold mb-4">Summary</h5>
                                    <div className="d-flex justify-content-between mb-2">
                                        <span className="text-muted">Subtotal ({items.length} service{items.length > 1 ? 's' : ''})</span>
                                        <span>₹{total}</span>
                                    </div>
                                    <p className="text-muted small">Travel fees are calculated per booking based on your location.</p>
                                    <hr />
                                    <div className="d-flex justify-content-between mb-4">
                                        <span className="fw-bold">Estimated Total</span>
                                        <span className="fw-bold fs-5 text-primary">₹{total}+</span>
                                    </div>
                                    <p className="text-muted small text-center">Click "Book Now" on each service to confirm date, address, and final price.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-5">
                        <i className="bi bi-cart-dash text-muted" style={{ fontSize: '5rem' }}></i>
                        <h3 className="mt-4">Your cart is empty</h3>
                        <p className="text-muted mb-4">Looks like you haven't added any services yet.</p>
                        <Link to="/services" className="btn btn-primary px-4 py-2 rounded-pill shadow">Explore Services</Link>
                    </div>
                )}
            </div>
        </>
    )
}
