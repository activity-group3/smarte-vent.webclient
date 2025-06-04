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
  styled,
  InputLabel,
  Snackbar,
  Alert,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
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
  // LECTURER: "LECTURER",
  STUDENT: "STUDENT",
  ORGANIZATION: "ORGANIZATION",
};

const MajorType = {
  IT: "IT",
  EE: "EE",
  IS: "IS",
  AE: "AE",
  AI: "AI",
};

const SortFields = {
  ROLE: "role",
  IS_ACTIVE: "is_active",
  STUDENT_CODE: "student_code",
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
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [filters, setFilters] = useState({
    role: "",
    isActive: "",
    studentCode: "",
  });
  const [sorting, setSorting] = useState({
    field: SortFields.ROLE,
    direction: "asc",
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newAccount, setNewAccount] = useState({
    username: "",
    password: "",
    identify_code: "",
    full_name: "",
    email: "",
    phone: "",
    major: "",
    role: "STUDENT",
  });
  const [createError, setCreateError] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleSortChange = (field) => {
    setSorting((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPage(0);
  };

  const fetchAccounts = async () => {
    try {
      const token = localStorage.getItem("access_token");

      let queryString = `page=${page}&size=20&sort=${sorting.field},${sorting.direction}`;

      if (filters.role) {
        queryString += `&role=${filters.role}`;
      }
      if (filters.isActive !== "") {
        queryString += `&is_active=${filters.isActive}`;
      }
      if (filters.studentCode) {
        queryString += `&student_code=${filters.studentCode}`;
      }

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
    setPage(value - 1);
  };

  const handleFilterChange = (field) => (event) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
    setPage(0);
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
    setOpenDialog(true);
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

  const handleCreateAccount = async () => {
    try {
      setCreateError(null);
      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8080/accounts/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newAccount),
      });

      const data = await response.json();
      
      if (data.status_code === 201) {
        // Add the new account to the list
        setAccounts([...accounts, data.data]);
        setOpenCreateDialog(false);
        // Show success message
        setSnackbarMessage("Account created successfully!");
        setOpenSnackbar(true);
        // Reset form
        setNewAccount({
          username: "",
          password: "",
          identify_code: "",
          full_name: "",
          email: "",
          phone: "",
          major: "",
          role: "STUDENT",
        });
      } else {
        setCreateError(data.message || "Failed to create account");
      }
    } catch (error) {
      setCreateError("Network error occurred");
      console.error("Error creating account:", error);
    }
  };

  const handleNewAccountChange = (field) => (event) => {
    setNewAccount((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
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
                {((accounts.filter((a) => a.is_active) || [])).length}
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
            <Box className="flex justify-between items-center mb-6">
              <Typography variant="h6" className="font-semibold">
                Account Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenCreateDialog(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create Account
              </Button>
            </Box>

            <Box className="flex flex-wrap gap-4 mb-6 bg-white p-4 rounded-lg shadow-md">
              <FormControl className="min-w-[200px]">
                <StyledSelect
                  value={filters.role}
                  onChange={handleFilterChange("role")}
                  displayEmpty
                  className="bg-gray-50"
                >
                  <MenuItem value="">All Roles</MenuItem>
                  {Object.values(AccountRole).map((role) => (
                    <MenuItem key={role} value={role}>
                      {role}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </FormControl>

              <FormControl className="min-w-[200px]">
                <StyledSelect
                  value={filters.isActive}
                  onChange={handleFilterChange("isActive")}
                  displayEmpty
                  className="bg-gray-50"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </StyledSelect>
              </FormControl>

              <StyledTextField
                label="Student Code"
                value={filters.studentCode}
                onChange={handleFilterChange("studentCode")}
                className="min-w-[200px]"
                variant="outlined"
              />

              <FormControl className="min-w-[200px]">
                <StyledSelect
                  value={sorting.field}
                  onChange={(e) => handleSortChange(e.target.value)}
                  displayEmpty
                  className="bg-gray-50"
                >
                  <MenuItem value={SortFields.ROLE}>Sort by Role</MenuItem>
                  <MenuItem value={SortFields.IS_ACTIVE}>
                    Sort by Status
                  </MenuItem>
                  <MenuItem value={SortFields.STUDENT_CODE}>
                    Sort by Student Code
                  </MenuItem>
                </StyledSelect>
              </FormControl>

              <Chip
                label={
                  sorting.direction === "asc" ? "↑ Ascending" : "↓ Descending"
                }
                color="default"
                size="small"
                onClick={() => handleSortChange(sorting.field)}
                className="bg-gray-200 hover:bg-gray-300"
              />
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
                    Student Code
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
                    <TableCell>{account.student_code || "-"}</TableCell>
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
              page={page + 1}
              onChange={handlePageChange}
              color="primary"
              className="bg-white p-2 rounded-lg shadow-sm"
            />
          </Box>

          <Dialog
            open={openDialog}
            onClose={() => setOpenDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle className="bg-gray-50 text-gray-800 font-semibold">
              Edit Account
            </DialogTitle>
            <DialogContent className="pt-4">
              <Box>
                <StyledTextField
                  fullWidth
                  label="Name"
                  value={selectedAccount?.name || ""}
                  className="mb-4"
                  variant="outlined"
                />
                <StyledTextField
                  fullWidth
                  label="Email"
                  value={selectedAccount?.email || ""}
                  className="mb-4"
                  variant="outlined"
                />
                <StyledTextField
                  fullWidth
                  label="Phone"
                  value={selectedAccount?.phone || ""}
                  className="mb-4"
                  variant="outlined"
                />
              </Box>
            </DialogContent>
            <DialogActions className="bg-gray-50 p-4">
              <StyledButton
                onClick={() => setOpenDialog(false)}
                color="inherit"
              >
                Cancel
              </StyledButton>
              <StyledButton
                color="primary"
                onClick={() => {
                  // Add your save logic here
                  setOpenDialog(false);
                }}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Save
              </StyledButton>
            </DialogActions>
          </Dialog>

          <Dialog
            open={openCreateDialog}
            onClose={() => setOpenCreateDialog(false)}
            maxWidth="sm"
            fullWidth
          >
            <DialogTitle className="bg-gray-50 text-gray-800 font-semibold">
              Create New Account
            </DialogTitle>
            <DialogContent className="pt-4">
              <Box className="space-y-4">
                {createError && (
                  <Typography color="error" className="mb-4">
                    {createError}
                  </Typography>
                )}
                <StyledTextField
                  fullWidth
                  label="Username"
                  value={newAccount.username}
                  onChange={handleNewAccountChange("username")}
                  required
                />
                <StyledTextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={newAccount.password}
                  onChange={handleNewAccountChange("password")}
                  required
                />
                <StyledTextField
                  fullWidth
                  label="Identify Code"
                  value={newAccount.identify_code}
                  onChange={handleNewAccountChange("identify_code")}
                  required
                />
                <StyledTextField
                  fullWidth
                  label="Full Name"
                  value={newAccount.full_name}
                  onChange={handleNewAccountChange("full_name")}
                  required
                />
                <StyledTextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={newAccount.email}
                  onChange={handleNewAccountChange("email")}
                  required
                />
                <StyledTextField
                  fullWidth
                  label="Phone"
                  value={newAccount.phone}
                  onChange={handleNewAccountChange("phone")}
                />
                <FormControl fullWidth>
                  <InputLabel>Major</InputLabel>
                  <StyledSelect
                    value={newAccount.major}
                    onChange={handleNewAccountChange("major")}
                    label="Major"
                  >
                    {Object.entries(MajorType).map(([key, value]) => (
                      <MenuItem key={key} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Role</InputLabel>
                  <StyledSelect
                    value={newAccount.role}
                    onChange={handleNewAccountChange("role")}
                    label="Role"
                  >
                    {Object.entries(AccountRole).map(([key, value]) => (
                      <MenuItem key={key} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions className="bg-gray-50 p-4">
              <StyledButton
                onClick={() => setOpenCreateDialog(false)}
                color="inherit"
              >
                Cancel
              </StyledButton>
              <StyledButton
                color="primary"
                onClick={handleCreateAccount}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Create
              </StyledButton>
            </DialogActions>
          </Dialog>
        </Box>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity="success"
            variant="filled"
            sx={{ width: '100%' }}
          >
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </div>
    </LocalizationProvider>
  );
};

export default AdminAccountManage;
