import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import defaultUserImage from '../assets/user.png';
import axios from '../utils/axios';  // Use our custom axios instance
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

const ProfileImageModal = ({ onClose, currentImage, onImageUpload }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (selectedFile) {
      onImageUpload(selectedFile);
    }
    onClose();
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
            {/* Preview Image */}
            {selectedImage ? (
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="w-full h-full object-cover"
              />
            ) : (
              <img 
                src={currentImage} 
                alt="Current" 
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = defaultUserImage;
                }}
              />
            )}
            
            {/* Upload Overlay */}
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                <CameraIcon />
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button 
            className="flex-1 py-3 bg-white text-[#D62929] rounded-lg border border-[#D62929]"
            onClick={onClose}
          >
            Cancel
          </button>
          <button 
            className="flex-1 py-3 bg-[#D62929] text-white rounded-lg"
            onClick={handleSave}
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
  const [isEditing, setIsEditing] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [toast, setToast] = useState(null);
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    image: null
  });
  const [editedProfile, setEditedProfile] = useState({
    name: '',
    email: ''
  });

  // Utility function to construct full image URL
  const constructImageUrl = (imagePath) => {
    // If no image path, return default
    if (!imagePath) return defaultUserImage;

    // If it's already a full URL, return it
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Construct URL using base API URL
    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
    const fullUrl = `${baseUrl}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;

    console.log('Constructed Image URL:', {
      originalPath: imagePath,
      baseUrl: baseUrl,
      fullUrl: fullUrl
    });

    return fullUrl;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/api/profile');
        if (response.data.success) {
          const userData = response.data.user;
          
          // Construct full image URL or use default
          const fullImageUrl = constructImageUrl(userData.image);

          console.log('Profile Image Details:', {
            userDataImage: userData.image,
            fullImageUrl: fullImageUrl,
            defaultUserImage: defaultUserImage
          });

          setProfile({
            ...userData,
            image: fullImageUrl  // Always use full URL or default
          });

          // Update edited profile for form
          setEditedProfile({
            name: userData.name,
            email: userData.email
          });

          // Update localStorage with image info
          const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');
          userInfo.image = userData.image || null;  // Store relative path or null
          localStorage.setItem('userInfo', JSON.stringify(userInfo));
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        
        // More detailed error handling
        if (error.response) {
          setToast({
            type: 'error',
            message: 'Server Error',
            subMessage: error.response.data.message || 'Failed to load profile'
          });
        } else if (error.request) {
          setToast({
            type: 'error',
            message: 'Network Error',
            subMessage: 'Unable to connect to the server. Please check your internet connection.'
          });
        } else {
          setToast({
            type: 'error',
            message: 'Error',
            subMessage: 'An unexpected error occurred'
          });
        }
      }
    };

    fetchProfile();
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel editing - reset to original values
      setEditedProfile({
        name: profile.name,
        email: profile.email
      });
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      const response = await axios.put('/api/profile', editedProfile);
      const { success, user } = response.data;

      if (success && user) {
        setProfile({
          ...profile,
          name: user.name,
          email: user.email
        });
        setIsEditing(false);
        setToast({
          type: 'success',
          message: 'Profile Updated',
          subMessage: 'Your changes have been saved'
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setToast({
        type: 'error',
        message: 'Update Failed',
        subMessage: error.response?.data?.message || 'Please try again later'
      });
    }
  };

  const handleImageUpload = async (file) => {
    try {
      // Validate file before upload
      const validImageTypes = ['image/jpeg', 'image/png', 'image/gif'];
      const maxFileSize = 5 * 1024 * 1024; // 5MB

      if (!validImageTypes.includes(file.type)) {
        setToast({
          type: 'error',
          message: 'Invalid File Type',
          subMessage: 'Only JPEG, PNG, and GIF images are allowed'
        });
        return;
      }

      if (file.size > maxFileSize) {
        setToast({
          type: 'error',
          message: 'File Too Large',
          subMessage: 'Image must be less than 5MB'
        });
        return;
      }

      const formData = new FormData();
      formData.append('image', file);

      const response = await axios.post('/api/profile/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const { success, imageUrl, message } = response.data;

      console.log('Image Upload Response:', {
        success,
        imageUrl,
        message,
        defaultUserImage
      });

      if (success && imageUrl) {
        // Construct full image URL
        const fullImageUrl = constructImageUrl(imageUrl);

        // Update profile state with full URL
        setProfile(prevProfile => ({
          ...prevProfile,
          image: fullImageUrl || defaultUserImage
        }));

        // Update localStorage
        const userInfo = JSON.parse(localStorage.getItem('userInfo'));
        userInfo.image = imageUrl || null;  // Store relative path or null
        localStorage.setItem('userInfo', JSON.stringify(userInfo));

        // Close modal and show success toast
        setShowImageModal(false);
        setToast({
          type: 'success',
          message: 'Image Updated',
          subMessage: message || 'Your profile picture has been updated'
        });

        // Trigger image update event for other components
        window.dispatchEvent(new CustomEvent('userImageUpdated', { 
          detail: { 
            imageUrl: fullImageUrl || defaultUserImage,
            userId: userInfo._id
          } 
        }));
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      
      // Handle different types of errors
      const errorResponse = error.response?.data || {};
      const errorMessage = errorResponse.message || 'Upload Failed';
      const errorDetails = errorResponse.details || {};

      setToast({
        type: 'error',
        message: 'Upload Failed',
        subMessage: errorMessage,
        additionalInfo: JSON.stringify(errorDetails)
      });

      // Log detailed error information
      console.error('Detailed Upload Error:', {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      const response = await axios.delete('/api/users/delete-account');
      if (response.data.success) {
        // Clear local storage and redirect to login
        localStorage.removeItem('userToken');
        navigate('/login');
      } else {
        setToast({
          type: 'error',
          message: 'Error',
          subMessage: 'Failed to delete account'
        });
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setToast({
        type: 'error',
        message: 'Error',
        subMessage: error.response?.data?.message || 'Failed to delete account'
      });
    }
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
                value={editedProfile.name}
                onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                className={`w-full p-2 rounded-lg ${isEditing ? 'bg-white border border-gray-300' : 'bg-[#FFE5E5]'}`}
                readOnly={!isEditing}
              />
            </div>

            <div>
              <label className="text-sm text-gray-600 mb-1 block">Email</label>
              <input 
                type="email"
                value={editedProfile.email}
                onChange={(e) => setEditedProfile({ ...editedProfile, email: e.target.value })}
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
                    onClick={handleEditToggle}
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
                src={constructImageUrl(profile.image)} 
                alt="Profile" 
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  console.log('Image load error:', {
                    currentSrc: e.target.src,
                    defaultImage: defaultUserImage,
                    profileImage: profile.image
                  });
                  e.target.src = defaultUserImage;
                }}
              />
              {/* Edit Icon Circle */}
              <div 
                className="absolute bottom-0 right-0 w-8 h-8 bg-[#D62929] rounded-full flex items-center justify-center cursor-pointer border-2 border-white"
                onClick={() => setShowImageModal(true)}
              >
                <CameraIcon className="w-4 h-4 text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Account Button */}
      <div className="mt-8">
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setShowDeleteConfirm(false)} />
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 w-[90%] max-w-[320px] z-30">
            <h2 className="text-xl font-semibold mb-4">Delete Account</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex gap-4">
              <button
                className="flex-1 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                onClick={handleDeleteAccount}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}

      {showImageModal && (
        <ProfileImageModal 
          onClose={() => setShowImageModal(false)} 
          currentImage={profile.image} 
          onImageUpload={(file) => {
            const formData = new FormData();
            formData.append('image', file);

            axios.post('/api/profile/upload-image', formData, {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            })
            .then((response) => {
              const { success, imageUrl, message } = response.data;

              if (success && imageUrl) {
                const fullImageUrl = constructImageUrl(imageUrl);

                setProfile({
                  ...profile,
                  image: fullImageUrl
                });

                const userInfo = JSON.parse(localStorage.getItem('userInfo'));
                userInfo.image = imageUrl;  
                localStorage.setItem('userInfo', JSON.stringify(userInfo));

                setShowImageModal(false);
                setToast({
                  type: 'success',
                  message: 'Image Updated',
                  subMessage: message || 'Your profile picture has been updated'
                });

                window.dispatchEvent(new CustomEvent('userImageUpdated', { 
                  detail: { 
                    imageUrl: fullImageUrl,
                    userId: userInfo._id
                  } 
                }));
              }
            })
            .catch((error) => {
              console.error('Error uploading image:', error);
              setToast({
                type: 'error',
                message: 'Upload Failed',
                subMessage: error.response?.data?.message || 'Please try again later'
              });
            });
          }} 
        />
      )}

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