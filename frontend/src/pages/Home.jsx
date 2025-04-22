import React, { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Home.css";

const petIcons = { Cat: "🐱", Fish: "🐠", Turtle: "🐢", Dog: "🐶", Bunny: "🐰", Hamster: "🐹", Reptile: "🦎", Default: "🐾" };
const EST_TIMEZONE = 'America/New_York';
const LS_KEYS_TIMER = { HAPPINESS_CALC_BASELINE: 'timerHappinessCalcBaseline', }; // Timer baseline key needed for daily reset

function getESTDateString(date) {
    try {
        const formatter = new Intl.DateTimeFormat('en-CA', { timeZone: EST_TIMEZONE, year: 'numeric', month: '2-digit', day: '2-digit' });
        return formatter.format(date);
    } catch (e) {
        console.error("Error formatting date for EST:", e);
        const utcYear = date.getFullYear();
        const utcMonth = (date.getMonth() + 1).toString().padStart(2, '0');
        const utcDay = date.getDate().toString().padStart(2, '0');
        return `${utcYear}-${utcMonth}-${utcDay}`;
    }
};

function Home() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("Buddy");
    const [favoritePet, setFavoritePet] = useState(null);
    const [firstName, setFirstName] = useState(""); // Using first/last name
    const [lastName, setLastName] = useState("");
    const [petHappiness, setPetHappiness] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        document.body.classList.add('home-body');
        setLoading(true); 
        setError("");

        const fetchBuddyInfo = async () => {
            try {
                const response = await api.get('/api/buddy/');
                if (response.data.length > 0) {
                    const buddyData = response.data[0];
                    setFavoritePet(buddyData.favoritePet);
                    setFirstName(buddyData.firstName);
                    setLastName(buddyData.lastName);
                    setPetHappiness(buddyData.petHappiness);
                }
                
                const storedUsername = localStorage.getItem('username') || "Buddy";
                setUsername(storedUsername);
                
            } catch (err) {
                console.error("Home: Error fetching buddy info:", err);
                setError("Could not load buddy profile.");
            } finally {
                setLoading(false);
            }
        };

        fetchBuddyInfo();

        return () => {
            document.body.classList.remove('home-body');
        };
    }, []);

    const petIcon = petIcons[favoritePet] || petIcons.Default;

    // Navigation Callbacks 
    const goToFlashcards = useCallback(() => navigate("/flashcards"), [navigate]);
    const goToClock = useCallback(() => navigate("/clock"), [navigate]);
    const goToPet = useCallback(() => navigate("/pet"), [navigate]); // Navigates to the Buddy/Pet ID page
    const goToAgenda = useCallback(() => navigate("/agenda"), [navigate]); // Correctly navigates to Agenda
    const goToNotebook = useCallback(() => navigate("/notebook"), [navigate]); // Navigates to the Notebook page
    const handleLogout = useCallback(() => navigate('/logout'), [navigate]); // Navigate to the route that handles logout logic

    // Generate display name, preferring first name if available, then pet type
    const buddyDisplayName = [firstName, lastName].filter(Boolean).join(' ').trim() || `Your ${favoritePet}`;

    return (
        // Using vertical button layout by applying class to group div
        <div className="home-container page-content">
            <h1 className="welcome-heading">Welcome back, {username}</h1>
            {loading && <p className="loading-message">Loading profile...</p>}
            {error && <p className="home-error">{error}</p>}
            {!loading && !error && (
                <div className="study-buddy-section interactive-pet-section">
                    <div className="pet-display">
                        <button className="pet-icon-button" onClick={goToPet} aria-label={`View details for ${buddyDisplayName}`}>
                            <span className="pet-icon-large">{petIcon}</span>
                        </button>
                        <div className="pet-status">
                            <p className="pet-message">
                                {buddyDisplayName} is {petHappiness < 70 ? "feeling a bit down..." : "very happy!"}
                            </p>
                            <p className="happiness-text">Happiness: {petHappiness}%</p>
                            <div className="happiness-bar-container-home">
                                <div className="happiness-bar-home" style={{ width: `${petHappiness}%` }}></div>
                            </div>
                        </div>
                    </div>
                    <div className={`pet-mood-indicator ${petHappiness < 70 ? 'sad' : 'happy'}`}>
                        {petHappiness < 70 ? `${buddyDisplayName} needs study time!` : "Keep up the studying!"}
                    </div>
                </div>
            )}
            <p className="home-prompt">Ready to focus?</p>
            {/* Apply vertical class for stacking defined in Home.css */}
            <div className="home-button-group vertical">
                 <button className="home-button" onClick={goToFlashcards}> <span role="img" aria-label="cards">🗂️</span> Flashcards </button>
                 <button className="home-button" onClick={goToClock}> <span role="img" aria-label="timer">⏱️</span> Clock </button>
                 <button className="home-button" onClick={goToPet}> <span role="img" aria-label="pet">🐾</span> Buddy </button>
                 <button className="home-button" onClick={goToAgenda}> <span role="img" aria-label="agenda">🗓️</span> Agenda </button>
                 {/* Ensure Notebook button uses correct handler */}
                 <button className="home-button" onClick={goToNotebook}> <span role="img" aria-label="notebook">📓</span> Notebook </button>
                 {/* Logout button stays last in the vertical flow */}
                 <button className="home-button home-button-logout" onClick={handleLogout}>
                    <span role="img" aria-label="logout">🚪</span> Logout
                 </button>
             </div>
        </div>
    );
}

export default Home;