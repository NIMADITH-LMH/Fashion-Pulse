import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import SummaryApi from '../common';
import axios from 'axios';

// Import the image directly - using the same image as login/signup for consistency
import forgotPasswordImage from '../assest/login/935760.jpg';

// Image fallback URL
const FALLBACK_IMG_URL = "https://i.pinimg.com/originals/45/00/6c/45006c3f0832d2e90cc9b77729218962.jpg";

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(true);
    try {
      // Assuming the API endpoint for password reset
      const response = await axios.post(SummaryApi.forgotPassword?.url || '/api/auth/forgot-password', {
        email
      });

      if (response.data.success) {
        toast.success('Reset link has been sent to your email');
        setEmailSent(true);
      } else {
        throw new Error(response.data.message || 'Failed to send reset link');
      }
    } catch (error) {
      console.error('Error sending reset link:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Something went wrong';
      toast.error(errorMessage);
      
      // For development/testing - allow proceeding even if API fails
      if (process.env.NODE_ENV === 'development') {
        setEmailSent(true);
      }
    } finally {
      setLoading(false);
    }
  };

  // For password reset confirmation screen
  const handleResendLink = () => {
    setEmailSent(false);
    // Reset the form to let them try again
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 overflow-x-hidden">
      {/* Container for both sides - with max-width to prevent overflow */}
      <div className="flex w-full max-w-5xl mx-auto shadow-xl rounded-2xl overflow-hidden">
        {/* Left side - Shopping Woman Image */}
        <div className="hidden lg:block lg:w-1/2 relative bg-white">
          <div className="absolute inset-0">
            <img 
              src={forgotPasswordImage}
              alt="Woman with shopping bags" 
              className="w-full h-full object-cover object-center"
              onError={(e) => {
                console.error("Image failed to load");
                e.target.onerror = null; // Prevent infinite loop
                e.target.src = FALLBACK_IMG_URL;
              }}
            />
          </div>
        </div>

        {/* Right side - Forgot Password Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center py-10 px-6 bg-white">
          <div className="w-full max-w-md space-y-6">
            {!emailSent ? (
              // Password reset request form
              <>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900">
                    Forgot Password?
                  </h2>
                  <p className="mt-2 text-gray-600 text-sm">
                    Don't worry, it happens. Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>
                
                <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                  <div className="rounded-md space-y-4">
                    <div className="group">
                      <label htmlFor="email" className="sr-only">Email</label>
                      <input
                        id="email"
                        type="email"
                        name="email"
                        value={email}
                        onChange={handleChange}
                        required
                        className="appearance-none relative block w-full px-4 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 text-sm shadow-sm"
                        placeholder="Email address"
                      />
                    </div>
                  </div>

                  <div>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {loading ? 'Sending...' : 'Send Reset Link'}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              // Email sent confirmation screen
              <>
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h2 className="mt-3 text-lg font-medium text-gray-900">
                    Check your email
                  </h2>
                  <p className="mt-2 text-sm text-gray-600">
                    We've sent a password reset link to <span className="font-medium">{email}</span>
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    If you don't see it in your inbox, please check your spam folder.
                  </p>
                </div>
                
                <div className="mt-6 text-sm text-center">
                  <p className="text-gray-600">
                    Didn't receive the email?{' '}
                    <button 
                      type="button"
                      onClick={handleResendLink}
                      className="text-red-600 hover:text-red-500 font-medium"
                    >
                      Click to try again
                    </button>
                  </p>
                </div>
              </>
            )}

            <div className="text-center">
              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center space-x-6 text-sm">
                <Link to="/login" className="font-medium text-red-600 hover:text-red-500">
                  Back to Login
                </Link>
                <Link to="/sign-up" className="font-medium text-gray-600 hover:text-gray-500">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;