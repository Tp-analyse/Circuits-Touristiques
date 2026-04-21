import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import { useState } from "react";

import RootLayout from "./pages/rootLayout/RootLayout";
import LoginForm from "./pages/loginForm/LoginForm";
import HomePage from "./pages/homepage/HomePage";
import Logout from "./pages/logout/Logout";
import { AuthContext } from "./context/auth-context";

const routerNotLoggedIn = createBrowserRouter([
    {
        path: "/",
        element: <RootLayout />,
        children: [
            { path: "/", element: <Navigate to="/login" /> },
            { path: "/login", element: <LoginForm /> },
            { path: "/accueil", element: <Navigate to="/login" /> },
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
            { path: "/deconnexion", element: <Logout /> }
        ]
    }
]);

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    function loginHandler() {
        setIsLoggedIn(true);
    }

    function logoutHandler() {
        setIsLoggedIn(false);
    }

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