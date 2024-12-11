import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BottomNavBar from '../components/BottomNavBar';

const ListDetailsScreen = () => {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [list, setList] = useState(location.state?.list || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchList = async () => {
      try {
        const token = localStorage.getItem('userToken');
        const response = await axios.get(`http://localhost:3000/api/lists/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setList(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching list:', error);
        setError('Failed to load list details');
        setLoading(false);
      }
    };

    // If we don't have the list data from navigation state, fetch it
    if (!list) {
      fetchList();
    } else {
      setLoading(false);
    }
  }, [id, list]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
  }

  if (!list) {
    return <div className="min-h-screen flex items-center justify-center">List not found</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="text-gray-600"
          >
            ←
          </button>
          <h1 className="text-xl font-medium">{list.title}</h1>
          <div className="w-8"></div> {/* Spacer for alignment */}
        </div>
      </div>

      {/* List Items */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {list.items && list.items.length > 0 ? (
          <div className="space-y-3">
            {list.items.map((item, index) => (
              <div 
                key={item._id || index}
                className="bg-white p-4 rounded-lg shadow-sm flex items-center justify-between"
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={item.isCompleted}
                    className="mr-3"
                    onChange={() => {
                      // Add checkbox handling logic here
                    }}
                  />
                  <span className={item.isCompleted ? 'line-through text-gray-400' : ''}>
                    {item.name}
                  </span>
                </div>
                <span className="text-gray-500">{item.quantity}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-8">
            No items in this list yet
          </div>
        )}
      </div>

      {/* Add Item Button */}
      <div className="fixed bottom-20 right-4">
        <button 
          className="bg-blue-500 text-white w-12 h-12 rounded-full shadow-lg flex items-center justify-center text-2xl"
          onClick={() => {
            // Add "add item" logic here
          }}
        >
    
        </button>
      </div>

      <BottomNavBar />
    </div>
  );
};

export default ListDetailsScreen; 