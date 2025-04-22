import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import '../styles/NotebookPage.css';
import NotebookNavBar from '../components/NotebookNavBar';
import api from "../api";

// API functions
const notebookApi = {
    getCourses: () => api.get('/api/courses/'),
    createCourse: (name) => {
        console.log('Creating course with data:', { name });
        return api.post('/api/courses/', { name });
    },
    updateCourse: (id, name) => api.patch(`/api/courses/${id}/`, { name }),
    deleteCourse: (id) => api.delete(`/api/courses/${id}/`),

    getSections: () => api.get('/api/sections/'),
    createSection: (courseId, name) => api.post('/api/sections/', { course: courseId, name }),
    updateSection: (id, name) => api.patch(`/api/sections/${id}/`, { name }),
    deleteSection: (id) => api.delete(`/api/sections/${id}/`),

    getPages: () => api.get('/api/pages/'),
    createPage: (sectionId, title, content = '') => 
        api.post('/api/pages/', { section: sectionId, title, content }),
    updatePage: (id, data) => api.patch(`/api/pages/${id}/`, data),
    deletePage: (id) => api.delete(`/api/pages/${id}/`),
};

function NotebookPage() {
    const [courses, setCourses] = useState([]);
    const [activeCourseId, setActiveCourseId] = useState(null);
    const [activeSectionId, setActiveSectionId] = useState(null);
    const [activePageId, setActivePageId] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [editingItem, setEditingItem] = useState(null);
    const [editInputValue, setEditInputValue] = useState('');
    const [isEditingPageTitle, setIsEditingPageTitle] = useState(false);
    const [editPageTitleValue, setEditPageTitleValue] = useState('');

    const editorRef = useRef(null);
    const sidebarInputRef = useRef(null);
    const pageTitleInputRef = useRef(null);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            setError("");
            try {
                const [coursesRes, sectionsRes, pagesRes] = await Promise.all([
                    notebookApi.getCourses(),
                    notebookApi.getSections(),
                    notebookApi.getPages()
                ]);

                const coursesData = coursesRes.data.map(course => ({
                    ...course,
                    sections: sectionsRes.data
                        .filter(section => section.course === course.id)
                        .map(section => ({
                            ...section,
                            pages: pagesRes.data
                                .filter(page => page.section === section.id)
                        }))
                }));
                
                setCourses(coursesData);
                
                if (coursesData.length > 0) {
                    setActiveCourseId(coursesData[0].id);
                    if (coursesData[0].sections.length > 0) {
                        setActiveSectionId(coursesData[0].sections[0].id);
                        if (coursesData[0].sections[0].pages.length > 0) {
                            setActivePageId(coursesData[0].sections[0].pages[0].id);
                        }
                    }
                }
            } catch (e) {
                console.error("Notebook Load Error:", e);
                setError("Failed to load notebook data");
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    const handleAddCourse = useCallback(async () => {
        const name = prompt("Course name:", "");
        if (!name) return;
        
        try {
            // Log the request
            console.log('Sending course creation request:', { name: name.trim() });
            const response = await notebookApi.createCourse(name.trim());
            console.log('Course creation response:', response);
            setCourses(prev => [...prev, { ...response.data, sections: [] }]);
            setActiveCourseId(response.data.id);
            setError("");
        } catch (e) {
            console.error('Course creation error:', e.response?.data || e);
            setError("Failed to create course: " + (e.response?.data?.detail || e.message));
        }
    }, []);

    const handleAddSection = useCallback(async () => {
        if (!activeCourseId) {
            setError("Select a course first.");
            return;
        }
        const name = prompt("Section name:", "");
        if (!name) return;

        try {
            const response = await notebookApi.createSection(activeCourseId, name.trim());
            setCourses(prev => prev.map(course =>
                course.id === activeCourseId
                    ? { ...course, sections: [...course.sections, { ...response.data, pages: [] }] }
                    : course
            ));
            setActiveSectionId(response.data.id);
            setError("");
        } catch (e) {
            setError("Failed to create section");
        }
    }, [activeCourseId]);

    const handleAddPage = useCallback(async () => {
        if (!activeSectionId || !activeCourseId) {
            setError("Select a course and section first.");
            return;
        }
        const title = prompt("Page title:", "Untitled");
        if (!title) return;

        try {
            const response = await notebookApi.createPage(activeSectionId, title.trim());
            setCourses(prev => prev.map(course =>
                course.id === activeCourseId
                    ? {
                        ...course,
                        sections: course.sections.map(section =>
                            section.id === activeSectionId
                                ? { ...section, pages: [...section.pages, response.data] }
                                : section
                        )
                    }
                    : course
            ));
            setActivePageId(response.data.id);
            setError("");
            setTimeout(() => editorRef.current?.focus(), 50);
        } catch (e) {
            setError("Failed to create page");
        }
    }, [activeCourseId, activeSectionId]);

    const handleDeleteCourse = useCallback(async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Delete course & ALL content?")) return;
        
        try {
            await notebookApi.deleteCourse(id);
            setCourses(prev => prev.filter(c => c.id !== id));
            if (activeCourseId === id) {
                setActiveCourseId(null);
                setActiveSectionId(null);
                setActivePageId(null);
            }
        } catch (e) {
            setError("Failed to delete course");
        }
    }, [activeCourseId]);

    const handleDeleteSection = useCallback(async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Delete section & ALL its pages?")) return;
        
        try {
            await notebookApi.deleteSection(id);
            setCourses(prev => prev.map(course => ({
                ...course,
                sections: course.sections.filter(s => s.id !== id)
            })));
            if (activeSectionId === id) {
                setActiveSectionId(null);
                setActivePageId(null);
            }
        } catch (e) {
            setError("Failed to delete section");
        }
    }, [activeSectionId]);

    const handleDeletePage = useCallback(async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Delete this page?")) return;
        
        try {
            await notebookApi.deletePage(id);
            setCourses(prev => prev.map(course => ({
                ...course,
                sections: course.sections.map(section => ({
                    ...section,
                    pages: section.pages.filter(p => p.id !== id)
                }))
            })));
            if (activePageId === id) {
                setActivePageId(null);
            }
        } catch (e) {
            setError("Failed to delete page");
        }
    }, [activePageId]);

    const handlePageContentChange = useCallback(async (e) => {
        if (!activePageId) return;
        
        const newContent = e.target.value;
        try {
            await notebookApi.updatePage(activePageId, { content: newContent });
            setCourses(prev => prev.map(course => ({
                ...course,
                sections: course.sections.map(section => ({
                    ...section,
                    pages: section.pages.map(page =>
                        page.id === activePageId
                            ? { ...page, content: newContent }
                            : page
                    )
                }))
            })));
        } catch (e) {
            setError("Failed to save changes");
        }
    }, [activePageId]);

    const handleSectionClick = useCallback((sectionId) => {
        setActiveSectionId(sectionId);
        const section = courses
            .find(c => c.id === activeCourseId)
            ?.sections.find(s => s.id === sectionId);
        if (section?.pages.length > 0) {
            setActivePageId(section.pages[0].id);
        } else {
            setActivePageId(null);
        }
    }, [activeCourseId, courses]);

    const handlePageClick = useCallback((pageId) => {
        setActivePageId(pageId);
    }, []);

    const formattedDateTime = useMemo(() => {
        try {
            const dO = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' };
            const tO = { hour: 'numeric', minute: '2-digit', hour12: true };
            return `${currentTime.toLocaleDateString('en-US', dO)}  ${currentTime.toLocaleTimeString('en-US', tO)}`;
        } catch {
            return "Loading Date...";
        }
    }, [currentTime]);

    const renderNotebookContent = () => {
        const activeCourse = courses.find(c => c.id === activeCourseId);
        const activeSection = activeCourse?.sections.find(s => s.id === activeSectionId);
        const activePage = activeSection?.pages.find(p => p.id === activePageId);

        return (
            <div className="notebook-layout">
                {/* Courses Column */}
                <div className="notebook-column courses-column">
                    <button onClick={handleAddCourse} className="notebook-add-button">
                        + Add Course
                    </button>
                    <ul className="notebook-list">
                        {courses.map(course => (
                            <li
                                key={course.id}
                                onClick={() => setActiveCourseId(course.id)}
                                className={`notebook-list-item ${course.id === activeCourseId ? 'active' : ''}`}
                            >
                                <span className="item-text">{course.name}</span>
                                <div className="item-controls">
                                    <button
                                        onClick={(e) => handleDeleteCourse(course.id, e)}
                                        className="delete-button"
                                    >×</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Sections Column */}
                <div className="notebook-column sections-column">
                    <button 
                        onClick={handleAddSection}
                        className="notebook-add-button"
                        disabled={!activeCourseId}
                    >
                        + Add Section
                    </button>
                    <ul className="notebook-list">
                        {activeCourse?.sections.map(section => (
                            <li
                                key={section.id}
                                onClick={() => handleSectionClick(section.id)}
                                className={`notebook-list-item ${section.id === activeSectionId ? 'active' : ''}`}
                            >
                                <span className="item-text">{section.name}</span>
                                <div className="item-controls">
                                    <button
                                        onClick={(e) => handleDeleteSection(section.id, e)}
                                        className="delete-button"
                                    >×</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Pages Column */}
                <div className="notebook-column pages-column">
                    <button 
                        onClick={handleAddPage}
                        className="notebook-add-button"
                        disabled={!activeSectionId}
                    >
                        + Add Page
                    </button>
                    <ul className="notebook-list">
                        {activeSection?.pages.map(page => (
                            <li
                                key={page.id}
                                onClick={() => handlePageClick(page.id)}
                                className={`notebook-list-item ${page.id === activePageId ? 'active' : ''}`}
                            >
                                <span className="item-text">{page.title}</span>
                                <div className="item-controls">
                                    <button
                                        onClick={(e) => handleDeletePage(page.id, e)}
                                        className="delete-button"
                                    >×</button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Content Column */}
                <div className="notebook-column content-column">
                    {activePage ? (
                        <>
                            <div className="content-header">
                                <span className="current-datetime">
                                    Last modified: {new Date(activePage.created_at).toLocaleString()}
                                </span>
                            </div>
                            <div className="content-editor-area">
                                <h1 className="page-title-header">{activePage.title}</h1>
                                <textarea
                                    ref={editorRef}
                                    className="content-textarea"
                                    value={activePage.content}
                                    onChange={handlePageContentChange}
                                    placeholder="Start typing..."
                                />
                            </div>
                        </>
                    ) : (
                        <div className="content-placeholder">
                            {!activeCourseId ? "Select a course" :
                             !activeSectionId ? "Select a section" :
                             "Select or create a page"}
                        </div>
                    )}
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