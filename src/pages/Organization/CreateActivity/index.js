import React from 'react';
import { useNavigate } from 'react-router-dom';
import CreateActivity from '../../admin/CreateActivity';

const OrganizationCreateActivity = () => {
  return <CreateActivity userRole="ORGANIZATION" />;
};

export default OrganizationCreateActivity;
