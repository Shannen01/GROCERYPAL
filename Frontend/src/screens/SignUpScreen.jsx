import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/Toast';
import 'react-toastify/dist/ReactToastify.css';
import logo from '../assets/PantryPal.png';

axios.defaults.baseURL = 'http://localhost:3000';

const SignUpScreen = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();
  const [toast, setToast] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Validate inputs
      if (!name || !email || !password || !confirmPassword) {
        setToast({
          type: 'error',
          message: 'Missing Information',
          subMessage: 'Please fill in all fields'
        });
        return;
      }

      // Validate password match
      if (password !== confirmPassword) {
        setToast({
          type: 'error',
          message: 'Password Mismatch',
          subMessage: 'Passwords do not match'
        });
        return;
      }

      // Validate password length
      if (password.length < 6) {
        setToast({
          type: 'error',
          message: 'Weak Password',
          subMessage: 'Password must be at least 6 characters long'
        });
        return;
      }

      // Clean inputs
      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      // Register user
      const response = await axios.post('/api/auth/register', {
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword
      });

      const { success, message, code } = response.data;
      
      if (success) {
        // Show success message
        setToast({
          type: 'success',
          message: '🎉 Registration Successful!',
          subMessage: message || 'Please login to continue',
          actionLabel: 'Go to Login',
          onAction: () => navigate('/login')
        });

        // Clear form
        setName('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');

        // Delay navigation to show the success message
        setTimeout(() => {
          navigate('/login');
        }, 2500);
      }
    } catch (error) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration Failed';
      let subMessage = 'An unexpected error occurred';
      let status = error.response?.status;
      let code = error.response?.data?.code;

      if (error.response) {
        const { data } = error.response;
        subMessage = data.message || subMessage;

        switch (status) {
          case 400:
            errorMessage = 'Invalid Input';
            break;
          case 409:
            errorMessage = 'Account Already Exists';
            // Clear password fields but keep email and name
            setPassword('');
            setConfirmPassword('');
            break;
          case 500:
            errorMessage = 'Server Error';
            break;
          default:
            errorMessage = 'Registration Failed';
        }
      } else if (error.request) {
        errorMessage = 'Network Error';
        subMessage = 'Please check your internet connection';
      }

      setToast({
        type: 'error',
        message: errorMessage,
        subMessage: subMessage,
        actionLabel: status === 409 ? 'Go to Login' : 'Try Again',
        onAction: status === 409 ? () => navigate('/login') : undefined
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center pt-4 px-4 font-roboto">
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          subMessage={toast.subMessage}
          actionLabel={toast.actionLabel}
          onClose={() => setToast(null)}
          onAction={toast.onAction}
        />
      )}
      
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-2">
          <div className="relative">
            <img src={logo} alt="PantryPal Logo" className="w-24 h-24" />
          </div>
        </div>

        <h1 className="text-[36px] font-extrabold text-center mb-2">Create an Account</h1>
        <p className="text-gray-600 text-center text-sm mb-6">Please enter your details</p>

        <div className="bg-white rounded-[10px] p-8 border border-gray-200 shadow-[0_4px_20px_rgba(255,0,0,0.1)] max-w-[352px] mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-base font-medium text-gray-900">Full Name</label>
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border rounded-lg pr-10 text-base text-gray-900 font-medium"
                  required
                />
                <svg className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <circle cx="12" cy="7" r="4" />
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                </svg>
              </div>
            </div>

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

            <div className="space-y-1">
              <label className="text-base font-medium text-gray-900">Confirm Password</label>
              <div className="relative">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full p-3 border rounded-lg pr-10 text-base text-gray-900 font-medium"
                  required
                />
                <svg className="w-5 h-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#CC1A1A] text-white rounded-lg hover:bg-[#b31717] transition-colors disabled:opacity-50 mt-6"
              disabled={isLoading}
            >
              {isLoading ? 'Signing up...' : 'Sign up'}
            </button>

            <p className="text-center text-sm text-gray-600 mt-4">
              Already have an Account? <Link to="/login" className="text-[#CC1A1A]">Log in</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignUpScreen;
