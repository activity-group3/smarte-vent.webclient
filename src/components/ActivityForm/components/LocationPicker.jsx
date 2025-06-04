import React from 'react';
import { Box, Typography } from '@mui/material';
import MapLocationPicker from '../../../components/MapLocationPicker';
import FormField from './FormField';

const LocationPicker = ({
  formData,
  onLocationSelect,
  errors = {}
}) => {
  const handleLocationSelect = (location) => {
    onLocationSelect({
      address: location.address,
      latitude: location.latitude.toString(),
      longitude: location.longitude.toString(),
      activity_venue: location.address,
    });
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Location Details
      </Typography>
      
      <Box sx={{ mb: 3 }}>
        <MapLocationPicker onLocationSelect={handleLocationSelect} />
      </Box>
      
      <Box sx={{ mb: 2 }}>
        <FormField
          label="Address"
          name="address"
          value={formData.address}
          disabled
          fullWidth
          error={errors.address}
          helperText={errors.address}
        />
      </Box>
      
      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <FormField
          label="Latitude"
          name="latitude"
          value={formData.latitude}
          disabled
          error={errors.latitude}
          helperText={errors.latitude}
        />
        <FormField
          label="Longitude"
          name="longitude"
          value={formData.longitude}
          disabled
          error={errors.longitude}
          helperText={errors.longitude}
        />
      </Box>
    </Box>
  );
};

export default LocationPicker;
