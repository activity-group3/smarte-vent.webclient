import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  FormControl,
  Select,
  MenuItem,
  TextField,
  Chip,
  Pagination,
  Switch,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormHelperText,
  InputLabel,
  FormControlLabel,
  styled,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Close as CloseIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import "tailwindcss/tailwind.css";
import {
  FaUsers,
  FaUserCheck,
  FaUserShield,
  FaCalendar,
  FaCalendarCheck,
  FaCheck,
  FaSignOutAlt,
  FaBell,
} from "react-icons/fa";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";

// Custom styled components using Material-UI with Tailwind classes
const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  boxShadow: theme.shadows[4],
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiOutlinedInput-root": {
    borderRadius: "0.5rem",
    backgroundColor: theme.palette.background.default,
    "&:hover fieldset": {
      borderColor: theme.palette.primary.main,
    },
  },
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  borderRadius: "0.5rem",
  backgroundColor: theme.palette.background.default,
  "&:hover .MuiOutlinedInput-notchedOutline": {
    borderColor: theme.palette.primary.main,
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: "0.5rem",
  padding: theme.spacing(1, 3),
  textTransform: "none",
  fontWeight: 600,
}));

const AccountRole = {
  ADMIN: "ADMIN",
  STUDENT: "STUDENT",
  ORGANIZATION: "ORGANIZATION"
};

const MajorType = [
  { value: "IT", label: "Information Technology" },
  { value: "EE", label: "Electrical Engineering" },
  { value: "IS", label: "Information Security" },
  { value: "AE", label: "Automation Engineering" },
  { value: "AI", label: "Artificial Intelligence" }
];

const SortFields = {
  ROLE: "role",
  IS_ACTIVE: "is_active",
  IDENTIFY_CODE: "identify_code",
};

const getRoleColor = (role) => {
  switch (role) {
    case "ADMIN":
      return "error";
    case "STUDENT":
      return "primary";
    default:
      return "default";
  }
};

