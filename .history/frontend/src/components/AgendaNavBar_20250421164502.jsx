import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/NavBar.css';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';

// Timer Keys to clear on logout
const LS_KEYS_TIMER = {
    SESSION_TYPE: 'timerSessionType', MODE: 'timerPomodoroMode', IS_ACTIVE: 'timerIsActive',
    START_TIME: 'timerStartTime', PAUSED_ELAPSED: 'timerPausedElapsed',
    TARGET_DURATION: 'timerTargetDuration', HAPPINESS_CALC_BASELINE: 'timerHappinessCalcBaseline',
};


const PERSIST_KEYS = [

    'favoritePet', 'petFirstName', 'petMiddleName', 'petLastName',
    'petStateName', 'petCountryName', 'petBirthDate', 'petIdNumber',
    'petHappiness', 'totalStudiedTime', 'lastResetCheckET',
    // Agenda Persist Keys
    'agendaDate', 'agendaGoals', 'agendaTasks', 'agendaStudyChecklist',
    'agendaQuizzesExams', 'agendaAssignmentsProjects', 'agendaCheckedDays',
    'agendaTaskIdCounter', 'agendaCheckIdCounter', 'agendaQuizIdCounter', 'agendaAssignIdCounter'
];

function AgendaNavBar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        console.log("AgendaNavBar: Logging out...");

        // Remove Authentication Tokens
        localStorage.removeItem(ACCESS_TOKEN);
        localStorage.removeItem(REFRESH_TOKEN);

        // Remove Session-Specific User Identifier
        localStorage.removeItem("username"); // Typically loaded fresh on login

        // Remove Volatile Timer State
        console.log("AgendaNavBar: Clearing timer keys...");
        Object.values(LS_KEYS_TIMER).forEach(key => localStorage.removeItem(key));

        
        console.log("AgendaNavBar: Intentionally preserving Agenda & Buddy data.");

        //  Navigate to Login
        navigate('/login');
    };

     const getNavLinkClass = ({ isActive }) => isActive ? 'nav-link active' : 'nav-link';

    return (
        <nav className="navbar-container">
            <div className="navbar-brand">
                <NavLink to="/agenda" className="brand-link">Agenda</NavLink>
            </div>
            <div className="navbar-links">
                <NavLink to="/agenda" className={getNavLinkClass}> Agenda </NavLink>
                <NavLink to="/" end className={getNavLinkClass}> Home </NavLink>
                <button onClick={handleLogout} className="nav-link logout-button"> Logout </button>
            </div>
        </nav>
    );
}

export default AgendaNavBar;