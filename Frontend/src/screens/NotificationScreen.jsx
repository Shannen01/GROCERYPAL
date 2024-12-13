import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axios';
import BottomNavBar from '../components/BottomNavBar';
import { formatDistanceToNow } from 'date-fns';

const NotificationScreen = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (error) {
      // Fallback to basic date format if date-fns fails
      return new Date(date).toLocaleDateString();
    }
  };

  const renderNotificationContent = (notification) => {
    switch (notification.type) {
      case 'LIST_SHARED':
        return (
          <div>
            <p className={`${notification.read ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
              {notification.message}
            </p>
            <div>
              <p className="font-semibold">List Details:</p>
              <p className="text-gray-600">Title: {notification.listDetails.title}</p>
              <div className="mt-2">
                <p className="font-medium">Items:</p>
                <ul className="list-disc pl-5">
                  {notification.listDetails.items.map((item, index) => (
                    <li 
                      key={index} 
                      className={`${item.checked ? 'line-through text-gray-500' : ''}`}
                    >
                      {item.name} 
                      {item.quantity && ` (${item.quantity})`}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        );
      // Add other notification types as needed
      default:
        return (
          <div>
            <p className={`${notification.read ? 'text-gray-600' : 'text-gray-800 font-medium'}`}>
              {notification.message}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {formatTime(notification.createdAt)}
            </p>
          </div>
        );
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

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#D62929] p-4">
        <h1 className="text-white text-xl font-semibold">Notifications</h1>
      </div>

      {/* Notifications List */}
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D62929]"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            No notifications yet
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 mb-4 rounded-lg shadow-sm border ${
                notification.read ? 'bg-gray-50' : 'bg-white border-[#E4A76F]'
              } cursor-pointer transition-colors hover:bg-gray-50`}
            >
              {renderNotificationContent(notification)}
            </div>
          ))
        )}
      </div>

      <BottomNavBar />
    </div>
  );
};

export default NotificationScreen;