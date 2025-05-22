import React from 'react';
import AddToCartButton from './AddToCartButton';
import displayLKRCurrency from '../helpers/displayCurrency';

const Product = ({ product }) => {
    return (
        <div className="product-card p-4 border rounded-lg shadow-md">
            <h2 className="text-xl font-bold mb-2">{product.name}</h2>
            <p className="text-gray-600 mb-4">{displayLKRCurrency(product.price)}</p>
            <AddToCartButton productId={product.id} />
        </div>
    );
};

export default Product; 