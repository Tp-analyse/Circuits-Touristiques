import { useContext, useEffect } from "react";

import { AuthContext } from "../context/auth-context";

export default function Deconnexion() {
    const auth = useContext(AuthContext);

    useEffect(() => {
        auth.logout();
    }, []);

    return null;
}