import { useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { FaUserCircle, FaBars, FaTimes, FaChevronRight,FaChartPie } from "react-icons/fa";
import { Link, useNavigate, useLocation } from 'react-router-dom';
import role from '../common/role';
import { Outlet } from 'react-router-dom';
import { icon } from 'leaflet';


const AdminPanel = () => {
    const user = useSelector(state => state?.user?.user);
    const navigate = useNavigate();
    const location = useLocation();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [activeLink, setActiveLink] = useState('');
    
    useEffect(() => {
        if(user?.role !== role.ADMIN){
            navigate('/');
        }
    }, [user, navigate]);
    
    useEffect(() => {
        // Extract the current path to highlight active link
        const currentPath = location.pathname.split('/').pop();
        setActiveLink(currentPath);
    }, [location]);
    
    const navLinks = [
        { name: 'All User Details', path: 'admin-user-details', icon: '👥' },
        { name: 'All Products', path: 'all-products', icon: '📦' },
        { name: 'Product Management', path: 'product-management', icon: '🛒' },
        { name: 'Order Management', path: 'order-management', icon: '📋' },
        { name: 'Bid Management', path: 'bid-management', icon: '🔨' },
        { name: 'Reservation Management', path: 'reservation-management', icon: '📅' },
        { name: 'Comment Management', path: 'comment-management', icon: '💬' }
        ,{ name: 'Bid Income', path: 'Bid-income-admin', icon: '💰' },
        { name: 'Reservation Income', path: 'reservation-income-admin', icon: '💵' }
        ,{name:"Revenue Summary",path:'revenue',icon:'💵'},
        { name:"Seller Analaytics",path:'analytic-part',icon:<FaChartPie />}
    ];

    return (
        <div className='min-h-[calc(100vh-120px)] flex'>
            {/* Sidebar */}
            <aside className={`bg-white min-h-full transition-all duration-300 customShadow relative ${isCollapsed ? 'w-20' : 'w-80'}`}>
                {/* Toggle button */}
                <button 
                    className="absolute right-0 top-4 transform translate-x-1/2 bg-blue-600 text-white rounded-full p-2 z-10 hover:bg-blue-700 transition-colors"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? <FaBars /> : <FaTimes />}
                </button>
                
                {/* User profile section */}
                <div className='h-32 flex justify-center items-center flex-col my-4'>
                    <div className='text-5xl cursor-pointer relative flex justify-center mb-2'>
                        {user?.profilePic ? (
                            <img 
                                src={user?.profilePic} 
                                className={`rounded-full object-cover border-2 border-blue-500 ${isCollapsed ? 'w-12 h-12' : 'w-20 h-20'}`} 
                                alt={user?.name} 
                            />
                        ) : (
                            <div className={`text-blue-600 ${isCollapsed ? 'text-3xl' : 'text-5xl'}`}>
                                <FaUserCircle />
                            </div>
                        )}
                    </div>
                    {!isCollapsed && (
                        <>
                            <p className='capitalize text-lg font-semibold text-gray-800'>{user?.name}</p>
                            <p className='text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full mt-1'>{user?.role}</p>
                        </>
                    )}
                </div>
                
                {/* Navigation */}
                <div className="mt-6">
                    <nav className={`grid gap-1 ${isCollapsed ? 'px-2' : 'px-4'}`}>
                        {navLinks.map((link) => (
                            <Link 
                                key={link.path}
                                to={link.path}
                                className={`px-3 py-3 rounded-lg flex items-center transition-all
                                    ${activeLink === link.path ? 'bg-blue-100 text-blue-700 font-medium' : 'hover:bg-gray-100 text-gray-700'}
                                    ${isCollapsed ? 'justify-center' : 'justify-between'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`${isCollapsed ? 'text-xl' : ''}`}>{link.icon}</span>
                                    {!isCollapsed && <span>{link.name}</span>}
                                </div>
                                {!isCollapsed && activeLink === link.path && (
                                    <FaChevronRight className="text-blue-600" />
                                )}
                            </Link>
                        ))}
                    </nav>
                </div>
                
                
            </aside>
            
            {/* Main content */}
            <main className={`w-full h-full p-6 bg-gray-50`}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminPanel;