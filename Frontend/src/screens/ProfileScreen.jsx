import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import defaultUserImage from '../assets/user.png';
import axios from 'axios';
import Toast from '../components/Toast';

const CameraIcon = () => (
  <svg 
    className="w-4 h-4" 
    fill="none" 
    stroke="white" 
    viewBox="0 0 24 24" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
    />
    <path 
      strokeLinecap="round" 
      strokeLinejoin="round" 
      strokeWidth={2} 
      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
    />
  </svg>
);

const ProfileImageModal = ({ onClose, currentImage }) => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={onClose} />
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[90%] max-w-[320px] z-30">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium">Change Profile Picture</h2>
          <button onClick={onClose} className="text-gray-500 text-xl">×</button>
        </div>

        <div className="mb-6">
          <div className="relative w-40 h-40 mx-auto border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center overflow-hidden">
            {selectedImage ? (
              <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
            ) : currentImage ? (
              <img src={currentImage} alt="Current" className="w-full h-full object-cover" />
            ) : (
              <div className="text-gray-400 text-center">
                <span className="text-4xl">+</span>
                <p className="text-sm">Upload Image</p>
              </div>
            )}
            <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <div className="text-white opacity-0 hover:opacity-100 transition-all">
                <span className="text-4xl">+</span>
                <p className="text-sm">Change Photo</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="flex-1 py-3 bg-[#E4A76F] text-white rounded-lg"
            onClick={onClose}
          >
            Save
          </button>
        </div>
      </div>
    </>
  );
};

const ProfileScreen = () => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const userInfo = localStorage.getItem('userInfo');
      const token = localStorage.getItem('userToken');
      
      if (userInfo && token) {
        const user = JSON.parse(userInfo);
        setName(user.name);
        setEmail(user.email);
        setProfileImage(user.profileImage || defaultUserImage);

        // Fetch latest user data
        const response = await axios.get('http://localhost:3000/api/profile', {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data) {
          const updatedUser = response.data;
          setName(updatedUser.name);
          setEmail(updatedUser.email);
          setProfileImage(updatedUser.profileImage || defaultUserImage);

          // Update localStorage
          localStorage.setItem('userInfo', JSON.stringify(updatedUser));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      if (localStorage.getItem('userToken')) {
        setToast({
          type: 'error',
          message: 'Error loading profile',
          subMessage: 'Please try logging in again',
          actionLabel: 'Dismiss'
        });
      }
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('image', file);

        const token = localStorage.getItem('userToken');
        if (!token) {
          throw new Error('No authentication token found');
        }
        
        // Upload the image
        const uploadResponse = await axios.post(
          'http://localhost:3000/api/upload',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
              Authorization: `Bearer ${token}`
            }
          }
        );

        if (uploadResponse.data.imageUrl) {
          // Update profile with new image URL
          const updateResponse = await axios.put(
            'http://localhost:3000/api/profile',
            { profileImage: uploadResponse.data.imageUrl },
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );

          if (updateResponse.data) {
            // Update state and localStorage
            setProfileImage(uploadResponse.data.imageUrl);
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            userInfo.profileImage = uploadResponse.data.imageUrl;
            localStorage.setItem('userInfo', JSON.stringify(userInfo));

            // Update HomeScreen image immediately
            const event = new CustomEvent('profileImageUpdated', {
              detail: { profileImage: uploadResponse.data.imageUrl }
            });
            window.dispatchEvent(event);

            setToast({
              type: 'success',
              message: 'Profile picture updated',
              subMessage: 'Your profile picture has been updated successfully',
              actionLabel: 'Dismiss'
            });
          }
        }
      } catch (error) {
        console.error('Error uploading image:', error);
        setToast({
          type: 'error',
          message: 'Error updating profile picture',
          subMessage: error.response?.data?.message || 'Please try again later',
          actionLabel: 'Try again'
        });
      }
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.put(
        'http://localhost:3000/api/profile',
        { name, email, profileImage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data) {
        // Update localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        userInfo.name = name;
        userInfo.email = email;
        userInfo.profileImage = profileImage;
        localStorage.setItem('userInfo', JSON.stringify(userInfo));

        // Update HomeScreen image
        const event = new CustomEvent('profileImageUpdated', {
          detail: { profileImage }
        });
        window.dispatchEvent(event);

        setToast({
          type: 'success',
          message: 'Profile updated',
          subMessage: 'Your profile has been updated successfully',
          actionLabel: 'Dismiss'
        });
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      setToast({
        type: 'error',
        message: 'Error updating profile',
        subMessage: error.response?.data?.message || 'Please try again later',
        actionLabel: 'Try again'
      });
    }
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  return (
    <div 
      className="min-h-screen w-full bg-white relative"
    >
      {/* Header with Back Arrow */}
      <div className="bg-[#D62929] p-4">
        <div className="flex items-center">
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 mr-3"
          >
            <img 
              src="/src/assets/back.png" 
              alt="Back" 
              className="w-5 h-5 brightness-0 invert"
            />
          </button>
          <h1 className="text-[24px] font-bold text-white">Profile</h1>
        </div>
      </div>

      {/* Profile Form Card */}
      <div className="flex-1 flex justify-center items-start mt-16">
        {/* Profile Form Card - Now behind the profile picture */}
        <div className="bg-white rounded-2xl p-6 shadow-md w-[350px] h-[600px] border-2 border-gray-300 relative">
          {/* Form Fields */}
          <div className="space-y-4 mt-20">
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Full name</label>
              <input 
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={`w-full p-2 rounded-lg ${isEditing ? 'bg-white border border-gray-300' : 'bg-[#FFE5E5]'}`}
                readOnly={!isEditing}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Email</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={`w-full p-2 rounded-lg ${isEditing ? 'bg-white border border-gray-300' : 'bg-[#FFE5E5]'}`}
                readOnly={!isEditing}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Phone number</label>
              <input 
                type="tel"
                className={`w-full p-2 rounded-lg ${isEditing ? 'bg-white border border-gray-300' : 'bg-[#FFE5E5]'}`}
                readOnly={!isEditing}
              />
            </div>

            {/* Current Password field */}
            <div>
              <label className="text-sm text-gray-600 mb-1 block">Current Password</label>
              <input 
                type="password"
                className={`w-full p-2 rounded-lg ${isEditing ? 'bg-white border border-gray-300' : 'bg-[#FFE5E5]'}`}
                readOnly={!isEditing}
                placeholder={isEditing ? "Enter current password" : "••••••••"}
              />
            </div>

            {/* New Password field - Only shown when editing */}
            {isEditing && (
              <div>
                <label className="text-sm text-gray-600 mb-1 block">New Password</label>
                <input 
                  type="password"
                  className="w-full p-2 rounded-lg bg-white border border-gray-300"
                  placeholder="Enter new password"
                />
              </div>
            )}

            {/* Edit/Save/Cancel Buttons */}
            <div className="absolute bottom-8 left-6 right-6">
              {isEditing ? (
                <div className="flex gap-4">
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 bg-white text-[#D62929] rounded-lg border border-[#D62929]"
                  >
                    CANCEL
                  </button>
                  <button 
                    onClick={handleSave}
                    className="flex-1 py-3 bg-[#D62929] text-white rounded-lg"
                  >
                    SAVE
                  </button>
                </div>
              ) : (
                <button 
                  onClick={handleEditToggle}
                  className="w-full py-3 bg-[#D62929] text-white rounded-lg"
                >
                  EDIT
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Profile Picture with Edit Icon */}
        <div className="absolute top-20 left-1/2 transform -translate-x-1/2 z-10">
          <div className="relative group">
            <div className="relative w-32 h-32 rounded-full border-2 border-white shadow-md">
              <img 
                src={profileImage} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultUserImage;
                }}
              />
              {/* Edit Icon Circle */}
              <div 
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#D62929] rounded-full flex items-center justify-center cursor-pointer border-2 border-white"
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'image/*';
                  input.onchange = handleImageUpload;
                  input.click();
                }}
              >
                <CameraIcon className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <Toast
          type={toast.type}
          message={toast.message}
          subMessage={toast.subMessage}
          actionLabel={toast.actionLabel}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};

export default ProfileScreen; 