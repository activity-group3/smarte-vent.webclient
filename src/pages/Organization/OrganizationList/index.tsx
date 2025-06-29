import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import {
  Box,
  TextField,
  Pagination,
  FormControl,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  boxShadow: theme.shadows[4],
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  fontWeight: 'bold',
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.common.white,
}));

const OrganizationType = {
  CLUB: 'CLUB',
  COMPANY: 'COMPANY',
  GOVERNMENT: 'GOVERNMENT',
  EDUCATIONAL: 'EDUCATIONAL',
} as const;

type OrganizationTypeKey = keyof typeof OrganizationType;

interface Organization {
  id: number;
  organization_name: string;
  organization_type: string;
  representative_phone: string;
  representative_email: string;
}

interface SearchParams {
  name: string;
  organizationType: string;
  size: number;
}

const OrganizationList: React.FC = () => {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(0);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [searchParams, setSearchParams] = useState<SearchParams>({
    name: '',
    organizationType: '',
    size: 20,
  });

  const fetchOrganizations = async () => {
    setLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: String(page - 1),
        size: String(searchParams.size),
        ...(searchParams.name && { name: searchParams.name }),
        ...(searchParams.organizationType && { organizationType: searchParams.organizationType }),
      });

      const response = await fetch(`http://localhost:8080/organizations/search?${queryParams}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      const result = await response.json();

      if (result.status_code === 200) {
        setOrganizations(result.data.results);
        setTotalPages(result.data.total_pages);
        setTotalElements(result.data.total_elements);
      } else {
        setError('Failed to fetch organizations');
      }
    } catch (err) {
      setError('Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, searchParams]);

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setPage(1);
  };

  return (
    // @ts-ignore
    <Box className="p-6 space-y-6">
      <Typography variant="h4" className="mb-6">
        Organizations
      </Typography>

      <Paper className="p-4">
        <form onSubmit={handleSearch} className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <TextField
            label="Organization Name"
            value={searchParams.name}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setSearchParams((prev) => ({ ...prev, name: e.target.value }))
            }
            fullWidth
          />

          <FormControl fullWidth>
            <Select
              value={searchParams.organizationType}
              onChange={(e) =>
                setSearchParams((prev) => ({
                  ...prev,
                  organizationType: e.target.value as string,
                }))
              }
              displayEmpty
            >
              <MenuItem value="">All</MenuItem>
              {Object.entries(OrganizationType).map(([key, value]) => (
                <MenuItem key={key} value={value}>
                  {key.replace(/_/g, ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </form>
      </Paper>

      {/* Results */}
      {error && (
        <Alert severity="error" className="mb-4">
          {error}
        </Alert>
      )}

      <Box className="space-y-4">
        {/* @ts-ignore */}
        <StyledTableContainer component={Paper} className="rounded-2xl overflow-hidden bg-white dark:bg-slate-800">
          <Table>
            <TableHead>
              <TableRow>
                <StyledTableCell>Name</StyledTableCell>
                <StyledTableCell>Type</StyledTableCell>
                <StyledTableCell>Phone</StyledTableCell>
                <StyledTableCell>Email</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" className="h-32">
                    <CircularProgress />
                  </TableCell>
                </TableRow>
              ) : organizations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" className="h-32">
                    No organizations found
                  </TableCell>
                </TableRow>
              ) : (
                organizations.map((org) => (
                  <TableRow key={org.id} hover>
                    <TableCell>{org.organization_name}</TableCell>
                    <TableCell>{org.organization_type?.replace(/_/g, ' ') || 'N/A'}</TableCell>
                    <TableCell>{org.representative_phone}</TableCell>
                    <TableCell>{org.representative_email}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </StyledTableContainer>

        {/* Pagination */}
        <Box className="mt-4 flex justify-center">
          <Pagination
            count={totalPages}
            page={page}
            onChange={(_e, newPage) => setPage(newPage)}
            color="primary"
            className="bg-white p-2 rounded-lg shadow-sm"
            showFirstButton
            showLastButton
            siblingCount={1}
            boundaryCount={1}
          />
        </Box>

        {/* Page Size and Info */}
        <Box className="flex justify-between items-center px-4 mt-2">
          <FormControl size="small" variant="outlined">
            <Select
              value={searchParams.size}
              onChange={(e) => {
                setSearchParams((prev) => ({
                  ...prev,
                  size: Number(e.target.value),
                }));
                setPage(1);
              }}
              className="bg-gray-50"
            >
              <MenuItem value={10}>10 per page</MenuItem>
              <MenuItem value={20}>20 per page</MenuItem>
              <MenuItem value={50}>50 per page</MenuItem>
              <MenuItem value={100}>100 per page</MenuItem>
            </Select>
          </FormControl>

          <Typography variant="body2" color="text.secondary">
            Showing {(page - 1) * searchParams.size + 1} to {Math.min(page * searchParams.size, totalElements)} of {totalElements} entries
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default OrganizationList; 
