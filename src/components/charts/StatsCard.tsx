// @ts-nocheck
import React from 'react';
import { Card, CardContent, Typography, Box } from '@mui/material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme, bgcolor }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: bgcolor || theme.palette.background.paper,
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-2px)',
    transition: 'all 0.3s ease-in-out'
  }
}));

interface StatsCardProps {
  title: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  bgColor?: string;
  change?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, bgColor, change }) => {
  return (
    <StyledCard bgcolor={bgColor as any}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
          <Typography variant="h6" color="text.secondary" fontSize="0.9rem">
            {title}
          </Typography>
          {icon && <Box sx={{ color: 'text.secondary' }}>{icon}</Box>}
        </Box>

        <Typography variant="h4" component="div" fontWeight="bold">
          {value}
        </Typography>

        {change !== undefined && (
          <Box display="flex" alignItems="center" mt={1}>
            <Typography
              variant="body2"
              color={change >= 0 ? 'success.main' : 'error.main'}
              fontWeight="bold"
            >
              {change >= 0 ? '+' : ''}{change}%
            </Typography>
            <Typography variant="body2" color="text.secondary" ml={1}>
              from previous period
            </Typography>
          </Box>
        )}
      </CardContent>
    </StyledCard>
  );
};

export default StatsCard; 
