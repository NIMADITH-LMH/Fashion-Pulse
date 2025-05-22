import{createBrowserRouter} from 'react-router-dom'
import App from '../App'
import Home from '../pages/Home'
import Login from '../pages/Login'
import ForgotPassword from '../pages/forgotpassword'
import SignUp from '../pages/signUp'
import AdminPanel from '../pages/AdminPanel'
import AllUsers from '../pages/AllUsers'
import AllProducts from '../pages/AllProducts'
import CategeoryProduct from '../pages/CategeoryProduct'
import ProductDetails from '../pages/ProductDetails'
import SellerProduct from '../pages/sellerproduct'
import Shopdetails from '../pages/shopdetails'
import UserProduct from '../pages/UserProduct'
import ViewProductFull from '../pages/ViewProductFull'
import OrderCheckout from '../pages/OrderCheckout'
import SellerDashboard from '../pages/SellerPanel'
import Overview from '../components/Overview'
import OrderPage from '../pages/OrderPage'
import SearchProduct from '../pages/SearchProduct'
import Cancel from '../pages/Cancel'
import Success from '../pages/Success'
import Cart from '../pages/Cart'
import SellerReservation from '../components/SellerReservationProduct'
import SellerOrders from '../components/SellerOrders'
import GenerateBalance from '../components/generateBalancesheet'
import PutABid from '../components/putAbid'
import UserBid from '../components/userBid'
import PlaceBidPage from '../components/placeBidComponent'
import Profile from '../pages/Profile'
import SellerView from '../pages/SellerView'
import ReserveSummary from '../pages/ordersummary'
import ErrorBoundary from '../components/ErrorBoundary'
import ShopProduct from '../pages/shopProduct'
import SellerSalesOverview from '../components/SalesOverview'
import IncomeReportDashboard from '../components/IncomeReportDashboard'
import ReservationRevenue from '../components/reservationRevenue'
import BidInncomeDashboard from '../components/BidincomeDashboard'
import SellerDashboardReview from '../pages/SellerDashboardReview'
import AdminUserDetails from '../components/adminusermanagement'
import ProductManagement from '../components/productmanagement'
import OrderManagement from '../components/ordermanagement'
import Bidmanagement from '../components/bidmanagement'
import ReservationManagement from '../components/reservationmanagement'
import CommonManagment from '../components/commentmanagement'
import AdminBidIncome from '../components/bidsaleincomeadmin'
import AdminReservation from '../components/adminreservationincome'
import RevenueSummary from '../components/RevenueSummaryDashboard'
import AnalyticsDashboard from '../components/AnalyticsDashboard'

import { elements } from 'chart.js'
const router = createBrowserRouter([
 {
     path:"/",
     element :<App/>,
     errorElement: <ErrorBoundary />,
     children:[
         {
             path:"",
             element:<Home/>
         },
         {
             path:"login",
             element:<Login/>
         },
         {
             path:"forgot-password",
             element:<ForgotPassword/>
         },
         {
             path:"sign-up",
             element:<SignUp/>
         },
         {
             path:"product-category/:categoryName",
             element:<CategeoryProduct/>
         },
         {
             path:"product/:id",
             element:<ProductDetails/>
         },
         {
            path : 'cart',
            element : <Cart/>
         },
         {
            path : 'checkout',
            element : <OrderCheckout/>
         },
         {
            path : 'profile',
            element : <Profile/>
         },
         {
            path : 'success',
            element : <Success/>
         },
         {
            path : 'cancel',
            element : <Cancel/>
         },
         {
            path : 'search',
            element : <SearchProduct/>
         }, 
         {
            path : 'order',
            element : <OrderPage/>
         },
         {
             path:"admin-panel",
             element:<AdminPanel/>,
             children:[
                 
                 {
                     path:"all-products",
                     element:<AllProducts/>
                 },
                 {
                     path:"admin-user-details",
                     element:<AdminUserDetails/>
                 }
                 ,{
                     path:"product-management",
                     element:<ProductManagement/>
                 }
                    ,{
                     path:"order-management",
                     element:<OrderManagement/> 
                 },{
                    path:"bid-management",
                    element:<Bidmanagement/>
                 }
                 ,{
                     path:"reservation-management",
                     element:<ReservationManagement/>
                 }
                 ,{
                     path:"comment-management",
                     element:<CommonManagment/>}
                ,{
                    path:"Bid-income-admin",
                    element:<AdminBidIncome/>
                }
                ,{
                    path:"reservation-income-admin",
                    element:<AdminReservation/>
                }
                ,{
                    path:"revenue",
                    element:<RevenueSummary/>
                }
                ,{
                    path:"analytic-part",
                    element:<AnalyticsDashboard/>
                }
             ]
         },
         {
            path:"shop-product",
            element:<SellerProduct/>
         },
         {
            path:"shop-details",
            element:<Shopdetails/>
         },
         {
            path:"shop-products",
            element:<ShopProduct/>
         },
         {
            path:"user-product",
            element:<UserProduct/>
         },
         {
            path:"view-product/:id",
            element:<ViewProductFull/>
         },
         {
            path:"seller-dashboard",
            element:<SellerDashboard/>
         },
         {
            path:"seller-dashboard",
            element:<SellerDashboard/>,
            errorElement: <ErrorBoundary />,
            children:[
                {
                    path:"shop-product",
                    element:<SellerProduct/>
                },
                {
                    path:"overview",
                    element:<Overview/>
                },{
                    path:"reservation",
                    element:<SellerReservation/>
                },{
                    path:"seller-order",
                    element:<SellerOrders/>
                },
                {
                    path:"generate-balance",
                    element:<GenerateBalance/>
                },{
                    path:"put-a-bid",
                    element:<PutABid/>
                },
                {
                    path:"seller-view",
                    element:<SellerView/>
                },{
                    path:"seller-reserve-summary",
                    element:<ReserveSummary/>,
                    errorElement: <ErrorBoundary />
                }
                ,{
                    path:"seller-sales-overview",
                    element:<SellerSalesOverview/>
                    
                },
                {
                    path:"seller-income-report",
                    element:<IncomeReportDashboard/>
                },
                {
                    path:"reservation-revenue",
                    element:<ReservationRevenue/>
                }
                ,{
                    path:"bid-dashboard",
                    element:<BidInncomeDashboard/>
                },
                {
                    path:"review",
                    element:<SellerDashboardReview/>
                }
               
                

            ]

         },{
            path:"user-bid",
            element:<UserBid/>
         },{
            path:"placeBid/:productId",
            element:<PlaceBidPage/>
         }
     ]
}])

export default router;