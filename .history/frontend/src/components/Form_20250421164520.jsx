import React, { useState, useEffect } from "react";
import api from "../api"; // Ensure correct path
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css"; // Ensure correct path

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirm, setPasswordConfirm] = useState("");
    const [pet, setPet] = useState(""); // Holds the selection from the dropdown
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const formTitle = method === "login" ? "Login" : "Register User";

    useEffect(() => {
        document.body.classList.add('auth-body');
        return () => { document.body.classList.remove('auth-body'); };
    }, []);

    const handleSubmit = async (e) => {
        setLoading(true);
        setError("");
        e.preventDefault();

        //Validation
        if (method === "register" && password !== passwordConfirm) {
            setError("Passwords do not match."); setLoading(false); return;
        }
        // Registration specific validation
        if (method === "register" && !pet) {
            setError("Please select a favorite pet."); setLoading(false); return;
        }

        // Prepare Data 
        let userData = { username, password };
        // PET NOT SENT to the backend unless the UserSerializer handles it.
        //       'pet' is primarily used client-side for localStorage.

        //  API Call 
        try {
             console.log(`Attempting ${method} at: ${route}`);
             
            const res = await api.post(route, userData);
             console.log(`${method} successful:`, res); // Log success

            if (method === "login") {
                 // Verify response structure from simplejwt's TokenObtainPairView
                 if (res.data.access && res.data.refresh) {
                     localStorage.setItem(ACCESS_TOKEN, res.data.access);
                     localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                     // SAVE username from successful login
                     localStorage.setItem('username', username);
                     
                     // We expect these to be in localStorage already if the user registered correctly.
                     console.log("Login successful. Tokens and username stored.");
                     navigate("/"); // Navigate to home after successful login
                 } else {
                    console.error("Login Error: Response data missing access/refresh tokens.", res.data);
                     setError("Login failed: Invalid server response.");
                 }
            } else { // Registration successful
                 alert("Registration successful! Please log in.");
                // SAVE Pet Type and Birth Date ONLY on Successful REGISTRATION 
                if (pet) { // Ensure 'pet' state has a value from the dropdown
                    localStorage.setItem('favoritePet', pet); 
                    const birthDate = new Date().toISOString(); 
                    localStorage.setItem('petBirthDate', birthDate); 
                    // Clear any potentially existing name/location/ID from previous sessions/dev
                     localStorage.removeItem('petFirstName');
                     localStorage.removeItem('petMiddleName');
                     localStorage.removeItem('petLastName');
                     localStorage.removeItem('petStateName');
                     localStorage.removeItem('petCountryName');
                     localStorage.removeItem('petIdNumber'); // Also clear ID number on new reg
                     console.log(`Saved favoritePet='${pet}' and petBirthDate='${birthDate}' after registration.`);
                 } else {
                     console.warn("Registration successful, but no pet type was selected/saved locally (should have been required).");
                 }
                 // Navigate to login AFTER saving registration details
                 navigate("/login");
            }
        } catch (error) {
             console.error(`Error during ${method}:`, error); // Log the full error
             let errorMessage = `An error occurred during ${method}.`;
             if (error.response) {
                 console.error("Error response data:", error.response.data);
                 console.error("Error response status:", error.response.status);
                 // simplejwt often returns detail for failed login, others might too
                errorMessage = error.response.data.detail || JSON.stringify(error.response.data) || `Request failed (${error.response.status})`;
                 // Handle common Django validation error format
                 if (typeof error.response.data === 'object' && !error.response.data.detail) {
                    const messages = Object.entries(error.response.data)
                                 .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(' ') : value}`);
                     errorMessage = messages.join('\n') || errorMessage; // Use formatted message if available
                 }
             } else if (error.request) {
                 errorMessage = "No response from server. Check network or backend status.";
             } else {
                 errorMessage = error.message;
             }
             setError(errorMessage); // Display specific error to user
         } finally {
            setLoading(false);
        }
    };

     //  JSX Form 
     // Keep the structure exactly as you provided in the last prompt
     return (
         <div className="form-wrapper">
            <div className="background-animals"> <div className="animal-shape type1"></div> <div className="animal-shape type2"></div> <div className="animal-shape type3"></div> <div className="animal-shape type4"></div> <div className="animal-shape type5"></div> <div className="animal-shape type6"></div> </div>
             <form onSubmit={handleSubmit} className="form-container"> <h1>{formTitle}</h1>
                {method === "register" && (<p className="input-hint" style={{width:'100%', marginBottom:'15px', color:'#5a6268'}}>First, enter a username and password.</p>)}
                <div className="form-field"> <label htmlFor="usernameInput">Username:</label> <input id="usernameInput" className="form-input" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Enter your username" required aria-label="Username" /> {method === "register" && (<p className="input-hint">Req. 150 chars or fewer. Letters, digits, @/./+/-/_ only.</p>)} </div>
                <div className="form-field"> <label htmlFor="passwordInput">Password:</label> <input id="passwordInput" className="form-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required aria-label="Password" /> {method === "register" && (<p className="input-hint">Min 8 chars.</p>)} </div>
                {method === "register" && <div className="form-field"> <label htmlFor="passwordConfirmInput">Confirm Password:</label> <input id="passwordConfirmInput" className="form-input" type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} placeholder="Enter password again" required aria-label="Password confirmation" /> <p className="input-hint">Enter the same password again.</p> </div>}
                {method === "register" && <div className="form-field"> <label htmlFor="petSelect">Favorite Pet (Choose Buddy):</label> <select id="petSelect" className="form-select" value={pet} onChange={(e) => setPet(e.target.value)} aria-label="Select Pet" required> <option value="" disabled>-- Select --</option><option value="Cat">Cat 🐱</option> <option value="Dog">Dog 🐶</option> <option value="Bunny">Bunny 🐰</option><option value="Fish">Fish 🐠</option><option value="Turtle">Turtle 🐢</option><option value="Hamster">Hamster 🐹</option><option value="Reptile">Reptile 🦎</option> </select> </div>}
                {loading && <p className="loading-indicator">Loading...</p>} {error && <p className="error-message">{error}</p>}
                <div className="form-button-container">{method === "login" ? (<> <button className="form-button" type="submit" disabled={loading}>Login</button> <button className="form-button" type="button" onClick={() => navigate("/register")} disabled={loading} style={{ backgroundColor: '#6c757d' }}>Register</button> </> ) : ( <> <button className="form-button" type="button" onClick={() => navigate("/login")} disabled={loading} style={{ backgroundColor: '#6c757d' }}>Back</button> <button className="form-button" type="submit" disabled={loading}>Register</button> </>)}</div>
            </form>
        </div>
    );
}

export default Form;