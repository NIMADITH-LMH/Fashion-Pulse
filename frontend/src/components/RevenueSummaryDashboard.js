import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  TimeScale
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { Download, FileText, FileSpreadsheet, Filter, Search } from 'lucide-react';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  TimeScale
);

const BACKEND_DOMAIN = "http://localhost:8080/api";

const RevenueSummaryDashboard = () => {
  const [revenueData, setRevenueData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [yearFilter, setYearFilter] = useState("");
  const [activeTab, setActiveTab] = useState('summary');
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSalesData, setFilteredSalesData] = useState([]);

  // Get current year and previous 5 years for filter dropdown
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);

  useEffect(() => {
    fetchRevenueData();
  }, [yearFilter]);

  useEffect(() => {
    if (revenueData && revenueData.salesData) {
      const filtered = revenueData.salesData.filter(sale => {
        const searchLower = searchTerm.toLowerCase();
        return (
          sale.productName.toLowerCase().includes(searchLower) ||
          sale.buyerName.toLowerCase().includes(searchLower) ||
          sale.type.toLowerCase().includes(searchLower) ||
          new Date(sale.date).toLocaleDateString().includes(searchTerm) ||
          sale.amount.toString().includes(searchTerm)
        );
      });
      setFilteredSalesData(filtered);
    }
  }, [searchTerm, revenueData]);

  const fetchRevenueData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BACKEND_DOMAIN}/total-revenue-summary`, {
        params: { year: yearFilter || undefined }
      });
      setRevenueData(response.data);
      setFilteredSalesData(response.data.salesData);
      setError(null);
    } catch (err) {
      setError('Failed to fetch revenue data. Please try again later.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = (format) => {
    const url = `${BACKEND_DOMAIN}/total-revenue-summary?format=${format}${yearFilter ? `&year=${yearFilter}` : ''}${searchTerm ? `&search=${searchTerm}` : ''}`;
    window.open(url, '_blank');
  };

  // Calculate totals for filtered data
  const calculateFilteredTotals = () => {
    if (!filteredSalesData.length) return { total: 0, count: 0, average: 0 };
    
    const total = filteredSalesData.reduce((sum, sale) => sum + sale.amount, 0);
    return {
      total,
      count: filteredSalesData.length,
      average: filteredSalesData.length > 0 ? total / filteredSalesData.length : 0
    };
  };

  const filteredTotals = calculateFilteredTotals();

  // Prepare data for charts
  const prepareChartData = () => {
    if (!filteredSalesData || !filteredSalesData.length) return null;

    // Group by type for pie chart
    const typeGroups = filteredSalesData.reduce((acc, sale) => {
      if (!acc[sale.type]) acc[sale.type] = 0;
      acc[sale.type] += sale.amount;
      return acc;
    }, {});

    // Group by month for bar chart
    const monthlyData = filteredSalesData.reduce((acc, sale) => {
      const month = new Date(sale.date).toLocaleString('default', { month: 'long' });
      if (!acc[month]) acc[month] = 0;
      acc[month] += sale.amount;
      return acc;
    }, {});

    // Sort months chronologically
    const months = ["January", "February", "March", "April", "May", "June", 
                    "July", "August", "September", "October", "November", "December"];
    const sortedMonths = Object.keys(monthlyData)
      .sort((a, b) => months.indexOf(a) - months.indexOf(b));

    const chartData = {
      pieData: {
        labels: Object.keys(typeGroups),
        datasets: [
          {
            data: Object.values(typeGroups),
            backgroundColor: [
              'rgba(255, 99, 132, 0.7)',
              'rgba(54, 162, 235, 0.7)',
              'rgba(255, 206, 86, 0.7)',
            ],
            borderColor: [
              'rgba(255, 99, 132, 1)',
              'rgba(54, 162, 235, 1)',
              'rgba(255, 206, 86, 1)',
            ],
            borderWidth: 1,
          },
        ],
      },
      barData: {
        labels: sortedMonths,
        datasets: [
          {
            label: 'Monthly Revenue',
            data: sortedMonths.map(month => monthlyData[month]),
            backgroundColor: 'rgba(75, 192, 192, 0.7)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1,
          },
        ],
      },
    };

    return chartData;
  };

  const chartData = prepareChartData();

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Revenue Summary Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Comprehensive overview of revenue from confirmed orders, winning bids, and confirmed reservations
          </p>
        </header>

        {/* Filters and Actions Section */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <Filter className="text-gray-500" size={20} />
              <div>
                <label htmlFor="year-filter" className="block text-sm font-medium text-gray-700">
                  Filter by Year
                </label>
                <select
                  id="year-filter"
                  className="mt-1 block w-40 pl-3 pr-10 py-2 text-base border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  value={yearFilter}
                  onChange={(e) => setYearFilter(e.target.value)}
                >
                  <option value="">All Years</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => downloadReport('pdf')}
                className="flex items-center space-x-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md transition"
              >
                <FileText size={18} />
                <span>PDF</span>
              </button>
              <button
                onClick={() => downloadReport('excel')}
                className="flex items-center space-x-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-md transition"
              >
                <FileSpreadsheet size={18} />
                <span>Excel</span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search by product, buyer, type..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('summary')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'summary'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Summary
              </button>
              <button
                onClick={() => setActiveTab('details')}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === 'details'
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Sales Details
              </button>
            </nav>
          </div>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
            <p>{error}</p>
          </div>
        ) : revenueData ? (
          <>
            {activeTab === 'summary' && (
              <div className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-500">Total Revenue</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      ${filteredTotals.total.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {searchTerm ? 'Filtered results' : (yearFilter ? `For year ${yearFilter}` : 'All time')}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-500">Total Transactions</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      {filteredTotals.count}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Completed sales</p>
                  </div>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-medium text-gray-500">Average Sale Value</h3>
                    <p className="text-3xl font-bold text-gray-900 mt-2">
                      ${filteredTotals.average.toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">Per transaction</p>
                  </div>
                </div>

                {/* Charts */}
                {chartData && filteredSalesData.length > 0 ? (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Revenue by Type</h3>
                      <div className="h-80">
                        <Pie data={chartData.pieData} options={{
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              position: 'bottom',
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  const label = context.label || '';
                                  const value = context.raw || 0;
                                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                  const percentage = ((value * 100) / total).toFixed(1);
                                  return `${label}: $${value.toFixed(2)} (${percentage}%)`;
                                }
                              }
                            }
                          }
                        }} />
                      </div>
                    </div>
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="text-lg font-medium text-gray-800 mb-4">Monthly Revenue</h3>
                      <div className="h-80">
                        <Bar data={chartData.barData} options={{
                          maintainAspectRatio: false,
                          plugins: {
                            legend: {
                              display: false,
                            },
                            tooltip: {
                              callbacks: {
                                label: function(context) {
                                  return `Revenue: $${context.raw.toFixed(2)}`;
                                }
                              }
                            }
                          },
                          scales: {
                            y: {
                              beginAtZero: true,
                              ticks: {
                                callback: function(value) {
                                  return '$' + value;
                                }
                              }
                            }
                          }
                        }} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-lg shadow p-6 text-center">
                    <p className="text-gray-500">No data available for charts</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'details' && (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {filteredSalesData.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Product
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Buyer
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Amount
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredSalesData.map((sale, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                sale.type === 'Order' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : sale.type === 'Winning Bid' 
                                    ? 'bg-purple-100 text-purple-800' 
                                    : 'bg-green-100 text-green-800'
                              }`}>
                                {sale.type}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{sale.productName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{sale.buyerName}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">${sale.amount.toFixed(2)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(sale.date).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                sale.status === 'Confirmed' 
                                  ? 'bg-green-100 text-green-800' 
                                  : sale.status === 'Pending' 
                                    ? 'bg-yellow-100 text-yellow-800' 
                                    : sale.status === 'Not visited'
                                      ? 'bg-blue-100 text-blue-800'
                                      : sale.status === 'Rejected'
                                        ? 'bg-red-100 text-red-800'
                                        : 'bg-gray-100 text-gray-800'
                              }`}>
                                {sale.status || 'Completed'}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="p-6 text-center">
                    <p className="text-gray-500">No sales data found matching your search criteria.</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4">
            <p>No revenue data available.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RevenueSummaryDashboard;