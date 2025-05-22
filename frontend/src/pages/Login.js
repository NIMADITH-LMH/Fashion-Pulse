import React, { useState } from 'react'
import { FaEye, FaEyeSlash, FaLinkedinIn, FaGoogle, FaFacebookF } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import SummaryApi from '../common';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { setUserDetails } from '../store/userSlice';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

// Import the image directly
import loginImage from '../assest/login/935760.jpg';

// Image fallback URL
const FALLBACK_IMG_URL = "https://i.pinimg.com/originals/45/00/6c/45006c3f0832d2e90cc9b77729218962.jpg";

const Login = () => {
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [data, setData] = useState({
        email: "",
        password: ""
    })
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const handleOnChange = (e) => {
        const { name, value } = e.target
        setData((prev) => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async(e) => {
        e.preventDefault()
        if (!data.email || !data.password) {
            toast.error('Please fill in all fields')
            return
        }
        
        setLoading(true)
        try {
            // Clear any existing auth headers
            delete axios.defaults.headers.common['Authorization'];
            
            // Get initial login response
            const loginResponse = await axios.post(SummaryApi.signIn.url, data, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (!loginResponse.data.success) {
                throw new Error(loginResponse.data.message || 'Login failed');
            }

            // Get token from response
            const token = loginResponse.data.data;
            
            if (!token) {
                throw new Error('No token received from server');
            }

            // Set token in axios defaults
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

            // Get user details from token
            const decodedToken = jwtDecode(token);

            // Get full user details
            const userResponse = await axios.get(SummaryApi.current_user.url);

            if (!userResponse.data.success || !userResponse.data.data) {
                throw new Error('Failed to fetch user details');
            }

            const userData = userResponse.data.data;

            // Prepare final user data with token
            const finalUserData = {
                ...userData,
                token, // Include token in user data
                role: userData.role || 'USER',
                _id: userData._id || decodedToken._id,
                email: userData.email || decodedToken.email || data.email
            };

            // Update Redux store with user data and token
            dispatch(setUserDetails(finalUserData));
            
            toast.success('Login successful!');
            navigate('/', { replace: true });
        } catch (error) {
            console.error('Login error:', error);
            // Clear auth header on error
            delete axios.defaults.headers.common['Authorization'];
            
            if (error.response?.status === 401) {
                toast.error('Invalid credentials. Please try again.');
            } else {
                toast.error(error.response?.data?.message || error.message || 'Login failed');
            }
        } finally {
            setLoading(false)
        }
    }

    // Handle social login
    const handleSocialLogin = (provider) => {
        // Implement social login logic
        console.log(`Login with ${provider}`);
        toast.info(`${provider} login is not implemented yet`);
    }
    
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 overflow-x-hidden">
            {/* Container for both sides - with max-width to prevent overflow */}
            <div className="flex w-full max-w-5xl mx-auto shadow-xl rounded-2xl overflow-hidden">
                {/* Left side - Shopping Woman Image */}
                <div className="hidden lg:block lg:w-1/2 relative bg-white">
                    {/* Display the shopping woman image */}
                    <div className="absolute inset-0">
                        <img 
                            src={loginImage}
                            alt="Woman with shopping bags" 
                            className="w-full h-full object-cover object-center"
                            onError={(e) => {
                                console.error("Image failed to load");
                                e.target.onerror = null; // Prevent infinite loop
                                e.target.src = FALLBACK_IMG_URL;
                            }}
                        />
                    </div>
                </div>
                
                {/* Right side - Login form */}
                <div className="w-full lg:w-1/2 flex items-center justify-center py-10 px-6 bg-white">
                    <div className="w-full max-w-md space-y-6">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold text-gray-900">
                                Hello,
                            </h2>
                            <p className="text-xl font-medium text-gray-900">Welcome Back</p>
                            <p className="mt-1 text-sm text-gray-600">
                                Login to manage your account
                            </p>
                        </div>
                        
                        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
                            <div className="rounded-md space-y-4">
                                <div className="group">
                                    <label className="sr-only">Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={data.email}
                                        onChange={handleOnChange}
                                        required
                                        className="appearance-none relative block w-full px-4 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 text-sm shadow-sm"
                                        placeholder="Email"
                                    />
                                </div>
                                <div className="relative group">
                                    <label className="sr-only">Password</label>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={data.password}
                                        onChange={handleOnChange}
                                        required
                                        className="appearance-none relative block w-full px-4 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 text-sm pr-10 shadow-sm"
                                        placeholder="Password"
                                    />
                                    <div 
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                        onClick={() => setShowPassword(prev => !prev)}
                                    >
                                        {showPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-sm">
                                <div className="flex items-center">
                                    <input
                                        id="remember-me"
                                        name="remember-me"
                                        type="checkbox"
                                        className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                    />
                                    <label htmlFor="remember-me" className="ml-2 block text-gray-900">
                                        Remember me
                                    </label>
                                </div>

                                <div>
                                    <Link to="/forgot-password" className="font-medium text-red-600 hover:text-red-500">
                                        Forgot password?
                                    </Link>
                                </div>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                                >
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            </div>
                            
                            <div className="text-center">
                                <div className="relative py-2">
                                    <div className="absolute inset-0 flex items-center">
                                        <div className="w-full border-t border-gray-300"></div>
                                    </div>
                                    <div className="relative flex justify-center">
                                        <span className="px-2 bg-white text-sm text-gray-500">Or</span>
                                    </div>
                                </div>
                                
                                <div className="flex justify-center space-x-4 mt-3">
                                    <button 
                                        type="button"
                                        onClick={() => handleSocialLogin('Google')}
                                        className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-100 shadow-sm"
                                    >
                                        <FaGoogle className="text-red-500" />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleSocialLogin('Facebook')}
                                        className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-100 shadow-sm"
                                    >
                                        <FaFacebookF className="text-blue-600" />
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => handleSocialLogin('LinkedIn')}
                                        className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-100 shadow-sm"
                                    >
                                        <FaLinkedinIn className="text-blue-500" />
                                    </button>
                                </div>
                            </div>
                        </form>
                        
                        <div className="text-center">
                            <p className="text-sm text-gray-600">
                                Don't have an account?{' '}
                                <Link to="/sign-up" className="font-medium text-red-600 hover:text-red-500">
                                    Signup
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Login