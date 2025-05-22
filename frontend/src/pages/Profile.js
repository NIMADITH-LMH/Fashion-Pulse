import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { FaRegUserCircle, FaEdit, FaCamera, FaHistory, FaShoppingBag, FaCalendarAlt } from 'react-icons/fa';
import { MdLocationOn, MdEmail, MdPerson, MdSave, MdArrowBack, MdAddAPhoto } from 'react-icons/md';
import SummaryApi from '../common';
import { setUserDetails, selectUser, selectToken } from '../store/userSlice';

const Profile = () => {
    const user = useSelector(selectUser);
    const token = useSelector(selectToken);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    
    const [isEditing, setIsEditing] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        address: '',
        profilePic: ''
    });
    const [loading, setLoading] = useState(false);
    const [orderHistory, setOrderHistory] = useState([]);
    const [fetchingOrders, setFetchingOrders] = useState(false);
    const [reservationHistory, setReservationHistory] = useState([]);
    const [fetchingReservations, setFetchingReservations] = useState(false);

    const backendDomain = "http://localhost:8080/api"; // Add your backend domain

    useEffect(() => {
        if (!user?._id || !token) {
            navigate('/login');
            return;
        }
        
        setUserData({
            name: user.name || '',
            email: user.email || '',
            address: user.address || '',
            profilePic: user.profilePic || ''
        });
    }, [user, token, navigate]);

    // Fetch order history when the orders tab is selected
    useEffect(() => {
        if (activeTab === 'orders' && user?._id && token) {
            fetchOrderHistory();
        }
    }, [activeTab, user, token]);

    // Fetch reservation history when the reservations tab is selected
    useEffect(() => {
        if (activeTab === 'reservations' && user?._id && token) {
            fetchReservationHistory();
        }
    }, [activeTab, user, token]);

    const fetchOrderHistory = async () => {
        setFetchingOrders(true);
        try {
            // Get all orders and filter by current user
            const response = await axios.get(`${backendDomain}/get-all-orders`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                // Filter orders for the current user
                const userOrders = response.data.data.filter(
                    order => order.userID?._id === user._id
                );
                setOrderHistory(userOrders);
            } else {
                toast.error('Failed to fetch order history');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch order history');
        } finally {
            setFetchingOrders(false);
        }
    };

    const fetchReservationHistory = async () => {
        setFetchingReservations(true);
        try {
            const response = await axios.get(SummaryApi.getReservationDetails.url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                // Filter reservations for the current user
                const userReservations = response.data.data.filter(
                    reservation => reservation.userID?._id === user._id
                );
                setReservationHistory(userReservations);
            } else {
                toast.error('Failed to fetch reservation history');
            }
        } catch (error) {
            console.error('Error fetching reservations:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch reservation history');
        } finally {
            setFetchingReservations(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        try {
            const response = await axios.post(SummaryApi.updateUser.url, userData, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                // Update redux state with new user data
                dispatch(setUserDetails({ 
                    ...user, 
                    ...userData,
                    token // Preserve the token
                }));
                
                toast.success('Profile updated successfully!');
                setIsEditing(false);
            } else {
                toast.error(response.data.message || 'Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setLoading(false);
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = () => {
            setUserData(prev => ({
                ...prev,
                profilePic: reader.result
            }));
        };
        reader.readAsDataURL(file);
    };

    const viewOrderDetails = async (orderId) => {
        try {
            // Navigate to order detail page or show modal with order details
            const response = await axios.get(`${backendDomain}/get-order-details/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (response.data.success) {
                // You could implement a modal here to show full order details
                // or navigate to a dedicated order details page
                toast.info(`Viewing details for order ${orderId}`);
            }
        } catch (error) {
            toast.error('Failed to fetch order details');
        }
    };

    if (!user?._id || !token) {
        return (
            <div className="container mx-auto p-4 flex justify-center items-center min-h-screen">
                <div className="text-center py-12 bg-white rounded-lg shadow-xl max-w-md w-full animate__animated animate__fadeIn">
                    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-red-100 flex items-center justify-center">
                        <MdPerson className="text-red-600 text-5xl" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Authentication Required</h2>
                    <p className="text-gray-600 mb-8 px-6">Please sign in to access your profile and manage your account information</p>
                    <button 
                        onClick={() => navigate('/login')}
                        className="bg-gradient-to-r from-red-600 to-red-500 text-white px-10 py-3 rounded-full hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 font-medium"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    const renderProfileContent = () => (
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
            {/* Profile Edit Form */}
            {isEditing ? (
                <div className="animate__animated animate__fadeIn">
                    <div className="flex items-center mb-6 p-6 border-b">
                        <button 
                            onClick={() => setIsEditing(false)}
                            className="mr-4 p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors"
                        >
                            <MdArrowBack />
                        </button>
                        <h2 className="text-2xl font-bold">Edit Profile</h2>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="mb-8 flex justify-center">
                            <div className="relative w-40 h-40">
                                <div className="w-full h-full rounded-full overflow-hidden border-4 border-gray-200">
                                    {userData.profilePic ? (
                                        <img 
                                            src={userData.profilePic} 
                                            alt={userData.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                                            <FaRegUserCircle className="w-1/2 h-1/2 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <label className="absolute bottom-0 right-0 bg-gradient-to-r from-red-600 to-red-500 text-white p-3 rounded-full cursor-pointer hover:shadow-lg transform hover:scale-105 transition-all">
                                    <MdAddAPhoto className="text-xl" />
                                    <input 
                                        type="file" 
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                </label>
                            </div>
                        </div>
                        
                        <div className="space-y-6">
                            <div className="group">
                                <label className="block text-gray-700 mb-2 font-medium">Full Name</label>
                                <div className="relative">
                                    <MdPerson className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                                    <input
                                        type="text"
                                        name="name"
                                        value={userData.name}
                                        onChange={handleChange}
                                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                                        required
                                        placeholder="Your full name"
                                    />
                                </div>
                            </div>
                            
                            <div className="group">
                                <label className="block text-gray-700 mb-2 font-medium">Email Address</label>
                                <div className="relative">
                                    <MdEmail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                                    <input
                                        type="email"
                                        name="email"
                                        value={userData.email}
                                        onChange={handleChange}
                                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300"
                                        required
                                        placeholder="Your email address"
                                    />
                                </div>
                            </div>
                            
                            <div className="group">
                                <label className="block text-gray-700 mb-2 font-medium">Shipping Address</label>
                                <div className="relative">
                                    <MdLocationOn className="absolute left-3 top-4 text-gray-400 text-xl" />
                                    <textarea
                                        name="address"
                                        value={userData.address || ''}
                                        onChange={handleChange}
                                        className="w-full p-3 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-300 h-28"
                                        placeholder="Enter your shipping address"
                                    />
                                </div>
                            </div>
                            
                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-3 rounded-lg hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 flex items-center justify-center font-medium"
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <div className="flex items-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                                            Saving Changes...
                                        </div>
                                    ) : (
                                        <>
                                            <MdSave className="mr-2 text-xl" /> Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            ) : (
                <div className="animate__animated animate__fadeIn p-6">
                    <div className="flex flex-wrap md:flex-nowrap">
                        {/* Left Side: Profile Image */}
                        <div className="w-full md:w-1/3 flex flex-col items-center mb-8 md:mb-0 md:border-r md:pr-8">
                            <div className="relative mb-4">
                                <div className="w-40 h-40 rounded-full overflow-hidden border-4 border-gray-100 shadow-md">
                                    {userData.profilePic ? (
                                        <img 
                                            src={userData.profilePic} 
                                            alt={userData.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                            <FaRegUserCircle className="w-3/5 h-3/5 text-gray-400" />
                                        </div>
                                    )}
                                </div>
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="absolute bottom-0 right-0 bg-red-600 text-white p-2 rounded-full shadow-md hover:bg-red-700 transition-colors"
                                >
                                    <FaCamera />
                                </button>
                            </div>
                            <h2 className="text-2xl font-bold text-center">{userData.name}</h2>
                            <span className="inline-block px-4 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium mt-2 mb-4">
                                {user.role || 'Customer'}
                            </span>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="w-full md:w-auto px-6 py-2 border-2 border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center justify-center font-medium mt-2"
                            >
                                <FaEdit className="mr-2" /> Edit Profile
                            </button>
                        </div>
                        
                        {/* Right Side: Profile Info */}
                        <div className="w-full md:w-2/3 md:pl-8">
                            <h3 className="text-xl font-bold mb-6 text-gray-800">Account Information</h3>
                            
                            <div className="space-y-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex">
                                        <div className="mr-4">
                                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                                <MdPerson className="text-red-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm">Full Name</p>
                                            <p className="font-semibold text-lg">{userData.name}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex">
                                        <div className="mr-4">
                                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                                <MdEmail className="text-red-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm">Email Address</p>
                                            <p className="font-semibold text-lg">{userData.email}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <div className="flex">
                                        <div className="mr-4">
                                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                                <MdLocationOn className="text-red-600" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-gray-500 text-sm">Shipping Address</p>
                                            <p className="font-semibold">
                                                {userData.address || 'No address added yet'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const renderOrdersContent = () => (
        <div className="bg-white rounded-xl shadow-xl p-6">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Order History</h3>
            
            {fetchingOrders ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your orders...</p>
                </div>
            ) : orderHistory && orderHistory.length > 0 ? (
                <div className="space-y-6">
                    {orderHistory.map((order) => (
                        <div key={order._id} className="border rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-shadow">
                            <div className="bg-gray-100 p-4 border-b">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Order ID</span>
                                        <h4 className="font-semibold">{order._id.substring(0, 8)}...</h4>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-medium text-gray-500">Date</span>
                                        <p className="font-semibold">{formatDate(order.createdAt)}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 flex flex-wrap md:flex-nowrap">
                                {/* Product Details */}
                                <div className="w-full md:w-3/4">
                                    <h4 className="font-bold text-lg mb-2">{order.productID?.productName || 'Product Name Unavailable'}</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Size</p>
                                            <p className="font-medium">{order.Size}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Quantity</p>
                                            <p className="font-medium">{order.Quantity}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Total Amount</p>
                                            <p className="font-medium">${order.TotalAmount.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Shipping Address</p>
                                            <p className="font-medium">{order.Address}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-3 border-t">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm text-gray-500">Order Status</p>
                                                <p className={`font-semibold ${
                                                    order.Status === 'Delivered' 
                                                        ? 'text-green-600' 
                                                        : order.Status === 'Pending'
                                                            ? 'text-yellow-600'
                                                            : order.Status === 'Cancelled'
                                                                ? 'text-red-600'
                                                                : 'text-blue-600'
                                                }`}>
                                                    {order.Status}
                                                </p>
                                            </div>
                                            
                                            <button
                                                onClick={() => viewOrderDetails(order._id)}
                                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <FaShoppingBag className="text-gray-400 text-3xl" />
                    </div>
                    <h4 className="text-xl font-medium mb-2">No Orders Yet</h4>
                    <p className="text-gray-500 mb-6">You haven't placed any orders yet.</p>
                    <button 
                        onClick={() => navigate('/')}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Start Shopping
                    </button>
                </div>
            )}
        </div>
    );

    const renderReservationsContent = () => (
        <div className="bg-white rounded-xl shadow-xl p-6">
            <h3 className="text-xl font-bold mb-6 text-gray-800">Reservation History</h3>
            
            {fetchingReservations ? (
                <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-500 border-t-transparent mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading your reservations...</p>
                </div>
            ) : reservationHistory && reservationHistory.length > 0 ? (
                <div className="space-y-6">
                    {reservationHistory.map((reservation) => (
                        <div key={reservation._id} className="border rounded-lg overflow-hidden bg-gray-50 hover:shadow-md transition-shadow">
                            <div className="bg-gray-100 p-4 border-b">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <span className="text-sm font-medium text-gray-500">Reservation ID</span>
                                        <h4 className="font-semibold">{reservation.ReservationID}</h4>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-sm font-medium text-gray-500">Date</span>
                                        <p className="font-semibold">{formatDate(reservation.ReservationDate)}</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-4 flex flex-wrap md:flex-nowrap">
                                {/* Product Image */}
                                <div className="w-full md:w-1/4 mb-4 md:mb-0">
                                    {reservation.productID?.productImage && reservation.productID.productImage.length > 0 ? (
                                        <img 
                                            src={reservation.productID.productImage[0]} 
                                            alt={reservation.productID.productName}
                                            className="w-full h-32 object-cover rounded-lg"
                                        />
                                    ) : (
                                        <div className="w-full h-32 bg-gray-200 rounded-lg flex items-center justify-center">
                                            <p className="text-gray-400">No Image</p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Product Details */}
                                <div className="w-full md:w-3/4 md:pl-6">
                                    <h4 className="font-bold text-lg mb-2">{reservation.productID?.productName || 'Product Name Unavailable'}</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Brand</p>
                                            <p className="font-medium">{reservation.productID?.brandName || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Category</p>
                                            <p className="font-medium">{reservation.productID?.category || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Size</p>
                                            <p className="font-medium">{reservation.size}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Quantity</p>
                                            <p className="font-medium">{reservation.Quantity}</p>
                                        </div>
                                    </div>
                                    
                                    <div className="mt-4 pt-3 border-t">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm text-gray-500">Reservation Status</p>
                                                <p className={`font-semibold ${
                                                    reservation.ValidateReservation === 'Confirmed' 
                                                        ? 'text-green-600' 
                                                        : reservation.ValidateReservation === 'Rejected'
                                                            ? 'text-red-600'
                                                            : 'text-yellow-600'
                                                }`}>
                                                    {reservation.ValidateReservation || 'Pending'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                        <FaCalendarAlt className="text-gray-400 text-3xl" />
                    </div>
                    <h4 className="text-xl font-medium mb-2">No Reservations Yet</h4>
                    <p className="text-gray-500 mb-6">You haven't made any product reservations yet.</p>
                    <button 
                        onClick={() => navigate('/')}
                        className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Explore Products
                    </button>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 pt-20 pb-12">
            <div className="container mx-auto px-4">
                {/* Page Header */}
                <div className="max-w-5xl mx-auto mb-8">
                    <div className="animate__animated animate__fadeInDown">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">My Profile</h1>
                        <p className="text-gray-600">Manage your personal information and track your orders & reservations</p>
                    </div>
                </div>
                
                {/* Profile Tabs */}
                <div className="max-w-5xl mx-auto mb-6">
                    <div className="flex border-b overflow-x-auto">
                        <button
                            className={`py-3 px-6 font-medium transition-colors whitespace-nowrap ${
                                activeTab === 'profile' 
                                    ? 'text-red-600 border-b-2 border-red-600' 
                                    : 'text-gray-600 hover:text-red-500'
                            }`}
                            onClick={() => setActiveTab('profile')}
                        >
                            Profile
                        </button>
                        <button
                            className={`py-3 px-6 font-medium transition-colors whitespace-nowrap ${
                                activeTab === 'orders' 
                                ? 'text-red-600 border-b-2 border-red-600' 
                                : 'text-gray-600 hover:text-red-500'
                        }`}
                        onClick={() => setActiveTab('orders')}
                    >
                        <FaShoppingBag className="inline-block mr-2" /> My Orders
                    </button>
                    <button
                        className={`py-3 px-6 font-medium transition-colors whitespace-nowrap ${
                            activeTab === 'reservations' 
                                ? 'text-red-600 border-b-2 border-red-600' 
                                : 'text-gray-600 hover:text-red-500'
                        }`}
                        onClick={() => setActiveTab('reservations')}
                    >
                        <FaCalendarAlt className="inline-block mr-2" /> My Reservations
                    </button>
                </div>
            </div>
            
            {/* Tab Content */}
            <div className="max-w-5xl mx-auto">
                {activeTab === 'profile' && renderProfileContent()}
                {activeTab === 'orders' && renderOrdersContent()}
                {activeTab === 'reservations' && renderReservationsContent()}
            </div>
        </div>
    </div>
);
};

export default Profile;