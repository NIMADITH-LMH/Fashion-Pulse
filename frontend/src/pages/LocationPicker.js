import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Modal from "react-modal";
import { toast } from "react-toastify";
import L from "leaflet";
// Fix Leaflet icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});
const LocationPicker = ({ onSelect }) => {
  const [position, setPosition] = useState([51.505, -0.09]); // Default location

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        onSelect(e.latlng.lat, e.latlng.lng);
      },
    });

    return <Marker position={position} />;
  }

  return (
    <div className="fixed inset-0 bg-gray-700 bg-opacity-75 flex justify-center items-center">
      <div className="bg-white p-4 rounded-md shadow-md w-96">
        <h2 className="text-lg font-semibold mb-2">Select Your Location</h2>
        <MapContainer center={position} zoom={13} style={{ height: "300px", width: "100%" }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationMarker />
        </MapContainer>
        <button
          onClick={() => onSelect(position[0], position[1])}
          className="mt-3 bg-red-600 text-white py-2 px-4 rounded"
        >
          Confirm Location
        </button>
      </div>
    </div>
  );
};

export default LocationPicker;
