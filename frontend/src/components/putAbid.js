import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import axios from 'axios';
import SummaryApi from '../common';

const PutABid = () => {
  const user = useSelector((state) => state?.user?.user);
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const [products, setProducts] = useState([]);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBidForm, setShowBidForm] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [bidderDetails, setBidderDetails] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0); // Add refresh key for forcing re-render

  // Fetch products for the logged-in user
  const fetchAllProduct = async () => {
    try {
      setLoading(true);
      if (!user?._id) {
        toast.error('User not found');
        return;
      }

      const response = await axios.get(SummaryApi.allProduct.url);

      if (response.data.success) {
        // Filter products for the current seller
        const sellerProducts = response.data.data.filter(product => 
          product.ShopID === user._id || 
          (product.ShopID && product.ShopID._id === user._id)
        );
        setProducts(sellerProducts);
      } else {
        toast.error('Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Error fetching products');
    } finally {
      setLoading(false);
    }
  };

  // Fetch all bids for the logged-in seller
  const fetchAllBids = async () => {
    try {
      setLoading(true);
      if (!user?._id || products.length === 0) {
        setLoading(false);
        return;
      }

      // Create an array of product IDs owned by this seller
      const sellerProductIds = products.map(product => product._id);
      
      // Get all bids
      const response = await axios.get(SummaryApi.getBidbyspecific.url);

      if (response.data.success) {
        // Filter bids for the current seller's products
        const sellerBids = response.data.data.filter(bid => {
          const productId = bid.productID?._id || bid.productID;
          return sellerProductIds.includes(productId);
        });
        
        setBids(sellerBids);
      } else {
        toast.error('Failed to fetch bids');
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
      toast.error('Error fetching bids');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchAllProduct();
    }
  }, [user?._id]);

  useEffect(() => {
    if (products.length > 0) {
      fetchAllBids();
    }
  }, [products, refreshKey]); // Add refreshKey to dependencies

  // Submit bid data
  const handleBidSubmit = async (formData) => {
    try {
      setLoading(true);

      const bidData = {
        productID: formData.productID,
        startPrice: formData.startPrice,
        closeDate: formData.closeDate,
        bidder: [], // No bidders initially
      };

      const response = await axios.post(SummaryApi.createBid.url, bidData);

      if (response.data.success) {
        toast.success('Bid created successfully!');
        reset(); // Reset form data
        setShowBidForm(false); // Hide the form
        setRefreshKey(prevKey => prevKey + 1); // Force re-fetch of bids
        
        // If we have the created bid details in the response, select it
        if (response.data.data) {
          setTimeout(() => {
            const createdBid = response.data.data;
            // Fetch the newly created bid details after a brief delay
            fetchBidDetailsAfterCreation(createdBid._id || createdBid);
          }, 500); // Small delay to ensure the database has updated
        }
      } else {
        toast.error(response.data.message || 'Error creating bid');
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Error submitting bid');
    } finally {
      setLoading(false);
    }
  };

  // Fetch newly created bid details
  const fetchBidDetailsAfterCreation = async (bidId) => {
    try {
      setLoading(true);
      
      // Get the specific bid
      const response = await axios.get(`${SummaryApi.getBidbyspecific.url}/${bidId}`);
      
      if (response.data.success) {
        const bid = response.data.data;
        setSelectedBid(bid);
        setBidderDetails([]); // No bidders yet for a new bid
        toast.info(`View details for your new bid: ${bid.productID?.productName || 'Product'}`);
      }
    } catch (error) {
      console.error('Error fetching newly created bid:', error);
    } finally {
      setLoading(false);
    }
  };

  // View bidder details
  const viewBidDetails = async (bid) => {
    try {
      setLoading(true);
      setSelectedBid(bid);

      if (bid.bidder && bid.bidder.length > 0) {
        // Fetch detailed information about each bidder
        const bidderPromises = bid.bidder.map(async (bidderInfo) => {
          try {
            // Make sure we have a valid user ID
            const userId = bidderInfo.userID?._id || bidderInfo.userID;
            
            if (!userId) {
              return { ...bidderInfo, userDetails: null };
            }
            
            const response = await axios.get(`${SummaryApi.allUser.url}/${userId}`);
            
            if (response.data.success) {
              return {
                ...bidderInfo,
                userDetails: response.data.data
              };
            }
            return { ...bidderInfo, userDetails: null };
          } catch (error) {
            console.error('Error fetching bidder details:', error);
            return { ...bidderInfo, userDetails: null };
          }
        });

        const bidderDetailsData = await Promise.all(bidderPromises);
        setBidderDetails(bidderDetailsData);
      } else {
        setBidderDetails([]);
      }
    } catch (error) {
      console.error('Error fetching bid details:', error);
      toast.error('Error loading bidder details');
    } finally {
      setLoading(false);
    }
  };

  // Function to go back to bids list
  const goBackToBidsList = () => {
    setSelectedBid(null);
    setBidderDetails([]);
  };

  // Function to toggle bid form visibility
  const toggleBidForm = () => {
    setShowBidForm(!showBidForm);
    if (!showBidForm) {
      // Reset form when opening
      reset();
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get product details helper function
  const getProductDetails = (productID) => {
    return products.find(product => product._id === productID) || {};
  };

  // Find highest bid amount
  const getHighestBid = (bidderArray) => {
    if (!bidderArray || bidderArray.length === 0) return 0;
    return Math.max(...bidderArray.map(b => b.bidAmount));
  };

  // Get time remaining in days
  const getTimeRemaining = (closeDate) => {
    const remaining = new Date(closeDate) - new Date();
    if (remaining <= 0) return 'Ended';
    
    const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
    if (days === 0) return 'Ends today';
    return days === 1 ? '1 day left' : `${days} days left`;
  };

  // Render bidder details view
  const renderBidderDetailsView = () => {
    if (!selectedBid) return null;
    
    // Get product details for the selected bid
    const productId = selectedBid.productID?._id || selectedBid.productID;
    const product = getProductDetails(productId);
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Bid Details</h2>
          <button 
            onClick={goBackToBidsList}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
          >
            Back to All Bids
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/3 relative">
              {product.productImage && product.productImage.length > 0 ? (
                <img 
                  src={product.productImage[0]} 
                  alt={selectedBid.productID?.productName || 'Product'}
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="w-full h-64 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">No image available</span>
                </div>
              )}
              <div className={`absolute top-4 right-4 ${
                new Date(selectedBid.closeDate) > new Date() ? 'bg-green-500' : 'bg-red-500'
              } text-white text-sm font-medium py-1 px-3 rounded-full`}>
                {new Date(selectedBid.closeDate) > new Date() ? 'Active' : 'Closed'}
              </div>
            </div>
            <div className="md:w-2/3 p-6">
              <h2 className="text-xl font-bold mb-2">
                {selectedBid.productID?.productName || product.productName || 'Unknown Product'}
              </h2>
              <p className="text-gray-700 mb-4">
                {product.description || 'No description available'}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <span className="text-gray-600 text-sm">Starting Price</span>
                  <p className="font-bold text-lg">Rs.{selectedBid.startPrice}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Current Highest Bid</span>
                  <p className="font-bold text-lg text-green-600">
                    {selectedBid.bidder && selectedBid.bidder.length > 0 ? 
                      `Rs.${getHighestBid(selectedBid.bidder)}` : 
                      'No bids yet'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Close Date</span>
                  <p className="font-medium">{formatDate(selectedBid.closeDate)}</p>
                </div>
                <div>
                  <span className="text-gray-600 text-sm">Total Bids</span>
                  <p className="font-medium">{selectedBid.bidder ? selectedBid.bidder.length : 0}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h3 className="text-xl font-bold mt-8 mb-4">Bidders List</h3>
        {bidderDetails.length > 0 ? (
          <div className="space-y-4">
            {bidderDetails.sort((a, b) => b.bidAmount - a.bidAmount).map((bidder, index) => {
              // Safely handle user information
              const bidderUserId = bidder.userID || {};
              const bidderUserDetails = bidder.userDetails || {};
              
              // Get the best available name
              const bidderName = bidderUserDetails.name || 
                  (bidderUserDetails.firstName && bidderUserDetails.lastName ? 
                   `${bidderUserDetails.firstName} ${bidderUserDetails.lastName}` : 
                   (bidderUserId.name || 'Anonymous Bidder'));
              
              // Get initial for avatar
              const nameInitial = (bidderName && bidderName.charAt(0)) || 'U';
              
              // Get email
              const email = bidderUserDetails.email || bidderUserId.email || 'No email available';
              
              return (
                <div key={index} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <span className="text-blue-600 font-medium">{nameInitial}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{bidderName}</h4>
                        <p className="text-sm text-gray-600">{email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-green-600 font-bold text-lg">Rs.{bidder.bidAmount}</div>
                    </div>
                  </div>
                  {bidder.message && (
                    <div className="mt-3 bg-gray-50 p-3 rounded-md text-gray-700 text-sm italic">
                      "{bidder.message}"
                    </div>
                  )}
                </div>  
              );
            })}
          </div>
        ) : (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 14h.01M19 21H5a2 2 0 01-2-2V7a2 2 0 012-2h14a2 2 0 012 2v12a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-2 text-gray-500">No bids have been placed yet</p>
          </div>
        )}
      </div>
    );
  };

  // Render bid creation form
  const renderBidForm = () => {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Create a New Bid</h2>
          <button 
            onClick={toggleBidForm}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit(handleBidSubmit)} className="space-y-4">
          {/* Product selection dropdown */}
          <div>
            <label className="block mb-2 text-gray-700">Select Product</label>
            <select
              {...register('productID', { required: 'Product is required' })}
              className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">-- Select Product --</option>
              {products && products.length > 0 ? (
                products.map((product) => (
                  <option key={product._id} value={product._id}>
                    {product.productName} (Price: {product.Size?.[0]?.price || 'N/A'})
                  </option>
                ))
              ) : (
                <option value="" disabled>No products available</option>
              )}
            </select>
            {errors.productID && <p className="text-red-500 text-sm mt-1">{errors.productID.message}</p>}
          </div>

          {/* Price and Date in a grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Price input */}
            <div>
              <label className="block mb-2 text-gray-700">Start Price</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">Rs.</span>
                <input
                    type="number"
                    step="0.01"
                    {...register('startPrice', { 
                      required: 'Start price is required',
                      min: { value: 0, message: 'Price must be greater than 0' }
                    })}
                    onInput={(e) => {
                      if (e.target.value.length > 1 && e.target.value.startsWith('0') && !e.target.value.startsWith('0.')) {
                        e.target.value = e.target.value.replace(/^0+/, '');
                      }
                    }}
                    className="w-full border border-gray-300 pl-8 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={loading}
                    placeholder="0.00"
                />
              </div>
              {errors.startPrice && <p className="text-red-500 text-sm mt-1">{errors.startPrice.message}</p>}
            </div>

            {/* Close Date input */}
            <div>
              <label className="block mb-2 text-gray-700">Close Date</label>
              <input
                type="date"
                {...register('closeDate', { 
                  required: 'Close date is required',
                  min: { 
                    value: new Date().toISOString().split('T')[0],
                    message: 'Close date must be in the future'
                  }
                })}
                className="w-full border border-gray-300 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
              />
              {errors.closeDate && <p className="text-red-500 text-sm mt-1">{errors.closeDate.message}</p>}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 w-full font-medium disabled:bg-blue-300 transition-colors"
          >
            {loading ? 'Submitting...' : 'Create Bid'}
          </button>
        </form>
      </div>
    );
  };

  // Render bids list view with cards
  const renderBidsListView = () => {
    return (
      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Your Bidding Products</h2>
          <button 
            onClick={toggleBidForm}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg flex items-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add New Bid
          </button>
        </div>
        
        {showBidForm && renderBidForm()}

        {bids.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bids.map((bid) => {
              // Get product ID safely
              const productId = bid.productID?._id || bid.productID;
              
              // Get corresponding product details for images
              const product = getProductDetails(productId);
              
              // Other bid details
              const isActive = new Date(bid.closeDate) > new Date();
              const highestBid = getHighestBid(bid.bidder);
              
              // Get product name safely
              const productName = bid.productID?.productName || product.productName || 'Unknown Product';
              
              return (
                <div 
                  key={bid._id} 
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg cursor-pointer transition-shadow"
                  onClick={() => viewBidDetails(bid)}
                >
                  <div className="relative">
                    {product.productImage && product.productImage.length > 0 ? (
                      <img 
                        src={product.productImage[0]} 
                        alt={productName}
                        className="w-full h-48 object-cover"
                      />
                    ) : (
                      <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-500">No image available</span>
                      </div>
                    )}
                    
                    {/* Status Badge */}
                    <div className={`absolute top-4 right-4 ${
                      isActive ? 'bg-green-500' : 'bg-red-500'
                    } text-white text-xs font-medium py-1 px-2 rounded-full`}>
                      {isActive ? getTimeRemaining(bid.closeDate) : 'Ended'}
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 truncate">{productName}</h3>
                    <div className="flex justify-between items-end mb-2">
                      <div>
                        <p className="text-gray-500 text-sm">Starting at</p>
                        <p className="font-medium">Rs.{bid.startPrice}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-sm">Highest bid</p>
                        <p className="font-medium text-green-600">
                          {bid.bidder && bid.bidder.length > 0 ? `Rs.${highestBid}` : 'No bids'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between items-center">
                      <div className="text-sm text-gray-500">
                        Ends {formatDate(bid.closeDate)}
                      </div>
                      <div className="bg-blue-50 text-blue-700 text-sm font-medium py-1 px-2 rounded">
                        {bid.bidder ? bid.bidder.length : 0} bid{bid.bidder && bid.bidder.length !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-lg font-medium text-gray-900">No bids created yet</h3>
            <p className="mt-1 text-gray-500">Get started by creating your first bid</p>
            <div className="mt-6">
              <button 
                onClick={toggleBidForm}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Your First Bid
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto mt-8 px-4 pb-10">
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg flex items-center">
            <svg className="animate-spin h-5 w-5 mr-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Loading...</span>
          </div>
        </div>
      )}

      {selectedBid ? renderBidderDetailsView() : renderBidsListView()}
    </div>
  );
};

export default PutABid;