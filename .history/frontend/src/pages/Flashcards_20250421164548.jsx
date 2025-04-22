import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";
import "../styles/Flashcards.css";
import FlashcardsNavBar from '../components/FlashcardsNavBar';

function shuffleArray(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}

function Flashcards() {
    console.log("Flashcards Component: Start Render");
    const navigate = useNavigate();
    const location = useLocation();
    const initialMode = location.pathname.startsWith('/manage-cards') ? 'manage' : 'study';

    // State declarations
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedModule, setSelectedModule] = useState("All");
    const [activeMode, setActiveMode] = useState(initialMode);
    const [studyView, setStudyView] = useState("title");
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const [displayedFlashcards, setDisplayedFlashcards] = useState([]);
    const [cardOrder, setCardOrder] = useState("Random");
    const [questionsAnswered, setQuestionsAnswered] = useState(0);
    const [isCardAnimating, setIsCardAnimating] = useState(false);
    const [studySubView, setStudySubView] = useState('study');
    const [hardCardIds, setHardCardIds] = useState(() =>
        JSON.parse(localStorage.getItem('hardCardIds') || '[]')
    );
    const [easyCardIds, setEasyCardIds] = useState(() =>
        JSON.parse(localStorage.getItem('easyCardIds') || '[]')
    );
    const [petHappiness, setPetHappiness] = useState(0);
    const [manageViewMode, setManageViewMode] = useState("list");
    const [formCard, setFormCard] = useState({ id: null, title: "", back: "", type: "" });


    // Data Fetching 
    const fetchFlashcards = useCallback(() => {
        console.log("Flashcards: Fetching data...");
        setLoading(true); // Ensure loading is true before fetch
        setError("");
        // No reset of hard/easy IDs here
        api.get("/api/note/")
            .then((res) => {
                console.log("Flashcards: Fetch success");
                setFlashcards(Array.isArray(res.data) ? res.data : []);
            })
            .catch((err) => {
                console.error("Flashcards: Fetch error", err);
                setError(`Failed to load cards: ${err.message || 'Unknown API error'}`);
                setFlashcards([]);
                setDisplayedFlashcards([]);
            })
            .finally(() => {
                console.log("Flashcards: Fetch complete, setLoading(false)");
                setLoading(false);
            });
    }, []); // Empty dependencies, defined once

    //  Effects 

    // Combined Mount/Unmount Effect for Body Class and Initial Fetch/Listeners
    useEffect(() => {
        console.log("Flashcards: Mount Effect - Adding flashcards-body class & fetching data");
        document.body.classList.add('flashcards-body'); // Add class FIRST
        fetchFlashcards(); // Then fetch data

        const savedHappiness = parseInt(localStorage.getItem('petHappiness') || '0', 10);
        setPetHappiness(savedHappiness);

        const handleStorageChange = (event) => {
            if (event.key === 'petHappiness') {
                setPetHappiness(parseInt(event.newValue || '0', 10));
            }
             if (event.key === 'hardCardIds') {
                 setHardCardIds(JSON.parse(event.newValue || '[]'));
             }
             if (event.key === 'easyCardIds') {
                 setEasyCardIds(JSON.parse(event.newValue || '[]'));
             }
        };
        window.addEventListener('storage', handleStorageChange);

        // Cleanup Function
        return () => {
            console.log("Flashcards: Unmount Effect - Removing flashcards-body class");
            document.body.classList.remove('flashcards-body'); // Remove class on unmount
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [fetchFlashcards]); // Depend only on fetchFlashcards callback reference


    // Other useEffects remain the same (Sync activeMode, Save hard/easy, Update Displayed)
    // Sync activeMode with URL Path
     useEffect(() => {
         console.log("Flashcards: Path Sync Effect");
         const modeFromPath = location.pathname.startsWith('/manage-cards') ? 'manage' : 'study';
         if (modeFromPath !== activeMode) {
             setActiveMode(modeFromPath);
             setError('');
             setManageViewMode('list');
             setStudySubView('study');
             // Reset card index when switching main mode for predictability
             setCurrentCardIndex(0);
             setQuestionsAnswered(0);
         }
     }, [location.pathname, activeMode]);


     // Save hard/easy lists to localStorage when they change
     useEffect(() => {
         console.log("Flashcards: Saving Hard/Easy IDs Effect");
         localStorage.setItem('hardCardIds', JSON.stringify(hardCardIds));
         localStorage.setItem('easyCardIds', JSON.stringify(easyCardIds));
     }, [hardCardIds, easyCardIds]);


    // Update Displayed Flashcards (calculation logic)
    useEffect(() => {
        console.log("Flashcards: Update Displayed List Effect");
        let filtered = flashcards;
        if (selectedModule !== "All") {
            filtered = flashcards.filter(card => (card.type || 'general') === selectedModule);
        }

        let ordered;
        if (activeMode === 'study') {
            switch (studySubView) {
                case 'hard':
                    ordered = filtered.filter(card => hardCardIds.includes(card.id));
                    break;
                case 'easy':
                    ordered = filtered.filter(card => easyCardIds.includes(card.id));
                    break;
                case 'study':
                case 'review':
                default:
                    ordered = [...filtered];
                    if (studySubView === 'study' && cardOrder === "Random") {
                        ordered = shuffleArray(ordered);
                    }
                    break;
            }
        } else {
            ordered = [...filtered];
        }

        setDisplayedFlashcards(ordered);

        // Reset index only if it's out of bounds for the newly computed list
        if (currentCardIndex >= ordered.length) {
             console.log("Flashcards: Resetting card index due to list change");
             setCurrentCardIndex(0);
             // Only reset card face if index actually reset or list is empty
             if (ordered.length === 0 || currentCardIndex >= ordered.length) {
                setStudyView('title');
            }
         }
         // Reset answered count logic might need refinement depending on desired behavior
         if (activeMode === 'study' && studySubView !== 'study') {
             setQuestionsAnswered(0); // Reset if viewing hard/easy/review lists
         }


        setIsCardAnimating(false); // Ensure animation resets

    }, [flashcards, selectedModule, cardOrder, activeMode, studySubView, hardCardIds, easyCardIds, currentCardIndex]);


    // Handlers keep all useCallback versions as they were
    const navigateCard = useCallback((newIndexCallback) => {
        if (isCardAnimating || displayedFlashcards.length === 0 || studySubView !== 'study' || activeMode !== 'study') return;
       setIsCardAnimating(true);
       setTimeout(() => {
           const newIndex = newIndexCallback(currentCardIndex);
           const questionsIncrement = (newIndex > currentCardIndex || (currentCardIndex === displayedFlashcards.length - 1 && newIndex === 0)) && displayedFlashcards.length > 0 ? 1 : 0;
            setCurrentCardIndex(newIndex);
            if(questionsIncrement > 0) {
               setQuestionsAnswered(p => p + questionsIncrement);
            }
           setStudyView("title");
            setIsCardAnimating(false);
        }, 300);
    }, [isCardAnimating, displayedFlashcards.length, studySubView, activeMode, currentCardIndex]);


    const handlePrevious = useCallback(() => navigateCard(prev => (prev > 0 ? prev - 1 : displayedFlashcards.length - 1)), [navigateCard, displayedFlashcards.length]);

    const handleNext = useCallback(() => {
        if (displayedFlashcards.length === 0 || studySubView !== 'study' || activeMode !== 'study') return;
        navigateCard(prev => (prev < displayedFlashcards.length - 1 ? prev + 1 : 0));
        const currentHappiness = parseInt(localStorage.getItem('petHappiness') || '0', 10);
        const newHappiness = Math.min(100, currentHappiness + 1);
        localStorage.setItem('petHappiness', newHappiness.toString());
        setPetHappiness(newHappiness);
    }, [navigateCard, displayedFlashcards.length, studySubView, activeMode]);

     const handleMarkHard = useCallback(() => {
         const card = displayedFlashcards[currentCardIndex];
         if (!card || studySubView !== 'study' || activeMode !== 'study') return;
        setHardCardIds(prev => {
             const newSet = new Set(prev);
             if (newSet.has(card.id)) { newSet.delete(card.id); }
             else { newSet.add(card.id); setEasyCardIds(e => e.filter(id => id !== card.id)); }
            return Array.from(newSet);
        });
     }, [displayedFlashcards, currentCardIndex, studySubView, activeMode]);


    const handleMarkEasy = useCallback(() => {
         const card = displayedFlashcards[currentCardIndex];
         if (!card || studySubView !== 'study' || activeMode !== 'study') return;
        setEasyCardIds(prev => {
             const newSet = new Set(prev);
             if (newSet.has(card.id)) { newSet.delete(card.id); }
             else { newSet.add(card.id); setHardCardIds(h => h.filter(id => id !== card.id)); }
            return Array.from(newSet);
        });
     }, [displayedFlashcards, currentCardIndex, studySubView, activeMode]);


     const handleResetProgress = useCallback(() => {
        if (window.confirm("Reset study session progress (Hard/Easy marks and position)?")) {
            setHardCardIds([]);
            setEasyCardIds([]);
            setCurrentCardIndex(0);
            setQuestionsAnswered(0);
            setStudyView('title');
             if (studySubView !== 'study') setStudySubView('study');
         }
    }, [studySubView]);


    const handleFormInputChange = useCallback((e) => { setFormCard(prev => ({ ...prev, [e.target.name]: e.target.value })); }, []);
    const handleCreateNew = useCallback(() => { setFormCard({ id: null, title: "", back: "", type: selectedModule !== 'All' ? selectedModule : "general" }); setManageViewMode("form"); setError(""); }, [selectedModule]);
    const handleEditClick = useCallback((card) => { setFormCard({ ...card, type: card.type || 'general' }); setManageViewMode("form"); setError(""); }, []);
    const handleCancelForm = useCallback(() => { setFormCard({ id: null, title: "", back: "", type: "" }); setManageViewMode("list"); setError(""); }, []);
    const handleSaveFlashcard = useCallback((e) => {
        e.preventDefault(); setError(""); if (!formCard.title?.trim() || !formCard.back?.trim()) { setError("Title and Back are required."); return; }
        setLoading(true); const method = formCard.id ? 'put' : 'post'; const url = formCard.id ? `/api/note/${formCard.id}/` : '/api/note/';
        const payload = { title: formCard.title.trim(), back: formCard.back.trim(), type: formCard.type?.trim() || 'general' };
        api[method](url, payload).then(() => { setManageViewMode("list"); fetchFlashcards(); }).catch(err => { setError(`Save failed: ${err.response?.data?.detail || err.message || 'Error Saving'}`); setLoading(false); });
    }, [formCard, fetchFlashcards]);

    const handleDeleteClick = useCallback((cardId) => {
        if (!cardId) { setError("Invalid Card ID."); return; } if (window.confirm("Are you sure you want to delete this card?")) {
            setError(""); setLoading(true); api.delete(`/api/note/${cardId}/`)
                .then(() => { if (manageViewMode === 'form' && formCard.id === cardId) handleCancelForm(); fetchFlashcards(); })
                .catch(err => { setError(`Delete failed: ${err.response?.data?.detail || err.message || 'Error Deleting'}`); setLoading(false); });
        }
    }, [manageViewMode, formCard.id, fetchFlashcards, handleCancelForm]);

    // Memos
    const currentStudyCard = (activeMode === 'study' && studySubView === 'study' && displayedFlashcards.length > 0)
        ? displayedFlashcards[currentCardIndex]
        : null;
    const totalCardsInCurrentView = displayedFlashcards.length;
    const cardModules = useMemo(() => ["All", ...new Set(flashcards.map(c => c.type || 'general').filter(Boolean).sort())], [flashcards]);
    const hardListCount = useMemo(() => flashcards.filter(card => (selectedModule === 'All' || (card.type || 'general') === selectedModule) && hardCardIds.includes(card.id)).length, [flashcards, selectedModule, hardCardIds]);
    const easyListCount = useMemo(() => flashcards.filter(card => (selectedModule === 'All' || (card.type || 'general') === selectedModule) && easyCardIds.includes(card.id)).length, [flashcards, selectedModule, easyCardIds]);
    const reviewModuleCount = useMemo(() => flashcards.filter(card => selectedModule === 'All' || (card.type || 'general') === selectedModule).length, [flashcards, selectedModule]);

    //Render Functions
    const renderStudyCardContent = () => {
       if (!currentStudyCard) {
           return <p className="no-flashcards-message">Select cards to study.</p>;
       }
       const showTitle = studyView === 'title' || studyView === 'title+back';
       const showBack = studyView === 'back' || studyView === 'title+back';
       return (
           <div className="current-card-content">
               {showTitle && <span className="card-title">{currentStudyCard.title}</span>}
               {showBack && <span className="card-back">{currentStudyCard.back}</span>}
           </div>
       );
    };

    const renderStudyCardView = () => (
        <>
            <div className="flashcard-display-area">
                <div className={`card-content-wrapper ${isCardAnimating ? 'fade-out' : 'fade-in'}`}>
                    {renderStudyCardContent()}
                </div>
            </div>
            <div className="flashcard-view-controls">
                <button className={`fc-button fc-button-view-title ${studyView === 'title' ? 'active' : ''}`} onClick={() => setStudyView("title")} disabled={!currentStudyCard || isCardAnimating}>View Title</button>
                <button className={`fc-button fc-button-view-back ${studyView === 'back' ? 'active' : ''}`} onClick={() => setStudyView("back")} disabled={!currentStudyCard || isCardAnimating}>View Back</button>
                <button className={`fc-button fc-button-view-both ${studyView === 'title+back' ? 'active' : ''}`} onClick={() => setStudyView("title+back")} disabled={!currentStudyCard || isCardAnimating}>View Both</button>
            </div>
        </>
    );

    const renderCardList = (list, listType) => (
        <div className={`flashcard-list-container ${listType}-list`}>
            <h3 className="list-view-header">
                {listType === 'hard' ? 'Hard List' : listType === 'easy' ? 'Easy List' : `Review: ${selectedModule}`}
            </h3>
            {list.length === 0 ? (
                <p className="no-flashcards-message">{listType === 'review' ? `No cards in module "${selectedModule}".` : `No cards marked as '${listType}' in module "${selectedModule}".`}</p>
            ) : (
                <ul className="styled-card-list">
                    {list.map(card => (
                        <li key={`${listType}-${card.id}`} className="card-list-item">
                           <span className="card-list-title">{card.title}</span>
                            <span className="card-list-back">{card.back}</span>
                       </li>
                   ))}
               </ul>
            )}
        </div>
    );

   const renderStudyMode = () => (
       <div className="flashcard-study-mode">
           <div className="flashcard-top-controls">
               {/* controls */}
                <div className="control-group">
                    <label htmlFor="moduleFilterStudy">Module:</label>
                    <select id="moduleFilterStudy" value={selectedModule} onChange={(e) => { setSelectedModule(e.target.value); setError(''); }} disabled={loading}>
                         {cardModules.map(mod => <option key={mod} value={mod}>{mod}</option>)}
                    </select>
                </div>
                 <div className="control-group">
                     <label htmlFor="orderSelectorStudy">Order:</label>
                    <select id="orderSelectorStudy" value={cardOrder} onChange={(e) => setCardOrder(e.target.value)} disabled={loading || studySubView !== 'study'}>
                        <option value="Random">Random</option>
                        <option value="Sequential">Sequential</option>
                     </select>
                 </div>
                {studySubView === 'study' && (
                     <div className="control-group navigation-buttons">
                        <button className="fc-button fc-button-secondary" onClick={handlePrevious} disabled={totalCardsInCurrentView <= 1 || isCardAnimating || loading}>Previous</button>
                         <button className="fc-button fc-button-secondary" onClick={handleNext} disabled={totalCardsInCurrentView <= 1 || isCardAnimating || loading}>Next</button>
                    </div>
                )}
                 <div className="control-group action-buttons">
                     {studySubView === 'study' && (
                        <>
                            <button className={`fc-button fc-button-mark-hard ${hardCardIds.includes(currentStudyCard?.id) ? 'marked' : ''}`} onClick={handleMarkHard} disabled={!currentStudyCard || loading}>Mark Hard</button>
                            <button className={`fc-button fc-button-mark-easy ${easyCardIds.includes(currentStudyCard?.id) ? 'marked' : ''}`} onClick={handleMarkEasy} disabled={!currentStudyCard || loading}>Mark Easy</button>
                        </>
                     )}
                     <button className="fc-button fc-button-reset" onClick={handleResetProgress} disabled={loading}>Reset Session</button>
                </div>
            </div>
           <div className="study-subview-controls">
               {/*subview buttons */}
                <button className={`subview-button ${studySubView === 'study' ? 'active' : ''}`} onClick={() => { setStudySubView('study'); setError(''); }} disabled={loading}>Study Cards</button>
                <button className={`subview-button ${studySubView === 'hard' ? 'active' : ''}`} onClick={() => { setStudySubView('hard'); setError(''); }} disabled={loading || hardListCount === 0}>Hard List ({hardListCount})</button>
                <button className={`subview-button ${studySubView === 'easy' ? 'active' : ''}`} onClick={() => { setStudySubView('easy'); setError(''); }} disabled={loading || easyListCount === 0}>Easy List ({easyListCount})</button>
                <button className={`subview-button ${studySubView === 'review' ? 'active' : ''}`} onClick={() => { setStudySubView('review'); setError(''); }} disabled={loading || reviewModuleCount === 0}>Review Module ({reviewModuleCount})</button>
            </div>
           <div className="flashcard-stats-combined">
               {/* stats bar */}
                 <div className="flashcard-stats-bar">
                     {studySubView === 'study' && `Answered: ${questionsAnswered} | `}
                     Card {totalCardsInCurrentView > 0 && studySubView === 'study' ? currentCardIndex + 1 : 0} of {totalCardsInCurrentView}
                  </div>
                  <div className="pet-happiness-display-flashcards">
                      <span className="pet-icon">🐾</span> Happiness: {petHappiness}%
                      <div className="happiness-bar-container-inline">
                          <div className="happiness-bar-inline" style={{ width: `${petHappiness}%` }}></div>
                      </div>
                  </div>
           </div>
           <div className="study-subview-content">
               {/* render subview content */}
               {studySubView === 'study' && renderStudyCardView()}
               {studySubView === 'hard' && renderCardList(displayedFlashcards, 'hard')}
               {studySubView === 'easy' && renderCardList(displayedFlashcards, 'easy')}
               {studySubView === 'review' && renderCardList(displayedFlashcards, 'review')}
           </div>
       </div>
   );


    // Keep renderManageMode and its internals the same
    const renderManageMode = () => {
         console.log("Flashcards: Rendering Manage Mode");
         const cardsForManageList = useMemo(() => flashcards.filter(card => selectedModule === 'All' || (card.type || 'general') === selectedModule), [flashcards, selectedModule]);

        const renderListViewInternal = () => (
             <div className="flashcard-list-view">
                 <div className="list-controls">
                    <div className="module-filter">
                        <label htmlFor="moduleFilterList">Module:</label>
                        <select id="moduleFilterList" value={selectedModule} onChange={(e) => { setError(''); setSelectedModule(e.target.value); }} disabled={loading}>
                            {cardModules.map(mod => <option key={mod} value={mod}>{mod}</option>)}
                         </select>
                    </div>
                    <button className="fc-button fc-button-success" onClick={handleCreateNew} disabled={loading}> Add Flashcard </button>
                 </div>
                  {!loading && cardsForManageList.length === 0 && (<p className="no-flashcards-message">No cards for module "{selectedModule}".</p>)}
                  {!loading && cardsForManageList.length > 0 && (
                     <table className="flashcard-list-table">
                        <thead><tr><th>Title</th><th>Module/Type</th><th className="actions-column">Actions</th></tr></thead>
                         <tbody>
                             {cardsForManageList.map(card => (
                                 <tr key={`mng-${card.id}`}><td>{card.title || ''}</td><td>{card.type || 'general'}</td>
                                    <td className="flashcard-actions">
                                        <button className="fc-button-link" onClick={() => handleEditClick(card)} disabled={loading}>Edit</button>
                                        <button className="fc-button-link danger" onClick={() => handleDeleteClick(card.id)} disabled={loading}>Delete</button>
                                    </td>
                                </tr>
                             ))}
                         </tbody>
                    </table>
                 )}
            </div>
        );

        const renderFormViewInternal = () => (
            <div className="flashcard-form-view">
                 <h2>{formCard.id ? 'Edit' : 'Add'} Flashcard</h2>
                 {error && manageViewMode === 'form' && <p className="error-message">{error}</p>}
                 <form onSubmit={handleSaveFlashcard}>
                    {/*  form rows  */}
                    <div className="form-row">
                        <label htmlFor="formTitleInput">Title:</label>
                       <div className="form-input-container"><input type="text" className="form-input" id="formTitleInput" name="title" value={formCard.title} onChange={handleFormInputChange} required disabled={loading} /></div>
                   </div>
                    <div className="form-row">
                       <label htmlFor="formBackInput">Back:</label>
                        <div className="form-input-container"><textarea className="form-textarea" id="formBackInput" name="back" value={formCard.back} onChange={handleFormInputChange} required rows="4" disabled={loading} /></div>
                   </div>
                   <div className="form-row">
                        <label htmlFor="formTypeInput">Module:</label>
                       <div className="form-input-container"><input type="text" className="form-input" id="formTypeInput" name="type" value={formCard.type} onChange={handleFormInputChange} placeholder="(Optional, defaults to 'general')" disabled={loading} /></div>
                    </div>
                    <div className="form-footer">
                        <div className="left-actions">{formCard.id && (<button type="button" className="fc-button fc-button-danger" onClick={() => handleDeleteClick(formCard.id)} disabled={loading}>Delete</button>)}</div>
                         <div className="right-actions">
                             <button type="button" className="fc-button fc-button-secondary" onClick={handleCancelForm} disabled={loading}>Cancel</button>
                            <button type="submit" className="fc-button fc-button-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                        </div>
                    </div>
                </form>
             </div>
         );

         return (<div className="flashcard-manage-mode">{manageViewMode === 'list' ? renderListViewInternal() : renderFormViewInternal()}</div>);
    };

    //  Main Return Statement 
    console.log("Flashcards Component: Reaching final return. Loading:", loading, "Error:", error);
    return (
        <>
            <FlashcardsNavBar />
            <div className="flashcards-page-container page-content">
                {/* Use explicit conditional rendering for loading/error */}
                {loading && <p className="loading-indicator">Loading Flashcards...</p>}

                {!loading && error && <p className="error-message">{error}</p>}

                {/* Render actual content only when not loading and no error */}
                {!loading && !error && (
                    <>
                        {activeMode === 'study' && renderStudyMode()}
                        {activeMode === 'manage' && renderManageMode()}
                    </>
                )}
            </div>
        </>
    );
}

export default Flashcards;