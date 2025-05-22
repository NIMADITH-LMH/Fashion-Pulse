import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SummaryApi from '../common';
import { useSelector } from 'react-redux';
import { 
  BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line
} from 'recharts';
import { Download, FileText, FileSpreadsheet, RefreshCw, Filter, ChevronDown } from 'lucide-react';

const ReservationValidationDashboard = () => {
  const shopId = useSelector((state) => state?.user?.user);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const [activeTab, setActiveTab] = useState('summary');
  const [timeFilter, setTimeFilter] = useState('all');
  const [filterOpen, setFilterOpen] = useState(false);

  const COLORS = ['#4CAF50', '#FFC107', '#F44336'];
  const STATUS_COLORS = {
    confirmed: '#4CAF50',
    notvisited: '#FFC107',
    rejected: '#F44336'
  };

  const STATUS_LABELS = {
    confirmed: 'Confirmed',
    notvisited: 'Not Visited',
    rejected: 'Rejected'
  };

  useEffect(() => {
    fetchData();
  }, [shopId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(SummaryApi.getReservationRevenue.url,{
        params:{
          shopId:shopId._id, 
           names:shopId.name
        }
      });
      setData(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to load reservation data');
      setLoading(false);
      console.error('Error fetching reservation data:', err);
    }
  };

  const downloadReport = async (format) => {
    try {
      const response = await axios.get(SummaryApi.getReservationRevenue.url, {
        params: {
          shopId: shopId._id,
          names: shopId.name,
          format: format
        },
        responseType: 'blob'
      });
      
      // Create a download link and trigger the download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `reservation_validation_report.${format === 'pdf' ? 'pdf' : 'xlsx'}`);
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error downloading report:', err);
      setError(`Failed to download ${format.toUpperCase()} report`);
    }
  };
  const filterDataByTime = (data) => {
    if (!data || timeFilter === 'all') return data;

    const now = new Date();
    const filtered = {};
    
    Object.keys(data).forEach(status => {
      filtered[status] = data[status].filter(item => {
        const reservationDate = new Date(item.reservationDate);
        
        switch(timeFilter) {
          case 'week':
            const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return reservationDate >= oneWeekAgo;
          case 'month':
            const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
            return reservationDate >= oneMonthAgo;
          case 'quarter':
            const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
            return reservationDate >= threeMonthsAgo;
          case 'year':
            const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
            return reservationDate >= oneYearAgo;
          default:
            return true;
        }
      });
    });
    
    return filtered;
  };

  // Generate summary data for charts
  const getSummaryChartData = () => {
    if (!data || !data.summary) return [];
    
    return [
      { 
        name: 'Confirmed',
        value: parseInt(data.summary.confirmedCount), 
        revenue: parseFloat(data.summary.confirmedRevenue) 
      },
      { 
        name: 'Not Visited',
        value: parseInt(data.summary.notVisitedCount),
        revenue: parseFloat(data.summary.notVisitedRevenue)
      },
      { 
        name: 'Rejected',
        value: parseInt(data.summary.rejectedCount),
        revenue: parseFloat(data.summary.rejectedRevenue)
      }
    ];
  };

  // Generate monthly trend data
  const getTrendData = () => {
    if (!data || !data.data) return [];
    
    const months = {};
    const statuses = ['confirmed', 'notVisited', 'rejected'];
    
    statuses.forEach(status => {
      (data.data[status] || []).forEach(item => {
        const date = new Date(item.reservationDate);
        const monthKey = `${date.getFullYear()}-${date.getMonth() + 1}`;
        
        if (!months[monthKey]) {
          months[monthKey] = {
            month: new Date(date.getFullYear(), date.getMonth(), 1),
            confirmed: 0,
            notVisited: 0,
            rejected: 0,
            confirmedRevenue: 0,
            notVisitedRevenue: 0,
            rejectedRevenue: 0
          };
        }
        
        months[monthKey][status]++;
        months[monthKey][`${status}Revenue`] += item.revenue;
      });
    });
    
    return Object.values(months).sort((a, b) => a.month - b.month);
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(value);
  };

  const renderSummaryTab = () => {
    if (!data || !data.summary) return null;
    
    const summary = data.summary;
    const chartData = getSummaryChartData();
    
    return (
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Reservation Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [value, 'Count']} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-xl font-semibold mb-4">Revenue by Status</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [formatCurrency(value), 'Revenue']} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <h3 className="text-xl font-semibold mb-4">Monthly Trends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={getTrendData()}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="month" 
                tickFormatter={(date) => date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
              />
              <YAxis />
              <Tooltip 
                labelFormatter={(date) => date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                formatter={(value, name) => {
                  if (name.includes('Revenue')) {
                    return [formatCurrency(value), name.replace('Revenue', ' Revenue')];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Line type="monotone" dataKey="confirmed" stroke={STATUS_COLORS.confirmed} name="Confirmed" />
              <Line type="monotone" dataKey="notVisited" stroke={STATUS_COLORS.notvisited} name="Not Visited" />
              <Line type="monotone" dataKey="rejected" stroke={STATUS_COLORS.rejected} name="Rejected" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow md:col-span-2">
          <h3 className="text-xl font-semibold mb-4">Revenue Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <p className="text-sm text-green-800">Confirmed Revenue</p>
              <p className="text-2xl font-bold text-green-700">{formatCurrency(summary.confirmedRevenue)}</p>
              <p className="text-sm text-green-600">{summary.confirmedCount} reservations</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <p className="text-sm text-yellow-800">Not Visited Revenue</p>
              <p className="text-2xl font-bold text-yellow-700">{formatCurrency(summary.notVisitedRevenue)}</p>
              <p className="text-sm text-yellow-600">{summary.notVisitedCount} reservations</p>
            </div>
            <div className="bg-red-50 p-4 rounded-lg border border-red-200">
              <p className="text-sm text-red-800">Rejected Revenue</p>
              <p className="text-2xl font-bold text-red-700">{formatCurrency(summary.rejectedRevenue)}</p>
              <p className="text-sm text-red-600">{summary.rejectedCount} reservations</p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">Total Potential Revenue</p>
              <p className="text-2xl font-bold text-blue-700">{formatCurrency(summary.totalRevenue)}</p>
              <p className="text-sm text-blue-600">{summary.totalReservations} reservations</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderDetailTab = (status) => {
    if (!data || !data.data || !data.data[status]) return null;
    
    const filteredData = filterDataByTime(data.data)[status];
    
    if (!filteredData || filteredData.length === 0) {
      return (
        <div className="mt-6 bg-white p-6 rounded-lg shadow">
          <p className="text-gray-500 text-center py-8">No {STATUS_LABELS[status]} reservations found</p>
        </div>
      );
    }
    
    return (
      <div className="mt-6 bg-white p-6 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredData.map((item, index) => (
                <tr key={item.id || index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(item.reservationDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.size}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.price)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatCurrency(item.revenue)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.customer}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="bg-gray-50">
                <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">Total</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                  {formatCurrency(filteredData.reduce((sum, item) => sum + item.revenue, 0))}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg mt-4">
        <p>{error}</p>
        <button 
          onClick={fetchData}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
        >
          <RefreshCw size={16} className="mr-2" /> Try Again
        </button>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 p-4 rounded-lg mt-4">
        <p>No data available for this shop.</p>
      </div>
    );
  }

  return (
    <div className="p-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reservation Validation Analysis</h2>
          <p className="text-gray-600">Shop: {shopId.name}</p>
        </div>
        
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mt-4 md:mt-0">
          <div className="relative">
            <button 
              onClick={() => setFilterOpen(!filterOpen)}
              className="px-4 py-2 bg-white border border-gray-300 rounded-md flex items-center hover:bg-gray-50"
            >
              <Filter size={16} className="mr-2" />
              Time Period: {timeFilter === 'all' ? 'All Time' : timeFilter === 'week' ? 'Last Week' : 
                           timeFilter === 'month' ? 'Last Month' : timeFilter === 'quarter' ? 'Last Quarter' : 'Last Year'}
              <ChevronDown size={16} className="ml-2" />
            </button>
            {filterOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                <ul className="py-1">
                  <li>
                    <button 
                      onClick={() => { setTimeFilter('all'); setFilterOpen(false); }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      All Time
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => { setTimeFilter('week'); setFilterOpen(false); }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Last Week
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => { setTimeFilter('month'); setFilterOpen(false); }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Last Month
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => { setTimeFilter('quarter'); setFilterOpen(false); }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Last Quarter
                    </button>
                  </li>
                  <li>
                    <button 
                      onClick={() => { setTimeFilter('year'); setFilterOpen(false); }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                    >
                      Last Year
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => downloadReport('pdf')}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center"
            >
              <FileText size={16} className="mr-2" /> PDF
            </button>
            <button 
              onClick={() => downloadReport('excel')}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center"
            >
              <FileSpreadsheet size={16} className="mr-2" /> Excel
            </button>
            <button 
              onClick={fetchData}
              className="p-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              title="Refresh Data"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('summary')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'summary'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab('confirmed')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'confirmed'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Confirmed
            </button>
            <button
              onClick={() => setActiveTab('notVisited')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'notVisited'
                  ? 'border-yellow-500 text-yellow-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Not Visited
            </button>
            <button
              onClick={() => setActiveTab('rejected')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'rejected'
                  ? 'border-red-500 text-red-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Rejected
            </button>
          </nav>
        </div>
      </div>
      
      {activeTab === 'summary' && renderSummaryTab()}
      {activeTab === 'confirmed' && renderDetailTab('confirmed')}
      {activeTab === 'notVisited' && renderDetailTab('notVisited')}
      {activeTab === 'rejected' && renderDetailTab('rejected')}
    </div>
  );
};

export default ReservationValidationDashboard;