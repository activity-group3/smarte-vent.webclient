import React from 'react';
import { Link, useRouteError } from 'react-router-dom';
import './error.css';

interface RouteError {
  message?: string;
  status?: number;
  statusText?: string;
  data?: any;
}

const ErrorPage: React.FC = () => {
  const error = useRouteError() as RouteError;

  return (
    <div className="error-container">
      <div className="error-content">
        <h1>Oops!</h1>
        <h2>404 - Page Not Found</h2>
        <p>
          {error?.message || "Sorry, the page you are looking for doesn't exist."}
        </p>
        <Link to="/" className="error-button">
          Go to Home
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage; 
