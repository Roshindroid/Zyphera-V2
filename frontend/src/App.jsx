import { Routes, Route } from 'react-router-dom'
import CustomCursor from './components/CustomCursor'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import SellerPublicProfile from './pages/SellerPublicProfile'
import About from './pages/About'
import Contact from './pages/Contact'
import Cart from './pages/Cart'
import SellerDashboard from './pages/seller/Dashboard'
import MyServices from './pages/seller/MyServices'
import SellerRequests from './pages/seller/Requests'
import SellerProfile from './pages/seller/Profile'
import AddService from './pages/seller/AddService'
import EditServiceLocation from './pages/seller/EditServiceLocation'
import BuyerDashboard from './pages/buyer/Dashboard'
import BuyerBookings from './pages/buyer/Bookings'
import BuyerProfile from './pages/buyer/Profile'
import EditProfile from './pages/buyer/EditProfile'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminUsers from './pages/admin/AdminUsers'
import AdminProviders from './pages/admin/AdminProviders'
import AdminServices from './pages/admin/AdminServices'
import AdminCategories from './pages/admin/AdminCategories'
import AdminBookings from './pages/admin/AdminBookings'
import AdminRequests from './pages/admin/AdminRequests'
import AdminSettings from './pages/admin/AdminSettings'
import AdminReviews from './pages/admin/AdminReviews'

import { CartProvider } from './context/CartContext'
import { LocationProvider } from './context/LocationContext'

export default function App() {
  return (
    <LocationProvider>
      <CartProvider>
        <>
          <CustomCursor />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/services" element={<Services />} />
            <Route path="/services/:id" element={<ServiceDetail />} />
            <Route path="/sellers/:id" element={<SellerPublicProfile />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />

            {/* Buyer Protected Routes */}
            <Route path="/cart" element={<ProtectedRoute allowedRoles={['buyer']}><Cart /></ProtectedRoute>} />
            <Route path="/buyer/dashboard" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerDashboard /></ProtectedRoute>} />
            <Route path="/buyer/bookings" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerBookings /></ProtectedRoute>} />
            <Route path="/buyer/profile" element={<ProtectedRoute allowedRoles={['buyer']}><BuyerProfile /></ProtectedRoute>} />
            <Route path="/buyer/profile/edit" element={<ProtectedRoute allowedRoles={['buyer']}><EditProfile /></ProtectedRoute>} />

            {/* Seller Protected Routes */}
            <Route path="/seller/dashboard" element={<ProtectedRoute allowedRoles={['seller']}><SellerDashboard /></ProtectedRoute>} />
            <Route path="/seller/services" element={<ProtectedRoute allowedRoles={['seller']}><MyServices /></ProtectedRoute>} />
            <Route path="/seller/requests" element={<ProtectedRoute allowedRoles={['seller']}><SellerRequests /></ProtectedRoute>} />
            <Route path="/seller/profile" element={<ProtectedRoute allowedRoles={['seller']}><SellerProfile /></ProtectedRoute>} />
            <Route path="/seller/add-service" element={<ProtectedRoute allowedRoles={['seller']}><AddService /></ProtectedRoute>} />
            <Route path="/seller/services/:id/location" element={<ProtectedRoute allowedRoles={['seller']}><EditServiceLocation /></ProtectedRoute>} />

            {/* Admin Protected Routes */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminUsers /></ProtectedRoute>} />
            <Route path="/admin/providers" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminProviders /></ProtectedRoute>} />
            <Route path="/admin/services" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminServices /></ProtectedRoute>} />
            <Route path="/admin/categories" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminCategories /></ProtectedRoute>} />
            <Route path="/admin/bookings" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminBookings /></ProtectedRoute>} />
            <Route path="/admin/requests" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminRequests /></ProtectedRoute>} />
            <Route path="/admin/reviews" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminReviews /></ProtectedRoute>} />
            <Route path="/admin/settings" element={<ProtectedRoute allowedRoles={['admin', 'super_admin']}><AdminSettings /></ProtectedRoute>} />
          </Routes>
        </>
      </CartProvider>
    </LocationProvider>
  )
}

