import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import searchIcon from '../assets/search.png';
import BottomNavBar from '../components/BottomNavBar';

const calculateProgress = (list) => {
  if (!list.items || list.items.length === 0) return 0;
  const completedItems = list.items.filter(item => item.checked).length;
  return (completedItems / list.items.length) * 100;
};

const EmptyListView = ({ listTitle }) => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="flex items-center p-4 border-b">
        <button className="mr-4 text-gray-600">←</button>
        <h1 className="text-xl font-medium">{listTitle}</h1>
        <div className="flex-1"></div>
        <button className="mr-2">👤</button>
        <button>⋮</button>
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)]">
        <img 
          src={mascotImage} 
          alt="Mascot"
          className="w-32 h-32 mb-6"
        />
        <h2 className="text-xl font-medium mb-2">What do you need to buy?</h2>
        <p className="text-gray-500 text-center">
          Tap the plus button to start adding products
        </p>
      </div>

      {/* Add Button */}
      <div className="fixed bottom-6 right-6">
        <button className="bg-blue-500 text-white px-6 py-3 rounded-full flex items-center shadow-lg">
          <span className="text-2xl mr-2">+</span>
          ADD
        </button>
      </div>
    </div>
  );
};

const ConfirmDialog = ({ title, message, onConfirm, onCancel }) => {
  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onCancel} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl p-4 z-50 max-w-md mx-auto">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-600 mb-4">{message}</p>
        <div className="flex justify-end gap-3">
          <button 
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            Cancel
          </button>
          <button 
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </>
  );
};

const ShareModal = ({ onClose, list }) => {
  const [email, setEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState('');

  const handleSend = async () => {
    if (!email) {
      setError('Please enter an email address');
      return;
    }

    setIsSharing(true);
    setError('');

    try {
      console.log('Sharing list:', { 
        listId: list._id, 
        recipientEmail: email 
      });

      const response = await axios.post(`/api/lists/${list._id}/share`, {
        recipientEmail: email
      });

      if (response.data.success) {
        toast.success('List shared successfully');
        onClose();
      }
    } catch (error) {
      console.error('Full error details:', {
        response: error.response,
        request: error.request,
        message: error.message
      });

      setError(error.response?.data?.message || 'Failed to share list');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl p-4 z-50 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Share this list</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        <p className="text-gray-600 text-sm mb-4">
          Share this list with another GroceryPal user 🚀
        </p>

        <div className="relative mb-4">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
            </svg>
          </div>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError('');
            }}
            placeholder="Enter email address"
            className={`w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg ${error ? 'border border-red-500' : ''}`}
          />
        </div>

        {error && (
          <div className="mb-4 text-sm text-red-500">
            {error}
          </div>
        )}

        <button
          onClick={handleSend}
          disabled={isSharing}
          className={`w-full py-2 rounded-lg font-medium ${
            isSharing 
              ? 'bg-gray-400 text-white cursor-not-allowed'
              : 'bg-[#E4A76F] text-white hover:bg-[#d69a62]'
          }`}
        >
          {isSharing ? 'Sharing...' : 'Share'}
        </button>
      </div>
    </>
  );
};

const ManageListModal = ({ onClose, list, onDelete }) => {
  const [showShareModal, setShowShareModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [error, setError] = useState(null);

  if (!list) return null;

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('userToken');
      await axios.delete(`http://localhost:3000/api/lists/${list._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Show success toast
      toast.success('List deleted successfully', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      // Update UI and close modal
      if (onDelete) {
        onDelete(list._id);
      }
      onClose();

    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Failed to delete list');
    }
  };

  const handleCopyList = () => {
    // Create a formatted string representation of the list
    const listContent = `List: ${list.name}\n\nItems:\n${list.items.map((item, index) => 
      `${index + 1}. ${item.name}${item.quantity ? ` (${item.quantity})` : ''}`
    ).join('\n')}`;

    // Copy to clipboard
    navigator.clipboard.writeText(listContent).then(() => {
      toast.success('List copied to clipboard', {
        position: "top-center",
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      onClose();
    }).catch(err => {
      console.error('Failed to copy list:', err);
      toast.error('Failed to copy list');
    });
  };

  return (
    <>
      {/* First Modal - Manage List */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl p-4 z-40 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Manage list</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <button 
            className="w-full flex items-center gap-3 py-2 hover:bg-gray-50"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowShareModal(true);
            }}
          >
            <span className="text-gray-400">👥</span>
            <span>Share</span>
          </button>
          <button 
            className="w-full flex items-center gap-3 py-2 hover:bg-gray-50"
            onClick={handleCopyList}
          >
            <span className="text-gray-400">📋</span>
            <span>Copy</span>
          </button>
          <button 
            className="w-full flex items-center gap-3 py-2 hover:bg-gray-50 text-red-500"
            onClick={() => setShowDeleteConfirm(true)}
          >
            <span>🗑️</span>
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Share Modal */}
      {showShareModal && (
        <div className="relative z-50">
          <ShareModal 
            onClose={() => {
              setShowShareModal(false);
              onClose();
            }} 
            list={list}
          />
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <ConfirmDialog
          title="Delete List"
          message={`Are you sure you want to delete "${list.name}"? This action cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setShowDeleteConfirm(false)}
        />
      )}
    </>
  );
};

const AddListModal = ({ onClose, onSave }) => {
  const [title, setTitle] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSave = async () => {
    if (!title.trim()) {
      setError('Please enter a title');
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.post('http://localhost:3000/api/lists', 
        { name: title },
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      // Log extensive details
      console.error('LIST CREATION DEBUG:', {
        listId: response.data._id,
        listName: response.data.name,
        fullResponse: response.data
      });

      // Explicitly log before navigation
      console.error('ATTEMPTING NAVIGATION TO ADD ITEMS SCREEN');

      // Use window.location as a fallback
      window.location.href = `/add-items-to-list?listId=${response.data._id}`;
      
      // Still keep navigate for potential React Router handling
      navigate('/add-items-to-list', { 
        state: { 
          list: response.data,
          debugSource: 'ListScreen AddListModal'
        } 
      });

      onSave(response.data);
      onClose();
      
    } catch (err) {
      console.error('FULL LIST CREATION ERROR:', err);
      setError('Failed to create list. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-[32px] p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-[#2D2D2D] text-2xl font-semibold">Add New List</h2>
          <button onClick={onClose} className="text-[#7F3DFF] text-xl">
            ✕
          </button>
        </div>

        <div className="mb-6">
          <label className="block text-[#2D2D2D] mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-4 border border-gray-200 rounded-xl"
            placeholder="-"
          />
          {error && <p className="text-red-500 mt-2 text-sm">{error}</p>}
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-[#E4B5A3] text-white py-4 rounded-xl font-medium"
        >
          Save
        </button>
      </div>
    </div>
  );
};

const ListScreen = () => {
  const [lists, setLists] = useState([]);
  const [error, setError] = useState(null);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedList, setSelectedList] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchLists = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const response = await axios.get('http://localhost:3000/api/lists', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      // Sort lists by most recently updated
      const sortedLists = response.data.sort((a, b) => 
        new Date(b.updatedAt) - new Date(a.updatedAt)
      );

      setLists(sortedLists);
    } catch (error) {
      console.error('Error fetching lists:', error);
      setError('Failed to load lists');
    }
  };

  useEffect(() => {
    // Check if we have an updated list from navigation
    if (location.state?.updatedList) {
      // Update the specific list in our lists array
      setLists(prevLists => 
        prevLists.map(list => 
          list._id === location.state.updatedList._id 
            ? location.state.updatedList 
            : list
        )
      );
    }
    
    fetchLists();
  }, [location.key, location.state]);

  const filteredLists = useMemo(() => {
    return lists.filter(list => 
      list.title && list.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [lists, searchQuery]);

  const handleShareList = async () => {
    try {
      const token = localStorage.getItem('userToken');
      console.log('Token:', token); // Log the token
      
      if (!token) {
        toast.error('Authentication token is missing. Please log in again.');
        return;
      }

      // Basic email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(recipientEmail)) {
        toast.error('Please enter a valid email address');
        return;
      }

      const response = await axios.post(
        `http://localhost:3000/api/lists/${selectedList._id}/share`,
        { recipientEmail },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Success toast
      toast.success(`List shared with ${recipientEmail}`);
      
      // Reset modal state
      setShowShareModal(false);
      setRecipientEmail('');
    } catch (error) {
      console.error('Full share error:', error.response || error);
      // Error handling
      const errorMessage = error.response?.data?.message || 'Failed to share list';
      toast.error(errorMessage);

      // If unauthorized, prompt re-login
      if (error.response?.status === 401) {
        toast.error('Your session has expired. Please log in again.');
        // Optional: Redirect to login or trigger logout
        // navigate('/login');
      }
    }
  };

  const handleShare = async () => {
    if (!recipientEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setIsSharing(true);
    try {
      const response = await axios.post(`/api/lists/${selectedList._id}/share`, {
        recipientEmail
      });

      if (response.data.success) {
        toast.success('List shared successfully');
        setShowShareModal(false);
        setRecipientEmail('');
      }
    } catch (error) {
      toast.error('Failed to share list');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-[#D62929] p-4 pb-8">
        <h1 className="text-white text-2xl font-bold">My Lists</h1>
      </div>

      {/* Search Bar */}
      <div className="p-4 -mt-4 bg-[#D62929]">
        <div className="relative">
          <input
            type="text"
            placeholder="Search lists..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 pl-10 bg-gray-100 rounded-lg"
          />
          <img
            src={searchIcon}
            alt="Search"
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5"
          />
        </div>
      </div>

      {/* Lists */}
      <div className="p-4">
        {error ? (
          <div className="text-red-500 text-center">{error}</div>
        ) : filteredLists.length === 0 ? (
          <div className="text-center text-gray-500">No lists found</div>
        ) : (
          filteredLists.map((list) => (
            <div 
              key={list._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4 cursor-pointer"
              onClick={() => navigate(`/add-items-to-list`, { 
                state: { list: list }
              })}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <h2 className="text-lg font-medium text-gray-800">{list.title}</h2>
                  <p className="text-sm text-gray-500">
                    {list.items?.length || 0} items
                  </p>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent list navigation
                      setSelectedList(list);
                      setShowManageModal(true);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ⋮
                  </button>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-[#D62929] h-2.5 rounded-full" 
                    style={{ width: `${calculateProgress(list)}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">
                  {list.items.filter(item => item.checked).length}/{list.items.length}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddListModal
          onClose={() => setShowAddModal(false)}
          onSave={(newList) => {
            setLists([...lists, newList]);
            setShowAddModal(false);
          }}
        />
      )}

      {showManageModal && selectedList && (
        <ManageListModal
          list={selectedList}
          onClose={() => {
            setShowManageModal(false);
            setSelectedList(null);
          }}
          onDelete={(deletedListId) => {
            setLists(lists.filter(list => list._id !== deletedListId));
            setShowManageModal(false);
            setSelectedList(null);
          }}
        />
      )}

      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-2xl p-4 z-50 max-w-md mx-auto">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-xl font-semibold">Share this list</h2>
              <button onClick={() => setShowShareModal(false)} className="text-gray-400 hover:text-gray-600">
                ×
              </button>
            </div>

            <p className="text-gray-600 text-sm mb-4">
              Share this list with another GroceryPal user 🚀
            </p>

            <div className="relative mb-4">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
              </div>
              <input
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg"
              />
            </div>

            <button
              onClick={handleShareList}
              style={{ backgroundColor: 'red', color: 'white' }}
              className="w-full py-2 rounded-lg font-medium"
            >
              Share
            </button>
          </div>
        </div>
      )}

      <BottomNavBar />
    </div>
  );
};

export default ListScreen;