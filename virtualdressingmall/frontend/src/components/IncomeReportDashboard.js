import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { useSelector } from 'react-redux';
import SummaryApi from '../common';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';

// Define API endpoints directly in the component to avoid import errors
const API_ENDPOINTS = {
  incomeReport: '/api/seller/income-report'
};

const IncomeReportDashboard = () => {
    const user = useSelector((state) => state?.user?.user);
    const [incomeData, setIncomeData] = useState([]);
  const [startDate, setStartDate] = useState(new Date(new Date().setMonth(new Date().getMonth() - 1)));
  const [endDate, setEndDate] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [showFullTable, setShowFullTable] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'orderDate', direction: 'desc' });
  const [summaryStats, setSummaryStats] = useState({
    totalSales: 0,
    totalCommission: 0,
    totalNetIncome: 0,
    totalOrders: 0
  });
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  useEffect(() => {
    if (user?._id) {
      fetchIncomeReport();
    }
  }, [user]);

  const fetchIncomeReport = async () => {
    try {
      setLoading(true);
      if (!user?._id) {
        toast.error('User not found');
        return;
      }

      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      const response = await axios.get(SummaryApi.orderIncomeReport.url, {
        params: {
          sellerId: user._id,
          startDate: formattedStartDate,
          endDate: formattedEndDate
        }
      });
      
      if (response.data.success) {
        setIncomeData(response.data.data);
        calculateSummaryStats(response.data.data);
      } else {
        toast.error('Failed to fetch income data');
      }
    } catch (err) {
      console.error('Error fetching income data:', err);
      toast.error('Error fetching income data');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummaryStats = (data) => {
    const stats = data.reduce((acc, item) => {
      acc.totalSales += item.totalAmount;
      acc.totalCommission += item.commission;
      acc.totalNetIncome += item.netIncome;
      acc.totalOrders += item.orderQuantity;
      return acc;
    }, { totalSales: 0, totalCommission: 0, totalNetIncome: 0, totalOrders: 0 });
    
    setSummaryStats(stats);
  };

  const exportReport = async (format) => {
    try {
      setExportLoading(true);
      if (!user?._id) {
        toast.error('User not found');
        return;
      }

      const formattedStartDate = startDate.toISOString().split('T')[0];
      const formattedEndDate = endDate.toISOString().split('T')[0];
      
      const response = await axios.get(SummaryApi.orderIncomeReport.url, {
        params: {
          sellerId: user._id,
          startDate: formattedStartDate,
          endDate: formattedEndDate,
          format
        },
        responseType: 'blob'
      });
      
      // Create download link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', format === 'pdf' ? 'income_report.pdf' : 'income_report.xlsx');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success(`Report successfully exported as ${format.toUpperCase()}`);
    } catch (err) {
      console.error(`Error exporting ${format}:`, err);
      toast.error(`Error exporting ${format} report`);
    } finally {
      setExportLoading(false);
    }
  };

  // Sort function for the table
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = React.useMemo(() => {
    if (!incomeData.length) return [];
    
    const sortableData = [...incomeData];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [incomeData, sortConfig]);

  // Prepare data for monthly chart
  const monthlyData = React.useMemo(() => {
    if (!incomeData.length) return [];
    
    const monthlyMap = {};
    
    incomeData.forEach(item => {
      const date = new Date(item.orderDate);
      const monthYear = `${date.getMonth() + 1}/${date.getFullYear()}`;
      
      if (!monthlyMap[monthYear]) {
        monthlyMap[monthYear] = {
          month: monthYear,
          sales: 0,
          commission: 0,
          netIncome: 0,
          orders: 0
        };
      }
      
      monthlyMap[monthYear].sales += item.totalAmount;
      monthlyMap[monthYear].commission += item.commission;
      monthlyMap[monthYear].netIncome += item.netIncome;
      monthlyMap[monthYear].orders += item.orderQuantity;
    });
    
    return Object.values(monthlyMap).sort((a, b) => {
      const [aMonth, aYear] = a.month.split('/').map(Number);
      const [bMonth, bYear] = b.month.split('/').map(Number);
      
      if (aYear !== bYear) return aYear - bYear;
      return aMonth - bMonth;
    });
  }, [incomeData]);

  // Product performance data
  const productPerformance = React.useMemo(() => {
    if (!incomeData.length) return [];
    
    const productMap = {};
    
    incomeData.forEach(item => {
      if (!productMap[item.productName]) {
        productMap[item.productName] = {
          name: item.productName,
          sales: 0,
          orders: 0,
          netIncome: 0
        };
      }
      
      productMap[item.productName].sales += item.totalAmount;
      productMap[item.productName].orders += item.orderQuantity;
      productMap[item.productName].netIncome += item.netIncome;
    });
    
    return Object.values(productMap)
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [incomeData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'LKR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  if (loading && !incomeData.length) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-6">Income Report Dashboard</h1>
      
      {/* Filter Section */}
      <div className="bg-gray-50 p-4 mb-6 rounded-lg">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
            <DatePicker
              selected={startDate}
              onChange={date => setStartDate(date)}
              dateFormat="yyyy-MM-dd"
              className="p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
            <DatePicker
              selected={endDate}
              onChange={date => setEndDate(date)}
              dateFormat="yyyy-MM-dd"
              className="p-2 border rounded"
            />
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={fetchIncomeReport}
              disabled={loading}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? 'Loading...' : 'Apply Filter'}
            </button>
          </div>
        </div>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold opacity-80">Total Sales</h3>
          <p className="text-3xl font-bold mt-2">{formatCurrency(summaryStats.totalSales)}</p>
        </div>
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold opacity-80">Total Commission</h3>
          <p className="text-3xl font-bold mt-2">{formatCurrency(summaryStats.totalCommission)}</p>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold opacity-80">Net Income</h3>
          <p className="text-3xl font-bold mt-2">{formatCurrency(summaryStats.totalNetIncome)}</p>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold opacity-80">Total Orders</h3>
          <p className="text-3xl font-bold mt-2">{summaryStats.totalOrders}</p>
        </div>
      </div>
      
      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Income Trend */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Monthly Income Trend</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={monthlyData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  labelFormatter={(label) => `Month: ${label}`}
                />
                <Legend />
                <Line type="monotone" dataKey="sales" name="Total Sales" stroke="#8884d8" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="netIncome" name="Net Income" stroke="#82ca9d" />
                <Line type="monotone" dataKey="commission" name="Commission" stroke="#ff7300" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Top Products */}
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Top Products by Revenue</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={productPerformance}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={false} />
                <YAxis />
                <Tooltip
                  formatter={(value, name) => {
                    if (name === "sales" || name === "netIncome") return formatCurrency(value);
                    return value;
                  }}
                  labelFormatter={(label) => `Product: ${label}`}
                />
                <Legend />
                <Bar dataKey="sales" name="Total Sales" fill="#8884d8" />
                <Bar dataKey="netIncome" name="Net Income" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
      
      {/* Revenue Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-gray-50 p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Revenue Breakdown</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={[
                    { name: 'Net Income', value: summaryStats.totalNetIncome },
                    { name: 'Commission', value: summaryStats.totalCommission }
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {[0, 1].map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        {/* Export Section */}
        <div className="bg-gray-50 p-4 rounded-lg shadow flex flex-col justify-center">
          <h2 className="text-xl font-semibold mb-6">Export Report</h2>
          <p className="text-gray-600 mb-6">Download your income report in your preferred format for record keeping or further analysis.</p>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => exportReport('pdf')}
              disabled={exportLoading}
              className="flex items-center justify-center bg-red-600 text-white px-6 py-3 rounded hover:bg-red-700 disabled:bg-red-300 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm5 6a1 1 0 10-2 0v3.586l-1.293-1.293a1 1 0 10-1.414 1.414l3 3a1 1 0 001.414 0l3-3a1 1 0 00-1.414-1.414L11 11.586V8z" clipRule="evenodd" />
              </svg>
              Export as PDF
            </button>
            <button
              onClick={() => exportReport('excel')}
              disabled={exportLoading}
              className="flex items-center justify-center bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 disabled:bg-green-300 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M3 17a1 1 0 001 1h12a1 1 0 001-1V7H3v10zM3 3a1 1 0 00-1 1v1h16V4a1 1 0 00-1-1H3z" clipRule="evenodd" />
              </svg>
              Export as Excel
            </button>
          </div>
        </div>
      </div>
      
      {/* Orders Table */}
      <div className="bg-gray-50 p-4 rounded-lg shadow">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Orders Detail</h2>
          <button 
            onClick={() => setShowFullTable(!showFullTable)}
            className="text-blue-600 hover:text-blue-800"
          >
            {showFullTable ? 'Show Less' : 'View All'}
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th 
                  className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                  onClick={() => requestSort('productName')}
                >
                  Product Name
                  {sortConfig.key === 'productName' && (
                    <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th 
                  className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                  onClick={() => requestSort('orderQuantity')}
                >
                  Quantity
                  {sortConfig.key === 'orderQuantity' && (
                    <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th 
                  className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                  onClick={() => requestSort('totalAmount')}
                >
                  Total Amount
                  {sortConfig.key === 'totalAmount' && (
                    <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th 
                  className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                  onClick={() => requestSort('commission')}
                >
                  Commission
                  {sortConfig.key === 'commission' && (
                    <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th 
                  className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                  onClick={() => requestSort('netIncome')}
                >
                  Net Income
                  {sortConfig.key === 'netIncome' && (
                    <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th 
                  className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                  onClick={() => requestSort('orderDate')}
                >
                  Order Date
                  {sortConfig.key === 'orderDate' && (
                    <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th 
                  className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                  onClick={() => requestSort('orderStatus')}
                >
                  Status
                  {sortConfig.key === 'orderStatus' && (
                    <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
                <th 
                  className="py-2 px-4 border-b cursor-pointer hover:bg-gray-200"
                  onClick={() => requestSort('customer')}
                >
                  Customer
                  {sortConfig.key === 'customer' && (
                    <span>{sortConfig.direction === 'asc' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
              </tr>
            </thead>
            <tbody>
              {(showFullTable ? sortedData : sortedData.slice(0, 5)).map((item, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="py-2 px-4 border-b">{item.productName}</td>
                  <td className="py-2 px-4 border-b text-center">{item.orderQuantity}</td>
                  <td className="py-2 px-4 border-b text-right">{formatCurrency(item.totalAmount)}</td>
                  <td className="py-2 px-4 border-b text-right">{formatCurrency(item.commission)}</td>
                  <td className="py-2 px-4 border-b text-right">{formatCurrency(item.netIncome)}</td>
                  <td className="py-2 px-4 border-b">{new Date(item.orderDate).toLocaleDateString()}</td>
                  <td className="py-2 px-4 border-b">
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.orderStatus === 'Completed' ? 'bg-green-100 text-green-800' : 
                      item.orderStatus === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                      item.orderStatus === 'Cancelled' ? 'bg-red-100 text-red-800' : 
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.orderStatus}
                    </span>
                  </td>
                  <td className="py-2 px-4 border-b">
                    <div>{item.customer}</div>
                    <div className="text-xs text-gray-500">{item.email}</div>
                  </td>
                </tr>
              ))}
              {sortedData.length === 0 && (
                <tr>
                  <td colSpan="8" className="py-4 text-center text-gray-500">No income data found for the selected period</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IncomeReportDashboard;