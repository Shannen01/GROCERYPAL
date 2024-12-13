import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from '../utils/axios';
import BottomNavBar from '../components/BottomNavBar';
import { formatDistanceToNow } from 'date-fns';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const response = await axios.get('http://localhost:3000/api/notifications', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        // Log full notification details
        console.log('Fetched Notifications:', {
          count: response.data.length,
          notifications: response.data.map(notification => ({
            id: notification._id,
            type: notification.type,
            message: notification.message,
            relatedList: notification.relatedList,
            recipient: notification.recipient,
            sender: notification.sender,
            read: notification.read
          }))
        });
        
        setNotifications(response.data);
      } catch (error) {
        console.error('Error fetching notifications:', {
          errorMessage: error.message,
          errorResponse: error.response ? error.response.data : 'No response data',
          errorStatus: error.response ? error.response.status : 'No status'
        });
        toast.error('Failed to load notifications');
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const formatTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      // Fallback to basic date format if date-fns fails
      return new Date(date).toLocaleDateString();
    }
  };

  const handleAcceptList = async (notification) => {
    try {
      const token = localStorage.getItem('userToken');
      
      // Extract list ID correctly
      const listId = typeof notification.relatedList === 'object' 
        ? notification.relatedList._id 
        : notification.relatedList;
      
      // Comprehensive logging of acceptance attempt
      console.log('Attempting to accept shared list:', {
        notificationId: notification._id,
        listId: listId,
        listTitle: notification.listDetails?.title || 'Unnamed List',
        sender: notification.sender,
        currentStatus: notification.status
      });

      // Validate inputs
      if (!listId) {
        throw new Error('No list ID found in notification');
      }

      // Detailed request logging
      const response = await axios.post(
        'http://localhost:3000/api/lists/accept-shared', 
        {
          notificationId: notification._id,
          listId: listId
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Log successful response
      console.log('List acceptance response:', {
        status: response.status,
        data: response.data
      });

      // Update the notification in local state
      setNotifications(prev => 
        prev.map(n => 
          n._id === notification._id 
            ? { 
                ...n, 
                status: 'ACCEPTED', 
                read: true,
                updatedAt: new Date().toISOString()
              } 
            : n
        )
      );

      // Show success toast
      toast.success('List accepted successfully!');

      // Optional: Navigate to the list or refresh lists
      // You might want to implement this based on your app's navigation strategy
      // navigate(`/lists/${listId}`);

    } catch (error) {
      // Extremely detailed error logging
      console.error('Full error details when accepting list:', {
        errorMessage: error.message,
        errorResponse: error.response ? error.response.data : 'No response data',
        errorStatus: error.response ? error.response.status : 'No status',
        notificationId: notification._id,
        listId: typeof notification.relatedList === 'object' 
          ? notification.relatedList._id 
          : notification.relatedList
      });

      // More specific error handling
      if (error.response) {
        const errorData = error.response.data;
        
        // Map error codes to user-friendly messages
        const errorMessages = {
          'ALREADY_ACCEPTED': 'This list has already been accepted',
          'MISSING_NOTIFICATION_ID': 'Notification ID is missing',
          'MISSING_LIST_ID': 'List ID is missing',
          'INVALID_NOTIFICATION_ID': 'Invalid notification ID',
          'INVALID_LIST_ID': 'Invalid list ID',
          'NOTIFICATION_NOT_FOUND': 'Notification not found',
          'LIST_NOT_FOUND': 'List not found',
          'LIST_ALREADY_SHARED': 'This list is already shared with you',
          'INTERNAL_SERVER_ERROR': 'An unexpected error occurred'
        };

        const userMessage = errorMessages[errorData.errorCode] || 
          errorData.message || 
          'Failed to accept list';

        toast.error(userMessage);
      } else if (error.request) {
        toast.error('No response received from server');
      } else {
        toast.error(error.message || 'Error setting up the request');
      }
    }
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark notification as read
      await axios.patch(`/api/notifications/${notification._id}/read`);
      
      // If it's a shared list notification, navigate to the list
      if (notification.type === 'LIST_SHARED' && notification.relatedList) {
        navigate(`/lists/${notification.relatedList}`);
      }

      // Update notifications list
      setNotifications(notifications.map(n => 
        n._id === notification._id ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error('Error handling notification:', error);
    }
  };

  const handleDeleteNotification = async (notification) => {
    try {
      const token = localStorage.getItem('userToken');
      
      // Log detailed request information before making the call
      console.log('Attempting to delete notification:', {
        notificationId: notification._id,
        notificationType: notification.type,
        token: token ? 'Token present' : 'No token',
        fullURL: `http://localhost:3000/api/notifications/${notification._id}`
      });
      
      // Call backend to delete the notification
      const response = await axios.delete(
        `http://localhost:3000/api/notifications/${notification._id}`, 
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Log successful response
      console.log('Delete notification response:', {
        status: response.status,
        data: response.data
      });

      // Remove the notification from local state
      setNotifications(prev => 
        prev.filter(n => n._id !== notification._id)
      );

      toast.success('Notification deleted successfully');
    } catch (error) {
      // Extremely detailed error logging
      console.error('Full error details when deleting notification:', {
        errorMessage: error.message,
        errorResponse: error.response ? error.response.data : 'No response data',
        errorStatus: error.response ? error.response.status : 'No status',
        errorHeaders: error.config ? error.config.headers : 'No headers',
        errorRequestData: error.config ? error.config.data : 'No request data',
        notificationId: notification._id
      });

      // More specific error handling
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        toast.error(error.response.data.message || 'Failed to delete notification');
      } else if (error.request) {
        // The request was made but no response was received
        toast.error('No response received from server');
      } else {
        // Something happened in setting up the request that triggered an Error
        toast.error(error.message || 'Error setting up the request');
      }
    }
  };

  const fetchLists = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.get('http://localhost:3000/api/lists', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Log the fetched lists for debugging
      console.log('Fetched lists after acceptance:', response.data);
      
      return response.data;
    } catch (error) {
      console.error('Error fetching lists:', error);
      toast.error('Failed to refresh lists');
      return [];
    }
  };

  const renderNotificationContent = (notification) => {
    // Check notification status
    const isAccepted = notification.status === 'ACCEPTED';

    switch (notification.type) {
      case 'LIST_SHARED':
        return (
          <div className={`notification-content ${isAccepted ? 'opacity-50' : ''}`}>
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{notification.sender.name} shared a list</p>
                <p className="text-sm text-gray-600">
                  {notification.listDetails?.title || 'Unnamed List'}
                </p>
                {isAccepted && (
                  <span className="text-xs text-green-600 mt-1 block">
                    Accepted on {new Date().toLocaleDateString()}
                  </span>
                )}
              </div>
              {!isAccepted && (
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleAcceptList(notification)}
                    className="bg-green-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Accept
                  </button>
                  <button 
                    onClick={() => handleDeleteNotification(notification)}
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                  >
                    Reject
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      case 'LIST_ACCEPTED':
        return (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 mb-2 flex items-center justify-between">
            <div className="flex-grow mr-4">
              <p className="text-sm font-medium text-gray-800 truncate">
                {notification.sender?.name || 'Someone'} accepted your shared list
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500 mr-2">
                {formatTime(notification.createdAt)}
              </span>
              <button 
                onClick={() => handleDeleteNotification(notification)}
                className="text-gray-500 hover:text-red-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        );
      case 'FRIEND_REQUEST':
        return (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 mb-2 flex items-center justify-between">
            <div className="flex-grow mr-4">
              <p className="text-sm font-medium text-gray-800 truncate">
                {notification.sender?.name || 'Someone'} sent you a friend request
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button 
                className="bg-[#D62929] text-white text-xs px-3 py-1.5 rounded-md hover:bg-red-700 transition-colors mr-2"
              >
                Accept
              </button>
              <button 
                onClick={() => handleDeleteNotification(notification)}
                className="text-gray-500 hover:text-red-600 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-3 mb-2 flex items-center justify-between">
            <p className="text-sm text-gray-800 flex-grow">{notification.message}</p>
            <button 
              onClick={() => handleDeleteNotification(notification)}
              className="text-gray-500 hover:text-red-600 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* Header */}
      <div className="bg-[#D62929] p-4 mb-4 shadow-sm">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/list')}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 mr-3"
          >
            <img 
              src="/src/assets/back.png" 
              alt="Back" 
              className="w-5 h-5 brightness-0 invert"
            />
          </button>
          <h1 className="text-[24px] font-bold text-white">Notifications</h1>
        </div>
      </div>

      {/* Notifications Container */}
      <div className="px-4">
        {notifications.length === 0 ? (
          <div className="text-center text-gray-500 mt-10">
            <p>No notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(notification => (
              <div 
                key={notification._id} 
                className="transition-all duration-200 ease-in-out"
              >
                {renderNotificationContent(notification)}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationScreen;