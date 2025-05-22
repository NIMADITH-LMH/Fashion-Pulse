import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaTrash, FaThumbsUp, FaStar, FaFlag, FaFilter, FaTimes } from 'react-icons/fa';

const CommentsPage = () => {
  const backendDomain = "http://localhost:8080/api";
  
  // States
  const [comments, setComments] = useState([]);
  const [likesAnalysis, setLikesAnalysis] = useState({ totalComments: 0, totalLikes: 0 });
  const [filterOptions, setFilterOptions] = useState({
    productId: '',
    userId: '',
    startDate: '',
    endDate: ''
  });
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedComment, setSelectedComment] = useState(null);
  const [flagReason, setFlagReason] = useState('');
  const [currentUserId, setCurrentUserId] = useState('643a2fc584d92a12345678'); // Mock user ID
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch comments with filters
  const fetchComments = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams();
      
      if (filterOptions.productId) queryParams.append('productId', filterOptions.productId);
      if (filterOptions.userId) queryParams.append('userId', filterOptions.userId);
      if (filterOptions.startDate) queryParams.append('startDate', filterOptions.startDate);
      if (filterOptions.endDate) queryParams.append('endDate', filterOptions.endDate);
      
      const response = await axios.get(`${backendDomain}/get-all-comments?${queryParams}`);
      setComments(response.data.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setError('Failed to load comments. Please try again later.');
      setLoading(false);
    }
  };

  // Fetch likes analysis
  const fetchLikesAnalysis = async () => {
    try {
      const response = await axios.get(`${backendDomain}/get-likes-analysis`);
      setLikesAnalysis(response.data);
    } catch (err) {
      console.error('Error fetching likes analysis:', err);
    }
  };

  // Mock data for products and users (you'd fetch these from your API)
 

  // Initial data fetch
  useEffect(() => {
    fetchComments();
    fetchLikesAnalysis();
    
  }, []);

  // Refresh comments when filters change
  useEffect(() => {
    if (!isFilterVisible) {
      fetchComments();
    }
  }, [isFilterVisible, filterOptions]);

  // Delete comment
  const handleDeleteComment = async (commentId) => {
    try {
      await axios.delete(`${backendDomain}/delete-comment/${commentId}`);
      setComments(comments.filter(comment => comment._id !== commentId));
      showSuccessMessage('Comment deleted successfully');
      fetchLikesAnalysis(); // Refresh analysis
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
    }
  };

  // Toggle like
  const handleToggleLike = async (commentId) => {
    try {
      const response = await axios.post(`${backendDomain}/toggle-like/${commentId}`, {
        userId: currentUserId
      });
      
      // Update comments state with new like count
      setComments(comments.map(comment => {
        if (comment._id === commentId) {
          const isLiked = comment.likes.some(like => like.userId === currentUserId);
          return {
            ...comment,
            likes: isLiked 
              ? comment.likes.filter(like => like.userId !== currentUserId)
              : [...comment.likes, { userId: currentUserId }]
          };
        }
        return comment;
      }));
      
      fetchLikesAnalysis(); // Refresh analysis
    } catch (err) {
      console.error('Error toggling like:', err);
      setError('Failed to like/unlike comment');
    }
  };

  // Flag comment
  const handleFlagComment = async () => {
    if (!selectedComment) return;
    
    try {
      await axios.post(`${backendDomain}/flag-comment/${selectedComment._id}`, {
        reason: flagReason
      });
      
      // Update comment in state
      setComments(comments.map(comment => {
        if (comment._id === selectedComment._id) {
          return {
            ...comment,
            flagged: {
              reason: flagReason,
              flaggedAt: new Date()
            }
          };
        }
        return comment;
      }));
      
      setSelectedComment(null);
      setFlagReason('');
      showSuccessMessage('Comment flagged successfully');
    } catch (err) {
      console.error('Error flagging comment:', err);
      setError('Failed to flag comment');
    }
  };

  // Handle filter submission
  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchComments();
    setIsFilterVisible(false);
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilterOptions({
      productId: '',
      userId: '',
      startDate: '',
      endDate: ''
    });
    fetchComments();
    setIsFilterVisible(false);
  };

  // Show success message for 3 seconds
  const showSuccessMessage = (message) => {
    setSuccessMessage(message);
    setTimeout(() => {
      setSuccessMessage('');
    }, 3000);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Check if the current user has liked a comment
  const isCommentLikedByUser = (comment) => {
    return comment.likes.some(like => like.userId === currentUserId);
  };

  // Render star rating
  const renderStarRating = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <FaStar 
          key={i} 
          className={i <= rating ? "text-yellow-500" : "text-gray-300"} 
        />
      );
    }
    return <div className="flex">{stars}</div>;
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">Product Comments Management</h1>
      
      {/* Analytics Section */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Analytics Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Comments</p>
            <p className="text-3xl font-bold text-blue-600">{likesAnalysis.totalComments}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total Likes</p>
            <p className="text-3xl font-bold text-green-600">{likesAnalysis.totalLikes}</p>
          </div>
        </div>
      </div>
      
      {/* Filter Controls */}
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => setIsFilterVisible(!isFilterVisible)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
        >
          <FaFilter /> {isFilterVisible ? 'Hide Filters' : 'Show Filters'}
        </button>
        
        {Object.values(filterOptions).some(value => value !== '') && (
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-2 bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition"
          >
            <FaTimes /> Clear Filters
          </button>
        )}
      </div>
      
      {/* Filter Form */}
      {isFilterVisible && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Filter Comments</h2>
          <form onSubmit={handleFilterSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filterOptions.startDate}
                  onChange={(e) => setFilterOptions({...filterOptions, startDate: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={filterOptions.endDate}
                  onChange={(e) => setFilterOptions({...filterOptions, endDate: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsFilterVisible(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Apply Filters
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Status Messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <span className="font-bold">Error:</span> {error}
          <button 
            onClick={() => setError(null)}
            className="float-right text-red-700"
          >
            &times;
          </button>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <span className="font-bold">Success:</span> {successMessage}
          <button 
            onClick={() => setSuccessMessage('')}
            className="float-right text-green-700"
          >
            &times;
          </button>
        </div>
      )}
      
      {/* Comments List */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4 text-gray-700">Comments</h2>
        
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No comments found. {Object.values(filterOptions).some(v => v !== '') && 'Try adjusting your filters.'}
          </div>
        ) : (
          <div className="space-y-6">
            {comments.map(comment => (
              <div key={comment._id} className={`border rounded-lg p-4 ${comment.flagged ? 'bg-red-50' : 'bg-gray-50'}`}>
                <div className="flex justify-between items-start mb-3">
                  <div className="flex items-center gap-3">
                    {comment.userId?.profilePic ? (
                      <img 
                        src={comment.userId.profilePic} 
                        alt={comment.userId?.name || 'User'}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                        {(comment.userId?.name || 'U').charAt(0)}
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium">{comment.userId?.name || 'Anonymous'}</h3>
                      <p className="text-sm text-gray-500">{comment.userId?.email}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(comment.createdAt)}
                  </div>
                </div>
                
                {comment.productId && (
                  <div className="mb-2">
                    <span className="text-sm text-gray-500">Product: </span>
                    <span className="text-sm font-medium">{comment.productId.productName}</span>
                  </div>
                )}
                
                <div className="mb-2 flex items-center gap-2">
                  {renderStarRating(comment.rating)}
                  <span className="text-sm text-gray-600">({comment.rating}/5)</span>
                </div>
                
                <p className="mb-4">{comment.text}</p>
                
                {comment.flagged && (
                  <div className="mb-4 p-2 bg-red-100 rounded text-sm text-red-700">
                    <div className="font-medium flex items-center gap-1">
                      <FaFlag /> Flagged: 
                    </div>
                    <p>{comment.flagged.reason}</p>
                    <p className="text-xs mt-1">Flagged on: {formatDate(comment.flagged.flaggedAt)}</p>
                  </div>
                )}
                
                <div className="flex gap-3 mt-2">
                  <button
                    onClick={() => handleToggleLike(comment._id)}
                    className={`flex items-center gap-1 px-3 py-1 rounded-md text-sm ${
                      isCommentLikedByUser(comment) 
                        ? 'bg-blue-100 text-blue-700' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FaThumbsUp /> {comment.likes.length} Like{comment.likes.length !== 1 ? 's' : ''}
                  </button>
                  
                  <button
                    onClick={() => setSelectedComment(comment)}
                    className="flex items-center gap-1 px-3 py-1 bg-gray-100 rounded-md text-sm text-gray-700 hover:bg-gray-200"
                  >
                    <FaFlag /> Flag
                  </button>
                  
                  <button
                    onClick={() => handleDeleteComment(comment._id)}
                    className="flex items-center gap-1 px-3 py-1 bg-red-100 rounded-md text-sm text-red-700 hover:bg-red-200 ml-auto"
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Flag Comment Modal */}
      {selectedComment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Flag Comment</h3>
            <p className="text-gray-600 mb-4">Please provide a reason for flagging this comment:</p>
            
            <textarea
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md mb-4 h-24"
              placeholder="Enter reason for flagging..."
            />
            
            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  setSelectedComment(null);
                  setFlagReason('');
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleFlagComment}
                disabled={!flagReason.trim()}
                className={`px-4 py-2 rounded-md ${
                  flagReason.trim() 
                    ? 'bg-red-600 text-white hover:bg-red-700' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Flag Comment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsPage;