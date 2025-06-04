import React from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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

const BarChart = ({ 
  data, 
  title, 
  xAxisDataKey = 'name',
  bars = [{ dataKey: 'value', name: 'Value', color: '#0088FE' }],
  layout = 'vertical'
}) => {
  return (
    <Box sx={{ width: '100%', height: 300, mt: 2 }}>
      <Typography variant="h6" align="center" gutterBottom>
        {title}
      </Typography>
      <ResponsiveContainer width="100%" height="100%">
        <RechartsBarChart
          data={data}
          layout={layout}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          {layout === 'vertical' ? (
            <>
              <XAxis type="number" />
              <YAxis dataKey={xAxisDataKey} type="category" />
            </>
          ) : (
            <>
              <XAxis dataKey={xAxisDataKey} />
              <YAxis />
            </>
          )}
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          {bars.map((bar, index) => (
            <Bar 
              key={bar.dataKey}
              dataKey={bar.dataKey} 
              name={bar.name || bar.dataKey} 
              fill={bar.color || COLORS[index % COLORS.length]} 
            />
          ))}
        </RechartsBarChart>
      </ResponsiveContainer>
    </Box>
  );
};

export default BarChart;
