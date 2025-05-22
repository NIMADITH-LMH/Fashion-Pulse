import { useSelector, useDispatch } from 'react-redux';
import { useEffect, useState } from 'react';
import { FaUserCircle, FaSignOutAlt, FaCog, FaBars, FaTimes, FaChartLine, 
         FaBox, FaCalendarCheck, FaShoppingCart, FaGavel, FaStar, 
         FaMoneyBillWave, FaMoneyCheckAlt, FaChartPie } from 'react-icons/fa';
import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import role from '../common/role';
import { motion, AnimatePresence } from 'framer-motion';

const SellerPanel = () => {
  const user = useSelector((state) => state?.user?.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [openSidebar, setOpenSidebar] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  const [hoveredItem, setHoveredItem] = useState(null);

  useEffect(() => {
    if (user?.role !== role.SELLER) {
      navigate('/');
    }
    
    // Set active section based on current path
    const path = location.pathname.split('/').pop();
    setActiveSection(path);
  }, [user, navigate, location]);

  const navItems = [
    { path: 'seller-sales-overview', label: 'Sales Overview', icon: <FaChartLine /> },
    { path: 'shop-product', label: 'My Products', icon: <FaBox /> },
    { path: 'reservation', label: 'Reservations', icon: <FaCalendarCheck /> },
    { path: 'seller-order', label: 'Orders', icon: <FaShoppingCart /> },
    { path: 'put-a-bid', label: 'Put a Bid', icon: <FaGavel /> },
    { path: 'review', label: 'Review', icon: <FaStar /> },
    { path: 'seller-income-report', label: "Order Income", icon: <FaMoneyBillWave /> },
    { path: 'reservation-revenue', label: "Reservation Revenue", icon: <FaMoneyCheckAlt /> },
    { path: 'bid-dashboard', label: "Bid Dashboard", icon: <FaChartPie /> }
  ];

  // Group navItems into categories
  const categories = {
    "Manage": ['shop-product', 'reservation', 'seller-order', 'put-a-bid'],
    "Analytics": ['seller-sales-overview', 'review', 'seller-income-report', 'reservation-revenue', 'bid-dashboard']
  };

  const getCategoryForPath = (path) => {
    for (const [category, paths] of Object.entries(categories)) {
      if (paths.includes(path)) {
        return category;
      }
    }
    return null;
  };

  const sidebarVariants = {
    expanded: { width: "272px", transition: { duration: 0.3 } },
    collapsed: { width: "80px", transition: { duration: 0.3 } }
  };

  const handleLogout = () => {
    // Implement logout functionality here
    navigate('/login');
  };

  return (
    <div className='min-h-screen flex bg-gray-50'>
      {/* Desktop Sidebar */}
      <motion.aside
        variants={sidebarVariants}
        initial="expanded"
        animate={isCollapsed ? "collapsed" : "expanded"}
        className={`bg-white min-h-screen shadow-xl md:flex hidden flex-col transition-all duration-300 overflow-y-auto relative z-10`}
      >
        {/* Toggle button */}
        <button 
          className="absolute right-0 top-4 transform translate-x-1/2 bg-red-500 text-white rounded-full p-2 z-10 hover:bg-red-600 transition-colors"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <FaBars size={14} /> : <FaTimes size={14} />}
        </button>

        <motion.div
          className='flex flex-col items-center pt-6 pb-4'
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className='relative'>
            <motion.div 
              className={`${isCollapsed ? 'w-12 h-12' : 'w-20 h-20'} rounded-full overflow-hidden transition-all duration-300 border-2 border-red-400 shadow-lg`}
              whileHover={{ scale: 1.05, borderColor: "#f87171" }}
            >
              {user?.profilePic ? (
                <img
                  src={user?.profilePic}
                  className='w-full h-full object-cover'
                  alt={user?.name}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-100 text-red-500">
                  <FaUserCircle size={isCollapsed ? 28 : 48} />
                </div>
              )}
            </motion.div>
            
            {!isCollapsed && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-center mt-3"
              >
                <p className='capitalize text-lg font-bold text-gray-800'>{user?.name}</p>
                <span className='text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full inline-block mt-1'>{user?.role}</span>
              </motion.div>
            )}
          </div>
        </motion.div>

        <div className="flex-1 px-3 overflow-y-auto">
          {/* Navigation by Categories */}
          {!isCollapsed && Object.entries(categories).map(([category, paths]) => (
            <div key={category} className="mb-4">
              <h3 className="text-xs uppercase text-gray-500 font-semibold mb-2 px-2">{category}</h3>
              {navItems.filter(item => paths.includes(item.path)).map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`px-3 py-2 my-1 rounded-xl transition-all duration-200 flex items-center gap-3 ${
                    location.pathname.includes(item.path)
                      ? 'bg-red-500 text-white shadow-md'
                      : 'hover:bg-red-100'
                  }`}
                  onMouseEnter={() => setHoveredItem(item.path)}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <motion.div 
                    whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {item.icon}
                  </motion.div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={hoveredItem === item.path && !location.pathname.includes(item.path) ? 'font-medium' : ''}
                  >
                    {item.label}
                  </motion.span>
                  {location.pathname.includes(item.path) && (
                    <motion.div 
                      className="w-1 h-5 bg-white absolute right-3 rounded-full"
                      layoutId="activeIndicator"
                    />
                  )}
                </Link>
              ))}
            </div>
          ))}

          {/* Collapsed Mode Navigation */}
          {isCollapsed && (
            <div className="flex flex-col items-center space-y-4 mt-4">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`p-3 rounded-xl transition-all duration-200 flex items-center justify-center ${
                    location.pathname.includes(item.path)
                      ? 'bg-red-500 text-white shadow-md'
                      : 'hover:bg-red-100 text-gray-700'
                  }`}
                  title={item.label}
                >
                  <motion.div whileHover={{ scale: 1.2 }}>
                    {item.icon}
                  </motion.div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Bottom actions */}
        
      </motion.aside>

      {/* Mobile Sidebar */}
      <div className='md:hidden block fixed top-0 left-0 right-0 z-20 bg-white shadow-md p-3'>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {user?.profilePic ? (
              <img src={user?.profilePic} className='w-10 h-10 rounded-full object-cover' alt={user?.name} />
            ) : (
              <FaUserCircle size={24} />
            )}
            <span className="font-medium">{user?.name}</span>
          </div>
          <button 
            onClick={() => setOpenSidebar(!openSidebar)}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <FaBars size={24} className="text-gray-700" />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {openSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className='fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden'
              onClick={() => setOpenSidebar(false)}
            />
            <motion.aside
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className='bg-white w-72 fixed top-0 left-0 h-full p-4 shadow-xl z-40 md:hidden overflow-y-auto'
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Seller Dashboard</h2>
                <button 
                  onClick={() => setOpenSidebar(false)}
                  className="p-2 rounded-full hover:bg-gray-100"
                >
                  <FaTimes size={20} />
                </button>
              </div>
              
              <div className='flex flex-col items-center mb-6 pt-2'>
                <div className='relative'>
                  <motion.div 
                    className="w-20 h-20 rounded-full overflow-hidden border-2 border-red-400 shadow-lg"
                    whileHover={{ scale: 1.05 }}
                  >
                    {user?.profilePic ? (
                      <img
                        src={user?.profilePic}
                        className='w-full h-full object-cover'
                        alt={user?.name}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-100 text-red-500">
                        <FaUserCircle size={48} />
                      </div>
                    )}
                  </motion.div>
                </div>
                <p className='capitalize text-lg font-bold mt-3'>{user?.name}</p>
                <span className='text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full mt-1'>{user?.role}</span>
              </div>

              {/* Mobile Navigation by Categories */}
              {Object.entries(categories).map(([category, paths]) => (
                <div key={category} className="mb-4">
                  <h3 className="text-xs uppercase text-gray-500 font-semibold mb-2 px-2">{category}</h3>
                  {navItems.filter(item => paths.includes(item.path)).map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      onClick={() => setOpenSidebar(false)}
                      className={`px-3 py-2 my-1 rounded-xl transition-colors duration-200 flex items-center gap-3 ${
                        location.pathname.includes(item.path)
                          ? 'bg-red-500 text-white shadow-md'
                          : 'hover:bg-red-100'
                      }`}
                    >
                      {item.icon}
                      <span>{item.label}</span>
                      {location.pathname.includes(item.path) && (
                        <motion.div className="w-1 h-5 bg-white absolute right-3 rounded-full" layoutId="mobileActiveIndicator" />
                      )}
                    </Link>
                  ))}
                </div>
              ))}

              <div className="border-t border-gray-200 pt-4 mt-auto">
                <button className="w-full px-3 py-2 rounded-xl hover:bg-gray-100 flex items-center gap-3 mb-2">
                  <FaCog /> Settings
                </button>
                <button 
                  className="w-full px-3 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 flex items-center gap-3"
                  onClick={handleLogout}
                >
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className='w-full md:pl-0 md:pt-0 pt-16'>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1 }}
          className='p-6'
        >
          {/* Page title based on current path */}
          <div className="mb-6">
            {activeSection && (
              <motion.div 
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                key={activeSection}
                className="flex items-center"
              >
                <h1 className="text-2xl font-bold text-gray-800">
                  {navItems.find(item => item.path === activeSection)?.label || "Dashboard"}
                </h1>
                <div className="ml-2 text-red-500">
                  {navItems.find(item => item.path === activeSection)?.icon}
                </div>
              </motion.div>
            )}
            <div className="h-1 w-20 bg-red-500 rounded-full mt-2"></div>
          </div>
          
          <Outlet />
        </motion.div>
      </main>
    </div>
  );
};

export default SellerPanel;