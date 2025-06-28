  // @ts-nocheck
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
  FormHelperText,
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import "tailwindcss/tailwind.css";
import {
  FaUsers,
  FaSignOutAlt,
  FaBell,
  FaSearch,
} from "react-icons/fa";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { SelectChangeEvent } from "@mui/material/Select";
import { FaUserCheck, FaUserShield } from "react-icons/fa";

// Custom styled components using Material-UI with Tailwind classes
const StyledTableContainer = styled(TableContainer)(({ theme     }) => ({
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
  ORGANIZATION: "ORGANIZATION",
};

const MajorType = {
  NONE: "",  // Empty string for None option
  IT: "IT",
  EE: "EE",
  IS: "IS",
  AE: "AE",
  AI: "AI",
};

const SortFields = {
  ROLE: "role",
  IS_ACTIVE: "isActive",
  STUDENT_CODE: "studentCode",
};

const getRoleColor = (role: string) => {
  switch (role) {
    case "ADMIN":
      return "error";
    case "STUDENT":
      return "primary";
    default:
      return "default";
  }
};

// -------------------------
// Type definitions
// -------------------------

// Role and major types can be refined later if needed
export interface Account {
  id: number;
  username: string;
  name: string;
  email: string;
  phone?: string;
  identify_code?: string;
  major?: string;
  role: keyof typeof AccountRole | string;
  is_active: boolean;
}

interface Filters {
  fullName: string;
  email: string;
  phone: string;
  identifyCode: string;
  role: string;
  major: string;
  isActive: string;
}

interface NewAccount {
  username: string;
  password: string;
  identifyCode: string;
  fullName: string;
  email: string;
  phone: string;
  major: string;
  role: string;
}

const AdminAccountManage: React.FC = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filters, setFilters] = useState<Filters>({
    fullName: "",
    email: "",
    phone: "",
    identifyCode: "",
    role: "",
    major: "",
    isActive: "",
  });
  const [sorting, setSorting] = useState({
    field: "fullName",
    direction: "asc",
  });
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Partial<Account> | null>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [newAccount, setNewAccount] = useState<NewAccount>({
    username: "",
    password: "",
    identifyCode: "",
    fullName: "",
    email: "",
    phone: "",
    major: "",
    role: "STUDENT",
  });
  const [createError, setCreateError] = useState<string | null>(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const handleSortChange = (field: string | keyof typeof SortFields) => {
    setSorting((prev) => ({
      field,
      direction:
        prev.field === field && prev.direction === "asc" ? "desc" : "asc",
    }));
    setPage(0);
  };

  const fetchAccounts = async (): Promise<void> => {
    try {
      const token = localStorage.getItem("access_token");

      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('size', '10');
      params.append('order', `${sorting.field},${sorting.direction}`);

      // Add filters if they exist
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) {
          // Convert isActive to boolean for the API
          if (key === 'isActive' && value !== '') {
            params.append('isActive', String(value === 'true'));
          } else {
            params.append(key, value);
          }
        }
      });

      const response = await fetch(
        `http://localhost:8080/accounts?${params.toString()}`,
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
      if (data.status_code === 200) {
        setAccounts(data.data.results);
        setTotalPages(data.data.total_pages);
        setTotalElements(data.data.total_elements);
      } else {
        throw new Error(data.message || "Failed to fetch accounts");
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
      // You might want to show an error message to the user here
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, [page, filters, sorting]);

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value - 1);
  };

  const handleSort = (field: string) => {
    setSorting(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : ''
    }));
    setPage(0);
  };

  const handleFilterChange = (field: keyof Filters) => (event: SelectChangeEvent<unknown>, _child?: React.ReactNode) => {
    const value = event.target.value;
    setFilters((prev) => ({
      ...prev,
      [field]: field === 'isActive' ? (value === 'true' ? true : value === 'false' ? false : '') : value,
    }));
    setPage(0);
  };

  const handleSearchInput = (field: keyof Filters) => (event: any) => {
    setFilters((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleSearch = () => {
    setPage(0);
    fetchAccounts();
  };

  const handleStatusChange = async (accountId: number, currentStatus: boolean): Promise<void> => {
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
          body: JSON.stringify({
            is_active: !currentStatus
          }),
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
    } catch (err) {
      const error = err as Error;
      console.error("Error updating account status:", error);
    }
  };

  const handleEdit = (account: Account) => {
    setSelectedAccount(account);
    setOpenDialog(true);
  };

  const handleRemove = async (accountId: number) => {
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
      } catch (err) {
        const error = err as Error;
        console.error("Error removing account:", error);
      }
    }
  };

  const validateFields = (data: Partial<Record<string, any>>): Record<string, string> => {
    const errors: { [key: string]: string } = {};
    
    // Full Name validation
    if (!data.full_name) {
      errors.full_name = "Full name is required";
    } else if (data.full_name.length > 100) {
      errors.full_name = "Full name must be less than 100 characters";
    }

    // Email validation
    if (!data.email) {
      errors.email = "Email is required";
    } else if (data.email.length > 100) {
      errors.email = "Email must be less than 100 characters";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(data.email)) {
      errors.email = "Email should be valid";
    }

    // Phone validation
    if (!data.phone) {
      errors.phone = "Phone number is required";
    } else if (!/^[0-9]{10,15}$/.test(data.phone)) {
      errors.phone = "Phone number must be 10-15 digits";
    }

    // Major validation - only required for STUDENT role
    if (data.role === 'STUDENT' && !data.major) {
      errors.major = "Major is required for student accounts";
    }

    // Role validation
    if (!data.role) {
      errors.role = "Role is required";
    }

    return errors;
  };

  const handleCreateAccount = async () => {
    try {
      setCreateError(null);
      setValidationErrors({});

      const accountData = {
        username: newAccount.username,
        password: newAccount.password,
        identify_code: newAccount.identifyCode,
        full_name: newAccount.fullName,
        email: newAccount.email,
        phone: newAccount.phone,
        major: newAccount.major || null,
        role: newAccount.role,
      };

      const errors = validateFields(accountData);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      const token = localStorage.getItem("access_token");
      const response = await fetch("http://localhost:8080/accounts/create", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(accountData),
      });

      const data = await response.json();

      if (data.status_code === 201) {
        setAccounts([...accounts]);
        setOpenCreateDialog(false);
        setSnackbarMessage("Account created successfully!");
        setOpenSnackbar(true);
        setNewAccount({
          username: "",
          password: "",
          identifyCode: "",
          fullName: "",
          email: "",
          phone: "",
          major: "",
          role: "STUDENT",
        });
      } else {
        setCreateError(data.message || "Failed to create account");
      }
    } catch (err) {
      const error = err as Error;
      setCreateError("Network error occurred");
      console.error("Error creating account:", error);
    }
  };

  const handleNewAccountChange = (field: keyof NewAccount) => (event: any) => {
    setNewAccount((prev) => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleCloseSnackbar = (_event?: any, reason?: string) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenSnackbar(false);
  };

  const handleUpdateAccount = async (): Promise<void> => {
    try {
      setValidationErrors({});

      const accountData = {
        id: selectedAccount?.id,
        username: selectedAccount?.username || "",
        identify_code: selectedAccount?.identify_code || "",
        full_name: selectedAccount?.name || "",
        email: selectedAccount?.email || "",
        phone: selectedAccount?.phone || "",
        major: selectedAccount?.major || "",
        role: selectedAccount?.role || "",
        is_active: selectedAccount?.is_active || false,
      };

      const errors = validateFields(accountData);
      if (Object.keys(errors).length > 0) {
        setValidationErrors(errors);
        return;
      }

      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:8080/admin/accounts/update`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(accountData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (data.status_code === 200) {
        setSnackbarMessage("Account updated successfully!");
        setOpenSnackbar(true);
        setOpenDialog(false);
        fetchAccounts();
      } else {
        throw new Error(data.message || "Failed to update account");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Error updating account:", error);
      setSnackbarMessage(error.message || "Failed to update account");
      setOpenSnackbar(true);
    }
  };

  // Utility to safely update selectedAccount
  const updateSelectedAccount = (patch: Partial<Account>) => {
    setSelectedAccount(prev => (prev ? { ...prev, ...patch } : prev));
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
        {/* @ts-nocheck */}
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
                {((accounts as Account[]).filter((a) => a.is_active) || []).length}
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
                {(accounts as Account[]).filter((a) => a.role === "ADMIN").length}
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
              <StyledTextField
                label="Full Name"
                value={filters.fullName}
                onChange={handleSearchInput("fullName")}
                className="min-w-[200px]"
                variant="outlined"
              />

              <StyledTextField
                label="Email"
                value={filters.email}
                onChange={handleSearchInput("email")}
                className="min-w-[200px]"
                variant="outlined"
              />

              <StyledTextField
                label="Phone"
                value={filters.phone}
                onChange={handleSearchInput("phone")}
                className="min-w-[200px]"
                variant="outlined"
              />

              <StyledTextField
                label="Identify Code"
                value={filters.identifyCode}
                onChange={handleSearchInput("identifyCode")}
                className="min-w-[200px]"
                variant="outlined"
              />

              <FormControl className="min-w-[200px]">
                <InputLabel>Role</InputLabel>
                <StyledSelect
                  value={filters.role}
                  onChange={handleFilterChange("role")}
                  label="Role"
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
                <InputLabel>Major</InputLabel>
                <StyledSelect
                  value={filters.major}
                  onChange={handleFilterChange("major")}
                  label="Major"
                >
                  <MenuItem value="">All Majors</MenuItem>
                <MenuItem value="">None</MenuItem>
                  {Object.values(MajorType).map((major) => (
                    <MenuItem key={major} value={major}>
                      {major}
                    </MenuItem>
                  ))}
                </StyledSelect>
              </FormControl>

              <FormControl className="min-w-[200px]">
                <InputLabel>Status</InputLabel>
                <StyledSelect
                  value={filters.isActive}
                  onChange={handleFilterChange("isActive")}
                  label="Status"
                >
                  <MenuItem value="">All Status</MenuItem>
                  <MenuItem value="true">Active</MenuItem>
                  <MenuItem value="false">Inactive</MenuItem>
                </StyledSelect>
              </FormControl>

              <Button
                variant="contained"
                onClick={handleSearch}
                className="bg-blue-600 hover:bg-blue-700"
                startIcon={<FaSearch />}
              >
                Search
              </Button>
            </Box>
          </div>

          <Paper className="rounded-2xl overflow-hidden bg-white dark:bg-slate-800">
            <StyledTableContainer>
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
                      <TableCell>{account.identify_code || "-"}</TableCell>
                      <TableCell>
                        <Switch
                          checked={account.is_active}
                          onChange={() => handleStatusChange(account.id, account.is_active)}
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
          </Paper>

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
              <Box className="space-y-4">
                <StyledTextField
                  fullWidth
                  label="Username"
                  value={selectedAccount?.username || ""}
                  disabled
                  className="mb-4"
                  variant="outlined"
                />
                <StyledTextField
                  fullWidth
                  label="Identify Code"
                  value={selectedAccount?.identify_code || ""}
                  disabled
                  className="mb-4"
                  variant="outlined"
                />
                <StyledTextField
                  fullWidth
                  label="Full Name"
                  value={selectedAccount?.name || ""}
                  onChange={(e) => updateSelectedAccount({ name: e.target.value })}
                  required
                  error={!!validationErrors.fullName}
                  helperText={validationErrors.fullName}
                  className="mb-4"
                  variant="outlined"
                />
                <StyledTextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={selectedAccount?.email || ""}
                  onChange={(e) => updateSelectedAccount({ email: e.target.value })}
                  required
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                  className="mb-4"
                  variant="outlined"
                />
                <StyledTextField
                  fullWidth
                  label="Phone"
                  value={selectedAccount?.phone || ""}
                  onChange={(e) => updateSelectedAccount({ phone: e.target.value as string })}
                  required
                  error={!!validationErrors.phone}
                  helperText={validationErrors.phone}
                  className="mb-4"
                  variant="outlined"
                />
                <FormControl fullWidth error={!!validationErrors.major}>
                  <InputLabel>Major</InputLabel>
                  <StyledSelect
                    value={selectedAccount?.major || ""}
                    onChange={(e) => updateSelectedAccount({ major: e.target.value as string })}
                    label="Major"
                  >
                    {Object.entries(MajorType).map(([key, value]) => (
                      <MenuItem key={key} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                  {validationErrors.major && (
                    <FormHelperText>{validationErrors.major}</FormHelperText>
                  )}
                </FormControl>
                <FormControl fullWidth error={!!validationErrors.role}>
                  <InputLabel>Role</InputLabel>
                  <StyledSelect
                    value={selectedAccount?.role || ""}
                    onChange={(e) => updateSelectedAccount({ role: e.target.value as string })}
                    label="Role"
                  >
                    {Object.entries(AccountRole).map(([key, value]) => (
                      <MenuItem key={key} value={value}>
                        {value}
                      </MenuItem>
                    ))}
                  </StyledSelect>
                  {validationErrors.role && (
                    <FormHelperText>{validationErrors.role}</FormHelperText>
                  )}
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <StyledSelect
                    value={selectedAccount?.is_active ? "true" : "false"}
                    onChange={(e) => updateSelectedAccount({ is_active: e.target.value === "true" })}
                    label="Status"
                  >
                    <MenuItem value="true">Active</MenuItem>
                    <MenuItem value="false">Inactive</MenuItem>
                  </StyledSelect>
                </FormControl>
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
                onClick={handleUpdateAccount}
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
                  error={!!validationErrors.username}
                  helperText={validationErrors.username}
                />
                <StyledTextField
                  fullWidth
                  label="Password"
                  type="password"
                  value={newAccount.password}
                  onChange={handleNewAccountChange("password")}
                  required
                  error={!!validationErrors.password}
                  helperText={validationErrors.password}
                />
                <StyledTextField
                  fullWidth
                  label="Identify Code"
                  value={newAccount.identifyCode}
                  onChange={handleNewAccountChange("identifyCode")}
                  required
                  error={!!validationErrors.identifyCode}
                  helperText={validationErrors.identifyCode}
                />
                <StyledTextField
                  fullWidth
                  label="Full Name"
                  value={newAccount.fullName}
                  onChange={handleNewAccountChange("fullName")}
                  required
                  error={!!validationErrors.fullName}
                  helperText={validationErrors.fullName}
                />
                <StyledTextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={newAccount.email}
                  onChange={handleNewAccountChange("email")}
                  required
                  error={!!validationErrors.email}
                  helperText={validationErrors.email}
                />
                <StyledTextField
                  fullWidth
                  label="Phone"
                  value={newAccount.phone}
                  onChange={handleNewAccountChange("phone")}
                  required
                  error={!!validationErrors.phone}
                  helperText={validationErrors.phone}
                />
                <FormControl fullWidth error={!!validationErrors.major}>
                  <InputLabel>Major</InputLabel>
                  <StyledSelect
                    value={newAccount.major || ''}
                    onChange={handleNewAccountChange("major")}
                    label="Major"
                    displayEmpty
                  >
                    <MenuItem value="">
                      <em>None</em>
                    </MenuItem>
                    {Object.entries(MajorType)
                      .filter(([key]) => key !== 'NONE')
                      .map(([key, value]) => (
                        <MenuItem key={key} value={value}>
                          {value}
                        </MenuItem>
                      ))}
                  </StyledSelect>
                  {validationErrors.major && (
                    <FormHelperText>{validationErrors.major}</FormHelperText>
                  )}
                </FormControl>
                <FormControl fullWidth error={!!validationErrors.role}>
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
                  {validationErrors.role && (
                    <FormHelperText>{validationErrors.role}</FormHelperText>
                  )}
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
