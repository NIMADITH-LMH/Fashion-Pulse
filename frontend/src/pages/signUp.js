import React, { useState, useEffect } from 'react';
import { FaEye, FaEyeSlash, FaLinkedinIn, FaGoogle, FaFacebookF, FaMapMarkerAlt } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Modal from "react-modal";
import imageTobase64 from "../helpers/imageTobase65";
import SummaryApi from "../common";
import { toast } from 'react-toastify';
import L from "leaflet";
import debounce from 'lodash.debounce';

// Import the image directly - assuming you have a similar signup image
import signupImage from '../assest/login/935760.jpg';
import loginIcons from "../assest/signin.gif";

// Image fallback URL
const FALLBACK_IMG_URL = "https://i.pinimg.com/originals/45/00/6c/45006c3f0832d2e90cc9b77729218962.jpg";

// Setup Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

function UpdateMapCenter({ center }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

const SignUp = () => {
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [location, setLocation] = useState({ lat: 6.9271, lng: 79.8612, address: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSeller, setIsSeller] = useState(false);
  const [passwordMatch, setPasswordMatch] = useState(true);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState({
    email: '',
    password: '',
    name: '',
    confirmPassword: '',
    profilePic: '',
    role: 'GENERAL',
    location: { lat: 6.9271, lng: 79.8612 }
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [mapKey, setMapKey] = useState(0);
  const navigate = useNavigate();

  const handleOnChange = (event) => {
    const { name, value } = event.target;
    setData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === 'confirmPassword' || name === 'password') {
      const passwordToCompare = name === 'confirmPassword' ? data.password : data.confirmPassword;
      setPasswordMatch(passwordToCompare === value);
    }
  };

  const handleUploadPic = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const imagePic = await imageTobase64(file);
    setData((prevData) => ({
      ...prevData,
      profilePic: imagePic,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (data.password !== data.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
  
    if (!data.location.address) {
      toast.error("Please select a valid address.");
      return;
    }
  
    setLoading(true);
    try {
      const response = await fetch(SummaryApi.SignUP.url, {
        method: SummaryApi.SignUP.method || 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          profilePic: data.profilePic,
          role: isSeller ? 'SELLER' : 'GENERAL',
          location: data.location
        }),
      });
  
      const result = await response.json();
      if (result.success) {
        toast.success(result.message);
        navigate('/login');
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error('Error during signup:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (role) => {
    setIsSeller(role === 'SELLER');
  };

  const debouncedSearch = debounce(async (query) => {
    if (!query) return;
    try {
      setIsSearching(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${query}`
      );
      const results = await response.json();
      setSearchResults(results);
      if (results.length > 0) {
        setLocation({
          lat: parseFloat(results[0].lat),
          lng: parseFloat(results[0].lon),
          address: results[0].display_name
        });
        setMapKey(prev => prev + 1);
      }
    } catch (error) {
      console.error("Error searching location:", error);
      toast.error("Failed to search location. Please try again.");
    } finally {
      setIsSearching(false);
    }
  }, 500);

  useEffect(() => {
    if (searchQuery) {
      debouncedSearch(searchQuery);
    } else {
      setSearchResults([]);
    }
    return () => debouncedSearch.cancel();
  }, [searchQuery]);

  const handleLocationSelect = (result) => {
    const selectedAddress = result.display_name;
    const newLocation = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      address: selectedAddress
    };
    setLocation(newLocation);
    setData((prevData) => ({
      ...prevData,
      location: newLocation,
    }));
    setMapKey(prev => prev + 1);
  };

  function LocationMarker() {
    const map = useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
          .then((res) => res.json())
          .then((data) => {
            const address = data.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
            setLocation({ lat, lng, address });
            setData(prev => ({ ...prev, location: { lat, lng, address } }));
          })
          .catch(err => {
            console.error("Error getting address:", err);
            setLocation({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
            setData(prev => ({ ...prev, location: { lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` } }));
          });
      },
    });
    return location ? <Marker position={[location.lat, location.lng]} /> : null;
  }

  // Handle social signup
  const handleSocialSignup = (provider) => {
    console.log(`Signup with ${provider}`);
    toast.info(`${provider} signup is not implemented yet`);
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
              src={signupImage}
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
        
        {/* Right side - Signup form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center py-10 px-6 bg-white">
          <div className="w-full max-w-md space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Hello,
              </h2>
              <p className="text-xl font-medium text-gray-900">Create Your Account</p>
              <p className="mt-1 text-sm text-gray-600">
                Sign up to start your journey with us
              </p>
            </div>
            
            {/* Account Type Selection */}
            <div className="flex justify-center gap-4">
              <button
                type="button"
                onClick={() => handleRoleChange('GENERAL')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all 
                  ${!isSeller ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                User Account
              </button>
              <button
                type="button"
                onClick={() => handleRoleChange('SELLER')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all 
                  ${isSeller ? 'bg-red-600 text-white' : 'bg-gray-200 text-gray-800'}`}
              >
                Seller Account
              </button>
            </div>
            
            {/* Profile Image Upload */}
            <div className="flex justify-center">
              <div className="relative w-20 h-20 rounded-full overflow-hidden bg-gray-100 border-2 border-gray-200">
                <img 
                  src={data.profilePic || loginIcons} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
                <label className="absolute inset-0 opacity-0 hover:opacity-80 bg-black bg-opacity-50 flex items-center justify-center text-white text-xs font-medium cursor-pointer transition-all">
                  Upload Photo
                  <input type="file" className="hidden" onChange={handleUploadPic} accept="image/*" />
                </label>
              </div>
            </div>
            
            <form className="mt-4 space-y-5" onSubmit={handleSubmit}>
              <div className="rounded-md space-y-4">
                <div className="group">
                  <label className="sr-only">{isSeller ? 'Shop Name' : 'Full Name'}</label>
                  <input
                    type="text"
                    name="name"
                    value={data.name}
                    onChange={handleOnChange}
                    required
                    className="appearance-none relative block w-full px-4 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 text-sm shadow-sm"
                    placeholder={isSeller ? 'Shop Name' : 'Full Name'}
                  />
                </div>
                
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
                
                <div className="group">
                  <label className="sr-only">Location</label>
                  <button
                    type="button"
                    onClick={() => setModalIsOpen(true)}
                    className="appearance-none relative block w-full px-4 py-2.5 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 text-sm shadow-sm text-left flex items-center justify-between"
                  >
                    <span className="truncate">
                      {location.address ? location.address : "Select your location"}
                    </span>
                    <FaMapMarkerAlt className="text-red-500" />
                  </button>
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
                
                <div className="relative group">
                  <label className="sr-only">Confirm Password</label>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={data.confirmPassword}
                    onChange={handleOnChange}
                    required
                    className={`appearance-none relative block w-full px-4 py-2.5 border ${
                      data.confirmPassword && !passwordMatch ? 'border-red-500' : 'border-gray-300'
                    } placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-red-500 focus:border-red-500 focus:z-10 text-sm pr-10 shadow-sm`}
                    placeholder="Confirm Password"
                  />
                  <div 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={() => setShowConfirmPassword(prev => !prev)}
                  >
                    {showConfirmPassword ? <FaEyeSlash className="text-gray-400" /> : <FaEye className="text-gray-400" />}
                  </div>
                </div>
                
                {data.confirmPassword && !passwordMatch && (
                  <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                  {loading ? 'Signing up...' : (isSeller ? 'Register as Seller' : 'Sign Up')}
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
                    onClick={() => handleSocialSignup('Google')}
                    className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-100 shadow-sm"
                  >
                    <FaGoogle className="text-red-500" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSocialSignup('Facebook')}
                    className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-100 shadow-sm"
                  >
                    <FaFacebookF className="text-blue-600" />
                  </button>
                  <button 
                    type="button"
                    onClick={() => handleSocialSignup('LinkedIn')}
                    className="w-9 h-9 rounded-full flex items-center justify-center border border-gray-300 hover:bg-gray-100 shadow-sm"
                  >
                    <FaLinkedinIn className="text-blue-500" />
                  </button>
                </div>
              </div>
            </form>
            
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-red-600 hover:text-red-500">
                  Login
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Location Selection Modal */}
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={() => setModalIsOpen(false)}
        className="modal w-full max-w-md mx-auto bg-white p-6 rounded-lg shadow-xl"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
        ariaHideApp={false}
      >
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-bold border-b pb-2">Select Your Location</h3>
          
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search location (e.g., Colombo, Sri Lanka)"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded-md pl-10"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FaMapMarkerAlt className="text-gray-400" />
            </div>
            {isSearching && (
              <span className="absolute right-3 top-3 text-gray-500 text-sm">Searching...</span>
            )}
          </div>

          {/* Map Container */}
          <div className="h-60 border rounded-md overflow-hidden">
            <MapContainer
              key={mapKey}
              center={[location.lat, location.lng]}
              zoom={13}
              style={{ height: "100%", width: "100%" }}
              className="z-0"
            >
              <TileLayer 
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <UpdateMapCenter center={[location.lat, location.lng]} />
              <LocationMarker />
            </MapContainer>
          </div>

          {/* Selected Location */}
          <div className="bg-gray-100 p-3 rounded-md">
            <h4 className="font-medium flex items-center gap-2">
              <FaMapMarkerAlt className="text-red-500" /> Selected Location
            </h4>
            <p className="text-sm mt-1 break-words">{location.address || "Click on the map or search to select a location"}</p>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="overflow-y-auto max-h-40 border rounded-md">
              <h4 className="font-medium p-2 bg-gray-100">Search Results</h4>
              <ul>
                {searchResults.map((result, index) => (
                  <li
                    key={index}
                    onClick={() => handleLocationSelect(result)}
                    className="cursor-pointer p-2 border-b hover:bg-gray-100 text-sm"
                  >
                    {result.display_name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setModalIsOpen(false)}
              className="px-4 py-2 border rounded-md hover:bg-gray-100 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                if (location.address) {
                  setModalIsOpen(false);
                } else {
                  toast.warning("Please select a location first");
                }
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              disabled={!location.address}
            >
              Confirm Location
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SignUp;