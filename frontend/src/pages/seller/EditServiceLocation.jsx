import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import api from '../../api/axios'
import MapPicker from '../../components/MapPicker'
import { toast, toastAuto } from '../../utils/toast'

export default function EditServiceLocation() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [locForm, setLocForm] = useState({
        address: '', latitude: '', longitude: '',
        radius_km: 10, free_radius_km: 2,
        price_per_km: 0, platform_fee: 25,
        peak_hour_pct: 0, weekend_pct: 0, emergency_fee: 0,
    })
    const [serviceTitle, setServiceTitle] = useState('')

    useEffect(() => {
        api.get('/seller/services/').then(r => {
            const service = r.data.find(s => s.id === parseInt(id))
            if (!service) return
            setServiceTitle(service.title)
            if (service.location_data) {
                setLocForm(prev => ({ ...prev, ...service.location_data }))
            }
        }).catch(() => {})
    }, [id])

    const handleSubmit = async (e) => {
        e.preventDefault()
        const hasCoords = locForm.latitude !== '' && locForm.latitude !== null && locForm.latitude !== undefined &&
                          locForm.longitude !== '' && locForm.longitude !== null && locForm.longitude !== undefined
        if (!hasCoords) {
            toast('error', 'Location Required', 'Please pin a location on the map.')
            return
        }
        setLoading(true)
        try {
            await api.patch(`/seller/services/${id}/location/`, locForm)
            await toastAuto('success', 'Location Saved', 'Service location updated successfully.')
            navigate('/seller/services')
        } catch (err) {
            toast('error', 'Failed', err.response?.data?.error || 'Could not save location.')
        } finally {
            setLoading(false)
        }
    }

    const hasCoords = locForm.latitude !== '' && locForm.latitude !== null && locForm.latitude !== undefined &&
                      locForm.longitude !== '' && locForm.longitude !== null && locForm.longitude !== undefined

    return (
        <div className="bg-light min-vh-100 pb-5">
            {/* Header Navbar */}
            <nav className="navbar navbar-expand-lg navbar-light bg-white border-bottom py-3 mb-4 sticky-top shadow-sm">
                <div className="container">
                    <Link className="navbar-brand brand-name d-flex align-items-center gap-2" to="/" style={{ fontSize: '1.4rem' }}>
                        <span className="badge bg-primary rounded-circle p-2" style={{ width: 34, height: 34, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                            <i className="bi bi-geo-alt-fill text-white fs-6"></i>
                        </span>
                        Zyphera <span className="text-muted fw-normal fs-6">| Provider Hub</span>
                    </Link>
                    <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm rounded-pill px-3 d-flex align-items-center gap-1">
                        <i className="bi bi-arrow-left"></i> Back to Services
                    </button>
                </div>
            </nav>

            <div className="container">
                {/* Hero Header */}
                <div className="row justify-content-center mb-4">
                    <div className="col-lg-10">
                        <div className="card border-0 rounded-4 shadow-sm p-4 text-white" style={{ background: 'linear-gradient(135deg, #0d6efd 0%, #0a58ca 100%)' }}>
                            <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
                                <div>
                                    <span className="badge bg-white text-primary rounded-pill px-3 py-2 mb-2 fw-semibold">
                                        <i className="bi bi-pin-map-fill me-1"></i> Location & Radius Config
                                    </span>
                                    <h2 className="fw-bold mb-1">{serviceTitle || 'Edit Service Location'}</h2>
                                    <p className="mb-0 text-white-50 small">Configure your service origin pin, coverage radius, travel rates, and surge pricing.</p>
                                </div>
                                <div className="text-md-end">
                                    <span className={`badge ${hasCoords ? 'bg-success-subtle text-success border border-success-subtle' : 'bg-warning-subtle text-warning border border-warning-subtle'} rounded-pill px-3 py-2 fs-6`}>
                                        <i className={`bi ${hasCoords ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-1`}></i>
                                        {hasCoords ? 'Location Pinned' : 'Pin Required'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Main Layout */}
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        <form onSubmit={handleSubmit} className="row g-4">

                            {/* Section 1: Map Picker Card */}
                            <div className="col-12">
                                <div className="card border-0 shadow-sm rounded-4 p-4">
                                    <div className="d-flex align-items-center justify-content-between mb-3">
                                        <div className="d-flex align-items-center gap-2">
                                            <div className="rounded-3 p-2 bg-primary-subtle text-primary">
                                                <i className="bi bi-map-fill fs-5"></i>
                                            </div>
                                            <div>
                                                <h5 className="fw-bold mb-0">Service Origin & Radius Pin</h5>
                                                <p className="text-muted small mb-0">Search an address or drag the marker to your central operating point.</p>
                                            </div>
                                        </div>
                                        {hasCoords && (
                                            <span className="text-muted small d-none d-md-inline">
                                                <i className="bi bi-crosshair me-1 text-primary"></i>
                                                {parseFloat(locForm.latitude).toFixed(4)}, {parseFloat(locForm.longitude).toFixed(4)}
                                            </span>
                                        )}
                                    </div>
                                    <MapPicker value={locForm} onChange={setLocForm} />
                                </div>
                            </div>

                            {/* Section 2: Coverage Radius Settings */}
                            <div className="col-md-6">
                                <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <div className="rounded-3 p-2 bg-info-subtle text-info">
                                            <i className="bi bi-compass-fill fs-5 text-dark"></i>
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-0">Coverage Area</h5>
                                            <p className="text-muted small mb-0">Define your travel boundaries</p>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Service Radius (km)</label>
                                        <div className="input-group">
                                            <input type="number" className="form-control bg-light border-0 py-2" min="1" value={locForm.radius_km}
                                                onChange={e => setLocForm(p => ({ ...p, radius_km: e.target.value }))} required />
                                            <span className="input-group-text bg-light border-0 text-muted">km</span>
                                        </div>
                                        <div className="form-text small">Maximum distance you are willing to travel to customers.</div>
                                    </div>

                                    <div className="mb-0">
                                        <label className="form-label small fw-bold">Free Travel Radius (km)</label>
                                        <div className="input-group">
                                            <input type="number" className="form-control bg-light border-0 py-2" min="0" value={locForm.free_radius_km}
                                                onChange={e => setLocForm(p => ({ ...p, free_radius_km: e.target.value }))} required />
                                            <span className="input-group-text bg-light border-0 text-muted">km</span>
                                        </div>
                                        <div className="form-text small">No extra travel fee is charged within this distance.</div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Pricing & Fees */}
                            <div className="col-md-6">
                                <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <div className="rounded-3 p-2 bg-success-subtle text-success">
                                            <i className="bi bi-cash-stack fs-5"></i>
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-0">Travel & Platform Rates</h5>
                                            <p className="text-muted small mb-0">Set extra charges beyond free radius</p>
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label className="form-label small fw-bold">Price Per Km (₹)</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-0 text-muted">₹</span>
                                            <input type="number" className="form-control bg-light border-0 py-2" min="0" step="0.5" value={locForm.price_per_km}
                                                onChange={e => setLocForm(p => ({ ...p, price_per_km: e.target.value }))} required />
                                            <span className="input-group-text bg-light border-0 text-muted">/ km</span>
                                        </div>
                                        <div className="form-text small">Fee charged per additional kilometer beyond free travel limit.</div>
                                    </div>

                                    <div className="mb-0">
                                        <label className="form-label small fw-bold">Platform Fee (₹)</label>
                                        <div className="input-group">
                                            <span className="input-group-text bg-light border-0 text-muted">₹</span>
                                            <input type="number" className="form-control bg-light border-0 py-2" min="0" value={locForm.platform_fee}
                                                onChange={e => setLocForm(p => ({ ...p, platform_fee: e.target.value }))} required />
                                        </div>
                                        <div className="form-text small">Standard fixed platform/handling fee.</div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 4: Surge & Emergency Fees */}
                            <div className="col-12">
                                <div className="card border-0 shadow-sm rounded-4 p-4">
                                    <div className="d-flex align-items-center gap-2 mb-3">
                                        <div className="rounded-3 p-2 bg-warning-subtle text-warning">
                                            <i className="bi bi-lightning-charge-fill fs-5"></i>
                                        </div>
                                        <div>
                                            <h5 className="fw-bold mb-0">Surge & Emergency Modifiers</h5>
                                            <p className="text-muted small mb-0">Optional surge adjustments for peak hours, weekends, or emergency dispatch.</p>
                                        </div>
                                    </div>

                                    <div className="row g-3">
                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold">Peak Hour Surge (%)</label>
                                            <div className="input-group">
                                                <input type="number" className="form-control bg-light border-0 py-2" min="0" max="100" value={locForm.peak_hour_pct}
                                                    onChange={e => setLocForm(p => ({ ...p, peak_hour_pct: e.target.value }))} />
                                                <span className="input-group-text bg-light border-0 text-muted">%</span>
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold">Weekend Surge (%)</label>
                                            <div className="input-group">
                                                <input type="number" className="form-control bg-light border-0 py-2" min="0" max="100" value={locForm.weekend_pct}
                                                    onChange={e => setLocForm(p => ({ ...p, weekend_pct: e.target.value }))} />
                                                <span className="input-group-text bg-light border-0 text-muted">%</span>
                                            </div>
                                        </div>

                                        <div className="col-md-4">
                                            <label className="form-label small fw-bold">Emergency Fee (₹)</label>
                                            <div className="input-group">
                                                <span className="input-group-text bg-light border-0 text-muted">₹</span>
                                                <input type="number" className="form-control bg-light border-0 py-2" min="0" value={locForm.emergency_fee}
                                                    onChange={e => setLocForm(p => ({ ...p, emergency_fee: e.target.value }))} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Section 5: Live Pricing Preview Card */}
                            <div className="col-12">
                                <div className="card border-0 shadow-sm rounded-4 p-4" style={{ background: '#f8faff' }}>
                                    <h6 className="fw-bold mb-3 d-flex align-items-center gap-2 text-primary">
                                        <i className="bi bi-calculator-fill"></i> Live Pricing Summary Preview
                                    </h6>
                                    <div className="row g-3 text-muted small">
                                        <div className="col-md-3">
                                            <div className="bg-white rounded-3 p-3 border">
                                                <span className="d-block text-muted mb-1">Max Travel Distance</span>
                                                <strong className="fs-6 text-dark">{locForm.radius_km || 0} km</strong>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="bg-white rounded-3 p-3 border">
                                                <span className="d-block text-muted mb-1">Free Travel Range</span>
                                                <strong className="fs-6 text-dark">0 to {locForm.free_radius_km || 0} km</strong>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="bg-white rounded-3 p-3 border">
                                                <span className="d-block text-muted mb-1">Extra Travel Fee</span>
                                                <strong className="fs-6 text-dark">₹{locForm.price_per_km || 0} / km</strong>
                                            </div>
                                        </div>
                                        <div className="col-md-3">
                                            <div className="bg-white rounded-3 p-3 border">
                                                <span className="d-block text-muted mb-1">Base Platform Fee</span>
                                                <strong className="fs-6 text-dark">₹{locForm.platform_fee || 0}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="col-12 d-flex gap-3">
                                <button type="button" className="btn btn-light rounded-pill py-3 px-4 fw-bold text-muted border" style={{ flex: 1 }} onClick={() => navigate(-1)}>
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-primary rounded-pill py-3 px-4 fw-bold" style={{ flex: 2 }} disabled={loading}>
                                    {loading ? (
                                        <>
                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                            Saving Location...
                                        </>
                                    ) : (
                                        <>
                                            <i className="bi bi-check2-circle me-2"></i>
                                            Save Service Location
                                        </>
                                    )}
                                </button>
                            </div>

                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
