// @ts-nocheck
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Paper,
  Box,
  Divider,
  Chip,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Fade, // Import Fade
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { FilterAlt, Refresh, Timeline, CompareArrows, Feedback, Analytics, TrendingUp, Lightbulb } from "@mui/icons-material";
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";
import activityStatisticsService from "../../services/activityStatisticsService";

interface ActivityStatisticsModalProps {
  open: boolean;
  onClose: () => void;
  statistics: any;
  loading: boolean;
  activityId: string;
}

const ActivityStatisticsModal: React.FC<ActivityStatisticsModalProps> = ({ open, onClose, statistics, loading, activityId }) => {
// ... keep the rest of the file content the same

}

export default ActivityStatisticsModal;
