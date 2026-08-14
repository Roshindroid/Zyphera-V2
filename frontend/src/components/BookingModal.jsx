import { useState, useEffect } from 'react'
import api from '../api/axios'
import { useLocation } from '../context/LocationContext'
import { toastAuto } from '../utils/toast'

export default function BookingModal({ service, onClose, onBooked }) {
    const { buyerLocation } = useLocation()

    const [form, setForm] = useState({
        booking_date: '',
        address: buyerLocation?.address || '',
        notes: '',
    })
    const [submitting, setSubmitting] = useState(false)

    // fee breakdown derived from service (populated by NearbyServicesView or ServiceSerializer)
    const travelFee = parseFloat(service.travel_fee ?? 0)
    const platformFee = parseFloat(service.platform_fee ?? service.location_data?.platform_fee ?? 0)
    const basePrice = parseFloat(service.price)
    const total = (basePrice + travelFee + platformFee).toFixed(2)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!form.booking_date) return
        setSubmitting(true)
        try {
            await api.post('/bookings/create/', {
                service_id: service.id,
                booking_date: form.booking_date,
                address: form.address,
                notes: form.notes,
                buyer_lat: buyerLocation?.lat ?? null,
                buyer_lng: buyerLocation?.lng ?? null,
            })
            toastAuto('success', 'Booking confirmed!', 'The seller will review your request.')
            onBooked?.()
            onClose()
        } catch {
            toastAuto('error', 'Booking failed', 'Please try again.')
        } finally {
            setSubmitting(false)
        }
    }

    // min datetime = now (no past bookings)
    const minDate = new Date(Date.now() + 60000).toISOString().slice(0, 16)

    return (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                <div className="modal-content border-0 shadow-lg rounded-4">
                    <div className="modal-header border-0 pt-4 px-4 pb-0">
                        <div>
                            <h5 className="fw-bold mb-0">{service.title}</h5>
                            <small className="text-muted">{service.category?.name}</small>
                        </div>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        <div className="modal-body px-4 py-3">
                            {/* Price breakdown */}
                            <div className="bg-light rounded-3 p-3 mb-3">
                                <div className="d-flex justify-content-between small mb-1">
                                    <span className="text-muted">Base price</span>
                                    <span>₹{basePrice}/{service.price_unit}</span>
                                </div>
                                {travelFee > 0 && (
                                    <div className="d-flex justify-content-between small mb-1">
                                        <span className="text-muted">Travel fee</span>
                                        <span>₹{travelFee.toFixed(2)}</span>
                                    </div>
                                )}
                                {platformFee > 0 && (
                                    <div className="d-flex justify-content-between small mb-1">
                                        <span className="text-muted">Platform fee</span>
                                        <span>₹{platformFee.toFixed(2)}</span>
                                    </div>
                                )}
                                {travelFee === 0 && (
                                    <div className="d-flex justify-content-between small mb-1">
                                        <span className="text-muted">Travel</span>
                                        <span className="text-success">Free</span>
                                    </div>
                                )}
                                <hr className="my-2" />
                                <div className="d-flex justify-content-between fw-bold">
                                    <span>Total {!buyerLocation && <span className="text-muted fw-normal" style={{fontSize:'0.7rem'}}>(estimate)</span>}</span>
                                    <span className="text-primary">₹{total}</span>
                                </div>
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold">Date & Time <span className="text-danger">*</span></label>
                                <input
                                    type="datetime-local"
                                    className="form-control bg-light border-0"
                                    min={minDate}
                                    value={form.booking_date}
                                    onChange={e => setForm({ ...form, booking_date: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label small fw-bold">Service Address <span className="text-danger">*</span></label>
                                <input
                                    type="text"
                                    className="form-control bg-light border-0"
                                    placeholder="Where should the provider come?"
                                    value={form.address}
                                    onChange={e => setForm({ ...form, address: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="mb-0">
                                <label className="form-label small fw-bold">Notes <span className="text-muted fw-normal">(optional)</span></label>
                                <textarea
                                    className="form-control bg-light border-0"
                                    rows="2"
                                    placeholder="Any special instructions..."
                                    value={form.notes}
                                    onChange={e => setForm({ ...form, notes: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="modal-footer border-0 px-4 pb-4 pt-0">
                            <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={submitting}>
                                {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                                Confirm Booking
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
