import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import '../styles/NavBar.css'; // Reuse general styles
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';

// Timer Keys to clear on logout
const LS_KEYS_TIMER = {
     SESSION_TYPE: 'timerSessionType', MODE: 'timerPomodoroMode', IS_ACTIVE: 'timerIsActive',
     START_TIME: 'timerStartTime', PAUSED_ELAPSED: 'timerPausedElapsed',
     TARGET_DURATION: 'timerTargetDuration', HAPPINESS_CALC_BASELINE: 'timerHappinessCalcBaseline',
};

// Agenda keys to clear on logout
const LS_KEYS_AGENDA = [
    'agendaDate', 'agendaGoals', 'agendaTasks', 'agendaStudyChecklist',
    'agendaQuizzesExams', 'agendaAssignmentsProjects', 'agendaCheckedDays',
    'agendaTaskIdCounter', 'agendaCheckIdCounter', 'agendaQuizIdCounter', 'agendaAssignIdCounter'
];

// Notebook Keys to clear on logout (volatile ones)
const NOTEBOOK_LS_KEYS_VOLATILE = [
    // Only clear active selections, NOT data or counters
    'notebookActiveCourseId',
    'notebookActiveSectionId',
    'notebookActivePageId'
];

function NotebookNavBar() {
    const navigate = useNavigate();

    // Navigation function, actual logout logic is in App.jsx
    const handleLogoutNavigation = () => {
        console.log("NotebookNavBar: Navigating to /logout");
        navigate('/logout');
    };

    const getNavLinkClass = ({ isActive }) => isActive ? 'nav-link active' : 'nav-link';

    return (
        <nav className="navbar-container">
            <div className="navbar-brand">
                <NavLink to="/notebook" className="brand-link">Notebook</NavLink>
            </div>
            <div className="navbar-links">
                <NavLink to="/notebook" className={getNavLinkClass}> Notes </NavLink>
                <NavLink to="/" end className={getNavLinkClass}> Home </NavLink>
                <button onClick={handleLogoutNavigation} className="nav-link logout-button"> Logout </button>
            </div>
        </nav>
    );
}

export default NotebookNavBar;