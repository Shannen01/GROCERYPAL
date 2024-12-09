import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Toast from '../components/Toast';

const CreateNewPasswordScreen = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (newPassword !== confirmPassword) {
      setToast({
        type: 'error',
        message: 'Passwords do not match',
        subMessage: 'Please make sure both passwords are the same',
        actionLabel: 'Try again'
      });
      setIsLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:3000/api/auth/reset-password', {
        email: localStorage.getItem('resetEmail'),
        newPassword
      });

      setToast({
        type: 'success',
        message: 'Password Updated!',
        subMessage: 'Your password has been successfully changed.',
      });

      setTimeout(() => {
        localStorage.removeItem('resetEmail');
        navigate('/login');
      }, 2000);
    } catch (error) {
      setToast({
        type: 'error',
        message: 'Error occurred',
        subMessage: 'Please try again later.',
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
        <button 
          onClick={() => navigate(-1)} 
          className="mb-8 text-gray-900"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <h1 className="text-2xl font-bold text-center mb-8">Create New Password</h1>

        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-[#CC1A1A] rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </div>
        </div>

        <p className="text-center mb-8">
          Your New Password Must Be Different<br />
          From Previously Used Password
        </p>

        <div className="bg-white rounded-[10px] p-8 border border-gray-200 shadow-[0_4px_20px_rgba(255,0,0,0.1)] max-w-[352px] mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label className="text-base font-medium text-gray-900">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-3 border rounded-lg text-base text-gray-900 font-medium"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-base font-medium text-gray-900">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border rounded-lg text-base text-gray-900 font-medium"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-[#CC1A1A] text-white rounded-lg hover:bg-[#b31717] transition-colors disabled:opacity-50"
              disabled={isLoading}
            >
              Save
            </button>

            <button
              type="button"
              onClick={() => {
                setNewPassword('');
                setConfirmPassword('');
              }}
              className="w-full text-[#CC1A1A] text-sm"
            >
              Change Password
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateNewPasswordScreen; 