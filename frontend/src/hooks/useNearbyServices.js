import { useEffect, useState } from 'react'
import api from '../api/axios'

export function useNearbyServices(lat, lng, category) {
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        if (!lat || !lng) { setServices([]); return }
        let isMounted = true

        const fetchNearby = () => {
            const params = new URLSearchParams({ lat, lng })
            if (category && category !== 'all') params.set('category', category)
            api.get(`/services/nearby/?${params}`)
                .then(r => {
                    if (isMounted) setServices(r.data)
                })
                .catch(e => {
                    if (isMounted) setError(e)
                })
                .finally(() => {
                    if (isMounted) setLoading(false)
                })
        }

        setLoading(true)
        setError(null)
        fetchNearby()

        const interval = setInterval(fetchNearby, 15000)

        return () => {
            isMounted = false
            clearInterval(interval)
        }
    }, [lat, lng, category])

    return { services, loading, error }
}
