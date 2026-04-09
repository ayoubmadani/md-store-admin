import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import MainLayout from './layout/dashboard-layout'
import Theme  from './page/theme/theme'
import Dashboard from './page/dashboard/dashboard'
import Niche from './page/niche/niche'
import Setting from './page/setting/setting'
import User from './page/user/user'
import Stores from './page/stores/stores'
import Orders from './page/orders/orders'
import Products from './page/products/products'
import PlanPage from './page/plan/plan'
import Message from './page/message/message'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} /> 
          <Route path='themes' element={<Theme />} /> 
          <Route path='niches' element={<Niche />} /> 
          <Route path='Settings' element={<Setting />} /> 
          <Route path='users' element={<User />} /> 
          <Route path='Stores' element={<Stores />} /> 
          <Route path='Orders' element={<Orders />} /> 
          <Route path='Products' element={<Products />} /> 
          <Route path='Plan' element={<PlanPage />} />
          <Route path='Message' element={<Message />} /> 
          
        </Route>
      </Routes>
    </BrowserRouter>
  )
}