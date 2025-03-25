import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Flashcards() {
  const [flashcards, setFlashcards] = useState([]);
  const [view, setView] = useState("title"); // Default view is 'title'
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
    const token = localStorage.getItem("access"); // Retrieve the token

    axios
      .get(`http://localhost:8000/api/note/?view=${view}`, {
        headers: {
          Authorization: `Bearer ${token}`, // Include the token in the Authorization header
        },
      })
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : []; // Ensure data is an array
        console.log("API response:", data); // Log the API response
        setFlashcards(data); // Set the response data to flashcards
      })
      .catch((err) => {
        console.error("Error fetching flashcards:", err.response || err.message);
        alert(
          `Failed to fetch flashcards. ${
            err.response?.data?.detail || "Please try again later."
          }`
        ); // Provide user feedback
        setFlashcards([]); // Set an empty array to avoid rendering issues
      });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewFlashcard({ ...newFlashcard, [name]: value });
  };

  const handleCreateFlashcard = () => {
    const token = localStorage.getItem("access"); // Retrieve the token

    // Ensure only valid fields are sent to the backend
    const validFlashcard = {
      title: newFlashcard.title,
      back: newFlashcard.back,
      type: newFlashcard.type,
    };

    axios
      .post(
        "http://localhost:8000/api/note/",
        validFlashcard,
        {
          headers: {
            Authorization: `Bearer ${token}`, // Include the token in the Authorization header
          },
        }
      )
      .then(() => {
        setNewFlashcard({ title: "", back: "", type: "" }); // Reset fields
        fetchFlashcards(); // Refresh the list
      })
      .catch((err) => console.error(err));
  };

  return (
    <div className="container mt-4">
      <h1 className="text-center">Flashcards</h1>

      {/* Button to navigate back to Home */}
      <button
        className="btn btn-secondary mb-4"
        onClick={() => navigate("/")}
      >
        Back to Home
      </button>

      {/* Buttons to change the view */}
      <div className="d-flex justify-content-center mb-4">
        <button
          className="btn btn-primary mx-2"
          onClick={() => setView("title")}
        >
          View Title
        </button>
        <button
          className="btn btn-secondary mx-2"
          onClick={() => setView("back")}
        >
          View Back
        </button>
        <button
          className="btn btn-success mx-2"
          onClick={() => setView("title+back")}
        >
          View Title + Back
        </button>
      </div>

      {/* Table to display flashcards */}
      {flashcards.length > 0 ? (
        <table className="table table-bordered">
          <thead>
            <tr>
              {view.includes("title") && <th>Title</th>}
              {view.includes("back") && <th>Back</th>}
            </tr>
          </thead>
          <tbody>
            {flashcards.map((flashcard, index) => (
              <tr key={index}>
                {view.includes("title") && <td>{flashcard.title}</td>}
                {view.includes("back") && <td>{flashcard.back}</td>}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No flashcards available. Create one to get started!</p>
      )}

      {/* Form to create a new flashcard */}
      <div className="mt-4">
        <h3>Create a New Flashcard</h3>
        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            className="form-control"
            name="title"
            value={newFlashcard.title}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Back</label>
          <input
            type="text"
            className="form-control"
            name="back"
            value={newFlashcard.back}
            onChange={handleInputChange}
          />
        </div>
        <div className="form-group">
          <label>Type</label>
          <input
            type="text"
            className="form-control"
            name="type"
            value={newFlashcard.type}
            onChange={handleInputChange}
          />
        </div>
        <button
          className="btn btn-primary mt-3"
          onClick={handleCreateFlashcard}
        >
          Create Flashcard
        </button>
      </div>
    </div>
  );
}

export default Flashcards;