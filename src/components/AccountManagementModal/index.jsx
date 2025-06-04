import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Tab,
  Tabs,
  Box,
  Typography,
  CircularProgress,
  Alert,
  IconButton,
  InputAdornment,
} from '@mui/material';
import {
  Close as CloseIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Save as SaveIcon,
} from '@mui/icons-material';
import { getMyAccount, updateAccount, changePassword } from '../../services/accountService';

const AccountManagementModal = ({ open, onClose }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [accountData, setAccountData] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    studentCode: '',
    major: '',
    organizationName: '',
  });
  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    if (open) {
      fetchAccountData();
    }
  }, [open]);

  const fetchAccountData = async () => {
    setLoading(true);
    try {
      const data = await getMyAccount();
      setAccountData(data);
      setFormData({
        id: data.id || '',
        name: data.name || '',
        email: data.email || '',
        phone: data.phone || '',
        studentCode: data.studentCode || '',
        major: data.major || '',
        organizationName: data.organizationName || '',
      });
    } catch (err) {
      setError('Failed to load account data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError(null);
    setSuccess(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdateAccount = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    try {
      const dataToSubmit = {
        id: formData.id,
        email: formData.email,
        phone: formData.phone,
      };
      
      await updateAccount(dataToSubmit);
      setSuccess('Account information updated successfully!');
      fetchAccountData(); // Refresh data
    } catch (err) {
      setError('Failed to update account information. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New password and confirm password do not match');
      setLoading(false);
      return;
    }
    
    try {
      await changePassword(passwordData);
      setSuccess('Password changed successfully!');
      setPasswordData({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err) {
      setError('Failed to change password. Please check your current password and try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h6" component="div">
          Account Management
        </Typography>
        <IconButton edge="end" color="inherit" onClick={onClose} aria-label="close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <Tabs
        value={activeTab}
        onChange={handleTabChange}
        indicatorColor="primary"
        textColor="primary"
        variant="fullWidth"
        sx={{ borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="Profile Information" />
        <Tab label="Change Password" />
      </Tabs>
      
      <DialogContent>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
            <CircularProgress />
          </Box>
        ) : (
          <>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}
            
            {activeTab === 0 && (
              <Box component="form" sx={{ mt: 2 }}>
                <TextField
                  margin="normal"
                  fullWidth
                  label="Name"
                  name="name"
                  value={formData.name}
                  disabled
                />
                
                {formData.studentCode && (
                  <>
                    <TextField
                      margin="normal"
                      fullWidth
                      label="Student Code"
                      name="studentCode"
                      value={formData.studentCode}
                      disabled
                    />
                    <TextField
                      margin="normal"
                      fullWidth
                      label="Major"
                      name="major"
                      value={formData.major}
                      disabled
                    />
                  </>
                )}
                
                {formData.organizationName && (
                  <TextField
                    margin="normal"
                    fullWidth
                    label="Organization Name"
                    name="organizationName"
                    value={formData.organizationName}
                    disabled
                  />
                )}
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  label="Email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                />
                
                <TextField
                  margin="normal"
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleFormChange}
                />
              </Box>
            )}
            
            {activeTab === 1 && (
              <Box component="form" sx={{ mt: 2 }}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="oldPassword"
                  label="Current Password"
                  type={showOldPassword ? 'text' : 'password'}
                  value={passwordData.oldPassword}
                  onChange={handlePasswordChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowOldPassword(!showOldPassword)}
                          edge="end"
                        >
                          {showOldPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="newPassword"
                  label="New Password"
                  type={showNewPassword ? 'text' : 'password'}
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          edge="end"
                        >
                          {showNewPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  name="confirmPassword"
                  label="Confirm New Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          edge="end"
                        >
                          {showConfirmPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            )}
          </>
        )}
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        {activeTab === 0 && (
          <Button 
            onClick={handleUpdateAccount} 
            variant="contained" 
            color="primary" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            Update Profile
          </Button>
        )}
        {activeTab === 1 && (
          <Button 
            onClick={handleChangePassword} 
            variant="contained" 
            color="primary" 
            disabled={loading || !passwordData.oldPassword || !passwordData.newPassword || !passwordData.confirmPassword}
            startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
          >
            Change Password
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default AccountManagementModal;
