import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import api from '../api/axios'
import { useAuth } from './AuthContext'

const CartContext = createContext(null)

export const CartProvider = ({ children }) => {
  const { user } = useAuth()
  const [cartCount, setCartCount] = useState(0)

  const refreshCartCount = async () => {
    try {
      if (user?.role !== 'buyer') return
      const r = await api.get('/cart/')
      setCartCount(r.data?.count ?? 0)
    } catch {
      // keep previous value; header should not crash
    }
  }

  useEffect(() => {
    refreshCartCount()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const value = useMemo(
    () => ({ cartCount, refreshCartCount }),
    [cartCount]
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export const useCart = () => useContext(CartContext)

