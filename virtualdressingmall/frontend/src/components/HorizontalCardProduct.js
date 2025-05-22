import React, { useContext, useEffect, useCallback, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaAngleLeft, FaAngleRight, FaReply, FaThumbsUp, FaShare, FaComment, FaHeart, FaShoppingCart, FaStar, FaTrash, FaTimes } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Context from '../context';
import fetchCategoryWiseProduct from '../helpers/fetchCategoryWiseProduct';
import displayINRCurrency from '../helpers/displayCurrency';
import addToCart from '../helpers/addToCart';
import axios from 'axios';

// Default images as data URIs to avoid external dependencies
const DEFAULT_AVATAR = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAACXBIWXMAAAsTAAALEwEAmpwYAAAEO0lEQVR4nO2WW0wTWRTGN5GYgA+oMTFq4jsJD+jDS9BHfTLGA7nOwpSZtlDAcFHREpREUZF7uYlcFVC84oUgAbSAKNS0VAoWBIHSDkUcLrVQCgWG4TbM8K/HbFaTEt7mwSZfMslkz/m+/e2z1wj5n38SrbPUxjk4xMk5eqbI2XjKJeXsHTnHdgrOxnPRFcO8V/yvYiIno2eRnK1HsXKG+gjKcSppjMuDaJqXVQzl5rXkfyXWOiuX0jnZBypnZPUcyB5GJq/OznHRXM3FeHLLnuVBcpZaGXL2jl9yT12qpU/1AyuGgVV2CqPcFLTyD9F8MR6NoSGodrVEjRMjVB9MQvOZCagPdkRzmAaN4eQIlTOyeY6e91yzlJYGE5CzdzjAnE5GZPkgsga/Y3gFmF5RoCEZWgHGL8P+KUhRZXQXNS40Wh0YVDi6pDY4MBfD1NRH3C0dxOMmDjVDPKqHeJN43zWIyvxuVLjbosqVglE8VTjQsXAyesE2ONAOTAwTs7qIwYZbCbh86h7i3GKR4M3g3I0rSAlOgr+bH/wd/RHiFIzo0HSkRGYj2t0XQY7+OL/bDtcoPyS62yDMkcY1SvbZnQNUlJMx/RHDQ06IiM9GVPB5BHseRaiHJ6JdnZBgo6HWnEa9FQ2NLYNcdxphxzJx0iEI3qHROO5wEp5+oYh2OQlfdwrxUYytA1Qsg8z3GBZnoCEjDN5Bp3AmIgE3IuKQGRSLJGtLFNtJ8cFciiEnGePOFnhnI0WdOYVsezskByQjPTAGKYExiD0RijCfE4iKlL63cYByMXrNP3Eo3dMKMV6+SAuNQ3b4OfwVEI5YKwbl1hRIVwlTBxLjLhTGXGQYdGTw0lqCMmdLxPv4I+NsJM77hSE+KBhB3v7w8ZBv7QDl5LI3PPMuiA/0RXrASWQERSHRyw+RdjSKLS3Qb01D6yIDcSMx6WaNSVcrDNqRGLSjUOVgjQj3b19KdGAQYgOO4pzfEaScOY5j/vSWDnCOnu3DCcfvIubYYaT4+yM9MBDnPQ8i3I5Gvg2FKhsaOncZCG8JtHckaO7I0HAXGHCToMxJistHjyHN5xDOHTuMZJ8D8PXzxX4/+v9zYK/UPOtQGHM0Bsm+Xkjz8UGClwciHK1QYG2GKrEDDhI0iIz8dSi7I0WNsxRJB52R6uOFNO99SPL2gK+fD3b5yLZxgDJP3+cVgwNehxDj5Yr0oy5I9NyLEAcLZFubo9xKgjoRea2VBPfFTnjL8KhQhgKRg7YMChxkiBS/C2l7nZDsuQ/nDx9EnP9+HPEXrxX5FglI9/mF3YohJyYUoW77Ee+xH1GOexBmT+OymQnKLUxRayFBo4UE9WamqDI3Rbm5CYrFjnmZIN/cBFkWpoi228XfstyHEHcXhOxnEXBCvFlyr21D8n80+QljUdwGQFlUPAAAAABJRU5ErkJggg==';
const DEFAULT_NO_IMAGE = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAMAAABrrFhUAAAAP1BMVEXm5uZ+fn7j4+OsrKx4eHjb29vW1tavr6/R0dHNzc2cnJyUlJTGxsazs7Nzc3PCwsKQkJCampqJiYmDg4PAwMDtxQO0AAAGOUlEQVR4nO2d2ZarIBBFCRInnHX+/2Ov6U5i64gKHMrsvd7Sdfuw4lRRDLIsWZIFXSJEkiVBt0iWJEm3CfJLEPSTcMkPQVcLf85/LjoG53QQ7gcTZCgQEhjBD0F3K6/7RQbhnjJBBgMjyPdW/o/g9wHECSJUEPwSdLHyyfcBBBPkvw0geKxAQsGqLzhRdU2Q4BbkH1Uf9QCKe4KsOwxRhZbV5KuPXN0P4gNtQEcQtQHqjSX1xwASQXQGoPz53fsDiA5EaQCJATp5IPh9AMkEmTdB3tVHJPAGEAkiMkDfFZw8EhQ9QTQGEAjq1xN8NoBogiQ/DFDXRzLwBhBMkEVqgNYA5WeCTxGIwgDSfRC/neD9AOIEEQZe3e0HzzUI3g0gjkBEBujlYcWaII3AAIKg0XaDzwaQTZD4M8Dd3VQfOH5HIPwNIBNUbwmiCNIq+D8ByAQN3bbiAMF/A4gnSLwZQJbXL4JAIxAeBhAFgUZgAGEEws8AUj4QC7YGuNvaHkHCzwBtKFg3Av2AkfAygBgK1o0ggvAwQD+CvGgjkAEGEAjq5aaXCCRPhLcBBEGTThAJ6C7v7wYQ7oNK3gmaCATsBhAELfN24xAfwQHaADJBs3iTRyA5IKA1gCho0QgaDgNoA4iCVo0gHQFYDSAR1Cv3QSoI8BlA3giWRSMoBJENIBPUXwlSQXgMIAqa11U/eQTCZACJoFUOCDKBoBGUDTuCzgQJK4LoKwH1u4KbRpAMYk8Q+VgQdQSinwmKjyOQbgBxBCLcB9Vn2+WdIBMUH0cg+plg4/1eJqh/JCjfCNr4J8iIx4KoIpD2i1A8uBNkguLDCKS/DzbfcYug8SOBvB+AZ0H8VQSSD8HjCNT3BG8JYiFIPxY8EO8JMgHPCMRjQfSVgP5EIEYgbQfRnQjeDsSDIPYqAskHYXAjeH8Qho8gRwJGgqgjEP1+UHwiaJ8JMkGSCGQgDgThUxD/WBA9EyT6svhxBNLPBCcmgiQQxF9FoN4Ax95Gnwgy+bngtR0+E6SLIDAEMeAIRI8n0U4+E4wE8dcRaKbvzptAEH8dgcCDDSEhiL+KQHo72D4THAniryIQfd4OY0MQfxmB6JsD0UsEwhKB6MtvJrAQxF9GoOG2LaYiiL6MQPr5UDsVQfx1BKJfrsfcROBtBNqKVUcQNUHsFwLnZXnz/VgVQbCHYPZyPdYuAutLsdMQxN9EIHpZHqsmCPZF+WXeqgrAQhD/2Q56WV8T1QXgQBB/G4GA6+KskSD+NgIB9+VxOoL4rxFoe1mdniD+NoJ3S/MNBLGfCIKu7TcRxH6JQLaL+wkJ4j8TBF1daCSIv49A0PUVZoL4+5kge7fA3kAQ+2mA7WIXx3Rtv50g/scEsV+vx1i/vcJBEP+DIO63VzgI4n/dB9vdLi7y8goXQew/EAS+v8NFEP/jrthvMHERxP84C/YbTJwE8T/ui/0OGydB/K+PhP0WIzdB7M+CgPe4OAniL66Cfoc68+0lToLYX0RB77FxE8T/fiz2m4zcBPE/XhD7XUZugthfRMHvsnITxP9+NvTbjBwEsb/eCL/PykEQ/+vx2G80chDE/n4+/E4rB0H8D0dkv9XKRRD/yynZ7zVzEcT+dEz8bjMHQez/nRO/38xBEP/TSfE77lwE8b8elv2WQxdB/M/nxe+6cxHE/35k9tsuHQSxfxyb/b5TB0H8H+fG7zx1EMT/eXL83lMHQfyfh8fvPrYTxP4lAvb3AOwE8X+LgP8VBDtB/F9j4H8Jwk4Q//co+F/DsBPE/z0O/hdR7ATxf4+E/1UcO0H8PyLhfxnJThD/r1iCA/5XsewEsf+MJvj2UjtB/L/jYX8dz04Q/++Y+F9ItRPE/zMu/ldybQSx/46M/6VkG0H8v6Pjfy3bRhD/jwnYX0y3EMT/aw7+V/MtBPH/nAX/y/k0COKP45lGHQ2C+EuCuCOQgSAWAvCxIPqRIB4CACOImSD+OgJRE8RCAGEEYiKIhQDaCEREEAsBuBHIQBALAbARSCOIgwDkCKQhiIOAfwQyEcRBAHkEMhDEQfA/REE1jppzxr8AAAAASUVORK5CYII=';

