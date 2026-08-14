import { useState } from 'react'
import api from '../api/axios'
import { toastAuto } from '../utils/toast'

export default function ReviewModal({ booking, onClose, onReviewed }) {
    const [rating, setRating] = useState(0)
    const [hovered, setHovered] = useState(0)
    const [comment, setComment] = useState('')
    const [submitting, setSubmitting] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!rating) return
        setSubmitting(true)
        try {
            await api.post('/reviews/', { booking_id: booking.id, rating, comment })
            toastAuto('success', 'Review submitted!', 'Thank you for your feedback.')
            onReviewed?.()
            onClose()
        } catch (err) {
            const msg = err.response?.data?.error || 'Failed to submit review.'
            toastAuto('error', 'Error', msg)
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <div className="modal fade show d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={onClose}>
            <div className="modal-dialog modal-dialog-centered" onClick={e => e.stopPropagation()}>
                <div className="modal-content border-0 shadow-lg rounded-4">
                    <div className="modal-header border-0 pt-4 px-4 pb-0">
                        <div>
                            <h5 className="fw-bold mb-0">Rate your experience</h5>
                            <small className="text-muted">{booking.service_title}</small>
                        </div>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>
                    <form onSubmit={handleSubmit}>
                        <div className="modal-body px-4 py-3">
                            <div className="text-center mb-3">
                                <div className="d-flex justify-content-center gap-2 mb-1">
                                    {[1, 2, 3, 4, 5].map(star => (
                                        <i
                                            key={star}
                                            className={`bi ${(hovered || rating) >= star ? 'bi-star-fill text-warning' : 'bi-star text-muted'}`}
                                            style={{ fontSize: '2rem', cursor: 'pointer' }}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHovered(star)}
                                            onMouseLeave={() => setHovered(0)}
                                        ></i>
                                    ))}
                                </div>
                                <small className="text-muted">
                                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][hovered || rating] || 'Select a rating'}
                                </small>
                            </div>
                            <div>
                                <label className="form-label small fw-bold">Comment <span className="text-muted fw-normal">(optional)</span></label>
                                <textarea
                                    className="form-control bg-light border-0"
                                    rows="3"
                                    placeholder="Share your experience..."
                                    value={comment}
                                    onChange={e => setComment(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="modal-footer border-0 px-4 pb-4 pt-0">
                            <button type="button" className="btn btn-light rounded-pill px-4" onClick={onClose}>Cancel</button>
                            <button type="submit" className="btn btn-primary rounded-pill px-4" disabled={!rating || submitting}>
                                {submitting ? <span className="spinner-border spinner-border-sm me-2"></span> : null}
                                Submit Review
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
