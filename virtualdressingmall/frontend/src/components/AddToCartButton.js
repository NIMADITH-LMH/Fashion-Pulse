import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import Context from '../context';

const AddToCartButton = ({ productId }) => {
    const [loading, setLoading] = useState(false);
    const { fetchUserAddToCart } = useContext(Context);

    const handleAddToCart = async () => {
        try {
            setLoading(true);
            const response = await axios.post('http://localhost:8080/api/add-to-cart', {
                productId: productId
            }, {
                withCredentials: true
            });

            if (response.data.success) {
                toast.success(response.data.message);
                // Update cart count after successful addition
                fetchUserAddToCart();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.error('Add to cart error:', error);
            toast.error(error.response?.data?.message || 'Failed to add to cart');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={loading}
            className={`bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
            {loading ? 'Adding...' : 'Add to Cart'}
        </button>
    );
};

export default AddToCartButton; 