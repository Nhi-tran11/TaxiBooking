/*
 * Student Information:
 * Name: Xuan Nhi thi Tran
 * Student ID: 23196149
 *
 * File: App.jsx
 * Description: Main React application component with routing configuration
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Navigation from './components/Navigation'
import BookingForm from './components/BookingForm'
import AdminPage from './components/AdminPage'
import DriverDashboard from './components/DriverDashboard'
import CustomerTracker from './components/CustomerTracker'
import FareCalculator from './components/FareCalculator'
import Analytics from './components/Analytics'
import './App.css'

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<BookingForm />} />
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/driver" element={<DriverDashboard />} />
        <Route path="/tracker" element={<CustomerTracker />} />
        <Route path="/fare" element={<FareCalculator />} />
        <Route path="/analytics" element={<Analytics />} />
      </Routes>
    </Router>
  )
}

export default App

