import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import SummaryApi from '../common';
import { useSelector } from 'react-redux';

const PlaceBidPage = () => {
    const { productId } = useParams();
    const user = useSelector((state) => state?.user?.user);  // Get logged-in user from redux store
    const [currentBid, setCurrentBid] = useState(null);
    const [bidAmount, setBidAmount] = useState('');
    const navigate = useNavigate();

    // Fetch current bid details for the selected product
    const fetchCurrentBid = async () => {
        try {
            const response = await axios.get(SummaryApi.getBidbyspecific.url);
            if (response.data.success) {
                const bid = response.data.data.find(
                    (b) => b.productID._id === productId
                );
                setCurrentBid(bid);

                // Pre-fill current bid amount if the user already placed a bid
                if (bid) {
                    const userBid = bid.bidder.find((b) => b.userID._id === user._id);
                    if (userBid) {
                        setBidAmount(userBid.bidAmount);  // Pre-fill bid amount if the user has already bid
                    }
                }
            }
        } catch (err) {
            toast.error('Error fetching bid details');
        }
    };

    useEffect(() => {
        fetchCurrentBid();
    }, [productId, user._id]);

    // Handle bid submission
    const submitBid = async () => {
        if (!bidAmount || isNaN(bidAmount) || parseFloat(bidAmount) <= 0) {
            toast.error('Please enter a valid bid amount');
            return;
        }

        try {
            const response = await axios.post(SummaryApi.updateBid.url, {
                bidId: currentBid ? currentBid._id : null,
                userId: user._id, // Logged-in user's ID
                productId: productId,
                bidAmount: parseFloat(bidAmount),
            });

            if (response.data.success) {
                toast.success(response.data.message);
                navigate('/user-bid'); // Navigate back to the bids page after successful bid placement
            } else {
                toast.error(response.data.message);
            }
        } catch (err) {
            toast.error('Error placing/updating bid');
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-10 bg-white p-6 rounded shadow">
            <h2 className="text-2xl font-semibold mb-4">Place Your Bid</h2>
            
            {/* Display current bid holder's name and bid amount */}
                    {currentBid?.bidder?.length > 0 ? (
            <div className="mb-6">
                <h3 className="text-lg font-semibold">Current Bidders</h3>
                {currentBid.bidder.map((bid, index) => (
                    <div key={index} className="mb-2">
                        <p><strong>Bid Holder {index + 1}:</strong> {bid.userID?.name || 'Unknown'}</p>
                        <p><strong>Bid Amount:</strong> Rs.{bid.bidAmount}</p>
                    </div>
                ))}
            </div>
        ) : (
            <p className="mb-6">No current bids placed.</p>
        )}

            <div className="mb-4">
                <h3 className="text-lg font-semibold">{currentBid?.productID?.productName}</h3>
                <p><strong>Start Price:</strong> Rs.{currentBid?.startPrice}</p>
            </div>

            <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                className="mt-2 p-2 border border-gray-300 rounded w-full"
                placeholder="Enter your bid amount"
            />
            <button
                onClick={submitBid}
                className="mt-4 w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
                Submit Bid
            </button>
        </div>
    );
};

export default PlaceBidPage;
