import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
} from 'chart.js';
import SummaryApi from '../common';
import { useSelector } from "react-redux";

import { Bar, Pie, Line } from 'react-chartjs-2';
import { format } from 'date-fns';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  LineElement,
  PointElement
);

const BidIncomeTracker = ({ shopId }) => {
  const user = useSelector((state) => state?.user?.user);

  const [bidData, setBidData] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    startDate: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const [processResults, setProcessResults] = useState(null);
  const [processingBids, setProcessingBids] = useState(false);
  const [viewMode, setViewMode] = useState('chart');
  const [notification, setNotification] = useState(null);
  const [showExportDropdown, setShowExportDropdown] = useState(false);

  // Fetch bid income data
  const fetchBidData = async () => {
    try {
      setLoading(true);
      const response = await axios.get(SummaryApi.getBidIncomeStats.url, {
        params: {
          shopId: user._id,
          startDate: dateRange.startDate,
          endDate: dateRange.endDate
        }
      });
      
      if (response.data.success) {
        setBidData(response.data.data);
        setSummary(response.data.summary);
      } else {
        setError('Failed to load bid data');
      }
    } catch (err) {
      setError(err.message || 'Error fetching bid data');
    } finally {
      setLoading(false);
    } 
  };

  // Process expired bids
  const handleProcessBids = async () => {
    try {
      setProcessingBids(true);
      const response = await axios.post(SummaryApi.getprocessClosedout.url);
      setProcessResults(response.data);
      
      if (response.data.success) {
        setNotification({
          type: 'success',
          message: `Successfully processed ${response.data.processedBids.length} expired bids`
        });
        fetchBidData(); // Refresh data after processing
      } else {
        setNotification({
          type: 'error',
          message: 'Failed to process bids'
        });
      }
    } catch (err) {
      setNotification({
        type: 'error',
        message: err.message || 'Error processing bids'
      });
    } finally {
      setProcessingBids(false);
    }
  };

  // Toggle export dropdown
  const toggleExportDropdown = () => {
    setShowExportDropdown(!showExportDropdown);
  };

  // Export report
  const exportReport = (format) => {
    try {
      if (!user?._id) {
        toast.error('User not found');
        return;
      }
  
      // Assuming dateRange is defined in your component
      const formattedStartDate = dateRange.startDate;
      const formattedEndDate = dateRange.endDate;
      
      const params = new URLSearchParams({
        shopId: user._id, // Assuming shopId is user._id
        format,
        startDate: formattedStartDate,
        endDate: formattedEndDate
      }).toString();
      
      const url = `${SummaryApi.getBidIncomeStats.url}?${params}`;
      window.open(url, '_blank');
      
      toast.success(`Report export initiated as ${format.toUpperCase()}`);
      setShowExportDropdown(false);
    } catch (err) {
      console.error(`Error exporting ${format}:`, err);
      toast.error(`Error exporting ${format} report`);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchBidData();
    }
  }, [user]);

  // Clear notification after 5 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (showExportDropdown && !event.target.closest('.export-dropdown-container')) {
        setShowExportDropdown(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showExportDropdown]);

  // Prepare chart data
  const prepareChartData = () => {
    if (!bidData.length) return null;

    // Sort data by close date
    const sortedData = [...bidData].sort((a, b) => new Date(a.closeDate) - new Date(b.closeDate));
    
    // Prepare data for bar chart
    const barData = {
      labels: sortedData.map(item => format(new Date(item.closeDate), 'MMM dd')),
      datasets: [
        {
          label: 'Winning Bid Amount',
          data: sortedData.map(item => item.winningBidAmount),
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        },
        {
          label: 'Net Profit',
          data: sortedData.map(item => item.netProfit),
          backgroundColor: 'rgba(75, 192, 192, 0.6)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    };

    // Prepare data for pie chart - Top 5 products by revenue
    const topProducts = [...bidData]
      .sort((a, b) => b.winningBidAmount - a.winningBidAmount)
      .slice(0, 5);
    
    const pieData = {
      labels: topProducts.map(item => {
        const name = item.productName;
        return name.length > 20 ? name.substring(0, 20) + '...' : name;
      }),
      datasets: [
        {
          data: topProducts.map(item => item.winningBidAmount),
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)'
          ],
          borderWidth: 1
        }
      ]
    };

    // Group data by month for trend analysis
    const monthlyData = {};
    sortedData.forEach(item => {
      const monthYear = format(new Date(item.closeDate), 'MMM yyyy');
      if (!monthlyData[monthYear]) {
        monthlyData[monthYear] = { totalRevenue: 0, totalProfit: 0, count: 0 };
      }
      monthlyData[monthYear].totalRevenue += item.winningBidAmount;
      monthlyData[monthYear].totalProfit += item.netProfit;
      monthlyData[monthYear].count += 1;
    });

    const lineData = {
      labels: Object.keys(monthlyData),
      datasets: [
        {
          label: 'Monthly Revenue',
          data: Object.values(monthlyData).map(item => item.totalRevenue),
          borderColor: 'rgba(54, 162, 235, 1)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.3,
          fill: true
        },
        {
          label: 'Monthly Profit',
          data: Object.values(monthlyData).map(item => item.totalProfit),
          borderColor: 'rgba(75, 192, 192, 1)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.3,
          fill: true
        }
      ]
    };

    return { barData, pieData, lineData };
  };

  const chartData = prepareChartData();

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white shadow-md rounded-lg">
      {notification && (
        <div className={`mb-4 p-4 rounded-md flex justify-between items-center ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          <p>{notification.message}</p>
          <button 
            onClick={() => setNotification(null)}
            className="text-gray-600 hover:text-gray-800 focus:outline-none"
          >
            ×
          </button>
        </div>
      )}
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 md:mb-0">Bid Income Tracking</h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            className={`px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 ${
              processingBids ? 'opacity-75 cursor-not-allowed' : ''
            }`}
            onClick={handleProcessBids}
            disabled={processingBids}
          >
            {processingBids ? 'Processing...' : 'Process Expired Bids'}
          </button>
          
          {/* Export dropdown - Fixed */}
          <div className="export-dropdown-container relative inline-block">
            <button 
              className="px-4 py-2 rounded-md bg-gray-600 text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
              onClick={toggleExportDropdown}
            >
              Export Report
            </button>
            {showExportDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button 
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => exportReport('pdf')}
                  >
                    PDF Format
                  </button>
                  <button 
                    className="block w-full text-left px-4 py-2 text-gray-800 hover:bg-gray-100"
                    onClick={() => exportReport('excel')}
                  >
                    Excel Format
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row mb-6 gap-4 items-end">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            Start Date:
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
        </div>
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">
            End Date:
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </label>
        </div>
        <button 
          onClick={fetchBidData}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Apply Filter
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-gray-600">Loading bid data...</div>
        </div>
      ) : error ? (
        <div className="p-4 bg-red-100 text-red-800 rounded-md">
          {error}
        </div>
      ) : (
        <div>
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500">Total Successful Auctions</h3>
                <p className="text-2xl font-bold text-gray-800 mt-2">{summary.totalBids}</p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500">Total Revenue</h3>
                <p className="text-2xl font-bold text-gray-800 mt-2">
                  LKR {parseFloat(summary.totalRevenue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500">Total Net Profit</h3>
                <p className="text-2xl font-bold text-gray-800 mt-2">
                  LKR {parseFloat(summary.totalProfit).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
                <h3 className="text-sm font-medium text-gray-500">Profit Margin</h3>
                <p className="text-2xl font-bold text-gray-800 mt-2">
                  {summary.totalRevenue > 0 
                    ? `${((parseFloat(summary.totalProfit) / parseFloat(summary.totalRevenue)) * 100).toFixed(1)}%` 
                    : '0%'}
                </p>
              </div>
            </div>
          )}

          <div className="flex border-b border-gray-200 mb-6">
            <button 
              className={`py-2 px-4 font-medium ${viewMode === 'chart' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setViewMode('chart')}
            >
              Chart View
            </button>
            <button 
              className={`py-2 px-4 font-medium ${viewMode === 'table' 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-500 hover:text-gray-700'}`}
              onClick={() => setViewMode('table')}
            >
              Table View
            </button>
          </div>

          {viewMode === 'chart' && chartData ? (
            <div className="space-y-8">
              <div className="bg-white p-4 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Revenue & Profit by Auction</h3>
                <div className="h-64">
                  <Bar 
                    data={chartData.barData}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: 'Amount (LKR)'
                          }
                        },
                        x: {
                          title: {
                            display: true,
                            text: 'Auction Close Date'
                          }
                        }
                      }
                    }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Top Products by Revenue</h3>
                  <div className="h-64">
                    <Pie
                      data={chartData.pieData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                          legend: {
                            position: 'right',
                          },
                          tooltip: {
                            callbacks: {
                              label: (context) => {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: LKR ${value.toFixed(2)}`;
                              }
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow">
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Monthly Revenue & Profit Trends</h3>
                  <div className="h-64">
                    <Line
                      data={chartData.lineData}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                          y: {
                            beginAtZero: true,
                            title: {
                              display: true,
                              text: 'Amount (LKR)'
                            }
                          }
                        }
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto rounded-lg shadow">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Close Date</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Price</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Winning Bid</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Net Profit</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit Margin</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bidData.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">No bid data available for the selected period</td>
                    </tr>
                  ) : (
                    bidData.map((item) => {
                      const profitMargin = item.startPrice > 0 
                        ? ((item.netProfit / item.winningBidAmount) * 100).toFixed(1) 
                        : '100.0';
                      
                      return (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(new Date(item.closeDate), 'MMM dd, yyyy')}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.buyerName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">LKR {item.startPrice.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">LKR {item.winningBidAmount.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">LKR {item.netProfit.toFixed(2)}</td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm ${parseFloat(profitMargin) < 0 ? 'text-red-600 font-medium' : 'text-gray-500'}`}>
                            {profitMargin}%
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500">No bid data available</div>
          )}
          
          {processResults && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Latest Bid Processing Results</h3>
                <div className="mb-6">
                  <p className="mb-2">
                    <span className="font-medium">Processed Bids:</span> {processResults.processedBids.length}
                  </p>
                  {processResults.errors && processResults.errors.length > 0 && (
                    <p className="mb-2 text-red-600">
                      <span className="font-medium">Errors:</span> {processResults.errors.length}
                    </p>
                  )}
                  {processResults.processedBids.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Successfully Processed:</h4>
                      <ul className="bg-gray-50 rounded p-3 text-sm">
                        {processResults.processedBids.slice(0, 5).map((bid, index) => (
                          <li key={index} className="py-1">
                            {bid.productName} - {bid.winner !== 'No bidders' 
                              ? `Won by ${bid.winner} (LKR ${bid.winningAmount.toFixed(2)})` 
                              : 'No bidders'}
                          </li>
                        ))}
                        {processResults.processedBids.length > 5 && (
                          <li className="py-1 text-gray-500">...and {processResults.processedBids.length - 5} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <button 
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50"
                    onClick={() => setProcessResults(null)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BidIncomeTracker;