const HorizontalCardProduct = ({ category, heading }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [likes, setLikes] = useState({});
    const [comments, setComments] = useState({});
    const [newComment, setNewComment] = useState('');
    const [newReply, setNewReply] = useState('');
    const [replyingTo, setReplyingTo] = useState(null);
    const [rating, setRating] = useState(5);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showReactions, setShowReactions] = useState(false);
    const [selectedReaction, setSelectedReaction] = useState(null);
    const loadingList = new Array(6).fill(null);
    const scrollElement = useRef();
    const navigate = useNavigate();
    const [submittingComment, setSubmittingComment] = useState(false);
    const [submittingReply, setSubmittingReply] = useState(false);
    const [showProductModal, setShowProductModal] = useState(false);
    const [selectedProductDetails, setSelectedProductDetails] = useState(null);
    const modalRef = useRef(null);

    // Get user from Redux store
    const user = useSelector((state) => state?.user?.user);
    const { fetchUserAddToCart } = useContext(Context);

    const reactions = [
        { emoji: "👍", name: "Like", color: "#2078f4" },
        { emoji: "❤️", name: "Love", color: "#f33e58" },
        { emoji: "🤗", name: "Care", color: "#f7b125" },
        { emoji: "😠", name: "Angry", color: "#e9710f" }
    ];

    const handleAddToCart = async (e, id) => {
        e.preventDefault();
        
        // Check if user is logged in
        if (!user || !user._id) {
            toast.error('Please log in to add items to cart');
            navigate('/login');
            return;
        }
        
        try {
            // Get token from local storage
            const token = localStorage.getItem('token');
            
            if (!token) {
                toast.error('Your session has expired. Please log in again.');
                navigate('/login');
                return;
            }
            
            // Find the product in our data
            const product = data.find(p => p._id === id);
            
            if (!product) {
                toast.error('Product not found');
                return;
            }
            
            // Use the first available size or default to "M" if no sizes
            const defaultSize = product.Size && product.Size.length > 0 
                ? product.Size[0].size 
                : "M";
            
            // Prepare the request data with all required fields
            const requestData = {
                userId: user._id,
                productId: id,
                size: defaultSize,
                quantity: 1
            };
            
            // Make the API call directly
            const response = await fetch('http://localhost:8080/api/add-to-cart', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(requestData)
            });
            
            const responseData = await response.json();
            
            if (responseData.success) {
                toast.success(responseData.message || 'Added to cart successfully');
                // Update cart count
            await fetchUserAddToCart();
            } else {
                toast.error(responseData.message || 'Failed to add to cart');
            }
        } catch (error) {
            console.error("Error adding to cart:", error);
            toast.error('Failed to add to cart. Please try again.');
        }
    };
    
    // Fetch comments for a product
    const fetchComments = async (productId) => {
        if (!productId) {
            console.error('No product ID provided');
            return;
        }
        
        try {
            console.log('Fetching comments for product:', productId);
            
            const response = await fetch(`http://localhost:8080/api/comments/${productId}`);
            const data = await response.json();
            
            if (data.success) {
                console.log(`Found ${data.data.length} comments`);
                
                // Format comments from MongoDB structure
                const formattedComments = data.data.map(comment => ({
                    _id: comment._id,
                    text: comment.text,
                    userId: comment.userId,
                    userName: comment.userName || 'Anonymous',
                    userImage: comment.userImage || null,
                    rating: comment.rating || 5,
                    likes: comment.likes || [],
                    createdAt: comment.createdAt,
                    updatedAt: comment.updatedAt,
                    replies: comment.replies || []
                }));
                
                setComments(prev => ({
                    ...prev,
                    [productId]: formattedComments
                }));
            } else {
                console.error('Error fetching comments:', data.message);
                // Initialize with empty array if there's an error
                setComments(prev => ({
                    ...prev,
                    [productId]: []
                }));
            }
        } catch (err) {
            console.error('Network error fetching comments:', err);
            // Initialize with empty array if there's a network error
            setComments(prev => ({
                ...prev,
                [productId]: []
            }));
        }
    };

    const handleLike = (productId) => {
        setLikes(prev => ({
            ...prev,
            [productId]: (prev[productId] || 0) + 1
        }));
    };

    // Add a comment to a product
    const handleAddComment = async (productId) => {
        if (!newComment.trim()) {
            toast.error('Please write a comment');
            return;
        }
        
        if (!user || !user._id) {
            toast.error('Please log in to add comments');
            // Redirect to login page
            navigate('/login');
            return;
        }
        
        // Check if token exists
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Your session has expired. Please log in again.');
            // Redirect to login page
            navigate('/login');
            return;
        }
        
        try {
            setSubmittingComment(true);
            console.log('Adding comment to product:', productId);
            
            // Prepare comment data based on MongoDB schema
            const commentData = {
                productId: productId,
                text: newComment,
                userName: user.name || 'Anonymous',
                rating: rating || 5,
                userImage: user.profileImage || null,
                likes: []
            };
            
            console.log('Submitting comment:', commentData);
            
            // Use the API endpoint for comments
            const response = await fetch('http://localhost:8080/api/comments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                    },
                body: JSON.stringify(commentData)
                });

                const data = await response.json();
            
            if (data.success) {
                toast.success('Comment added successfully!');
                setNewComment('');
                setRating(5);
                
                // Refetch comments for this product
                fetchComments(productId);
            } else {
                // Handle token expiration
                if (data.message && data.message.includes('token')) {
                    toast.error('Your session has expired. Please log in again.');
                    // Redirect to login page
                    navigate('/login');
                } else {
                    toast.error(data.message || 'Failed to add comment');
                }
            }
        } catch (err) {
            console.error('Error posting comment:', err);
            toast.error('Network error posting comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    // Like a comment
    const handleCommentLike = async (commentId) => {
        try {
            const response = await axios.post(`/api/products/comments/${commentId}/like`, {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`
                }
            });
            // Update the likes count in the UI
            setComments(comments.map(comment => 
                comment._id === commentId ? { ...comment, likes: response.data.likes } : comment
            ));
            } catch (error) {
            console.error('Error liking comment:', error);
        }
    };

    // Handle reply to comment
    const handleReplyClick = (commentId) => {
        if (replyingTo === commentId) {
            setReplyingTo(null);
            setNewReply('');
        } else {
            setReplyingTo(commentId);
            setNewReply('');
        }
    };
    
    // Submit a reply
    const handleSubmitReply = async (commentId) => {
        if (!newReply.trim()) {
            toast.error('Please write a reply');
            return;
        }
        
        try {
            // Update state locally for testing
            setComments(prev => {
                const newComments = { ...prev };
                
                // Find the product that contains this comment
                Object.keys(newComments).forEach(productId => {
                    const productComments = newComments[productId];
                    if (!Array.isArray(productComments)) return;
                    
                    const commentIndex = productComments.findIndex(c => c._id === commentId);
                    if (commentIndex !== -1) {
                        // Create copy of comments
                        const updatedComments = [...productComments];
                        const comment = { ...updatedComments[commentIndex] };
                        
                        // Initialize replies array if needed
                        if (!comment.replies) comment.replies = [];
                        
                        // Add new reply
                        const reply = {
                            _id: Date.now().toString(), // Temporary ID
                            userId: user._id,
                            userName: user.name || 'User',
                            userImage: user.profileImage || DEFAULT_AVATAR,
                            text: newReply,
                            createdAt: new Date().toISOString(),
                            likes: []
                        };
                        
                        comment.replies.push(reply);
                        
                        // Update comment in list
                        updatedComments[commentIndex] = comment;
                        newComments[productId] = updatedComments;
            }
                });
                
                return newComments;
            });
            
            // Reset state
            setNewReply('');
            setReplyingTo(null);
            toast.success('Reply added successfully!');
            
            // In a real app, you would call API to save reply
        } catch (error) {
            console.error('Error adding reply:', error);
            toast.error('Error adding reply');
        }
    };

    const handleReactionSelect = (reaction, productId) => {
        setSelectedReaction(reaction);
        setShowReactions(false);
        handleLike(productId);
    };

    const scrollRight = () => {
        scrollElement.current.scrollLeft += 300;
    };
    
    const scrollLeft = () => {
        scrollElement.current.scrollLeft -= 300;
    };

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const categoryProduct = await fetchCategoryWiseProduct(category);
            
            if (!categoryProduct || !categoryProduct.data) {
                throw new Error('No products found for this category');
            }

            // Fetch shop details for each product
            const productsWithShopDetails = await Promise.all(
                categoryProduct.data.map(async (product) => {
                    if (product.ShopID) {
                        try {
                            // If ShopID is already populated as an object with shop details, return as is
                            if (typeof product.ShopID === 'object' && product.ShopID !== null) {
                                return product;
                            }
                            
                            // Otherwise, try to fetch shop details
                            const response = await fetch(`http://localhost:8080/shop-details/${product.ShopID}`);
                            const shopData = await response.json();
                            
                            if (shopData.success && shopData.data) {
                                return {
                                    ...product,
                                    ShopID: shopData.data
                                };
                            }
                        } catch (error) {
                            console.error("Error fetching shop details:", error);
                        }
                    }
                    return product;
                })
            );

            setData(productsWithShopDetails);
        } catch (err) {
            console.error("Error fetching products:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [category]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);
    
    // Fetch comments when a product is selected
    useEffect(() => {
        if (selectedProduct) {
            console.log('Selected product changed, fetching comments...');
            fetchComments(selectedProduct);
        }
    }, [selectedProduct]);

    // Fetch comments for all products when data changes
    useEffect(() => {
        if (data.length > 0) {
            console.log('Data loaded, fetching comments for all products...');
            data.forEach(product => {
                fetchComments(product._id);
            });
        }
    }, [data]);

    // Star rating component
    const StarRating = ({ value, onChange }) => {
        return (
            <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => onChange(star)}
                        className={`text-2xl ${star <= value ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                        <FaStar />
                    </button>
                ))}
            </div>
        );
    };

    // Add handleDeleteComment function
    const handleDeleteComment = async (commentId) => {
        if (!user || !user._id) {
            toast.error('Please log in to delete comments');
            return;
        }
        
        // Check if token exists
        const token = localStorage.getItem('token');
        if (!token) {
            toast.error('Your session has expired. Please log in again.');
            navigate('/login');
            return;
        }
        
        try {
            console.log('Deleting comment:', commentId);
            
            const response = await fetch(`http://localhost:8080/api/comments/${commentId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                toast.success('Comment deleted successfully');
                
                // Update comments state to remove the deleted comment
                setComments(prev => {
                    const newComments = { ...prev };
                    
                    Object.keys(newComments).forEach(productId => {
                        if (Array.isArray(newComments[productId])) {
                            newComments[productId] = newComments[productId].filter(
                                comment => comment._id !== commentId
                            );
                        }
                    });
                    
                    return newComments;
                });
            } else {
                toast.error(data.message || 'Failed to delete comment');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
            toast.error('Network error deleting comment');
        }
    };

    // Function to fetch and show product details in modal
    const handleShowProductDetails = async (productId) => {
        try {
            // First check if we already have the product in our data
            const productInData = data.find(p => p._id === productId && p.status==='active');
            
            if (productInData) {
                setSelectedProductDetails(productInData);
                setShowProductModal(true);
                return;
            }
            
            // If not found in current data, fetch from API
            const response = await fetch(`http://localhost:8080/product-details`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: productId })
            });
            
            const result = await response.json();
            
            if (result.success && result.data) {
                setSelectedProductDetails(result.data);
                setShowProductModal(true);
            } else {
                toast.error('Failed to load product details');
            }
        } catch (error) {
            console.error('Error fetching product details:', error);
            toast.error('Error loading product details');
        }
    };
    
    // Close modal when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (modalRef.current && !modalRef.current.contains(event.target)) {
                setShowProductModal(false);
            }
        };
        
        if (showProductModal) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showProductModal]);

    // Product Detail Modal Component
    const ProductDetailModal = () => {
        if (!selectedProductDetails) return null;
        
        const { productName, description, price, productImage, category, Size } = selectedProductDetails;
        
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg max-w-xl w-full overflow-auto max-h-[90vh]">
                    {/* Header with close button */}
                    <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-xl font-bold">{productName}</h2>
                        <button 
                            onClick={() => setShowProductModal(false)}
                            className="text-gray-500 hover:text-gray-700"
                        >
                            <FaTimes size={24} />
                        </button>
                    </div>
                    
                    {/* Product Category and Seller */}
                    <div className="p-4 border-b">
                        <p className="text-gray-600">{category}</p>
                        <p className="text-blue-600 font-medium cursor-pointer hover:underline" 
                           onClick={(e) => {
                               e.stopPropagation();
                               const shopId = typeof selectedProductDetails.ShopID === 'object' 
                                   ? selectedProductDetails.ShopID._id 
                                   : selectedProductDetails.ShopID;
                               if (shopId) {
                                   setShowProductModal(false);
                                   navigate(`/shop-details`);
                               } else {
                                   toast.error('Shop details not available');
                               }
                           }}>
                            {selectedProductDetails?.ShopID && 
                                (typeof selectedProductDetails.ShopID === 'object' 
                                    ? (selectedProductDetails.ShopID.name || 'Seller') 
                                    : 'prasad fashion ')
                            }
                        </p>
                    </div>
                    
                    <div className="p-6">
                        {/* Centered Product Image */}
                        <div className="flex justify-center mb-6">
                            <img 
                                src={productImage?.[0]} 
                                alt={productName}
                                className="h-64 object-contain"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = DEFAULT_NO_IMAGE;
                                }}
                            />
                        </div>
                        
                        {/* Product Details */}
                        <div>
                            <h3 className="font-semibold text-lg mb-4">Product Details</h3>
                            
                            {/* Available Sizes */}
                            <div className="mb-6">
                                <p className="font-medium mb-2">Available Sizes:</p>
                                <div className="flex flex-wrap gap-2">
                                    {Size && Size.map((sizeItem, index) => (
                                        <div key={index} className="border rounded-md p-2">
                                            <span className="font-medium">{sizeItem.size}</span>
                                            <span className="ml-2 text-blue-600">
                                                LKR {sizeItem.price?.toLocaleString()}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            
                            {/* Description */}
                            <div className="mb-6">
                                <h3 className="font-medium mb-2">Description</h3>
                                <p className="text-gray-700">{description || "gfdgagugfuagfyuwuyehw"}</p>
                            </div>
                            
                            {/* Action Buttons */}
                            <div className="flex gap-3">
                                {user ? (
                                    <button 
                                        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 flex-1"
                                        onClick={(e) => {
                                            handleAddToCart(e, selectedProductDetails._id);
                                            setShowProductModal(false);
                                        }}
                                    >
                                        <FaShoppingCart />
                                        Add to Cart
                                    </button>
                                ) : (
                                    <button 
                                        className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2 w-full"
                                        onClick={() => {
                                            setShowProductModal(false);
                                            navigate('/login');
                                            toast.info('Please sign in to add items to cart');
                                        }}
                                    >
                                        <FaShoppingCart />
                                        Add to Cart
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    if (error) {
        return (
            <div className="container mx-auto px-4 my-6">
                <h2 className="text-2xl font-semibold py-4 text-center">{heading}</h2>
                <div className="text-center text-red-600">
                    Error loading products: {error}
                </div>
            </div>
        );
    }

    // Logged-in user view with social features
    if (user) {
        return (
            <div className="container mx-auto px-4 my-6">
                <h2 className="text-2xl font-semibold py-4 text-center">{heading}</h2>
                <div className="flex flex-col items-center space-y-8">
                    {loading ? (
                        loadingList.map((_, index) => (
                            <div key={index} className="w-full max-w-4xl bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="bg-gray-300 h-96 flex items-center justify-center animate-pulse"></div>
                                <div className="p-6">
                                    <div className="h-6 bg-gray-300 rounded w-3/4 mb-3 animate-pulse"></div>
                                    <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        data.filter(product => product.status === 'approved').map((product) => (
                            <div key={product?._id} className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
                                {/* Product Header */}
                                <div className="p-4">
                                    <h2 className="font-semibold text-2xl text-gray-900">{product?.productName}</h2>
                                    <p className="text-lg text-gray-500">{product?.category}</p>
                                    <div className="flex items-center gap-4 mt-2">
                                        {product?.price > (product?.sellingPrice || product?.price) && (
                                            <>
                                                <p className="text-gray-500 line-through text-lg">{displayINRCurrency(product?.price)}</p>
                                                <span className="bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-semibold">
                                                    {Math.round(((product?.price - (product?.sellingPrice || product?.price)) / product?.price) * 100)}% OFF
                                                </span>
                                            </>
                                        )}
                                    </div>
                                    
                                    {/* Description snippet */}
                                    {product?.description && (
                                        <p className="text-gray-700 text-sm mt-2 line-clamp-2">{product?.description}</p>
                                    )}
                                    
                                    {/* Shop info */}
                                    <div className="mt-2">
                                        <p className="text-blue-600 font-medium">
                                            {product?.ShopID && 
                                                (typeof product.ShopID === 'object' 
                                                    ? (product.ShopID.name || 'Seller') 
                                                    : 'Shop')
                                            }
                                        </p>
                                    </div>
                                    
                                    {/* Size availability */}
                                    {product?.Size && product.Size.length > 0 && (
                                        <div className="mt-2">
                                            <p className="text-sm text-gray-500">Available sizes:</p>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {product.Size.slice(0, 4).map((sizeItem, idx) => (
                                                    <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                                                        {sizeItem.size}
                                                        {sizeItem.price && ` - ${displayINRCurrency(sizeItem.price)}`}
                                                    </span>
                                                ))}
                                                {product.Size.length > 4 && <span className="text-xs px-1">+{product.Size.length - 4}</span>}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Product Image */}
                                <div className="w-full h-[400px] flex items-center justify-center bg-gray-50">
                                    <img 
                                        src={product?.productImage?.[0]} 
                                        alt={product?.productName}
                                        className="w-full h-full object-contain hover:scale-105 transition-transform duration-300"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = DEFAULT_NO_IMAGE;
                                        }}
                                    />
                                </div>

                                {/* Social Interaction Section */}
                                <div className="border-t border-gray-100">
                                    {/* Action Buttons */}
                                    <div className="flex items-center justify-between px-6 py-2">
                                        <div className="relative">
                                            <button 
                                                className={`flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors ${selectedReaction ? 'text-[' + selectedReaction.color + ']' : 'text-gray-600'}`}
                                                onClick={() => setShowReactions(!showReactions)}
                                            >
                                                {selectedReaction ? (
                                                    <>
                                                        <span className="text-xl">{selectedReaction.emoji}</span>
                                                        <span>{selectedReaction.name}</span>
                                                    </>
                                                ) : (
                                                    <>
                                                        <span>👍</span>
                                                        <span>Like</span>
                                                    </>
                                                )}
                                            </button>
                                            
                                            {/* Reactions Panel */}
                                            {showReactions && (
                                                <div className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg border flex items-center gap-1 px-2 py-1 z-50">
                                                    {reactions.map((reaction) => (
                                                        <button
                                                            key={reaction.name}
                                                            className="p-2 hover:scale-125 transition-transform cursor-pointer"
                                                            onClick={() => handleReactionSelect(reaction, product._id)}
                                                            title={reaction.name}
                                                        >
                                                            <span className="text-2xl">{reaction.emoji}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                        
                                        <button 
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                                            onClick={() => setSelectedProduct(product._id)}
                                        >
                                            <span>💬</span>
                                            <span>Comment</span>
                                        </button>
                                        
                                        <button 
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                                        >
                                            <span>↗️</span>
                                            <span>Share</span>
                                        </button>
                                        
                                        {/* New Shop Button */}
                                        <button 
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const shopId = typeof product.ShopID === 'object' 
                                                    ? product.ShopID._id 
                                                    : product.ShopID;
                                                if (shopId) {
                                                    navigate(`/shop-details`);
                                                } else {
                                                    toast.error('Shop details not available');
                                                }
                                            }}
                                        >
                                            <span>🏪</span>
                                            <span>Shop</span>
                                        </button>
                                        
                                        <button 
                                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                            onClick={(e) => {
                                                handleAddToCart(e, product._id);
                                            }}
                                        >
                                            <span>🛒</span>
                                            <span>Add to Cart</span>
                                        </button>
                                    </div>

                                    {/* Likes Count */}
                                    {likes[product._id] > 0 && (
                                        <div className="px-6 py-2 border-t border-gray-100 flex items-center gap-2 text-gray-500">
                                            <span className="text-xl">👍</span>
                                            <span>{likes[product._id]} {likes[product._id] === 1 ? 'person likes' : 'people like'} this</span>
                                        </div>
                                    )}

                                    {/* Comments Section */}
                                    {selectedProduct === product._id && (
                                        <div className="border-t border-gray-100 p-4">
                                            {/* Comment Form */}
                                            <div className="flex flex-col gap-4 mb-4">
                                                <div className="flex items-start gap-4">
                                                    <div className="w-10 h-10 rounded-full overflow-hidden">
                                                        <img
                                                            src={user?.profileImage || DEFAULT_AVATAR}
                                                            alt={user?.name || 'User'}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <div className="flex-1">
                                                        <textarea
                                                    value={newComment}
                                                    onChange={(e) => setNewComment(e.target.value)}
                                                    placeholder="Write a comment..."
                                                            className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                                                />
                                                        <div className="flex items-center justify-between mt-2">
                                                            <StarRating value={rating} onChange={setRating} />
                                                <button
                                                    onClick={() => handleAddComment(product._id)}
                                                                disabled={!newComment.trim() || !user}
                                                    className="px-6 py-2 bg-blue-600 text-white rounded-full disabled:bg-gray-300"
                                                >
                                                    Post
                                                </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            {/* Display comments */}
                                            {Array.isArray(comments[product._id]) ? (
                                                comments[product._id].length > 0 ? (
                                                    comments[product._id].map((comment, index) => (
                                                        <div key={index} className="flex gap-4 mb-6 animate-fadeIn">
                                                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                                                                <img
                                                                    src={comment.userImage || DEFAULT_AVATAR}
                                                                    alt={comment.userName || 'User'}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                    </div>
                                                    <div className="flex-1">
                                                                <div className="bg-gray-100 rounded-lg p-4">
                                                                    <div className="flex items-center justify-between mb-2">
                                                                        <p className="font-medium text-gray-900">{comment.userName || 'Anonymous'}</p>
                                                                        <div className="flex text-yellow-400">
                                                                            {[...Array(5)].map((_, i) => (
                                                                                <span key={i} className={i < (comment.rating || 5) ? 'text-yellow-400' : 'text-gray-300'}>
                                                                                    <FaStar />
                                                                                </span>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                    <p className="text-gray-700">{comment.text}</p>
                                                                </div>
                                                                <div className="flex items-center justify-between gap-4 mt-2 text-sm text-gray-500">
                                                                    {/* Comment interactions */}
                                                                    <div className="flex space-x-4 mt-2">
                                                                        <button 
                                                                            className="text-gray-600 hover:text-blue-500 text-sm flex items-center"
                                                                            onClick={() => handleCommentLike(comment._id)}
                                                                        >
                                                                            <FaThumbsUp className="h-4 w-4 mr-1" />
                                                                            {comment.likes || 0} Likes
                                                                        </button>
                                                                        <button 
                                                                            className="text-gray-600 hover:text-blue-500 text-sm flex items-center"
                                                                            onClick={() => handleReplyClick(comment._id)}
                                                                        >
                                                                            <FaComment className="h-4 w-4 mr-1" />
                                                                            Reply
                                                                        </button>
                                                                        
                                                                        {/* Delete button - only shown for the comment owner */}
                                                                        {user && user._id === comment.userId && (
                                                                            <button
                                                                                className="text-gray-600 hover:text-red-500 text-sm flex items-center"
                                                                                onClick={() => handleDeleteComment(comment._id)}
                                                                                title="Delete comment"
                                                                            >
                                                                                <FaTrash className="h-3 w-3" />
                                                                            </button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Reply form */}
                                                                {replyingTo === comment._id && (
                                                                    <div className="mt-3 pl-4 border-l-2 border-gray-300">
                                                                        <textarea
                                                                            className="w-full p-2 border border-gray-300 rounded-md"
                                                                            rows="2"
                                                                            placeholder="Write a reply..."
                                                                            value={newReply}
                                                                            onChange={(e) => setNewReply(e.target.value)}
                                                                        ></textarea>
                                                                        <div className="flex justify-end mt-2">
                                                                            <button
                                                                                className="bg-gray-300 text-gray-700 px-3 py-1 rounded-md mr-2"
                                                                                onClick={() => setReplyingTo(null)}
                                                                            >
                                                                                Cancel
                                                                            </button>
                                                                            <button
                                                                                className="bg-blue-500 text-white px-3 py-1 rounded-md"
                                                                                onClick={() => handleSubmitReply(comment._id)}
                                                                                disabled={submittingReply || !newReply.trim()}
                                                                            >
                                                                                {submittingReply ? 'Sending...' : 'Reply'}
                                                                            </button>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                
                                                                {/* Display replies */}
                                                                {comment.replies && comment.replies.length > 0 && (
                                                                    <div className="pl-6 mt-3 border-l-2 border-gray-200">
                                                                        {comment.replies.map((reply) => (
                                                                            <div key={reply._id} className="mb-3">
                                                                                <div className="flex items-start">
                                                                                    <img
                                                                                        src={reply.userImage || DEFAULT_AVATAR}
                                                                                        alt={reply.userName || 'User'}
                                                                                        className="h-7 w-7 rounded-full mr-2"
                                                                                    />
                                                                                    <div>
                                                                                        <div className="flex items-center">
                                                                                            <p className="font-semibold text-sm">{reply.userName || 'Anonymous'}</p>
                                                                                            <span className="text-xs text-gray-500 ml-2">
                                                                                                {new Date(reply.createdAt).toLocaleDateString()}
                                                                                            </span>
                                                        </div>
                                                                                        <p className="text-sm">{reply.text}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="text-center py-4 text-gray-500">No comments yet. Be the first to comment!</div>
                                                )
                                            ) : (
                                                <div className="text-center py-4">Loading comments...</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <ToastContainer position="bottom-right" />
            </div>
        );
    }

    // Logged-out user view with horizontal scroll - Update to handle click
    return (
        <div className='container mx-auto px-4 my-6 relative'>
            <h2 className='text-2xl font-semibold py-4'>{heading}</h2>
            
            <div className='flex items-center gap-4 md:gap-6 overflow-x-auto scrollbar-none' ref={scrollElement}>
                <button className='bg-white shadow-md rounded-full p-2 absolute left-0 z-10 hidden md:block' onClick={scrollLeft}>
                    <FaAngleLeft />
                </button>
                
                {loading ? (
                    loadingList.map((_, index) => (
                        <div key={index} className='min-w-[280px] max-w-[280px] bg-white rounded-lg shadow-md p-4'>
                            <div className="bg-gray-300 h-48 rounded-md animate-pulse mb-4"></div>
                            <div className="h-6 bg-gray-300 rounded w-3/4 mb-3 animate-pulse"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/2 animate-pulse"></div>
                        </div>
                    ))
                ) : (
                    data.filter(product => product.status === 'approved').map((product) => (
                        <div 
                            key={product?._id}
                            className='min-w-[280px] max-w-[280px] bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow'
                        >
                            {/* Simple Product Info Header - matches screenshot layout */}
                            <div className="mb-4">
                                <h3 className="font-medium text-gray-900 text-xl">{product?.productName}</h3>
                                <p className="text-gray-600">{product?.category}</p>
                                <p className="text-blue-600 font-medium cursor-pointer hover:underline"
                                   onClick={(e) => {
                                       e.stopPropagation();
                                       const shopId = typeof product.ShopID === 'object' 
                                           ? product.ShopID._id 
                                           : product.ShopID;
                                       if (shopId) {
                                           navigate(`/shop-details`);
                                       } else {
                                           toast.error('Shop details not available');
                                       }
                                   }}>
                                    {product?.ShopID && (typeof product.ShopID === 'object' ? (product.ShopID.name || 'Seller') : 'LKRNaN')}
                                </p>
                                
                                {/* Added price information */}
                                <div className="mt-2 flex items-center gap-2">
                                    <p className="text-blue-600 font-bold">{displayINRCurrency(product?.sellingPrice || product?.price)}</p>
                                    {product?.price > (product?.sellingPrice || product?.price) && (
                                        <p className="text-gray-500 line-through text-sm">{displayINRCurrency(product?.price)}</p>
                                    )}
                                </div>
                                
                                {/* Description snippet */}
                                {product?.description && (
                                    <p className="text-gray-500 text-sm mt-1 line-clamp-2">{product?.description}</p>
                                )}
                                
                                {/* Size availability */}
                                {product?.Size && product.Size.length > 0 && (
                                    <div className="mt-2">
                                        <p className="text-xs text-gray-500">Available sizes:</p>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {product.Size.slice(0, 3).map((sizeItem, idx) => (
                                                <span key={idx} className="text-xs bg-gray-100 px-2 py-1 rounded">{sizeItem.size}</span>
                                            ))}
                                            {product.Size.length > 3 && <span className="text-xs px-1">+{product.Size.length - 3}</span>}
                                        </div>
                                    </div>
                                )}
                            </div>
                            
                            {/* Product Image */}
                            <div className="h-48 rounded-md overflow-hidden cursor-pointer" onClick={() => handleShowProductDetails(product?._id)}>
                                <img 
                                    src={product?.productImage?.[0]} 
                                    alt={product?.productName}
                                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = DEFAULT_NO_IMAGE;
                                    }}
                                />
                            </div>
                            
                            {/* Add to Cart Button */}
                            <div className="mt-3">
                                <button 
                                    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
                                    onClick={() => {
                                        navigate('/login');
                                        toast.info('Please sign in to add items to cart');
                                    }}
                                >
                                    <FaShoppingCart />
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    ))
                )}
                
                <button className='bg-white shadow-md rounded-full p-2 absolute right-0 z-10 hidden md:block' onClick={scrollRight}>
                    <FaAngleRight />
                </button>
            </div>
            
            {/* Render the product detail modal */}
            {showProductModal && <ProductDetailModal />}
            <ToastContainer position="bottom-right" />
        </div>
    );
};

export default HorizontalCardProduct;