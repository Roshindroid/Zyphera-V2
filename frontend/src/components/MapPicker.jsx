import { useEffect, useRef, useState } from 'react'
import { useGoogleMaps } from '../hooks/useGoogleMaps'

export default function MapPicker({ value, onChange }) {
    const mapsPromise = useGoogleMaps()
    const mapRef = useRef(null)
    const inputRef = useRef(null)
    const mapInstanceRef = useRef(null)
    const markerRef = useRef(null)
    const circleRef = useRef(null)

    const [detecting, setDetecting] = useState(false)
    const [error, setError] = useState('')
    const [attempt, setAttempt] = useState(0)

    const hasValidCoords = value?.latitude !== undefined && value?.latitude !== null && value?.latitude !== '' &&
                           value?.longitude !== undefined && value?.longitude !== null && value?.longitude !== ''

    const initial = hasValidCoords
        ? { lat: parseFloat(value.latitude), lng: parseFloat(value.longitude) }
        : { lat: 20.5937, lng: 78.9629 }

    // Initialise the map. attempt is a dependency so a transient failure can retry.
    useEffect(() => {
        if (!mapsPromise) return
        let cancelled = false
        mapsPromise.then(async () => {
            if (cancelled || !mapRef.current || mapInstanceRef.current) return
            try {
                const g = window.google.maps

                const { Map, Circle } = await g.importLibrary('maps')
                const map = new Map(mapRef.current, {
                    center: initial,
                    zoom: 14,
                    disableDefaultUI: true,
                    zoomControl: true,
                    mapId: 'DEMO_MAP_ID',
                })
                mapInstanceRef.current = map

                const { AdvancedMarkerElement } = await g.importLibrary('marker')
                const markerEl = document.createElement('div')
                markerEl.style.cssText = 'display:flex;flex-direction:column;align-items:center;cursor:grab;filter:drop-shadow(0 3px 8px rgba(13,110,253,.5));transform:translateY(-50%)'
                markerEl.innerHTML = `
                    <div style="width:36px;height:36px;background:#0d6efd;border-radius:50%;display:flex;align-items:center;justify-content:center;border:3px solid #fff">
                        <i class="bi bi-geo-alt-fill" style="color:#fff;font-size:18px"></i>
                    </div>
                    <div style="width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #0d6efd;margin-top:-2px"></div>
                `
                const marker = new AdvancedMarkerElement({ position: initial, map, content: markerEl, gmpDraggable: true })
                markerRef.current = marker

                const radiusMeters = (value?.radius_km ?? 10) * 1000
                const circle = new Circle({
                    map,
                    center: initial,
                    radius: radiusMeters,
                    strokeColor: '#0d6efd',
                    strokeOpacity: 0.6,
                    strokeWeight: 2,
                    fillColor: '#0d6efd',
                    fillOpacity: 0.08,
                })
                circleRef.current = circle

                const updateLocation = async (lat, lng) => {
                    marker.position = { lat, lng }
                    circle.setCenter({ lat, lng })
                    onChange(prev => ({ ...prev, latitude: lat, longitude: lng }))
                    const address = await reverseGeocode(lat, lng)
                    if (inputRef.current?.value !== undefined) inputRef.current.value = address
                    onChange(prev => ({ ...prev, address }))
                }

                marker.addListener('gmp-dragend', async (e) => {
                    if (e.latLng) {
                        const lat = e.latLng.lat()
                        const lng = e.latLng.lng()
                        await updateLocation(lat, lng)
                    }
                })

                map.addListener('click', async (e) => {
                    if (e.latLng) {
                        const lat = e.latLng.lat()
                        const lng = e.latLng.lng()
                        map.setCenter({ lat, lng })
                        await updateLocation(lat, lng)
                    }
                })

                // PlaceAutocompleteElement (new API)
                const { PlaceAutocompleteElement } = await g.importLibrary('places')
                const pac = new PlaceAutocompleteElement()
                pac.style.cssText = 'width:100%;display:block'
                if (inputRef.current) {
                    inputRef.current.replaceWith(pac)
                    inputRef.current = pac
                    pac.addEventListener('gmp-placeselect', async ({ place }) => {
                        await place.fetchFields({ fields: ['location', 'formattedAddress'] })
                        const lat = place.location.lat()
                        const lng = place.location.lng()
                        const address = place.formattedAddress
                        map.setCenter({ lat, lng })
                        marker.position = { lat, lng }
                        circle.setCenter({ lat, lng })
                        onChange(prev => ({ ...prev, latitude: lat, longitude: lng, address }))
                    })
                }
            } catch (err) {
                console.error('MapPicker init failed:', err)
                setError('Could not load the map. Please check your connection and retry.')
            }
        }).catch(() => {
            if (!cancelled) setError('Could not load Google Maps. Please check your connection and retry.')
        })
        return () => { cancelled = true }
    }, [mapsPromise, attempt]) // eslint-disable-line react-hooks/exhaustive-deps

    // Re-center the map and move the marker whenever the location value changes
    // (e.g. when location_data loads, or after the merchant drags the pin).
    useEffect(() => {
        if (!mapInstanceRef.current || !mapRef.current) return
        if (!hasValidCoords) return
        const lat = parseFloat(value.latitude)
        const lng = parseFloat(value.longitude)
        if (isNaN(lat) || isNaN(lng)) return

        const center = { lat, lng }
        mapInstanceRef.current.setCenter(center)
        if (markerRef.current) markerRef.current.position = center
        if (circleRef.current) circleRef.current.setCenter(center)
    }, [value?.latitude, value?.longitude])

    // update circle radius when radius_km changes
    useEffect(() => {
        if (circleRef.current && value?.radius_km) {
            circleRef.current.setRadius(parseFloat(value.radius_km) * 1000)
        }
    }, [value?.radius_km])

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

    const handleDetect = () => {
        if (!navigator.geolocation) return
        setDetecting(true)
        navigator.geolocation.getCurrentPosition(async ({ coords }) => {
            const lat = coords.latitude
            const lng = coords.longitude
            const address = await reverseGeocode(lat, lng)
            if (mapInstanceRef.current) mapInstanceRef.current.setCenter({ lat, lng })
            if (markerRef.current) markerRef.current.position = { lat, lng }
            if (circleRef.current) circleRef.current.setCenter({ lat, lng })
            if (inputRef.current) inputRef.current.value = address
            onChange(prev => ({ ...prev, latitude: lat, longitude: lng, address }))
            setDetecting(false)
        }, () => setDetecting(false), { timeout: 8000 })
    }

    return (
        <div>
            <div className="input-group mb-2">
                <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-search text-muted"></i>
                </span>
                <input
                    ref={inputRef}
                    type="text"
                    className="form-control bg-light border-start-0 border-end-0"
                    placeholder="Search service address..."
                    defaultValue={value?.address || ''}
                />
                <button type="button" className="btn btn-outline-secondary" onClick={handleDetect} disabled={detecting} title="Use current location">
                    {detecting ? <span className="spinner-border spinner-border-sm"></span> : <i className="bi bi-crosshair"></i>}
                </button>
            </div>
            <div ref={mapRef} style={{ height: 280, borderRadius: 12, overflow: 'hidden' }}></div>
            {error && (
                <div className="alert alert-warning small mt-2 mb-1 d-flex justify-content-between align-items-center">
                    <span><i className="bi bi-exclamation-triangle me-1"></i>{error}</span>
                    <button type="button" className="btn btn-sm btn-outline-warning" onClick={() => { setError(''); setAttempt(a => a + 1) }}>
                        Retry
                    </button>
                </div>
            )}
            <p className="text-muted small mt-1 mb-0">
                <i className="bi bi-info-circle me-1"></i>Drag the pin to set exact location. The circle shows your service radius.
            </p>
        </div>
    )
}
