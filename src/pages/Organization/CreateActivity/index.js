import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateActivity from '../../Admin/CreateActivity';

const OrganizationCreateActivity = () => {
  return <CreateActivity userRole="ORGANIZATION" />;
};

export default OrganizationCreateActivity;
