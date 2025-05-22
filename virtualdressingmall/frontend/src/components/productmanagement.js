import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ProductManagement = () => {
  // State variables
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingInventory, setIsAddingInventory] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [filters, setFilters] = useState({
    category: '',
    sellerName: '',
    gender: '',
    search: '',
  });
  
  // Form states
  const [formData, setFormData] = useState({
    productName: '',
    brandName: '',
    category: '',
    subCategory: '',
    description: '',
    DiscoutPercentage: 0,
    Gender: '',
    color: '',
    Pattern: '',
    FitType: '',
    seasonalCollection: '',
  });
  
  // Inventory update state
  const [inventoryData, setInventoryData] = useState({
    size: '',
    quantity: 0,
  });

  // Available categories, genders, etc. for filters
  const categories = ['Tops & Upper Wear', 'Bottoms & Lower Wearants', 'Ethnics & Traditional Wear', 'Innerwear & Sleepwear', ' Sports & Activewear','Winter & Seasonal Wear', 'Formal & Business Wear', 'Party & Occasion Wear', 'Accessories'];
  const genders = ['Male', 'Female'];
  const statuses = ['pending', 'approved', 'rejected'];
  
  // API base URL - replace with your actual API URL
  const API_BASE_URL = 'http://localhost:8080/api';

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, []);

  // Apply filters when filters state changes
  useEffect(() => {
    if (products.length > 0) {
      applyFilters();
    }
  }, [filters, products]);

  // Fetch all products from the API
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/getallproduct`, { params: filters });
      setProducts(response.data.data);
      setFilteredProducts(response.data.data);
    } catch (err) {
      setError('Failed to fetch products. Please try again.');
      console.error('Error fetching products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Apply filters to products
  const applyFilters = () => {
    let filtered = [...products];
    
    // Apply local filters (if needed beyond what the API provides)
    if (filters.search) {
      filtered = filtered.filter(product => 
        product.productName.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    setFilteredProducts(filtered);
  };

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value,
    });
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      sellerName: '',
      gender: '',
      search: '',
    });
  };

  // Handle form input changes for product editing
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle inventory form changes
  const handleInventoryChange = (e) => {
    const { name, value } = e.target;
    setInventoryData({
      ...inventoryData,
      [name]: name === 'quantity' ? parseInt(value) : value,
    });
  };

  // Get product details
  const getProductDetails = async (id) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/get-product-details/${id}`);
      setSelectedProduct(response.data.data);
      setFormData(response.data.data);
    } catch (err) {
      setError('Failed to fetch product details. Please try again.');
      console.error('Error fetching product details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Approve or reject product
  const updateProductStatus = async (id, status) => {
    try {
      const endpoint = status === 'approved' 
        ? `${API_BASE_URL}/give-permission/${id}/approve`
        : `${API_BASE_URL}/give-permission/${id}/approve`;
        
      await axios.patch(endpoint, { status });
      
      // Update the product in the list
      const updatedProducts = products.map(product => 
        product._id === id ? { ...product, status } : product
      );
      
      setProducts(updatedProducts);
      
      if (selectedProduct && selectedProduct._id === id) {
        setSelectedProduct({ ...selectedProduct, status });
      }
      
      showToast(`Product ${status} successfully`);
    } catch (err) {
      setError(`Failed to ${status} product. Please try again.`);
      console.error(`Error ${status} product:`, err);
    }
  };

  // Edit product
  const editProduct = async (id) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/edit-product-details/${id}`, formData);
      
      // Update the product in the list
      const updatedProducts = products.map(product => 
        product._id === id ? response.data.data : product
      );
      
      setProducts(updatedProducts);
      setSelectedProduct(response.data.data);
      setIsEditing(false);
      
      showToast('Product updated successfully');
    } catch (err) {
      setError('Failed to update product. Please try again.');
      console.error('Error updating product:', err);
    }
  };

  // Delete product
  const deleteProduct = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    
    try {
      await axios.delete(`${API_BASE_URL}/delete-product-details/${id}`);
      
      // Remove the product from the list
      const updatedProducts = products.filter(product => product._id !== id);
      setProducts(updatedProducts);
      
      if (selectedProduct && selectedProduct._id === id) {
        setSelectedProduct(null);
      }
      
      showToast('Product deleted successfully');
    } catch (err) {
      setError('Failed to delete product. Please try again.');
      console.error('Error deleting product:', err);
    }
  };

  // Update inventory
  const updateInventory = async (productId) => {
    try {
      const response = await axios.patch(
        `${API_BASE_URL}/update-inventory/${productId}/inventory`, 
        inventoryData
      );
      
      // Update the product in the list
      const updatedProducts = products.map(product => 
        product._id === productId ? response.data.data : product
      );
      
      setProducts(updatedProducts);
      setSelectedProduct(response.data.data);
      setIsAddingInventory(false);
      
      showToast('Inventory updated successfully');
    } catch (err) {
      setError('Failed to update inventory. Please try again.');
      console.error('Error updating inventory:', err);
    }
  };

  // Simple toast notification
  const showToast = (message) => {
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded shadow-lg';
    toast.innerText = message;
    document.body.appendChild(toast);
    
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Product Management Dashboard</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 relative">
            <span className="block sm:inline">{error}</span>
            <button 
              className="absolute top-0 right-0 px-4 py-3"
              onClick={() => setError(null)}
            >
              <span className="text-red-500">&times;</span>
            </button>
          </div>
        )}

        {/* Filter Section */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6">
            <h2 className="text-lg font-medium text-gray-900">Filter Products</h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div className="sm:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Search
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={filters.search}
                    onChange={handleFilterChange}
                    placeholder="Search by product name"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-1">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <div className="mt-1">
                  <select
                    id="category"
                    name="category"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={filters.category}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-1">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                  Gender
                </label>
                <div className="mt-1">
                  <select
                    id="gender"
                    name="gender"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={filters.gender}
                    onChange={handleFilterChange}
                  >
                    <option value="">All Genders</option>
                    {genders.map((gender) => (
                      <option key={gender} value={gender}>
                        {gender}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="sm:col-span-1">
                <label htmlFor="sellerName" className="block text-sm font-medium text-gray-700">
                  Seller
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    name="sellerName"
                    id="sellerName"
                    className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    value={filters.sellerName}
                    onChange={handleFilterChange}
                    placeholder="Search by seller"
                  />
                </div>
              </div>
              
              <div className="sm:col-span-1 flex items-end">
                <button
                  type="button"
                  onClick={fetchProducts}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Apply Filters
                </button>
              </div>
              
              <div className="sm:col-span-1 flex items-end">
                <button
                  type="button"
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Product List */}
          <div className="w-full md:w-1/2">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Products</h2>
                <span className="text-sm text-gray-500">
                  {filteredProducts.length} products
                </span>
              </div>
              
              {isLoading ? (
                <div className="text-center py-12">
                  <svg className="animate-spin h-8 w-8 mx-auto text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <p className="mt-2 text-gray-500">Loading products...</p>
                </div>
              ) : filteredProducts.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No products found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Product
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Category
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Gender
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredProducts.map((product) => (
                        <tr 
                          key={product._id} 
                          className={`${selectedProduct && selectedProduct._id === product._id ? 'bg-indigo-50' : 'hover:bg-gray-50'} cursor-pointer`}
                          onClick={() => getProductDetails(product._id)}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              {product.productImage && product.productImage.length > 0 ? (
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img className="h-10 w-10 rounded-full object-cover" src={product.productImage[0]} alt={product.productName} />
                                </div>
                              ) : (
                                <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full"></div>
                              )}
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">{product.productName}</div>
                                <div className="text-sm text-gray-500">{product.brandName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{product.category}</div>
                            <div className="text-sm text-gray-500">{product.subCategory}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.Gender}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${product.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                product.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'}`}
                            >
                              {product.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteProduct(product._id);
                              }}
                              className="text-red-600 hover:text-red-900"
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="w-full md:w-1/2">
            {selectedProduct ? (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                  <h2 className="text-lg font-medium text-gray-900">
                    {isEditing ? 'Edit Product' : 'Product Details'}
                  </h2>
                  <div>
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                </div>
                
                {isEditing ? (
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="productName" className="block text-sm font-medium text-gray-700">
                          Product Name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="productName"
                            id="productName"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={formData.productName}
                            onChange={handleFormChange}
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="brandName" className="block text-sm font-medium text-gray-700">
                          Brand Name
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="brandName"
                            id="brandName"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={formData.brandName}
                            onChange={handleFormChange}
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                          Category
                        </label>
                        <div className="mt-1">
                          <select
                            id="category"
                            name="category"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={formData.category}
                            onChange={handleFormChange}
                          >
                            <option value="">Select Category</option>
                            {categories.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="subCategory" className="block text-sm font-medium text-gray-700">
                          Sub Category
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="subCategory"
                            id="subCategory"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={formData.subCategory}
                            onChange={handleFormChange}
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="Gender" className="block text-sm font-medium text-gray-700">
                          Gender
                        </label>
                        <div className="mt-1">
                          <select
                            id="Gender"
                            name="Gender"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={formData.Gender}
                            onChange={handleFormChange}
                          >
                            <option value="">Select Gender</option>
                            {genders.map((gender) => (
                              <option key={gender} value={gender}>
                                {gender}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="DiscoutPercentage" className="block text-sm font-medium text-gray-700">
                          Discount Percentage
                        </label>
                        <div className="mt-1">
                          <input
                            type="number"
                            name="DiscoutPercentage"
                            id="DiscoutPercentage"
                            min="0"
                            max="100"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={formData.DiscoutPercentage}
                            onChange={handleFormChange}
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="color" className="block text-sm font-medium text-gray-700">
                          Color
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="color"
                            id="color"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={formData.color}
                            onChange={handleFormChange}
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="Pattern" className="block text-sm font-medium text-gray-700">
                          Pattern
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="Pattern"
                            id="Pattern"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={formData.Pattern}
                            onChange={handleFormChange}
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="FitType" className="block text-sm font-medium text-gray-700">
                          Fit Type
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="FitType"
                            id="FitType"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={formData.FitType}
                            onChange={handleFormChange}
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="seasonalCollection" className="block text-sm font-medium text-gray-700">
                          Seasonal Collection
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="seasonalCollection"
                            id="seasonalCollection"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={formData.seasonalCollection}
                            onChange={handleFormChange}
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-6">
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <div className="mt-1">
                          <textarea
                            id="description"
                            name="description"
                            rows={3}
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={formData.description}
                            onChange={handleFormChange}
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => editProduct(selectedProduct._id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Save Changes
                        </button>
                      </div>
                    </div>
                  </div>
                ) : isAddingInventory ? (
                  <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                      <div className="sm:col-span-3">
                        <label htmlFor="size" className="block text-sm font-medium text-gray-700">
                          Size
                        </label>
                        <div className="mt-1">
                          <input
                            type="text"
                            name="size"
                            id="size"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={inventoryData.size}
                            onChange={handleInventoryChange}
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-3">
                        <label htmlFor="quantity" className="block text-sm font-medium text-gray-700">
                          Quantity
                        </label>
                        <div className="mt-1">
                        <input
                            type="number"
                            name="quantity"
                            id="quantity"
                            min="0"
                            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            value={inventoryData.quantity}
                            onChange={handleInventoryChange}
                          />
                        </div>
                      </div>
                      
                      <div className="sm:col-span-6 flex justify-end space-x-3">
                        <button
                          type="button"
                          onClick={() => setIsAddingInventory(false)}
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => updateInventory(selectedProduct._id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Update Inventory
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div>
                    {/* Product Details View */}
                    <div className="border-t border-gray-200">
                      <dl>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Product Name</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedProduct.productName}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Brand Name</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedProduct.brandName}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Category</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedProduct.category}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Sub Category</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedProduct.subCategory}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Gender</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedProduct.Gender}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Color</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedProduct.color}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Pattern</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedProduct.Pattern}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Fit Type</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedProduct.FitType}</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Seasonal Collection</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedProduct.seasonalCollection}</dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Discount Percentage</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedProduct.DiscoutPercentage}%</dd>
                        </div>
                        <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                          <dd className="mt-1 text-sm sm:mt-0 sm:col-span-2">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                              ${selectedProduct.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                selectedProduct.status === 'rejected' ? 'bg-red-100 text-red-800' : 
                                'bg-yellow-100 text-yellow-800'}`}
                            >
                              {selectedProduct.status}
                            </span>
                          </dd>
                        </div>
                        <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                          <dt className="text-sm font-medium text-gray-500">Description</dt>
                          <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{selectedProduct.description}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    {/* Product Images */}
                    {selectedProduct.productImage && selectedProduct.productImage.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                        <h3 className="text-lg font-medium text-gray-900">Product Images</h3>
                        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
                          {selectedProduct.productImage.map((image, index) => (
                            <div key={index} className="relative rounded-lg overflow-hidden group">
                              <img src={image} alt={`Product ${index + 1}`} className="h-32 w-full object-cover" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Inventory Section */}
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-medium text-gray-900">Inventory</h3>
                        <button
                          type="button"
                          onClick={() => setIsAddingInventory(true)}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Add Inventory
                        </button>
                      </div>
                      
                      {selectedProduct.Inventory && selectedProduct.Inventory.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Size
                              </th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Quantity
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedProduct.Inventory.map((item, index) => (
                              <tr key={index}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.size}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <p className="text-sm text-gray-500">No inventory information available.</p>
                      )}
                    </div>
                    
                    {/* Actions Section */}
                    {selectedProduct.status === 'pending' && (
                      <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                        <h3 className="text-lg font-medium text-gray-900 mb-4">Actions</h3>
                        <div className="flex space-x-3">
                          <button
                            type="button"
                            onClick={() => updateProductStatus(selectedProduct._id, 'approved')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={() => updateProductStatus(selectedProduct._id, 'rejected')}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
                <p className="text-gray-500">Select a product to view details</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default ProductManagement;