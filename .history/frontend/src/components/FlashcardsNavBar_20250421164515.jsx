import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/NavBar.css'; // Ensure path is correct
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants'; // Ensure constants are needed/used

function FlashcardsNavBar() {
     // Add log
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);
        // Add other necessary clear operations
        localStorage.removeItem("username");
        localStorage.removeItem("favoritePet");
        localStorage.removeItem("petHappiness");
        localStorage.removeItem("totalStudiedTime");
        localStorage.removeItem("lastHappinessResetCheck");
        localStorage.removeItem("lastResetCheckET");
        navigate('/login');
    };

    // NavLink 'className' function expects an object { isActive, isPending }
    const getNavLinkClass = ({ isActive }) => {
        return isActive ? 'nav-link active' : 'nav-link';
    };

    // Specific logic for Study Mode might need careful checking if paths overlap
    const isStudyModeActive = ({ location }) => {
        
        // If '/flashcards/' is base, and '/flashcards/some-sub-route' exists, 'end' might be needed on NavLink
        return location.pathname === '/flashcards' ? 'nav-link active' : 'nav-link';
    };
    const isManageModeActive = ({ isActive }) => {
        // Standard isActive should work if the path is exactly /manage-cards
         return isActive ? 'nav-link active' : 'nav-link';
     };


    return (
        <nav className="navbar-container">
            <div className="navbar-brand">
                <NavLink to="/flashcards" className="brand-link">Flashcards</NavLink>
            </div>
            <div className="navbar-links">
                {}
                <NavLink to="/flashcards" className={getNavLinkClass} end >Study Mode</NavLink>
                <NavLink to="/manage-cards" className={getNavLinkClass} > Manage Cards </NavLink>
                <NavLink to="/" className={getNavLinkClass} end> Home </NavLink>
                <button onClick={handleLogout} className="nav-link logout-button"> Logout </button>
            </div>
        </nav>
    );
}

export default FlashcardsNavBar;