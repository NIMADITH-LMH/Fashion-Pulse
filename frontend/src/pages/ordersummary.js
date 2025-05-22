import { useEffect, useState } from "react";
import axios from "axios";
import SummaryApi from "../common";

const FinancialDashboard = () => {
    const [summary, setSummary] = useState({ totalRevenue: 0, totalReservations: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await axios.get(SummaryApi.reserveSummary.url);
                setSummary(response.data);
            } catch (err) {
                setError(err.message || "Failed to fetch summary data");
                console.error("Error fetching summary:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const downloadExcel = () => {
        window.location.href = SummaryApi.exporexcel.url;
    };

    const downloadPDF = () => {
        window.location.href = SummaryApi.exportpdfreserve.url;
    };

    if (loading) {
        return (
            <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
                <div className="text-xl">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-6 bg-gray-100 min-h-screen flex items-center justify-center">
                <div className="text-xl text-red-500">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-100 min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Financial Dashboard</h1>
            <div className="bg-white p-4 shadow-md rounded-lg">
                <p className="text-lg">Total Revenue: ${summary.totalRevenue}</p>
                <p className="text-lg">Total Reservations: {summary.totalReservations}</p>
                <div className="mt-4">
                    <button className="bg-blue-500 text-white px-4 py-2 mr-2 rounded" onClick={downloadExcel}>
                        Download Excel
                    </button>
                    <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={downloadPDF}>
                        Download PDF
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FinancialDashboard;