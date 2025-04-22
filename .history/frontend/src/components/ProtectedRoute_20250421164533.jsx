import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../api";
import { REFRESH_TOKEN, ACCESS_TOKEN } from "../constants";
import { useState, useEffect } from "react";

function ProtectedRoute({ children }) {
    const [isAuthorized, setIsAuthorized] = useState(null);

    useEffect(() => {
        let isMounted = true;
        const authCheck = async () => {
            const token = localStorage.getItem(ACCESS_TOKEN);
            if (!token) {
                if (isMounted) setIsAuthorized(false);
                return;
            }

            try {
                const decoded = jwtDecode(token);
                const tokenExpiration = decoded.exp;
                const now = Date.now() / 1000;

                if (tokenExpiration < now) {
                    await refreshToken(isMounted);
                } else {
                    if (isMounted) setIsAuthorized(true);
                }
            } catch (error) {
                console.error("ProtectedRoute authCheck: Error decoding token:", error);
                if (isMounted) setIsAuthorized(false);
            }
        };


        const refreshToken = async (mountedStatus) => {
            const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN);
            if (!refreshTokenValue) {
                if (mountedStatus) setIsAuthorized(false); return;
            }
            try {
                const res = await api.post("/api/token/refresh/", { refresh: refreshTokenValue });
                if (res.status === 200) {
                    localStorage.setItem(ACCESS_TOKEN, res.data.access);
                    if (mountedStatus) setIsAuthorized(true);
                } else {
                    if (mountedStatus) setIsAuthorized(false);
                }
            } catch (error) {
                console.error("ProtectedRoute refreshToken: API call failed:", error);
                if (mountedStatus) setIsAuthorized(false);
            }
        };

        authCheck().catch(() => {
            console.error("ProtectedRoute Effect: Uncaught error during auth check sequence.");
            if (isMounted) setIsAuthorized(false);
        });


        return () => { isMounted = false; };
    }, []);


    if (isAuthorized === null) {
        return <div>Checking access...</div>;
    }

    if (!isAuthorized) {
        return <Navigate to="/login" />;
    }

    return children;
}

export default ProtectedRoute;