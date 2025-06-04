import React, { useState, useEffect, useRef } from "react";
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  CircularProgress,
  Divider,
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  Chip,
} from "@mui/material";
import {
  Notifications as NotificationsIcon,
  MarkEmailRead as MarkReadIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { format } from "date-fns";
import notificationService from "../../services/notificationService";

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const isMenuOpen = Boolean(anchorEl);
  const menuRef = useRef(null);

  // Fetch notifications and unread count
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await notificationService.getNotifications(currentPage, 10); // Fixed size at 10
      setNotifications(data.items);  // Replace instead of concat
      setTotalPages(data.totalPages);

      const count = await notificationService.getUnreadCount();
      setCurrentPage((prev) => Math.min(prev, data.totalPages)); // Ensure currentPage does not exceed totalPages
      setUnreadCount(count);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  // Load initial notifications and setup polling for updates
  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every minute
    const interval = setInterval(() => {
      if (!isMenuOpen) {
        notificationService.getUnreadCount().then(count => {
          setUnreadCount(count);
        });
      }
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // Handle opening the notification menu
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications(); // Refresh notifications when opening
  };

  // Handle closing the notification menu
  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  // Open notification detail modal
  const handleOpenNotificationDetail = (notification, index) => {
    setSelectedNotification({ ...notification, index });
    setModalOpen(true);
    handleMenuClose();

    // If notification is not read, mark it as read
    if (!notification.isRead) {
      handleMarkAsRead(notification.id, index, false);
    }
  };

  // Close notification detail modal
  const handleCloseModal = () => {
    setModalOpen(false);
  };

  // Mark a notification as read
  const handleMarkAsRead = async (id, index, stopPropagation = true) => {
    try {
      await notificationService.markAsRead(id);

      // Update local state to reflect the read status
      const updatedNotifications = [...notifications];
      updatedNotifications[index] = { ...updatedNotifications[index], isRead: true };
      setNotifications(updatedNotifications);

      // Update unread count
      setUnreadCount(Math.max(0, unreadCount - 1));

      if (stopPropagation && selectedNotification && selectedNotification.id === id) {
        setSelectedNotification({ ...selectedNotification, isRead: true });
      }
    } catch (error) {
      console.error("Failed to mark notification as read", error);
    }
  };

  // Delete a notification
  const handleDeleteNotification = async (id, index) => {
    try {
      await notificationService.deleteNotification(id);

      // Remove the notification from the list
      const updatedNotifications = notifications.filter((_, i) => i !== index);
      setNotifications(updatedNotifications);

      // Update unread count if the deleted notification was unread
      if (!notifications[index].isRead) {
        setUnreadCount(Math.max(0, unreadCount - 1));
      }

      // Close modal if the deleted notification is currently viewed
      if (selectedNotification && selectedNotification.id === id) {
        setModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to delete notification", error);
    }
  };

  // Delete notification from modal
  const handleDeleteFromModal = async () => {
    if (selectedNotification) {
      await handleDeleteNotification(selectedNotification.id, selectedNotification.index);
      setModalOpen(false);
    }
  };

  // Load more notifications
  const handleLoadMore = () => {
    if (currentPage < totalPages) {
      fetchNotifications(currentPage + 1);
    }
  };

  return (
    <>
      <IconButton
        size="large"
        color="inherit"
        onClick={handleMenuOpen}
        aria-label="show notifications"
      >
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        id="notifications-menu"
        keepMounted
        open={isMenuOpen}
        onClose={handleMenuClose}
        ref={menuRef}
        PaperProps={{
          style: {
            maxHeight: '70vh',
            width: '350px',
            padding: '8px 0',
          },
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, px: 2, py: 1 }}>
          Notifications
        </Typography>
        <Divider />

        {loading && currentPage === 1 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2">No notifications</Typography>
          </MenuItem>
        ) : (
          <>
            {notifications.map((notification, index) => (
              <MenuItem
                key={notification.id}
                onClick={() => handleOpenNotificationDetail(notification, index)}
                sx={{
                  py: 2,
                  px: 2,
                  borderLeft: notification.isRead ? 'none' : '4px solid #1976d2',
                  backgroundColor: notification.isRead ? 'inherit' : 'rgba(25, 118, 210, 0.08)',
                  '&:hover': {
                    backgroundColor: notification.isRead ? 'rgba(0, 0, 0, 0.04)' : 'rgba(25, 118, 210, 0.12)',
                  },
                }}
              >
                <Box sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body1" sx={{ fontWeight: notification.isRead ? 400 : 600 }}>
                      {notification.title}
                    </Typography>
                    <Box sx={{ display: 'flex' }}>
                      {!notification.isRead && (
                        <Tooltip title="Mark as read">
                          <IconButton
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsRead(notification.id, index);
                            }}
                            aria-label="mark as read"
                          >
                            <MarkReadIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete notification">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id, index);
                          }}
                          aria-label="delete notification"
                          sx={{ ml: 0.5 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {notification.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {format(new Date(notification.createdAt), 'MMM dd, yyyy • h:mm a')}
                  </Typography>
                </Box>
              </MenuItem>
            ))}

            {currentPage < totalPages && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                <Button
                  onClick={handleLoadMore}
                  size="small"
                  disabled={loading}
                  variant="text"
                >
                  {loading ? <CircularProgress size={16} sx={{ mr: 1 }} /> : null}
                  Load More
                </Button>
              </Box>
            )}
          </>
        )}
      </Menu>

      {/* Notification Detail Modal */}
      <Dialog
        open={modalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
          },
        }}
      >
        {selectedNotification && (
          <>
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 1 }}>
              <Typography variant="h6" component="div" sx={{ fontWeight: 600 }}>
                Notification Details
              </Typography>
              <IconButton edge="end" color="inherit" onClick={handleCloseModal} aria-label="close">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent dividers>
              <Paper
                elevation={0}
                sx={{
                  p: 3,
                  mb: 2,
                  bgcolor: 'background.default',
                  borderRadius: 2,
                }}
              >
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'primary.main' }}>
                    {selectedNotification.title}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 3 }}>
                    <Chip
                      label={selectedNotification.isRead ? "Read" : "Unread"}
                      size="small"
                      color={selectedNotification.isRead ? "default" : "primary"}
                      sx={{ mr: 2 }}
                    />
                    <Chip
                      label={selectedNotification.type}
                      size="small"
                      color="secondary"
                    />
                  </Box>
                </Box>

                <Typography variant="body1" paragraph>
                  {selectedNotification.message}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right' }}>
                  {format(new Date(selectedNotification.createdAt), 'MMMM dd, yyyy • h:mm a')}
                </Typography>
              </Paper>
            </DialogContent>
            <DialogActions sx={{ px: 3, py: 2 }}>
              <Button onClick={handleCloseModal} variant="outlined">
                Close
              </Button>
              <Button
                onClick={handleDeleteFromModal}
                variant="contained"
                color="error"
                startIcon={<DeleteIcon />}
              >
                Delete Notification
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default NotificationDropdown;
