import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../styles/Global.css"; 
import api from "./api";


function Flashcards() {
  const [flashcards, setFlashcards] = useState([]);
  const [view, setView] = useState("title");
  const [newFlashcard, setNewFlashcard] = useState({
    title: "",
    back: "",
    type: "",
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchFlashcards();
  }, [view]);

  const fetchFlashcards = () => {
    const token = localStorage.getItem("access");
    axios
      .get(`http://localhost:8000/api/note/?view=${view}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : [];
        setFlashcards(data);
      })
      .catch((err) => {
        console.error(err);
        alert("Error loading flashcards. Please ensure everything is configured correctly.");
        setFlashcards([]);
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFlashcard({ ...newFlashcard, [name]: value });
  };

  const handleCreateFlashcard = () => {
    const token = localStorage.getItem("access");
    axios
      .post("http://localhost:8000/api/note/", newFlashcard, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(() => {
        setNewFlashcard({ title: "", back: "", type: "" });
        fetchFlashcards();
      })
      .catch((err) => console.error(err));
  };

  return (
    <>
      {/* Fun floating circles (or animals) behind everything */}
      <div className="floating-animals">
        <div className="floating-circle circle1"></div>
        <div className="floating-circle circle2"></div>
        <div className="floating-circle circle3"></div>
      </div>

      <div className="container">
        <h1 className="studious-title">Flashcards</h1>

        {/* Toolbar Section */}
        <div className="toolbar-container">
          {/* Row 1: Module & Question Type */}
          <div className="toolbar-row">
            <select>
              <option>Module 1</option>
              <option>Module 2</option>
              <option>All Modules</option>
            </select>
            <select>
              <option>Random</option>
              <option>Title</option>
              <option>Back</option>
            </select>
          </div>

          {/* Row 2: Navigation & Difficulty */}
          <div className="toolbar-row">
            <button className="btn-primary">Previous</button>
            <button className="btn-primary">Next</button>
            <button className="btn-warning">Mark as Hard</button>
            <button className="btn-info">Mark as Easy</button>
          </div>

          {/* Row 3: Other Tools */}
          <div className="toolbar-row">
            <button className="btn-secondary">Review All</button>
            <button className="btn-secondary">Toggle Sidebar</button>
            <button className="btn-danger">Reset Progress</button>
            <button className="btn-secondary">Export Stats</button>
          </div>
        </div>

        {/* Status Row */}
        <div className="flashcards-status">
          Questions Answered: 0 | Accuracy: 0% | Card 0 of {flashcards.length}
        </div>

        {/* View Buttons (Title/Back) */}
        <div className="view-buttons">
          <button className="btn-primary" onClick={() => setView("title")}>
            View Title
          </button>
          <button className="btn-success" onClick={() => setView("back")}>
            View Back
          </button>
          <button className="btn-info" onClick={() => setView("title+back")}>
            View Title + Back
          </button>
          <button className="btn-secondary" onClick={() => navigate("/")}>
            Back to Home
          </button>
        </div>

        {/* Flashcards Table */}
        {flashcards.length > 0 ? (
          <table className="flashcards-table">
            <thead>
              <tr>
                {view.includes("title") && <th>Title</th>}
                {view.includes("back") && <th>Back</th>}
              </tr>
            </thead>
            <tbody>
              {flashcards.map((fc, i) => (
                <tr key={i}>
                  {view.includes("title") && <td>{fc.title}</td>}
                  {view.includes("back") && <td>{fc.back}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p>No flashcards found. Create one below!</p>
        )}

        {/* Create New Flashcard */}
        <div className="create-form">
          <h3>Create a New Flashcard</h3>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={newFlashcard.title}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Back</label>
            <input
              type="text"
              name="back"
              value={newFlashcard.back}
              onChange={handleInputChange}
            />
          </div>
          <div className="form-group">
            <label>Type</label>
            <input
              type="text"
              name="type"
              value={newFlashcard.type}
              onChange={handleInputChange}
            />
          </div>
          <button className="btn-success" onClick={handleCreateFlashcard}>
            Create Flashcard
          </button>
        </div>
      </div>
    </>
  );
}

export default Flashcards;
