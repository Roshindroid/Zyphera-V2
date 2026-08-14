import { createContext, useContext, useState, useCallback } from 'react'
import api from '../api/axios'

const LocationContext = createContext()

const STORAGE_KEY = 'buyer_location'

function loadStored() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || null } catch { return null }
}

export function LocationProvider({ children }) {
    const [buyerLocation, setBuyerLocation] = useState(loadStored)

    const setLocation = useCallback(async (loc) => {
        setBuyerLocation(loc)
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loc))
        try {
            await api.patch('/profile/', {
                location: loc.address,
                latitude: loc.lat,
                longitude: loc.lng,
                place_id: loc.place_id ?? null,
            })
        } catch {
            // silently fail — location is still saved locally
        }
    }, [])

    const detectCurrentLocation = useCallback(() => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) return reject(new Error('Geolocation not supported'))
            navigator.geolocation.getCurrentPosition(
                async ({ coords }) => {
                    const { latitude: lat, longitude: lng } = coords
                    let address = `${lat.toFixed(4)}, ${lng.toFixed(4)}`
                    try {
                        const key = import.meta.env.VITE_GOOGLE_MAPS_KEY
                        const res = await fetch(
                            `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${key}`
                        )
                        const data = await res.json()
                        if (data.results?.[0]) address = data.results[0].formatted_address
                    } catch { /* use coordinate fallback */ }
                    resolve({ lat, lng, address, place_id: null })
                },
                reject,
                { timeout: 8000 }
            )
        })
    }, [])

    return (
        <LocationContext.Provider value={{ buyerLocation, setLocation, detectCurrentLocation }}>
            {children}
        </LocationContext.Provider>
    )
}

export const useLocation = () => useContext(LocationContext)
