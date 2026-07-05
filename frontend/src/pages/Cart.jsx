import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axios'
import { toastAuto } from '../utils/toast'
import { useCart } from '../context/CartContext'

export default function Cart() {
    const navigate = useNavigate()
    const { refreshCartCount } = useCart()
    const [items, setItems] = useState([])
    const [total, setTotal] = useState(0)
    const [isCheckoutLoading, setIsCheckoutLoading] = useState(false)






    const clearCart = async (currentItems) => {
        // Best-effort server clear; fallback to deleting individual items.
        try {
            await api.post('/cart/clear/')
        } catch {
            // If cart clear endpoint doesn't exist, remove items one by one.
            await Promise.all(
                (currentItems || []).map((it) => api.delete(`/cart/remove/${it.id}/`))
            )
        }

        setItems([])
        setTotal(0)
        await refreshCartCount()
    }



    const handleCheckout = async () => {
        if (!items.length) return
        try {
            setIsCheckoutLoading(true)


            const createPayloads = items.map((it) => ({
                service_id: it.service.id,
                booking_date: new Date().toISOString(),
                total_price: it.service.price,
                address: '',
                notes: '',
            }))

            await Promise.all(createPayloads.map((payload) => api.post('/bookings/create/', payload)))

            toastAuto('success', 'Booking confirmed!', 'We’ve received your request.')


            // Empty cart after successful checkout
            await clearCart(items)

            // Redirect to services (not bookings)
            setTimeout(() => navigate('/services'), 800)
        } catch (e) {
            console.error(e)
            toastAuto('error', 'Checkout failed!', 'Please try again.')

        } finally {
            setIsCheckoutLoading(false)
        }
    }

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


    return (
        <>
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

                <h2 className="fw-bold mb-4">Your Shopping Cart</h2>



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
                                        <span className="text-muted">Subtotal</span>
                                        <span>₹{total}</span>
                                    </div>
                                    <div className="d-flex justify-content-between mb-4">
                                        <span className="text-muted">Service Fee</span>
                                        <span className="text-success">Free</span>
                                    </div>
                                    <hr />
                                    <div className="d-flex justify-content-between mb-4">
                                        <span className="fw-bold">Total</span>
                                        <span className="fw-bold fs-4 text-primary">₹{total}</span>
                                    </div>
                                    <button
                                        className="btn btn-primary btn-lg w-100 rounded-pill py-3"
                                        onClick={handleCheckout}
                                        disabled={items.length === 0 || isCheckoutLoading}
                                    >
                                        {isCheckoutLoading ? 'Sending request...' : 'Proceed to Checkout'}
                                    </button>
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

