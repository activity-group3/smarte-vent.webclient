import React from 'react';
import { Link } from 'react-router-dom';
import { FaCalendar, FaUsers, FaCertificate, FaChartBar } from 'react-icons/fa';
import './home.css';

const Home = () => {
  return (
    <div className="home-container">
      <nav className="home-nav">
        <div className="nav-brand">Student Activity Management</div>
        <div className="nav-links">
          <Link to="/auth/login">Login</Link>
        </div>
      </nav>
      
      <main className="home-main">
        <section className="hero-section">
          <h1>Manage Your University Activities</h1>
          <p>Track, participate, and grow through university activities and events</p>
        </section>

        <section className="features-section">
          <div className="feature-card">
            <FaCalendar className="feature-icon" />
            <h3>Activity Calendar</h3>
            <p>Browse and join upcoming university events and activities</p>
          </div>
          
          <div className="feature-card">
            <FaUsers className="feature-icon" />
            <h3>Team Collaboration</h3>
            <p>Connect with other students and form activity groups</p>
          </div>
          
          <div className="feature-card">
            <FaCertificate className="feature-icon" />
            <h3>Achievement Tracking</h3>
            <p>Monitor your participation and earn certificates</p>
          </div>
          
          <div className="feature-card">
            <FaChartBar className="feature-icon" />
            <h3>Progress Dashboard</h3>
            <p>Visualize your activity participation and achievements</p>
          </div>
        </section>

        <section className="cta-section">
          <h2>Ready to Get Started?</h2>
          <Link to="/auth/login" className="cta-button">Join Now</Link>
        </section>
      </main>

      <footer className="home-footer">
        <p>© 2024 Student Activity Management. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
