import React from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography } from '@mui/material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <Box sx={{ bgcolor: 'background.paper', p: 2, border: '1px solid #ccc', borderRadius: 1 }}>
        <Typography variant="body2">{`${label}`}</Typography>
        {payload.map((entry, index) => (
          <Typography key={index} variant="body2" style={{ color: entry.color }}>
            {`${entry.name}: ${entry.value}`}
          </Typography>
        ))}
      </Box>
    );
  }
  return null;
};

const LineChart = ({ 
  data, 
  title, 
  xAxisDataKey = 'name',
  lines = [{ dataKey: 'value', name: 'Value', color: '#0088FE' }]
}) => {
  return (
    <Box sx={{ width: '100%', height: 300, mt: 2 }}>
      <Typography variant="h6" align="center" gutterBottom>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsLineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xAxisDataKey} />
          <YAxis />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {lines.map((line, index) => (
            <Line 
              key={line.dataKey}
              type="monotone"
              dataKey={line.dataKey} 
              name={line.name || line.dataKey} 
              stroke={line.color || COLORS[index % COLORS.length]} 
              activeDot={{ r: 8 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default LineChart;
