import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { useState } from "react";

import RootLayout from "./pages/Roots";
import Deconnexion from "./pages/Deconnexion";
import LoginForm from "./pages/LoginForm";
import FormulaireMonument from "./pages/FormulaireMonument";
import FormulaireCircuit from "./pages/FormulaireCircuit";
import { AuthContext } from "./context/auth-context";
import Acceuil from "./pages/Acceuil";

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { index: true, element: <Navigate to="/login" /> },
            { path: 'login', element: <LoginForm /> },
            { path: 'deconnexion', element: <Navigate to="/login" /> },
        ]
    }
]);

const routerLogin = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { index: true, element: <Navigate to="/acceuil" /> },
            { path: 'login', element: <Navigate to="/acceuil" /> },
            { path: 'acceuil', element: <Acceuil /> },
            { path: 'monuments/actuel', element: <Acceuil /> },
            { path: 'monuments/nouveau', element: <FormulaireMonument /> },
            { path: 'circuits/nouveau', element: <FormulaireCircuit /> },
            { path: 'deconnexion', element: <Deconnexion /> },
        ]
    }
]);

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(() => !!window.localStorage.getItem("token"));

	const loginHandler = () => {
		setIsLoggedIn(true);
	}

	const logoutHandler = () => {
		setIsLoggedIn(false);
	}

	return (
		<AuthContext.Provider value={{ isLoggedIn: isLoggedIn, login: loginHandler, logout: logoutHandler }}>
			<RouterProvider router={isLoggedIn ? routerLogin : router} />
		</AuthContext.Provider>
	);
}
