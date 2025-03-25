import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; 
import "../styles/Global.css"; 

function Home() {
  const navigate = useNavigate();
  const [hasPet, setHasPet] = useState(null);

  
  useEffect(() => {
    async function checkPet() {
      try {
        const res = await api.get("/pet/");
        if (res.data) {
          setHasPet(true);
        }
      } catch (error) {
        setHasPet(false);
      }
    }
    checkPet();
  }, []);

  return (
    <>
      {}
      <div className="floating-shapes">
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
      </div>

      {}
      <div className="container">
        <h1 className="studious-title">Welcome to Study Buddy</h1>
        <p className="studious-subtitle">
          A refined, fun way to stay motivated and take care of your virtual pet!
        </p>

        {}
        <div>
          <button
            className="btn-primary"
            onClick={() => navigate("/flashcards")}
          >
            Go to Flashcards
          </button>

          {hasPet === false && (
            <button
              className="btn-success"
              onClick={() => navigate("/select-pet")}
            >
              Select Your Pet
            </button>
          )}

          {hasPet === true && (
            <button
              className="btn-info"
              onClick={() => navigate("/pet")}
            >
              View Your Pet
            </button>
          )}
        </div>
      </div>
    </>
  );
}

export default Home;
