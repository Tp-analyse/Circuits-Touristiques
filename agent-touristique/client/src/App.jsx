import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { useState } from "react";

import RootLayout from "./pages/Roots";
import Deconnexion from "./pages/Deconnexion";
import LoginForm from "./pages/LoginForm";
import FormulaireMonument from "./pages/FormulaireMonument";
import { AuthContext } from "./context/auth-context";

const router = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { path: '/', element: <Navigate to="/login" /> },
            { path: '/login', element: <LoginForm /> },
            { path: '/deconnexion', element: <Navigate to="/login" /> },
        ]
    }
]);

const routerLogin = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { path: '/', element: <Navigate to="/" /> },
            { path: '/login', element: <Navigate to="/" /> },
            { path: '/monuments/nouveau', element: <FormulaireMonument /> },
            { path: '/deconnexion', element: <Deconnexion /> },
        ]
    }
]);

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

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