import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../api/axios'
import MapPicker from '../../components/MapPicker'
import { toast, toastAuto } from '../../utils/toast'

export default function AddService() {
    const navigate = useNavigate()
    const [categories, setCategories] = useState([])
    const [form, setForm] = useState({ title: '', description: '', price: '', price_unit: 'hr', category_id: '' })
    const [image, setImage] = useState(null)
    const [locForm, setLocForm] = useState({
        address: '', latitude: '', longitude: '',
        radius_km: 10, free_radius_km: 2,
        price_per_km: 0, platform_fee: 25,
        peak_hour_pct: 0, weekend_pct: 0, emergency_fee: 0,
    })

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        api.get('/categories/').then(r => setCategories(r.data)).catch(() => {})
    }, [])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            const data = new FormData()
            Object.entries(form).forEach(([k, v]) => data.append(k, v))
            if (image) data.append('image', image)
            if (locForm.latitude && locForm.longitude) {
                Object.entries(locForm).forEach(([k, v]) => data.append(k, v))
            }
            await api.post('/seller/services/', data)
            await toastAuto('success', 'Service Published', `"${form.title}" is now live.`)
            navigate('/seller/services')
        } catch (err) {
            toast('error', 'Failed', err.response?.data?.error || 'Could not create service. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-light min-vh-100">
            <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm py-3 mb-5">
                <div className="container">
                    <Link className="navbar-brand brand-name" to="/" style={{ fontSize: '1.5rem' }}>Zyphera</Link>
                    <button onClick={() => navigate(-1)} className="btn btn-outline-secondary btn-sm rounded-pill px-3">
                        <i className="bi bi-arrow-left me-1"></i>Back
                    </button>
                </div>
            </nav>

            <div className="container pb-5">
                <div className="row justify-content-center">
                    <div className="col-lg-8">
                        <div className="contact-form-card border-0 shadow-sm">
                            <h3 className="fw-bold mb-4">Create a New Service</h3>
                            <form onSubmit={handleSubmit} className="row g-4">
                                <div className="col-12">
                                    <label className="form-label">Service Title</label>
                                    <input type="text" className="form-control" placeholder="e.g. Professional Kitchen Deep Cleaning" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required />
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Category</label>
                                    <select className="form-select" value={form.category_id} onChange={e => setForm({ ...form, category_id: e.target.value })} required>
                                        <option value="" disabled>Select category</option>
                                        {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Price (₹)</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white">₹</span>
                                        <input type="number" className="form-control" placeholder="499" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} required />
                                        <select className="form-select" style={{ maxWidth: 130 }} value={form.price_unit} onChange={e => setForm({ ...form, price_unit: e.target.value })}>
                                            <option value="hr">per hour</option>
                                            <option value="day">per day</option>
                                            <option value="visit">per visit</option>
                                            <option value="job">per job</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Service Image</label>
                                    <input type="file" className="form-control" accept="image/*" onChange={e => setImage(e.target.files[0])} />
                                </div>
                                <div className="col-12">
                                    <label className="form-label">Service Description</label>
                                    <textarea className="form-control" rows="5" placeholder="Describe what you offer in detail..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required></textarea>
                                </div>

                                <div className="col-12 mt-3">
                                    <h5 className="fw-bold mb-0">Service Location</h5>
                                    <p className="text-muted small mb-3">Where does the technician travel from? This is used to calculate distance and travel fees.</p>
                                    <MapPicker value={locForm} onChange={setLocForm} />
                                </div>

                                <div className="col-12 mt-2">
                                    <h5 className="fw-bold mb-0">Coverage & Pricing Rules</h5>
                                    <p className="text-muted small mb-3">Optional. Configure radius and travel fees.</p>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Service Radius (km)</label>
                                    <input type="number" className="form-control" min="1" value={locForm.radius_km}
                                        onChange={e => setLocForm(p => ({ ...p, radius_km: e.target.value }))} />
                                    <div className="form-text">Max distance you'll travel to serve a customer.</div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Free Travel Radius (km)</label>
                                    <input type="number" className="form-control" min="0" value={locForm.free_radius_km}
                                        onChange={e => setLocForm(p => ({ ...p, free_radius_km: e.target.value }))} />
                                    <div className="form-text">No travel fee within this distance.</div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Price Per Km (₹)</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white">₹</span>
                                        <input type="number" className="form-control" min="0" value={locForm.price_per_km}
                                            onChange={e => setLocForm(p => ({ ...p, price_per_km: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="col-md-6">
                                    <label className="form-label">Platform Fee (₹)</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white">₹</span>
                                        <input type="number" className="form-control" min="0" value={locForm.platform_fee}
                                            onChange={e => setLocForm(p => ({ ...p, platform_fee: e.target.value }))} />
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Peak Hour Surge (%)</label>
                                    <input type="number" className="form-control" min="0" max="100" value={locForm.peak_hour_pct}
                                        onChange={e => setLocForm(p => ({ ...p, peak_hour_pct: e.target.value }))} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Weekend Surge (%)</label>
                                    <input type="number" className="form-control" min="0" max="100" value={locForm.weekend_pct}
                                        onChange={e => setLocForm(p => ({ ...p, weekend_pct: e.target.value }))} />
                                </div>
                                <div className="col-md-4">
                                    <label className="form-label">Emergency Fee (₹)</label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white">₹</span>
                                        <input type="number" className="form-control" min="0" value={locForm.emergency_fee}
                                            onChange={e => setLocForm(p => ({ ...p, emergency_fee: e.target.value }))} />
                                    </div>
                                </div>

                                <div className="col-12 mt-4">
                                    <button type="submit" className="btn btn-primary w-100 py-3" disabled={loading}>
                                        {loading ? 'Publishing...' : 'Publish Service'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
