import React, { useState, useEffect, useRef } from 'react';
import '../styles/BuddyPage.css';
import BuddyNavBar from '../components/BuddyNavBar';

const petIcons = { Cat: "🐱", Fish: "🐠", Turtle: "🐢", Dog: "🐶", Bunny: "🐰", Hamster: "🐹", Reptile: "🦎", Default: "🐾" };
const EST_TIMEZONE = 'America/New_York';

function formatDate(dateString) {
    if (!dateString) return "N/A";
    try {
        const date = new Date(dateString);
        const options = { year: '2-digit', month: '2-digit', day: '2-digit', timeZone: EST_TIMEZONE };
        const formatted = date.toLocaleDateString('en-US', options);
        return (formatted === 'Invalid Date' || !formatted) ? 'N/A' : formatted;
    } catch (e) {
        console.error("Error formatting date:", e);
        return "N/A";
    }
}

function generateInitialId() {
     const randomPart = () => Math.floor(100 + Math.random() * 900);
     return `${randomPart()} ${randomPart()} ${randomPart()}`;
}

function BuddyPage() {
    const [favoritePet, setFavoritePet] = useState(() => localStorage.getItem('favoritePet') || "Default");
    const [firstName, setFirstName] = useState(() => localStorage.getItem('petFirstName') || "");
    const [middleName, setMiddleName] = useState(() => localStorage.getItem('petMiddleName') || "");
    const [lastName, setLastName] = useState(() => localStorage.getItem('petLastName') || "");
    const [stateName, setStateName] = useState(() => localStorage.getItem('petStateName') || "");
    const [countryName, setCountryName] = useState(() => localStorage.getItem('petCountryName') || "");
    const [petHappiness, setPetHappiness] = useState(() => parseInt(localStorage.getItem('petHappiness') || '50', 10));
    const [petBirthDate, setPetBirthDate] = useState(() => localStorage.getItem('petBirthDate') || null);
    const [ownerName, setOwnerName] = useState(() => localStorage.getItem('username') || "Registered User");
    const [buddyId, setBuddyId] = useState(() => localStorage.getItem('petIdNumber') || generateInitialId());

    const [isEditingName, setIsEditingName] = useState(false);
    const [editFirstName, setEditFirstName] = useState("");
    const [editMiddleName, setEditMiddleName] = useState("");
    const [editLastName, setEditLastName] = useState("");
    const [isEditingLocation, setIsEditingLocation] = useState(false);
    const [editStateName, setEditStateName] = useState("");
    const [editCountryName, setEditCountryName] = useState("");
    const [isEditingId, setIsEditingId] = useState(false);
    const [editBuddyId, setEditBuddyId] = useState("");
    const [error, setError] = useState("");

    const firstNameInputRef = useRef(null);
    const stateInputRef = useRef(null);
    const idInputRef = useRef(null);

     useEffect(() => {
        const handleStorageChange = (event) => {
             if (event.key === 'petHappiness') setPetHappiness(parseInt(event.newValue || '50', 10));
             if (event.key === 'favoritePet') setFavoritePet(event.newValue || "Default");
             if (!isEditingName) {
                 if (event.key === 'petFirstName') setFirstName(event.newValue || "");
                 if (event.key === 'petMiddleName') setMiddleName(event.newValue || "");
                 if (event.key === 'petLastName') setLastName(event.newValue || "");
            }
            if (!isEditingLocation) {
                 if (event.key === 'petStateName') setStateName(event.newValue || "");
                 if (event.key === 'petCountryName') setCountryName(event.newValue || "");
             }
             if (!isEditingId && event.key === 'petIdNumber') setBuddyId(event.newValue || generateInitialId());
             if(event.key === 'petBirthDate') setPetBirthDate(event.newValue || null);
             if(event.key === 'username') setOwnerName(event.newValue || "Registered User");
         };
        window.addEventListener('storage', handleStorageChange);
        document.body.classList.add('buddy-body-id-horizontal');
        return () => {
            window.removeEventListener('storage', handleStorageChange);
            document.body.classList.remove('buddy-body-id-horizontal');
         };
     }, [isEditingName, isEditingLocation, isEditingId]);

    useEffect(() => { if (isEditingName && firstNameInputRef.current) firstNameInputRef.current.focus(); }, [isEditingName]);
    useEffect(() => { if (isEditingLocation && stateInputRef.current) stateInputRef.current.focus(); }, [isEditingLocation]);
    useEffect(() => { if (isEditingId && idInputRef.current) idInputRef.current.focus(); }, [isEditingId]);

    const handleEditName = () => { setEditFirstName(firstName); setEditMiddleName(middleName); setEditLastName(lastName); setIsEditingName(true); setIsEditingLocation(false); setIsEditingId(false); setError(""); };
    const handleSaveName = () => {
        const first = editFirstName.trim(); const middle = editMiddleName.trim(); const last = editLastName.trim();
        if (!first && !middle && !last) {setError("Please enter at least part of the name."); return;}
        if ((first + middle + last).length > 50) { setError("Full name cannot exceed 50 characters."); return; }
        try { setFirstName(first); setMiddleName(middle); setLastName(last); localStorage.setItem('petFirstName', first); localStorage.setItem('petMiddleName', middle); localStorage.setItem('petLastName', last); setIsEditingName(false); setError(""); } catch(e) { setError("Failed to save name. Storage might be full.");}
     };
    const handleCancelNameEdit = () => { setIsEditingName(false); setError(""); };

    const handleEditLocation = () => { setEditStateName(stateName); setEditCountryName(countryName); setIsEditingLocation(true); setIsEditingName(false); setIsEditingId(false); setError(""); };
    const handleSaveLocation = () => {
        const state = editStateName.trim(); const country = editCountryName.trim();
        if ((state + country).length > 60) { setError("Location names combined cannot exceed 60 characters."); return; }
        try { setStateName(state); setCountryName(country); localStorage.setItem('petStateName', state); localStorage.setItem('petCountryName', country); setIsEditingLocation(false); setError(""); } catch(e) { setError("Failed to save location. Storage might be full."); }
     };
    const handleCancelLocationEdit = () => { setIsEditingLocation(false); setError(""); };

    const handleEditId = () => { setEditBuddyId(buddyId); setIsEditingId(true); setIsEditingName(false); setIsEditingLocation(false); setError(""); };
    const handleSaveId = () => {
        const idVal = editBuddyId.trim().replace(/\s+/g, ' ');
        if (!idVal) { setError("ID number cannot be empty."); return; }
        if (idVal.length > 20) { setError("ID number cannot exceed 20 characters."); return; }
        if (!/^[a-zA-Z0-9\s-]+$/.test(idVal)){setError("ID should only contain letters, numbers, spaces, or hyphens."); return;}
        try { setBuddyId(idVal); localStorage.setItem('petIdNumber', idVal); setIsEditingId(false); setError(""); } catch(e) { setError("Failed to save ID number. Storage might be full.");}
    };
     const handleCancelIdEdit = () => { setIsEditingId(false); setError(""); };

    const petIcon = petIcons[favoritePet] || petIcons.Default;
    const petMood = petHappiness < 70 ? "Upset" : "Happy";
    const formattedBirthDate = formatDate(petBirthDate);
    const nameParts = [lastName, firstName].filter(Boolean);
    const formattedName = nameParts.join(', ').toUpperCase() + (middleName ? ` ${middleName.charAt(0).toUpperCase()}` : '');
    const displayLocation = [stateName, countryName].filter(Boolean).join(', ');

    return (
        <>
            <BuddyNavBar />
            <div className="page-content">
                 <div className="buddy-page-container">
                    <div className="buddy-id-card-horizontal">
                        <div className="id-realistic-header-bar">STUDY BUDDY - OFFICIAL ID</div>
                        <div className="id-horizontal-content">
                            <div className="id-horizontal-photo-area">
                                <span className="id-horizontal-photo">{petIcon}</span>
                            </div>
                            <div className="id-horizontal-details">
                                {/* Main Info Column (Left) */}
                                <div className="main-info">
                                    {/*  Row 1: ID Field  */}
                                    <div className="id-field-row">
                                        <div className="id-field id-number-field">
                                            {isEditingId ? ( /* EDITING ID VIEW */
                                                <div className="id-field-edit id-edit-group">
                                                    <label className="id-label-inline" htmlFor="idInput">ID NUMBER</label>
                                                    <input id="idInput" type="text" placeholder="e.g., 123 456 789" value={editBuddyId} onChange={(e)=>setEditBuddyId(e.target.value)} ref={idInputRef} className="id-input id-number-input"/>
                                                    <div className="edit-button-container">
                                                        <button onClick={handleSaveId} className="id-button save" title="Save ID">✔</button>
                                                        <button onClick={handleCancelIdEdit} className="id-button cancel" title="Cancel Edit">✖</button>
                                                    </div>
                                                </div>
                                            ) : ( /* DISPLAY ID VIEW */
                                                <>
                                                    <span className="id-label">ID NUMBER</span>
                                                    <div className="id-value-edit-container">
                                                        <span className="id-value id-number-value">{buddyId}</span>
                                                        <button onClick={handleEditId} className="id-button edit id-edit-btn" title="Edit ID">✎</button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/*  Row 2: Name Field  */}
                                    <div className="id-field-row">
                                        <div className="id-field">
                                            {isEditingName ? ( /* EDITING NAME VIEW */
                                                <div className="id-field-edit name-edit-group">
                                                    <label className="id-label-inline">NAME</label>
                                                    <input type="text" placeholder="Last" value={editLastName} onChange={(e) => setEditLastName(e.target.value)} className="id-input name-input"/>
                                                    <input type="text" placeholder="First" value={editFirstName} onChange={(e) => setEditFirstName(e.target.value)} ref={firstNameInputRef} className="id-input name-input"/>
                                                    <input type="text" placeholder="M" value={editMiddleName} onChange={(e) => setEditMiddleName(e.target.value)} maxLength="1" className="id-input name-input initial"/>
                                                    <div className="edit-button-container"> <button onClick={handleSaveName} className="id-button save" title="Save Name">✔</button><button onClick={handleCancelNameEdit} className="id-button cancel" title="Cancel Edit">✖</button> </div>
                                                </div>
                                            ) : ( /* DISPLAY NAME VIEW */
                                                <>
                                                    <span className="id-label">NAME</span>
                                                    <div className="id-value-edit-container">
                                                        <span className="id-value name-value">{formattedName || <span className="placeholder-text">(No Name Set)</span>}</span>
                                                        <button onClick={handleEditName} className="id-button edit" title="Edit Name">✎</button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Row 3: Location Field */}
                                    <div className="id-field-row">
                                        <div className="id-field">
                                            {isEditingLocation ? ( /* EDITING LOCATION VIEW */
                                                <div className="id-field-edit location-edit-group">
                                                    <label className="id-label-inline">LOCATION</label>
                                                    <input type="text" placeholder="State/Province" value={editStateName} onChange={(e) => setEditStateName(e.target.value)} ref={stateInputRef} className="id-input location-input"/>
                                                    <input type="text" placeholder="Country" value={editCountryName} onChange={(e) => setEditCountryName(e.target.value)} className="id-input location-input"/>
                                                    <div className="edit-button-container"> <button onClick={handleSaveLocation} className="id-button save" title="Save Location">✔</button><button onClick={handleCancelLocationEdit} className="id-button cancel" title="Cancel Edit">✖</button> </div>
                                                </div>
                                            ) : ( /* DISPLAY LOCATION VIEW */
                                                <>
                                                    <span className="id-label">LOCATION</span>
                                                    <div className="id-value-edit-container">
                                                        <span className="id-value location-value">{displayLocation || <span className="placeholder-text">(No Location Set)</span>}</span>
                                                        <button onClick={handleEditLocation} className="id-button edit" title="Edit Location">✎</button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Display Error at the bottom of the main column */}
                                    {error && <p className="id-target-error">{error}</p>}
                                </div>

                                {/* Side Info Column (Right) */}
                                <div className="side-info">
                                    <div className="id-field-row id-multi-field-row">
                                        <div className="id-field"> <span className="id-label">SPECIES</span> <span className="id-value">{favoritePet}</span> </div>
                                        <div className="id-field"> <span className="id-label">ISSUED</span> <span className="id-value">{formattedBirthDate}</span> </div>
                                    </div>
                                    <div className="id-field-row id-multi-field-row">
                                        <div className="id-field"> <span className="id-label">OWNER</span> <span className="id-value">{ownerName}</span> </div>
                                        <div className="id-field status-field">
                                            <span className="id-label">STATUS</span>
                                            <div>
                                                <span className={`id-value mood ${petMood.toLowerCase()}`}>{petMood} ({petHappiness}%)</span>
                                                <div className="id-target-bar-container">
                                                    <div className="id-target-bar" style={{ width: `${petHappiness}%` }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div> {/* End side-info */}
                            </div> {/* End id-horizontal-details */}
                        </div> {/* End id-horizontal-content */}
                    </div> {/* End buddy-id-card-horizontal */}
                </div> {/* End buddy-page-container */}
            </div> {/* End page-content */}
        </>
    );
}

export default BuddyPage;