import { useEffect, useRef, useState } from 'react'
import { useGoogleMaps } from '../hooks/useGoogleMaps'
import { useLocation } from '../context/LocationContext'

export default function LocationPicker({ onClose, onConfirm, initialLocation }) {
    const mapsPromise = useGoogleMaps()
    const { buyerLocation, setLocation, detectCurrentLocation } = useLocation()

    const mapRef = useRef(null)
    const inputRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const markerRef = useRef(null)
    const draftRef = useRef(null)  // always holds latest draft, avoids stale closure

    const base = initialLocation || buyerLocation || { lat: 20.5937, lng: 78.9629, address: '' }
    const [detecting, setDetecting] = useState(false)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    function updateDraft(loc) {
        draftRef.current = loc
    }

    // seed draftRef on mount
    useEffect(() => { draftRef.current = base }, []) // eslint-disable-line react-hooks/exhaustive-deps

    useEffect(() => {
        if (!mapsPromise) return
        mapsPromise.then(async () => {
            if (!mapRef.current || mapInstanceRef.current) return
            const g = window.google.maps

            const { Map } = await g.importLibrary('maps')
            const center = { lat: base.lat, lng: base.lng }
            const map = new Map(mapRef.current, {
                center,
                zoom: 14,
                disableDefaultUI: true,
                zoomControl: true,
                mapId: 'DEMO_MAP_ID',
            })
            mapInstanceRef.current = map

            const { AdvancedMarkerElement } = await g.importLibrary('marker')
            const marker = new AdvancedMarkerElement({ position: center, map, gmpDraggable: true })
            markerRef.current = marker

marker.addListener('gmp-dragend', async (e) => {
                const lat = e.latLng.lat()
                const lng = e.latLng.lng()
                const address = await reverseGeocode(lat, lng)
                updateDraft({ lat, lng, address, place_id: null })
                if (inputRef.current) inputRef.current.value = address
            })

            const { PlaceAutocompleteElement } = await g.importLibrary('places')
            const pac = new PlaceAutocompleteElement()
            pac.style.cssText = 'flex:1;min-width:0'
            inputRef.current.replaceWith(pac)
            inputRef.current = pac
            pac.addEventListener('gmp-placeselect', async ({ place }) => {
                await place.fetchFields({ fields: ['location', 'formattedAddress', 'id'] })
                const lat = place.location.lat()
                const lng = place.location.lng()
                const address = place.formattedAddress
                updateDraft({ lat, lng, address, place_id: place.id ?? null })
                map.setCenter({ lat, lng })
                marker.position = { lat, lng }
            })
        })
    }, [mapsPromise]) // eslint-disable-line react-hooks/exhaustive-deps

    async function reverseGeocode(lat, lng) {
        try {
            const key = import.meta.env.VITE_GOOGLE_MAPS_KEY
            const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`)
            const data = await res.json()
            return data.results?.[0]?.formatted_address ?? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        } catch {
            return `${lat.toFixed(4)}, ${lng.toFixed(4)}`
        }
    }

    const handleDetect = async () => {
        setDetecting(true)
        setError('')
        try {
            const loc = await detectCurrentLocation()
            updateDraft(loc)
            if (inputRef.current) inputRef.current.value = loc.address
            if (mapInstanceRef.current) mapInstanceRef.current.setCenter({ lat: loc.lat, lng: loc.lng })
            if (markerRef.current) markerRef.current.position = { lat: loc.lat, lng: loc.lng }
        } catch {
            setError('Could not detect location. Please allow location access.')
        } finally {
            setDetecting(false)
        }
    }

    const handleSave = async () => {
        const draft = draftRef.current
        if (!draft?.address) { setError('Please select a location.'); return }
        setSaving(true)
        if (onConfirm) {
            await onConfirm(draft)
        } else {
            await setLocation(draft)
        }
        setSaving(false)
        onClose()
    }

    return (
        <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)', zIndex: 1055 }}>
            <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: 560 }}>
                <div className="modal-content border-0 shadow-lg rounded-4 overflow-hidden">
                    <div className="modal-header border-0 px-4 pt-4 pb-2">
                        <h5 className="modal-title fw-bold">
                            <i className="bi bi-geo-alt-fill text-primary me-2"></i>Set Your Location
                        </h5>
                        <button className="btn-close" onClick={onClose}></button>
                    </div>
                    <div className="modal-body px-4 pb-0">
                        {error && <div className="alert alert-danger py-2 small">{error}</div>}
                        <div className="input-group mb-3">
                            <span className="input-group-text bg-light border-end-0">
                                <i className="bi bi-search text-muted"></i>
                            </span>
                            <input
                                ref={inputRef}
                                type="text"
                                className="form-control bg-light border-start-0 border-end-0"
                                placeholder="Search place, area, city or pincode..."
                                defaultValue={base.address}
                            />
                            <button className="btn btn-outline-secondary" onClick={handleDetect} disabled={detecting} title="Use current location">
                                {detecting ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-crosshair"></i>}
                            </button>
                        </div>
                        <div ref={mapRef} style={{ height: 300, borderRadius: 12, overflow: 'hidden' }}></div>
                        <p className="text-muted small mt-2 mb-0">
                            <i className="bi bi-info-circle me-1"></i>
                            Search a place name, pincode, or drag the pin to fine-tune.
                        </p>
                    </div>
                    <div className="modal-footer border-0 px-4 pb-4 pt-3">
                        <button className="btn btn-light rounded-pill px-4" onClick={onClose}>Cancel</button>
                        <button className="btn btn-primary rounded-pill px-4" onClick={handleSave} disabled={saving}>
                            {saving ? 'Saving...' : 'Confirm Location'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
