import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ChevronDown, ChevronUp, Search, Download, Filter, X, Check, 
  Calendar, RefreshCw, FileText, User, Package, AlertTriangle 
} from 'lucide-react';

// Backend API endpoint
const backendDomain = "http://localhost:8080/api";

const ReservationAdminDashboard = () => {
  // State variables
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'ReservationDate', direction: 'desc' });
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [stats, setStats] = useState({
    total: 0,
    validated: 0,
    rejected: 0,
    Confirmed: 0
  });

  // Filter states
  const [filters, setFilters] = useState({
    productID: '',
    userID: '',
    status: '',
    startDate: '',
    endDate: ''
  });

  // Products and users for filter dropdowns
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);

  // Initial data fetch
  useEffect(() => {
    fetchReservations();
    fetchProducts();
    fetchUsers();
  }, []);

  // Fetch reservations based on current filters
  const fetchReservations = async () => {
    setLoading(true);
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.productID) queryParams.append('productID', filters.productID);
      if (filters.userID) queryParams.append('userID', filters.userID);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const response = await axios.get(`${backendDomain}/get-reservations-admin?${queryParams}`);
      
      if (response.data.success) {
        setReservations(response.data.data);
        calculateStats(response.data.data);
      } else {
        setError('Failed to fetch reservations');
      }
    } catch (err) {
      setError('Error connecting to server');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch products for filter dropdown
  const fetchProducts = async () => {
    try {
      // This endpoint would need to be created in your backend
      const response = await axios.get(`${backendDomain}/products`);
      if (response.data.success) {
        setProducts(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  // Fetch users for filter dropdown
  const fetchUsers = async () => {
    try {
      // This endpoint would need to be created in your backend
      const response = await axios.get(`${backendDomain}/users`);
      if (response.data.success) {
        setUsers(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  // Calculate statistics
  const calculateStats = (data) => {
    const stats = {
      total: data.length,
      validated: data.filter(r => r.ValidateReservation === 'Not visited').length,
      rejected: data.filter(r => r.ValidateReservation === 'Rejected').length,
      
      Confirmed: data.filter(r => r.ValidateReservation === 'Confirmed').length
    };
    setStats(stats);
  };

  // Sorting function
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
    
    const sortedData = [...reservations].sort((a, b) => {
      if (a[key] < b[key]) return direction === 'asc' ? -1 : 1;
      if (a[key] > b[key]) return direction === 'asc' ? 1 : -1;
      return 0;
    });
    
    setReservations(sortedData);
  };

  // Export functions
  const exportData = async (format) => {
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.productID) queryParams.append('productID', filters.productID);
      if (filters.userID) queryParams.append('userID', filters.userID);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);
      queryParams.append('format', format);

      // Create a link to download the file
      const response = await axios.get(`${backendDomain}/get-reservations-admin?${queryParams}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reservations_report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      showNotification('Export successful', 'success');
    } catch (err) {
      console.error(`Error exporting to ${format}:`, err);
      showNotification('Export failed', 'error');
    }
  };

  // Validate or reject a reservation
  const updateReservationStatus = async (id, status) => {
    try {
      const response = await axios.post(`${backendDomain}/validate-reservation-admin`, {
        id,
        status
      });
      
      if (response.data.success) {
        const updatedReservations = reservations.map(res => 
          res._id === id ? { ...res, ValidateReservation: status } : res
        );
        setReservations(updatedReservations);
        calculateStats(updatedReservations);
        showNotification(`Reservation ${status.toLowerCase()} successfully`, 'success');
        setSelectedReservation(null);
      } else {
        showNotification('Status update failed', 'error');
      }
    } catch (err) {
      console.error('Error updating reservation status:', err);
      showNotification('Error updating reservation status', 'error');
    }
  };

  // Mark expired reservations
  const markExpiredReservations = async () => {
    try {
      const response = await axios.post(`${backendDomain}/mark-expired-or-completed-reservations`);
      
      if (response.data.success) {
        showNotification('Expired reservations updated successfully', 'success');
        fetchReservations(); // Refresh data
      } else {
        showNotification('Failed to update expired reservations', 'error');
      }
    } catch (err) {
      console.error('Error marking expired reservations:', err);
      showNotification('Error updating expired reservations', 'error');
    }
  };

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      productID: '',
      userID: '',
      status: '',
      startDate: '',
      endDate: ''
    });
    setTimeout(() => {
      fetchReservations();
    }, 100);
  };

  // Apply filters
  const applyFilters = () => {
    fetchReservations();
    setShowFilterModal(false);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Reservation Management Dashboard</h1>
        <p className="text-gray-500">Manage and track product reservations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Reservations</p>
              <h3 className="text-2xl font-bold">{stats.total}</h3>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <FileText className="text-blue-500" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Confirmed</p>
              <h3 className="text-2xl font-bold text-green-600">{stats.Confirmed}</h3>
            </div>
            <div className="bg-green-100 p-3 rounded-full">
              <Check className="text-green-500" size={20} />
            </div>
          </div>
        </div>
        
        
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rejected</p>
              <h3 className="text-2xl font-bold text-red-600">{stats.rejected}</h3>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <X className="text-red-500" size={20} />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Not Visited</p>
              <h3 className="text-2xl font-bold text-gray-600">{stats.validated}</h3>
            </div>
            <div className="bg-gray-100 p-3 rounded-full">
              <AlertTriangle className="text-gray-500" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setShowFilterModal(true)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition"
            >
              <Filter size={18} />
              Filter
            </button>
            
            <button 
              onClick={resetFilters}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg flex items-center gap-2 hover:bg-gray-50 transition"
            >
              <RefreshCw size={18} />
              Reset
            </button>
            
           
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={() => exportData('pdf')}
              className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center gap-2 hover:bg-red-100 transition"
            >
              <Download size={18} />
              PDF
            </button>
            
            <button 
              onClick={() => exportData('excel')}
              className="px-4 py-2 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-2 hover:bg-green-100 transition"
            >
              <Download size={18} />
              Excel
            </button>
          </div>
        </div>
        
        {/* Applied Filters Display */}
        {(filters.productID || filters.userID || filters.status || filters.startDate || filters.endDate) && (
          <div className="mt-3 flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">Applied filters:</span>
            
            {filters.productID && (
              <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                Product: {products.find(p => p._id === filters.productID)?.productName || filters.productID}
                <button className="ml-1" onClick={() => setFilters({...filters, productID: ''})}>×</button>
              </span>
            )}
            
            {filters.userID && (
              <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                User: {users.find(u => u._id === filters.userID)?.name || filters.userID}
                <button className="ml-1" onClick={() => setFilters({...filters, userID: ''})}>×</button>
              </span>
            )}
            
            {filters.status && (
              <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                Status: {filters.status}
                <button className="ml-1" onClick={() => setFilters({...filters, status: ''})}>×</button>
              </span>
            )}
            
            {filters.startDate && filters.endDate && (
              <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded-full">
                Date: {new Date(filters.startDate).toLocaleDateString()} - {new Date(filters.endDate).toLocaleDateString()}
                <button 
                  className="ml-1" 
                  onClick={() => setFilters({...filters, startDate: '', endDate: ''})}
                >×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Reservations Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : reservations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No reservations found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('ReservationID')}
                  >
                    <div className="flex items-center">
                      ID
                      {sortConfig.key === 'ReservationID' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('productID.productName')}
                  >
                    <div className="flex items-center">
                      Product
                      {sortConfig.key === 'productID.productName' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('userID.name')}
                  >
                    <div className="flex items-center">
                      User
                      {sortConfig.key === 'userID.name' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('size')}
                  >
                    <div className="flex items-center">
                      Size
                      {sortConfig.key === 'size' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('Quantity')}
                  >
                    <div className="flex items-center">
                      Quantity
                      {sortConfig.key === 'Quantity' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('ValidateReservation')}
                  >
                    <div className="flex items-center">
                      Status
                      {sortConfig.key === 'ValidateReservation' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th 
                    scope="col" 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                    onClick={() => requestSort('ReservationDate')}
                  >
                    <div className="flex items-center">
                      Date
                      {sortConfig.key === 'ReservationDate' && (
                        sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                      )}
                    </div>
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reservations.map((reservation) => (
                  <tr key={reservation._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {reservation.ReservationID || reservation._id.substring(0, 8)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reservation.productID?.productName || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reservation.userID?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reservation.size || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {reservation.Quantity || 0}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${reservation.ValidateReservation === 'Validated' ? 'bg-green-100 text-green-800' : 
                          reservation.ValidateReservation === 'Rejected' ? 'bg-red-100 text-red-800' : 
                          reservation.ValidateReservation === 'Expired' ? 'bg-gray-100 text-gray-800' : 
                          'bg-yellow-100 text-yellow-800'}`}
                      >
                        {reservation.ValidateReservation || 'Pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(reservation.ReservationDate || reservation.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        onClick={() => setSelectedReservation(reservation)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Filter Reservations</h3>
              <button 
                onClick={() => setShowFilterModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                <select 
                  value={filters.productID}
                  onChange={(e) => setFilters({...filters, productID: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Products</option>
                  {products.map(product => (
                    <option key={product._id} value={product._id}>
                      {product.productName} ({product.brandName})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                <select 
                  value={filters.userID}
                  onChange={(e) => setFilters({...filters, userID: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Users</option>
                  {users.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select 
                  value={filters.status}
                  onChange={(e) => setFilters({...filters, status: e.target.value})}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">All Statuses</option>
                  <option value="Not visited">Not visited</option>
                  <option value="Rejected">Rejected</option>
                  <option value="Confirmed">Confirmed</option>
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input 
                    type="date" 
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input 
                    type="date" 
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  />
                </div>
              </div>
              
              <div className="flex justify-end gap-2 pt-4">
                <button 
                  onClick={() => setShowFilterModal(false)}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                
                <button 
                  onClick={applyFilters}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
                >
                  Apply Filters
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reservation Details Modal */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Reservation Details</h3>
              <button 
                onClick={() => setSelectedReservation(null)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="border-b pb-4">
                <div className="flex items-center mb-2">
                  <Package size={20} className="text-gray-500 mr-2" />
                  <h4 className="font-medium">Product Information</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-2 ml-7">
                  <p className="text-sm text-gray-500">Name:</p>
                  <p className="text-sm">{selectedReservation.productID?.productName || 'N/A'}</p>
                  
                  <p className="text-sm text-gray-500">Brand:</p>
                  <p className="text-sm">{selectedReservation.productID?.brandName || 'N/A'}</p>
                  
                  <p className="text-sm text-gray-500">Category:</p>
                  <p className="text-sm">{selectedReservation.productID?.category || 'N/A'}</p>
                </div>
              </div>
              
              <div className="border-b pb-4">
                <div className="flex items-center mb-2">
                  <User size={20} className="text-gray-500 mr-2" />
                  <h4 className="font-medium">Customer Information</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-2 ml-7">
                  <p className="text-sm text-gray-500">Name:</p>
                  <p className="text-sm">{selectedReservation.userID?.name || 'N/A'}</p>
                  
                  <p className="text-sm text-gray-500">Email:</p>
                  <p className="text-sm">{selectedReservation.userID?.email || 'N/A'}</p>
                </div>
              </div>
              
              <div className="border-b pb-4">
                <div className="flex items-center mb-2">
                  <FileText size={20} className="text-gray-500 mr-2" />
                  <h4 className="font-medium">Reservation Details</h4>
                </div>
                
                <div className="grid grid-cols-2 gap-2 ml-7">
                  <p className="text-sm text-gray-500">ID:</p>
                  <p className="text-sm">{selectedReservation.ReservationID || selectedReservation._id}</p>
                  
                  <p className="text-sm text-gray-500">Size:</p>
                  <p className="text-sm">{selectedReservation.size || 'N/A'}</p>
                  
                  <p className="text-sm text-gray-500">Quantity:</p>
                  <p className="text-sm">{selectedReservation.Quantity || '0'}</p>
                  
                  <p className="text-sm text-gray-500">Status:</p>
                  <p className="text-sm">{selectedReservation.ValidateReservation || 'Pending'}</p>
                  
                  <p className="text-sm text-gray-500">Reservation Date:</p>
                  <p className="text-sm">
                    {new Date(selectedReservation.ReservationDate || selectedReservation.createdAt).toLocaleString()}
                  </p>
                  
                  {selectedReservation.ValidateDate && (
                    <>
                      <p className="text-sm text-gray-500">Validation Date:</p>
                      <p className="text-sm">{new Date(selectedReservation.ValidateDate).toLocaleString()}</p>
                    </>
                  )}
                  
                  {selectedReservation.notes && (
                    <>
                      <p className="text-sm text-gray-500">Notes:</p>
                      <p className="text-sm">{selectedReservation.notes}</p>
                    </>
                  )}
                </div>
              </div>
              
              {/* Only show action buttons if status is pending */}
              {(!selectedReservation.ValidateReservation || selectedReservation.ValidateReservation === 'Pending') && (
                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    onClick={() => updateReservationStatus(selectedReservation._id, 'Rejected')}
                    className="px-4 py-2 bg-red-50 border border-red-200 text-red-700 rounded-md hover:bg-red-100 transition"
                  >
                    Reject Reservation
                  </button>
                  
                  <button 
                    onClick={() => updateReservationStatus(selectedReservation._id, 'Validated')}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
                  >
                    Validate Reservation
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Notification Toast */}
      {notification.show && (
        <div 
          className={`fixed bottom-4 right-4 px-4 py-2 rounded-md shadow-lg
            ${notification.type === 'success' ? 'bg-green-500 text-white' : 
              notification.type === 'error' ? 'bg-red-500 text-white' : 
              'bg-blue-500 text-white'}`}
        >
          {notification.message}
        </div>
      )}
      
      {/* Add empty results placeholder */}
      {!loading && !error && reservations.length === 0 && (
        <div className="my-8 text-center">
          <div className="mx-auto w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
            <Package size={36} className="text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">No reservations found</h3>
          <p className="text-gray-500 mb-4">There are no reservations matching your filters.</p>
          <button
            onClick={resetFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  );
};

// Add a pagination component for future implementation
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const pages = [];
  for (let i = 1; i <= totalPages; i++) {
    pages.push(i);
  }
  
  return (
    <div className="flex justify-center mt-4">
      <nav className="inline-flex rounded-md shadow">
        <button 
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-3 py-1 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Previous
        </button>
        
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1 border border-gray-300 ${currentPage === page ? 'bg-blue-50 text-blue-600' : 'bg-white text-gray-500 hover:bg-gray-50'}`}
          >
            {page}
          </button>
        ))}
        
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-3 py-1 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next
        </button>
      </nav>
    </div>
  );
};

export default ReservationAdminDashboard;