import React from 'react';
import { PieChart as RechartsPieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'background.paper', p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
        <Typography variant="body2">{`${payload[0].name}: ${payload[0].value}`}</Typography>
        {payload[0].payload.percentage && (
          <Typography variant="body2">{`(${payload[0].payload.percentage.toFixed(2)}%)`}</Typography>
        )}
      </Box>
    );
  }
  return null;
};

const PieChart = ({ data, title, dataKey = 'value', nameKey = 'name' }) => {
  // Calculate the total for percentage calculations
  const total = data.reduce((sum, entry) => sum + entry[dataKey], 0);
  
  // Add percentage to each data entry
  const dataWithPercentage = data.map(item => ({
    ...item,
    percentage: (item[dataKey] / total) * 100
  }));

  return (
    <Box sx={{ width: '100%', height: 300, mt: 2 }}>
      <Typography variant="h6" align="center" gutterBottom>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsPieChart>
          <Pie
            data={dataWithPercentage}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey={dataKey}
            nameKey={nameKey}
            label={({ name, percentage }) => `${name}: ${percentage.toFixed(1)}%`}
          >
            {dataWithPercentage.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend />
        </RechartsPieChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default PieChart;
