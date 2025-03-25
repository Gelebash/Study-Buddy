import { useState } from "react";
import api from "../api";
import { useNavigate } from "react-router-dom";
import { ACCESS_TOKEN, REFRESH_TOKEN } from "../constants";
import "../styles/Form.css";

function Form({ route, method }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [petType, setPetType] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const name = method === "login" ? "Login" : "Register";

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();
        try {
            const res = await api.post(route, {
                username,
                password,
                pet_type: petType
            });
            if (method === "login") {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                navigate("/");
            } else {
                navigate("/login");
            }
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <h1>{name}</h1>
            <input
                className="form-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
            />
            <input
                className="form-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
            />
            {method === "register" && (
                <select
                    className="form-input"
                    value={petType}
                    onChange={(e) => setPetType(e.target.value)}
                >
                    <option value="">-- Select Pet --</option>
                    <option value="cat">Cat</option>
                    <option value="fish">Fish</option>
                    <option value="turtle">Turtle</option>
                    <option value="dog">Dog</option>
                    <option value="bunny">Bunny</option>
                    <option value="hamster">Hamster</option>
                    <option value="reptile">Reptile</option>
                </select>
            )}
            <button className="form-button" type="submit">
                {name}
            </button>
            {method === "login" && (
                <button
                    className="form-button"
                    type="button"
                    onClick={() => navigate("/register")}
                >
                    Create Account
                </button>
            )}
            {method === "register" && (
                <button
                    className="form-button"
                    type="button"
                    onClick={() => navigate("/login")}
                >
                    Back to Login
                </button>
            )}
        </form>
    );
}

export default Form;
