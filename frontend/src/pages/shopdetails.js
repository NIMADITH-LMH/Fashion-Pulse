

import React, { useEffect, useState } from "react";
import { 
  FaThumbsUp, 
  FaMapMarkerAlt, 
  FaStore, 
  FaShareAlt,
  FaDirections,
  FaTimes
} from "react-icons/fa";
import { Link } from "react-router-dom";
import SummaryApi from "../common";
import Modal from "react-modal";
import L from "leaflet";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { useNavigate } from "react-router-dom";

// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

// Custom icons
const shopIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/2838/2838694.png",
  iconSize: [32, 32],
});

const userIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/447/447031.png",
  iconSize: [32, 32],
});

const ShopDetails = () => {
  const [shops, setShops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [selectedShop, setSelectedShop] = useState(null);
  const [directionsModalOpen, setDirectionsModalOpen] = useState(false);
  const [permissionRequested, setPermissionRequested] = useState(false);
  const navigate = useNavigate();
  // Get user location when component mounts
  useEffect(() => {
    fetchShops();
    requestLocationPermission();
  }, []);

  const handleVisit = (shopId) => {
    navigate("/shop-products", { state: { shopId } }); 
  };

  const fetchShops = () => {
    fetch(SummaryApi.getShopDetails.url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setShops(data.data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching shops:", err);
        setLoading(false);
      });
  };

  const requestLocationPermission = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          setLocationError(error.message);
          console.error("Geolocation error:", error);
        },
        { enableHighAccuracy: true }
      );
      setPermissionRequested(true);
    } else {
      setLocationError("Geolocation is not supported by this browser.");
    }
  };

  const handleDirectionsClick = (shop) => {
    if (!userLocation) {
      alert("Please allow location access to get directions.");
      requestLocationPermission();
      return;
    }

    setSelectedShop(shop); // Set the selected shop first
    setDirectionsModalOpen(true); // Open the directions modal after setting the selected shop
  };

  const openGoogleMapsDirections = (shop) => {
    if (!userLocation) return; // Ensure userLocation is available before opening directions
    
    const origin = `${userLocation.lat},${userLocation.lng}`;
    const destination = `${shop.location.lat},${shop.location.lng}`;
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
    
    window.open(url, '_blank'); // Opens Google Maps directions in a new tab
  };

  // Function to calculate distance between two points (in km)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const toRad = (value) => (value * Math.PI) / 180;
    const R = 6371; // Radius of the Earth in km
    const dLat = toRad(lat2 - lat1);
    const dLng = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in km
    return distance.toFixed(2); // Return distance rounded to 2 decimal places
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Location Permission Banner */}
      {!userLocation && permissionRequested && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 mb-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                Allow location access to see distances to shops and get directions.
                <button 
                  onClick={requestLocationPermission}
                  className="ml-2 text-yellow-700 font-semibold hover:text-yellow-800"
                >
                  Allow Location
                </button>
              </p>
            </div>
          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold text-center mb-8">Discover Local Shops</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {shops.length === 0 ? (
          <div className="col-span-3 text-center py-10">
            <p className="text-xl text-gray-600">No shops available in your area</p>
          </div>
        ) : (
          shops.map((shop) => (
            <div key={shop._id} className="bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
              <div className="relative h-48 overflow-hidden">
                <img
                  src={shop.profilePic || "/hello.jpg"}
                  alt={`${shop.name}`}
                  className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  onError={(e) => {
                    e.target.src = "/default-shop.jpg";
                  }}
                />
                {userLocation && shop.location && (
                  <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full shadow-md text-xs font-semibold">
                    {calculateDistance(
                      userLocation.lat, 
                      userLocation.lng, 
                      shop.location.lat, 
                      shop.location.lng
                    )} km away
                  </div>
                )}
              </div>
              <div className="p-4">
                <h2 className="text-xl font-bold mb-2">{shop.name}</h2>
                {shop.description && (
                  <p className="text-gray-600 mb-4 line-clamp-2">{shop.description}</p>
                )}
                <div className="flex flex-wrap gap-2 mb-4">
                  {shop.categories?.map((category, index) => (
                    <span key={index} className="bg-gray-100 px-2 py-1 rounded-full text-xs">
                      {category}
                    </span>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <button 
                    onClick={() => handleDirectionsClick(shop)}
                    className="bg-red-100 hover:bg-red-200 text-red-600 px-3 py-1 rounded-full flex items-center transition-colors"
                  >
                    <FaDirections className="mr-1" />
                    <span>Directions</span>
                  </button>
                </div>
              </div>
              <div className="border-t border-gray-100 px-4 py-3 flex justify-around">
                <button className="flex items-center text-blue-500 hover:text-blue-700 transition-colors">
                  <FaThumbsUp className="mr-1" />
                  <span>Like</span>
                </button>
                <button
                    onClick={() => handleVisit(shop._id)}
                    className="flex items-center text-green-500 hover:text-green-700 transition-colors"
                  >
                    <FaStore className="mr-1" />
                    <span>Visit</span>
                </button>
                <button className="flex items-center text-purple-500 hover:text-purple-700 transition-colors">
                  <FaShareAlt className="mr-1" />
                  <span>Share</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Directions Modal */}
      <Modal
        isOpen={directionsModalOpen}
        onRequestClose={() => setDirectionsModalOpen(false)}
        className="modal w-full max-w-4xl mx-auto bg-white rounded-xl shadow-2xl overflow-hidden"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4"
        ariaHideApp={false}
      >
        {selectedShop && (
          <div className="relative">
            <button 
              onClick={() => setDirectionsModalOpen(false)}
              className="absolute top-4 right-4 z-50 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
            >
              <FaTimes className="text-gray-600" />
            </button>
            <div className="flex flex-col md:flex-row h-full">
              <div className="w-full md:w-1/3 p-6 bg-gray-50">
                <h2 className="text-2xl font-bold mb-4">Directions to {selectedShop.name}</h2>
                {userLocation && selectedShop.location ? (
                  <>
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Your Location</h3>
                      <p className="text-gray-600 text-sm">
                        {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
                      </p>
                    </div>
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Shop Location</h3>
                      <p className="text-gray-600 text-sm">
                        {selectedShop.locationaddress || `${selectedShop.location.lat.toFixed(4)}, ${selectedShop.location.lng.toFixed(4)}`}
                      </p>
                    </div>
                    <div className="mb-6">
                      <h3 className="font-semibold mb-2">Distance</h3>
                      <p className="text-xl font-bold text-red-600">
                        {calculateDistance(
                          userLocation.lat, 
                          userLocation.lng, 
                          selectedShop.location.lat, 
                          selectedShop.location.lng
                        )} km
                      </p>
                    </div>
                    <div className="flex justify-center">
                      <button 
                        onClick={() => openGoogleMapsDirections(selectedShop)}
                        className="bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 transition-colors"
                      >
                        Get Directions
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-gray-600">Unable to get location data.</p>
                )}
              </div>
              <div className="w-full md:w-2/3 p-6">
                <MapContainer center={userLocation ? [userLocation.lat, userLocation.lng] : [51.505, -0.09]} zoom={13} style={{ height: "400px" }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  />
                  {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                      <Popup>Your location</Popup>
                    </Marker>
                  )}
                  {selectedShop && selectedShop.location && (
                    <Marker position={[selectedShop.location.lat, selectedShop.location.lng]} icon={shopIcon}>
                      <Popup>{selectedShop.name}</Popup>
                    </Marker>
                  )}
                </MapContainer>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ShopDetails;
