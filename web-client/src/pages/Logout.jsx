import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";

export default function Logout() {
    const auth = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(function () {
        auth.logout();
        navigate("/login");
    }, [auth, navigate]);

    return null;
}