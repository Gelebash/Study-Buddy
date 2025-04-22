import React, { useState, useEffect, useCallback } from 'react';
import '../styles/AgendaPage.css';
import AgendaNavBar from '../components/AgendaNavBar';

// ID Generation Logic 
let taskIdCounter = parseInt(localStorage.getItem('agendaTaskIdCounter') || '0');
let checkIdCounter = parseInt(localStorage.getItem('agendaCheckIdCounter') || '0');
let quizIdCounter = parseInt(localStorage.getItem('agendaQuizIdCounter') || '0');
let assignIdCounter = parseInt(localStorage.getItem('agendaAssignIdCounter') || '0');

const getNextId = (type) => {
    let counter, key;
    switch (type) {
        case 'task': counter = ++taskIdCounter; key = 'agendaTaskIdCounter'; break;
        case 'check': counter = ++checkIdCounter; key = 'agendaCheckIdCounter'; break;
        case 'quiz': counter = ++quizIdCounter; key = 'agendaQuizIdCounter'; break;
        case 'assign': counter = ++assignIdCounter; key = 'agendaAssignIdCounter'; break;
        default: return `${type}-${Date.now()}${Math.random()}`; // Fallback for safety
    }
    localStorage.setItem(key, counter.toString());
    return `${type}-${counter}`; // Type prefix for better key distinction
};

