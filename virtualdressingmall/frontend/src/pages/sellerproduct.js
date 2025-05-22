import React, { useEffect, useState } from 'react';
import UploadProduct from '../components/UploadProduct';
import SummaryApi from '../common';
import SellerProductCard from '../components/SellerProductCard';
import { useSelector } from 'react-redux';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const SellerProduct = () => {
  const user = useSelector((state) => state?.user?.user);

  const [openUploadProduct, setOpenUploadProduct] = useState(false);
  const [allProduct, setAllProduct] = useState([]);

  const fetchAllProduct = async () => {
    try {
      const response = await fetch(SummaryApi.allProductSeller.url);
      const dataResponse = await response.json();

      console.log('product data', dataResponse);

      // Ensure dataResponse.data is an array
      if (Array.isArray(dataResponse?.data)) {
        // Filter the products by ShopID
        const filteredProducts = dataResponse.data.filter(product => product.ShopID === user?._id);
        setAllProduct(filteredProducts);
      } else {
        console.error('Unexpected data format:', dataResponse);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    if (user?._id) {
      fetchAllProduct();
    }
  }, [user?._id]); // Refetch when the user._id changes

  // Function to generate PDF report
  const generateProductReport = () => {
    const doc = new jsPDF();
    
    // Set title and header
    doc.setFontSize(18);
    doc.text("Products Inventory Report", 20, 20);
    
    // Add shop details
    doc.setFontSize(12);
    doc.text(`Shop: ${user?.name || 'N/A'}`, 20, 30);
    doc.text(`Email: ${user?.email || 'N/A'}`, 20, 35);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 40);
    
    // Add line separator
    doc.setLineWidth(0.5);
    doc.line(20, 45, 190, 45);

    // Create table with product data
    const tableColumn = ["Product Name", "Category", "Status", "Price", "Stock"];
    const tableRows = [];

    allProduct.forEach(product => {
      // Calculate total stock by summing up quantity from Size array
      const totalStock = product.Size.reduce((sum, sizeItem) => sum + (parseInt(sizeItem.quantity) || 0), 0);
      
      // Get the price from the first size entry's price property
      const price = product.Size && product.Size.length > 0 ? product.Size[0].price : 'N/A';
      
      const productData = [
        product.productName,
        product.category,
        product.status,
        price, // This should now correctly display the price
        totalStock || 'N/A'
      ];
      
      tableRows.push(productData);
    });

    // Generate the table
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 50,
      theme: 'grid',
      styles: { 
        fontSize: 10,
        cellPadding: 3,
        halign: 'center' 
      },
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [240, 240, 240]
      }
    });

    // Add summary information
    const finalY = doc.lastAutoTable.finalY || 150;
    doc.text(`Total Products: ${allProduct.length}`, 20, finalY + 10);
    
    // Calculate total inventory value - now correctly using the price and quantity properties
    const totalValue = allProduct.reduce((sum, product) => {
      return sum + product.Size.reduce((sizeSum, sizeItem) => {
        return sizeSum + (parseFloat(sizeItem.price || 0) * (parseInt(sizeItem.quantity) || 0));
      }, 0);
    }, 0);
    
    doc.text(`Total Inventory Value: LKR. ${totalValue.toFixed(2)}`, 20, finalY + 20);
    
    // Add footer
    doc.setFontSize(10);
    doc.text("This is an automatically generated report. For any queries, please contact support.", 20, finalY + 30);
    
    // Save the PDF
    doc.save(`product-inventory-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div>
      <div className='bg-white py-2 px-4 flex justify-between items-center'>
        <h2 className='font-bold text-lg'>Product</h2>
        <div className="flex gap-2">
          <button
            className='border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white transition-all py-1 px-3 rounded-full'
            onClick={generateProductReport}
          >
            Generate Report
          </button>
          <button
            className='border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all py-1 px-3 rounded-full'
            onClick={() => setOpenUploadProduct(true)}
          >
            Upload Product
          </button>
        </div>
      </div>

      {/**all product */}
      <div className='flex items-start flex-wrap gap-2 py-2 '>
        {allProduct.map((product, index) => (
          <SellerProductCard data={product} key={index + 'allProduct'} fetchdata={fetchAllProduct} />
        ))}
      </div>

      {/**upload product component */}
      {openUploadProduct && (
        <UploadProduct onClose={() => setOpenUploadProduct(false)} fetchData={fetchAllProduct} />
      )}
    </div>
  );
};

export default SellerProduct;