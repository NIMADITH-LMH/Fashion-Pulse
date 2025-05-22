import React, { useState } from "react";
import { downloadPDFReport, downloadExcelReport } from "../common/index";

const DownloadReports = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  return (
    <div className="p-6 bg-white shadow-lg rounded-lg mt-4">
      <h2 className="text-2xl font-semibold mb-4">📜 Download Reports</h2>
      <div className="flex gap-4">
        <input
          type="date"
          className="border p-2 rounded"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          className="border p-2 rounded"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>
      <div className="flex gap-4 mt-4">
        <button
          className="bg-red-500 text-white px-4 py-2 rounded"
          onClick={() => downloadPDFReport(startDate, endDate)}
        >
          Download PDF
        </button>
        <button
          className="bg-green-500 text-white px-4 py-2 rounded"
          onClick={() => downloadExcelReport(startDate, endDate)}
        >
          Download Excel
        </button>
      </div>
    </div>
  );
};

export default DownloadReports;
