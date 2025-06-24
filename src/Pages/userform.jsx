import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ref, push } from 'firebase/database';
import { database } from '../Database/Firebase';
import { FiUser, FiPhone, FiCheck, FiLoader } from 'react-icons/fi';
import { GiGoldBar } from 'react-icons/gi';

const UserFormModal = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Check if user has already submitted the form
  useEffect(() => {
    const hasSubmitted = localStorage.getItem('formSubmitted');
    if (hasSubmitted) {
      navigate('/', { replace: true }); // Redirect to home if already submitted
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Basic validation
    if (!name.trim() || !phoneNumber.trim()) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Phone number validation (basic)
    if (phoneNumber.length < 10) {
      setError('Please enter a valid phone number (at least 10 digits)');
      setLoading(false);
      return;
    }

    try {
      const userData = {
        name: name.trim(),
        phoneNumber: phoneNumber.trim(),
        createdAt: new Date().toISOString(),
        timestamp: Date.now()
      };

      await push(ref(database, 'users'), userData);
      
      setSuccess(true);
      setName('');
      setPhoneNumber('');
      
      // Store in local storage that user has submitted the form
      localStorage.setItem('formSubmitted', 'true');
      
      // Redirect to home after showing success message for 2 seconds
      setTimeout(() => {
        navigate('/', { replace: true });
      }, 2000);

    } catch (error) {
      console.error("Error saving user data:", error);
      setError('Failed to save user data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative">
        <div className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="flex justify-center mb-4">
              <div className="bg-yellow-500 p-4 rounded-full">
                <GiGoldBar className="text-white text-3xl" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Bhamare Jewellers</h1>
            <p className="text-gray-600">Register to explore our exquisite jewelry collection</p>
          </div>

          {/* Success Message */}
          {success && (
            <div className="mb-4 p-4 bg-green-100 border border-green-300 rounded-lg flex items-center">
              <FiCheck className="text-green-600 mr-2" />
              <span className="text-green-700">Registration successful! Redirecting to homepage...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg">
              <span className="text-red-700">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter your full name"
                  required
                  disabled={loading || success}
                />
              </div>
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiPhone className="text-gray-400" />
                </div>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Enter your phone number"
                  required
                  disabled={loading || success}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-300 text-white font-semibold py-3 px-4 rounded-lg transition duration-200 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <FiLoader className="animate-spin mr-2" />
                  Registering...
                </>
              ) : (
                success ? 'Success!' : 'Register Now'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>By registering, you agree to receive updates about our latest jewelry collections and offers.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;