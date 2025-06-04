import React from 'react';
import { 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Typography,
  Box,
  Rating
} from '@mui/material';

const DataTable = ({ title, data, columns }) => {
  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Typography variant="h6" gutterBottom component="div">
        {title}
      </Typography>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label={`${title} table`}>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.light' }}>
              {columns.map((column) => (
                <TableCell 
                  key={column.id}
                  align={column.align || 'left'}
                  style={{ fontWeight: 'bold' }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={index}
                sx={{ '&:nth-of-type(odd)': { backgroundColor: 'action.hover' } }}
              >
                {columns.map((column) => (
                  <TableCell key={column.id} align={column.align || 'left'}>
                    {column.format ? (
                      column.format(row[column.id])
                    ) : column.id === 'rating' ? (
                      <Rating value={parseFloat(row[column.id])} precision={0.5} readOnly />
                    ) : (
                      row[column.id]
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default DataTable;
