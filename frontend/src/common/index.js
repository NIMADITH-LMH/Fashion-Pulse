// import countAddToCartProduct from "../../../backend/controller/user/countOfAddToCartProduct"
import addToCart from "../helpers/addToCart"
import axios from "axios";

// Function to fetch cart product count
export const fetchCartCount = async () => {
    try {
        const response = await axios.get("http://localhost:8080/api/cart/count-of-cart");
        return response.data.count;
    } catch (error) {
        console.error("Error fetching cart count:", error);
        return 0;
    }
};

const backendDomin = "http://localhost:8080"

// Configure axios defaults
axios.defaults.withCredentials = true;
export const getSalesReport = async (startDate, endDate) => {
    const { data } = await axios.get(`${backendDomin}/sales-report`, {
      params: { startDate, endDate },
    });
    return data;
  };
  
  export const downloadPDFReport = async (startDate, endDate) => {
    window.open(`${backendDomin}/download/pdf?startDate=${startDate}&endDate=${endDate}`);
  };
  
  export const downloadExcelReport = async (startDate, endDate) => {
    window.open(`${backendDomin}/download/excel?startDate=${startDate}&endDate=${endDate}`);
  };
const SummaryApi = {
    SignUP : {
        url : `${backendDomin}/api/signup`,
        method : "post"
    },
    signIn : {
        url : `${backendDomin}/api/signin`,
        method : "post"
    },
    current_user : {
        url : `${backendDomin}/api/user-details`,
        method : "get"
    },
    logout_user : {
        url : `${backendDomin}/api/userLogout`,
        method : 'get'
    },
    allUser : {
        url : `${backendDomin}/api/all-user`,
        method : 'get'
    },
    updateUser : {
        url : `${backendDomin}/api/update-user`,
        method : "post"
    },
    uploadProduct : {
        url : `${backendDomin}/api/upload-product`,
        method : 'post'
    },
    allProductSeller:{
        url : `${backendDomin}/api/all-product-seller`,
        method : 'get'
    },
    allProduct : {
        url : `${backendDomin}/api/get-product`,
        method : 'get'
    },
    updateProduct : {
        url : `${backendDomin}/api/update-product`,
        method  : 'post'
    },
    categoryProduct : {
        url : `${backendDomin}/api/get-categoryProduct`,
        method : 'get'
    },
    categoryWiseProduct : {
        url : `${backendDomin}/api/category-product`,
        method : 'post'
    },
    productDetails : {
        url : `${backendDomin}/api/product-details`,
        method : 'post'
    },
    addToCartProduct : {
        url : `${backendDomin}/api/add-to-cart`,
        method : 'post'
    },
    addToCartProductCount : {
        url : `${backendDomin}/api/count-of-cart`,
        method : 'get'
    },
    addToCartProductView : {
        url : `${backendDomin}/api/view-cart-product`,
        method : 'get'
    },
    updateCartProduct : {
        url : `${backendDomin}/api/update-cart-product`,
        method : 'post'
    },
    deleteCartProduct : {
        url : `${backendDomin}/api/delete-cart-product`,
        method : 'post'
    },
    clearCartAfterPayment: {
        url: `${backendDomin}/api/clear-cart-after-payment`,
        method: 'post'
    },
    createOrdersAfterPayment: {
        url: `${backendDomin}/api/create-orders-after-payment`,
        method: 'post'
    },
    createTestOrder: {
        url: `${backendDomin}/api/create-test-order`,
        method: 'post'
    },
    createMinimalOrder: {
        url: `${backendDomin}/api/create-minimal-order`,
        method: 'post'
    },
    refreshCartCount: {
        url: `${backendDomin}/api/refresh-cart-count`,
        method: 'get'
    },
    fetchCategoryWiseProduct : {
        url : `${backendDomin}/api/category-product`,
        method : 'post'
    },
    sellerSpecificProduct:{
        url:`${backendDomin}/api/specific-seller-product`,
        method:'get'
    },
    deleteProduct: {
        url: `${backendDomin}/api/delete-product`,
        method: 'POST'
    },
    addReservation : {
        url : `${backendDomin}/api/add-reservation`,
        method : 'POST'
    },
    payment : {
        url : `${backendDomin}/api/create-checkout-session`,
        method : 'POST'
    },
    searchProduct : {
        url : `${backendDomin}/api/search-products?q=`,
        method : 'GET'
    }
    ,
    getReservationDetails : {
        url : `${backendDomin}/api/get-reservation`,
        method : 'get'
    },
    updatereservation:{
        url:`${backendDomin}/api/update-reservation`,
        method : 'POST'
    },
    getgroupbyDetails:{
        url:`${backendDomin}/api/get-groupby-reservation`,
        method : 'get'
    },
    getOrderDetails:{
        url:`${backendDomin}/api/get-orders`,
        method : 'get'
    },
    updateOrderStatus:{
        url:`${backendDomin}/api/update-order-status`,
        method : 'POST'
    }
    ,
    generateBalanceSheet : {
        url : `${backendDomin}/api/generate-balance-sheet`,
        method : 'get'
    },
    createBid:{
        url:`${backendDomin}/api/create-bid`,
        method : 'POST'
    },
    getBid:{
        url:`${backendDomin}/api/get-bid`,
        method : 'GET'
    },
    getBidbyspecific:{
        url:`${backendDomin}/api/get-bid-by-specific`,
        method : 'GET'
    },
    updateBid:{
        url:`${backendDomin}/api/update-bid`,
        method : 'POST'
    }, payment : {
        url : `${backendDomin}/api/create-checkout-session`,
        method : 'POST'
    },
    searchProduct : {
        url : `${backendDomin}/api/search-products?q=`,
        method : 'GET'
    } ,
    reserveSummary:{
        url:`${backendDomin}/api/summary-reserve`,
        method:'GET'
    },
    exporexcel:{
        url:`${backendDomin}/api/export-reserve-excel`,
        method:'GET'
    },
    exportpdfreserve:{
        url:`${backendDomin}/api/export-pdf-reserve`,
        method:'GET'
    }
    ,
    getShopDetails:{
        url:`${backendDomin}/api/get-shop-details`,
        method:'GET'
    },
    getSellerLocation:{
        url:`${backendDomin}/api/get-seller-location`,
        method:'GET'
    }
   ,
   sellerSalesOverView:{
        url:`${backendDomin}/api/get-seller-sales-overview`,
        method:'GET'
   }
   ,
   orderIncomeReport:{
    url:`${backendDomin}/api/get-income-order-report`,
    method:'GET'
   }
   ,closeBidReport:{
    url:`${backendDomin}/api/get-bide-report`,
    method:'POST'
   }
   ,getWinningBid:{
    url:`${backendDomin}/api/get-winning-bid`,
    method:'GET'
   },
   getReservationRevenue:{
    url:`${backendDomin}/api/get-reservation-revenue-by-shop`,
    method:'GET'
   }
   ,getprocessClosedout:{
    url:`${backendDomin}/api/process-closeouts`,
    method:'POST'
   }
   ,getBidIncomeStats:{
    url:`${backendDomin}/api/bid-income-stats`,
    method:'GET'
   },getSellerComment:{
    url:`${backendDomin}/shop/:shopId`,
    method:'GET'
   }
   ,getAllUserDetails:{
    url:`${backendDomin}/api/get-all-users`,
    method:'GET'
   }
   ,getToggleUserStatus:{
    url:`${backendDomin}/api/toggle-block-user/:userId`,
    method:'POST'
   }
   ,deleteUser:{
    url:`${backendDomin}/api/delete-user/:userId`,
    method:'DELETE'
   }
    ,assignUserRole:{
     url:`${backendDomin}/api/assign-role/:userId`,
     method:'POST'
    },
    exportuser:{
        url:`${backendDomin}/api/export-users`,
        method:'GET'
    },
   



}



export default SummaryApi  ;