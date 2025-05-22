import React, { useContext, useState, useEffect } from 'react';
import Logo from './Logo';
import { GrSearch } from "react-icons/gr";
import { Link, useNavigate } from 'react-router-dom';
import { FaRegCircleUser } from "react-icons/fa6";
import { FaShoppingCart } from "react-icons/fa";
import { useSelector, useDispatch } from 'react-redux';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import { clearUserDetails } from '../store/userSlice';
import role from '../common/role';
import AppContext from '../context';
import axios from 'axios';

const Header = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state?.user?.user);
  const token = useSelector((state) => state?.user?.token);
  const [menuDisplay, setMenuDisplay] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const { cartProductCount } = useContext(AppContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(() => {
    console.log('Header mounted - Current user:', user);
    console.log('Has token:', !!token);
  }, []);

  useEffect(() => {
    console.log('User state changed:', {
      id: user?._id,
      role: user?.role,
      hasToken: !!token
    });
  }, [user, token]);

  const handleLogout = async () => {
    try {
      await fetch(SummaryApi.logout_user.url);
      dispatch(clearUserDetails());
      toast.success('Logged out successfully');

      // Clear axios auth headers
      delete axios.defaults.headers.common['Authorization'];
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  const navigation=()=>{
    if(user?.role === role.SELLER){
      return (
        <nav className="bg-red-600 border-gray-200">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-2">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="block md:hidden text-white focus:outline-none"
            >
              ☰
            </button>

            {/* Navigation Links */}
            <div className={`${isOpen ? "block" : "hidden"} w-full md:flex md:w-auto`}>
              <ul className="flex flex-col md:flex-row md:space-x-8 font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-red-600 md:mt-0 md:border-0">
                <li>
                  <Link to="/seller-dashboard" className="block py-2 px-3 text-white hover:text-black">
                    Seller Panel
                  </Link>
                </li>
                <li>  
                 
                </li>
              </ul>
            </div>
          </div>
        </nav>
      )
    }else if(user?.role === role.ADMIN){
      return(
        <nav className="bg-red-600 border-gray-200">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-2">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="block md:hidden text-white focus:outline-none"
            >
              ☰
            </button>

            {/* Navigation Links */}
            <div className={`${isOpen ? "block" : "hidden"} w-full md:flex md:w-auto`}>
              <ul className="flex flex-col md:flex-row md:space-x-8 font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-red-600 md:mt-0 md:border-0">
                
                <li>
                  <Link to="/admin-panel/all-products" className="block py-2 px-3 text-white hover:text-black">
                    Admin Panel
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      )
    }else if(user?.role === role.USER){
      return(
        <nav className="bg-red-600 border-gray-200">
          <div className="max-w-screen-xl flex flex-wrap items-center justify-between mx-auto p-2">
            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="block md:hidden text-white focus:outline-none"
            >
              ☰
            </button>



            {/* Navigation Links */}
            <div className={`${isOpen ? "block" : "hidden"} w-full md:flex md:w-auto`}>
              <ul className="flex flex-col md:flex-row md:space-x-8 font-medium p-4 md:p-0 mt-4 border border-gray-100 rounded-lg bg-red-600 md:mt-0 md:border-0">
                <li>
                  <Link to="/" className="block py-2 px-3 text-white hover:text-black">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/user-product" className="block py-2 px-3 text-white hover:text-black">
                    Products
                  </Link>
                </li>
                <li>
                  <Link to="/shop-details" className="block py-2 px-3 text-white hover:text-black">
                    Shops
                  </Link> 
                </li>
                <li>
                  <Link to="/user-bid" className="block py-2 px-3 text-white hover:text-black">
                    Bid
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>
      )
    } else {
      return(
        <div></div>
      )

    }
  }

  // Handle search query changes
  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    if (query.trim().length > 1) {
      handleSearch(query);
    } else {
      setSearchResults([]);
      setShowResults(false);
    }
  };

  // Perform search
  const handleSearch = async (query) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`${SummaryApi.searchProduct.url}${encodeURIComponent(query)}`);
      const data = await response.json();
      
      if (data.success) {
        setSearchResults(data.data.slice(0, 5)); // Limit to 5 results for dropdown
        setShowResults(true);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Handle search form submission
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
    }
  };

  // Handle clicking on a search result
  const handleResultClick = (productId) => {
    navigate(`/view-product/${productId}`);
    setShowResults(false);
    setSearchResults([]);
  };

  // Close search results if clicked outside
  useEffect(() => {
    const handleClickOutside = () => {
      setShowResults(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);
  
  return (
    <header className='h-16 shadow-md bg-white fixed w-full z-40'>
      <div className='h-full container mx-auto flex items-center px-4 justify-between'>
        <Link to="/">
          <Logo w={90} h={50} />
        </Link>

        <div 
          className='relative flex items-center w-full justify-between max-w-sm'
          onClick={(e) => e.stopPropagation()}
        >
          <form 
            onSubmit={handleSearchSubmit}
            className='w-full flex'
          >
            <input
              type='text'
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder='Search products...'
              className='w-full outline-none pl-4 py-2 border border-gray-300 rounded-l-full focus:border-red-500 focus:ring-1 focus:ring-red-500'
            />
            <button 
              type="submit"
              className='text-lg min-w-[50px] h-[42px] bg-red-600 flex items-center justify-center rounded-r-full text-white hover:bg-red-700 transition-colors'
            >
              <GrSearch className="filter invert" />
            </button>
          </form>
          
          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <div className='absolute top-full left-0 right-0 mt-1 bg-white shadow-lg rounded-md z-50 max-h-80 overflow-y-auto'>
              {searchResults.map((product) => (
                <div
                  key={product._id}
                  className='p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-100 flex items-center gap-3'
                  onClick={() => handleResultClick(product._id)}
                >
                  {product.productImage && product.productImage[0] && (
                    <img 
                      src={product.productImage[0]} 
                      alt={product.productName} 
                      className='w-12 h-12 object-cover rounded-md'
                    />
                  )}
                  <div>
                    <h3 className='font-medium'>{product.productName}</h3>
                    <p className='text-sm text-gray-500'>{product.category}</p>
                  </div>
                </div>
              ))}
              <div className='p-2 text-center border-t'>
                <button 
                  onClick={handleSearchSubmit}
                  className='text-red-600 hover:text-red-800 text-sm font-medium'
                >
                  View all results
                </button>
              </div>
            </div>
          )}
          
          {/* "No results" message when search is performed but no results found */}
          {showResults && searchQuery.trim().length > 1 && searchResults.length === 0 && !isSearching && (
            <div className='absolute top-full left-0 right-0 mt-1 bg-white shadow-lg rounded-md z-50 p-4 text-center'>
              <p className='text-gray-500'>No products found matching "{searchQuery}"</p>
            </div>
          )}
          
          {/* Loading indicator */}
          {isSearching && (
            <div className='absolute top-full left-0 right-0 mt-1 bg-white shadow-lg rounded-md z-50 p-4 text-center'>
              <div className='animate-pulse flex justify-center'>
                <div className='h-4 w-4 bg-red-600 rounded-full mr-1'></div>
                <div className='h-4 w-4 bg-red-600 rounded-full mr-1 animation-delay-200'></div>
                <div className='h-4 w-4 bg-red-600 rounded-full animation-delay-400'></div>
              </div>
            </div>
          )}
        </div>

        <div className='flex items-center gap-20'>
          {user?._id && token && (
            <div className='relative flex justify-center'>
              <div 
                className='text-3xl cursor-pointer relative flex justify-center' 
                onClick={() => setMenuDisplay(prev => !prev)}
              >
                {user?.profilePic ? (
                  <img src={user.profilePic} className='w-10 h-10 rounded-full' alt={user.name} />
                ) : (
                  <FaRegCircleUser />
                )}
              </div>

              {menuDisplay && (
                <div className='absolute bg-white top-12 right-0 h-fit p-2 shadow-lg rounded-md z-50 min-w-[150px]'>
                  <nav className='flex flex-col'>
                    <Link 
                      to="/profile" 
                      className='block whitespace-nowrap hover:bg-slate-100 p-2 rounded-md'
                      onClick={() => setMenuDisplay(false)}
                    >
                      Profile
                    </Link>
                    {user?.role === role.ADMIN && (
                      <Link 
                        to="/admin/dashboard" 
                        className='block whitespace-nowrap hover:bg-slate-100 p-2 rounded-md'
                        onClick={() => setMenuDisplay(false)}
                      >
                        Admin Panel
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setMenuDisplay(false);
                        handleLogout();
                      }}
                      className='block whitespace-nowrap hover:bg-slate-100 p-2 rounded-md text-left text-red-600'
                    >
                      Logout
                    </button>
                  </nav>
                </div>
              )}
            </div>
          )}

          <div className='text-2xl relative'>

            <Link to={user?._id && token ? '/cart' : '/login'}>
              <FaShoppingCart />
              {cartProductCount > 0 && (
                <div className='bg-red-600 text-white w-5 h-5 rounded-full p-1 flex items-center justify-center absolute -top-2 -right-3'>
                  <p className='text-sm'>{cartProductCount}</p>
                </div>
              )}

            </Link>
          </div>

          {(!user?._id || !token) && (
            <Link to='/login'>
              <button className='px-3 py-1 rounded-full text-white bg-red-600 hover:bg-red-700'>
                Login
              </button>
            </Link>
          )}
        </div>
      </div>
      {navigation()}
    </header>
  );
};

export default Header;
