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
} from "@mui/material";
import { Edit as EditIcon, Delete as DeleteIcon } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

const AccountRole = {
  ADMIN: "ADMIN",
  LECTURER: "LECTURER",
  STUDENT: "STUDENT",
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

      // Update local state
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

        // Remove from local state
        setAccounts(accounts.filter((account) => account.id !== accountId));
      } catch (error) {
        console.error("Error removing account:", error);
      }
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Account Management
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => navigate('/admin/create-account')}
        >
          Create Account
        </Button>
      </Box>

      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={filters.role}
            onChange={handleFilterChange("role")}
            displayEmpty
          >
            <MenuItem value="">All Roles</MenuItem>
            {Object.values(AccountRole).map((role) => (
              <MenuItem key={role} value={role}>
                {role}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={filters.isActive}
            onChange={handleFilterChange("isActive")}
            displayEmpty
          >
            <MenuItem value="">All Status</MenuItem>
            <MenuItem value="true">Active</MenuItem>
            <MenuItem value="false">Inactive</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Student Code"
          value={filters.studentCode}
          onChange={handleFilterChange("studentCode")}
          sx={{ minWidth: 200 }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <Select
            value={sorting.field}
            onChange={(e) => handleSortChange(e.target.value)}
            displayEmpty
          >
            <MenuItem value={SortFields.ROLE}>Sort by Role</MenuItem>
            <MenuItem value={SortFields.IS_ACTIVE}>Sort by Status</MenuItem>
            <MenuItem value={SortFields.STUDENT_CODE}>
              Sort by Student Code
            </MenuItem>
          </Select>
        </FormControl>

        <Chip
          label={sorting.direction === "asc" ? "↑ Ascending" : "↓ Descending"}
          color="default"
          size="small"
          onClick={() => handleSortChange(sorting.field)}
        />
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Student Code</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((account) => (
              <TableRow key={account.id}>
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
                    sx={{ fontWeight: "medium" }}
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    size="small"
                    color="primary"
                    onClick={() => handleEdit(account)}
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleRemove(account.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 2, display: "flex", justifyContent: "center" }}>
        <Pagination
          count={totalPages}
          page={page + 1}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Edit Account</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              value={selectedAccount?.name || ""}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Email"
              value={selectedAccount?.email || ""}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Phone"
              value={selectedAccount?.phone || ""}
              sx={{ mb: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            color="primary"
            onClick={() => {
              // Add your save logic here
              setOpenDialog(false);
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminAccountManage;
