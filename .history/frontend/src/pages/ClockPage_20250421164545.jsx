import React, { useState, useEffect, useRef, useCallback } from 'react';
import '../styles/ClockPage.css'; 
import ClockNavBar from '../components/ClockNavBar';

// Constants 
const LS_KEYS = {
    SESSION_TYPE: 'timerSessionType',
    MODE: 'timerPomodoroMode', // Study/Break for Pomodoro
    IS_ACTIVE: 'timerIsActive',
    START_TIME: 'timerStartTime', // Timestamp when timer was last started/resumed
    PAUSED_ELAPSED: 'timerPausedElapsed', // Total elapsed time when paused
    TARGET_DURATION: 'timerTargetDuration', // Target for presets/pomodoro
    HAPPINESS_CALC_BASELINE: 'timerHappinessCalcBaseline', // Total study seconds accounted for happiness
};
const GLOBAL_LS_KEYS = { // Keys for values shared across components or persistent
    PET_HAPPINESS: 'petHappiness',
    TOTAL_STUDIED: 'totalStudiedTime',
    LAST_RESET_CHECK: 'lastResetCheckET', // Key for daily reset date check
};

const PRESET_DURATIONS = {
    '5m': 5 * 60, '30m': 30 * 60, '1h': 60 * 60,
    '2h': 120 * 60, '3h': 180 * 60, '4h': 240 * 60,
};
const POMODORO_STUDY_TIME = 25 * 60;
const POMODORO_BREAK_TIME = 5 * 60;
const HAPPINESS_INCREASE_INTERVAL_SECONDS = 60; // Award point per 60 seconds

const EASTERN_TIMEZONE = 'America/New_York';
const motivationalMessages = ["Great focus!", "Keep it up!", "Making progress!", "Almost there!", "Dedication!", "Pushing!"];

// Helper Functions 
function formatTime(seconds) {
    const totalSeconds = Math.max(0, Math.floor(seconds));
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function getCurrentDateInET() {
    try {
        // Use Intl.DateTimeFormat to get the date in EST timezone
        const fmt = new Intl.DateTimeFormat('sv-SE', { timeZone: EASTERN_TIMEZONE });
        return fmt.format(new Date());
    } catch (e) {
        console.error("Error getting EST date string:", e);
        const d = new Date(); // Fallback, less reliable across timezones
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    }
}

//Component 
function ClockPage() {
    //  State 
    const [sessionType, setSessionType] = useState(() => localStorage.getItem(LS_KEYS.SESSION_TYPE) || 'Normal');
    const [mode, setMode] = useState(() => localStorage.getItem(LS_KEYS.MODE) || 'Study');
    const [isActive, setIsActive] = useState(false);
    const [time, setTime] = useState(0); // Display time
    const [targetDuration, setTargetDuration] = useState(0);
    const [totalStudied, setTotalStudied] = useState(0); // Global, loaded in useEffect
    const [petHappiness, setPetHappiness] = useState(0); // Global, loaded in useEffect
    const [motivation, setMotivation] = useState('');
    const [componentError, setComponentError] = useState(null);
    const [isInitialized, setIsInitialized] = useState(false);

    //  Refs 
    const intervalRef = useRef(null);
    const motivationTimeoutRef = useRef(null);
    const happinessBaselineRef = useRef(0.0); // Tracks study time for happiness calc


    //  Helper to Update Global Total Studied Time
    const updateTotalStudied = useCallback((secondsToAdd) => {
        if (secondsToAdd <= 0) return;
        const currentTotal = parseInt(localStorage.getItem(GLOBAL_LS_KEYS.TOTAL_STUDIED) || '0', 10);
        const newTotal = currentTotal + Math.floor(secondsToAdd);
        console.log(`ClockPage: Updating Total Studied. Adding ${Math.floor(secondsToAdd)}s. Old: ${currentTotal}, New: ${newTotal}`);
        localStorage.setItem(GLOBAL_LS_KEYS.TOTAL_STUDIED, newTotal.toString());
        setTotalStudied(newTotal); // Update local state for display
    }, []); // No dependencies needed


    // Initialization Effect 
    useEffect(() => {
        console.log("ClockPage: Initializing...");
        let didCancel = false;
        try {
            document.body.classList.add('clock-body');

            // Load timer specific state
            const storedIsActive = localStorage.getItem(LS_KEYS.IS_ACTIVE) === 'true';
            const storedStartTime = parseInt(localStorage.getItem(LS_KEYS.START_TIME) || '0', 10);
            const storedPausedElapsed = parseFloat(localStorage.getItem(LS_KEYS.PAUSED_ELAPSED) || '0.0');
            const storedTarget = parseInt(localStorage.getItem(LS_KEYS.TARGET_DURATION) || '0', 10);
            const storedType = localStorage.getItem(LS_KEYS.SESSION_TYPE) || 'Normal';
            const storedMode = localStorage.getItem(LS_KEYS.MODE) || 'Study';
            const storedHappinessBaseline = parseFloat(localStorage.getItem(LS_KEYS.HAPPINESS_CALC_BASELINE) || '0.0');

            // Calculate initial elapsed and display times
            let currentTotalElapsed = storedPausedElapsed;
            if (storedIsActive && storedStartTime > 0) {
                const elapsedSinceStart = (Date.now() - storedStartTime) / 1000.0;
                currentTotalElapsed += elapsedSinceStart;
            }
            let initialDisplayTime = 0;
            if ((storedType === 'Pomodoro' || storedType === 'Preset'  && storedTarget > 0)) {
                initialDisplayTime = Math.max(0, storedTarget - currentTotalElapsed);
            } else {
                initialDisplayTime = currentTotalElapsed;
            }

             //  Daily Reset Check & Global State Loading 
            let currentHappiness = parseInt(localStorage.getItem(GLOBAL_LS_KEYS.PET_HAPPINESS) || '0', 10);
            let currentTotalStudied = parseInt(localStorage.getItem(GLOBAL_LS_KEYS.TOTAL_STUDIED) || '0', 10);
             let currentHappinessBaseline = storedHappinessBaseline; // Use value loaded above

             try {
                const todayET = getCurrentDateInET();
                const lastResetCheckET = localStorage.getItem(GLOBAL_LS_KEYS.LAST_RESET_CHECK);
                 if (lastResetCheckET !== todayET) {
                     console.log("ClockPage Init: New day detected, resetting persisted states.");
                     currentHappiness = 0;
                     currentTotalStudied = 0;
                     currentHappinessBaseline = 0.0; // Reset happiness calc baseline
                     localStorage.setItem(GLOBAL_LS_KEYS.PET_HAPPINESS, '0');
                     localStorage.setItem(GLOBAL_LS_KEYS.TOTAL_STUDIED, '0');
                     localStorage.setItem(GLOBAL_LS_KEYS.LAST_RESET_CHECK, todayET);
                     localStorage.setItem(LS_KEYS.HAPPINESS_CALC_BASELINE, '0.0'); // Persist the reset baseline
                 }
             } catch (resetError) { console.error("Error during daily reset check:", resetError); }


            // Set state only if component hasn't unmounted
             if (!didCancel) {
                setSessionType(storedType);
                setMode(storedMode);
                setTargetDuration(storedTarget);
                setTime(initialDisplayTime);
                happinessBaselineRef.current = currentHappinessBaseline; // Sync ref
                setPetHappiness(currentHappiness); // Set loaded/reset value
                setTotalStudied(currentTotalStudied); // Set loaded/reset value
                 setIsActive(storedIsActive); // Set active last to potentially trigger interval useEffect
                 setIsInitialized(true);
                 console.log("ClockPage: Init complete.");
             }

        } catch (e) {
            console.error("ClockPage: Init error", e);
            if (!didCancel) { setComponentError("Failed load state."); setIsInitialized(true); }
        }

        //  Event Listener Setup 
        const handleStorageChange = (e) => {
            if (didCancel) return;
            if (e.key === GLOBAL_LS_KEYS.PET_HAPPINESS) setPetHappiness(parseInt(e.newValue || '0', 10));
            if (e.key === GLOBAL_LS_KEYS.TOTAL_STUDIED) setTotalStudied(parseInt(e.newValue || '0', 10));
        };
        window.addEventListener('storage', handleStorageChange);

        //  Cleanup 
        return () => {
            didCancel = true;
            document.body.classList.remove('clock-body');
            clearInterval(intervalRef.current);
            clearTimeout(motivationTimeoutRef.current);
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []); // Empty dependency array: Runs only once on mount


    //Persist Timer Config State 
    useEffect(() => {
        if (!isInitialized) return;
        localStorage.setItem(LS_KEYS.SESSION_TYPE, sessionType);
        localStorage.setItem(LS_KEYS.MODE, mode);
        localStorage.setItem(LS_KEYS.IS_ACTIVE, isActive.toString());
        localStorage.setItem(LS_KEYS.TARGET_DURATION, targetDuration.toString());
    }, [sessionType, mode, isActive, targetDuration, isInitialized]); // Persist these on change

    //  Interval Timer Effect 
    useEffect(() => {
        if (!isActive || !isInitialized) {
            clearInterval(intervalRef.current);
            return;
        }

        console.log("ClockPage: Interval Effect Tick");
        intervalRef.current = setInterval(() => {
            const now = Date.now();
            const startTime = parseInt(localStorage.getItem(LS_KEYS.START_TIME) || '0', 10);
            const pausedElapsed = parseFloat(localStorage.getItem(LS_KEYS.PAUSED_ELAPSED) || '0.0');
            const currentTarget = targetDuration;
            if (startTime === 0) { handlePause(); return; } // Safeguard

            const elapsedSinceStart = (now - startTime) / 1000.0;
            const currentTotalElapsed = pausedElapsed + elapsedSinceStart;
            const isStudySession = sessionType === 'Normal' || sessionType === 'Preset' || (sessionType === 'Pomodoro' && mode === 'Study');

            // Calculate Display Time
            let displayTime, timerFinished = false;
             if (sessionType === 'Normal') {
                 displayTime = currentTotalElapsed;
                 

        
            } 


            else if (sessionType === 'Preset') {
                displayTime = Math.max(0, currentTarget - currentTotalElapsed);
                 if (displayTime === 0) { timerFinished = true; }
       
           } 
            
            
            
            else { // Pomodoro
                 displayTime = Math.max(0, currentTarget - currentTotalElapsed);
                 if (displayTime === 0) { timerFinished = true; }
             }
            setTime(displayTime);

            // Update Happiness & Total Studied only if studying
            if (isStudySession) {
                const baselineSeconds = happinessBaselineRef.current; // Use ref for current baseline
                const currentTotalMinutes = Math.floor(currentTotalElapsed / HAPPINESS_INCREASE_INTERVAL_SECONDS);
                const baselineMinutes = Math.floor(baselineSeconds / HAPPINESS_INCREASE_INTERVAL_SECONDS);
                const minutesToAdd = currentTotalMinutes - baselineMinutes;

                if (minutesToAdd > 0) {
                    console.log(`ClockPage Tick: Adding ${minutesToAdd} happiness.`);
                    const newBaseline = currentTotalMinutes * HAPPINESS_INCREASE_INTERVAL_SECONDS;
                    happinessBaselineRef.current = newBaseline; // Update ref
                    localStorage.setItem(LS_KEYS.HAPPINESS_CALC_BASELINE, newBaseline.toString()); // Persist baseline
                    setPetHappiness(prev => { // Use functional update for happiness
                        const newHap = Math.min(100, prev + minutesToAdd);
                        localStorage.setItem(GLOBAL_LS_KEYS.PET_HAPPINESS, newHap.toString());
                        return newHap;
                    });
                }
                // Show motivation (keep existing logic)
                const elapsedInt = Math.floor(currentTotalElapsed);
                 if (elapsedInt > 0 && !motivation && elapsedInt % (5 * 60) === 0) { showMotivation(); }
            }

            // Handle Timer Finish (update totals here!)
            if (timerFinished) {
                 console.log("ClockPage Tick: Timer finished.");
                 clearInterval(intervalRef.current);
                 setIsActive(false);

                 const finalTimestamp = Date.now();
                 const finalElapsedSinceStart = (finalTimestamp - startTime) / 1000.0;
                 const finalTotalElapsed = pausedElapsed + finalElapsedSinceStart;
                 const finalStoredValue = (sessionType === 'Normal') ? finalTotalElapsed : Math.min(currentTarget, finalTotalElapsed);

                if (isStudySession) {
                     const secondsStudiedThisSegment = finalElapsedSinceStart;
                    updateTotalStudied(secondsStudiedThisSegment); // Update total studied 
                    happinessBaselineRef.current = finalStoredValue; // Update baseline to final point
                    localStorage.setItem(LS_KEYS.HAPPINESS_CALC_BASELINE, finalStoredValue.toString());
                }

                 localStorage.setItem(LS_KEYS.IS_ACTIVE, 'false');
                 localStorage.setItem(LS_KEYS.PAUSED_ELAPSED, finalStoredValue.toString());
                 localStorage.setItem(LS_KEYS.START_TIME, '0');

                 alert(`Timer finished!`);
                 if (sessionType === 'Pomodoro') { handlePomodoroTransition(); }
                 else { handleReset(); }
             }

        }, 1000);

        return () => { clearInterval(intervalRef.current); };
    }, [isActive, isInitialized, targetDuration, sessionType, mode]); // Dependencies


    // Action Handlers 

     const handleStart = useCallback(() => {
        if (!isInitialized || isActive) return;
         console.log("ClockPage: handleStart");
         const now = Date.now();
         const storedPausedElapsed = parseFloat(localStorage.getItem(LS_KEYS.PAUSED_ELAPSED) || '0.0');
         // Ensure ref baseline matches storage on start
         happinessBaselineRef.current = parseFloat(localStorage.getItem(LS_KEYS.HAPPINESS_CALC_BASELINE) || '0.0');

        let currentTarget = targetDuration;
         let displayTime = 0;

         if (storedPausedElapsed === 0) { // Starting fresh?
             if (sessionType === 'Pomodoro') {
                 currentTarget = POMODORO_STUDY_TIME; setMode('Study'); setTargetDuration(currentTarget); displayTime = currentTarget;
             } else if (sessionType === 'Preset') {
                 if (currentTarget <= 0) { alert("Select preset duration."); return; } displayTime = currentTarget;
             } else { displayTime = 0; }
         } else { // Resuming
             if (sessionType === 'Normal' || sessionType === 'Preset') {
                 displayTime = storedPausedElapsed;
                 if (sessionType === 'Preset') { displayTime = Math.max(0, currentTarget - storedPausedElapsed) };
             } else { // Pomodoro
                 displayTime = Math.max(0, currentTarget - storedPausedElapsed);
             }
         }
        setTime(displayTime); // Update display state
        setIsActive(true); // Update active state -> triggers localStorage update via useEffect
        localStorage.setItem(LS_KEYS.START_TIME, now.toString()); // Record start time
         // No change needed for PAUSED_ELAPSED here, START_TIME defines the segment
     }, [isInitialized, isActive, sessionType, targetDuration, mode]);


     const handlePause = useCallback(() => {
        if (!isInitialized || !isActive) return;
         console.log("ClockPage: handlePause");
         clearInterval(intervalRef.current);
         const now = Date.now();
         const storedStartTime = parseInt(localStorage.getItem(LS_KEYS.START_TIME) || '0', 10);
         const storedPausedElapsed = parseFloat(localStorage.getItem(LS_KEYS.PAUSED_ELAPSED) || '0.0');
         const currentTarget = targetDuration;
         let elapsedSecondsThisSegment = 0;
         if (storedStartTime > 0) { elapsedSecondsThisSegment = (now - storedStartTime) / 1000.0; }
         const newTotalPausedElapsed = storedPausedElapsed + elapsedSecondsThisSegment;
         const finalPausedValue = (sessionType === 'Normal') ? newTotalPausedElapsed : Math.min(currentTarget > 0 ? currentTarget : Infinity, newTotalPausedElapsed);
         const isStudySession = sessionType === 'Normal' || sessionType === 'Preset' || mode === 'Study';

         // Update Total Studied 
         if (isStudySession && elapsedSecondsThisSegment > 0) {
             updateTotalStudied(elapsedSecondsThisSegment);
         }

         setIsActive(false); // -> Triggers localStorage update
         localStorage.setItem(LS_KEYS.PAUSED_ELAPSED, finalPausedValue.toString());
         localStorage.setItem(LS_KEYS.START_TIME, '0');

        if (isStudySession) {
             happinessBaselineRef.current = finalPausedValue; // Update ref
             localStorage.setItem(LS_KEYS.HAPPINESS_CALC_BASELINE, finalPausedValue.toString()); // Update storage
             console.log("ClockPage Pause: Updated baseline to", finalPausedValue);
         }

         clearTimeout(motivationTimeoutRef.current); setMotivation('');
     }, [isInitialized, isActive, sessionType, mode, targetDuration, updateTotalStudied]); // Added updateTotalStudied


     const handleReset = useCallback(() => {
         if (!isInitialized) return;
         console.log("ClockPage: handleReset");
         clearInterval(intervalRef.current);
         clearTimeout(motivationTimeoutRef.current);
         setMotivation('');

         const storedStartTime = parseInt(localStorage.getItem(LS_KEYS.START_TIME) || '0', 10);
        const elapsedSecondsThisSegment = isActive && storedStartTime > 0 ? (Date.now() - storedStartTime) / 1000.0 : 0;
         const isStudySession = sessionType === 'Normal' || sessionType === 'Preset' || mode === 'Study';

         // Update total studied if resetting mid-study segment
        if (isStudySession && elapsedSecondsThisSegment > 0) {
             updateTotalStudied(elapsedSecondsThisSegment);
         }

        setIsActive(false); // -> Triggers localStorage update
         localStorage.setItem(LS_KEYS.START_TIME, '0');
         localStorage.setItem(LS_KEYS.PAUSED_ELAPSED, '0');
         localStorage.setItem(LS_KEYS.HAPPINESS_CALC_BASELINE, '0');
         happinessBaselineRef.current = 0.0; // Reset ref

         let newTarget = 0; let newDisplayTime = 0;

         if (sessionType === 'Pomodoro') {
              setMode('Study'); newTarget = POMODORO_STUDY_TIME; newDisplayTime = newTarget;
          } else if (sessionType === 'Preset') {
              // Keep target for presets on reset, just reset progress
              newTarget = targetDuration; // Read from current state
              newDisplayTime = newTarget;
         } //  time becomes 0

         setTargetDuration(newTarget); // Update state -> triggers localStorage update
         setTime(newDisplayTime);

     }, [isInitialized, isActive, sessionType, targetDuration, mode, updateTotalStudied]); // Added mode, updateTotalStudied


    // handleSessionTypeChange, handlePomodoroTransition, handleSetPresetTimer should correctly call the revised handleReset
     const handleSessionTypeChange = useCallback((newType) => {
        if (!isInitialized || isActive) return;
         handleReset(); // Fully resets timer state including baselines
         setSessionType(newType); // Set new type (triggers effect for storage)
         // Setup defaults for new type AFTER reset
         if (newType === 'Pomodoro') { setTargetDuration(POMODORO_STUDY_TIME); setTime(POMODORO_STUDY_TIME); setMode('Study');}
         else if (newType === 'Preset') { setTargetDuration(0); setTime(0); } // Wait for button click
         else { setTargetDuration(0); setTime(0); } // Normal starts at 0
    }, [isInitialized, isActive, handleReset]);


     const handlePomodoroTransition = useCallback(() => {
        let newMode = (mode === 'Study') ? 'Break' : 'Study';
        let newTarget = (mode === 'Study') ? POMODORO_BREAK_TIME : POMODORO_STUDY_TIME;
         alert(`${mode} finished! Starting ${newMode}.`);
         // Explicitly call Reset to clear Pause/Baselines, then set new mode state
         handleReset(); // Ensure full clean state before starting next phase
         setMode(newMode); // Will trigger effect for localStorage
         setSessionType('Pomodoro'); // Ensure it's still Pomodoro
         setTargetDuration(newTarget);
         setTime(newTarget);
     }, [mode, handleReset]);

    const handleSetPresetTimer = useCallback((durationKey) => {
        if (isActive || !isInitialized) return;
         const newTarget = PRESET_DURATIONS[durationKey];
         if (newTarget === undefined) return;
         handleReset(); // Reset first
         setSessionType('Preset'); // Set type to Preset
         setTargetDuration(newTarget); // Set target (triggers effect)
        setTime(newTarget); // Set display (visual only, real calc is interval)
    }, [isActive, isInitialized, handleReset]);

     const showMotivation = useCallback(() => { 
         const randomMessage = motivationalMessages[Math.floor(Math.random() * motivationalMessages.length)];
         setMotivation(randomMessage);
         clearTimeout(motivationTimeoutRef.current);
         motivationTimeoutRef.current = setTimeout(() => setMotivation(''), 5000);
     }, []);

     const formatTotalStudied = (secs) => { 
         const hours = Math.floor(secs / 3600);
         const minutes = Math.floor((secs % 3600) / 60);
         return `${hours}h ${minutes}m`;
     };

    const displayTimeValue = Math.max(0, Math.floor(time));


    // Render  (No changes to JSX structure needed)
    if (!isInitialized) { /* ... loading */ return (<> <ClockNavBar /><div className="timer-page-container page-content"><p className="loading-indicator">Initializing Clock...</p></div> </>); }
    if (componentError) { /* ... error */ return (<> <ClockNavBar /><div className="timer-page-container page-content"><p className="error-message">{componentError}</p></div> </>); }
    return (
         <>
             <ClockNavBar />
             <div className="timer-page-container page-content">
                 <div className="timer-card">
                    <h2 className="timer-title"> {/* Title logic  */} Study Clock {sessionType === 'Pomodoro' ? `(${mode})` : ''}{sessionType === 'Preset' ? `(${Object.keys(PRESET_DURATIONS).find(key => PRESET_DURATIONS[key] === targetDuration) || 'Set'})` : ''} </h2>
                     <div className="timer-session-controls"> {/*  Session buttons  */}
                         <div className="session-selector-group"> <label>Mode:</label> {/*  mode buttons  */}<button onClick={() => handleSessionTypeChange('Normal')} className={`mode-button ${sessionType === 'Normal' ? 'active' : ''}`} disabled={isActive}>Normal</button> <button onClick={() => handleSessionTypeChange('Pomodoro')} className={`mode-button ${sessionType === 'Pomodoro' ? 'active' : ''}`} disabled={isActive}>Pomodoro</button> <button onClick={() => handleSessionTypeChange('Preset')} className={`mode-button ${sessionType === 'Preset' ? 'active' : ''}`} disabled={isActive}>Preset</button> </div>
                         {sessionType === 'Preset' && (<div className="preset-buttons-group"> <label>Set:</label> {Object.entries(PRESET_DURATIONS).map(([label, durationSecs]) => ( <button key={label} onClick={() => handleSetPresetTimer(label)} className={`preset-button ${targetDuration === durationSecs ? 'active' : ''}`} disabled={isActive}> {label} </button> ))} </div> )}
                     </div>
                     <div className="timer-display-wrapper"> <div className="timer-display">{formatTime(displayTimeValue)}</div> </div>
                    {motivation && <p className="motivation-message">{motivation}</p>}
                    <div className="timer-controls"> {/*  Controls  */}
                         {!isActive ? ( <button onClick={handleStart} className="timer-button start-button" disabled={sessionType==='Preset' && targetDuration===0}> <span className="button-icon">▶</span> Start </button> ) : ( <button onClick={handlePause} className="timer-button pause-button"> <span className="button-icon">❚❚</span> Pause </button> )}
                         <button onClick={handleReset} className="timer-button reset-button" disabled={!isActive && displayTimeValue === (sessionType !== 'Normal' ? targetDuration : 0) && parseFloat(localStorage.getItem(LS_KEYS.PAUSED_ELAPSED) || '0') === 0}> <span className="button-icon">🔄</span> Reset </button>
                     </div>
                     <div className="timer-stats"> {/*  Stats */}
                         <p>Total Studied Today: {formatTotalStudied(totalStudied)}</p> {/* Uses totalStudied state */}
                         <div className="happiness-meter"> <p>Pet Happiness: {petHappiness}% <span className="pet-icon">🐾</span></p> <div className="happiness-bar-container"><div className="happiness-bar" style={{ width: `${petHappiness}%` }}></div></div> </div>
                    </div>
                </div>
            </div>
        </>
     );
}

export default ClockPage;