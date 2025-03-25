import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="container mt-4">
      <h1>Home</h1>
      <button
        className="btn btn-primary mt-3"
        onClick={() => navigate("/flashcards")}
      >
        Go to Flashcards
      </button>
    </div>
  );
}

export default Home;