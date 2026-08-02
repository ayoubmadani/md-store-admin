import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import MainLayout from './layout/dashboard-layout'
import Login from './page/login/login'
import Theme  from './page/theme/theme'
import Dashboard from './page/dashboard/dashboard'
import Niche from './page/niche/niche'
import Setting from './page/setting/setting'
import User from './page/user/user'
import UserShow from './page/user/show'
import Stores from './page/stores/stores'
import Orders from './page/orders/orders'
import Products from './page/products/products'
import PlanPage from './page/plan/plan'
import CouponPage from './page/coupon/coupon'
import Message from './page/message/message'
import CategoryNiche from './page/category-niche/category-niche'
import ImageAdminPage from './page/image/image'

export default function App() {
  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route element={<ProtectedRoute />}>
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Dashboard />} />
                <Route path='themes' element={<Theme />} />
                <Route path='niches' element={<Niche />} />
                <Route path='categories' element={<CategoryNiche />} />
                <Route path='Settings' element={<Setting />} />
                <Route path='users' element={<User />} />
                <Route path='users/:id' element={<UserShow />} />
                <Route path='Stores' element={<Stores />} />
                <Route path='Orders' element={<Orders />} />
                <Route path='Products' element={<Products />} />
                <Route path='Plan' element={<PlanPage />} />
                <Route path='Coupons' element={<CouponPage />} />
                <Route path='Message' element={<Message />} />
                <Route path='images' element={<ImageAdminPage />} />
              </Route>
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  )
}