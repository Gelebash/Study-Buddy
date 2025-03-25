import React from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();

  return (
    <div className="home-container">
      <h1 className="studious-title">Welcome to Study Buddy</h1>
      <p className="studious-subtitle">
        A refined, fun way to stay motivated and take care of your virtual pet!
      </p>
      <div className="button-container">
        <button className="btn-primary" onClick={() => navigate("/flashcards")}>
          Go to Flashcards
        </button>
        <button className="btn-success" onClick={() => navigate("/select-pet")}>
          Select Your Pet
        </button>
      </div>
    </div>
  );
}

export default Home;
