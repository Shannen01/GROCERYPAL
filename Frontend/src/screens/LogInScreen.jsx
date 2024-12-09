import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../utils/axios';  // Import our axios instance
import Toast from '../components/Toast';
import logo from '../assets/PantryPal.png';
import wavingHand from '../assets/Waving Hand Emoji.png';

const LogInScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('userToken');
    if (token) {
      navigate('/home', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Validate input
      if (!email || !password) {
        setToast({
          type: 'error',
          message: 'Missing Information',
          subMessage: 'Please enter both email and password'
        });
        setIsLoading(false);
        return;
      }

      // Clean input
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      // Login request
      const response = await axios.post('/api/auth/login', {
        email: cleanEmail,
        password: cleanPassword
      });

      const { success, token, user } = response.data;

      if (success && token && user) {
        // Store auth data
        localStorage.setItem('userToken', token);
        localStorage.setItem('userInfo', JSON.stringify(user));

        // Show success toast
        setToast({
          type: 'success',
          message: 'Welcome back!',
          subMessage: `Logged in as ${user.name}`
        });

        // Clear form
        setEmail('');
        setPassword('');

        // Navigate to home
        navigate('/home', { replace: true });
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Login error:', error);
      setToast({
        type: 'error',
        message: 'Login Failed',
        subMessage: error.response?.data?.message || 'Please try again later'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-4 px-4 font-roboto">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          subMessage={toast.subMessage}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-2">
          <div className="relative">
            <img src={logo} alt="PantryPal Logo" className="w-24 h-24" />
          </div>
        </div>

        <h1 className="text-[36px] font-extrabold text-center mb-2">
          Welcome Back 
          <style>
            {`
              @keyframes wave {
                0% { transform: rotate(0deg); }
                10% { transform: rotate(14deg); }
                20% { transform: rotate(-8deg); }
                30% { transform: rotate(14deg); }
                40% { transform: rotate(-4deg); }
                50% { transform: rotate(10deg); }
                60% { transform: rotate(0deg); }
                100% { transform: rotate(0deg); }
              }
              .wave {
                animation: wave 2.5s infinite;
                transform-origin: 70% 70%;
                display: inline-block;
              }
            `}
          </style>
          <img 
            src={wavingHand} 
            alt="Waving Hand" 
            className="inline-block w-10 h-10 ml-2 wave"
          />
        </h1>
        <p className="text-gray-600 text-center text-sm mb-6">Please enter your details</p>

        <div className="bg-white rounded-[10px] p-8 border border-gray-200 shadow-[0_4px_20px_rgba(255,0,0,0.1)] max-w-[352px] mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-base font-medium text-gray-900">Email</label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border rounded-lg pr-10 text-base text-gray-900 font-medium"
                  required
                />
                <svg className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-base font-medium text-gray-900">Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg pr-10 text-base text-gray-900 font-medium"
                  required
                />
                <svg className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>

            <div className="text-right">
              <Link 
                to="/forgot-password" 
                className="text-sm text-gray-600 active:text-[#CC1A1A]"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#CC1A1A] text-white rounded-lg hover:bg-[#b31717] transition-colors disabled:opacity-50 mt-6"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Log in'}
            </button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Don't have an Account? <Link to="/signup" className="text-[#CC1A1A]">Sign Up</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LogInScreen;
