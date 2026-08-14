import { useEffect } from 'react'

let sdkPromise = null

// Shared readiness registry so every component (MapPicker, LocationPicker,
// the Services page, etc.) hooks into the single Google Maps script without
// overwriting each other's callback.
function ensureScript() {
    if (window.google?.maps?.importLibrary) return true

    const key = import.meta.env.VITE_GOOGLE_MAPS_KEY
    if (!key) return false

    // Reuse an existing bootstrap-loader script if one is already present.
    const existing = document.querySelector('script[data-gmaps]')
    if (existing) return false

    // Inline Bootstrap Loader (v=weekly + callback). This guarantees that
    // google.maps.importLibrary is defined by the time the callback runs.
    const s = document.createElement('script')
    s.dataset.gmaps = '1'
    s.async = true
    s.defer = true
    s.src =
        `https://maps.googleapis.com/maps/api/js?key=${key}&v=weekly&loading=async&callback=__zypheraMapsCallback`
    s.onerror = () => {
        const cbs = window.__zypheraMapsCallbacks || []
        window.__zypheraMapsCallbacks = []
        cbs.forEach(c => { try { c(new Error('Google Maps script failed to load')) } catch (e) { console.error(e) } })
    }
    document.head.appendChild(s)
    return false
}

export function onGoogleMapsReady(cb) {
    if (window.google?.maps?.importLibrary) {
        cb()
        return
    }
    if (!window.__zypheraMapsCallbacks) {
        window.__zypheraMapsCallbacks = []
        window.__zypheraMapsCallback = () => {
            const cbs = window.__zypheraMapsCallbacks || []
            window.__zypheraMapsCallbacks = []
            cbs.forEach(c => { try { c() } catch (e) { console.error(e) } })
        }
    }
    window.__zypheraMapsCallbacks.push(cb)
    ensureScript()
}

export function useGoogleMaps() {
    useEffect(() => {}, [])

    if (sdkPromise) return sdkPromise

    const key = import.meta.env.VITE_GOOGLE_MAPS_KEY
    if (!key) {
        console.warn('VITE_GOOGLE_MAPS_KEY is not set.')
        return Promise.reject(new Error('No API key'))
    }

    sdkPromise = new Promise((resolve, reject) => {
        let settled = false
        const done = (fn, v) => { if (!settled) { settled = true; fn(v) } }

        onGoogleMapsReady(() => {
            if (window.google?.maps?.importLibrary) {
                window.google.maps
                    .importLibrary('maps')
                    .then(v => done(resolve, v))
                    .catch(e => done(reject, e))
            } else {
                done(reject, new Error('importLibrary not available'))
            }
        })

        // Safety net so a failed load doesn't leave the promise pending forever.
        setTimeout(() => done(reject, new Error('Google Maps load timed out')), 20000)
    })

    // Do NOT cache a rejected promise — clear it so the next call retries.
    sdkPromise.catch(() => { sdkPromise = null })

    return sdkPromise
}
