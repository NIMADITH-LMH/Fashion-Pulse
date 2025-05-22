import React, { useState, useEffect } from "react";
import axios from "axios";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Download, Filter, RefreshCw, Users, Store } from "lucide-react";

const backendDomain = "http://localhost:8080/api";

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [exportFormat, setExportFormat] = useState("json");
  const [showExportOptions, setShowExportOptions] = useState(false);

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d", "#ffc658", "#8dd1e1", "#a4de6c", "#d0ed57"];

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${backendDomain}/customer-seller`);
      setAnalytics(response.data);
      setError(null);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError("Failed to load analytics data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = (format) => {
    window.open(`${backendDomain}/customer-seller?format=${format}`, '_blank');
    setShowExportOptions(false);
  };

  const prepareSellerChartData = () => {
    if (!analytics || !analytics.topSellers) return [];
    
    return analytics.topSellers.map((seller, index) => ({
      name: seller.name.length > 15 ? seller.name.substring(0, 15) + "..." : seller.name,
      productCount: seller.productCount,
      fullName: seller.name,
      email: seller.email
    }));
  };

  const sellerChartData = prepareSellerChartData();

  const renderSellerDetails = (seller) => {
    return (
      <div key={seller.email} className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow">
        <h3 className="font-semibold text-lg text-gray-800">{seller.name}</h3>
        <p className="text-gray-600 text-sm">{seller.email}</p>
        <div className="mt-2 flex items-center">
          <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
            {seller.productCount} products
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        <p className="mt-4 text-gray-600">Loading analytics data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded">
          <p className="text-red-700">{error}</p>
        </div>
        <button 
          onClick={fetchAnalytics}
          className="mt-4 flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
          <RefreshCw size={16} className="mr-2" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Customer & Seller Analytics</h1>
          <div className="relative">
            <button 
              onClick={() => setShowExportOptions(!showExportOptions)}
              className="flex items-center px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              <Download size={16} className="mr-2" />
              Export
            </button>
            {showExportOptions && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10">
                <div className="py-1">
                  <button 
                    onClick={() => handleExport('pdf')}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Export as PDF
                  </button>
                  <button 
                    onClick={() => handleExport('excel')}
                    className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                  >
                    Export as Excel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex border-b">
            <button
              className={`py-4 px-6 text-center ${activeTab === "overview" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={`py-4 px-6 text-center ${activeTab === "sellers" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("sellers")}
            >
              Top Sellers
            </button>
            <button
              className={`py-4 px-6 text-center ${activeTab === "buyers" ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("buyers")}
            >
              Buyers
            </button>
          </div>

          <div className="p-6">
            {activeTab === "overview" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center mb-4">
                    <Users size={24} className="text-blue-500 mr-2" />
                    <h2 className="text-lg font-semibold">Unique Buyers</h2>
                  </div>
                  <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                      <p className="text-5xl font-bold text-blue-600">{analytics.totalUniqueBuyers}</p>
                      <p className="text-gray-500 mt-2">Total unique customers</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow">
                  <div className="flex items-center mb-4">
                    <Store size={24} className="text-green-500 mr-2" />
                    <h2 className="text-lg font-semibold">Top Sellers</h2>
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={sellerChartData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="productCount"
                          nameKey="name"
                          label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        >
                          {sellerChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          formatter={(value, name, props) => [value, props.payload.fullName]}
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-2 border border-gray-200 rounded shadow-md">
                                  <p className="font-medium">{payload[0].payload.fullName}</p>
                                  <p className="text-gray-600 text-sm">{payload[0].payload.email}</p>
                                  <p className="font-medium text-blue-600">{payload[0].value} products</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "sellers" && (
              <div>
                <div className="mb-6">
                  <h2 className="text-xl font-semibold mb-4">Top Sellers by Products Listed</h2>
                  <div className="h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={sellerChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="name" 
                          angle={-45} 
                          textAnchor="end"
                          height={70}
                          tick={{ fontSize: 12 }}
                        />
                        <YAxis />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white p-2 border border-gray-200 rounded shadow-md">
                                  <p className="font-medium">{payload[0].payload.fullName}</p>
                                  <p className="text-gray-600 text-sm">{payload[0].payload.email}</p>
                                  <p className="font-medium text-blue-600">{payload[0].value} products</p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Legend />
                        <Bar dataKey="productCount" fill="#3b82f6" name="Products Listed" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="mt-8">
                  <h2 className="text-xl font-semibold mb-4">Seller Details</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {analytics.topSellers.map(seller => renderSellerDetails(seller))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "buyers" && (
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-blue-100 mb-6">
                  <Users size={48} className="text-blue-500" />
                </div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">{analytics.totalUniqueBuyers}</h2>
                <p className="text-xl text-gray-600">Total Unique Buyers</p>
                <div className="mt-8 max-w-md mx-auto">
                  <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-yellow-700">
                          Detailed buyer information is not available in this view for privacy reasons.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;