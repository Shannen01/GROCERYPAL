import { useState, useEffect } from 'react';
import userIcon from '../assets/user.png';

export const useUserImage = () => {
  const [userImage, setUserImage] = useState(userIcon);

  useEffect(() => {
    const loadUserImage = () => {
      const userInfo = localStorage.getItem('userInfo');
      
      if (userInfo) {
        try {
          const user = JSON.parse(userInfo);
          const displayImage = user.image 
            ? `${import.meta.env.VITE_API_URL}${user.image}` 
            : userIcon;
          
          setUserImage(displayImage);
        } catch (error) {
          console.error('Error parsing user image:', error);
        }
      }
    };

    loadUserImage();

    // Listen for image updates
    const handleImageUpdate = (e) => {
      if (e.detail && e.detail.imageUrl) {
        setUserImage(e.detail.imageUrl);
      } else {
        loadUserImage();
      }
    };

    const handleStorageChange = (e) => {
      if (e.key === 'userInfo') {
        try {
          const updatedUserInfo = JSON.parse(e.newValue);
          if (updatedUserInfo && updatedUserInfo.image) {
            const newImageUrl = `${import.meta.env.VITE_API_URL}${updatedUserInfo.image}`;
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
