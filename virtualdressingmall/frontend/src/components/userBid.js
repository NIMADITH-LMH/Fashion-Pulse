  import React, { useEffect, useState } from 'react';
  import axios from 'axios';
  import { toast } from 'react-toastify';
  import { useNavigate } from 'react-router-dom';
  import SummaryApi from '../common';
  import { useSelector } from 'react-redux';

  const ViewBids = () => {
    const [bids, setBids] = useState([]);
    const [userBids, setUserBids] = useState([]);
    const [loading, setLoading] = useState(false);
    const [userBidsLoading, setUserBidsLoading] = useState(false);
    const navigate = useNavigate();
        const user = useSelector((state) => state?.user?.user);
    

    // Fetch all available bids from the backend
    const fetchBids = async () => {
      try {
        setLoading(true);
        const response = await axios.get(SummaryApi.getBid.url);
        
        if (response.data.success) {
          const activeBids = response.data.data.filter(bid => bid.status === 'active');
          setBids(activeBids);
        } else {
          toast.error('Failed to fetch bids');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error fetching bids');
      } finally {
        setLoading(false);
      }
    };

    // Fetch user's own bids
    const fetchUserBids = async () => {
      try {
        setUserBidsLoading(true);
        // Get user information from local storage or context
        
        
        const response = await axios.get(SummaryApi.getBidbyspecific.url);
        
        if (response.data.success) {
          // Filter bids where the current user has placed a bid
          const filteredBids = response.data.data.filter(bid => 
            bid.bidder.some(bidderEntry => bidderEntry.userID._id === user?._id)
          );
          
          // For each bid, find the user's specific bid amount
          const userSpecificBids = filteredBids.map(bid => {
            const userBidEntry = bid.bidder.find(bidderEntry => 
              bidderEntry.userID._id === user?._id
            );
            
            return {
              ...bid,
              userBidAmount: userBidEntry ? userBidEntry.bidAmount : null
            };
          });
          
          setUserBids(userSpecificBids);
        } else {
          toast.error('Failed to fetch your bids');
        }
      } catch (err) {
        console.error(err);
        toast.error('Error fetching your bids');
      } finally {
        setUserBidsLoading(false);
      }
    };

    useEffect(() => {
      fetchBids();
      fetchUserBids();
    }, []);

    // Handle placing a bid
    const placeBid = (productID) => {
      navigate(`/placeBid/${productID}`); // Navigate to placeBid page with productId
    };

    return (
      <div className="max-w-6xl mx-auto mt-10 flex flex-col md:flex-row gap-8">
        {/* Left side: Available bids */}
        <div className="md:w-2/3 bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Available Bids</h2>
          
          {loading ? (
            <p>Loading...</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {bids.length > 0 ? (
                bids.map((bid) => (
                  <div 
                    key={bid._id} 
                    className="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200 cursor-pointer"
                    onClick={() => placeBid(bid.productID._id)}
                  >
                    <div className="relative">
                      {/* Product Image */}
                      <img
                        src={bid.productID.productImage[0] || '/default-image.jpg'}
                        alt={bid.productID.productName}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-0 right-0 m-2 bg-blue-600 text-white px-2 py-1 rounded-lg text-xs">
                        {new Date(bid.closeDate).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold">{bid.productID.productName}</h3>
                      <p className="mt-2"><strong>Start Price:</strong> Rs.{bid.startPrice}</p>
                      
                      <button
                        className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                      >
                        Place a Bid
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <p>No bids available at the moment.</p>
              )}
            </div>
          )}
        </div>

        {/* Right side: User bid details */}
        <div className="md:w-1/3 bg-white p-6 rounded shadow">
          <h2 className="text-2xl font-semibold mb-4">Your Bids</h2>
          
          {userBidsLoading ? (
            <p>Loading your bids...</p>
          ) : (
            <div className="space-y-4">
              {userBids.length > 0 ? (
                userBids.map((userBid) => (
                  <div 
                    key={userBid._id} 
                    className="flex items-center p-3 border rounded cursor-pointer hover:bg-gray-50"
                    onClick={() => placeBid(userBid.productID._id)}
                  >
                    <img
                      src={userBid.productID.productImage[0] || '/default-image.jpg'}
                      alt={userBid.productID.productName}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="ml-4 flex-1">
                      <h4 className="font-medium">{userBid.productID.productName}</h4>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-sm text-gray-600">Your bid: </span>
                        <span className="font-bold text-green-600">Rs.{userBid.userBidAmount}</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(userBid.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p>You haven't placed any bids yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  export default ViewBids;