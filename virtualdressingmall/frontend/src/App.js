import './App.css';
import { Outlet } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useEffect, useState } from 'react';
import SummaryApi from './common';
import AppContext from './context';
import { useDispatch, useSelector } from 'react-redux';
import { setUserDetails, selectToken, selectUser } from './store/userSlice';
import axios from 'axios';

// Configure axios defaults
axios.defaults.withCredentials = true;

function App() {
  const dispatch = useDispatch();
  const token = useSelector(selectToken);
  const user = useSelector(selectUser);
  const [cartProductCount, setCartProductCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Configure axios auth header whenever token changes
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(SummaryApi.current_user.url);
      
      if (response.data.success && response.data.data) {
        // Keep the existing token when updating user details
        dispatch(setUserDetails({ ...response.data.data, token }));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error fetching user details:', error);
      if (error.response?.status === 401) {
        // Clear auth header on 401
        delete axios.defaults.headers.common['Authorization'];
      }
      return false;
    }
  };

  const fetchUserAddToCart = async () => {
    if (!token || !user?._id) return;
    
    try {
      const response = await axios.get(SummaryApi.addToCartProductCount.url);
      
      if (response.data?.data?.count !== undefined) {
        setCartProductCount(response.data.data.count);
      }
    } catch (error) {
      console.error('Error fetching cart count:', error);
      if (error.response?.status === 401) {
        setCartProductCount(0);
      }
    }
  };

  useEffect(() => {
    const initializeApp = async () => {
      setIsLoading(true);
      try {
        // Only try to fetch user details if we have a token
        if (token) {
          const isValid = await fetchUserDetails();
          if (isValid) {
            await fetchUserAddToCart();
          }
        }
      } catch (error) {
        console.error('Error initializing app:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, [token]); // Re-run when token changes

  // Fetch cart count whenever user or token changes
  useEffect(() => {
    if (token && user?._id) {
      fetchUserAddToCart();
    }
  }, [token, user?._id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <AppContext.Provider value={{
      fetchUserDetails,
      cartProductCount,
      fetchUserAddToCart
    }}>
      <ToastContainer position='top-center' />
      <Header />
      <main className='min-h-[calc(100vh-120px)] pt-40'>
        <Outlet />
      </main>
      <Footer />
    </AppContext.Provider>
  );
}

export default App;