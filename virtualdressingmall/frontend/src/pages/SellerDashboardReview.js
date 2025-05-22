import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Star, Download, Calendar, ThumbsUp, Filter } from 'lucide-react';
import {useSelector} from 'react-redux';
const CustomerReviews = () => {
  const [reviewData, setReviewData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);
  const backendDomain = "http://localhost:8080/api";
  const user = useSelector((state) => state?.user?.user);
      // Calculate statistics
  const totalReviews = reviewData.length;
  const avgRating = totalReviews > 0 
    ? (reviewData.reduce((sum, review) => sum + review.rating, 0) / totalReviews).toFixed(1) 
    : 0;
  
  // Count ratings distribution
  const ratingCounts = [0, 0, 0, 0, 0]; // For 1, 2, 3, 4, 5 stars
  reviewData.forEach(review => {
    if (review.rating >= 1 && review.rating <= 5) {
      ratingCounts[review.rating - 1]++;
    }
  });

  // Get max count for normalizing bar lengths
  const maxCount = Math.max(...ratingCounts, 1);

  useEffect(() => {
    if (user._id) {
      fetchReviews();
    }
  }, [user._id, sortBy]); // Also refetch when sort changes

  const fetchReviews = async () => {
    if (!user._id) return;
    
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('sellerId', user._id);
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const response = await axios.get(
        `${backendDomain}/get-seller-product-reviews?${params.toString()}`
      );
      
      let reviews = response.data.data || [];
      
      // Sort reviews
      if (sortBy === 'newest') {
        reviews.sort((a, b) => new Date(b.commentDate) - new Date(a.commentDate));
      } else if (sortBy === 'oldest') {
        reviews.sort((a, b) => new Date(a.commentDate) - new Date(b.commentDate));
      } else if (sortBy === 'highest') {
        reviews.sort((a, b) => b.rating - a.rating);
      } else if (sortBy === 'lowest') {
        reviews.sort((a, b) => a.rating - b.rating);
      }
      
      setReviewData(reviews);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReviews = async (format) => {
    try {
      const params = new URLSearchParams();
      params.append('sellerId', user._id);
      params.append('format', format);
      
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      
      const url = `${backendDomain}/get-seller-product-reviews?${params.toString()}`;
      window.open(url, '_blank');
    } catch (error) {
      console.error(`Error exporting reviews as ${format}:`, error);
    }
  };

  const applyFilters = () => {
    fetchReviews();
    setShowFilters(false);
  };

  const resetFilters = () => {
    setStartDate('');
    setEndDate('');
    setShowFilters(false);
    fetchReviews();
  };

  // Render star rating
  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, index) => (
      <Star 
        key={index} 
        size={18}
        className={`${index < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Customer Reviews</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="mb-6 md:mb-0">
            <h2 className="text-xl font-semibold mb-4">Review Summary</h2>
            <div className="flex items-center">
              <span className="text-5xl font-bold mr-4">{avgRating}</span>
              <div>
                <div className="flex mb-1">
                  {renderStars(Math.round(avgRating))}
                </div>
                <p className="text-gray-600">{totalReviews} reviews</p>
              </div>
            </div>
          </div>
          
          <div className="w-full md:w-1/2">
            <h2 className="text-xl font-semibold mb-4">Rating Distribution</h2>
            {[5, 4, 3, 2, 1].map((rating) => (
              <div key={rating} className="flex items-center mb-2">
                <span className="w-6 mr-2">{rating}</span>
                <Star size={16} className="text-yellow-400 fill-yellow-400 mr-2" />
                <div className="w-full bg-gray-200 rounded-full h-4 mr-2">
                  <div 
                    className="bg-yellow-400 h-4 rounded-full"
                    style={{ width: `${(ratingCounts[rating-1] / maxCount) * 100}%` }}
                  ></div>
                </div>
                <span className="w-6 text-right">{ratingCounts[rating-1]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold mb-4 sm:mb-0">
          All Reviews ({totalReviews})
        </h2>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm hover:bg-gray-50"
          >
            <Filter size={18} className="mr-2" />
            Filters
          </button>
          <button 
            onClick={() => exportReviews('pdf')}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm hover:bg-gray-50"
          >
            <Download size={18} className="mr-2" />
            Export PDF
          </button>
          <button 
            onClick={() => exportReviews('excel')}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm hover:bg-gray-50"
          >
            <Download size={18} className="mr-2" />
            Export Excel
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest">Highest Rating</option>
            <option value="lowest">Lowest Rating</option>
          </select>
        </div>
      </div>
      
      {showFilters && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-medium mb-4">Filter Reviews</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm"
            >
              Reset
            </button>
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-10">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-600">Loading reviews...</p>
        </div>
      ) : (
        <div>
          {totalReviews === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <p className="text-xl text-gray-600">No reviews yet for your products.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviewData.map((review, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-4">
                      <img 
                        src={review.reviewerProfilePic || "/api/placeholder/60/60"} 
                        alt="Reviewer" 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium">{review.reviewerName}</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar size={14} className="mr-1" />
                          {new Date(review.commentDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex mb-2">
                        {renderStars(review.rating)}
                      </div>
                      <p className="text-gray-700 mb-3">{review.text}</p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center text-sm text-gray-500">
                          <span className="bg-gray-100 rounded-md px-3 py-1">
                            {review.productName}
                          </span>
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <ThumbsUp size={14} className="mr-1" />
                          {review.likesCount} likes
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CustomerReviews;