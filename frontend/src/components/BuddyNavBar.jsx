import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/NavBar.css'; 
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';

// Timer Keys to clear on logout
const LS_KEYS_TIMER = {
     SESSION_TYPE: 'timerSessionType',
     MODE: 'timerPomodoroMode',
     IS_ACTIVE: 'timerIsActive',
     START_TIME: 'timerStartTime',
     PAUSED_ELAPSED: 'timerPausedElapsed',
     TARGET_DURATION: 'timerTargetDuration',
     HAPPINESS_CALC_BASELINE: 'timerHappinessCalcBaseline',
};

// Buddy Keys that  WANT TO KEEP on logout
// (These are persisted across sessions)
const LS_KEYS_BUDDY_PERSIST = [
    'favoritePet', // Keep the selected species
    'petFirstName',
    'petMiddleName',
    'petLastName',
    'petStateName',
    'petCountryName',
    'petBirthDate', // Adoption date should persist
    'petIdNumber', // Persist the editable ID
    'petHappiness', // Happiness persists day-to-day until daily reset
    'totalStudiedTime', // Keep study time until daily reset
    'lastResetCheckET' // Keep the date of the last daily reset
];

function BuddyNavBar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        console.log("BuddyNavBar: Logging out...");

        // 1. Remove Authentication Tokens
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);

        // 2. Remove Session-Specific User Identifiers
        localStorage.removeItem("username"); // Username loaded on login should be cleared

        // 3. Remove Volatile Timer State
        console.log("BuddyNavBar: Clearing timer keys...");
        Object.values(LS_KEYS_TIMER).forEach(key => {
            localStorage.removeItem(key);
        });

        // 4. DO NOT REMOVE THE BUDDY PERSIST KEYS 
        console.log("BuddyNavBar: Preserving Buddy information:", LS_KEYS_BUDDY_PERSIST.join(', '));

        // 5. Navigate to Login
        navigate('/login');
    };

     const getNavLinkClass = ({ isActive }) => {
         return isActive ? 'nav-link active' : 'nav-link';
     };

    return (
        <nav className="navbar-container">
            <div className="navbar-brand">
                <NavLink to="/pet" className="brand-link">Buddy</NavLink>
            </div>
            <div className="navbar-links">
                 <NavLink to="/pet" className={getNavLinkClass}> Buddy </NavLink>
                 <NavLink to="/" end className={getNavLinkClass}> Home </NavLink>
                 <button onClick={handleLogout} className="nav-link logout-button"> Logout </button>
             </div>
        </nav>
    );
}

export default BuddyNavBar;