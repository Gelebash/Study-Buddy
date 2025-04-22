import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Flashcards from "./pages/Flashcards";
import ManageCardsPage from "./pages/ManageCardsPage";
import ClockPage from "./pages/ClockPage";
import BuddyPage from "./pages/BuddyPage";
import AgendaPage from "./pages/AgendaPage";
import NotebookPage from "./pages/NotebookPage"; // Import NotebookPage
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "./constants";

// Keys to Manage on Logout 

// Keys to ALWAYS REMOVE on Logout (Authentication & Session Identifiers)
const AUTH_SESSION_KEYS_TO_REMOVE = [
    ACCESS_TOKEN,
    REFRESH_TOKEN,
    "username", // User logs in again and this is potentially re-fetched/set
];

// Keys for FEATURES whose temporary state should be cleared on logout
const VOLATILE_FEATURE_KEYS_TO_REMOVE = [
    // Buddy session specifics (clear things that identify the *user's instance*)
    "favoritePet",
    "petFirstName", "petMiddleName", "petLastName",
    "petStateName", "petCountryName", "petBirthDate",
    "petIdNumber",
    // Timer volatile state
    'timerSessionType', 'timerPomodoroMode', 'timerIsActive',
    'timerStartTime', 'timerPausedElapsed', 'timerTargetDuration',
    'timerHappinessCalcBaseline',
    // Agenda volatile state
    'agendaDate', 'agendaGoals', 'agendaTasks', 'agendaStudyChecklist',
    'agendaQuizzesExams', 'agendaAssignmentsProjects', 'agendaCheckedDays',
    'agendaTaskIdCounter', 'agendaCheckIdCounter', 'agendaQuizIdCounter', 'agendaAssignIdCounter',
    // Notebook volatile state (Active selection, NOT data or counters)
    'notebookActiveCourseId', 'notebookActiveSectionId', 'notebookActivePageId'
];


//Logout Component 
// This component defines the logic for the /logout route
function Logout() {
    console.log("Logout Component: Clearing specific session and volatile data...");

    // Remove Auth & Session keys
    AUTH_SESSION_KEYS_TO_REMOVE.forEach(key => {
        console.log(` - Removing Auth/Session Key: ${key}`);
        localStorage.removeItem(key);
    });

    // Remove Volatile Feature keys
    VOLATILE_FEATURE_KEYS_TO_REMOVE.forEach(key => {
        console.log(` - Removing Volatile Feature Key: ${key}`);
        localStorage.removeItem(key);
    });

    console.log("Logout complete. Persistent data (e.g., Notebook content, Buddy progress) should remain.");

    // Navigate to Login page after clearing
    return <Navigate to="/login" />;
}

// RegisterAndLogout Component (Clears EVERYTHING) 
function RegisterAndLogout() {
    console.log("Register Route: Clearing all localStorage for new user registration.");
    localStorage.clear(); // Clears absolutely everything
    return <Register />;
}

// Main Application Component 
function App() {
    return (
        <BrowserRouter>
            <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<RegisterAndLogout />} />
                <Route path="/logout" element={<Logout />} /> {/* Route uses the Logout component */}

                {/* Protected */}
                <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
                <Route path="/clock" element={<ProtectedRoute><ClockPage /></ProtectedRoute>} />
                <Route path="/flashcards" element={<ProtectedRoute><Flashcards /></ProtectedRoute>} />
                <Route path="/manage-cards" element={<ProtectedRoute><ManageCardsPage /></ProtectedRoute>} />
                <Route path="/pet" element={<ProtectedRoute><BuddyPage /></ProtectedRoute>} />
                <Route path="/agenda" element={<ProtectedRoute><AgendaPage /></ProtectedRoute>} />
                <Route path="/notebook" element={<ProtectedRoute><NotebookPage /></ProtectedRoute>} />

                {/* Catch-all */}
                <Route path="*" element={<NotFound />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;