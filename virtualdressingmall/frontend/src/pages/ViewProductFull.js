import React, { useState, useEffect } from "react";
import SummaryApi from "../common";
import { useParams } from "react-router-dom";
import Product from "../components/ProductPage";

const ProductPage = () => {
  const { id } = useParams();
  const [allProduct, setAllProduct] = useState([]);
  const [filteredProduct, setFilteredProduct] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAllProduct = async () => {
    try {
      const response = await fetch(SummaryApi.allProduct.url);
      const dataResponse = await response.json();

      console.log("Product Data:", dataResponse);

      if (Array.isArray(dataResponse?.data)) {
        setAllProduct(dataResponse.data);
      } else {
        console.error("Unexpected data format:", dataResponse);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllProduct();
  }, []); // Fetch products on component mount

  useEffect(() => {
    // Filter the products by the ID from URL params
    const filtered = allProduct.filter((product) => product._id === id);
    setFilteredProduct(filtered);
  }, [allProduct, id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (filteredProduct.length === 0) {
    return (
      <div className="max-w-8xl mx-auto p-6">
        <div className="text-center text-lg">
          Product not found
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto p-6 grid gap-12">
      {filteredProduct.map((product, index) => (
        <div key={index} className="border rounded-lg shadow-sm p-4">
          <Product data={product} fetchdata={fetchAllProduct} />
        </div>
      ))}
    </div>
  );
};

export default ProductPage;
