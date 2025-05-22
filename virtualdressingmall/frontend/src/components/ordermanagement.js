import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const backendDomain = "http://localhost:8080/api";
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [reportFormat, setReportFormat] = useState('pdf');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const url = `${backendDomain}/get-all-orders${statusFilter ? `?status=${statusFilter}` : ''}`;
      const response = await axios.get(url);
      setOrders(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch orders. Please try again later.');
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrderDetails = async (orderId) => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendDomain}/get-order-details/${orderId}`);
      setSelectedOrder(response.data.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch order details. Please try again later.');
      console.error('Error fetching order details:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    const { startDate, endDate } = dateRange;
    if (!startDate || !endDate) {
      setError('Please select both start and end dates for the report');
      return;
    }
    
    const queryParams = new URLSearchParams({
      format: reportFormat,
      startDate: startDate,
      endDate: endDate
    });
    
    if (statusFilter) {
      queryParams.append('status', statusFilter);
    }
    
    // Open report in new window/tab to trigger download
    window.open(`${backendDomain}/generate-order-report?${queryParams.toString()}`);
  };

  const handleDateChange = (e) => {
    setDateRange({
      ...dateRange,
      [e.target.name]: e.target.value
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusOptions = ['', 'pending', 'Confirmed', ];

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">Order Management Dashboard</h1>
        
        {error && (
          <div className="mb-6 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
            <p>{error}</p>
          </div>
        )}
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6">
            <h2 className="text-xl font-semibold mb-4 md:mb-0">Order List</h2>
            
            <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
              <div className="w-full md:w-48">
                <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {statusOptions.map(status => (
                    <option key={status} value={status}>
                      {status || 'All Orders'}
                    </option>
                  ))}
                </select>
              </div>
              
              <button
                onClick={fetchOrders}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
              >
                Refresh Orders
              </button>
            </div>
          </div>
          
          {loading && !selectedOrder ? (
            <div className="text-center py-10">
              <div className="spinner-border text-blue-500" role="status">
                <span className="sr-only">Loading...</span>
              </div>
              <p className="mt-2">Loading orders...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 text-center text-gray-500">No orders found.</td>
                    </tr>
                  ) : (
                    orders.map((order) => (
                      <tr key={order._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order._id.substring(0, 8)}...</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.productID ? order.productID.productName : 'Unknown Product'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {order.userID ? order.userID.name : 'Unknown User'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                            ${order.Status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                              order.Status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                              order.Status === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                              'bg-blue-100 text-blue-800'}`}>
                            {order.Status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          LKR {order.TotalAmount ? order.TotalAmount.toFixed(2) : '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => fetchOrderDetails(order._id)}
                            className="text-indigo-600 hover:text-indigo-900"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Order Details Section */}
        {selectedOrder && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Order Details</h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                <span className="text-2xl">&times;</span>
              </button>
            </div>
            
            {loading ? (
              <div className="text-center py-10">
                <div className="spinner-border text-blue-500" role="status">
                  <span className="sr-only">Loading...</span>
                </div>
                <p className="mt-2">Loading order details...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium mb-4">Product Information</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="mb-2"><strong>Product Name:</strong> {
                      selectedOrder.productID ? selectedOrder.productID.productName : 'Unknown'
                    }</p>
                    <p className="mb-2"><strong>Price:</strong> LKR {
                      selectedOrder.productID && selectedOrder.productID.price 
                        ? selectedOrder.productID.price.toFixed(2) 
                        : '0.00'
                    }</p>
                    <p className="mb-2"><strong>Quantity:</strong> {selectedOrder.Quantity}</p>
                    <p className="mb-2"><strong>Size:</strong> {selectedOrder.Size || 'N/A'}</p>
                    <p><strong>Total Amount:</strong> LKR {selectedOrder.TotalAmount.toFixed(2)}</p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-4">Customer Information</h3>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="mb-2"><strong>Name:</strong> {
                      selectedOrder.userID ? selectedOrder.userID.name : 'Unknown'
                    }</p>
                    <p className="mb-2"><strong>Email:</strong> {
                      selectedOrder.userID ? selectedOrder.userID.email : 'N/A'
                    }</p>
                    <p className="mb-2"><strong>Address:</strong> {selectedOrder.Address || 'N/A'}</p>
                    <p className="mb-2"><strong>Status:</strong> {selectedOrder.Status}</p>
                    <p><strong>Order Date:</strong> {formatDate(selectedOrder.createdAt)}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        {/* Generate Report Section */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-6">Generate Order Report</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={dateRange.startDate}
                onChange={handleDateChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                name="endDate"
                value={dateRange.endDate}
                onChange={handleDateChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status (Optional)</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                {statusOptions.map(status => (
                  <option key={status} value={status}>
                    {status || 'All Orders'}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Report Format</label>
              <select
                value={reportFormat}
                onChange={(e) => setReportFormat(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="pdf">PDF</option>
                <option value="excel">Excel</option>
              </select>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={downloadReport}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-md"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;