//  Component 
function AgendaPage() {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    //  State with localStorage Initialization 
    const [currentDate, setCurrentDate] = useState(() => localStorage.getItem('agendaDate') || new Date().toISOString().split('T')[0]);
    const [goals, setGoals] = useState(() => { try { const p = JSON.parse(localStorage.getItem('agendaGoals')); return Array.isArray(p) && p.length === 3 ? p : ["", "", ""]; } catch { return ["", "", ""]; } });
    const [tasks, setTasks] = useState(() => JSON.parse(localStorage.getItem('agendaTasks') || '[]'));
    const [studyChecklist, setStudyChecklist] = useState(() => JSON.parse(localStorage.getItem('agendaStudyChecklist') || '[]'));
    const [quizzesExams, setQuizzesExams] = useState(() => JSON.parse(localStorage.getItem('agendaQuizzesExams') || '[]'));
    const [assignmentsProjects, setAssignmentsProjects] = useState(() => JSON.parse(localStorage.getItem('agendaAssignmentsProjects') || '[]'));
    const [checkedDays, setCheckedDays] = useState(() => { try { const s = localStorage.getItem('agendaCheckedDays'); return s ? JSON.parse(s) : {}; } catch { return {}; } });

    //  Effects to Save State 
    useEffect(() => { localStorage.setItem('agendaDate', currentDate); }, [currentDate]);
    useEffect(() => { localStorage.setItem('agendaGoals', JSON.stringify(goals)); }, [goals]);
    useEffect(() => { localStorage.setItem('agendaTasks', JSON.stringify(tasks)); }, [tasks]);
    useEffect(() => { localStorage.setItem('agendaStudyChecklist', JSON.stringify(studyChecklist)); }, [studyChecklist]);
    useEffect(() => { localStorage.setItem('agendaQuizzesExams', JSON.stringify(quizzesExams)); }, [quizzesExams]);
    useEffect(() => { localStorage.setItem('agendaAssignmentsProjects', JSON.stringify(assignmentsProjects)); }, [assignmentsProjects]);
    useEffect(() => { localStorage.setItem('agendaCheckedDays', JSON.stringify(checkedDays)); }, [checkedDays]);
    useEffect(() => { document.body.classList.add('agenda-body'); return () => document.body.classList.remove('agenda-body'); }, []);

    // Handlers 
    const handleGoalChange = useCallback((index, value) => { setGoals(prevGoals => { const newGoals = [...prevGoals]; newGoals[index] = value; return newGoals; }); }, []);
    const handleAddItem = useCallback((listSetter, type) => { listSetter(prev => [...prev, { id: getNextId(type), text: '', completed: false }]); }, []);
    const handleItemTextChange = useCallback((id, value, listSetter) => { listSetter(prev => prev.map(item => item.id === id ? { ...item, text: value } : item)); }, []);
    const handleItemCompletionToggle = useCallback((id, listSetter) => { listSetter(prev => prev.map(item => item.id === id ? { ...item, completed: !item.completed } : item)); }, []);
    const handleAddTask = useCallback(() => handleAddItem(setTasks, 'task'), [handleAddItem]);
    const handleAddChecklistItem = useCallback(() => handleAddItem(setStudyChecklist, 'check'), [handleAddItem]);
    const handleAddTableRow = useCallback((tableSetter, type) => { tableSetter(prev => [...prev, { id: getNextId(type), dueDate: '', description: '', completed: false }]); }, []);
    const handleTableCellChange = useCallback((id, field, value, tableSetter) => { tableSetter(prev => prev.map(row => row.id === id ? { ...row, [field]: value } : row)); }, []);
    const handleTableRowCompletionToggle = useCallback((id, tableSetter) => { tableSetter(prev => prev.map(row => row.id === id ? { ...row, completed: !row.completed } : row)); }, []);
    const handleAddQuizExam = useCallback(() => handleAddTableRow(setQuizzesExams, 'quiz'), [handleAddTableRow]);
    const handleAddAssignmentProject = useCallback(() => handleAddTableRow(setAssignmentsProjects, 'assign'), [handleAddTableRow]);
    const handleDayCheckChange = useCallback((day) => { setCheckedDays(prev => ({ ...prev, [day]: !prev[day] })); }, []);

    const handleDeleteItem = useCallback((idToDelete, listSetter) => { if (window.confirm("Delete this item?")) { listSetter(prevList => prevList.filter(item => item.id !== idToDelete)); } }, []);
    const handleDeleteTableRow = useCallback((idToDelete, tableSetter) => { if (window.confirm("Delete this entry?")) { tableSetter(prevTable => prevTable.filter(row => row.id !== idToDelete)); } }, []);


    return (
        <>
            <AgendaNavBar />
            <div className="agenda-page-container page-content">
                <div className="planner-content-area">
                     <div className="planner-header">
                         <h1 className="planner-main-title">Weekly Planner</h1>
                         <div className="planner-date-input">
                             <label htmlFor="planner-date">Week Starting:</label>
                             <input type="date" id="planner-date" value={currentDate} onChange={(e) => setCurrentDate(e.target.value)} />
                         </div>
                     </div>

                     {/* Days of the week section */}
                     <div className="daily-planner-section-horizontal">
                         {daysOfWeek.map(day => (
                             <div key={day} className="day-item-horizontal">
                                 <input type="checkbox" id={`day-${day}`} className="day-checkbox" checked={!!checkedDays[day]} onChange={() => handleDayCheckChange(day)} aria-label={`Mark ${day}`} />
                                 <label htmlFor={`day-${day}`} className="day-label">{day}</label>
                             </div>
                         ))}
                     </div>

                     {/* Main content sections stacked vertically */}
                     <div className="planner-vertical-stack">
                        <div className="planner-section goals-section">
                            <div className="planner-section-header header-goals"><span role="img" aria-label="Target">🎯</span> This week's Goals</div>
                            <div className="planner-section-content">
                                <ol className="goals-list">
                                     {goals.map((goal, index) => ( <li key={index} className="goal-item"><span>{index + 1}.</span><input type="text" value={goal} onChange={(e) => handleGoalChange(index, e.target.value)} placeholder="..." /></li> ))}
                                 </ol>
                             </div>
                        </div>

                        <div className="planner-section tasks-section">
                             <div className="planner-section-header header-goals"><span role="img" aria-label="Checkmark">✔</span> Tasks</div>
                             <div className="planner-section-content">
                                <ul className="checklist">
                                     {tasks.map(task => ( <li key={task.id} className="checklist-item with-delete"> <input type="checkbox" checked={task.completed} onChange={() => handleItemCompletionToggle(task.id, setTasks)} /><input type="text" value={task.text} onChange={(e) => handleItemTextChange(task.id, e.target.value, setTasks)} placeholder="New task..." className={task.completed?'completed':''}/><button onClick={() => handleDeleteItem(task.id, setTasks)} className="delete-item-button" title="Delete Task">×</button></li> ))}
                                 </ul>
                                <button onClick={handleAddTask} className="add-item-button">+ Add Task</button>
                            </div>
                        </div>

                         <div className="planner-section study-checklist-section">
                            <div className="planner-section-header header-goals"><span role="img" aria-label="Books">📚</span> Study Checklist</div>
                            <div className="planner-section-content">
                                 <ul className="checklist">
                                    {studyChecklist.map(item=>( <li key={item.id} className="checklist-item with-delete"><input type="checkbox" checked={item.completed} onChange={()=>handleItemCompletionToggle(item.id, setStudyChecklist)}/><input type="text" value={item.text} onChange={(e)=>handleItemTextChange(item.id, e.target.value, setStudyChecklist)} placeholder="Study goal..." className={item.completed?'completed':''}/><button onClick={() => handleDeleteItem(item.id, setStudyChecklist)} className="delete-item-button" title="Delete Item">×</button></li> ))}
                                 </ul>
                                 <button onClick={handleAddChecklistItem} className="add-item-button">+ Add Study Item</button>
                             </div>
                        </div>

                        <div className="planner-section quizzes-section">
                             <div className="planner-section-header header-goals"><span role="img" aria-label="Wand">🪄</span> Quizzes & Exams</div>
                             <div className="planner-section-content">
                                 <table className="planner-table">
                                    <thead><tr><th className="col-due">Due</th><th className="col-check">✔</th><th className="col-desc">Description</th><th className="col-delete"></th></tr></thead>
                                     <tbody>
                                         {quizzesExams.map(item=>( <tr key={item.id}><td className="col-due"><input type="date" value={item.dueDate} onChange={e=>handleTableCellChange(item.id,'dueDate',e.target.value,setQuizzesExams)}/></td> <td className="col-check"><input type="checkbox" checked={item.completed} onChange={()=>handleTableRowCompletionToggle(item.id,setQuizzesExams)}/></td> <td className="col-desc"><input type="text" value={item.description} onChange={e=>handleTableCellChange(item.id,'description',e.target.value,setQuizzesExams)} placeholder="Details..." className={item.completed?'completed':''}/></td> <td className="col-delete"><button onClick={() => handleDeleteTableRow(item.id, setQuizzesExams)} className="delete-row-button" title="Delete Entry">×</button></td> </tr> ))}
                                     </tbody>
                                 </table>
                                 <button onClick={handleAddQuizExam} className="add-item-button">+ Add Quiz/Exam</button>
                             </div>
                         </div>

                         <div className="planner-section assignments-section">
                             <div className="planner-section-header header-goals"><span role="img" aria-label="Clipboard">📋</span> Assignments & Projects</div>
                             <div className="planner-section-content">
                                 <table className="planner-table">
                                     <thead><tr><th className="col-due">Due</th><th className="col-check">✔</th><th className="col-desc">Description</th><th className="col-delete"></th></tr></thead>
                                     <tbody>
                                        {assignmentsProjects.map(item=>( <tr key={item.id}> <td className="col-due"><input type="date" value={item.dueDate} onChange={e=>handleTableCellChange(item.id,'dueDate',e.target.value,setAssignmentsProjects)}/></td> <td className="col-check"><input type="checkbox" checked={item.completed} onChange={()=>handleTableRowCompletionToggle(item.id,setAssignmentsProjects)}/></td> <td className="col-desc"><input type="text" value={item.description} onChange={e=>handleTableCellChange(item.id,'description',e.target.value,setAssignmentsProjects)} placeholder="Details..." className={item.completed?'completed':''}/></td> <td className="col-delete"><button onClick={() => handleDeleteTableRow(item.id, setAssignmentsProjects)} className="delete-row-button" title="Delete Entry">×</button></td> </tr> ))}
                                     </tbody>
                                 </table>
                                 <button onClick={handleAddAssignmentProject} className="add-item-button">+ Add Assignment/Project</button>
                            </div>
                         </div>
                    </div> {/* End vertical-stack */}
                </div>
            </div>
        </>
    );
}

export default AgendaPage;