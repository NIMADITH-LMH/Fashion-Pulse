import React, { useState, useEffect } from 'react';
import axios from 'axios';

const ReservationIncomeReport = () => {
  const [shops, setShops] = useState([]);
  const [selectedShop, setSelectedShop] = useState('');
  const [shopName, setShopName] = useState('');
  const [format, setFormat] = useState('json');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const backendDomain = "http://localhost:8080/api";

  useEffect(() => {
    // Fetch shops list when component mounts
    const fetchShops = async () => {
      try {
        const response = await axios.get(`${backendDomain}/get-shop-details`);
        // Ensure that shops is always an array
        if (Array.isArray(response.data)) {
          setShops(response.data);
        } else if (response.data && typeof response.data === 'object') {
          // If the response is an object, try to extract an array property that might contain shops
          const possibleShopsArray = Object.values(response.data).find(val => Array.isArray(val));
          setShops(possibleShopsArray || []);
        } else {
          // If there's no recognizable array, set to empty array
          setShops([]);
          setError('Unexpected API response format for shops data');
        }
      } catch (err) {
        console.error('Error fetching shops:', err);
        setError('Failed to load shops list. Please try again later.');
        setShops([]); // Ensure shops is an empty array on error
      }
    };

    fetchShops();
  }, []);

  const handleShopChange = (e) => {
    const shopId = e.target.value;
    setSelectedShop(shopId);
    
    // Find shop name for the selected shop ID
    const shop = shops.find(shop => shop._id === shopId);
    if (shop) {
      setShopName(shop.name);
    }
  };

  const generateReport = async () => {
    if (!selectedShop) {
      setError('Please select a shop first');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      if (format === 'json') {
        // For JSON, make a regular API call and display data in the UI
        const response = await axios.get(`${backendDomain}/get-reservation-income-report`, {
          params: {
            shopId: selectedShop,
            format: 'json',
            names: shopName
          }
        });
        
        // Check and ensure confirmedIncome exists
        if (response.data && response.data.confirmedIncome === undefined) {
          response.data.confirmedIncome = 0;
        }
        
        setReportData(response.data);
      } else {
        // For PDF or Excel, generate a download link
        const url = `${backendDomain}/get-reservation-income-report?shopId=${selectedShop}&format=${format}&names=${encodeURIComponent(shopName)}`;
        window.open(url, '_blank');
      }
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Get status display text and color
  const getStatusDisplay = (status) => {
    switch (status) {
      case 'Confirmed':
        return { text: 'Confirmed', color: 'bg-green-100 text-green-800' };
      case 'Not visited':
        return { text: 'Not visited', color: 'bg-yellow-100 text-yellow-800' };
      case 'Rejected':
        return { text: 'Rejected', color: 'bg-red-100 text-red-800' };
      default:
        return { text: status || 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <h1 className="text-3xl font-bold text-center mb-8">Reservation Income Report</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4">Report Settings</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-gray-700 mb-2">Select Shop</label>
              <select 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={selectedShop}
                onChange={handleShopChange}
              >
                <option value="">-- Select a Shop --</option>
                {Array.isArray(shops) && shops.map(shop => (
                  <option key={shop._id} value={shop._id}>{shop.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-gray-700 mb-2">Report Format</label>
              <select 
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="json">View in Browser (JSON)</option>
                <option value="pdf">Download PDF</option>
                <option value="excel">Download Excel</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <button 
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md w-full transition duration-200"
                onClick={generateReport}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
        </div>
      </div>
      
      {reportData && format === 'json' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">Report Summary</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 rounded-md p-4">
                <span className="text-gray-500">Total Reservations</span>
                <p className="text-2xl font-bold">{reportData.totalReservations || 0}</p>
              </div>
              <div className="bg-gray-50 rounded-md p-4">
                <span className="text-gray-500">Confirmed Reservations Income</span>
                <p className="text-2xl font-bold">LKR. {(reportData.confirmedIncome || 0).toFixed(2)}</p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Reservations Details</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white border border-gray-200">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-4 py-2 border text-left">Product</th>
                    <th className="px-4 py-2 border text-left">Date</th>
                    <th className="px-4 py-2 border text-left">Size</th>
                    <th className="px-4 py-2 border text-left">Qty</th>
                    <th className="px-4 py-2 border text-left">Price</th>
                    <th className="px-4 py-2 border text-left">Revenue</th>
                    <th className="px-4 py-2 border text-left">Customer</th>
                    <th className="px-4 py-2 border text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.reservations && Array.isArray(reportData.reservations) && reportData.reservations.length > 0 ? (
                    reportData.reservations.map((item, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                        <td className="px-4 py-2 border">{item.productName}</td>
                        <td className="px-4 py-2 border">{formatDate(item.reservationDate)}</td>
                        <td className="px-4 py-2 border">{item.size}</td>
                        <td className="px-4 py-2 border">{item.quantity}</td>
                        <td className="px-4 py-2 border">LKR. {(item.price || 0).toFixed(2)}</td>
                        <td className="px-4 py-2 border">LKR. {(item.revenue || 0).toFixed(2)}</td>
                        <td className="px-4 py-2 border">{item.customer}</td>
                        <td className="px-4 py-2 border">
                          {(() => {
                            const status = getStatusDisplay(item.validationStatus);
                            return (
                              <span className={`px-2 py-1 rounded-full text-xs ${status.color}`}>
                                {status.text}
                              </span>
                            );
                          })()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="px-4 py-2 border text-center">No reservation data available</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReservationIncomeReport;