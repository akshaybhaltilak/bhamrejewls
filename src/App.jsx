import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';

import AdminPanel from './Pages/AdminPanel';
import Home from './Pages/Home';
import ProductPage from './Pages/ProductPage';
import Header from './Components/Header';
import Footer from './Components/Footer';
import UserFormModal from './Pages/userform';

const App = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const hasSubmitted = localStorage.getItem('formSubmitted');
    if (hasSubmitted === 'true') {
      setFormSubmitted(true);
    }
  }, []);

  // Skip form for admin routes
  if (!formSubmitted && !location.pathname.startsWith('/admin')) {
    return (
      <UserFormModal 
        onSuccess={() => {
          localStorage.setItem('formSubmitted', 'true');
          setFormSubmitted(true);
        }} 
      />
    );
  }

  return (
    <>
      <Header />
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </>
  );
};

// Wrap App with Router
export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}