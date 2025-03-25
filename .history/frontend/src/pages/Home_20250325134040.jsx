import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api"; 
import "../styles/Global.css"; 

function Home() {
  const navigate = useNavigate();
  const [hasPet, setHasPet] = useState(null);
  
  const [timeLeft, setTimeLeft] = useState("");

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




  
  
  useEffect(() => {
    fetchPet();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
}, []);

const fetchPet = async () => {
    try {
        const res = await api.get("/api/pet/");
        setPet(res.data);
    } catch (err) {
        console.error(err);
    }
};

const updateClock = () => {
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const diff = tomorrow - now;
    if (diff <= 0) {
        setTimeLeft("00h 00m 00s");
        return;
    }
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
};

const handleFeed = async () => {
    try {
        const res = await api.post("/api/pet/feed/");
        setPet(res.data);
    } catch (err) {
        console.error(err);
    }
};

const handleWater = async () => {
    try {
        const res = await api.post("/api/pet/water/");
        setPet(res.data);
    } catch (err) {
        console.error(err);
    }
};

const handleDailyDeduct = async () => {
    try {
        const res = await api.post("/api/pet/deduct/");
        setPet(res.data);
    } catch (err) {
        console.error(err);
    }
};

  return (
    <>
      <div className="floating-shapes">
        <div className="shape shape1"></div>
        <div className="shape shape2"></div>
        <div className="shape shape3"></div>
      </div>
      <div className="container">
        <h1 className="studious-title">Welcome to Study Buddy</h1>
        <p className="studious-subtitle">
          A refined, fun way to stay motivated and take care of your virtual pet!
        </p>
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




    return (
    );

}

export default Home;
