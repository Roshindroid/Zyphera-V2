import { Routes, Route } from 'react-router-dom'
import CustomCursor from './components/CustomCursor'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Services from './pages/Services'
import About from './pages/About'
import Contact from './pages/Contact'
import Cart from './pages/Cart'
import SellerDashboard from './pages/seller/Dashboard'
import MyServices from './pages/seller/MyServices'
import SellerRequests from './pages/seller/Requests'
import SellerProfile from './pages/seller/Profile'
import AddService from './pages/seller/AddService'
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

import { CartProvider } from './context/CartContext'

export default function App() {
  return (
    <CartProvider>
      <>
        <CustomCursor />
        <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/seller/dashboard" element={<SellerDashboard />} />
        <Route path="/seller/services" element={<MyServices />} />
        <Route path="/seller/requests" element={<SellerRequests />} />
        <Route path="/seller/profile" element={<SellerProfile />} />
        <Route path="/seller/add-service" element={<AddService />} />
        <Route path="/buyer/dashboard" element={<BuyerDashboard />} />
        <Route path="/buyer/bookings" element={<BuyerBookings />} />
        <Route path="/buyer/profile" element={<BuyerProfile />} />
        <Route path="/buyer/profile/edit" element={<EditProfile />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/providers" element={<AdminProviders />} />
        <Route path="/admin/services" element={<AdminServices />} />
        <Route path="/admin/categories" element={<AdminCategories />} />
        <Route path="/admin/bookings" element={<AdminBookings />} />
        <Route path="/admin/requests" element={<AdminRequests />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      </Routes>
      </>
    </CartProvider>
  )
}

