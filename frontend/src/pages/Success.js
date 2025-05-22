import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { MdCheckCircle, MdShoppingCart, MdAssignmentReturn } from 'react-icons/md';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';

const Success = () => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.user.user);
    const token = useSelector((state) => state.user.token);

    useEffect(() => {
        // If not logged in, redirect to login
        if (!user || !token) {
            toast.error('Please login to view this page');
            navigate('/login');
        }
        
        // Show success toast
        toast.success('Payment completed successfully!');
    }, [user, token, navigate]);

    return (
        <div className="container mx-auto p-4 flex justify-center items-center min-h-[calc(100vh-200px)]">
            <div className="bg-white max-w-md w-full p-8 rounded-lg shadow-lg text-center">
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
                    <MdCheckCircle className="text-green-600 text-5xl" />
                </div>
                
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Payment Successful!</h1>
                <p className="text-gray-600 mb-8">Your order has been placed successfully and will be processed shortly.</p>
                
                <div className="w-full h-0.5 bg-gray-200 my-6"></div>
                
                <div className="flex justify-center gap-4">
                    <Link to="/order" className="flex-1">
                        <button className="w-full py-3 px-4 bg-green-600 hover:bg-green-700 text-white rounded-md font-semibold transition-all flex items-center justify-center gap-2">
                            <MdAssignmentReturn className="text-xl" />
                            View Orders
                        </button>
                    </Link>
                    
                    <Link to="/" className="flex-1">
                        <button className="w-full py-3 px-4 border border-green-600 text-green-600 hover:bg-green-50 rounded-md font-semibold transition-all flex items-center justify-center gap-2">
                            <MdShoppingCart className="text-xl" />
                            Continue Shopping
                        </button>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Success;