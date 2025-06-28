// @ts-nocheck

import React, { useState, ChangeEvent, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
  Paper,
} from "@mui/material";
import Select from "@mui/material/Select";
import { SelectChangeEvent } from "@mui/material/Select";

/* ──────────────────────────────────────────────────────────
 *  Types & Initial State
 * ──────────────────────────────────────────────────────────*/
type Role = "STUDENT" | "LECTURER" | "ADMIN";

interface FormData {
  full_name: string;
  email: string;
  password: string;
  phone: string;
  identify_code: string;
  role: Role;
  is_active: boolean;
}

const INITIAL_STATE: FormData = {
  full_name: "",
  email: "",
  password: "",
  phone: "",
  identify_code: "",
  role: "STUDENT",
  is_active: true,
};

/* ──────────────────────────────────────────────────────────
 *  Component
 * ──────────────────────────────────────────────────────────*/
const CreateAccount: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>(INITIAL_STATE);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ---------- Update helpers ---------- */
  const updateField = <K extends keyof FormData>(key: K, value: FormData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: value }));

  const handleInputChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    updateField(name as keyof FormData, value);
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;

    if (name === "is_active") {
      updateField("is_active", value === "true");
    } else {
      updateField(name as keyof FormData, value as FormData[keyof FormData]);
    }
  };

  /* ---------- Submit ---------- */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("access_token");
      const res = await fetch("http://localhost:8080/auth/register", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (res.ok || data.status_code < 400) {
        navigate("/admin/accounts");
      } else {
        throw new Error(data.message || "Failed to create account");
      }
    } catch (err) {
      setError(`Network error: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        minHeight: "100vh",
        pt: 4,
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          width: "100%",
          maxWidth: 400,
          p: 4,
          display: "flex",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <Typography variant="h5" align="center" gutterBottom>
          Create New Account
        </Typography>

        {error && (
          <Typography color="error" variant="body2">
            {error}
          </Typography>
        )}

        <form
          onSubmit={handleSubmit}
          style={{ display: "flex", flexDirection: "column", gap: 16 }}
        >
          {/* Full Name */}
          <TextField
            label="Full Name"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            required
            fullWidth
          />

          {/* Email */}
          <TextField
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            fullWidth
          />

          {/* Password */}
          <TextField
            label="Password"
            name="password"
            type="password"
            inputProps={{ minLength: 6 }}
            value={formData.password}
            onChange={handleInputChange}
            required
            fullWidth
          />

          {/* Phone */}
          <TextField
            label="Phone"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            fullWidth
          />

          {/* Student Code */}
          <TextField
            label="Student Code"
            name="identify_code"
            value={formData.identify_code}
            onChange={handleInputChange}
            fullWidth
          />

          {/* Role */}
          <FormControl fullWidth>
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleSelectChange}
              required
            >
              <MenuItem value="STUDENT">Student</MenuItem>
              <MenuItem value="LECTURER">Lecturer</MenuItem>
              <MenuItem value="ADMIN">Admin</MenuItem>
            </Select>
          </FormControl>

          {/* Status */}
          <FormControl fullWidth>
            <InputLabel id="status-label">Status</InputLabel>
            <Select
              labelId="status-label"
              label="Status"
              name="is_active"
              value={formData.is_active ? "true" : "false"}
              onChange={handleSelectChange}
              required
            >
              <MenuItem value="true">Active</MenuItem>
              <MenuItem value="false">Inactive</MenuItem>
            </Select>
          </FormControl>

          {/* Submit */}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={loading}
            sx={{ mt: 1 }}
          >
            {loading ? "Creating..." : "Create Account"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default CreateAccount;
