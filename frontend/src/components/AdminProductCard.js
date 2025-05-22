import React, { useState } from 'react'
import { MdModeEditOutline, MdDelete } from "react-icons/md";
import AdminEditProduct from './AdminEditProduct';
import displayUSDCurrency from '../helpers/displayCurrency';
import SummaryApi from '../common/index';

const AdminProductCard = ({
    data,
    fetchdata
}) => {
    const [editProduct, setEditProduct] = useState(false)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    const confirmDelete = () => {
        setShowDeleteConfirm(true);
    };

    const cancelDelete = () => {
        setShowDeleteConfirm(false);
    };

    const deleteProduct = async () => {
        try {
            const response = await fetch(SummaryApi.deleteProduct.url, {
                method: SummaryApi.deleteProduct.method,
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ _id: data._id })
            });

            const dataResponse = await response.json();
            console.log("Delete Response:", dataResponse);

            if (response.ok) {
                fetchdata(); // Refresh the product list
            } else {
                console.error('Failed to delete product:', dataResponse);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setShowDeleteConfirm(false);
        }
    };

    return (
        <div className='bg-white p-4 rounded relative flex flex-col items-center'>
            <div className='w-40 relative'>
                {/* Image */}
                <div className='w-32 h-32 flex justify-center items-center'>
                    <img src={data?.productImage[0]} className='mx-auto object-fill h-full' alt={data.productName} />
                </div>

                {/* Product Name */}
                <h1 className='text-ellipsis line-clamp-2 text-center'><b>ProductName: </b>{data.productName}</h1>
                <h1 className='text-ellipsis line-clamp-2 text-center'><b>category:</b>{data.category}</h1>
                {/* Price & Edit Button */}
                <div className='flex items-center justify-between w-full mt-2'>
                    <p className='font-semibold'>
                        {data.Size.price}
                    </p>

                    {/* Edit Button (Right Side) */}
                    <div 
                        className='p-2 bg-green-100 hover:bg-green-600 rounded-full hover:text-white cursor-pointer' 
                        onClick={() => setEditProduct(true)}
                    >
                        <MdModeEditOutline />
                    </div>
                </div>

                {/* Delete Button (Bottom Left) */}
                <div 
                    className='absolute bottom-0 left-0 p-2 bg-red-100 hover:bg-red-600 rounded-full hover:text-white cursor-pointer'
                    onClick={confirmDelete}
                >
                    <MdDelete />
                </div>
            </div>

            {/* Edit Product Modal */}
            {editProduct && (
                <AdminEditProduct productData={data} onClose={() => setEditProduct(false)} fetchdata={fetchdata} />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
                        <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
                        <p className="mb-6">Are you sure you want to delete "{data.productName}"?</p>
                        <div className="flex justify-end space-x-3">
                            <button 
                                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                                onClick={cancelDelete}
                            >
                                Cancel
                            </button>
                            <button 
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                                onClick={deleteProduct}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminProductCard