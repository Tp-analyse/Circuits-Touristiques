import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { useState, useEffect, useRef } from "react";

import RootLayout from "./pages/RootLayout";
import Deconnexion from "./pages/Deconnexion";
import LoginForm from "./pages/LoginForm";
import FormulaireMonument from "./pages/FormulaireMonument";
import FormulaireCircuit from "./pages/FormulaireCircuit";
import FormulaireGuide from "./pages/FormulaireGuide";
import ModifierMonument from "./pages/ModifierMonument";
import ModifierCircuit from "./pages/ModifierCircuit";
import { AuthContext } from "./context/auth-context";
import Accueil from "./pages/Accueil";
import GestionEvaluations from "./pages/GestionEvaluations";

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

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { index: true, element: <Navigate to="/login" /> },
            { path: "login", element: <LoginForm /> },
            { path: "deconnexion", element: <Navigate to="/login" /> }
        ],
    },
]);

const routerLogin = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { index: true, element: <Navigate to="/accueil" /> },
            { path: "login", element: <Navigate to="/accueil" /> },
            { path: "accueil", element: <Accueil /> },
            { path: "monuments/actuel", element: <Accueil /> },
            { path: "monuments/nouveau", element: <FormulaireMonument /> },
            { path: "monuments/:id/modifier", element: <ModifierMonument /> },
            { path: "circuits/nouveau", element: <FormulaireCircuit /> },
            { path: "circuits/:id/modifier", element: <ModifierCircuit /> },
            { path: "guides/nouveau", element: <FormulaireGuide /> },
            { path: "/evaluations", element: <GestionEvaluations /> },
            { path: "deconnexion", element: <Deconnexion /> }
        ],
    },
]);

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => {
        const token = window.localStorage.getItem("token");
        if (!estTokenValide(token)) {
            window.localStorage.removeItem("token");
            return false;
        }
        return true;
    });
    const logoutTimerRef = useRef(null);

    const logoutHandler = () => {
        window.localStorage.removeItem("token");
        setIsLoggedIn(false);
    };

    const loginHandler = () => {
        setIsLoggedIn(true);
    };

    useEffect(() => {
        if (!isLoggedIn) return;
        const token = window.localStorage.getItem("token");
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
            value={{ isLoggedIn: isLoggedIn, login: loginHandler, logout: logoutHandler }}
        >
            <RouterProvider router={isLoggedIn ? routerLogin : router} />
        </AuthContext.Provider>
    );
    //test12
}