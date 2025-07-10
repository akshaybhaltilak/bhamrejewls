import React, { useState, useEffect } from 'react';
import { ref, set, onValue, remove, update, push } from 'firebase/database';
import { database } from '../Database/Firebase';
import { FiEdit, FiTrash2, FiSearch, FiFilter, FiDollarSign, FiLink, FiUpload, FiUsers, FiPhone } from 'react-icons/fi';
import { GiStonePath, GiGoldBar } from 'react-icons/gi';
import { Link } from 'react-router-dom';

// Cloudinary configuration
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || "dvx3a4adj";
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UNSIGNED_PRESET || "gold_preset";
const CLOUD_FOLDER = "gold-catalog";

const AdminPanel = () => {
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [userSearchTerm, setUserSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [editMode, setEditMode] = useState(false);
  const [currentProductId, setCurrentProductId] = useState(null);
  const [activeTab, setActiveTab] = useState('products');

  // Form states
  const [itemName, setItemName] = useState('');
  const [barcodeNo, setBarcodeNo] = useState('');
  const [grossWeight, setGrossWeight] = useState('');
  const [netWeight, setNetWeight] = useState('');
  const [hallmarkCharges, setHallmarkCharges] = useState('');
  const [stoneCharges, setStoneCharges] = useState('');
  const [makingChargesPercentage, setMakingChargesPercentage] = useState('');
  const [carat, setCarat] = useState('22');
  const [category, setCategory] = useState('ring');
  const [imageUrl, setImageUrl] = useState('');
  const [goldRate, setGoldRate] = useState({ '18': '', '22': '', '24': '' });
  const [loading, setLoading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  const [isCustomizable, setIsCustomizable] = useState(false);
  const [gstRate, setGstRate] = useState(3);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Categories
  const categories = [
    'ring', 'bangle', 'kada', 'chain', 'necklace', 
    'earring', 'pendant', 'bracelet', 'mangalsutra'
  ];

  // Carat options
  const caratOptions = ['18', '20', '22', '24'];

  // GST options
  const gstOptions = [1.5, 3, 5, 7.5, 12, 18];

  useEffect(() => {
    // Fetch products
    const productsRef = ref(database, 'products');
    onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setProducts(productsArray);
        setFilteredProducts(productsArray);
      } else {
        setProducts([]);
        setFilteredProducts([]);
      }
    });

    // Fetch users
    const usersRef = ref(database, 'users');
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const usersArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setUsers(usersArray);
        setFilteredUsers(usersArray);
      } else {
        setUsers([]);
        setFilteredUsers([]);
      }
    });

    // Fetch gold rates
    const goldRateRef = ref(database, 'goldRate');
    onValue(goldRateRef, (snapshot) => {
      const rates = snapshot.val();
      if (rates) {
        setGoldRate({
          '18': rates['18'] || '',
          '22': rates['22'] || '',
          '24': rates['24'] || ''
        });
      } else {
        setGoldRate({ '18': '', '22': '', '24': '' });
      }
    });

    // Fetch GST rate
    const gstRateRef = ref(database, 'gstRate');
    onValue(gstRateRef, (snapshot) => {
      setGstRate(snapshot.val() || 3);
    });
  }, []);

  useEffect(() => {
    let results = products;
    
    if (searchTerm) {
      results = results.filter(product =>
        product.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcodeNo.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterCategory !== 'all') {
      results = results.filter(product => product.category === filterCategory);
    }
    
    setFilteredProducts(results);
  }, [searchTerm, filterCategory, products]);

  useEffect(() => {
    let results = users;
    
    if (userSearchTerm) {
      results = results.filter(user =>
        user.name.toLowerCase().includes(userSearchTerm.toLowerCase()) ||
        user.phoneNumber.includes(userSearchTerm)
      );
    }
    
    setFilteredUsers(results);
  }, [userSearchTerm, users]);

  const uploadImageToCloudinary = async (file) => {
    if (!file) return null;
    
    try {
      setUploadingImage(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", UPLOAD_PRESET);
      formData.append("folder", CLOUD_FOLDER);
      
      // Use item name as public_id if available, otherwise generate a unique name
      const publicId = itemName.trim() || `product_${Date.now()}`;
      formData.append("public_id", publicId);

      const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

      const res = await fetch(url, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to upload image");
      }

      const data = await res.json();
      return data.secure_url;
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      setUploadError(err.message || "Error uploading image to Cloudinary");
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      setUploadError('File size should be less than 2MB');
      return;
    }

    if (!file.type.match('image.*')) {
      setUploadError('Only image files are allowed');
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageUrl(event.target.result); // This is just for preview
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    const cloudinaryUrl = await uploadImageToCloudinary(file);
    if (cloudinaryUrl) {
      setImageUrl(cloudinaryUrl); // This is the actual Cloudinary URL
    }
  };

  const calculatePrice = (product) => {
    const selectedCarat = product.carat || '22';
    const currentGoldRate = parseFloat(goldRate[selectedCarat] || 0);
    if (!currentGoldRate || !product.netWeight) return 0;
    
    const goldValue = parseFloat(product.netWeight) * currentGoldRate;
    const makingChargesValue = goldValue * (parseFloat(product.makingChargesPercentage) / 100);
    
    const subtotal = (
      goldValue +
      makingChargesValue +
      parseFloat(product.hallmarkCharges || 0) +
      parseFloat(product.stoneCharges || 0)
    );
    
    const gstAmount = subtotal * (parseFloat(product.gstRate || gstRate) / 100);
    return (subtotal + gstAmount).toFixed(2);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const productData = {
        itemName,
        barcodeNo,
        grossWeight: parseFloat(grossWeight),
        netWeight: parseFloat(netWeight),
        hallmarkCharges: parseFloat(hallmarkCharges || 0),
        stoneCharges: parseFloat(stoneCharges || 0),
        makingChargesPercentage: parseFloat(makingChargesPercentage || 0),
        carat,
        category,
        imageUrl,
        isCustomizable,
        gstRate: parseFloat(gstRate),
        createdAt: new Date().toISOString()
      };

      if (editMode && currentProductId) {
        await update(ref(database, `products/${currentProductId}`), productData);
      } else {
        await push(ref(database, 'products'), productData);
      }

      resetForm();
    } catch (error) {
      console.error("Error saving product:", error);
      setUploadError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product) => {
    setEditMode(true);
    setCurrentProductId(product.id);
    setItemName(product.itemName);
    setBarcodeNo(product.barcodeNo);
    setGrossWeight(product.grossWeight);
    setNetWeight(product.netWeight);
    setHallmarkCharges(product.hallmarkCharges || '');
    setStoneCharges(product.stoneCharges || '');
    setMakingChargesPercentage(product.makingChargesPercentage || '');
    setCarat(product.carat);
    setCategory(product.category);
    setImageUrl(product.imageUrl || '');
    setIsCustomizable(product.isCustomizable || false);
    setGstRate(product.gstRate || gstRate);
  };

  const handleDelete = async (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      await remove(ref(database, `products/${productId}`));
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await remove(ref(database, `users/${userId}`));
    }
  };

  const resetForm = () => {
    setEditMode(false);
    setCurrentProductId(null);
    setItemName('');
    setBarcodeNo('');
    setGrossWeight('');
    setNetWeight('');
    setHallmarkCharges('');
    setStoneCharges('');
    setMakingChargesPercentage('');
    setCarat('22');
    setCategory('ring');
    setImageUrl('');
    setIsCustomizable(false);
    setUploadError(null);
  };

  const saveGoldRate = async () => {
    try {
      await set(ref(database, 'goldRate'), goldRate);
    } catch (error) {
      console.error("Error saving gold rate:", error);
      setUploadError(error.message);
    }
  };

  const saveGstRate = async () => {
    try {
      await set(ref(database, 'gstRate'), gstRate);
    } catch (error) {
      console.error("Error saving GST rate:", error);
      setUploadError(error.message);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Bhamare Jewellers Admin Panel</h1>
        
        {/* Gold Rate Section */}
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-8 rounded-lg shadow-md">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center">
              <GiGoldBar className="text-yellow-600 text-2xl mr-2" />
              <h2 className="text-xl font-semibold text-yellow-800">Today's Gold Rates (per gram)</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-4">
                <label className="text-yellow-800 w-16">18K:</label>
                <input
                  type="number"
                  value={goldRate['18']}
                  onChange={(e) => setGoldRate({...goldRate, '18': e.target.value})}
                  className="border border-yellow-300 rounded px-3 py-2 w-32 text-yellow-800"
                  placeholder="18K rate"
                />
              </div>
              
              <div className="flex items-center space-x-4">
                <label className="text-yellow-800 w-16">22K:</label>
                <input
                  type="number"
                  value={goldRate['22']}
                  onChange={(e) => setGoldRate({...goldRate, '22': e.target.value})}
                  className="border border-yellow-300 rounded px-3 py-2 w-32 text-yellow-800"
                  placeholder="22K rate"
                />
              </div>
              <div className="flex items-center space-x-4">
                <label className="text-yellow-800 w-16">24K:</label>
                <input
                  type="number"
                  value={goldRate['24']}
                  onChange={(e) => setGoldRate({...goldRate, '24': e.target.value})}
                  className="border border-yellow-300 rounded px-3 py-2 w-32 text-yellow-800"
                  placeholder="24K rate"
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <label className="text-yellow-800">GST Rate (%):</label>
                <select
                  value={gstRate}
                  onChange={(e) => setGstRate(e.target.value)}
                  className="border border-yellow-300 rounded px-3 py-2 text-yellow-800"
                >
                  {gstOptions.map(rate => (
                    <option key={rate} value={rate}>{rate}%</option>
                  ))}
                </select>
                <button
                  onClick={saveGstRate}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                >
                  Save GST
                </button>
              </div>
              
              <button
                onClick={saveGoldRate}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded flex items-center"
              >
                <FiDollarSign className="mr-2" />
                Save Gold Rates
              </button>
              <Link 
                to="/image-upload" 
                className="hover:text-yellow-300 transition font-medium text-lg px-3 py-2 rounded hover:bg-gray-800"
              >
                Image Upload
              </Link>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('products')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'products'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <GiGoldBar className="mr-2" />
                  Products ({products.length})
                </div>
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center">
                  <FiUsers className="mr-2" />
                  Users ({users.length})
                </div>
              </button>
            </nav>
          </div>
        </div>

        {/* Products Tab */}
        {activeTab === 'products' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Product Form */}
            <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">
                {editMode ? 'Edit Product' : 'Add New Product'}
              </h2>
              
              <form onSubmit={handleProductSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Item Name</label>
                  <input
                    type="text"
                    value={itemName}
                    onChange={(e) => setItemName(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barcode No</label>
                  <input
                    type="text"
                    value={barcodeNo}
                    onChange={(e) => setBarcodeNo(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gross Weight (g)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={grossWeight}
                      onChange={(e) => setGrossWeight(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Net Weight (g)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={netWeight}
                      onChange={(e) => setNetWeight(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Hallmark Charges (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={hallmarkCharges}
                      onChange={(e) => setHallmarkCharges(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Stone Charges (₹)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={stoneCharges}
                      onChange={(e) => setStoneCharges(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Making Charges (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={makingChargesPercentage}
                    onChange={(e) => setMakingChargesPercentage(e.target.value)}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Carat</label>
                    <select
                      value={carat}
                      onChange={(e) => setCarat(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      {caratOptions.map(option => (
                        <option key={option} value={option}>{option}K</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">GST Rate (%)</label>
                    <select
                      value={gstRate}
                      onChange={(e) => setGstRate(e.target.value)}
                      className="w-full border border-gray-300 rounded px-3 py-2"
                    >
                      {gstOptions.map(rate => (
                        <option key={rate} value={rate}>{rate}%</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="customizable"
                      checked={isCustomizable}
                      onChange={(e) => setIsCustomizable(e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="customizable" className="ml-2 block text-sm text-gray-700">
                      Customizable Product
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
                  
                  {imageUrl && (
                    <div className="mb-4 flex justify-center">
                      <div className="w-32 h-32 border rounded overflow-hidden">
                        <img 
                          src={imageUrl} 
                          alt="Preview" 
                          className="w-full h-full object-contain" 
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/150?text=Image+Error';
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-3">
                    <label className={`cursor-pointer ${uploadingImage ? 'bg-gray-200' : 'bg-blue-50 hover:bg-blue-100'} text-blue-600 px-4 py-2 rounded flex items-center justify-center w-full transition`}>
                      <FiUpload className="mr-2" />
                      {uploadingImage ? 'Uploading...' : 'Upload Image'}
                      <input
                        type="file"
                        onChange={handleImageChange}
                        accept="image/*"
                        className="hidden"
                        disabled={uploadingImage || loading}
                      />
                    </label>
                    
                    <div className="relative flex items-center">
                      <div className="flex-grow border-t border-gray-300"></div>
                      <span className="flex-shrink mx-2 text-gray-500 text-sm">OR</span>
                      <div className="flex-grow border-t border-gray-300"></div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <input
                        type="url"
                        value={imageUrl}
                        onChange={(e) => setImageUrl(e.target.value)}
                        placeholder="Paste image URL"
                        className="flex-grow border border-gray-300 rounded px-3 py-2"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  {uploadError && (
                    <div className="text-red-500 text-sm mt-2">{uploadError}</div>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={loading || uploadingImage}
                    className={`w-full ${loading || uploadingImage ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} text-white py-2 px-4 rounded flex items-center justify-center`}
                  >
                    {loading ? (
                      'Processing...'
                    ) : editMode ? (
                      <>
                        <FiEdit className="mr-2" />
                        Update Product
                      </>
                    ) : (
                      'Add Product'
                    )}
                  </button>
                </div>

                {editMode && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded"
                  >
                    Cancel
                  </button>
                )}
              </form>
            </div>

            {/* Product List */}
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
                <h2 className="text-xl font-semibold text-gray-800">Product Inventory</h2>
                
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Search products..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full sm:w-64"
                    />
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiFilter className="text-gray-400" />
                    </div>
                    <select
                      value={filterCategory}
                      onChange={(e) => setFilterCategory(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md appearance-none w-full sm:w-40"
                    >
                      <option value="all">All Categories</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Image
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Item Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Barcode
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Weight
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.length > 0 ? (
                      filteredProducts.map((product) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {product.imageUrl ? (
                              <div className="w-10 h-10 rounded-full overflow-hidden">
                                <img 
                                  src={product.imageUrl} 
                                  alt={product.itemName} 
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = 'https://via.placeholder.com/40?text=No+Image';
                                  }}
                                />
                              </div>
                            ) : (
                              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <p className="text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{product.itemName}</div>
                            <div className="text-sm text-gray-500 capitalize">{product.category}</div>
                            {product.isCustomizable && (
                              <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded mt-1">
                                Customizable
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center">
                              <p className="mr-1" /> {product.barcodeNo}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900 flex items-center">
                              <p className="mr-1" /> {product.netWeight}g
                            </div>
                            <div className="text-xs text-gray-500">{product.carat}K</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-semibold text-gray-900">
                              ₹{calculatePrice(product)}
                            </div>
                            <div className="text-xs text-gray-500">
                              GST: {product.gstRate || gstRate}%
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleEdit(product)}
                              className="text-blue-600 hover:text-blue-900 mr-4"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => handleDelete(product.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <FiTrash2 />
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                          No products found. Add some products to get started.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
              <h2 className="text-xl font-semibold text-gray-800">Registered Users</h2>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search users..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full sm:w-64"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registration Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <FiUsers className="text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <FiPhone className="mr-2 text-gray-400" />
                            {user.phoneNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDate(user.createdAt)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <FiTrash2 />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500">
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;