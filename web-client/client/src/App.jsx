import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import RootLayout from "./pages/rootLayout/RootLayout";
import LoginForm from "./pages/loginForm/LoginForm";
import HomePage from "./pages/homepage/HomePage";
import PayForm from "./pages/paiement/PayForm";
import Logout from "./pages/logout/Logout";
import { AuthContext } from "./context/auth-context";
import InscriptionClient from "./pages/inscription/InscriptionClient";
import EvaluationForm from "./pages/evaluation/EvaluationForm";

function getExpirationToken(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return typeof payload.exp === 'number' ? payload.exp * 1000 : null;
    } catch {
        return null;
    }
}

function estTokenValide(token) {
    if (!token) return false;
    const expiry = getExpirationToken(token);
    return expiry === null || Date.now() < expiry;
}

const routerNotLoggedIn = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { path: "/", element: <Navigate to="/login" /> },
            { path: "/login", element: <LoginForm /> },
            { path: "/accueil", element: <Navigate to="/login" /> },
            { path: "/inscriptionClient", element: <InscriptionClient /> },
            { path: "/deconnexion", element: <Navigate to="/login" /> }
        ]
    }
]);

const routerLoggedIn = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { path: "/", element: <Navigate to="/accueil" /> },
            { path: "/login", element: <Navigate to="/accueil" /> },
            { path: "/accueil", element: <HomePage /> },
            { path: "/pay", element: <PayForm />},
            { path: "/evaluation", element: <EvaluationForm /> },
            { path: "/deconnexion", element: <Logout /> }
        ]
    }
]);

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const token = localStorage.getItem("token");
        if (!estTokenValide(token)) {
            localStorage.removeItem("token");
            return false;
        }
        return true;
    });
    const logoutTimerRef = useRef(null);

    const logoutHandler = () => {
        localStorage.removeItem("token");
        setIsLoggedIn(false);
    };

    const loginHandler = () => {
        setIsLoggedIn(true);
    };

    useEffect(() => {
        if (!isLoggedIn) return;
        const token = localStorage.getItem("token");
        const expiry = getExpirationToken(token);
        if (expiry === null) return;
        const delay = expiry - Date.now();
        if (delay <= 0) {
            logoutHandler();
            return;
        }
        logoutTimerRef.current = setTimeout(logoutHandler, delay);
        return () => clearTimeout(logoutTimerRef.current);
    }, [isLoggedIn]);

    return (
        <AuthContext.Provider
            value={{
                isLoggedIn: isLoggedIn,
                login: loginHandler,
                logout: logoutHandler
            }}
        >
            <RouterProvider router={isLoggedIn ? routerLoggedIn : routerNotLoggedIn} />
        </AuthContext.Provider>
    );
}