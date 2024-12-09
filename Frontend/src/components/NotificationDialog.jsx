import React from 'react';

const NotificationDialog = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const notifications = [
    {
      id: 1,
      title: "New Feature Available",
      message: "You can now share your grocery lists with family members!",
      time: "2 hours ago",
      isNew: true
    },
    {
      id: 2,
      title: "Weekly Summary",
      message: "You've completed 5 grocery lists this week. Great job!",
      time: "1 day ago",
      isNew: true
    },
    {
      id: 3,
      title: "Reminder",
      message: "Don't forget to check your shared grocery list",
      time: "2 days ago",
      isNew: false
    }
  ];

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300"
        onClick={onClose}
      />
      <div className="fixed top-0 right-0 h-full w-[320px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Notifications</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Notifications List */}
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div 
                key={notification.id}
                className={`p-4 rounded-lg ${notification.isNew ? 'bg-orange-50' : 'bg-gray-50'} transition-colors duration-200 cursor-pointer hover:bg-orange-100`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-medium text-gray-800">{notification.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-2">{notification.time}</p>
                  </div>
                  {notification.isNew && (
                    <span className="w-2 h-2 bg-orange-400 rounded-full mt-2"></span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Clear All Button */}
          <button 
            className="w-full mt-6 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            Clear all notifications
          </button>
        </div>
      </div>
    </>
  );
};

export default NotificationDialog;