const AdminAccountManage = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState([]);
  const [page, setPage] = useState(1); // Start from page 1
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    full_name: "",
    email: "",
    phone: "",
    identify_code: "",
    role: "",
    major: "",
    is_active: "",
  });
  const [sorting, setSorting] = useState({
    field: SortFields.ROLE,
    direction: "asc",
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    major: '',
    role: '',
    is_active: true
  });
  const [errors, setErrors] = useState({});

  const handleSortChange = (field) => {
    setSorting((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPage(1);
  };

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem("access_token");

      // Build query parameters
      const params = new URLSearchParams({
        page: page - 1, // Convert to 0-based for the API
        size: 20,
        sort: `${sorting.field},${sorting.direction}`
      });

      // Add filters if they have values
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          params.append(key, value);
        }
      });

      const queryString = params.toString();

      const response = await fetch(
        `http://localhost:8080/accounts?${queryString}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setAccounts(data.data.results);
      setTotalPages(data.data.total_pages);
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [page, filters, sorting]);

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleStatusChange = async (accountId, currentStatus) => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8080/accounts/${accountId}/change-status`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setAccounts(
        accounts.map((account) =>
          account.id === accountId
            ? { ...account, is_active: !currentStatus }
            : account
        )
      );
    } catch (error) {
      console.error("Error updating account status:", error);
    }
  };

  const handleEdit = (account) => {
    setSelectedAccount(account);
    setFormData({
      full_name: account.name || '',
      email: account.email || '',
      phone: account.phone || '',
      major: account.major || '',
      role: account.role || '',
      is_active: account.is_active || false
    });
    setErrors({});
    setOpenDialog(true);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.full_name.trim()) {
      newErrors.full_name = 'Full name is required';
    } else if (formData.full_name.length > 100) {
      newErrors.full_name = 'Full name must be less than 100 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    } else if (formData.email.length > 100) {
      newErrors.email = 'Email must be less than 100 characters';
    }

    if (!formData.phone) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^[0-9]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number must be 10-15 digits';
    }

    if (!formData.major) {
      newErrors.major = 'Major is required';
    }

    if (!formData.role) {
      newErrors.role = 'Role is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem('access_token');
      const response = await fetch(
        `http://localhost:8080/admin/accounts/update`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            id: selectedAccount.id
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update account');
      }

      // Refresh accounts list
      await fetchAccounts();
      setOpenDialog(false);

    } catch (error) {
      console.error('Error updating account:', error);
      // Handle error (e.g., show error message)
    }
  };

  const handleRemove = async (accountId) => {
    if (window.confirm("Are you sure you want to remove this account?")) {
      try {
        const token = localStorage.getItem("access_token");
        const response = await fetch(
          `http://localhost:8080/accounts/${accountId}/delete`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        setAccounts(accounts.filter((account) => account.id !== accountId));
      } catch (error) {
        console.error("Error removing account:", error);
      }
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div className="p-6 md:p-10">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Admin Dashboard
              </h1>
            </div>
          </div>
        </header>
        <Box className="p-6 bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Total Users</h3>
                <div className="bg-white/20 p-3 rounded-full">
                  <FaUsers className="text-white text-xl" />
                </div>
              </div>
              <p className="text-4xl font-bold">{accounts.length}</p>
            </div>

            <div className="bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Active Users</h3>
                <div className="bg-white/20 p-3 rounded-full">
                  <FaUserCheck className="text-white text-xl" />
                </div>
              </div>
              <p className="text-4xl font-bold">
                {accounts.filter((a) => a.is_active).length}
              </p>
            </div>

            <div className="bg-gradient-to-r from-purple-500 to-violet-500 rounded-2xl p-6 text-white shadow-lg transform transition-all duration-300 hover:scale-105 hover:shadow-xl">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Admins</h3>
                <div className="bg-white/20 p-3 rounded-full">
                  <FaUserShield className="text-white text-xl" />
                </div>
              </div>
              <p className="text-4xl font-bold">
                {accounts.filter((a) => a.role === "ADMIN").length}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-md p-6 mb-8">
            <Box className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-6 bg-white p-4 rounded-lg shadow-md">
              <TextField
                label="Full Name"
                value={filters.full_name}
                onChange={handleFilterChange("full_name")}
                variant="outlined"
                size="small"
                fullWidth
              />

              <TextField
                label="Email"
                value={filters.email}
                onChange={handleFilterChange("email")}
                variant="outlined"
                size="small"
                fullWidth
              />

              <TextField
                label="Phone"
                value={filters.phone}
                onChange={handleFilterChange("phone")}
                variant="outlined"
                size="small"
                fullWidth
              />

              <TextField
                label="Identify Code"
                value={filters.identify_code}
                onChange={handleFilterChange("identify_code")}
                variant="outlined"
                size="small"
                fullWidth
              />

              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>Role</InputLabel>
                <Select
                  value={filters.role}
                  onChange={handleFilterChange("role")}
                  label="Role"
                >
                  <MenuItem value="">All Roles</MenuItem>
                  {Object.entries(AccountRole).map(([key, value]) => (
                    <MenuItem key={key} value={value}>{value}</MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>Major</InputLabel>
                <Select
                  value={filters.major}
                  onChange={handleFilterChange("major")}
                  label="Major"
                >
                  <MenuItem value="">All Majors</MenuItem>
                  {MajorType.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl variant="outlined" size="small" fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filters.is_active}
                  onChange={handleFilterChange("is_active")}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </Select>
              </FormControl>

              <Button
                variant="contained"
                color="primary"
                onClick={() => fetchAccounts()}
                className="h-[40px]"
              >
                Search
              </Button>

              <FormControl variant="outlined" size="small" className="min-w-[200px]">
                <InputLabel>Sort By</InputLabel>
                <Select
                  value={sorting.field}
                  onChange={(e) => handleSortChange(e.target.value)}
                  label="Sort By"
                >
                  <MenuItem value="full_name">Full Name</MenuItem>
                  <MenuItem value="email">Email</MenuItem>
                  <MenuItem value="role">Role</MenuItem>
                  <MenuItem value="is_active">Status</MenuItem>
                  <MenuItem value="identify_code">Identify Code</MenuItem>
                </Select>
              </FormControl>

              <IconButton
                onClick={() => handleSortChange(sorting.field)}
                className="bg-gray-200 hover:bg-gray-300 border border-gray-300"
                title={sorting.direction === 'asc' ? 'Sort ascending' : 'Sort descending'}
              >
                {sorting.direction === 'asc' ? '↑ Asc' : '↓ Desc'}
              </IconButton>

              {/* <Chip
                label={
                  sorting.direction === "asc" ? "↑ Ascending" : "↓ Descending"
                }
                color="default"
                size="small"
                onClick={() => handleSortChange(sorting.field)}
                className="bg-gray-200 hover:bg-gray-300"
              /> */}
            </Box>
          </div>

          <StyledTableContainer
            component={Paper}
            className="rounded-2xl overflow-hidden bg-white dark:bg-slate-800"
          >
            <Table>
              <TableHead>
                <TableRow className="bg-gray-100">
                  <TableCell className="font-semibold text-gray-700">
                    ID
                  </TableCell>
                  <TableCell className="font-semibold text-gray-700">
                    Name
                  </TableCell>
                  <TableCell className="font-semibold text-gray-700">
                    Email
                  </TableCell>
                  <TableCell className="font-semibold text-gray-700">
                    Phone
                  </TableCell>
                  <TableCell className="font-semibold text-gray-700">
                    Identify Code
                  </TableCell>
                  <TableCell className="font-semibold text-gray-700">
                    Status
                  </TableCell>
                  <TableCell className="font-semibold text-gray-700">
                    Role
                  </TableCell>
                  <TableCell className="font-semibold text-gray-700">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {accounts.map((account) => (
                  <TableRow key={account.id} className="hover:bg-gray-50">
                    <TableCell>{account.id}</TableCell>
                    <TableCell>{account.name}</TableCell>
                    <TableCell>{account.email}</TableCell>
                    <TableCell>{account.phone || "-"}</TableCell>
                    <TableCell>{account.identify_code || "-"}</TableCell>
                    <TableCell>
                      <Switch
                        checked={account.is_active || false}
                        onChange={() =>
                          handleStatusChange(account.id, account.is_active)
                        }
                        color="success"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={account.role}
                        color={getRoleColor(account.role)}
                        size="small"
                        variant="outlined"
                        className="font-medium"
                      />
                    </TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        color="primary"
                        onClick={() => handleEdit(account)}
                        className="mr-2 hover:text-blue-600"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => handleRemove(account.id)}
                        className="hover:text-red-600"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </StyledTableContainer>

          <Box className="mt-4 flex justify-center">
            <Pagination
              count={totalPages}
              page={page}
              onChange={handlePageChange}
              color="primary"
              className="mt-4 flex justify-center"
            />
          </Box>

          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle className="flex justify-between items-center bg-gray-50">
              <span className="text-gray-800 font-semibold">Edit Account</span>
              <IconButton onClick={() => setOpenDialog(false)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
              <DialogContent dividers className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="Full Name *"
                    name="full_name"
                    value={formData.full_name}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={!!errors.full_name}
                    helperText={errors.full_name}
                  />

                  <TextField
                    label="Email *"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={!!errors.email}
                    helperText={errors.email}
                  />

                  <TextField
                    label="Phone *"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    fullWidth
                    margin="normal"
                    error={!!errors.phone}
                    helperText={errors.phone || '10-15 digits'}
                  />

                  <FormControl fullWidth margin="normal" error={!!errors.major}>
                    <InputLabel>Major *</InputLabel>
                    <Select
                      name="major"
                      value={formData.major}
                      onChange={handleInputChange}
                      label="Major *"
                    >
                      {MajorType.map((option) => (
                        <MenuItem key={option.value} value={option.value}>
                          {option.label}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.major && <FormHelperText>{errors.major}</FormHelperText>}
                  </FormControl>

                  <FormControl fullWidth margin="normal" error={!!errors.role}>
                    <InputLabel>Role *</InputLabel>
                    <Select
                      name="role"
                      value={formData.role}
                      onChange={handleInputChange}
                      label="Role *"
                    >
                      {Object.entries(AccountRole).map(([key, value]) => (
                        <MenuItem key={key} value={value}>{value}</MenuItem>
                      ))}
                    </Select>
                    {errors.role && <FormHelperText>{errors.role}</FormHelperText>}
                  </FormControl>

                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.is_active}
                        onChange={(e) =>
                          setFormData(prev => ({
                            ...prev,
                            is_active: e.target.checked
                          }))
                        }
                        name="is_active"
                        color="primary"
                      />
                    }
                    label={formData.is_active ? 'Active' : 'Inactive'}
                    className="mt-6"
                  />
                </div>
              </DialogContent>
              <DialogActions className="p-4 bg-gray-50">
                <Button
                  onClick={() => setOpenDialog(false)}
                  variant="outlined"
                  color="inherit"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                >
                  Save Changes
                </Button>
              </DialogActions>
            </form>
          </Dialog>
        </Box>
      </div>
    </LocalizationProvider>
  );
};

export default AdminAccountManage;
