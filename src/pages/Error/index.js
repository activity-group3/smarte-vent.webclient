import React from 'react';
import { Link, useRouteError } from 'react-router-dom';
import './error.css';

const ErrorPage = () => {
  const error = useRouteError();

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
