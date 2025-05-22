import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { format } from 'date-fns';

const backendDomain = "http://localhost:8080/api";

function BidManagementSystem() {
  // State variables
  const [bids, setBids] = useState([]);
  const [currentBid, setCurrentBid] = useState(null);
  const [loading, setBidLoading] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const [newCloseDate, setNewCloseDate] = useState('');
  const [disputeData, setDisputeData] = useState({
    userId: '',
    bidAmount: ''
  });
  const [reportParams, setReportParams] = useState({
    status: '',
    startDate: '',
    endDate: '',
    format: 'pdf'
  });
  const [activeTab, setActiveTab] = useState('bids');

  // Fetch all bids on component mount and when filter changes
  useEffect(() => {
    fetchBids();
  }, [filterStatus]);

  const fetchBids = async () => {
    try {
      setBidLoading(true);
      const url = `${backendDomain}/get-all-admin${filterStatus ? `?status=${filterStatus}` : ''}`;
      const response = await axios.get(url);
      
      if (response.data.success) {
        setBids(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch bids');
      }
    } catch (error) {
      console.error('Error fetching bids:', error);
      toast.error('Failed to fetch bids. Please try again.');
    } finally {
      setBidLoading(false);
    }
  };

  const fetchBidDetails = async (bidId) => {
    try {
      setDetailsLoading(true);
      const response = await axios.get(`${backendDomain}/get-bid-details/${bidId}`);
      
      if (response.data.success) {
        setCurrentBid(response.data.data);
      } else {
        toast.error(response.data.message || 'Failed to fetch bid details');
      }
    } catch (error) {
      console.error('Error fetching bid details:', error);
      toast.error('Failed to fetch bid details. Please try again.');
    } finally {
      setDetailsLoading(false);
    }
  };

  const updateBidDuration = async (bidId) => {
    if (!newCloseDate) {
      toast.warning('Please select a new close date');
      return;
    }

    try {
      const response = await axios.put(`${backendDomain}/update-bid-duration/${bidId}`, {
        closeDate: newCloseDate
      });
      
      if (response.data.success) {
        toast.success('Bid duration updated successfully');
        fetchBids();
        if (currentBid && currentBid._id === bidId) {
          fetchBidDetails(bidId);
        }
        setNewCloseDate('');
      } else {
        toast.error(response.data.message || 'Failed to update bid duration');
      }
    } catch (error) {
      console.error('Error updating bid duration:', error);
      toast.error('Failed to update bid duration. Please try again.');
    }
  };

  const archiveCompletedBids = async () => {
    try {
      const response = await axios.put(`${backendDomain}/archive-completed-bids`);
      
      if (response.data.success) {
        toast.success('Completed bids archived successfully');
        fetchBids();
      } else {
        toast.error(response.data.message || 'Failed to archive bids');
      }
    } catch (error) {
      console.error('Error archiving bids:', error);
      toast.error('Failed to archive bids. Please try again.');
    }
  };

  const resolveDispute = async () => {
    if (!currentBid) {
      toast.warning('Please select a bid first');
      return;
    }

    if (!disputeData.userId || !disputeData.bidAmount) {
      toast.warning('Please fill all dispute resolution fields');
      return;
    }

    try {
      const response = await axios.post(`${backendDomain}/resolve-dispute`, {
        bidId: currentBid._id,
        userId: disputeData.userId,
        bidAmount: parseFloat(disputeData.bidAmount)
      });
      
      if (response.data.success) {
        toast.success('Dispute resolved successfully');
        fetchBids();
        setCurrentBid(null);
        setDisputeData({ userId: '', bidAmount: '' });
      } else {
        toast.error(response.data.message || 'Failed to resolve dispute');
      }
    } catch (error) {
      console.error('Error resolving dispute:', error);
      toast.error('Failed to resolve dispute. Please try again.');
    }
  };

  const generateReport = async () => {
    try {
      const { status, startDate, endDate, format } = reportParams;
      
      if (!startDate || !endDate) {
        toast.warning('Please select both start and end dates');
        return;
      }

      // Create URL with query parameters
      let url = `${backendDomain}/generate-bid-report?format=${format}`;
      if (status) url += `&status=${status}`;
      if (startDate) url += `&startDate=${startDate}`;
      if (endDate) url += `&endDate=${endDate}`;

      // For PDF/Excel, open in new tab for download
      window.open(url, '_blank');
      toast.success(`${format.toUpperCase()} report generated successfully`);
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate report. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return format(new Date(dateString), 'MMM dd, yyyy h:mm a');
  };

  const getHighestBid = (bidders) => {
    if (!bidders || bidders.length === 0) return 0;
    return Math.max(...bidders.map(b => b.bidAmount));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Header */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Bid Management System</h1>
        <p className="text-gray-600">Manage bids, resolve disputes, and generate reports</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-gray-200 mb-6">
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'bids' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('bids')}
        >
          Bids Management
        </button>
        <button 
          className={`px-4 py-2 font-medium ${activeTab === 'reports' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => setActiveTab('reports')}
        >
          Reports
        </button>
      </div>

      {activeTab === 'bids' && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Panel - Bids List */}
          <div className="lg:w-1/2">
            <div className="bg-white shadow rounded-lg p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">Bids List</h2>
                <div className="flex gap-2">
                  <select 
                    className="border rounded-md px-3 py-2 text-sm"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">All Bids</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button 
                    className="bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-md text-sm"
                    onClick={archiveCompletedBids}
                  >
                    Archive Completed
                  </button>
                  <button 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-md text-sm"
                    onClick={fetchBids}
                  >
                    Refresh
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading bids...</p>
                </div>
              ) : bids.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg">
                  <p className="text-gray-500">No bids found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Start Price</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Close Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {bids.map(bid => (
                        <tr key={bid._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{bid.productID?.productName || 'Unknown'}</div>
                            <div className="text-sm text-gray-500">{bid.productID?.brandName || 'Unknown'}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <div className="text-sm text-gray-900">LKR. {bid.startPrice.toFixed(2)}</div>
                            <div className="text-xs text-gray-500">Highest: ${getHighestBid(bid.bidder).toFixed(2)}</div>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bid.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                              {bid.status}
                            </span>
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(bid.closeDate)}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <button 
                              className="text-blue-600 hover:text-blue-900 mr-2"
                              onClick={() => fetchBidDetails(bid._id)}
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
          </div>

          {/* Right Panel - Bid Details / Actions */}
          <div className="lg:w-1/2">
            {!currentBid ? (
              <div className="bg-white shadow rounded-lg p-6 text-center py-16">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No Bid Selected</h3>
                <p className="mt-1 text-gray-500">Select a bid from the list to view details and perform actions</p>
              </div>
            ) : detailsLoading ? (
              <div className="bg-white shadow rounded-lg p-6 text-center py-16">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading bid details...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Bid Details Card */}
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800">Bid Details</h2>
                      <p className="text-gray-500 text-sm">ID: {currentBid._id}</p>
                    </div>
                    <span className={`px-3 py-1 text-sm font-semibold rounded-full ${currentBid.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {currentBid.status}
                    </span>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Product</h3>
                      <p className="text-base font-semibold">{currentBid.productID?.productName || 'Unknown'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Brand</h3>
                      <p className="text-base font-semibold">{currentBid.productID?.brandName || 'Unknown'}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Start Price</h3>
                      <p className="text-base font-semibold">LKR. {currentBid.startPrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Close Date</h3>
                      <p className="text-base font-semibold">{formatDate(currentBid.closeDate)}</p>
                    </div>
                  </div>

                  {/* Update Bid Duration */}
                  {currentBid.status === 'active' && (
                    <div className="mt-6 border-t pt-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Update Bid Duration</h3>
                      <div className="flex gap-2">
                        <input
                          type="datetime-local"
                          className="border rounded-md px-3 py-2 w-full"
                          value={newCloseDate}
                          onChange={(e) => setNewCloseDate(e.target.value)}
                        />
                        <button 
                          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md"
                          onClick={() => updateBidDuration(currentBid._id)}
                        >
                          Update
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Bidders List Card */}
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Bidders List</h2>
                  
                  {currentBid.bidder && currentBid.bidder.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bidder</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Bid Amount</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentBid.bidder.map((bid, index) => (
                            <tr key={index} className="hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <div className="flex items-center">
                                  {bid.userID?.profilePic ? (
                                    <img className="h-8 w-8 rounded-full mr-2" src={bid.userID.profilePic} alt="" />
                                  ) : (
                                    <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center mr-2">
                                      <span className="text-xs font-medium text-gray-500">
                                        {bid.userID?.name?.charAt(0) || 'U'}
                                      </span>
                                    </div>
                                  )}
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{bid.userID?.name || 'Unknown'}</div>
                                    <div className="text-sm text-gray-500">{bid.userID?.email || 'Unknown'}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                LKR. {bid.bidAmount.toFixed(2)}
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                {formatDate(bid.bidDate)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-4 bg-gray-50 rounded-lg">
                      <p className="text-gray-500">No bidders yet</p>
                    </div>
                  )}
                </div>

                {/* Resolve Dispute Card (Only for completed bids) */}
                {currentBid.status === 'completed' && (
                  <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Resolve Dispute</h2>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Select Winner</label>
                        <select
                          className="border rounded-md px-3 py-2 w-full"
                          value={disputeData.userId}
                          onChange={(e) => setDisputeData({...disputeData, userId: e.target.value})}
                        >
                          <option value="">Select a bidder</option>
                          {currentBid.bidder.map((bid, index) => (
                            <option key={index} value={bid.userID?._id}>
                              {bid.userID?.name || 'Unknown'} (${bid.bidAmount.toFixed(2)})
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Final Bid Amount</label>
                        <input
                          type="number"
                          className="border rounded-md px-3 py-2 w-full"
                          value={disputeData.bidAmount}
                          onChange={(e) => setDisputeData({...disputeData, bidAmount: e.target.value})}
                          placeholder="Enter final amount"
                        />
                      </div>
                      
                      <button 
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-md w-full"
                        onClick={resolveDispute}
                      >
                        Confirm Resolution
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">Generate Bid Reports</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status (Optional)</label>
              <select
                className="border rounded-md px-3 py-2 w-full"
                value={reportParams.status}
                onChange={(e) => setReportParams({...reportParams, status: e.target.value})}
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                className="border rounded-md px-3 py-2 w-full"
                value={reportParams.startDate}
                onChange={(e) => setReportParams({...reportParams, startDate: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                className="border rounded-md px-3 py-2 w-full"
                value={reportParams.endDate}
                onChange={(e) => setReportParams({...reportParams, endDate: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
              <div className="flex gap-2">
                <button
                  className={`flex-1 px-3 py-2 rounded-md ${reportParams.format === 'pdf' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setReportParams({...reportParams, format: 'pdf'})}
                >
                  PDF
                </button>
                <button
                  className={`flex-1 px-3 py-2 rounded-md ${reportParams.format === 'excel' ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-700'}`}
                  onClick={() => setReportParams({...reportParams, format: 'excel'})}
                >
                  Excel
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex justify-center">
            <button 
              className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-md"
              onClick={generateReport}
            >
              Generate Report
            </button>
          </div>
          
          <div className="mt-8 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Report Preview</h3>
            <div className="bg-gray-50 p-6 rounded-lg">
              <p className="text-center text-gray-500">
                The report will include all bids that match your criteria, including product information, pricing, status, and bidder counts.
              </p>
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Format: <span className="font-medium">{reportParams.format.toUpperCase()}</span></p>
                <p className="text-sm text-gray-600">
                  Date Range: <span className="font-medium">{reportParams.startDate || 'Any'} to {reportParams.endDate || 'Any'}</span>
                </p>
                <p className="text-sm text-gray-600">Status: <span className="font-medium">{reportParams.status || 'All'}</span></p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BidManagementSystem;