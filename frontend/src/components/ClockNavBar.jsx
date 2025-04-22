import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/NavBar.css';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';

function ClockNavBar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        navigate('/login');
    };

    return (
        <nav className="navbar-container">
            <div className="navbar-brand">
                <NavLink to="/clock" className="brand-link">Clock</NavLink>
            </div>
            <div className="navbar-links">
                <NavLink to="/clock" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}> Clock </NavLink>
                <NavLink to="/" end className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}> Home </NavLink>
                <button onClick={handleLogout} className="nav-link logout-button"> Logout </button>
            </div>
        </nav>
    );
}

export default ClockNavBar;