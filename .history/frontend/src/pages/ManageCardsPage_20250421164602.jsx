import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/Flashcards.css"; // Uses the shared styles
import FlashcardsNavBar from '../components/FlashcardsNavBar';

function ManageCardsPage() {
    const [flashcards, setFlashcards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [selectedModule, setSelectedModule] = useState("All");
    const [manageViewMode, setManageViewMode] = useState("list");
    const [formCard, setFormCard] = useState({ id: null, title: "", back: "", type: "" });
    const navigate = useNavigate();

    const fetchFlashcards = useCallback(() => {
        setLoading(true); setError("");
        api.get("/api/note/")
            .then(res => { setFlashcards(Array.isArray(res.data) ? res.data : []) })
            .catch(err => { setError(`Load failed: ${err.message || 'Unknown error'}`); setFlashcards([]); })
            .finally(() => { setLoading(false); });
    }, []);


    useEffect(() => {
        document.body.classList.add('flashcards-body');
        fetchFlashcards();
        return () => {
            document.body.classList.remove('flashcards-body');
        };
    }, [fetchFlashcards]);

     const cardModules = useMemo(() => {
         const modules = new Set(flashcards.map(c => c.type || 'general'));
         return ["All", ...Array.from(modules).sort()];
     }, [flashcards]);

     const cardsForManageList = useMemo(() => {
        return flashcards.filter(card => selectedModule === 'All' || (card.type || 'general') === selectedModule);
    }, [flashcards, selectedModule]);


     const handleFormInputChange = useCallback((e) => {
        setFormCard(prev => ({ ...prev, [e.target.name]: e.target.value }));
     }, []);


    const handleCreateNew = useCallback(() => {
         setFormCard({ id: null, title: "", back: "", type: selectedModule !== 'All' ? selectedModule : "general" });
         setManageViewMode("form");
        setError("");
     }, [selectedModule]);


     const handleEditClick = useCallback((card) => {
        setFormCard({ ...card, type: card.type || 'general' });
        setManageViewMode("form");
        setError("");
     }, []);


    const handleCancelForm = useCallback(() => {
         setFormCard({ id: null, title: "", back: "", type: "" });
         setManageViewMode("list");
        setError("");
    }, []);

     const handleSaveFlashcard = useCallback((e) => {
         e.preventDefault(); setError(""); if (!formCard.title?.trim() || !formCard.back?.trim()) { setError("Title and Back are required."); return; } setLoading(true);
        const method = formCard.id ? 'put' : 'post';
         const url = formCard.id ? `/api/note/${formCard.id}/` : '/api/note/';
         const payload = { title: formCard.title.trim(), back: formCard.back.trim(), type: formCard.type?.trim() || 'general' };
         api[method](url, payload).then(() => { setManageViewMode("list"); fetchFlashcards(); }).catch(err => { setError(`Save failed: ${err.response?.data?.detail || err.message || 'Unknown error'}`); setLoading(false); });
     }, [formCard, fetchFlashcards]);

    const handleDeleteClick = useCallback((cardId) => {
         if (!cardId) { setError("Invalid Card ID."); return; }
         if (window.confirm("Are you sure you want to delete this card?")) {
             setError(""); setLoading(true); api.delete(`/api/note/${cardId}/`).then(() => {
                 if (manageViewMode === 'form' && formCard.id === cardId) { handleCancelForm(); }
                 fetchFlashcards();
             }).catch(err => { setError(`Delete failed: ${err.response?.data?.detail || err.message || 'Unknown error'}`); setLoading(false); });
         }
    }, [manageViewMode, formCard.id, fetchFlashcards, handleCancelForm]);


    const renderListView = () => (
         <div className="flashcard-list-view">
             {/* Controls Bar (Centered by CSS) */}
            <div className="list-controls">
                 <div className="module-filter">
                    <label htmlFor="moduleFilterList">Module:</label>
                    <select id="moduleFilterList" value={selectedModule} onChange={(e) => { setError(''); setSelectedModule(e.target.value); }} disabled={loading}>
                        {cardModules.map(mod => <option key={mod} value={mod}>{mod}</option>)}
                    </select>
                </div>
                <button className="fc-button fc-button-success" onClick={handleCreateNew} disabled={loading}>Add Flashcard</button>
            </div>

            {/* Loading/Error/Empty States */}
             {loading && manageViewMode === 'list' && <p className="loading-indicator">Loading cards...</p>}
             {!loading && error && manageViewMode === 'list' && <p className="error-message">{error}</p>}
            {!loading && !error && cardsForManageList.length === 0 && (
                <p className="no-flashcards-message">No flashcards found for module "{selectedModule}".</p>
            )}

             {/* Table (Centered by CSS) */}
            {!loading && !error && cardsForManageList.length > 0 && (
                <table className="flashcard-list-table">
                    <thead>
                         <tr>
                            <th>Title</th>
                            <th>Module/Type</th>
                            <th className="actions-column">Actions</th>
                        </tr>
                     </thead>
                    <tbody>
                        {cardsForManageList.map(card => (
                             <tr key={`mng-${card.id}`}>
                                <td>{card.title || ''}</td>
                                <td>{card.type || 'general'}</td>
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


     const renderFormView = () => (
        <div className="flashcard-form-view">
            <h2>{formCard.id ? 'Edit' : 'Add'} Flashcard</h2>
             {error && manageViewMode === 'form' && <p className="error-message">{error}</p>}
             <form onSubmit={handleSaveFlashcard}>
                 <div className="form-row"><label>Title:</label><div className="form-input-container"><input type="text" className="form-input" name="title" value={formCard.title} onChange={handleFormInputChange} required disabled={loading}/></div></div>
                 <div className="form-row"><label>Back:</label><div className="form-input-container"><textarea className="form-textarea" name="back" value={formCard.back} onChange={handleFormInputChange} required rows="4" disabled={loading}/></div></div>
                 <div className="form-row"><label>Module:</label><div className="form-input-container"><input type="text" className="form-input" name="type" value={formCard.type} onChange={handleFormInputChange} placeholder="(Optional)" disabled={loading}/></div></div>
                 <div className="form-footer"><div className="left-actions">{formCard.id&&(<button type="button" className="fc-button fc-button-danger" onClick={()=>handleDeleteClick(formCard.id)} disabled={loading}>Delete</button>)}</div><div className="right-actions"><button type="button" className="fc-button fc-button-secondary" onClick={handleCancelForm} disabled={loading}>Cancel</button><button type="submit" className="fc-button fc-button-primary" disabled={loading}>{loading?'Saving...':'Save'}</button></div></div>
             </form>
        </div>
     );


     return (
        <>
            <FlashcardsNavBar />
            <div className="flashcards-page-container page-content">
                 {}
                 {}
                 {loading && <p className="loading-indicator">Loading data...</p>}
                 {!loading && error && manageViewMode === 'list' && <p className="error-message">{error}</p>}
                 {!loading && !error && (manageViewMode === 'list' ? renderListView() : renderFormView())}
             </div>
        </>
     );
}

export default ManageCardsPage;