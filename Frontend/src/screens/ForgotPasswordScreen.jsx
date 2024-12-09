import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/Toast';

const ForgotPasswordScreen = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await axios.post('http://localhost:3000/api/auth/check-email', {
        email,
      });

      if (response.data.exists) {
        // Store email and userId for password reset
        localStorage.setItem('resetEmail', email);
        localStorage.setItem('resetUserId', response.data.userId);
        
        // Navigate to create new password screen
        navigate('/create-new-password');
      } else {
        setToast({
          type: 'error',
          message: 'Email not found',
          subMessage: 'No account exists with this email address.',
          actionLabel: 'Try again'
        });
      }
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Error occurred',
        subMessage: error.response?.data?.message || 'Please try again later.',
        actionLabel: 'Try again'
      });
    } finally {
      setIsLoading(false);
    }
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
        />
      )}

      <div className="w-full max-w-md">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="mb-8 text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h1 className="text-2xl font-bold text-center mb-8">Forgot Password</h1>

        {/* Red Circle with Lock Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-[#CC1A1A] rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
        </div>

        {/* Instructions Text */}
        <p className="text-center mb-8">
          Please Enter Your Email Address<br />
          For Us To Verify Your Account.
        </p>

        <div className="bg-white rounded-[10px] p-8 border border-gray-200 shadow-[0_4px_20px_rgba(255,0,0,0.1)] max-w-[352px] mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-base font-medium text-gray-900">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border rounded-lg text-base text-gray-900 font-medium"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#CC1A1A] text-white rounded-lg hover:bg-[#b31717] transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Send
            </button>

            <button
              type="button"
              onClick={() => setEmail('')}
              className="w-full text-[#CC1A1A] text-sm"
            >
              Try Another
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordScreen;