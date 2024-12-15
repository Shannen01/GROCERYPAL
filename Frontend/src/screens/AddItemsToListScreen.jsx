import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import Toast from '../components/Toast';

// Import default fallback image
import DefaultCategoryIcon from '../assets/PantryPal.png';

// Import all category images
import BabyFoodIcon from '../assets/Baby food.png';
import BeansIcon from '../assets/Beans.png';
import BeveragesIcon from '../assets/beverages.png';
import BreadIcon from '../assets/Bread.png';
import CannedGoodsIcon from '../assets/canned-goods.png';
import ChickenIcon from '../assets/Chicken.png';
import CondimentsIcon from '../assets/condiments.png';
import DairyIcon from '../assets/dairy.png';
import EggIcon from '../assets/Egg.png';
import FrozenIcon from '../assets/frozen.png';
import FruitsIcon from '../assets/Fruits.png';
import IceCreamIcon from '../assets/ice cream.png';
import MeatIcon from '../assets/Meat.png';
import PersonalCareIcon from '../assets/PersonalCare.png';
import PetFoodIcon from '../assets/pet-food.png';
import SeafoodIcon from '../assets/Seafood.png';
import VegetableIcon from '../assets/vegetable.png';
import backIcon from '../assets/back.png';
import deleteIcon from '../assets/delete.png';  // Make sure this file exists
import shareIcon from '../assets/share.png';    // Make sure this file exists
import moreIcon from '../assets/more.png';

console.log('Category Images:', {
  FruitsIcon,
  VegetableIcon,
  BabyFoodIcon,
  BeansIcon,
  BeveragesIcon,
  BreadIcon,
  CannedGoodsIcon,
  ChickenIcon,
  CondimentsIcon,
  DairyIcon,
  EggIcon,
  FrozenIcon,
  IceCreamIcon,
  MeatIcon,
  PersonalCareIcon,
  PetFoodIcon,
  SeafoodIcon
});

const PREDEFINED_CATEGORIES = [
  { id: 'fruits', name: 'Fruits', image: FruitsIcon },
  { id: 'vegetables', name: 'Vegetables', image: VegetableIcon },
  { id: 'babyFood', name: 'Baby Food', image: BabyFoodIcon },
  { id: 'beans', name: 'Beans', image: BeansIcon },
  { id: 'beverages', name: 'Beverages', image: BeveragesIcon },
  { id: 'bread', name: 'Bread', image: BreadIcon },
  { id: 'cannedGoods', name: 'Canned Goods', image: CannedGoodsIcon },
  { id: 'chicken', name: 'Chicken', image: ChickenIcon },
  { id: 'condiments', name: 'Condiments', image: CondimentsIcon },
  { id: 'dairy', name: 'Dairy', image: DairyIcon },
  { id: 'eggs', name: 'Eggs', image: EggIcon },
  { id: 'frozen', name: 'Frozen', image: FrozenIcon },
  { id: 'iceCream', name: 'Ice Cream', image: IceCreamIcon },
  { id: 'meat', name: 'Meat', image: MeatIcon },
  { id: 'personalCare', name: 'Personal Care', image: PersonalCareIcon },
  { id: 'petFood', name: 'Pet Food', image: PetFoodIcon },
  { id: 'seafood', name: 'Seafood', image: SeafoodIcon }
];

// Create a mapping of category names to icons
const CATEGORY_ICONS = {
  'Baby Food': BabyFoodIcon,
  'Beans': BeansIcon,
  'Beverages': BeveragesIcon,
  'Bread': BreadIcon,
  'Canned Goods': CannedGoodsIcon,
  'Chicken': ChickenIcon,
  'Condiments': CondimentsIcon,
  'Dairy': DairyIcon,
  'Egg': EggIcon,
  'Frozen': FrozenIcon,
  'Fruits': FruitsIcon,
  'Ice Cream': IceCreamIcon,
  'Meat': MeatIcon,
  'Personal Care': PersonalCareIcon,
  'Pet Food': PetFoodIcon,
  'Seafood': SeafoodIcon,
  'Vegetable': VegetableIcon
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
      const token = localStorage.getItem('userToken');
      
      if (!token) {
        throw new Error('No authentication token found');
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setError('Please enter a valid email address');
        setIsSharing(false);
        return;
      }

      const response = await axios.post(`/api/lists/${list._id}/share`, {
        recipientEmail: email
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.data && response.data.success) {
        toast.success(`List "${list.title}" shared successfully with ${email}`);
        onClose();
      } else {
        throw new Error(response.data.message || 'Unknown error occurred');
      }
    } catch (error) {
      console.error('Full share list error details:', error);

      if (error.response) {
        const errorMessage = error.response.data.message || 
                             error.response.data.details?.message || 
                             'Failed to share list';
        
        setError(errorMessage);
      } else if (error.request) {
        setError('No response received from server. Please check your connection.');
      } else {
        setError(error.message || 'An unexpected error occurred');
      }
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
              : 'bg-[#CC0000] text-white hover:bg-[#FF0000]'
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
  const [error, setError] = useState(null);

  if (!list) return null;

  const handleCopyList = () => {
    const listName = (list?.name || list?.title || 'Unnamed List').toString().trim();
    const listItems = list?.items || [];
    const listCreatedAt = list?.createdAt || new Date().toISOString();

    const listContent = `📋 ${listName}

Items:
${listItems.map((item, index) => {
  const itemName = item.name || 'Unnamed Item';
  const itemQuantity = item.quantity ? `Qty: ${item.quantity}` : '';
  const itemChecked = item.checked ? '✅' : '☐';
  
  return `${itemChecked} ${index + 1}. ${itemName} ${itemQuantity}`.trim();
}).join('\n')}

Created: ${new Date(listCreatedAt).toLocaleDateString()}
Total Items: ${listItems.length}`;

    try {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(listContent)
          .then(() => {
            toast.success(`List "${listName}" copied successfully!`, {
              position: "top-center",
              autoClose: 2000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            });
            onClose();
          })
          .catch((err) => {
            toast.error('Failed to copy list');
          });
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = listContent;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        
        toast.success(`List "${listName}" copied successfully!`, {
          position: "top-center",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        onClose();
      }
    } catch (err) {
      toast.error('Failed to copy list');
    }
  };

  return (
    <>
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
        </div>
      </div>

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
    </>
  );
};

const AddItemsToListScreen = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [list, setList] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [itemName, setItemName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [items, setItems] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [showManageListModal, setShowManageListModal] = useState(false);

  useEffect(() => {
    // Log predefined categories at the top of the component
    console.log('Predefined Categories:', PREDEFINED_CATEGORIES);

    // Check if list came from create list screen
    if (location.state?.fromCreateList) {
      // Create a custom toast using the Toast component
      toast.success('List created successfully', {
        position: "top-center",
        autoClose: 3000
      });
    }

    // Existing list fetch logic
    const fetchListById = async () => {
      try {
        let listId;
        
        // First try to get listId from location state
        if (location.state?.listId) {
          listId = location.state.listId;
        } else if (location.state?.list) {
          // Fallback to old state format
          setList(location.state.list);
          listId = location.state.list._id;
        } else {
          // If not in state, get from URL params
          const searchParams = new URLSearchParams(location.search);
          listId = searchParams.get('listId');
        }

        // If not in search params, try getting from URL path
        if (!listId) {
          const pathParts = location.pathname.split('/');
          listId = pathParts[pathParts.length - 1];
        }

        if (!listId) {
          console.error('No list ID found');
          navigate('/list');
          return;
        }

        // Fetch the latest list data
        const token = localStorage.getItem('userToken');
        const response = await axios.get(
          `http://localhost:3000/api/lists/${listId}`,
          {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          }
        );

        setList(response.data);
        if (response.data.items) {
          // Add category icons to items
          const itemsWithIcons = response.data.items.map(item => {
            if (item.category) {
              const catDetails = PREDEFINED_CATEGORIES.find(cat => cat.id === item.category);
              return {
                ...item,
                categoryIcon: catDetails?.icon
              };
            }
            return item;
          });
          setItems(itemsWithIcons);
        }

      } catch (error) {
        console.error('Error fetching list:', error);
        toast.error('Failed to load list');
        navigate('/list');
      }
    };

    fetchListById();
  }, [location, navigate]);

  const handleAddItem = async () => {
    if (!itemName.trim()) {
      toast.error('Please enter an item name');
      return;
    }

    // Validate category selection
    if (!selectedCategory) {
      toast.error('Please select a category');
      return;
    }

    // For custom category, ensure a name is provided
    if (selectedCategory === 'custom' && !customCategory.trim()) {
      toast.error('Please enter a custom category name');
      return;
    }

    try {
      const token = localStorage.getItem('userToken');
      
      // Detailed logging of category selection
      console.log('Category Selection Details:', {
        selectedCategory,
        customCategory,
        allPredefinedCategories: PREDEFINED_CATEGORIES
      });

      // Determine category details
      let categoryToSave = selectedCategory;
      let categoryDetailsToSave = null;

      if (selectedCategory === 'custom') {
        // For custom category
        categoryToSave = customCategory.trim();
        categoryDetailsToSave = { 
          id: 'custom', 
          name: categoryToSave, 
          image: null 
        };
      } else {
        // For predefined categories
        const categoryDetails = PREDEFINED_CATEGORIES.find(cat => cat.id === selectedCategory);
        
        console.log('Found Category Details:', categoryDetails);

        if (categoryDetails) {
          categoryDetailsToSave = {
            id: categoryDetails.id,
            name: categoryDetails.name,
            image: categoryDetails.image
          };
        } else {
          console.error('No category details found for:', selectedCategory);
          toast.error('Invalid category selected');
          return;
        }
      }

      const newItem = {
        name: itemName.trim(),
        quantity: quantity || '',
        category: categoryToSave,
        categoryDetails: categoryDetailsToSave
      };

      console.log('Attempting to add item:', newItem);

      const response = await axios.post(
        `http://localhost:3000/api/lists/${list._id}/items`,
        newItem,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Server Response:', response.data);

      // Update items with full category details
      if (response.data.items) {
        const updatedItems = response.data.items.map(item => {
          console.log('Processing Item:', item);

          // Attempt to find category details
          const catDetails = PREDEFINED_CATEGORIES.find(cat => 
            cat.id === item.category || 
            cat.name.toLowerCase() === (item.category || '').toLowerCase()
          );

          console.log('Matched Category Details:', catDetails);

          // Fallback category details
          const fallbackCategoryDetails = catDetails 
            ? {
                id: catDetails.id,
                name: catDetails.name,
                image: catDetails.image
              }
            : {
                id: 'uncategorized',
                name: 'Uncategorized',
                image: null
              };

          return {
            ...item,
            categoryDetails: item.categoryDetails || fallbackCategoryDetails
          };
        });

        setItems(updatedItems);
      }

      // Reset form
      setItemName('');
      setQuantity('');
      setSelectedCategory('');
      setCustomCategory('');
      setShowModal(false);

      toast.success('Item added successfully');
    } catch (error) {
      console.error('Error adding item:', error.response ? error.response.data : error);
      toast.error('Failed to add item');
    }
  };

  const handleToggleItem = async (itemId, checked) => {
    try {
      const token = localStorage.getItem('userToken');
      
      // Update the items state optimistically
      const updatedItems = items.map(item => 
        item._id === itemId ? { ...item, checked: !item.checked } : item
      );
      setItems(updatedItems);

      // Make the API call with the correct endpoint format
      const response = await axios.patch(
        `http://localhost:3000/api/lists/${list._id}/items/${itemId}/toggle`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Update the list with the latest data
      setList(response.data);

    } catch (error) {
      console.error('Error updating item:', error);
      
      // Revert the optimistic update if the API call fails
      setItems(items.map(item => 
        item._id === itemId ? { ...item, checked: checked } : item
      ));
      
      toast.error('Failed to update item status');
    }
  };

  const handleBackNavigation = async () => {
    try {
      // Get the current list state
      const token = localStorage.getItem('userToken');
      const response = await axios.get(
        `http://localhost:3000/api/lists/${list._id}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      // Navigate back with the updated list state
      navigate('/list', { 
        state: { 
          updatedList: response.data,
          timestamp: new Date().getTime() 
        },
        replace: true  // Replace the current route to prevent back-button issues
      });
    } catch (error) {
      console.error('Error saving list state:', error);
      // Still navigate back even if there's an error
      navigate('/list');
    }
  };

  const handleFinish = () => {
    navigate('/list');
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('userToken');
      await axios.delete(`http://localhost:3000/api/lists/${list._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      toast.success('List deleted successfully');
      navigate('/list');
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Failed to delete list');
    }
  };

  const handleDeleteItem = async (itemId) => {
    try {
      const token = localStorage.getItem('userToken');
      await axios.delete(`http://localhost:3000/api/lists/${list._id}/items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        data: { itemIds: [itemId] }
      });

      // Remove item from local state
      setItems(items.filter(item => item._id !== itemId));
      
      // Close delete confirmation modal
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      
      toast.success('Item removed');
    } catch (error) {
      console.error('Error deleting item:', error);
      toast.error('Failed to remove item');
    }
  };

  const handleDeleteCheckedItems = async () => {
    try {
      const token = localStorage.getItem('userToken');
      const checkedItems = items.filter(item => item.checked);
      
      if (checkedItems.length === 0) {
        toast.info('No items selected for deletion');
        return;
      }

      // Debug logs
      console.log('Attempting to delete items:', {
        listId: list._id,
        itemIds: checkedItems.map(item => item._id)
      });

      // Change to use query parameters instead of request body
      const response = await axios({
        method: 'delete',
        url: `http://localhost:3000/api/lists/${list._id}/items`,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: {
          itemIds: checkedItems.map(item => item._id)
        }
      });

      console.log('Delete response:', response.data);
      setItems(items.filter(item => !item.checked));
      toast.success('Selected items deleted successfully');
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Delete request error:', error);
      toast.error('Failed to delete items');
    }
  };

  const confirmDelete = (itemId) => {
    setItemToDelete(itemId);
    setShowDeleteConfirm(true);
  };

  const getCategoryIcon = (categoryDetails) => {
    console.log('Getting Category Icon for:', categoryDetails);

    // Ensure categoryDetails is an object
    if (!categoryDetails || typeof categoryDetails !== 'object') {
      console.warn('Invalid categoryDetails:', categoryDetails);
      return DefaultCategoryIcon;
    }

    // First, check predefined categories by ID
    const predefinedCategory = PREDEFINED_CATEGORIES.find(
      cat => cat.id === categoryDetails.id
    );

    // If found in predefined, return its image
    if (predefinedCategory) {
      console.log('Found predefined category by ID:', predefinedCategory);
      return predefinedCategory.image;
    }

    // Safely check for category name match
    if (categoryDetails.name) {
      // For custom categories, try to match by name
      const matchedCategory = PREDEFINED_CATEGORIES.find(
        cat => cat.name.toLowerCase() === categoryDetails.name.toLowerCase()
      );

      if (matchedCategory) {
        console.log('Found predefined category by name:', matchedCategory);
        return matchedCategory.image;
      }

      // Try to find an exact match in CATEGORY_ICONS
      const normalizedName = categoryDetails.name
        .replace(/\s+/g, ' ')
        .trim();

      if (CATEGORY_ICONS[normalizedName]) {
        console.log('Found category icon by exact name:', normalizedName);
        return CATEGORY_ICONS[normalizedName];
      }

      // Try case-insensitive match
      const caseInsensitiveMatch = Object.keys(CATEGORY_ICONS).find(
        key => key.toLowerCase() === normalizedName.toLowerCase()
      );

      if (caseInsensitiveMatch) {
        console.log('Found category icon by case-insensitive name:', caseInsensitiveMatch);
        return CATEGORY_ICONS[caseInsensitiveMatch];
      }
    }

    // Last resort: use default icon
    console.warn('No category icon found, using default:', categoryDetails);
    return DefaultCategoryIcon;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="bg-[#D62929] p-4">
        <div className="flex items-center">
          <button 
            onClick={handleBackNavigation}
            className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 mr-3"
          >
            <img 
              src={backIcon} 
              alt="Back" 
              className="w-5 h-5 brightness-0 invert"
            />
          </button>
          <h1 className="text-[24px] font-bold text-white">{list?.title}</h1>
          <div className="flex-1"></div>
          <button 
            onClick={() => setShowManageListModal(true)}
            className="mr-2 bg-white/20 rounded-lg w-10 h-10 flex items-center justify-center"
          >
            <img 
              src={shareIcon} 
              alt="Manage List" 
              className="w-6 h-6 object-contain"
            />
          </button>
        </div>
      </div>

        {/* Items List */}
        <div className="flex-1 bg-white px-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 200px)' }}>
        {items.length > 0 ? (
          <div className="space-y-4 py-4">
          {items.map((item, index) => {
            // Ensure categoryDetails exists
            if (!item.categoryDetails) {
              console.warn('Item missing categoryDetails:', item);
              
              // Fallback category details
              item.categoryDetails = {
                id: item.category || 'uncategorized',
                name: item.category || 'Uncategorized',
                image: null
              };
            }

            return (
              <div 
                key={item._id || index} 
                className={`flex items-center justify-between bg-white rounded-[20px] p-4 shadow-md ${item.checked ? 'opacity-50' : ''}`}
              >
                {/* Checkbox and Item Details */}
                <div className="flex items-center flex-1">
                  <input 
                    type="checkbox"
                    checked={!!item.checked}
                    onChange={() => handleToggleItem(item._id, item.checked)}
                    className="form-checkbox h-6 w-6 text-[#D62929] rounded mr-4"
                  />
                  
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center justify-between">
                      <span className={`text-xl font-semibold ${item.checked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                        {item.name}
                        {item.quantity && (
                          <span className="ml-2 text-base text-gray-500">
                            ({item.quantity})
                          </span>
                        )}
                      </span>

                      {/* Category Display - Icon Only */}
                      <img 
                        src={getCategoryIcon(item.categoryDetails)}
                        alt={item.categoryDetails.name || 'Category Icon'}
                        className="w-8 h-8 object-contain mr-1"
                        onError={(e) => {
                          console.error('Failed to load category icon for:', item.categoryDetails);
                          e.target.src = DefaultCategoryIcon;
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Delete Button */}
                <button
                  onClick={() => confirmDelete(item._id)}
                  className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="w-4 h-4 text-[#D62929]"
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            );
          })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
          <p className="text-gray-500">No items added yet</p>
          </div>
        )}
        </div>

      {/* Add Button */}
      <div className="fixed bottom-6 left-4 right-4">
        <button
          onClick={() => setShowModal(true)}
          className="w-full bg-[#D62929] text-white py-4 rounded-[15px] text-lg font-medium"
        >
          ADD ITEM
        </button>
      </div>

      {/* Add Item Modal */}
      {showModal && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-[30px] p-6 z-50 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Add Item</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center"
              >
                <span className="text-[#D62929]">X</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2">Item name</label>
                <input
                  type="text"
                  value={itemName || ''}
                  onChange={(e) => setItemName(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  placeholder="Enter item name"
                />
              </div>

              <div>
                <label className="block text-gray-700 mb-2">Quantity</label>
                <input
                  type="text"
                  value={quantity || ''}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg"
                  placeholder="Enter quantity"
                />
              </div>

              {/* Category Selection */}
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Select Category
                </label>

                {/* Selected Category Preview */}
                {selectedCategory && selectedCategory !== 'custom' && (
                  <div className="flex items-center space-x-3 bg-gray-100 p-3 rounded-lg mb-4">
                    <img 
                      src={PREDEFINED_CATEGORIES.find(cat => cat.id === selectedCategory)?.image}
                      alt="Selected Category" 
                      className="w-12 h-12 object-contain"
                    />
                    <div>
                      <p className="font-semibold text-gray-800">
                        {PREDEFINED_CATEGORIES.find(cat => cat.id === selectedCategory)?.name}
                      </p>
                      <p className="text-sm text-gray-600">
                        Selected Category
                      </p>
                    </div>
                  </div>
                )}

                {/* Custom Category Input */}
                {selectedCategory === 'custom' && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Custom Category Name
                    </label>
                    <input
                      type="text"
                      value={customCategory || ''}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      placeholder="Enter custom category"
                      className="w-full p-3 border border-gray-200 rounded-lg"
                    />
                  </div>
                )}

                {/* Category Grid */}
                <div className="grid grid-cols-4 gap-2">
                  {PREDEFINED_CATEGORIES.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setCustomCategory(''); // Clear custom category if predefined is selected
                      }}
                      className={`
                        flex flex-col items-center p-2 rounded-lg 
                        transition-all duration-200 ease-in-out
                        ${selectedCategory === category.id 
                          ? 'bg-[#D62929] text-white scale-105 shadow-md' 
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                      `}
                    >
                      <img 
                        src={category.image} 
                        alt={category.name} 
                        className="w-8 h-8 mb-1 object-contain"
                      />
                      <span className="text-xs text-center">{category.name}</span>
                    </button>
                  ))}
                  
                  {/* Custom Category Option */}
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCategory('custom');
                    }}
                    className={`
                      flex flex-col items-center p-2 rounded-lg 
                      transition-all duration-200 ease-in-out
                      ${selectedCategory === 'custom' 
                        ? 'bg-[#D62929] text-white scale-105 shadow-md' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
                  >
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      className="w-8 h-8 mb-1"
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    <span className="text-xs text-center">Custom</span>
                  </button>
                </div>
              </div>

              <button
                onClick={handleAddItem}
                className="w-full bg-[#D62929] text-white py-3 rounded-lg mt-4"
              >
                Save
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => {
              setShowDeleteConfirm(false);
              setItemToDelete(null);
            }}
          />
          <div className="fixed inset-x-4 top-1/2 -translate-y-1/2 bg-white rounded-[30px] p-6 z-50">
            <h2 className="text-xl font-bold mb-4">Delete Item</h2>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this item?</p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                }}
                className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteItem(itemToDelete)}
                className="px-4 py-2 rounded-lg bg-[#D62929] text-white"
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}

      {showManageListModal && (
        <ManageListModal 
          list={list} 
          onClose={() => setShowManageListModal(false)} 
        />
      )}
    </div>
  );
};

export default AddItemsToListScreen;
