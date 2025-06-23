import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminPanel from './Pages/AdminPanel';
import Home from './Pages/Home';
import ProductPage from './Pages/ProductPage';
import Header from './Components/Header';
import Footer from './Components/Footer';
import UserFormModal from './Pages/userform';

const App = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Check local storage on initial load
  useEffect(() => {
    const hasSubmitted = localStorage.getItem('formSubmitted');
    if (hasSubmitted) {
      setFormSubmitted(true);
    }
  }, []);

  // If form is not submitted, show only the form modal (except for admin route)
  if (!formSubmitted && !window.location.pathname.startsWith('/')) {
    return <UserFormModal onSuccess={() => setFormSubmitted(true)} />;
  }

  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/" element={<Home />} />
       <Route path="/product/:id" element={<ProductPage />} />
        {/* Redirect any other path to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Footer />
    </Router>
  );
};

export default App;