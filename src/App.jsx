import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";

import AdminPanel from "./Pages/AdminPanel";
import Home from "./Pages/Home";
import ProductPage from "./Pages/ProductPage";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import UserFormModal from "./Pages/userform"; // ✅ Make sure file is named UserForm.jsx
import ImageUploadPage from "./Pages/ImageUploadPage"; // ✅ Your Cloudinary page

// Inner App logic
const App = () => {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const hasSubmitted = localStorage.getItem("formSubmitted");
    if (hasSubmitted === "true") {
      setFormSubmitted(true);
    }
  }, []);

  // Show form modal if not submitted and not on admin route
  if (!formSubmitted && !location.pathname.startsWith("/admin")) {
    return (
      <UserFormModal
        onSuccess={() => {
          localStorage.setItem("formSubmitted", "true");
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
        <Route path="/image-upload" element={<ImageUploadPage />} />
        <Route path="/product/:id" element={<ProductPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </>
  );
};

// App wrapped in Router
export default function WrappedApp() {
  return (
    <Router>
      <App />
    </Router>
  );
}
