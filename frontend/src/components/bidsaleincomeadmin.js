import React, { useState, useEffect } from 'react';
import axios from 'axios';

const BiddingSalesIncomeReport = () => {
  const [salesData, setSalesData] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeFrame, setTimeFrame] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'closeDate', direction: 'desc' });
  
  const backendDomain = "http://localhost:8080/api";
  
  useEffect(() => {
    fetchSalesData();
  }, []);
  
  const fetchSalesData = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${backendDomain}/get-bidding-sales-income`);
      setSalesData(response.data.salesData);
      setTotalIncome(response.data.totalIncome);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to fetch bidding sales data');
      setIsLoading(false);
      console.error('Error fetching data:', err);
    }
  };
  
  const handleDownload = (format) => {
    window.open(`${backendDomain}/get-bidding-sales-income?format=${format}`, '_blank');
  };
  
  // Filter data based on timeframe and search term
  const getFilteredData = () => {
    let filtered = [...salesData];
    
    // Filter by time frame
    if (timeFrame !== 'all') {
      const now = new Date();
      const cutoffDate = new Date();
      
      switch (timeFrame) {
        case 'week':
          cutoffDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          cutoffDate.setMonth(now.getMonth() - 1);
          break;
        case 'quarter':
          cutoffDate.setMonth(now.getMonth() - 3);
          break;
        case 'year':
          cutoffDate.setFullYear(now.getFullYear() - 1);
          break;
        default:
          break;
      }
      
      filtered = filtered.filter(item => new Date(item.closeDate) >= cutoffDate);
    }
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.productName.toLowerCase().includes(term) ||
        item.brandName.toLowerCase().includes(term) ||
        item.buyerName.toLowerCase().includes(term) ||
        item.buyerEmail.toLowerCase().includes(term)
      );
    }
    
    // Calculate filtered total
    const filteredTotal = filtered.reduce((sum, item) => sum + item.bidAmount, 0);
    
    return { data: filtered, total: filteredTotal };
  };
  
  const { data: filteredData, total: filteredTotal } = getFilteredData();
  
  // Sort data
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };
  
  const sortedData = React.useMemo(() => {
    let sortableItems = [...filteredData];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredData, sortConfig]);
  
  const getSortIndicator = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓';
  };
  
  // Format date string
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR'
    }).format(amount);
  };
  
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            className="mt-2 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
            onClick={fetchSalesData}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Bidding Sales Income Report</h1>
      
      {/* Stats and Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {/* Income Summary Card */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Total Income</h2>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(filteredTotal)}</p>
          <p className="text-sm text-gray-500 mt-1">
            {filteredData.length} transactions
            {timeFrame !== 'all' && ` in the past ${timeFrame}`}
          </p>
        </div>
        
        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-3">Filter by Time</h2>
          <select 
            value={timeFrame} 
            onChange={(e) => setTimeFrame(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Time</option>
            <option value="week">Past Week</option>
            <option value="month">Past Month</option>
            <option value="quarter">Past 3 Months</option>
            <option value="year">Past Year</option>
          </select>
        </div>
        
        {/* Export Options */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-3">Export Report</h2>
          <div className="flex gap-2">
            <button 
              onClick={() => handleDownload('pdf')}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded"
            >
              Export PDF
            </button>
            <button 
              onClick={() => handleDownload('excel')}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
            >
              Export Excel
            </button>
          </div>
        </div>
      </div>
      
      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by product, brand, or buyer..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg"
        />
      </div>
      
      {/* Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('productName')}
                >
                  Product {getSortIndicator('productName')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('brandName')}
                >
                  Brand {getSortIndicator('brandName')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('bidAmount')}
                >
                  Bid Amount {getSortIndicator('bidAmount')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('closeDate')}
                >
                  Close Date {getSortIndicator('closeDate')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => requestSort('buyerName')}
                >
                  Buyer {getSortIndicator('buyerName')}
                </th>
                <th 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Contact
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedData.length > 0 ? (
                sortedData.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{item.productName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{item.brandName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-green-600">{formatCurrency(item.bidAmount)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{formatDate(item.closeDate)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{item.buyerName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-blue-500 hover:underline">{item.buyerEmail}</div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                    No bidding sales data found for the selected filters
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan="2" className="px-6 py-4 text-sm font-medium text-gray-900">
                  Total
                </td>
                <td className="px-6 py-4 text-sm font-bold text-green-600">
                  {formatCurrency(filteredTotal)}
                </td>
                <td colSpan="3" className="px-6 py-4 text-sm text-gray-500">
                  {filteredData.length} transactions shown
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BiddingSalesIncomeReport;