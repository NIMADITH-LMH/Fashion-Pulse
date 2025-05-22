import React from "react";
import Dashboard from "../components/Dashboard";
import SalesReport from "../components/SalesReport";
import DownloadReports from "../components/DownloadReports";

const SellerView = () => {
  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Dashboard />
      <SalesReport />
      <DownloadReports />
    </div>
  );
};

export default SellerView;
