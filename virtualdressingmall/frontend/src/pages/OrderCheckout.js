import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { selectUser, selectToken } from '../store/userSlice';
import SummaryApi from '../common';
import displayINRCurrency from '../helpers/displayCurrency';
import { 
  MdDelete, MdLocationOn, MdEdit, MdPerson, MdClose, 
  MdShoppingCart, MdPayment, MdSecurity, MdCheckCircle, MdLocalShipping
} from 'react-icons/md';

// Separate component for the address modal to prevent re-renders
const AddressModalComponent = ({ 
    show, 
    onClose, 
    address, 
    onSave, 
    token 
}) => {
    const [localAddress, setLocalAddress] = useState(address);
    const textareaRef = useRef(null);
    
    // Focus once when component mounts
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.focus();
        }
    }, []);
    
    const handleSave = async () => {
        try {
            await axios.post(SummaryApi.updateUser.url, { address: localAddress }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            onSave(localAddress);
            toast.success('Address updated successfully');
        } catch (error) {
            console.error('Error updating address:', error);
            toast.error('Failed to update address');
        }
    };

    if (!show) return null;
    
    return (
        <div 
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
            onClick={onClose}
        >
            <div 
                className="bg-white rounded-lg p-6 w-full max-w-md relative shadow-2xl" 
                onClick={(e) => e.stopPropagation()}
            >
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <MdClose className="text-xl" />
                </button>
                <div className="text-center mb-6">
                    <MdLocationOn className="text-red-600 text-4xl mx-auto mb-2" />
                    <h2 className="text-2xl font-semibold">Shipping Address</h2>
                    <p className="text-gray-500 text-sm">Please enter your complete shipping address</p>
                </div>
                <textarea
                    ref={textareaRef}
                    value={localAddress}
                    onChange={(e) => setLocalAddress(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-3 h-32 resize-none mb-4 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all outline-none"
                    placeholder="Enter your complete shipping address..."
                />
                <div className="flex justify-end gap-2">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 border rounded-md hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center gap-1"
                    >
                        <MdCheckCircle /> Save Address
                    </button>
                </div>
            </div>
        </div>
    );
};

const OrderCheckout = () => {
    const [cartItems, setCartItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState({});
    const [loading, setLoading] = useState(false);
    const [address, setAddress] = useState('');
    const [showAddressModal, setShowAddressModal] = useState(false);
    const user = useSelector(selectUser);
    const token = useSelector(selectToken);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user?._id || !token) {
            navigate('/login');
            return;
        }
        fetchCartItems();
        setAddress(user.address || '');
    }, [user, token]);

    const fetchCartItems = async () => {
        setLoading(true);
        try {
            const response = await axios.get(SummaryApi.addToCartProductView.url);
            if (response.data.success) {
                const items = response.data.data;
                console.log('Cart items data:', items);
                
                // Automatically select all items on load
                const initialSelected = {};
                items.forEach(item => {
                    initialSelected[item._id] = true;
                });
                
                setCartItems(items);
                setSelectedItems(initialSelected);
            } else {
                toast.error(response.data.message || 'Failed to fetch cart items');
            }
        } catch (error) {
            console.error('Error fetching cart:', error);
            toast.error(error.response?.data?.message || 'Failed to fetch cart items');
        } finally {
            setLoading(false);
        }
    };

    const handleItemSelect = (itemId) => {
        setSelectedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const handleSaveAddress = (newAddress) => {
        setAddress(newAddress);
        setShowAddressModal(false);
    };

    const handleOpenModal = () => {
        setShowAddressModal(true);
    };

    const handleCloseModal = () => {
        setShowAddressModal(false);
    };

    const handleCheckout = async () => {
        if (!address.trim()) {
            toast.error('Please add a shipping address');
            return;
        }

        const selectedCartItems = cartItems.filter(item => selectedItems[item._id]);
        if (selectedCartItems.length === 0) {
            toast.error('Please select at least one item');
            return;
        }

        try {
            setLoading(true);
            
            const response = await axios.post(SummaryApi.payment.url, {
                cartItems: selectedCartItems,
                address: address
            }, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.data.id) {
                // Show loading toast
                toast.info('Redirecting to secure payment page...', {
                    autoClose: 2000
                });
                
                // Short delay for better UX
                setTimeout(() => {
                    // Redirect to Stripe checkout
                    window.location.href = response.data.url;
                }, 1000);
            } else {
                toast.error('Failed to initialize payment');
                setLoading(false);
            }
        } catch (error) {
            console.error('Payment error:', error);
            toast.error(error.response?.data?.message || 'Failed to process payment');
            setLoading(false);
        }
    };

    const calculateTotal = () => {
        return cartItems
            .filter(item => selectedItems[item._id])
            .reduce((total, item) => {
                const quantity = item?.quantity || 0;
                const price = item?.productId?.sellingPrice || 0;
                return total + (quantity * price);
            }, 0);
    };

    const calculateTotalItems = () => {
        return cartItems
            .filter(item => selectedItems[item._id])
            .reduce((total, item) => total + (item?.quantity || 0), 0);
    };

    if (!user?._id || !token) {
        return (
            <div className="container mx-auto p-4">
                <div className="text-center py-12 bg-white rounded-lg shadow-md">
                    <MdPerson className="text-red-600 text-5xl mx-auto mb-4" />
                    <p className="text-xl mb-4">Please login to continue checkout</p>
                    <button 
                        onClick={() => navigate('/login')}
                        className="bg-red-600 text-white px-8 py-3 rounded-md hover:bg-red-700 transition-colors shadow-md"
                    >
                        Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4 bg-gray-50 min-h-screen">
            {/* Checkout Progress */}
            <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
                <div className="flex items-center justify-center">
                    <div className="flex flex-col items-center mx-4">
                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white">
                            <MdShoppingCart />
                        </div>
                        <span className="text-sm mt-2 text-red-600 font-medium">Cart</span>
                    </div>
                    <div className="flex-1 h-1 bg-red-600"></div>
                    <div className="flex flex-col items-center mx-4">
                        <div className="w-10 h-10 rounded-full bg-red-600 flex items-center justify-center text-white">
                            <MdCheckCircle />
                        </div>
                        <span className="text-sm mt-2 text-red-600 font-medium">Checkout</span>
                    </div>
                    <div className="flex-1 h-1 bg-gray-300"></div>
                    <div className="flex flex-col items-center mx-4">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white">
                            <MdPayment />
                        </div>
                        <span className="text-sm mt-2 text-gray-500">Payment</span>
                    </div>
                    <div className="flex-1 h-1 bg-gray-300"></div>
                    <div className="flex flex-col items-center mx-4">
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white">
                            <MdLocalShipping />
                        </div>
                        <span className="text-sm mt-2 text-gray-500">Shipping</span>
                    </div>
                </div>
            </div>

            {/* User Information Section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6 flex items-center">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mr-4">
                    <MdPerson className="text-red-600 text-2xl" />
                </div>
                <div>
                    <h2 className="text-xl font-semibold">Welcome, {user?.name || 'Guest'}</h2>
                    <p className="text-gray-600">User ID: {user?._id || 'Not logged in'}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Cart Items Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-md mb-4">
                        <h2 className="text-xl font-semibold mb-4 flex items-center">
                            <MdShoppingCart className="mr-2 text-red-600" />
                            Select Items for Checkout
                        </h2>
                        
                        {loading ? (
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
                                ))}
                            </div>
                        ) : cartItems.length === 0 ? (
                            <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                                <MdShoppingCart className="text-gray-400 text-5xl mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">Your cart is empty</p>
                                <button 
                                    onClick={() => navigate('/')}
                                    className="mt-4 px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                                >
                                    Continue Shopping
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {cartItems.map((item) => (
                                    <div 
                                        key={item._id} 
                                        className={`bg-white p-4 rounded-lg border ${
                                            selectedItems[item._id] 
                                                ? 'border-red-600 shadow-md transform scale-[1.01] transition-all' 
                                                : 'border-gray-200 hover:border-gray-300 transition-all'
                                        }`}
                                    >
                                        <div className="flex gap-4">
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedItems[item._id] || false}
                                                    onChange={() => handleItemSelect(item._id)}
                                                    className="w-5 h-5 rounded text-red-600 border-gray-300 focus:ring-red-500"
                                                />
                                            </div>
                                            <div className="w-24 h-24 bg-gray-50 rounded-md overflow-hidden">
                                                <img
                                                    src={item.productId?.productImage?.[0]}
                                                    alt={item.productId?.productName}
                                                    className="w-full h-full object-contain p-2"
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-lg">{item.productId?.productName}</h3>
                                                <div className="flex flex-wrap gap-x-4 text-sm text-gray-600 mt-1">
                                                    <p>Size: <span className="font-medium">{item.size}</span></p>
                                                    <p>Category: <span className="font-medium capitalize">{item.productId?.category || 'Uncategorized'}</span></p>
                                                </div>
                                                <div className="flex justify-between items-end mt-3">
                                                    <div>
                                                        <p className="text-gray-700">
                                                            Quantity: <span className="font-medium">{item.quantity}</span>
                                                        </p>
                                                        <p className="text-red-600 font-medium text-lg mt-1">
                                                            {displayINRCurrency(item.productId?.sellingPrice || 0)}
                                                        </p>
                                                    </div>
                                                    <p className="text-lg font-semibold">
                                                        {displayINRCurrency((item.productId?.sellingPrice || 0) * (item.quantity || 1))}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Order Summary Section */}
                <div className="lg:col-span-1">
                    <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
                        <h2 className="text-xl font-semibold mb-6 pb-2 border-b border-gray-100">Order Summary</h2>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <p className="text-gray-600">Selected Items:</p>
                                <p className="font-medium">{calculateTotalItems()}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-gray-600">Subtotal:</p>
                                <p className="font-semibold">{displayINRCurrency(calculateTotal() || 0)}</p>
                            </div>
                            <div className="flex justify-between items-center">
                                <p className="text-gray-600">Shipping:</p>
                                <p className="font-medium text-green-600">FREE</p>
                            </div>
                            <div className="border-t border-gray-100 pt-4 mt-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-lg font-semibold">Total:</p>
                                    <p className="text-xl font-bold text-red-600">{displayINRCurrency(calculateTotal() || 0)}</p>
                                </div>
                            </div>

                            {/* Shipping Address Section */}
                            <div className="border-t border-gray-100 pt-4 mt-4">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center">
                                        <MdLocationOn className="text-red-600 text-xl mr-2" />
                                        <h3 className="font-medium">Shipping Address</h3>
                                    </div>
                                    <button 
                                        onClick={handleOpenModal}
                                        className="text-red-600 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                                    >
                                        <MdEdit className="text-xl" />
                                    </button>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-md border border-gray-200 mb-4 min-h-[60px]">
                                    {address ? (
                                        <p className="text-gray-700 whitespace-pre-line">{address}</p>
                                    ) : (
                                        <p className="text-gray-400 italic">No address added</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-6">
                                <button
                                    onClick={handleCheckout}
                                    disabled={calculateTotalItems() === 0 || !address || loading}
                                    className={`w-full py-3 rounded-md text-white font-medium flex items-center justify-center gap-2 ${
                                        calculateTotalItems() === 0 || !address || loading
                                            ? 'bg-gray-400 cursor-not-allowed'
                                            : 'bg-red-600 hover:bg-red-700 transform hover:translate-y-[-2px] transition-all'
                                    }`}
                                >
                                    {loading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <MdPayment className="text-xl" />
                                            Pay with Stripe
                                        </>
                                    )}
                                </button>
                                {!address && (
                                    <p className="text-red-500 text-sm mt-2 flex items-center justify-center gap-1">
                                        <MdLocationOn /> Please add a shipping address
                                    </p>
                                )}
                                {calculateTotalItems() === 0 && (
                                    <p className="text-red-500 text-sm mt-2 flex items-center justify-center gap-1">
                                        <MdShoppingCart /> Please select at least one item
                                    </p>
                                )}
                            </div>

                            {/* Trust Badges */}
                            <div className="border-t border-gray-100 pt-4 mt-4">
                                <div className="flex justify-center gap-4 text-gray-400">
                                    <div className="flex flex-col items-center">
                                        <MdSecurity className="text-2xl" />
                                        <span className="text-xs mt-1">Secure Payment</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <MdLocalShipping className="text-2xl" />
                                        <span className="text-xs mt-1">Fast Delivery</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <MdCheckCircle className="text-2xl" />
                                        <span className="text-xs mt-1">Quality Guarantee</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Address Modal - using the separate component */}
            <AddressModalComponent 
                show={showAddressModal}
                onClose={handleCloseModal}
                address={address}
                onSave={handleSaveAddress}
                token={token}
            />
        </div>
    );
};

export default OrderCheckout;