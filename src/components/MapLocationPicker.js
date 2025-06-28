import React, { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { Box, TextField, CircularProgress, Alert } from '@mui/material';
import debounce from 'lodash/debounce';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Fix Leaflet marker icon issue
delete Icon.Default.prototype._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const LocationMarker = ({ position, onLocationSelect }) => {
  const map = useMapEvents({
    click: async (e) => {
      const { lat, lng } = e.latlng;
      try {
        // Reverse geocoding using Nominatim
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
          {
            headers: {
              'Accept-Language': 'en-US,en;q=0.9',
              'User-Agent': 'ActivityApp/1.0'
            }
          }
        );
        
        if (!response.ok) {
          throw new Error('Failed to fetch address');
        }

        const data = await response.json();
        
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: data.display_name || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        });
      } catch (error) {
        console.error('Error getting address:', error);
        onLocationSelect({
          latitude: lat,
          longitude: lng,
          address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
        });
      }
    },
  });

  return position ? <Marker position={position} /> : null;
};

const MapLocationPicker = ({ onLocationSelect }) => {
  const [position, setPosition] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleLocationSelect = async (location) => {
    setPosition([location.latitude, location.longitude]);
    onLocationSelect(location);
  };

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (!query.trim()) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
          {
            headers: {
              'Accept-Language': 'en-US,en;q=0.9',
              'User-Agent': 'ActivityApp/1.0'
            }
          }
        );

        if (!response.ok) {
          throw new Error('Failed to fetch location data');
        }

        const data = await response.json();
        
        if (data && data.length > 0) {
          const { lat, lon, display_name } = data[0];
          handleLocationSelect({
            latitude: parseFloat(lat),
            longitude: parseFloat(lon),
            address: display_name,
          });
        } else {
          setError('No locations found');
        }
      } catch (error) {
        console.error('Error searching location:', error);
        setError('Failed to search location. Please try again.');
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  return (
    <Box className="space-y-4">
      <form onSubmit={(e) => e.preventDefault()} className="flex gap-2 relative">
        <TextField
          fullWidth
          placeholder="Search location..."
          value={searchQuery}
          onChange={handleSearchChange}
          size="small"
          disabled={loading}
          error={!!error}
          helperText={error}
        />
        {loading && (
          <CircularProgress
            size={24}
            className="absolute right-3 top-1/2 transform -translate-y-1/2"
          />
        )}
      </form>
      {error && (
        <Alert severity="error" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      <Box className="h-[400px] rounded-lg overflow-hidden">
        <MapContainer
          center={[21.0285, 105.8542]} // Default center (Hanoi)
          zoom={13}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker position={position} onLocationSelect={handleLocationSelect} />
        </MapContainer>
      </Box>
    </Box>
  );
};

export default MapLocationPicker;
