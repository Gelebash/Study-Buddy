import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import '../styles/NotebookPage.css'; // Uses updated CSS
import NotebookNavBar from '../components/NotebookNavBar';

// Local Storage ID Counters
let courseIdCounter = parseInt(localStorage.getItem('notebookCourseIdCounter') || '0');
let sectionIdCounter = parseInt(localStorage.getItem('notebookSectionIdCounter') || '0');
let pageIdCounter = parseInt(localStorage.getItem('notebookPageIdCounter') || '0');
const getNextCourseId = () => { const n = ++courseIdCounter; localStorage.setItem('notebookCourseIdCounter', n.toString()); return `course-${n}`; };
const getNextSectionId = () => { const n = ++sectionIdCounter; localStorage.setItem('notebookSectionIdCounter', n.toString()); return `sec-${n}`; };
const getNextPageId = () => { const n = ++pageIdCounter; localStorage.setItem('notebookPageIdCounter', n.toString()); return `page-${n}`; };

function NotebookPage() {
    // --- State ---
    const [courses, setCourses] = useState([]);
    const [activeCourseId, setActiveCourseId] = useState(null);
    const [activeSectionId, setActiveSectionId] = useState(null);
    const [activePageId, setActivePageId] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [editInputValue, setEditInputValue] = useState(''); // Value for sidebar edits
    const [isEditingPageTitle, setIsEditingPageTitle] = useState(false);
    const [editPageTitleValue, setEditPageTitleValue] = useState(''); // Value for main title edit

    const editorRef = useRef(null);
    const sidebarInputRef = useRef(null); // For course/section/page name edit inputs
    const pageTitleInputRef = useRef(null); // For main page title edit input

    // Effects
    // Load initial data from localStorage
    useEffect(() => {
        setIsLoading(true); setError("");
        try {
            const data = localStorage.getItem('notebookDataV2'); let parsed = data ? JSON.parse(data) : [];
            if (!Array.isArray(parsed)) { parsed = []; localStorage.removeItem('notebookDataV2'); }
            
            parsed=parsed.filter(c=>c?.id&&c?.name&&Array.isArray(c?.sections)).map(c=>({...c,sections:(c.sections||[]).filter(s=>s?.id&&s?.name&&Array.isArray(s?.pages)).map(s=>({...s,pages:(s.pages||[]).filter(p=>p?.id&&p?.title)}) )}));
            setCourses(parsed);
            // Validate and set active IDs
            let iCrs=localStorage.getItem('notebookActiveCourseId')||null; let iSec=localStorage.getItem('notebookActiveSectionId')||null; let iPag=localStorage.getItem('notebookActivePageId')||null;
            const crsEx=parsed.some(c=>c.id===iCrs); if(!crsEx)iCrs=null;
            const selCrs=crsEx?parsed.find(c=>c.id===iCrs):null;
            const secEx=selCrs?.sections.some(s=>s.id===iSec); if(!secEx)iSec=null;
            const selSec=secEx?selCrs.sections.find(s=>s.id===iSec):null;
            const pagEx=selSec?.pages.some(p=>p.id===iPag); if(!pagEx)iPag=null;
            if(!iCrs&&parsed.length>0)iCrs=parsed[0].id;
            const finSelCrs=parsed.find(c=>c.id===iCrs);
            if(!iSec&&finSelCrs?.sections.length>0)iSec=finSelCrs.sections[0].id;
            const finSelSec=finSelCrs?.sections.find(s=>s.id===iSec);
            if(!iPag&&finSelSec?.pages.length>0)iPag=finSelSec.pages[0].id;
            setActiveCourseId(iCrs); setActiveSectionId(iSec); setActivePageId(iPag);
        } catch(e){ console.error("Ntbk Load Error:", e); setError("Load failed."); setCourses([]); localStorage.removeItem('notebookDataV2');}
        finally { setIsLoading(false); }
        document.body.classList.add('notebook-body'); const timerId=setInterval(()=>setCurrentTime(new Date()),60000); return()=>{document.body.classList.remove('notebook-body'); clearInterval(timerId);};
    },[]);

    // Persist state to localStorage whenever it changes
    useEffect(() => { if(!isLoading)try{localStorage.setItem('notebookDataV2',JSON.stringify(courses));}catch(e){setError("Save failed.");}},[courses,isLoading]);
    useEffect(() => { if(!isLoading){if(activeCourseId)localStorage.setItem('notebookActiveCourseId',activeCourseId);else localStorage.removeItem('notebookActiveCourseId');}},[activeCourseId,isLoading]);
    useEffect(() => { if(!isLoading){if(activeSectionId)localStorage.setItem('notebookActiveSectionId',activeSectionId);else localStorage.removeItem('notebookActiveSectionId');}},[activeSectionId,isLoading]);
    useEffect(() => { if(!isLoading){if(activePageId)localStorage.setItem('notebookActivePageId',activePageId);else localStorage.removeItem('notebookActivePageId');}},[activePageId,isLoading]);

    // Auto-selection effects (handle cascade selection)
    useEffect(()=>{ if(isLoading||editingItem)return;const ac=courses.find(c=>c.id===activeCourseId);if(ac&&ac.sections.length>0){const se=ac.sections.some(s=>s.id===activeSectionId);if(!se)setActiveSectionId(ac.sections[0].id);}else if(activeSectionId!==null)setActiveSectionId(null);},[activeCourseId,courses,isLoading,activeSectionId,editingItem]);
    useEffect(()=>{ if(isLoading||editingItem||!activeSectionId){if(activePageId!==null&&!editingItem)setActivePageId(null);return;}const ac=courses.find(c=>c.id===activeCourseId);const as=ac?.sections.find(s=>s.id===activeSectionId);if(as&&as.pages.length>0){const pe=as.pages.some(p=>p.id===activePageId);if(!pe)setActivePageId(as.pages[0].id);}else if(activePageId!==null)setActivePageId(null);},[activeSectionId,courses,isLoading,activeCourseId,activePageId,editingItem]);

    // Focus Effects
    useEffect(()=>{ if(editingItem&&sidebarInputRef.current)sidebarInputRef.current.focus();},[editingItem]);
    useEffect(()=>{ if(isEditingPageTitle&&pageTitleInputRef.current)pageTitleInputRef.current.focus();},[isEditingPageTitle]);

    //  Derived Data 
    const activeCourse = useMemo(() => courses.find(c => c.id === activeCourseId), [courses, activeCourseId]);
    const activeSections = useMemo(() => activeCourse?.sections || [], [activeCourse]);
    const activeSection = useMemo(() => activeSections.find(s => s.id === activeSectionId), [activeSections, activeSectionId]);
    const activePages = useMemo(() => activeSection?.pages || [], [activeSection]);
    const activePage = useMemo(() => activePages.find(p => p.id === activePageId), [activePages, activePageId]);

    //  Handlers 
    // Selectors (Prevent selection during edit)
    const selectCourse = useCallback((id)=>{if(editingItem||isEditingPageTitle)return;setActiveCourseId(id);setError("");},[editingItem, isEditingPageTitle]);
    const selectSection = useCallback((id)=>{if(editingItem||isEditingPageTitle)return;setActiveSectionId(id);setError("");},[editingItem, isEditingPageTitle]);
    const selectPage = useCallback((id)=>{if(editingItem||isEditingPageTitle)return;setActivePageId(id);setError("");},[editingItem, isEditingPageTitle]);

    // Adders 
    const handleAddCourse=useCallback(()=>{ const n=prompt("C:","");if(n===null)return;const t=n.trim();if(!t){setError("Name?");return;}const nc={id:getNextCourseId(),name:t,sections:[]};setCourses(p=>[...p,nc]);setActiveCourseId(nc.id);setError("");},[]);
    const handleAddSection=useCallback(()=>{ if(!activeCourseId){setError("Select C."); return;}const n=prompt("S:",""); if(n===null)return; const t=n.trim(); if(!t){setError("Name?");return;}const ns={id:getNextSectionId(),name:t,pages:[]}; setCourses(pC=>pC.map(c=>c.id===activeCourseId?{...c,sections:[...c.sections,ns]}:c));setActiveSectionId(ns.id);setError("");}, [activeCourseId]);
    const handleAddPage=useCallback(()=>{ if(!activeSectionId||!activeCourseId){setError("Select C&S."); return;} const t=prompt("P:","U"); if(t===null)return; const tr=t.trim()||"Untitled"; const np={id:getNextPageId(), title:tr, content:""}; setCourses(pC=>pC.map(c=>c.id===activeCourseId?{...c,sections:c.sections.map(s=>s.id===activeSectionId?{...s, pages:[...s.pages, np]}:s)}:c)); setActivePageId(np.id); setError(""); setTimeout(()=>editorRef.current?.focus(),50);},[activeCourseId, activeSectionId]);

    // Editor Change
    const handlePageContentChange=useCallback((e)=>{ if(!activePageId||!activeSectionId||!activeCourseId)return; const nc=e.target.value; setCourses(pC=>pC.map(c=>c.id===activeCourseId?{...c,sections:c.sections.map(s=>s.id===activeSectionId?{...s,pages:s.pages.map(p=>p.id===activePageId?{...p,content:nc}:p)}:s)}:c));},[activeCourseId,activeSectionId,activePageId]);

    // Edit: Start
    const handleStartEdit=useCallback((type,id,currentName,event)=>{ event.stopPropagation(); setEditingItem({type,id}); setEditInputValue(currentName); setError(""); setIsEditingPageTitle(false); },[]);
    const handleStartEditTitle=useCallback(()=>{if(!activePage||editingItem)return; setEditPageTitleValue(activePage.title);setIsEditingPageTitle(true);setEditingItem(null);setError("");},[activePage, editingItem]);
    // Edit: Input Changes
    const handleEditInputChange=(e)=>setEditInputValue(e.target.value);
    const handleEditPageTitleChange=(e)=>setEditPageTitleValue(e.target.value);
    // Edit: Save
    const saveEdit=useCallback(()=>{
        if(!editingItem && !isEditingPageTitle) return;
        let newValue, targetType, targetId;

        if(isEditingPageTitle){ newValue = editPageTitleValue.trim(); targetType = 'page_title'; targetId = activePageId; }
        else{ newValue = editInputValue.trim(); targetType = editingItem.type; targetId = editingItem.id; }

        if(!newValue){setError(`${targetType.replace('_', ' ')} name cannot be empty.`);return;}
        if(newValue.length > 100){setError(`${targetType} name too long.`); return;}

        // CORE LOGIC FOR UPDATING NESTED STATE 
        setCourses(prevCourses => prevCourses.map(course => {
            if (targetType === 'course' && course.id === targetId) return { ...course, name: newValue }; // Update course name
            if (course.id === activeCourseId) { // Is this the course containing the item to update?
                return { ...course, sections: course.sections.map(section => { // Map through sections of the active course
                        if (targetType === 'section' && section.id === targetId) return { ...section, name: newValue }; // Update section name
                        if (section.id === activeSectionId && (targetType === 'page' || targetType === 'page_title')) { 
                            return { ...section, pages: section.pages.map(page => // Map through pages of the active section
                                page.id === targetId ? { ...page, title: newValue } : page // Update the target page's title
                            )};
                        } return section; // Return other sections in this course unchanged
                    })
                };
            } return course; // Return other courses unchanged
        }));
        // 

        setEditingItem(null); setEditInputValue(""); setIsEditingPageTitle(false); setEditPageTitleValue(""); setError("");
    }, [editingItem, isEditingPageTitle, editInputValue, editPageTitleValue, activeCourseId, activeSectionId, activePageId]); // Dependencies needed

    // Edit: Cancel
    const cancelEdit=useCallback(()=>{setEditingItem(null);setEditInputValue("");setIsEditingPageTitle(false);setEditPageTitleValue("");setError("");},[]);
    // Edit: Keyboard handling
    const handleInputKeyDown=useCallback((e)=>{if(e.key==='Enter'){e.preventDefault();saveEdit();}else if(e.key==='Escape'){cancelEdit();}},[saveEdit,cancelEdit]);

    // Delete Handlers
    const handleDeleteCourse=useCallback((id,e)=>{e.stopPropagation();if(window.confirm("Delete course & ALL content?")){setCourses(p=>p.filter(c=>c.id!==id));if(activeCourseId===id){setActiveCourseId(null);setActiveSectionId(null);setActivePageId(null);}setError("");}},[activeCourseId]);
    const handleDeleteSection=useCallback((id,e)=>{e.stopPropagation();if(window.confirm("Delete section & ALL pages?")){if(!activeCourseId)return;setCourses(pC=>pC.map(c=>c.id===activeCourseId?{...c,sections:c.sections.filter(s=>s.id!==id)}:c));if(activeSectionId===id){setActiveSectionId(null);setActivePageId(null);}setError("");}},[activeCourseId,activeSectionId]);
    const handleDeletePage=useCallback((id,e)=>{e.stopPropagation();if(window.confirm("Delete page?")){if(!activeSectionId||!activeCourseId)return;setCourses(pC=>pC.map(c=>c.id===activeCourseId?{...c,sections:c.sections.map(s=>s.id===activeSectionId?{...s,pages:s.pages.filter(p=>p.id!==id)}:s)}:c));if(activePageId===id){setActivePageId(null);}setError("");}},[activeCourseId,activeSectionId,activePageId]);


    // Date Formatting Memo
    const formattedDateTime=useMemo(() => { try {const dO={weekday:'long',month:'long',day:'numeric',year:'numeric'}; const tO={hour:'numeric',minute:'2-digit',hour12:true}; return `${currentTime.toLocaleDateString('en-US',dO)}  ${currentTime.toLocaleTimeString('en-US',tO)}`;}catch{return "Loading Date...";}},[currentTime]);

    //Main Render Function ---
    const renderNotebookContent = () => {
        if (isLoading) return <div className="notebook-loading">Loading Notebook...</div>;

        return (
             <div className="notebook-layout">
                 {/* Column 1: Courses */}
                 <div className="notebook-column courses-column">
                     <button onClick={handleAddCourse} className="notebook-add-button">+ Add Course</button>
                     <ul className="notebook-list courses-list">
                        {courses.map(course => (
                            <li key={course.id} className={`notebook-list-item has-controls ${course.id===activeCourseId?'active':''} ${editingItem?.type==='course'&&editingItem?.id===course.id?'editing':''}`} onClick={()=>!(editingItem?.type==='course'&&editingItem?.id===course.id)&&selectCourse(course.id)} title={course.name}>
                                {editingItem?.type === 'course' && editingItem?.id === course.id ?
                                     <input ref={sidebarInputRef} type="text" value={editInputValue} onChange={handleEditInputChange} onKeyDown={handleInputKeyDown} onBlur={saveEdit} className="list-item-edit-input" aria-label="Edit Course Name"/> :
                                     <span className="item-text" onDoubleClick={(e)=>handleStartEdit('course',course.id,course.name,e)}>{course.name}</span>
                                }
                                <div className="item-controls">
                                    <button onClick={(e)=>handleStartEdit('course',course.id,course.name,e)} className="edit-item-button" title="Rename Course">✏️</button>
                                    <button onClick={(e)=>handleDeleteCourse(course.id,e)} className="delete-button" title="Delete Course">×</button>
                                </div>
                             </li>
                         ))}
                         {courses.length === 0 && <li className="list-placeholder">Add Course</li>}
                     </ul>
                 </div>
                 {/* Column 2: Sections */}
                <div className="notebook-column sections-column">
                     <button onClick={handleAddSection} className="notebook-add-button" disabled={!activeCourseId}>+ Add Section</button>
                    <ul className="notebook-list sections-list">
                         {activeSections.map(section => (
                            <li key={section.id} className={`notebook-list-item has-controls ${section.id===activeSectionId?'active':''} ${editingItem?.type==='section'&&editingItem?.id===section.id?'editing':''}`} onClick={()=>!(editingItem?.type==='section'&&editingItem?.id===section.id)&&selectSection(section.id)} title={section.name}>
                                 {editingItem?.type === 'section' && editingItem?.id === section.id ?
                                    <input ref={sidebarInputRef} type="text" value={editInputValue} onChange={handleEditInputChange} onKeyDown={handleInputKeyDown} onBlur={saveEdit} className="list-item-edit-input" aria-label="Edit Section Name"/> :
                                    <span className="item-text" onDoubleClick={(e)=>handleStartEdit('section',section.id,section.name,e)}>{section.name}</span>
                                 }
                                <div className="item-controls">
                                     <button onClick={(e)=>handleStartEdit('section',section.id,section.name,e)} className="edit-item-button" title="Rename Section">✏️</button>
                                     <button onClick={(e)=>handleDeleteSection(section.id,e)} className="delete-button" title="Delete Section">×</button>
                                </div>
                             </li>
                        ))}
                        {activeCourseId && activeSections.length===0 && <li className="list-placeholder">Add Section</li>}
                        {!activeCourseId && <li className="list-placeholder">Select Course</li>}
                    </ul>
                 </div>
                 {/* Column 3: Pages */}
                <div className="notebook-column pages-column">
                    <button onClick={handleAddPage} className="notebook-add-button" disabled={!activeSectionId}>+ Add Page</button>
                     <ul className="notebook-list pages-list">
                        {activePages.map(page => (
                           <li key={page.id} className={`notebook-list-item has-controls ${page.id===activePageId?'active':''} ${editingItem?.type==='page'&&editingItem?.id===page.id?'editing':''}`} onClick={()=>!(editingItem?.type==='page'&&editingItem?.id===page.id)&&selectPage(page.id)} title={page.title}>
                                {editingItem?.type === 'page' && editingItem?.id === page.id ?
                                     <input ref={sidebarInputRef} type="text" value={editInputValue} onChange={handleEditInputChange} onKeyDown={handleInputKeyDown} onBlur={saveEdit} className="list-item-edit-input" aria-label="Edit Page Title"/> :
                                     <span className="item-text" onDoubleClick={(e)=>handleStartEdit('page',page.id,page.title,e)}>{page.title}</span>
                                }
                                <div className="item-controls">
                                     <button onClick={(e)=>handleStartEdit('page',page.id,page.title,e)} className="edit-item-button" title="Rename Page">✏️</button>
                                     <button onClick={(e)=>handleDeletePage(page.id,e)} className="delete-button" title="Delete Page">×</button>
                                </div>
                            </li>
                        ))}
                        {activeSectionId && activePages.length===0 && <li className="list-placeholder">Add Page</li>}
                         {!activeSectionId && <li className="list-placeholder">Select Section</li>}
                     </ul>
                </div>
                 {/* Column 4: Content Editor */}
                <div className="notebook-column content-column">
                    <div className="content-header"><span className="current-datetime">{formattedDateTime}</span></div>
                     {activePage ? (
                         <div className="content-editor-area">
                             {isEditingPageTitle?(<input ref={pageTitleInputRef}type="text"value={editPageTitleValue}onChange={handleEditPageTitleChange}onKeyDown={handleInputKeyDown}onBlur={saveEdit}className="page-title-edit-input"/>):(<h2 className="page-title-header"onDoubleClick={handleStartEditTitle}title="Double-click to edit title">{activePage.title}</h2>)}
                             <textarea ref={editorRef}className="content-textarea"value={activePage.content || ""} onChange={handlePageContentChange}placeholder="Start typing..."aria-label="Note Content"/>
                         </div>
                    ) : ( <div className="content-placeholder">{!activeCourseId?"Select or Add Course":!activeSectionId?"Select or Add Section":"Select or Add Page"}</div> )}
                 </div>
             </div>
        );
     };

     return (
        <>
            <NotebookNavBar />
            <div className="notebook-page-container page-content">
                 {renderNotebookContent()}
                 {!isLoading && error && <p className="notebook-error bottom-error">{error}</p>}
            </div>
        </>
    );
}

export default NotebookPage;