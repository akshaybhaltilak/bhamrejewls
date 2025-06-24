import React, { useState, useEffect } from 'react';
import { ref, onValue } from 'firebase/database';
import { database } from '../Database/Firebase';
import { FiSearch, FiFilter } from 'react-icons/fi';
import { MdCategory, MdRemoveRedEye } from 'react-icons/md';
import { GiGoldBar } from 'react-icons/gi';
import { BsWhatsapp } from 'react-icons/bs';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { useNavigate } from 'react-router-dom';
import UserFormModal from './userform';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [goldRates, setGoldRates] = useState({ '18': 0, '22': 0, '24': 0 });
  const [gstRate, setGstRate] = useState(3);
  const [loading, setLoading] = useState(true);
  const [showUserForm, setShowUserForm] = useState(false);
  const navigate = useNavigate();

  // Categories
  const categories = [
    'all', 'ring', 'bangle', 'kada', 'chain',
    'necklace', 'earring', 'pendant', 'bracelet', 'mangalsutra'
  ];

  // Banner images
  const banners = [
    'https://images.unsplash.com/photo-1605100804763-247f67b3557e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80',
    'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80'
  ];

  useEffect(() => {
    const hasSubmitted = localStorage.getItem('formSubmitted');
    if (!hasSubmitted) {
      const timer = setTimeout(() => {
        setShowUserForm(true);
      }, 1000);
      return () => clearTimeout(timer);
    }

    // Fetch products
    const productsRef = ref(database, 'products');
    const unsubscribeProducts = onValue(productsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const productsArray = Object.keys(data).map(key => ({
          id: key,
          ...data[key]
        }));
        setProducts(productsArray);
        setFilteredProducts(productsArray);
      }
      setLoading(false);
    });

    // Fetch gold rates
    const goldRateRef = ref(database, 'goldRate');
    const unsubscribeGoldRates = onValue(goldRateRef, (snapshot) => {
      const rates = snapshot.val();
      if (rates) {
        setGoldRates({
          '18': parseFloat(rates['18'] || 0),
          '22': parseFloat(rates['22'] || 0),
          '24': parseFloat(rates['24'] || 0)
        });
      }
    });

    // Fetch GST rate
    const gstRateRef = ref(database, 'gstRate');
    const unsubscribeGstRate = onValue(gstRateRef, (snapshot) => {
      setGstRate(parseFloat(snapshot.val()) || 3);
    });

    return () => {
      unsubscribeProducts();
      unsubscribeGoldRates();
      unsubscribeGstRate();
    };
  }, []);

  useEffect(() => {
    let results = products;
    if (searchTerm) {
      results = results.filter(product =>
        product.itemName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcodeNo?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterCategory !== 'all') {
      results = results.filter(product => product.category === filterCategory);
    }
    setFilteredProducts(results);
  }, [searchTerm, filterCategory, products]);

  const calculatePrice = (product) => {
    const carat = product.carat || '22';
    const goldRate = goldRates[carat] || 0;
    if (!goldRate || !product.netWeight) return 0;

    const goldValue = parseFloat(product.netWeight) * goldRate;
    const makingChargesValue = goldValue * (parseFloat(product.makingChargesPercentage || 0) / 100);
    const subtotal = goldValue + makingChargesValue + parseFloat(product.hallmarkCharges || 0) + parseFloat(product.stoneCharges || 0);
    const gstAmount = subtotal * (parseFloat(product.gstRate || gstRate) / 100);
    return (subtotal + gstAmount).toFixed(2);
  };

  const handleWhatsAppInquiry = (product) => {
    const price = calculatePrice(product);
    const message = `Hello Bhamare Jewellers,\n\nI'm interested in:\n*${product.itemName}*\nBarcode: ${product.barcodeNo}\nCategory: ${product.category}\nCarat: ${product.carat}K\nWeight: ${product.netWeight}g\nPrice: ₹${price}`;
    window.open(`https://wa.me/918668722207?text=${encodeURIComponent(message)}`, '_blank');
  };

  const viewProductDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    arrows: false,
    fade: true,
    cssEase: 'cubic-bezier(0.645, 0.045, 0.355, 1)'
  };

  return (
    <div className="min-h-screen bg-stone-50 font-lora">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&display=swap');
      `}</style>

      {showUserForm && <UserFormModal />}

      {/* Gold Rate Banner */}
      <div className="bg-gradient-to-r from-purple-900 to-indigo-900 py-3 shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex flex-wrap items-center justify-center gap-6">
            {['24', '22', '18'].map(carat => (
              <div key={carat} className="flex items-center bg-black bg-opacity-20 px-4 py-2 rounded-full">
                <GiGoldBar className="text-yellow-400 text-xl mr-2" />
                <span className="font-semibold text-white tracking-wide">
                  {carat}K: ₹{goldRates[carat]?.toLocaleString('en-IN') || '--'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Banner Slider */}
      <div className="relative">
        <Slider {...sliderSettings} className="rounded-b-lg overflow-hidden shadow-lg">
          {banners.map((banner, index) => (
            <div key={index} className="relative">
              <img
                src={banner}
                alt={`Banner ${index + 1}`}
                className="w-full h-64 md:h-[500px] object-cover object-center"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-900/90 to-transparent"></div>
              <div className="absolute bottom-10 left-0 right-0 text-center px-4">
                <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 font-lora italic">Bhamare Jewellers</h2>
                <p className="text-xl md:text-2xl text-gold-200 font-light tracking-wider">Crafting Elegance Since Generations</p>
              </div>
            </div>
          ))}
        </Slider>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Search and Filter */}
        <div className="mb-8 bg-white p-6 rounded-xl shadow-lg border border-purple-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="w-full md:w-1/2">
              <h2 className="text-3xl font-semibold text-purple-900 mb-2 font-lora">Discover Our Gold Collection</h2>
              <p className="text-stone-600 font-lora">Find the perfect piece that matches your style and tradition</p>
            </div>

            <div className="flex flex-col md:flex-row gap-4 w-full md:w-1/2">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiSearch className="h-5 w-5 text-stone-400" />
                </div>
                <input
                  type="text"
                  placeholder="Search by name or barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-4 py-3 border border-stone-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-lora"
                />
              </div>

              <div className="flex items-center">
                <div className="relative">
                  <FiFilter className="absolute left-3 top-3 text-stone-400 z-10" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="appearance-none pl-10 pr-8 py-2.5 border border-stone-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 font-lora"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {categories.filter(cat => cat !== 'all').map(cat => (
              <button
                key={cat}
                onClick={() => setFilterCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                  filterCategory === cat
                    ? 'bg-gradient-to-r from-purple-700 to-indigo-700 text-white shadow-md'
                    : 'bg-white text-stone-700 hover:bg-stone-100 border border-stone-200 hover:border-purple-300'
                }`}
              >
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow border border-stone-200">
            <h3 className="text-xl font-medium text-stone-700 font-lora">No products found</h3>
            <p className="mt-2 text-stone-500 font-lora">
              {searchTerm || filterCategory !== 'all'
                ? 'Try changing your search or filter criteria.'
                : 'Our collection is currently empty. Please check back later.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredProducts.map((product) => (
              <div key={product.id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 border border-stone-200 hover:border-purple-300 group">
                {product.imageUrl && (
                  <div className="h-64 overflow-hidden relative">
                    <img
                      src={product.imageUrl}
                      alt={product.itemName}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                )}
                <div className="p-5">
                  <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-stone-800 truncate font-lora">{product.itemName}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      product.carat === '24' ? 'bg-yellow-100 text-yellow-800' :
                      product.carat === '22' ? 'bg-amber-100 text-amber-800' :
                      'bg-stone-100 text-stone-800'
                    }`}>
                      {product.carat}K
                    </span>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
                      <p className="text-xs text-stone-500 font-lora">Net Weight</p>
                      <p className="text-sm font-medium font-lora">{product.netWeight}g</p>
                    </div>
                    <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
                      <p className="text-xs text-stone-500 font-lora">Gross Weight</p>
                      <p className="text-sm font-medium font-lora">{product.grossWeight}g</p>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-stone-100">
                    <div className="flex justify-between items-center">
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                        <p className="text-xs text-purple-600 font-lora">Making Charges</p>
                        <p className="text-sm font-medium text-purple-800 font-lora">{product.makingChargesPercentage}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-stone-500 font-lora">Estimated Price</p>
                        <p className="text-lg font-bold text-purple-900 font-lora">₹{calculatePrice(product)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-3">
                    <button
                      onClick={() => viewProductDetails(product.id)}
                      className="flex items-center justify-center gap-2 bg-stone-100 hover:bg-stone-200 text-stone-800 py-2.5 px-4 rounded-lg transition-all duration-300 font-lora"
                    >
                      <MdRemoveRedEye className="text-purple-700" />
                      <span>View</span>
                    </button>

                    <button
                      onClick={() => handleWhatsAppInquiry(product)}
                      className="flex items-center justify-center gap-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-2.5 px-4 rounded-lg transition-all duration-300 font-lora"
                    >
                      <BsWhatsapp className="text-white" />
                      <span>Inquire</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Home;