import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Home from './pages/Home'
import JobListing from './pages/JobListing'
import JobDetail from './pages/JobDetail' // ✅ CHỈ IMPORT 1 LẦN
import Login from './pages/Login'
import Register from './pages/Register'
import EmployerDashboard from './pages/EmployerDashboard'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/jobs" element={<JobListing />} />
            <Route path="/jobs/:id" element={<JobDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected Routes */}
            <Route 
              path="/employer/dashboard" 
              element={
                <ProtectedRoute requireEmployer={true}>
                  <EmployerDashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* 404 Page */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  )
}

// Component cho trang 404
function NotFound() {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '100px 20px',
      minHeight: '60vh'
    }}>
      <h1>404 - Trang không tồn tại</h1>
      <p>Trang bạn đang tìm kiếm không thể được tìm thấy.</p>
      <a href="/" style={{
        display: 'inline-block',
        marginTop: '20px',
        padding: '10px 20px',
        backgroundColor: '#3498db',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '5px'
      }}>
        Quay về Trang chủ
      </a>
    </div>
  )
}

export default App