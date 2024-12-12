import { useState, useEffect } from 'react';
import userIcon from '../assets/user.png';

const constructImageUrl = (imagePath) => {
  // If no image path, return default
  if (!imagePath) return userIcon;

  // If it's already a full URL, return it
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // Construct URL using base API URL
  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';
  const fullUrl = `${baseUrl}${imagePath.startsWith('/') ? imagePath : `/${imagePath}`}`;

  console.log('Constructed User Image URL:', {
    originalPath: imagePath,
    baseUrl: baseUrl,
    fullUrl: fullUrl
  });

  return fullUrl || userIcon;
};

export const useUserImage = () => {
  const [userImage, setUserImage] = useState(userIcon);

  useEffect(() => {
    const loadUserImage = () => {
      const userInfo = localStorage.getItem('userInfo');
      
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo);
          const displayImage = user.image 
            ? constructImageUrl(user.image)
            : userIcon;
          
          console.log('Loading User Image:', {
            userInfoImage: user.image,
            displayImage: displayImage
          });

          setUserImage(displayImage);
        } catch (error) {
          console.error('Error parsing user image:', error);
          setUserImage(userIcon);
        }
      }
    };

    loadUserImage();

    // Listen for image updates
    const handleImageUpdate = (e) => {
      console.log('Image Update Event:', e.detail);
      
      if (e.detail && e.detail.imageUrl) {
        const processedImageUrl = constructImageUrl(e.detail.imageUrl);
        setUserImage(processedImageUrl);
      } else {
        loadUserImage();
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === 'userInfo') {
        try {
          const updatedUserInfo = JSON.parse(e.newValue);
          if (updatedUserInfo && updatedUserInfo.image) {
            const newImageUrl = constructImageUrl(updatedUserInfo.image);
            console.log('Storage Change Image:', {
              storageImage: updatedUserInfo.image,
              processedImageUrl: newImageUrl
            });
            setUserImage(newImageUrl);
          }
        } catch (error) {
          console.error('Error parsing storage update:', error);
        }
      }
    };

    window.addEventListener('userImageUpdated', handleImageUpdate);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('userImageUpdated', handleImageUpdate);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return userImage;
};
